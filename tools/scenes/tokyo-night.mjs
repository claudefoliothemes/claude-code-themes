// A Tokyo street at night in Tokyo Night colors, drawn like a 16-bit console scene: a banded
// gradient sky with wispy clouds across a full moon, snowcapped Mt. Fuji in the haze, Tokyo Tower
// glowing in orange and white, neon signs flickering up the buildings, paper lanterns swaying outside
// a little restaurant, power lines, a wet street that mirrors the neon, and cherry blossoms framing
// it all with petals drifting down.
// Palette from enkia/tokyo-night-vscode-theme (MIT) plus sakura pinks. Original art on a 320 x 200
// grid of 5-unit pixels. Every change lands on the shared 0.1 s tick.
import { H, W, rng, svgDoc } from './_lib.mjs'
import { pixelGrid } from './_pixel.mjs'

const P = 5, COLS = W / P, ROWS = H / P
const TN = {
  bg: '#1a1b26', bgDark: '#16161e', night: '#1f2335', termBlack: '#414868', fg: '#c0caf5', fgDark: '#a9b1d6', comment: '#565f89', dark5: '#737aa2',
  blue0: '#3d59a1', blue: '#7aa2f7', cyan: '#7dcfff', blue5: '#89ddff', blue7: '#394b70', magenta: '#bb9af7', purple: '#9d7cd8', orange: '#ff9e64',
  yellow: '#e0af68', green1: '#73daca', red: '#f7768e', red1: '#db4b4b',
}
const SAK = ['#ffe4ef', '#ffc4dc', '#f7a0c6', '#e27aac', '#b85a8a']
const NEON = [TN.magenta, TN.cyan, TN.orange, TN.green1, TN.red, TN.blue, TN.yellow]
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('')
// Abstract katakana-like sign marks, 4 x 5, original strokes.
const GLYPHS = ['1111\n0001\n0010\n0100\n1000', '0100\n1111\n0101\n1001\n0010', '1000\n1000\n1110\n1000\n1000', '1111\n0000\n1111\n0001\n0110',
  '0010\n1111\n0010\n0100\n1000', '1001\n0101\n0001\n0010\n1100', '0100\n0110\n0101\n0100\n0100', '1111\n1001\n1001\n1111\n0000']

export default function scene() {
  const rnd = rng(0x16b1)
  const px = pixelGrid(COLS, ROWS)
  const layer = () => pixelGrid(COLS, ROWS)
  const frames = (grids, period) => grids.map((g, k) => `<g style="animation:f${grids.length} ${period}s steps(1,end) -${(((grids.length - k) % grids.length) * period / grids.length).toFixed(1)}s infinite">${g.svg(P)}</g>`).join('')
  // Solid walls go under the pixels as plain rectangles; their cells are cleared at the end.
  const walls = [], wall = (x, y, w, h, c) => { walls.push([x, y, w, h, c]); px.rect(x, y, w, h, c) }
  const glyph = (g, x, y, c, id = Math.floor(rnd() * GLYPHS.length)) => GLYPHS[id].split('\n').forEach((row, j) => [...row].forEach((ch, i) => { if (ch === '1') g.set(x + i, y + j, c) }))
  const sign = (gs, x, y, w, h, c, skip, vertical = true) => {
    px.rect(x, y, w, h, mix(c, TN.bgDark, 0.82)); px.rect(x + 1, y + 1, w - 2, h - 2, mix(c, TN.bgDark, 0.88))
    const ids = new Array(64).fill(0).map(() => Math.floor(rnd() * GLYPHS.length))
    gs.forEach((g, k) => {
      if (k === skip) return
      g.rect(x, y, w, 1, c); g.rect(x, y + h - 1, w, 1, c); g.rect(x, y, 1, h, c); g.rect(x + w - 1, y, 1, h, c)
      let n = 0
      if (vertical) for (let yy = y + 2; yy + 5 < y + h - 1; yy += 7) glyph(g, x + Math.floor((w - 4) / 2), yy, mix(c, '#ffffff', 0.25), ids[n++])
      else for (let xx = x + 2; xx + 4 < x + w - 1; xx += 6) glyph(g, xx, y + Math.floor((h - 5) / 2), mix(c, '#ffffff', 0.25), ids[n++])
    })
  }

  // Sky as smooth gradient bands, like a 16-bit raster gradient.
  const HZ = 152, SKY = ['#0d0e1a', '#13152a', '#1a1d38', '#222748', '#2c3158', '#3a3a6a', '#4b4378', '#5e4c82']
  const bandAt = (y) => { const t = (Math.min(Math.max(y, 0), HZ) / HZ) * (SKY.length - 1), k = Math.min(SKY.length - 2, Math.floor(t)); return mix(SKY[k], SKY[k + 1], Math.round((t - k) * 6) / 6) }
  let sky = ''
  for (let y = 0; y < HZ; y += 2) sky += `<rect y="${y * P}" width="${W}" height="${2 * P + 1}" fill="${bandAt(y)}"/>`
  // Stars, a shaded full moon, and wisps of cloud across it.
  const twinkle = [0, 1].map(() => layer())
  for (let i = 0; i < 90; i++) {
    const x = Math.floor(rnd() * COLS), y = Math.floor(rnd() * 90)
    px.set(x, y, mix(bandAt(y), TN.fg, 0.35 + (i % 3) * 0.2))
    if (i % 6 === 0) { const g = twinkle[i % 2], s = mix(bandAt(y), '#ffffff', 0.4); g.set(x, y, '#ffffff'); g.set(x - 1, y, s); g.set(x + 1, y, s); g.set(x, y - 1, s); g.set(x, y + 1, s) }
  }
  const MX = 182, MY = 30, MR = 13
  for (let y = -MR; y <= MR; y++) for (let x = -MR; x <= MR; x++) {
    const d = Math.sqrt(x * x + y * y); if (d > MR + 0.3) continue
    const lit = (x * -0.5 + y * -0.6) / MR, c = d > MR - 1 ? '#d8cfae' : lit > 0.35 ? '#fff6dc' : lit > -0.1 ? '#f4e9c8' : lit > -0.5 ? '#e6d9b4' : '#d4c49c'
    px.set(MX + x, MY + y, c)
  }
  for (const [x, y, r] of [[-4, -3, 3], [4, 3, 2], [5, -5, 2], [-3, 5, 2], [1, -1, 1]]) for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) if (xx * xx + yy * yy <= r * r) px.set(MX + x + xx, MY + y + yy, xx + yy < 0 ? '#cdbd96' : '#e0d2ac')
  for (const [x0, y, len] of [[150, 34, 40], [168, 39, 30], [140, 46, 26], [196, 27, 22], [120, 24, 18]]) for (let i = 0; i < len; i++) { const x = x0 + i, top = px.get(x, y); px.set(x, y, mix(top || bandAt(y), '#6a6898', 0.55)); if (i % 3) px.set(x, y + 1, mix(px.get(x, y + 1) || bandAt(y + 1), '#4a4a7a', 0.5)) }

  // Mt. Fuji with a lit face, a shadowed face, snow in streaks, and haze at its foot.
  const FX = 130, FT = 64, FB = 146, FW = 128, FS = 9
  for (let dx = -FW; dx <= FW; dx++) {
    const a = Math.abs(dx), top = a <= FS ? FT + (a > FS - 2 ? 1 : 0) : Math.round(FT + 1 + (FB - FT) * Math.pow((a - FS) / (FW - FS), 0.7))
    const streak = [0, 4, 8, 2, 11, 5, 0, 7, 3, 9, 1, 6, 10][Math.abs(dx * 5 + 3) % 13], snow = FT + 14 + streak - (a > 30 ? 6 : 0) - (a > 40 ? 6 : 0)
    for (let y = top; y < FB; y++) {
      const depth = (y - top) / 6, left = dx < 0
      let c = y <= snow ? (left ? (depth < 1 ? '#f2f4ff' : '#d8deff') : depth < 1 ? '#b8c0ec' : '#9aa4d8') : left ? (y < snow + 3 ? '#6670a8' : '#3a4372') : y < snow + 3 ? '#4c5488' : '#2e3562'
      if (y > FB - 22) c = mix(c, '#4b4378', Math.round(((y - (FB - 22)) / 26) * 4) / 4)
      px.set(FX + dx, y, c)
    }
  }
  const haze = `<rect y="${130 * P}" width="${W}" height="${28 * P}" fill="url(#haze)"/>`
  // Far skyline in two tones with pinpoint windows.
  for (let x = 0; x < COLS;) {
    const w = 5 + Math.floor(rnd() * 9), h = 10 + Math.floor(rnd() * 22)
    px.rect(x, 156 - h, w, h + 6, '#1d2240'); px.rect(x, 156 - h, 1, h, '#252b50')
    for (let y = 158 - h; y < 155; y += 3) for (let xx = x + 2; xx < x + w - 1; xx += 2) if (rnd() < 0.2) px.set(xx, y, rnd() < 0.6 ? '#4a5890' : TN.cyan)
    x += w
  }

  // Tokyo Tower: splayed legs and an arch, X-braced lattice in orange and white bands, two decks.
  const TX = 232, TB = 160, TT = 52
  const hwAt = (y) => y >= 138 ? 9 + (y - 138) * 0.62 : y >= 112 ? 5.5 + (y - 112) * 0.135 : y >= 84 ? 3 + (y - 84) * 0.09 : 1.5
  const bandC = (y, lit) => { const white = Math.floor((TB - y) / 9) % 2 === 1; return white ? (lit ? '#f4f6ff' : '#b9bfdc') : lit ? '#ff9e64' : '#d9603a' }
  for (let y = TT; y <= TB; y++) {
    const hw = hwAt(y), L = Math.round(TX - hw), R = Math.round(TX + hw)
    if (y < 84) { px.set(TX, y, bandC(y, true)); px.set(TX + 1, y, bandC(y, false)); continue }
    for (const [x, lit] of [[L, true], [L + 1, true], [R - 1, false], [R, false]]) px.set(x, y, bandC(y, lit))
    if (y < 146) for (let x = L + 2; x <= R - 2; x++) { const u = x - L, v = (y * 2) % 8; if ((u + v) % 8 === 0 || (u - v + 64) % 8 === 0) px.set(x, y, bandC(y, x < TX)) }
    if (y % 6 === 0 && y < 146) for (let x = L; x <= R; x++) px.set(x, y, bandC(y, x < TX))
  }
  for (let y = 146; y <= TB; y++) { const hw = hwAt(y), arch = Math.round(hw - 3 - (y - 146) * 0.5); for (let x = TX - arch; x <= TX + arch; x++) px.g[y][x] = null }
  px.rect(TX - 10, 108, 21, 5, '#ff9e64'); px.rect(TX - 10, 108, 21, 1, '#ffd2b0'); px.rect(TX - 10, 112, 21, 1, '#b84a2a'); for (let x = TX - 9; x <= TX + 9; x += 2) px.set(x, 110, TN.yellow)
  px.rect(TX - 5, 82, 11, 3, '#f4f6ff'); px.rect(TX - 5, 84, 11, 1, '#9aa0c0'); for (let x = TX - 4; x <= TX + 4; x += 2) px.set(x, 83, TN.yellow)
  px.rect(TX, 34, 1, 18, '#f4f6ff'); px.rect(TX + 1, 40, 1, 12, '#b9bfdc')
  const beacon = [0, 1].map((k) => { const g = layer(); if (!k) { g.set(TX, 33, '#ff4a5a'); for (const [x, y] of [[-1, 0], [1, 0], [0, -1]]) g.set(TX + x, 33 + y, '#a83a4a') } return g })

  // Middle buildings with shaded walls, windows, and neon.
  const signsMid = [0, 1, 2].map(() => layer())
  for (let x = 70, i = 0; x < 262; i++) {
    const w = 12 + Math.floor(rnd() * 16), nearTower = x + w > TX - 16 && x < TX + 16
    const top = nearTower ? 146 + Math.floor(rnd() * 4) : 108 + Math.floor(rnd() * 30)
    wall(x, top, w, 166 - top, '#15161f'); wall(x, top, 2, 166 - top, '#1c1e2c'); px.rect(x, top, w, 1, '#2a2d44')
    for (let y = top + 4; y < 160; y += 4) for (let xx = x + 3; xx < x + w - 2; xx += 3) if (rnd() < 0.34) { const c = [TN.yellow, '#c8b48a', TN.blue7, '#5a7ab0', TN.cyan][Math.floor(rnd() * 5)]; px.rect(xx, y, 2, 2, c) }
    if (!nearTower && i % 2 === 0 && top < 132) sign(signsMid, x + 2 + Math.floor(rnd() * Math.max(1, w - 10)), top + 4, 7, 22 + Math.floor(rnd() * 10), NEON[i % NEON.length], i % 3)
    else if (!nearTower && w > 18 && top < 136) sign(signsMid, x + 2, top + 3, w - 4, 9, NEON[(i + 2) % NEON.length], (i + 1) % 3, false)
    x += w
  }

  // The street: asphalt in bands toward a vanishing point, curbs, lane marks, puddle reflections.
  for (let y = 160; y < ROWS; y++) {
    const t = (y - 160) / (ROWS - 160), half = Math.round(18 + t * 120)
    px.rect(0, y, COLS, 1, mix('#101119', '#161826', Math.round(t * 4) / 4)); px.rect(160 - half, y, 2 * half, 1, mix('#14151f', '#1c1e2e', Math.round(t * 4) / 4))
    px.set(160 - half - 1, y, '#2a2d44'); px.set(160 + half, y, '#2a2d44')
    if (Math.floor(t * 9) % 2 === 0) px.rect(159, y, 2, 1, mix('#3a3d58', '#8a8eb0', Math.round(t * 3) / 3))
  }
  const refl = [0, 1].map(() => layer())
  for (let i = 0; i < 28; i++) { const x = 40 + Math.floor(rnd() * 240), c = NEON[i % NEON.length], y0 = 164 + Math.floor(rnd() * 26), L = 4 + Math.floor(rnd() * 6); for (let y = y0; y < y0 + L; y++) { const a = Math.max(0.15, 0.55 - (y - y0) * 0.07); refl[(y + i) % 2].set(x + ((y + i) % 2), y, mix('#181a28', c, a)) } }

  // Near left: a restaurant with lit windows, an awning, a noren curtain, and swaying lanterns.
  wall(0, 40, 66, 124, '#1b1c2a'); wall(64, 40, 2, 124, '#262838')
  px.poly([[66, 40], [84, 98], [84, 166], [66, 166]], '#14151f'); for (let y = 100; y < 160; y += 8) px.rect(68, y, 14, 1, '#1a1b29')
  for (let y = 46; y < 100; y += 9) for (let x = 5; x < 60; x += 11) { const lit = rnd() < 0.55; px.rect(x, y, 8, 6, lit ? '#3a3326' : '#101119'); if (lit) { px.rect(x + 1, y + 1, 6, 4, mix(TN.yellow, '#1b1c2a', 0.35)); px.rect(x + 1, y + 1, 6, 1, mix(TN.yellow, '#ffffff', 0.2)) } px.rect(x, y + 6, 8, 1, '#2a2b3c') }
  px.rect(0, 104, 70, 3, '#5a2a2a'); px.rect(0, 107, 70, 2, '#3a1c1c'); for (let x = 0; x < 70; x += 4) px.rect(x, 104, 2, 3, '#7a3a34')
  px.rect(3, 118, 60, 44, '#2a2320'); px.rect(5, 120, 56, 40, mix(TN.yellow, '#2a2320', 0.45)); px.rect(5, 120, 56, 6, mix(TN.yellow, '#ffffff', 0.15))
  for (let x = 6; x < 60; x += 11) { px.rect(x, 121, 10, 16, '#2b3a6b'); px.rect(x, 121, 1, 16, '#3c4e8a'); px.rect(x + 9, 121, 1, 16, '#1e2a50'); glyph(px, x + 3, 127, '#e8ecff') }
  const sway = [0, 1].map(() => layer())
  ;[[10, TN.red1], [24, TN.orange], [38, TN.red1], [52, TN.orange]].forEach(([x, c], i) => {
    px.set(x, 109, '#3a1c1c'); px.set(x, 110, '#3a1c1c')
    sway.forEach((g, k) => {
      const dx = (k + i) % 2 ? 0 : 1, cx = x + dx
      for (let y = -6; y <= 6; y++) { const hw = Math.round(5 * Math.sqrt(1 - (y / 7) ** 2)); for (let xx = -hw; xx <= hw; xx++) g.set(cx + xx, 118 + y, xx < -hw / 2 ? mix(c, '#ffffff', 0.35) : xx > hw / 2 ? mix(c, '#000000', 0.35) : c) }
      for (const yy of [114, 118, 122]) for (let xx = -4; xx <= 4; xx++) { const cur = g.get(cx + xx, yy); if (cur) g.set(cx + xx, yy, mix(cur, '#000000', 0.25)) }
      g.rect(cx - 3, 111, 7, 1, '#2a1416'); g.rect(cx - 3, 125, 7, 1, '#2a1416'); glyph(g, cx - 1, 116, '#2a1416', i % GLYPHS.length)
    })
  })
  sign(signsMid, 70, 44, 8, 40, TN.magenta, 1); sign(signsMid, 74, 92, 7, 26, TN.cyan, 0)

  // Near right: an office block, stacked signs, a utility pole with a transformer, a vending machine.
  wall(266, 30, 54, 134, '#1b1c2a'); wall(266, 30, 2, 134, '#262838')
  px.poly([[266, 30], [248, 92], [248, 166], [266, 166]], '#14151f')
  for (let y = 36; y < 118; y += 8) for (let x = 271; x < 318; x += 9) { const lit = rnd() < 0.45; px.rect(x, y, 6, 5, lit ? mix(TN.cyan, '#1b1c2a', 0.45) : '#101119'); if (lit) px.rect(x, y, 6, 1, mix(TN.cyan, '#ffffff', 0.2)) }
  sign(signsMid, 252, 40, 8, 36, TN.orange, 2); sign(signsMid, 252, 82, 8, 28, TN.green1, 1); sign(signsMid, 276, 122, 38, 10, TN.red, 0, false)
  px.rect(292, 138, 18, 26, TN.blue0); px.rect(292, 138, 18, 1, '#6a86d0'); px.rect(294, 140, 14, 12, TN.blue5); px.rect(294, 140, 14, 2, '#c8f0ff')
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) px.rect(295 + c * 3, 143 + r * 3, 2, 2, NEON[(r * 5 + c) % NEON.length])
  px.rect(294, 154, 14, 5, '#101119'); px.set(306, 155, '#9ece6a')
  px.rect(240, 30, 3, 136, '#2a2b3a'); px.rect(240, 30, 1, 136, '#3a3c50'); px.rect(232, 38, 20, 2, '#2a2b3a'); px.rect(234, 46, 16, 2, '#2a2b3a')
  px.rect(244, 52, 6, 9, '#3a3c50'); px.rect(244, 52, 6, 1, '#55587a')
  for (const [y0, y1, sag] of [[38, 46, 9], [46, 52, 7], [40, 62, 10]]) for (let x = 66; x <= 240; x++) { const t = (x - 66) / 174; px.set(x, Math.round(y0 + (y1 - y0) * t + sag * Math.sin(Math.PI * t)), '#0b0c14') }

  // Cherry blossom branches framing the top corners: shaded bark and clusters of five-petal flowers.
  const branch = (pts, w) => { for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let s = 0; s <= n; s++) { const x = Math.round(x0 + ((x1 - x0) * s) / n), y = Math.round(y0 + ((y1 - y0) * s) / n); px.rect(x, y, w, w, '#3a2630'); px.rect(x, y, w, 1, '#5a3a44') } } }
  branch([[0, 6], [26, 14], [52, 18], [80, 30], [104, 38]], 3); branch([[26, 14], [40, 32], [46, 46]], 2); branch([[52, 18], [70, 8]], 2); branch([[80, 30], [92, 48]], 1)
  branch([[319, 2], [296, 12], [274, 18], [256, 28]], 3); branch([[296, 12], [290, 30], [284, 40]], 2)
  const flower = (x, y) => { px.set(x, y, '#ffeaa0'); for (const [dx, dy, s] of [[0, -1, 1], [1, 0, 1], [0, 1, 2], [-1, 0, 2], [1, 1, 3], [-1, -1, 1]]) px.set(x + dx, y + dy, SAK[s]) }
  const bloom = (x, y, r) => {
    for (let i = 0; i < r * r * 1.15; i++) { const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * r; const fx = Math.round(x + Math.cos(a) * d * 1.35), fy = Math.round(y + Math.sin(a) * d); px.set(fx + 1, fy + 1, SAK[4]); px.set(fx, fy + 1, SAK[3]); px.set(fx, fy, SAK[2]) }
    for (let i = 0; i < r * 2.2; i++) { const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * (r - 1); flower(Math.round(x + Math.cos(a) * d * 1.35), Math.round(y + Math.sin(a) * d)) }
  }
  for (const [x, y, r] of [[6, 8, 7], [18, 16, 7], [32, 10, 6], [44, 20, 7], [58, 14, 6], [70, 24, 6], [84, 32, 6], [98, 38, 5], [40, 34, 6], [48, 46, 5], [72, 8, 5], [2, 22, 6], [92, 48, 4],
    [314, 6, 7], [300, 14, 7], [286, 12, 6], [274, 20, 7], [260, 28, 6], [292, 30, 6], [284, 42, 5], [312, 22, 6]]) bloom(x, y, r)
  // Falling petals tumbling in two shapes, and a few on the street.
  const petals = [0, 1, 2].map((k) => { const g = layer(); for (let i = 0; i < 32; i++) { const x = (i * 71 + k * 13) % COLS, y = 10 + ((i * 43 + k * 17) % 178); g.set(x, y, SAK[1 + (i % 3)]); if ((i + k) % 2) g.set(x + 1, y, SAK[2]); else g.set(x, y + 1, SAK[3]) } return g })
  for (let i = 0; i < 24; i++) px.set(30 + Math.floor(rnd() * 260), 164 + Math.floor(rnd() * 36), SAK[2 + (i % 2)])

  const WALLC = new Set(walls.map((w) => w[4]))
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (WALLC.has(px.g[y][x])) px.g[y][x] = null
  const wallSvg = walls.map(([x, y, w, h, c]) => `<rect x="${x * P}" y="${y * P}" width="${w * P}" height="${h * P}" fill="${c}"/>`).join('')
  return svgDoc({
    defs: `<linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a5a9a" stop-opacity="0"/><stop offset=".7" stop-color="#6a5a9a" stop-opacity=".28"/><stop offset="1" stop-color="#6a5a9a" stop-opacity="0"/></linearGradient>` +
      `<radialGradient id="tower"><stop offset="0" stop-color="${TN.orange}" stop-opacity=".24"/><stop offset="1" stop-color="${TN.orange}" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="lamp"><stop offset="0" stop-color="${TN.orange}" stop-opacity=".32"/><stop offset="1" stop-color="${TN.orange}" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="moon"><stop offset="0" stop-color="#fff2cc" stop-opacity=".2"/><stop offset="1" stop-color="#fff2cc" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="vend"><stop offset="0" stop-color="${TN.blue5}" stop-opacity=".25"/><stop offset="1" stop-color="${TN.blue5}" stop-opacity="0"/></radialGradient>`,
    css: `@keyframes f2{0%{opacity:1}50%{opacity:0}}@keyframes f3{0%{opacity:1}33.333%{opacity:0}}`,
    body:
      sky + `<circle cx="${MX * P}" cy="${MY * P}" r="230" fill="url(#moon)"/>` + wallSvg + px.svg(P) + haze +
      `<circle cx="${TX * P}" cy="${104 * P}" r="300" fill="url(#tower)"/><circle cx="${31 * P}" cy="${118 * P}" r="240" fill="url(#lamp)"/><circle cx="${301 * P}" cy="${150 * P}" r="170" fill="url(#vend)"/>` +
      frames(twinkle, 2.4) + frames(beacon, 1.6) + frames(signsMid, 2.7) + frames(sway, 2.4) + frames(refl, 1.2) + frames(petals, 1.8),
  })
}
