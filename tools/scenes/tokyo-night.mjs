// A Tokyo street at night in Tokyo Night colors: cherry blossoms frame the view and drift down,
// paper lanterns sway outside a little restaurant, neon signs flicker up the buildings, power lines
// cross the sky, Tokyo Tower glows in orange and white with a blinking beacon, and Mt. Fuji stands
// snowcapped under a full moon. Wet asphalt mirrors the neon.
// Palette from enkia/tokyo-night-vscode-theme (MIT) plus sakura pinks. Original art on a 200 x 125
// grid of 8-unit pixels. Every change lands on the shared 0.1 s tick.
import { H, W, rng, svgDoc } from './_lib.mjs'
import { pixelGrid } from './_pixel.mjs'

const P = 8, COLS = W / P, ROWS = H / P
const TN = {
  bg: '#1a1b26', bgDark: '#16161e', bgHi: '#292e42', storm: '#24283b', night: '#1f2335', termBlack: '#414868', fg: '#c0caf5', fgDark: '#a9b1d6',
  comment: '#565f89', dark5: '#737aa2', blue0: '#3d59a1', blue: '#7aa2f7', cyan: '#7dcfff', blue5: '#89ddff', blue7: '#394b70', magenta: '#bb9af7',
  purple: '#9d7cd8', orange: '#ff9e64', yellow: '#e0af68', green: '#9ece6a', green1: '#73daca', red: '#f7768e', red1: '#db4b4b',
}
const SAK = ['#ffd6e8', '#ffb7d5', '#f78fbf', '#d9679a']
const NEON = [TN.magenta, TN.cyan, TN.orange, TN.green1, TN.red, TN.blue, TN.yellow]
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('')

export default function scene() {
  const rnd = rng(0x70c2)
  const px = pixelGrid(COLS, ROWS)
  const layer = () => pixelGrid(COLS, ROWS)
  const frames = (grids, period) => grids.map((g, k) => `<g style="animation:f${grids.length} ${period}s steps(1,end) -${(((grids.length - k) % grids.length) * period / grids.length).toFixed(1)}s infinite">${g.svg(P)}</g>`).join('')
  // A glyph-like neon mark (abstract strokes, not real words) inside a sign.
  const glyph = (g, x, y, c) => { const v = Math.floor(rnd() * 4); g.rect(x, y, 3, 1, c); if (v !== 1) g.rect(x + 1, y, 1, 3, c); if (v !== 2) g.rect(x, y + 2, 3, 1, c); if (v === 3) g.set(x, y + 1, c); if (v === 0) g.set(x + 2, y + 1, c) }

  // Sky, stars, a full moon.
  px.gradient(0, 84, [TN.bgDark, TN.bg, TN.night, '#232c4c', '#2c3866'])
  const twinkle = [0, 1].map(() => layer())
  for (let i = 0; i < 46; i++) { const x = Math.floor(rnd() * COLS), y = Math.floor(rnd() * 50); px.set(x, y, mix(TN.fg, TN.bg, 0.45)); if (i % 4 === 0) twinkle[i % 2].set(x, y, '#ffffff') }
  const MX = 112, MY = 14
  for (let r = 11; r >= 9; r--) px.disc(MX, MY, r, mix(TN.bg, TN.blue7, (12 - r) * 0.25))
  px.disc(MX, MY, 7, '#f2e6c8'); for (const [x, y, r] of [[-3, -2, 1], [2, 2, 2], [3, -4, 1], [-2, 3, 1]]) px.disc(MX + x, MY + y, r, '#ddd0ae')

  // Mt. Fuji, snowcapped, catching the moonlight on its left side.
  const FX = 82, FT = 40, FB = 86, FW = 76, FS = 6
  for (let dx = -FW; dx <= FW; dx++) {
    const a = Math.abs(dx), top = a <= FS ? FT + (a === FS ? 1 : 0) : Math.round(FT + 1 + (FB - FT) * Math.pow((a - FS) / (FW - FS), 0.72))
    const streak = [0, 3, 5, 1, 0, 4, 2, 6, 1, 3, 0, 5, 2][Math.abs(dx * 3 + 7) % 13], snow = FT + 9 + streak + (a > 16 ? -2 : 0) + (a > 22 ? -4 : 0)
    for (let y = top; y < FB; y++) px.set(FX + dx, y, y <= snow ? (dx < 0 ? '#d4dcff' : '#a9b4e0') : dx < 0 ? '#2f3862' : '#283057')
  }
  // Distant skyline.
  for (let x = 0; x < COLS;) {
    const w = 4 + Math.floor(rnd() * 6), h = 8 + Math.floor(rnd() * 16)
    px.rect(x, 86 - h, w, h + 4, '#1e2440')
    for (let y = 88 - h; y < 86; y += 3) for (let xx = x + 1; xx < x + w - 1; xx += 2) if (rnd() < 0.22) px.set(xx, y, rnd() < 0.5 ? TN.blue7 : TN.cyan)
    x += w
  }

  // Tokyo Tower: splayed legs and an open arch, a main deck, a top deck, an antenna, in bands.
  const TX = 142, TB = 94
  const hwAt = (y) => y >= 80 ? 5 + (y - 80) * 0.5 : y >= 64 ? 3 + (y - 64) * 0.125 : y >= 44 ? 1.5 + (y - 44) * 0.075 : 1
  const band = (y) => (Math.floor((TB - y) / 6) % 2 ? '#e8ecff' : TN.orange)
  for (let y = 22; y <= TB; y++) {
    const hw = Math.round(hwAt(y)), c = band(y), cd = mix(c, TN.red1, 0.45)
    if (y < 44) { px.set(TX, y, c); if (y > 30) px.set(TX + 1, y, cd); continue }
    px.set(TX - hw, y, c); px.set(TX + hw, y, cd); px.set(TX - hw + 1, y, c); px.set(TX + hw - 1, y, cd)
    if (y < 84) for (let x = TX - hw + 2; x <= TX + hw - 2; x++) if ((x + y) % 3 === 0 || (x - y) % 3 === 0) px.set(x, y, cd)
    if (y % 4 === 0 && y < 84) for (let x = TX - hw; x <= TX + hw; x++) px.set(x, y, c)
  }
  for (let y = 84; y <= TB; y++) { const hw = Math.round(hwAt(y)), arch = Math.round(hw - 2 - (y - 84) * 0.4); for (let x = TX - arch; x <= TX + arch; x++) px.set(x, y, null) }
  px.rect(TX - 6, 62, 13, 3, TN.orange); px.rect(TX - 6, 62, 13, 1, '#ffd2b0'); for (let x = TX - 5; x <= TX + 5; x += 2) px.set(x, 63, TN.yellow)
  px.rect(TX - 3, 43, 7, 2, '#e8ecff'); px.set(TX - 2, 44, TN.yellow); px.set(TX + 2, 44, TN.yellow)
  const beacon = [0, 1].map((k) => { const g = layer(); if (!k) { g.set(TX, 21, TN.red); g.set(TX - 1, 22, mix(TN.red, TN.bg, 0.5)); g.set(TX + 1, 22, mix(TN.red, TN.bg, 0.5)) } return g })

  // Middle buildings with windows and flickering neon.
  const signs = [0, 1, 2].map(() => layer())
  for (let x = 44, i = 0; x < 160; i++) {
    const w = 8 + Math.floor(rnd() * 10), top = (x + w > TX - 10 && x < TX + 10) ? 86 + Math.floor(rnd() * 3) : 64 + Math.floor(rnd() * 20)
    px.rect(x, top, w, 100 - top, TN.bgDark); px.rect(x, top, w, 1, TN.night)
    for (let y = top + 3; y < 96; y += 3) for (let xx = x + 2; xx < x + w - 2; xx += 2) if (rnd() < 0.3) px.set(xx, y, [TN.yellow, TN.fgDark, TN.blue7, TN.cyan][Math.floor(rnd() * 4)])
    if (top < 84 && i % 2 === 0) {
      const c = NEON[i % NEON.length], sx = x + 1 + Math.floor(rnd() * Math.max(1, w - 6)), sy = top + 3
      px.rect(sx, sy, 5, 12, mix(c, TN.bgDark, 0.8))
      signs.forEach((g, k) => { if (k !== i % 3) { g.rect(sx, sy, 5, 1, c); g.rect(sx, sy + 11, 5, 1, c); g.rect(sx, sy, 1, 12, c); g.rect(sx + 4, sy, 1, 12, c); glyph(g, sx + 1, sy + 2, c); glyph(g, sx + 1, sy + 6, c) } })
    }
    x += w
  }

  // The street: wet asphalt to a vanishing point, sidewalks, neon reflections.
  px.rect(0, 98, COLS, ROWS - 98, '#121320')
  for (let y = 98; y < ROWS; y++) { const t = (y - 98) / (ROWS - 98), half = Math.round(10 + t * 70); px.rect(100 - half, y, 2 * half, 1, '#181a28'); if (y % 3 === 0) px.rect(99, y, 2, 2, mix(TN.fgDark, '#181a28', 0.6)) }
  const refl = [0, 1].map(() => layer())
  for (let i = 0; i < 18; i++) { const x = 30 + Math.floor(rnd() * 140), c = NEON[i % NEON.length], y0 = 101 + Math.floor(rnd() * 16); for (let y = y0; y < y0 + 5; y++) refl[(y + i) % 2].set(x + ((y + i) % 2), y, mix(c, '#181a28', 0.55)); px.set(x, y0 + 2, mix(c, '#181a28', 0.7)) }

  // Near left: a restaurant with a noren curtain and a row of swaying paper lanterns, signs above.
  px.rect(0, 26, 40, 74, '#1c1d2c'); px.poly([[40, 26], [52, 62], [52, 100], [40, 100]], '#151622')
  for (let y = 30; y < 62; y += 5) for (let x = 3; x < 37; x += 6) { px.rect(x, y, 4, 3, rnd() < 0.5 ? mix(TN.yellow, '#1c1d2c', 0.35) : TN.bgDark); px.rect(x, y + 3, 4, 1, '#14151f') }
  px.rect(0, 66, 42, 2, '#3a2a30'); px.rect(2, 76, 36, 22, mix(TN.yellow, TN.bgDark, 0.55)); px.rect(2, 76, 36, 2, '#2a1f24')
  for (let x = 4; x < 36; x += 8) { px.rect(x, 78, 7, 9, '#2b3a6b'); px.set(x + 3, 81, TN.fg); px.rect(x + 2, 83, 3, 1, TN.fg) }
  const sway = [0, 1].map(() => layer())
  ;[[7, TN.red1], [16, TN.orange], [25, TN.red1], [34, TN.orange]].forEach(([x, c], i) => {
    px.set(x, 68, '#2a1f24')
    sway.forEach((g, k) => { const dx = (k + i) % 2 ? 0 : 1; g.ellipse(x + dx, 73, 3, 4, c); g.rect(x - 2 + dx, 68, 5, 1, '#2a1f24'); g.rect(x - 2 + dx, 78, 5, 1, '#2a1f24'); g.rect(x - 2 + dx, 71, 1, 4, mix(c, '#ffffff', 0.4)); for (const yy of [71, 73, 75]) g.rect(x - 2 + dx, yy, 5, 1, mix(c, '#000000', 0.25)); g.rect(x + dx, 72, 1, 3, '#2a1f24') })
  })
  ;[[42, 30, TN.magenta, 22], [46, 56, TN.cyan, 14]].forEach(([x, y, c, h]) => { px.rect(x, y, 5, h, mix(c, TN.bgDark, 0.8)); signs.forEach((g, k) => { if (k !== 1) { g.rect(x, y, 5, 1, c); g.rect(x, y + h - 1, 5, 1, c); g.rect(x, y, 1, h, c); g.rect(x + 4, y, 1, h, c); for (let yy = y + 2; yy < y + h - 4; yy += 4) glyph(g, x + 1, yy, c) } }) })

  // Near right: a building with stacked signs, a utility pole, a glowing vending machine.
  px.rect(166, 20, 34, 80, '#1c1d2c'); px.poly([[166, 20], [154, 58], [154, 100], [166, 100]], '#151622')
  for (let y = 24; y < 74; y += 5) for (let x = 169; x < 198; x += 6) { px.rect(x, y, 4, 3, rnd() < 0.45 ? mix(TN.cyan, '#1c1d2c', 0.4) : TN.bgDark); px.rect(x, y + 3, 4, 1, '#14151f') }
  ;[[158, 26, TN.orange, 18], [158, 48, TN.green1, 16], [176, 76, TN.red, 0]].forEach(([x, y, c, h], i) => {
    if (!h) { px.rect(x, y, 20, 6, mix(c, TN.bgDark, 0.75)); signs.forEach((g, k) => { if (k !== 2) { g.rect(x, y, 20, 1, c); g.rect(x, y + 5, 20, 1, c); for (let xx = x + 2; xx < x + 18; xx += 4) glyph(g, xx, y + 2, c) } }); return }
    px.rect(x, y, 5, h, mix(c, TN.bgDark, 0.8)); signs.forEach((g, k) => { if (k !== i) { g.rect(x, y, 5, 1, c); g.rect(x, y + h - 1, 5, 1, c); g.rect(x, y, 1, h, c); g.rect(x + 4, y, 1, h, c); for (let yy = y + 2; yy < y + h - 4; yy += 4) glyph(g, x + 1, yy, c) } })
  })
  px.rect(184, 84, 10, 15, TN.blue0); px.rect(185, 85, 8, 8, TN.blue5); for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) px.rect(186 + c * 2, 86 + r * 3, 1, 2, NEON[(r * 3 + c) % NEON.length])
  px.rect(150, 18, 2, 82, '#2a2b3a'); px.rect(145, 24, 12, 1, '#2a2b3a'); px.rect(146, 30, 10, 1, '#2a2b3a')
  // Power lines sagging across the sky.
  for (const [y0, y1, sag] of [[24, 30, 5], [30, 34, 4], [27, 40, 6]]) for (let x = 40; x <= 150; x++) { const t = (x - 40) / 110; px.set(x, Math.round(y0 + (y1 - y0) * t + sag * Math.sin(Math.PI * t)), '#0e0f18') }

  // Cherry blossoms framing the top corners.
  const branch = (pts, w) => { for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let s = 0; s <= n; s++) px.rect(Math.round(x0 + ((x1 - x0) * s) / n), Math.round(y0 + ((y1 - y0) * s) / n), w, w, '#3a2630') } }
  branch([[0, 4], [18, 10], [34, 12], [52, 20], [64, 24]], 2); branch([[18, 10], [26, 22], [30, 30]], 1); branch([[34, 12], [44, 6]], 1)
  branch([[199, 2], [184, 8], [170, 12], [158, 18]], 2); branch([[184, 8], [180, 20], [176, 26]], 1)
  const flower = (x, y) => { px.set(x, y, SAK[0]); px.set(x - 1, y, SAK[1]); px.set(x + 1, y, SAK[1]); px.set(x, y - 1, SAK[1]); px.set(x, y + 1, SAK[2]) }
  const bloom = (x, y, r) => { for (let i = 0; i < r * r * 1.4; i++) { const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * r; const fx = Math.round(x + Math.cos(a) * d * 1.3), fy = Math.round(y + Math.sin(a) * d); px.set(fx + 1, fy + 1, SAK[3]); px.set(fx, fy + 1, SAK[2]) } for (let i = 0; i < r * 2; i++) { const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * (r - 1); flower(Math.round(x + Math.cos(a) * d * 1.3), Math.round(y + Math.sin(a) * d)) } }
  for (const [x, y, r] of [[4, 6, 5], [12, 12, 5], [22, 8, 4], [28, 14, 5], [38, 10, 4], [46, 18, 4], [56, 22, 4], [64, 26, 3], [24, 24, 4], [30, 31, 3], [44, 5, 3], [2, 16, 4],
    [196, 4, 5], [188, 10, 5], [178, 8, 4], [170, 14, 5], [160, 20, 4], [180, 22, 4], [175, 28, 3], [194, 16, 4]]) bloom(x, y, r)
  // Falling petals and a few on the street.
  const petals = [0, 1, 2].map((k) => { const g = layer(); for (let i = 0; i < 34; i++) { const x = (i * 47 + k * 9) % COLS, y = 8 + ((i * 29 + k * 11) % 104); g.set(x, y, SAK[i % 3]); if (i % 3 === 0) g.set(x + 1, y, SAK[(i + 1) % 3]) } return g })
  for (let i = 0; i < 26; i++) px.set(20 + Math.floor(rnd() * 160), 100 + Math.floor(rnd() * 24), SAK[1 + (i % 2)])

  return svgDoc({
    defs: `<radialGradient id="tower"><stop offset="0" stop-color="${TN.orange}" stop-opacity=".22"/><stop offset="1" stop-color="${TN.orange}" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="lamp"><stop offset="0" stop-color="${TN.orange}" stop-opacity=".3"/><stop offset="1" stop-color="${TN.orange}" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="moon"><stop offset="0" stop-color="#f2e6c8" stop-opacity=".16"/><stop offset="1" stop-color="#f2e6c8" stop-opacity="0"/></radialGradient>`,
    css: `@keyframes f2{0%{opacity:1}50%{opacity:0}}@keyframes f3{0%{opacity:1}33.333%{opacity:0}}`,
    body:
      `<circle cx="${112 * P}" cy="${14 * P}" r="240" fill="url(#moon)"/>` + px.svg(P) +
      `<circle cx="${TX * P}" cy="${60 * P}" r="260" fill="url(#tower)"/><circle cx="${20 * P}" cy="${72 * P}" r="230" fill="url(#lamp)"/>` +
      frames(twinkle, 2.4) + frames(beacon, 1.6) + frames(signs, 2.7) + frames(sway, 2.4) + frames(refl, 1.2) + frames(petals, 1.8),
  })
}
