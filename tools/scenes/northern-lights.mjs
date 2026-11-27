// Northern lights in pixel art: a great ribbon of green aurora sweeps down the sky in an S-curve,
// bright mint at its core, with curtains of teal rays hanging below it and violet rays rising above,
// swaying slowly while light pulses along the band and rays flicker. Stars twinkle over snowy
// mountains, and a frozen lake catches the glow.
// Colors from nordtheme (MIT) for the land, sky, and app, with a brighter aurora. Original art on a
// 200 x 125 grid of 8-unit pixels; see-through glow is pre-blended against the sky, row by row.
// Every change lands on the shared 0.1 s tick.
import { H, W, rng, svgDoc } from './_lib.mjs'
import { pixelGrid } from './_pixel.mjs'

const P = 8, COLS = W / P, ROWS = H / P
const SKY = ['#131726', '#181d31', '#1d243d', '#222c4a', '#283559', '#2e3f69', '#35497a', '#3c548a']
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('')
const LEVELS = [0.18, 0.32, 0.5, 0.7, 0.9]
const q = (a) => { let best = -1; for (let i = 0; i < LEVELS.length; i++) if (a >= LEVELS[i] - 0.07) best = i; return best < 0 ? 0 : LEVELS[best] }

export default function scene() {
  const rnd = rng(0xa0a7)
  const sky = pixelGrid(COLS, ROWS), front = pixelGrid(COLS, ROWS)
  const layer = () => pixelGrid(COLS, ROWS)
  const frames = (grids, period) => grids.map((g, k) => `<g style="animation:f${grids.length} ${period}s steps(1,end) -${(((grids.length - k) % grids.length) * period / grids.length).toFixed(1)}s infinite">${g.svg(P)}</g>`).join('')
  const HZ = 104
  const STEPS = 26, SKYS = Array.from({ length: STEPS }, (_, i) => { const t = (i / (STEPS - 1)) * (SKY.length - 1), k = Math.min(SKY.length - 2, Math.floor(t)); return mix(SKY[k], SKY[k + 1], t - k) })
  const skyAt = (y) => SKYS[Math.min(STEPS - 1, Math.floor((Math.max(0, y) / HZ) * STEPS))]
  for (let y = 0; y < ROWS; y++) sky.rect(0, y, COLS, 1, skyAt(y))
  const twinkle = [0, 1].map(() => layer())
  for (let i = 0; i < 90; i++) { const x = Math.floor(rnd() * COLS), y = Math.floor(rnd() * 84); sky.set(x, y, mix(skyAt(y), '#eceff4', 0.6)); if (i % 5 === 0) twinkle[i % 2].set(x, y, '#ffffff') }

  // The ribbon's centerline: a cubic curve from the top right, bending left, then right, then down.
  const B = [[236, -14], [-120, 14], [320, 60], [70, 100]]
  const at = (s) => { const u = 1 - s; return [0, 1].map((k) => u * u * u * B[0][k] + 3 * u * u * s * B[1][k] + 3 * u * s * s * B[2][k] + s * s * s * B[3][k]) }
  const pts = []
  for (let s = 0; s <= 1; s += 0.0015) { const [x, y] = at(s); pts.push([x, y, s]) }
  const hash = (n) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v) }
  // For each column, where the ribbon crosses it.
  const cross = Array.from({ length: COLS + 40 }, () => [])
  for (const [x, y, s] of pts) { const c = Math.round(x) + 20; if (c >= 0 && c < cross.length && !cross[c].some(([yy]) => Math.abs(yy - y) < 3)) cross[c].push([y, s]) }
  const width = (s) => 2.5 + 6 * Math.pow(Math.sin(Math.PI * Math.min(1, s * 1.05)), 0.6)
  const GREEN = '#86e8a8', MINT = '#dcffe9', TEAL = '#6fd0c4', VIOLET = '#a47ad0'
  const aurora = layer(), pulse = [0, 1, 2, 3].map(() => layer()), flick = [0, 1, 2].map(() => layer())
  for (let y = -2; y < HZ; y++) for (let x = -16; x < COLS + 16; x++) {
    // Distance to the ribbon.
    let d = 1e9, sNear = 0
    for (let i = 0; i < pts.length; i += 2) { const dx = pts[i][0] - x, dy = pts[i][1] - y; const dd = dx * dx + dy * dy; if (dd < d) { d = dd; sNear = pts[i][2] } }
    d = Math.sqrt(d)
    const w = width(sNear)
    let a = 0, c = GREEN
    if (d < w) { const k = d / w; a = k < 0.22 ? 0.95 : k < 0.5 ? 0.78 : 0.55; c = k < 0.22 ? MINT : GREEN }
    // Curtain rays in two-cell columns: teal hanging below the ribbon, violet rising above it.
    const col = Math.floor((x + 40) / 2), Ldown = 8 + 24 * hash(col), Lup = 16 + 40 * hash(col + 77)
    for (const [yr, s] of cross[Math.round(x) + 20] || []) {
      const fadeEdge = Math.min(1, s * 4, (1 - s) * 6)
      if (y > yr + 1 && y - yr < Ldown) { const t = 1 - (y - yr) / Ldown, v = 0.62 * t * fadeEdge; if (v > a) { a = v; c = t > 0.55 ? GREEN : TEAL } }
      if (y < yr - 1 && yr - y < Lup) { const t = 1 - (yr - y) / Lup, v = 0.58 * t * fadeEdge; if (v > a) { a = v; c = VIOLET } }
    }
    const qa = a < 0.12 ? 0 : q(a)
    if (!qa) continue
    aurora.set(x + 16, y, mix(skyAt(y), c, qa))
    // Light pulsing along the core, and flickering rays.
    if (d < w * 0.5) pulse[Math.floor(sNear * 12) % 4].set(x + 16, y, mix(skyAt(y), MINT, 0.97))
    if (d >= w && qa >= 0.32 && hash(col * 3.1) < 0.4) flick[Math.floor(hash(col + 9) * 3)].set(x + 16, y, mix(skyAt(y), c, Math.min(0.9, qa + 0.22)))
  }

  // Snowy mountains: jagged peaks, lit on the left faces, snow on the upper slopes.
  const range = (peaks, base, dark, lit, snowD, snowL, snowFrac) => {
    for (let i = 0; i < peaks.length - 1; i++) {
      const [x0, y0] = peaks[i], [x1, y1] = peaks[i + 1]
      for (let x = x0; x < x1; x++) {
        const t = (x - x0) / (x1 - x0), top = Math.round(y0 + (y1 - y0) * t), rising = y1 < y0
        const peakY = Math.min(y0, y1), snowLine = peakY + (base - peakY) * snowFrac + ((x * 7) % 5) - 2
        for (let y = top; y < base; y++) front.set(x, y, y < snowLine ? (rising ? snowD : snowL) : rising ? dark : lit)
      }
    }
  }
  range([[-4, 98], [10, 86], [22, 94], [36, 78], [50, 92], [62, 84], [76, 96], [90, 82], [104, 94], [118, 80], [132, 92], [146, 76], [160, 90], [172, 82], [186, 94], [204, 84]], 112, '#3f4877', '#55619a', '#a3aed8', '#dde4f8', 0.32)
  range([[-4, 104], [12, 92], [28, 106], [44, 98], [60, 116], [140, 116], [154, 96], [168, 104], [184, 90], [204, 100]], 116, '#2f365c', '#444e80', '#b4bee6', '#e8eeff', 0.3)
  // A frozen lake and the dark shore, with the aurora's glow in the ice.
  front.rect(0, 112, COLS, ROWS - 112, '#1a1f34')
  for (let x = 0; x < COLS; x++) { const y = 112 + Math.round(Math.sin(x / 13) * 1.2); front.rect(x, y, 1, 3, '#24304e') }
  for (let y = 114; y < 121; y++) for (let x = 40 + (y % 2); x < 164; x += 2) front.set(x, y, '#222c4a')
  const ice = [0, 1].map((k) => { const g = layer(); for (let i = 0; i < 26; i++) { const x = 70 + ((i * 37 + k * 11) % 80), y = 114 + ((i * 7 + k * 3) % 7), w = 2 + (i % 3) * 2; g.rect(x, y, w, 1, mix('#222c4a', i % 3 ? GREEN : TEAL, 0.35 + (i % 2) * 0.15)) } return g })
  for (const [x, h] of [[8, 9], [13, 12], [18, 8], [176, 10], [182, 14], [188, 9], [194, 12]]) for (let i = 0; i < h; i++) { const w = Math.floor(i * 0.4); front.rect(x - w, 112 - h + i, w * 2 + 1, 1, '#141828') }

  return svgDoc({
    css:
      `@keyframes f2{0%{opacity:1}50%{opacity:0}}@keyframes f3{0%{opacity:1}33.333%{opacity:0}}@keyframes f4{0%{opacity:1}25%{opacity:0}}` +
      `@keyframes sway{0%{transform:translate(-128px,0)}50%{transform:translate(-96px,0)}100%{transform:translate(-128px,0)}}`,
    body:
      sky.svg(P) + frames(twinkle, 2.4) +
      `<g style="animation:sway 16s steps(16,end) infinite">${aurora.svg(P)}${frames(flick, 1.2)}${frames(pulse, 1.6)}</g>` +
      front.svg(P) + frames(ice, 1.6),
  })
}
