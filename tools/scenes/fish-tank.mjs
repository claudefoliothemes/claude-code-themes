// A retro pixel-art fish tank, like the old screensaver: goldfish, an angelfish, a school of neon
// tetras, a blue tang, and clownfish by their anemone swim back and forth; jellyfish pulse up through
// the water; a treasure chest creaks open and lets out bubbles; a diver's helmet and a little castle
// sit in colorful gravel; plants sway; a crab scuttles; light ripples down from the surface.
// Original art on a 200 x 125 grid of 8-unit pixels. Every change lands on the shared 0.1 s tick.
import { H, W, rng, svgDoc } from './_lib.mjs'
import { pixelGrid } from './_pixel.mjs'

const P = 8, COLS = W / P, ROWS = H / P
const WATER = ['#1c5a7a', '#14506e', '#0f4462', '#0b3854', '#092e46']
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('')

// Draw a fish facing right into a small grid, outline it, and return its cells relative to (0, 0).
function fish(kind, tailFrame) {
  const g = pixelGrid(40, 30), cx = 20, cy = 15
  const tail = (len, h, c) => { const s = tailFrame ? 1 : -1; g.poly([[cx - len[0], cy], [cx - len[0] - len[1], cy - h + s], [cx - len[0] - len[1], cy + h + s]], c) }
  const eye = (x) => { g.set(x, cy - 1, '#ffffff'); g.set(x + 1, cy - 1, '#101018') }
  if (kind === 'gold') {
    tail([4, 6], 4, '#ffd8a8'); g.ellipse(cx, cy, 4, 3, '#ffa43a'); g.rect(cx - 3, cy + 1, 7, 1, '#ffc46a'); g.poly([[cx - 2, cy - 3], [cx + 2, cy - 3], [cx - 3, cy - 6]], '#ffb85a'); eye(cx + 2)
  } else if (kind === 'angel') {
    g.poly([[cx - 1, cy - 4], [cx + 2, cy - 4], [cx - 5, cy - 11]], '#c8ccd8'); g.poly([[cx - 1, cy + 4], [cx + 2, cy + 4], [cx - 5, cy + 11]], '#c8ccd8')
    tail([4, 3], 3, '#d8dce8'); g.ellipse(cx, cy, 4, 5, '#e4e8f0'); for (const x of [cx - 2, cx + 1]) g.rect(x, cy - 5, 1, 11, '#2a2a38'); eye(cx + 2)
  } else if (kind === 'tetra') {
    tail([2, 2], 1, '#c8d8e8'); g.rect(cx - 2, cy - 1, 5, 1, '#3ad8ff'); g.rect(cx - 2, cy, 3, 1, '#ff4a5a'); g.rect(cx + 1, cy, 2, 1, '#e8e8f0'); g.set(cx + 3, cy - 1, '#101018')
  } else if (kind === 'clown') {
    tail([4, 3], 2, '#ff8a2a'); g.ellipse(cx, cy, 4, 2, '#ff8a2a'); for (const x of [cx - 2, cx + 2]) { g.rect(x, cy - 2, 1, 5, '#ffffff'); g.rect(x - 1, cy - 2, 1, 5, '#202028') } eye(cx + 3)
  } else if (kind === 'tang') {
    tail([5, 3], 3, '#ffd84a'); g.ellipse(cx, cy, 5, 3, '#3a6ae8'); g.rect(cx - 3, cy - 1, 6, 1, '#1a2a6a'); g.rect(cx - 1, cy - 2, 4, 1, '#1a2a6a'); g.rect(cx - 4, cy + 2, 7, 1, '#5a8af8'); eye(cx + 3)
  }
  const m = new Map(), dark = kind === 'tetra' ? null : '#0a1a28'
  for (let y = 0; y < 30; y++) for (let x = 0; x < 40; x++) { const c = g.get(x, y); if (c) m.set(`${x - cx},${y - cy}`, c) }
  if (dark) for (const k of [...m.keys()]) { const [x, y] = k.split(',').map(Number); for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!m.has(`${x + ox},${y + oy}`)) m.set(`${x + ox},${y + oy}`, dark) }
  return m
}
const blit = (g, m, x, y, flip = false) => { for (const [k, c] of m) { const [lx, ly] = k.split(',').map(Number); g.set(flip ? x - lx : x + lx, y + ly, c) } }

export default function scene() {
  const rnd = rng(0xf15a)
  const px = pixelGrid(COLS, ROWS)
  const layer = () => pixelGrid(COLS, ROWS)
  const frames = (grids, period) => grids.map((g, k) => `<g style="animation:f${grids.length} ${period}s steps(1,end) -${(((grids.length - k) % grids.length) * period / grids.length).toFixed(1)}s infinite">${g.svg(P)}</g>`).join('')

  // Water, the surface line, and dim plants against the back glass.
  px.gradient(0, 108, WATER)
  px.rect(0, 0, COLS, 2, '#3a86a8'); for (let x = 0; x < COLS; x += 6) px.rect(x, 2, 3, 1, '#2a7090')
  for (let i = 0; i < 18; i++) { const x = Math.floor(rnd() * COLS), h = 14 + Math.floor(rnd() * 24); for (let y = 0; y < h; y++) px.set(x + Math.round(Math.sin(y / 3 + i) * 1.2), 106 - y, mix('#1f6a5a', WATER[4], 0.45)) }
  // Colorful gravel.
  const GRAVEL = ['#e86a8a', '#5aa0e8', '#e8d05a', '#f4f0e8', '#8a6ad8', '#5ad8a0']
  const gtop = (x) => 104 + Math.round(Math.sin(x / 11) * 1.5 + Math.sin(x / 4) * 0.6)
  for (let x = 0; x < COLS; x++) px.rect(x, gtop(x), 1, ROWS - gtop(x), mix('#6a5a4a', '#0a2030', 0.35))
  for (let y = 102; y < ROWS; y += 2) for (let x = (y % 4) - 1; x < COLS; x += 2 + Math.floor(rnd() * 3)) if (rnd() < 0.62) { const c = mix(GRAVEL[Math.floor(rnd() * 6)], '#0a2030', 0.35 + (y - 104) * 0.012); for (let dx = 0; dx < 2; dx++) if (y >= gtop(x + dx)) px.set(x + dx, y, c); if (y + 1 >= gtop(x)) px.set(x, y + 1, c) }
  // A little castle.
  const stone = '#8a8ea0', stoneD = '#6a6e80', stoneL = '#aab0c2'
  px.rect(26, 82, 30, 24, stone); px.rect(22, 72, 10, 34, stone); px.rect(50, 72, 10, 34, stone); px.rect(34, 64, 14, 18, stone)
  for (const [x, y, w] of [[22, 70, 10], [50, 70, 10], [34, 62, 14], [26, 80, 30]]) for (let i = 0; i < w; i += 2) px.rect(x + i, y, 1, 2, stone)
  for (let y = 74; y < 106; y += 3) for (let x = 22 + (y % 2) * 2; x < 60; x += 4) if (px.get(x, y) === stone) px.set(x, y, stoneD)
  for (const x of [22, 34, 50]) px.rect(x, 64, 1, 42, stoneL)
  px.rect(37, 94, 8, 12, '#1a2230'); px.rect(38, 92, 6, 2, '#1a2230'); px.rect(25, 78, 3, 4, '#1a2230'); px.rect(54, 78, 3, 4, '#1a2230'); px.rect(39, 68, 4, 5, '#1a2230')
  px.rect(41, 52, 1, 10, '#c8c8d0')
  const flag = [0, 1].map((k) => { const g = layer(); g.rect(42, 52, 5, 3, '#e84a5a'); g.set(47, 52 + k, '#e84a5a'); g.set(46, 55 - k, '#e84a5a'); return g })
  // Rock with an anemone, plants, a diver's helmet.
  px.ellipse(104, 103, 10, 5, '#4a5a6a'); px.ellipse(102, 101, 7, 3, '#5a6a7a')
  const anem = [0, 1].map((k) => { const g = layer(); for (let i = 0; i < 9; i++) { const x = 98 + i * 1.5; g.rect(Math.round(x + (i % 2 ? k : -k) * 0.6), 92 + (i % 3), 1, 7 - (i % 3), i % 2 ? '#ff7ab8' : '#ffa0d0') } return g })
  const sway = [0, 1, 2].map((k) => { const g = layer(); const strand = (x0, h, c, ph) => { for (let y = 0; y < h; y++) g.set(x0 + Math.round(Math.sin(y / 5 + ph + k * 0.9) * 2 * (y / h)), 106 - y, c) }; for (const [x, h, ph] of [[5, 62, 0], [8, 54, 1], [11, 66, 2], [14, 48, 3], [188, 58, 1], [191, 68, 2], [194, 52, 0], [197, 60, 3]]) { strand(x, h, '#3aa85a', ph); strand(x + 1, h - 4, '#2a8a4a', ph) } return g })
  px.ellipse(78, 100, 7, 6, '#a83a3a'); for (const [x, y] of [[74, 94], [77, 92], [80, 93], [83, 96], [72, 98], [79, 96]]) px.disc(x, y, 2, '#d85a4a')
  px.disc(175, 99, 7, '#c8963a'); px.disc(175, 99, 4, '#1a3a4a'); px.disc(174, 98, 2, '#3a6a7a'); px.rect(168, 104, 15, 3, '#a8782a'); for (const a of [0, 1.57, 3.14, 4.71]) px.set(175 + Math.round(Math.cos(a) * 5.5), 99 + Math.round(Math.sin(a) * 5.5), '#ffd27a')
  // Treasure chest that opens, glints, and lets out bubbles.
  const CX = 134, CB = 106
  px.rect(CX, CB - 7, 16, 7, '#7a4a2a'); px.rect(CX, CB - 7, 16, 1, '#9a6a3a'); for (const x of [CX + 3, CX + 12]) px.rect(x, CB - 7, 1, 7, '#e8c05a'); px.rect(CX + 7, CB - 5, 2, 2, '#e8c05a')
  const chest = [0, 1, 2, 3].map((k) => {
    const g = layer()
    if (k === 0) { g.rect(CX, CB - 10, 16, 3, '#8a5a32'); g.rect(CX + 1, CB - 11, 14, 1, '#8a5a32'); for (const x of [CX + 3, CX + 12]) g.rect(x, CB - 11, 1, 4, '#e8c05a') }
    else { const up = k === 1 ? 4 : 6; g.rect(CX, CB - 7 - up, 16, 2, '#8a5a32'); g.rect(CX + 1, CB - 7 - up - 1, 14, 1, '#8a5a32'); g.rect(CX + 1, CB - 8, 14, 1, '#ffd84a'); g.set(CX + 4, CB - 9, '#fff2b0'); g.set(CX + 10, CB - 9, '#ffd84a'); if (k >= 2) for (let i = 0; i < 5; i++) { g.set(CX + 5 + (i % 3) * 2, CB - 14 - i * 4 - (k - 2) * 6, '#bfe8ff'); g.set(CX + 6 + (i % 3) * 2, CB - 15 - i * 4 - (k - 2) * 6, '#e8f8ff') } }
    return g
  })
  // Bubbles rising from the helmet.
  const bub = [0, 1, 2, 3].map((k) => { const g = layer(); for (let i = 0; i < 8; i++) { const y = 90 - i * 11 - k * 3, x = 175 + Math.round(Math.sin(i + k) * 1.5); if (y > 4) { g.set(x, y, '#bfe8ff'); g.set(x + 1, y - 1, '#e8f8ff'); if (i % 2) g.set(x - 1, y, '#8ac8e8') } } return g })
  // A crab scuttling along the gravel.
  const crabL = [0, 1].map((k) => {
    const g = layer(), x = 6, y = 110
    g.ellipse(x + 4, y, 4, 2, '#e84a3a'); g.rect(x + 2, y - 3, 1, 2, '#e84a3a'); g.rect(x + 6, y - 3, 1, 2, '#e84a3a'); g.set(x + 2, y - 4, '#101018'); g.set(x + 6, y - 4, '#101018')
    g.rect(x - 2, y - 2, 2, 2, '#ff6a4a'); g.rect(x + 9, y - 2, 2, 2, '#ff6a4a')
    for (const lx of [x + 1, x + 3, x + 5, x + 7]) g.set(lx + (k ? 1 : -1) * (lx % 2 ? 1 : 0), y + 2, '#c83a2a')
    return g
  })

  // Swimming fish: each a group crossing the tank, its tail wagging.
  const swimmers = [
    ['gold', 28, 1, 26, -4], ['gold', 46, -1, 32, -20], ['angel', 38, 1, 40, -12], ['tang', 60, -1, 22, -6], ['clown', 86, 1, 30, -24], ['clown', 90, -1, 34, -9],
  ]
  let fishSvg = ''
  for (const [kind, y, dir, dur, delay] of swimmers) {
    const tails = [0, 1].map((f) => { const g = layer(); blit(g, fish(kind, f), 12, y, dir < 0); return g })
    const steps = Math.round(dur * 10)
    fishSvg += `<g style="animation:${dir > 0 ? 'swimR' : 'swimL'} ${dur}s steps(${steps},end) ${delay}s infinite">${frames(tails, 0.4)}</g>`
  }
  const school = [0, 1].map((f) => { const g = layer(); for (const [dx, dy] of [[0, 0], [5, -2], [9, 1], [4, 3], [13, -1], [8, -4], [16, 2]]) blit(g, fish('tetra', f), 14 + dx, 20 + dy, true); return g })
  fishSvg += `<g style="animation:swimL 20s steps(200,end) -14s infinite">${frames(school, 0.2)}</g>`
  // Jellyfish pulsing up through the water.
  const jelly = (g, x, y, k, c) => {
    const w = k ? 4 : 5
    for (let r = 0; r < 4; r++) { const hw = r === 0 ? w - 2 : w - (r === 1 ? 1 : 0); g.rect(x - hw, y + r, 2 * hw + 1, 1, r === 0 ? mix(c, '#ffffff', 0.4) : c) }
    for (let i = -w + 1; i < w; i += 2) for (let j = 0; j < 7; j++) g.set(x + i + Math.round(Math.sin(j / 2 + i + k) * 0.7), y + 4 + j, mix(c, WATER[2], 0.35 + j * 0.06))
  }
  const jellies = [[150, '#ff9ad8', 30, -8], [64, '#c8a6ff', 36, -24]].map(([x, c, dur, delay]) => {
    const pulse = [0, 1].map((k) => { const g = layer(); jelly(g, x, 100, k, mix(c, WATER[2], 0.25)); return g })
    return `<g style="animation:rise ${dur}s steps(${dur * 10},end) ${delay}s infinite">${frames(pulse, 1.2)}</g>`
  }).join('')

  return svgDoc({
    defs: `<linearGradient id="ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe8ff" stop-opacity=".16"/><stop offset="1" stop-color="#bfe8ff" stop-opacity="0"/></linearGradient>`,
    css:
      `@keyframes f2{0%{opacity:1}50%{opacity:0}}@keyframes f3{0%{opacity:1}33.333%{opacity:0}}@keyframes f4{0%{opacity:1}25%{opacity:0}}` +
      `@keyframes swimR{0%{transform:translate(-240px,0)}100%{transform:translate(1760px,0)}}@keyframes swimL{0%{transform:translate(1760px,0)}100%{transform:translate(-240px,0)}}` +
      `@keyframes rise{0%{transform:translate(0,80px)}100%{transform:translate(0,-1000px)}}@keyframes crab{0%{transform:translate(0,0)}50%{transform:translate(480px,0)}}` +
      `@keyframes shimmer{0%{opacity:1}50%{opacity:.6}}`,
    body:
      px.svg(P) +
      `<g style="animation:shimmer 2.4s steps(1,end) infinite"><path d="M160 0L300 0L620 860L520 860ZM700 0L790 0L1000 700L930 700ZM1180 0L1300 0L1520 820L1420 820Z" fill="url(#ray)"/></g>` +
      frames(sway, 1.8) + frames(flag, 0.8) + frames(anem, 1.2) + jellies + fishSvg + frames(chest, 4.8) + frames(bub, 0.8) +
      `<g style="animation:crab 12s steps(60,end) infinite">${frames(crabL, 0.4)}</g>`,
  })
}
