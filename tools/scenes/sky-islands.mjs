// A light theme drawn like a 16-bit console scene: grassy islands float in a bright sky above a sea
// of clouds. A cottage and a turning windmill sit on the big island, a waterfall spills off its edge
// into the clouds, small rocks bob, an airship drifts past with its propeller spinning, birds flap
// across, and clouds roll by. Original art on a 320 x 200 grid of 5-unit pixels.
// Every change lands on the shared 0.1 s tick.
import { H, W, rng, svgDoc } from './_lib.mjs'
import { COLS, FRAME_CSS, P, ROWS, bands, canvas, frames, hash, layer, mix, ramp } from './_bit16.mjs'

const GRASS = ['#b8f094', '#8edc6c', '#6cc456', '#52a84a']
const ROCK = ['#d2b8a2', '#b49682', '#94786a', '#765c54', '#5a4644']
const CLOUD = ['#ffffff', '#f3f8ff', '#e2ecfa', '#cbdaf2', '#b4c6e8']

export default function scene() {
  const rnd = rng(0x5c1a)
  const { px, V, finish } = canvas()
  const skyAt = ramp(['#5cb0ee', '#7cc2f4', '#a2d6fa', '#c8e8fc', '#e6f5ff'], 0, 170, 6)
  const sky = bands(0, ROWS, skyAt)

  // A puffy cloud: overlapping discs shaded from a bright top to a cool underside.
  const cloud = (g, cx, cy, w, h) => {
    const blobs = []
    for (let i = 0; i < Math.max(3, w / 5); i++) blobs.push([cx - w / 2 + (i + 0.5) * (w / Math.max(3, w / 5)), cy - h * 0.2 * hash(cx + i), h * (0.55 + 0.45 * hash(cy + i * 3))])
    for (let y = Math.round(cy - h * 1.4); y <= cy + h; y++) for (let x = Math.round(cx - w / 2 - h); x <= cx + w / 2 + h; x++) {
      let inside = false, top = 1e9
      for (const [bx, by, r] of blobs) { const d = (x - bx) ** 2 + ((y - by) * 1.3) ** 2; if (d <= r * r) { inside = true; top = Math.min(top, by - r / 1.3) } }
      if (!inside || y > cy + h * 0.55) continue
      const k = (y - top) / (h * 1.6)
      g.set(x, y, CLOUD[Math.min(4, Math.floor(k * 4.2))])
    }
  }
  // Far islands, pale in the haze.
  for (const [x0, w, y] of [[8, 34, 70], [196, 26, 96], [276, 40, 82]]) {
    for (let x = x0; x < x0 + w; x++) {
      const t = (x - x0) / w, d = Math.round(12 * Math.sin(Math.PI * t) ** 0.8) + 2, haze = skyAt(y)
      px.set(x, y - 1, mix('#a8d8a0', haze, 0.45)); px.set(x, y, mix('#8cc488', haze, 0.5))
      for (let j = 1; j <= d; j++) px.set(x, y + j, mix(t < 0.45 ? '#c4aea0' : '#a8908a', haze, 0.45 + j * 0.02))
    }
  }
  // Drifting clouds (two copies so the loop is seamless).
  const drift = layer()
  for (const [x, y, w, h] of [[30, 26, 46, 9], [120, 16, 30, 7], [190, 40, 54, 10], [282, 22, 34, 8], [80, 58, 26, 6]]) cloud(drift, x, y, w, h)

  // The big island: grass on top, dirt, then layered rock tapering down, lit on the left.
  const island = (x0, x1, top0, depth, seed) => {
    const mid = (x0 + x1) / 2, half = (x1 - x0) / 2
    for (let x = x0; x <= x1; x++) {
      const u = (x - mid) / half, top = top0 + Math.round(Math.abs(u) ** 3 * 4 + Math.sin(x * 0.5 + seed) * 0.6)
      const bottom = top0 + Math.round(depth * Math.pow(Math.max(0, 1 - u * u), 0.85) + 3 * hash(x + seed) + 4)
      for (let y = top; y <= bottom; y++) {
        const k = y - top, lit = u < -0.15, shade = u > 0.35
        let c
        if (k === 0) c = GRASS[0]; else if (k < 3) c = GRASS[1 + (shade ? 1 : 0)]; else if (k < 5) c = GRASS[3]
        else if (k < 8) c = shade ? '#7a5038' : '#96643e'
        else { const r = Math.min(4, Math.floor(((y - top0) / (depth + 6)) * 4.5)); c = ROCK[Math.min(4, r + (lit ? 0 : shade ? 1 : 0))]; if ((y + Math.floor(x / 3)) % 7 === 0) c = mix(c, '#000000', 0.12) }
        px.set(x, y, c)
      }
      if (hash(x * 1.7 + seed) > 0.86) for (let y = bottom; y < bottom + 4 + Math.floor(hash(x) * 8); y++) px.set(x, y, y % 3 ? '#4a9a48' : '#6cc456')
    }
  }
  island(36, 174, 96, 52, 1); island(226, 292, 62, 28, 4)
  // Trees: round canopies with highlights.
  const tree = (x, base, r) => { px.rect(x - 1, base - r, 2, r, '#7a5038'); for (const [dx, dy, rr] of [[0, -r - 3, r], [-r / 2, -r, r * 0.8], [r / 2, -r - 1, r * 0.8]]) { const cx = Math.round(x + dx), cy = Math.round(base + dy); for (let y = -rr; y <= rr; y++) for (let xx = -rr; xx <= rr; xx++) if (xx * xx + y * y <= rr * rr) px.set(cx + xx, cy + y, xx + y < -rr * 0.6 ? '#9ae074' : xx + y > rr * 0.6 ? '#3e8e44' : '#5cb450') } }
  tree(50, 97, 6); tree(160, 98, 5); tree(258, 63, 6); tree(244, 64, 4)
  // The cottage.
  const CX = 70
  V(CX, 84, 22, 13, '#f4ead8'); px.rect(CX + 16, 84, 6, 13, '#dccab0')
  px.poly([[CX - 3, 85], [CX + 25, 85], [CX + 11, 74]], '#d8584a'); px.poly([[CX + 11, 74], [CX + 25, 85], [CX + 14, 85]], '#b04038'); px.rect(CX - 3, 85, 28, 1, '#8a2e2a')
  px.rect(CX + 17, 72, 3, 7, '#9a8a80'); px.rect(CX + 17, 72, 3, 1, '#c2b2a6')
  px.rect(CX + 9, 89, 5, 8, '#8a5a3a'); px.set(CX + 12, 93, '#ffd86a')
  for (const x of [CX + 2, CX + 16]) { px.rect(x, 87, 4, 4, '#6ab0e8'); px.rect(x, 87, 4, 1, '#c8e8ff'); px.rect(x + 1, 87, 1, 4, '#f4ead8') }
  for (let i = 0; i < 9; i++) px.set(56 + i * 3 + (i % 2), 98 + (i % 2), ['#ff8ab0', '#ffe07a', '#ffffff'][i % 3])
  // The windmill and its turning sails.
  const MX = 128
  px.poly([[MX - 6, 97], [MX + 6, 97], [MX + 3, 70], [MX - 3, 70]], '#f4ead8'); px.poly([[MX + 1, 97], [MX + 6, 97], [MX + 3, 70], [MX + 1, 70]], '#dccab0')
  px.poly([[MX - 5, 71], [MX + 5, 71], [MX, 64]], '#4a6aa8'); px.rect(MX - 2, 90, 4, 7, '#7a5038'); px.rect(MX - 1, 79, 2, 3, '#6ab0e8')
  const sails = [0, 1, 2, 3].map((k) => {
    const g = layer(), a0 = (k * Math.PI) / 8
    for (let s = 0; s < 4; s++) { const a = a0 + (s * Math.PI) / 2; for (let r = 2; r < 16; r++) { const x = Math.round(MX + Math.cos(a) * r), y = Math.round(70 + Math.sin(a) * r); g.set(x, y, '#7a5038'); if (r > 4) { const ox = Math.round(-Math.sin(a) * 2), oy = Math.round(Math.cos(a) * 2); g.set(x + ox, y + oy, r % 3 ? '#fff8ec' : '#e2d6c2'); g.set(Math.round(x + ox / 2), Math.round(y + oy / 2), '#f4ead8') } } }
    g.set(MX, 70, '#3a2a24'); return g
  })
  // A waterfall off the right edge of the big island, falling into the clouds.
  const WX = 168
  const falls = [0, 1, 2].map((k) => { const g = layer(); for (let y = 99; y < 168; y++) for (let x = 0; x < 5; x++) g.set(WX + x + Math.floor((y - 99) / 30), y, (y + k * 3 + x * 2) % 7 < 2 ? '#ffffff' : x === 0 || x === 4 ? '#9ad2f2' : '#c4e6fa'); for (let i = 0; i < 6; i++) g.set(WX - 2 + ((i * 5 + k * 3) % 11), 166 - ((i * 3 + k) % 4), '#ffffff'); return g })
  const falls2 = [0, 1, 2].map((k) => { const g = layer(); for (let y = 66; y < 120; y++) for (let x = 0; x < 3; x++) g.set(226 + x, y, (y + k * 3 + x * 2) % 7 < 2 ? '#ffffff' : '#bde2f8'); return g })
  // Small rocks bobbing.
  const bob = [0, 1].map((k) => { const g = layer(); for (const [x, y, w] of [[196, 70, 7], [210, 112, 5], [24, 128, 6], [294, 116, 8]]) { const yy = y + (k + x) % 2; for (let i = 0; i < w; i++) { const d = Math.round(3 * Math.sin(Math.PI * (i + 0.5) / w)); g.set(x + i, yy, GRASS[1]); for (let j = 1; j <= d; j++) g.set(x + i, yy + j, ROCK[Math.min(4, j)]) } } return g })

  // The sea of clouds below.
  for (let x = -10; x < COLS + 10; x += 14) cloud(px, x + Math.round(hash(x) * 6), 176 + Math.round(hash(x + 5) * 6), 26, 10)
  V(0, 186, COLS, 14, CLOUD[1])
  for (let x = -6; x < COLS + 6; x += 18) cloud(px, x + 7, 190 + Math.round(hash(x + 9) * 4), 22, 8)

  // The airship and the birds.
  const ship = [0, 1].map((k) => {
    const g = layer(), x0 = 30, y0 = 40
    for (let y = -7; y <= 7; y++) { const hw = Math.round(20 * Math.sqrt(1 - (y / 7.6) ** 2)); for (let x = -hw; x <= hw; x++) g.set(x0 + x, y0 + y, y < -3 ? '#fff6e6' : y > 3 ? '#d6c6aa' : (x + 40) % 10 < 5 ? '#f4e8d2' : '#e86a5a') }
    for (const [dx, dy] of [[21, -4], [22, -5], [21, 4], [22, 5], [23, -6], [23, 6]]) g.set(x0 + dx, y0 + dy, '#b04038')
    g.rect(x0 - 8, y0 + 9, 16, 4, '#8a5a3a'); g.rect(x0 - 8, y0 + 9, 16, 1, '#b07a50'); for (let x = x0 - 6; x < x0 + 6; x += 3) g.rect(x, y0 + 10, 2, 2, '#ffe9a0')
    g.set(x0 - 6, y0 + 8, '#5a4644'); g.set(x0 + 6, y0 + 8, '#5a4644')
    g.rect(x0 + 9, y0 + 10, 1, 1, '#5a4644'); if (k) g.rect(x0 + 10, y0 + 8, 1, 5, '#8a8a9a'); else g.rect(x0 + 10, y0 + 10, 3, 1, '#8a8a9a')
    return g
  })
  const birds = [0, 1].map((k) => { const g = layer(); for (const [x, y] of [[10, 52], [18, 48], [24, 55]]) { if (k) { g.set(x - 2, y - 1, '#ffffff'); g.set(x - 1, y, '#ffffff'); g.set(x, y, '#e2ecfa'); g.set(x + 1, y, '#ffffff'); g.set(x + 2, y - 1, '#ffffff') } else { g.set(x - 2, y + 1, '#ffffff'); g.set(x - 1, y, '#ffffff'); g.set(x, y, '#e2ecfa'); g.set(x + 1, y, '#ffffff'); g.set(x + 2, y + 1, '#ffffff') } } return g })

  const driftSvg = drift.svg(P)
  return svgDoc({
    defs: `<radialGradient id="sun"><stop offset="0" stop-color="#fffbe8" stop-opacity=".9"/><stop offset=".3" stop-color="#fff6d0" stop-opacity=".4"/><stop offset="1" stop-color="#fff6d0" stop-opacity="0"/></radialGradient>`,
    css: FRAME_CSS + `@keyframes drift{0%{transform:translate(0,0)}100%{transform:translate(-1600px,0)}}@keyframes ship{0%{transform:translate(1700px,0)}100%{transform:translate(-300px,0)}}@keyframes fly{0%{transform:translate(-200px,0)}100%{transform:translate(1800px,0)}}`,
    body:
      sky + `<circle cx="1360" cy="90" r="320" fill="url(#sun)"/>` +
      `<g style="animation:drift 160s steps(160,end) infinite">${driftSvg}<g transform="translate(1600 0)">${driftSvg}</g></g>` +
      `<g style="animation:ship 100s steps(500,end) -40s infinite">${frames(ship, 0.2)}</g>` +
      finish() + frames(sails, 0.8) + frames(falls, 0.3) + frames(falls2, 0.3) + frames(bob, 2.4) +
      `<g style="animation:fly 25s steps(250,end) -9s infinite">${frames(birds, 0.4)}</g>`,
  })
}
