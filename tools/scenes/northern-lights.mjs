// Northern lights drawn like a 16-bit console scene: a great ribbon of green aurora sweeps down a
// banded night sky in an S-curve, mint-bright at its core, with translucent curtains of teal rays
// hanging below it and violet rays rising above. It sways, light pulses along it, and the curtains
// flicker. Stars sparkle over two ranges of snowy mountains with lit and shadowed faces, a snowy
// pine forest, and a frozen lake that mirrors the glow.
// Colors from nordtheme (MIT) for the land, sky, and app, with a brighter aurora. Original art on a
// 320 x 200 grid of 5-unit pixels. Every change lands on the shared 0.1 s tick.
import { H, W, rng, svgDoc } from './_lib.mjs'
import { pixelGrid } from './_pixel.mjs'

const P = 5, COLS = W / P, ROWS = H / P
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('')
const SKY = ['#070a16', '#0b1022', '#111a34', '#172447', '#1e3058', '#263d6a', '#2f4c7a', '#3a5c88']
const HZ = 156, LAKE = 177
const bandAt = (y) => { const t = (Math.min(Math.max(y, 0), HZ) / HZ) * (SKY.length - 1), k = Math.min(SKY.length - 2, Math.floor(t)); return mix(SKY[k], SKY[k + 1], Math.round((t - k) * 6) / 6) }
const hash = (n) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v) }

export default function scene() {
  const rnd = rng(0xa0a8)
  const stars = pixelGrid(COLS, ROWS), rib = pixelGrid(COLS, ROWS), land = pixelGrid(COLS, ROWS)
  const layer = () => pixelGrid(COLS, ROWS)
  const frames = (grids, period) => grids.map((g, k) => `<g style="animation:f${grids.length} ${period}s steps(1,end) -${(((grids.length - k) % grids.length) * period / grids.length).toFixed(1)}s infinite">${g.svg(P)}</g>`).join('')

  // Sky bands, and stars in three brightnesses, some that sparkle.
  let sky = ''
  for (let y = 0; y < LAKE; y += 2) sky += `<rect y="${y * P}" width="${W}" height="${2 * P + 1}" fill="${bandAt(y)}"/>`
  const twinkle = [0, 1].map(() => layer())
  for (let i = 0; i < 150; i++) {
    const x = Math.floor(rnd() * COLS), y = Math.floor(rnd() * 130), b = bandAt(y)
    stars.set(x, y, mix(b, '#eceff4', [0.3, 0.55, 0.85][i % 3]))
    if (i % 9 === 0) { const g = twinkle[i % 2], s = mix(b, '#ffffff', 0.45); g.set(x, y, '#ffffff'); for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) g.set(x + dx, y + dy, s) }
  }

  // The aurora ribbon: an S-curve, colors blended into each sky band at a few alpha levels.
  const B = [[380, -24], [-190, 24], [510, 96], [112, 160]]
  const at = (s) => { const u = 1 - s; return [0, 1].map((k) => u * u * u * B[0][k] + 3 * u * u * s * B[1][k] + 3 * u * s * s * B[2][k] + s * s * s * B[3][k]) }
  const pts = []
  for (let s = 0; s <= 1; s += 0.001) { const [x, y] = at(s); pts.push([x, y, s]) }
  const width = (s) => 4 + 10 * Math.pow(Math.sin(Math.PI * Math.min(1, s * 1.04)), 0.6)
  const pulse = [0, 1, 2, 3].map(() => layer())
  const RAMP = [[0.2, '#3fb8a0', 0.45], [0.45, '#5ed69c', 0.66], [0.7, '#8ef0b8', 0.82], [0.86, '#c6ffd8', 0.92], [1.01, '#effff4', 0.98]]
  for (let y = 0; y < HZ; y++) for (let x = 0; x < COLS; x++) {
    let d = 1e9, sNear = 0
    for (let i = 0; i < pts.length; i += 3) { const dx = pts[i][0] - x, dy = pts[i][1] - y; const dd = dx * dx + dy * dy; if (dd < d) { d = dd; sNear = pts[i][2] } }
    d = Math.sqrt(d); const w = width(sNear); if (d >= w) continue
    const k = 1 - d / w, fade = Math.min(1, sNear * 5, (1 - sNear) * 8)
    const [, c, a] = RAMP.find(([lim]) => k * Math.max(0.55, fade) < lim) || RAMP[RAMP.length - 1]
    rib.set(x, y, mix(bandAt(y), c, a * Math.max(0.5, fade)))
    if (k > 0.7) pulse[Math.floor(sNear * 16) % 4].set(x, y, mix(bandAt(y), '#f4fff8', 0.97))
  }
  // Curtain rays as translucent strips: teal hanging below the ribbon, violet rising above it.
  const cross = new Map()
  for (const [x, y, s] of pts) { const c = Math.round(x / 2); if (c < 0 || c >= COLS / 2 || y < 0 || y > HZ) continue; const list = cross.get(c) || []; if (!list.some(([yy]) => Math.abs(yy - y) < 6)) { list.push([y, s]); cross.set(c, list) } }
  const rayG = ['', '', '']
  for (const [c, list] of cross) for (const [yr, s] of list) {
    const fade = Math.min(1, s * 4, (1 - s) * 6), g = Math.floor(hash(c + 3) * 3)
    const Ld = 10 + 42 * hash(c), Lu = 20 + 70 * hash(c + 77), w = width(s)
    if (fade > 0.15) rayG[g] += `<rect x="${c * 2 * P}" y="${Math.round((yr + w * 0.3) * P)}" width="${2 * P}" height="${Math.round(Ld * P)}" fill="url(#down)" opacity="${(fade * (0.55 + 0.45 * hash(c + 9))).toFixed(2)}"/>` +
      `<rect x="${c * 2 * P}" y="${Math.round((yr - w * 0.3 - Lu) * P)}" width="${2 * P}" height="${Math.round(Lu * P)}" fill="url(#up)" opacity="${(fade * (0.45 + 0.55 * hash(c + 21))).toFixed(2)}"/>`
  }
  const rays = rayG.map((r, i) => `<g style="animation:flk 2.4s steps(1,end) -${(i * 0.8).toFixed(1)}s infinite">${r}</g>`).join('')

  // Mountains: a far range and a nearer lit range, each with a six-tone ramp and snow.
  const range = (peaks, base, tones, snowFrac, rim) => {
    for (let i = 0; i < peaks.length - 1; i++) {
      const [x0, y0] = peaks[i], [x1, y1] = peaks[i + 1]
      for (let x = Math.max(0, x0); x < Math.min(COLS, x1); x++) {
        const t = (x - x0) / (x1 - x0), top = Math.round(y0 + (y1 - y0) * t), lit = y1 < y0
        const peakY = Math.min(y0, y1), snowLine = peakY + (base - peakY) * snowFrac + [0, 2, 4, 1, 3, 5, 2][(x * 3) % 7] - 2
        for (let y = top; y < base; y++) {
          const depth = (y - top) / Math.max(1, base - top)
          let c = y < snowLine ? (lit ? (y - top < 2 ? tones[5] : tones[4]) : y - top < 2 ? tones[3] : tones[2]) : lit ? (depth < 0.5 ? tones[1] : mix(tones[1], tones[0], 0.5)) : tones[0]
          if (rim && lit && y === top) c = rim
          land.set(x, y, c)
        }
      }
    }
  }
  range([[-6, 150], [14, 128], [34, 142], [52, 118], [74, 136], [96, 112], [118, 134], [140, 120], [164, 140], [186, 116], [210, 132], [232, 110], [256, 134], [278, 118], [300, 138], [326, 124]], 168,
    ['#28325a', '#34416e', '#8a98c8', '#9eaad6', '#c4cdee', '#dfe5fb'], 0.32, null)
  range([[-6, 160], [20, 136], [44, 158], [70, 140], [96, 166], [210, 166], [236, 138], [262, 154], [288, 128], [326, 150]], 176,
    ['#1d2546', '#2c3762', '#98a6d6', '#b0bce6', '#e2e8ff', '#f6f8ff'], 0.3, null)
  land.rect(0, 166, COLS, 11, '#1a2240')
  // A snowy pine forest along the foot of the mountains.
  for (let x = -2; x < COLS + 2; x += 3 + Math.floor(rnd() * 3)) {
    const h = 8 + Math.floor(rnd() * 9), base = 178 + Math.floor(rnd() * 3)
    if (x > 112 && x < 210 && rnd() < 0.7) continue
    for (let i = 0; i < h; i++) { const w = Math.floor(i * 0.42), y = base - h + i; land.rect(x - w, y, w * 2 + 1, 1, i % 3 === 0 ? '#2a3456' : '#111729'); if (i % 3 === 0) land.set(x - w, y, '#8a98c8') }
  }
  // The frozen lake: ice bands, the ribbon mirrored in it, cracks, and glints.
  let ice = ''
  for (let y = LAKE; y < ROWS; y += 2) ice += `<rect y="${y * P}" width="${W}" height="${2 * P + 1}" fill="${mix('#18223e', '#0c1122', Math.round(((y - LAKE) / 23) * 5) / 5)}"/>`
  const lakeFx = pixelGrid(COLS, ROWS)
  for (let y = LAKE + 1; y < ROWS; y += 4) for (let x = (y * 7) % 11; x < COLS; x += 17) lakeFx.rect(x, y, 6, 1, '#223058')
  for (let x = 0; x < COLS; x++) lakeFx.set(x, LAKE, '#2a3a66')
  const glint = [0, 1].map((k) => { const g = layer(); for (let i = 0; i < 30; i++) { const x = 90 + ((i * 41 + k * 17) % 150), y = LAKE + 3 + ((i * 13 + k * 5) % 18); g.rect(x, y, 2 + (i % 3), 1, i % 2 ? '#5ed69c' : '#8ef0b8') } return g })

  const swayG = (inner) => `<g style="animation:sway 12s steps(6,end) infinite">${inner}</g>`
  return svgDoc({
    defs:
      `<linearGradient id="down" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ef0b8" stop-opacity=".8"/><stop offset=".35" stop-color="#5ed69c" stop-opacity=".45"/><stop offset=".75" stop-color="#3fb8b0" stop-opacity=".1"/><stop offset="1" stop-color="#3fb8b0" stop-opacity="0"/></linearGradient>` +
      `<linearGradient id="up" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#b892e8" stop-opacity=".66"/><stop offset=".4" stop-color="#9a78d0" stop-opacity=".34"/><stop offset="1" stop-color="#7a64b8" stop-opacity="0"/></linearGradient>` +
      `<g id="rib">${rib.svg(P)}</g>` +
      `<clipPath id="lake"><rect y="${LAKE * P}" width="${W}" height="${(ROWS - LAKE) * P}"/></clipPath>`,
    css:
      `@keyframes f2{0%{opacity:1}50%{opacity:0}}@keyframes f4{0%{opacity:1}25%{opacity:0}}` +
      `@keyframes flk{0%{opacity:1}33.333%{opacity:.5}66.666%{opacity:1}}` +
      `@keyframes sway{0%{transform:translate(0,0)}50%{transform:translate(30px,0)}100%{transform:translate(0,0)}}`,
    body:
      sky + stars.svg(P) + frames(twinkle, 2.4) +
      swayG(`${rays}<use href="#rib"/>${frames(pulse, 1.6)}`) +
      land.svg(P) + ice +
      `<g clip-path="url(#lake)" opacity=".3"><g transform="translate(0 ${LAKE * P * 1.5}) scale(1 -0.5)">${swayG('<use href="#rib"/>')}</g></g>` +
      lakeFx.svg(P) + frames(glint, 1.6),
  })
}
