// A pixel-art winter village at night: an aurora rippling over snowy peaks, a pine forest dusted
// with snow, cottages with glowing windows and smoking chimneys, a lit tree with a star and
// blinking lights, a lamp post, a snowman, and snow falling over it all. Drawn on a 200 x 125
// grid of 8-unit pixels.
import { H, W, rng, svgDoc } from './_lib.mjs'
import { pixelGrid } from './_pixel.mjs'

const P = 8, COLS = W / P, ROWS = H / P
const GROUND = 100 // snow line, in pixels

export default function scene() {
  const rnd = rng(0x5e10)
  const px = pixelGrid(COLS, ROWS)

  // Night sky, dithered toward a blue glow at the horizon.
  px.gradient(0, GROUND, ['#060a1a', '#0b1230', '#121d45', '#1b2b5a', '#28406f'])

  // Far snowy peaks.
  for (let x = 0; x < COLS; x++) {
    let h = 0
    for (const [cx, ph, pw] of [[24, 26, 30], [70, 34, 36], [118, 24, 28], [168, 32, 34]]) h = Math.max(h, ph - Math.abs(x - cx) * (ph / pw))
    h = Math.round(h)
    if (h <= 0) continue
    px.rect(x, GROUND - 16 - h, 1, h, '#22335a')
    px.rect(x, GROUND - 16 - h, 1, Math.max(1, Math.round(h * 0.28)), '#d7e3f5')
    if (x % 3 === 0) px.set(x, GROUND - 16 - h + Math.round(h * 0.28), '#9fb3d4')
  }

  // Pine forest along the snow line: dark trees with snow on each tier.
  const pine = (x, base, h) => {
    for (let row = 0; row < h; row++) {
      const half = Math.floor((row % 5) * 0.8 + row / 3) + 1
      px.rect(x - half, base - h + row, half * 2 + 1, 1, row % 5 === 4 ? '#16304a' : '#1d3d5a')
      if (row % 5 === 0) px.rect(x - half + 1, base - h + row, Math.max(1, half * 2 - 1), 1, '#e8f0fb')
    }
    px.rect(x, base, 1, 2, '#2a2030')
  }
  for (let x = 2; x < COLS; x += 6 + Math.floor(rnd() * 5)) pine(x, GROUND - 4, 12 + Math.floor(rnd() * 10))

  // Snowy ground with soft drifts.
  px.rect(0, GROUND - 4, COLS, ROWS - GROUND + 4, '#dfe8f5')
  for (let x = 0; x < COLS; x++) {
    const d = Math.round(Math.sin(x / 9) * 1.5 + Math.sin(x / 4) * 0.8)
    px.rect(x, GROUND - 5 + d, 1, 2, '#eef4fc')
    if ((x * 7) % 11 === 0) px.set(x, GROUND + 6 + (x % 9), '#c3d0e6')
  }

  // Cottages: walls, a snowy roof, lit windows with crossbars, a door, and a chimney.
  const smokeAt = []
  const cottage = (x, w, h, wall, trim) => {
    const base = GROUND + 4
    px.rect(x, base - h, w, h, wall)
    px.rect(x, base - h, 1, h, trim)
    const roof = Math.ceil(w / 2) + 1
    for (let r = 0; r < roof; r++) px.rect(x - 1 + r, base - h - r - 1, w + 2 - r * 2, 1, r < 2 ? '#eef4fc' : '#5a3b3b')
    for (let r = 0; r < roof; r++) { px.set(x - 1 + r, base - h - r - 1, '#ffffff'); px.set(x + w - r, base - h - r - 1, '#c3d0e6') }
    const cx = x + w - 4
    px.rect(cx, base - h - roof + 1, 2, 4, '#5d4a4a'); px.rect(cx, base - h - roof, 2, 1, '#eef4fc')
    smokeAt.push([cx, base - h - roof - 1])
    for (let wx = x + 2; wx + 3 < x + w - 1; wx += 6) {
      px.rect(wx, base - h + 3, 4, 4, '#ffcf6b'); px.rect(wx + 1, base - h + 3, 1, 4, '#c98b3c'); px.rect(wx, base - h + 5, 4, 1, '#c98b3c')
      px.rect(wx - 1, base - h + 7, 6, 1, '#eef4fc')
    }
    const dx = x + Math.floor(w / 2) - 1
    px.rect(dx, base - 6, 3, 6, '#3a2620'); px.set(dx + 2, base - 3, '#ffcf6b')
  }
  cottage(10, 22, 14, '#8a3b3b', '#6e2e2e')
  cottage(40, 18, 12, '#3b5a8a', '#2e476e')
  cottage(132, 20, 13, '#3b7a5a', '#2e6047')
  cottage(170, 24, 15, '#7a5a3b', '#5f462e')

  // The tree: tiers of green with darker undersides, a trunk, and a star on top.
  const TX = 110, TB = GROUND + 2
  for (let row = 0; row < 32; row++) {
    const half = Math.floor((row % 8) * 0.9 + row / 3) + 1
    px.rect(TX - half, TB - 32 + row, half * 2 + 1, 1, row % 8 >= 6 ? '#16502f' : '#1f6b3f')
    px.set(TX - half, TB - 32 + row, '#2b8a52')
  }
  px.rect(TX - 1, TB, 3, 3, '#4a3020')
  for (const [x, y] of [[0, -3], [-1, -2], [0, -2], [1, -2], [-2, -1], [-1, -1], [0, -1], [1, -1], [2, -1], [-1, 0], [1, 0]]) px.set(TX + x, TB - 34 + y, '#ffe066')

  // Lamp post and a snowman.
  px.rect(78, GROUND - 18, 1, 22, '#2a2640'); px.rect(76, GROUND - 20, 5, 3, '#2a2640'); px.rect(77, GROUND - 19, 3, 1, '#ffe2a0')
  px.disc(64, GROUND + 6, 4, '#ffffff'); px.disc(64, GROUND, 3, '#ffffff'); px.set(63, GROUND - 1, '#1a1a2a'); px.set(65, GROUND - 1, '#1a1a2a')
  px.set(64, GROUND, '#ff8a3c'); px.rect(62, GROUND + 2, 5, 1, '#c8402f'); px.rect(62, GROUND - 4, 5, 1, '#1a1a2a'); px.rect(63, GROUND - 6, 3, 2, '#1a1a2a')

  // Moving layers. Aurora: three frames of rippling green curtains.
  const aurora = [0, 1, 2].map((k) => {
    const a = pixelGrid(COLS, ROWS)
    for (let x = 0; x < COLS; x++) {
      const top = 10 + Math.round(Math.sin((x + k * 6) / 11) * 5 + Math.sin(x / 5 + k) * 2)
      const len = 10 + Math.round(Math.sin((x - k * 4) / 7) * 4)
      for (let j = 0; j < len; j++) if ((x + j + k) % 2 === 0 || j < len / 3) a.set(x, top + j, j < 2 ? '#a8ffd8' : j < len / 2 ? '#3fe0a0' : '#2bb39a')
    }
    return a
  })
  const stars = [0, 1, 2].map(() => pixelGrid(COLS, ROWS))
  for (let i = 0; i < 70; i++) stars[i % 3].set(Math.floor(rnd() * COLS), Math.floor(rnd() * 60), i % 5 ? '#e9eeff' : '#a8ffd8')
  // Tree lights in three blinking groups.
  const lights = [pixelGrid(COLS, ROWS), pixelGrid(COLS, ROWS), pixelGrid(COLS, ROWS)]
  const BULB = ['#ff5a5f', '#ffd166', '#5ec8ff', '#ff8fd0']
  for (let i = 0; i < 26; i++) {
    const row = 4 + Math.floor(rnd() * 27), half = Math.floor((row % 8) * 0.9 + row / 3)
    lights[i % 3].set(TX - half + Math.floor(rnd() * (half * 2 + 1)), TB - 32 + row, BULB[i % 4])
  }
  // Chimney smoke: puffs rising and spreading over three frames.
  const smoke = [0, 1, 2].map((k) => {
    const s = pixelGrid(COLS, ROWS)
    for (const [cx, cy] of smokeAt) for (let p = 0; p < 3; p++) {
      const y = cy - p * 4 - k * 1 - 1, x = cx + Math.round(Math.sin((p + k) * 1.3) * 1.5)
      s.rect(x, y, 2 + (p > 1 ? 1 : 0), 2, p === 2 ? '#7d8aa3' : '#a9b4c8')
    }
    return s
  })
  // Snow: two layers of flakes on tiles twice the scene's height, falling a pixel per step.
  const snow = (count, color) => {
    const s = pixelGrid(COLS + 20, ROWS * 2)
    for (let i = 0; i < count; i++) { const x = Math.floor(rnd() * (COLS + 20)), y = Math.floor(rnd() * ROWS); s.set(x, y, color); s.set(x, y + ROWS, color) }
    return s
  }

  const frames = (grids, period) => grids.map((g, k) => `<g style="animation:f3 ${period}s steps(1,end) -${((k * period) / 3).toFixed(1)}s infinite">${g.svg(P)}</g>`).join('')
  return svgDoc({
    defs: `<radialGradient id="lamp"><stop offset="0" stop-color="#ffe2a0" stop-opacity=".45"/><stop offset="1" stop-color="#ffe2a0" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="tree"><stop offset="0" stop-color="#ffe066" stop-opacity=".25"/><stop offset="1" stop-color="#ffe066" stop-opacity="0"/></radialGradient>`,
    css:
      `@keyframes f3{0%{opacity:1}33.333%{opacity:0}}` +
      `@keyframes snow{from{transform:translateY(-${ROWS * P}px)}to{transform:translateY(0)}}`,
    body:
      // The aurora sits above the peaks, so it can go over the sky without hiding anything.
      px.svg(P) + frames(aurora, 3.6).replace(/<g style/g, '<g opacity=".55" style') + frames(stars, 3.6) + frames(smoke, 1.8) + frames(lights, 1.2) +
      `<circle cx="${77 * P + 12}" cy="${(GROUND - 19) * P}" r="90" fill="url(#lamp)"/>` +
      `<circle cx="${TX * P}" cy="${(TB - 16) * P}" r="200" fill="url(#tree)"/>` +
      `<g transform="skewX(-6)"><g style="animation:snow 25s steps(125,end) infinite">${snow(80, '#ffffff').svg(P)}</g></g>` +
      `<g transform="skewX(-6)"><g style="animation:snow 37.5s steps(125,end) -9s infinite">${snow(60, '#c9d6ee').svg(P)}</g></g>`,
  })
}
