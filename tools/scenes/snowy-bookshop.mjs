// A cozy little bookshop on a snowy night, drawn like a 16-bit console scene: shelves of books up to
// the ceiling with a rolling ladder, a big window where snow falls on the rooftops and a street lamp
// glows, a cat asleep on a red armchair, cocoa steaming beside a stack of books and a green desk lamp,
// a small tree twinkling in the corner, and a wood stove flickering. Original art on a 320 x 200 grid
// of 5-unit pixels. Every change lands on the shared 0.1 s tick.
import { H, W, rng, svgDoc } from './_lib.mjs'
import { COLS, FRAME_CSS, P, ROWS, canvas, frames, hash, layer, mix, sprite } from './_bit16.mjs'

const BOOKS = ['#8a3a3a', '#3a5a7a', '#5a7a4a', '#a8823a', '#6a4a7a', '#2a4a5a', '#9a5a3a', '#c8b48a', '#4a3a5a', '#7a2a3a', '#3a6a6a', '#b8945a']

export default function scene() {
  const rnd = rng(0xb00c)
  const { px, V, finish } = canvas()

  // Wood-paneled back wall and a plank floor.
  V(0, 0, COLS, 152, '#2e2120')
  for (let x = 4; x < COLS; x += 12) V(x, 0, 1, 152, '#261b1a')
  V(0, 4, COLS, 2, '#4a3226'); V(0, 6, COLS, 1, '#1e1514')
  for (let r = 0; r < 12; r++) { const y = 152 + r * 4; V(0, y, COLS, 4, r % 2 ? '#3e2a22' : '#46302680'.slice(0, 7)); V(0, y + 3, COLS, 1, '#2a1c18'); for (let x = (r * 37) % 53; x < COLS; x += 53) V(x, y, 1, 3, '#2a1c18') }

  // Bookshelves on both sides, full of books, with a rolling ladder on the left.
  const shelfSection = (x0, x1) => {
    V(x0, 8, x1 - x0, 146, '#241816'); V(x0, 8, 3, 146, '#4a3226'); V(x1 - 3, 8, 3, 146, '#3a2620')
    for (let y = 30; y <= 150; y += 24) {
      V(x0, y, x1 - x0, 3, '#5a3c2c'); V(x0, y, x1 - x0, 1, '#7a5440')
      for (let x = x0 + 4; x < x1 - 5;) {
        const w = 3 + Math.floor(rnd() * 3), h = 13 + Math.floor(rnd() * 7), c = BOOKS[Math.floor(rnd() * BOOKS.length)]
        if (rnd() < 0.08) { x += 3; continue }
        V(x, y - h, w, h, c); V(x, y - h, 1, h, mix(c, '#ffffff', 0.18)); V(x + w - 1, y - h, 1, h, mix(c, '#000000', 0.25))
        if (h > 14) { px.rect(x, y - h + 2, w, 1, '#d8b85a'); px.rect(x, y - 4, w, 1, '#d8b85a') }
        x += w
      }
    }
  }
  shelfSection(0, 92); shelfSection(228, COLS)
  for (let i = 0; i < 60; i++) { const y = 20 + i * 2, x = 70 - Math.round(i * 0.5); px.rect(x, y, 2, 2, '#7a5440'); px.rect(x + 14, y, 2, 2, '#6a4636'); if (i % 6 === 0) px.rect(x + 1, y, 14, 1, '#8a6248') }
  px.rect(52, 18, 40, 1, '#a8a8b0')

  // The big window: night sky, snowy rooftops across the street, a street lamp, frosted corners.
  const WX0 = 104, WX1 = 216, WY0 = 18, WY1 = 108
  V(WX0, WY0, WX1 - WX0, WY1 - WY0, '#141c34')
  for (let y = WY0; y < WY1; y += 2) V(WX0, y, WX1 - WX0, 2, mix('#0e1428', '#2a3458', (y - WY0) / (WY1 - WY0)))
  for (let i = 0; i < 20; i++) px.set(WX0 + 2 + Math.floor(rnd() * 108), WY0 + 2 + Math.floor(rnd() * 30), '#c8d0f0')
  const roofs = [[104, 62, 30], [132, 70, 24], [154, 58, 34], [186, 66, 30]]
  for (const [x, y, w] of roofs) {
    V(x, y + 6, w, WY1 - y - 6, '#2a2440'); px.poly([[x - 2, y + 7], [x + w + 2, y + 7], [x + w / 2, y - 2]], '#e4ecf8'); px.poly([[x + w / 2, y - 2], [x + w + 2, y + 7], [x + w / 2 + 2, y + 7]], '#b8c6e4')
    for (let wx = x + 4; wx < x + w - 4; wx += 8) { px.rect(wx, y + 12, 4, 5, '#ffd27a'); px.rect(wx, y + 12, 4, 1, '#fff0c0'); px.rect(wx, y + 17, 4, 1, '#e4ecf8') }
  }
  V(WX0, 98, WX1 - WX0, 10, '#d6e0f2'); for (let x = WX0; x < WX1; x += 3) px.set(x, 98, '#ffffff')
  px.rect(196, 60, 2, 40, '#1a1a24'); px.rect(192, 56, 10, 4, '#1a1a24'); px.rect(194, 52, 6, 4, '#ffe8a0'); px.rect(195, 51, 4, 1, '#1a1a24')
  const snow = [0, 1, 2].map((k) => { const g = layer(); for (let i = 0; i < 70; i++) { const x = WX0 + 1 + ((i * 37 + k * 11) % (WX1 - WX0 - 2)), y = WY0 + 1 + ((i * 23 + k * 7) % (WY1 - WY0 - 2)); g.set(x, y, i % 4 ? '#ffffff' : '#c8d4ee') } return g })
  // Frame, mullions, sill, frost.
  const wood = '#5a3a2a', woodL = '#7a5440'
  px.rect(WX0 - 4, WY0 - 4, WX1 - WX0 + 8, 4, wood); px.rect(WX0 - 4, WY1, WX1 - WX0 + 8, 3, wood); px.rect(WX0 - 4, WY0 - 4, 4, WY1 - WY0 + 7, wood); px.rect(WX1, WY0 - 4, 4, WY1 - WY0 + 7, wood)
  for (const x of [WX0 + 37, WX0 + 74]) px.rect(x, WY0, 2, WY1 - WY0, wood); px.rect(WX0, WY0 + 44, WX1 - WX0, 2, wood)
  px.rect(WX0 - 8, WY1 + 3, WX1 - WX0 + 16, 4, '#6a4636'); px.rect(WX0 - 8, WY1 + 3, WX1 - WX0 + 16, 1, '#8a6248')
  for (const [cx, cy, sx, sy] of [[WX0, WY0, 1, 1], [WX1 - 1, WY0, -1, 1], [WX0, WY1 - 1, 1, -1], [WX1 - 1, WY1 - 1, -1, -1], [WX0 + 39, WY0 + 46, 1, 1], [WX0 + 72, WY0 + 42, -1, -1]]) for (let i = 0; i < 8; i++) for (let j = 0; j < 8 - i; j++) if ((i + j) % 2 === 0 || i + j < 4) px.set(cx + sx * i, cy + sy * j, i + j < 3 ? '#e8f0ff' : '#a8b8d8')
  // A candle and a little stack of books on the sill.
  px.rect(112, WY1 - 2, 3, 5, '#f4ead8'); px.set(113, WY1 - 3, '#ffd27a'); px.set(113, WY1 - 4, '#fff0b0')
  for (const [w, c] of [[14, '#8a3a3a'], [12, '#3a5a7a'], [13, '#a8823a']].map((v, i) => [v, i])) { const [ww, cc] = w; px.rect(194 - ww / 2 + c, WY1 - 1 - c * 2, ww, 2, cc); px.rect(194 - ww / 2 + c, WY1 - 1 - c * 2, ww, 1, mix(cc, '#ffffff', 0.25)) }

  // A small tree in the corner with gifts, twinkling.
  const TX = 112, TB = 156
  for (let i = 0; i < 40; i++) { const y = TB - 44 + i, hw = Math.round(2 + i * 0.36 - (i % 8 === 7 ? 3 : 0)); px.rect(TX - hw, y, hw * 2 + 1, 1, i % 8 < 2 ? '#3a7a4a' : '#2a5a3a'); px.set(TX - hw, y, '#4a8a5a') }
  px.rect(TX - 2, TB - 4, 5, 4, '#5a3a2a'); sprite(px, TX - 2, TB - 49, ['..y..', '.yyy.', 'yyyyy', '.y.y.'], { y: '#ffd86a' })
  for (const [x, w, h, c, r] of [[TX - 16, 10, 7, '#a83a3a', '#e8d06a'], [TX + 6, 9, 6, '#3a6a9a', '#e8e8f0'], [TX - 5, 7, 5, '#6a9a4a', '#e85a5a']]) { px.rect(x, TB - h, w, h, c); px.rect(x, TB - h, w, 1, mix(c, '#ffffff', 0.3)); px.rect(x + Math.floor(w / 2), TB - h, 1, h, r); px.rect(x, TB - h + 2, w, 1, r) }
  const lights = [0, 1, 2].map(() => layer())
  for (let i = 0; i < 18; i++) { const y = TB - 40 + Math.floor(i * 2.1), hw = Math.round(2 + (y - (TB - 44)) * 0.36) - 1, x = TX + Math.round(Math.sin(i * 1.7) * hw); px.set(x, y, '#5a4a3a'); lights[i % 3].set(x, y, ['#ff6a6a', '#ffd86a', '#7ad0ff', '#9aff8a'][i % 4]) }

  // The red armchair with a knitted blanket and a cat asleep on the seat.
  const AX = 150, AY = 116
  px.rect(AX + 2, AY, 42, 30, '#7a2226'); px.rect(AX + 4, AY + 2, 38, 4, '#9a3236'); for (let x = AX + 8; x < AX + 42; x += 8) for (let y = AY + 8; y < AY + 26; y += 8) px.set(x, y, '#5a161a')
  px.rect(AX - 4, AY + 14, 10, 24, '#8a2a2e'); px.rect(AX - 4, AY + 14, 10, 3, '#b04044'); px.rect(AX + 40, AY + 14, 10, 24, '#6a1c20'); px.rect(AX + 40, AY + 14, 10, 3, '#9a3236')
  px.rect(AX + 6, AY + 30, 34, 8, '#9a3236'); px.rect(AX + 6, AY + 30, 34, 2, '#c04a4e'); px.rect(AX - 2, AY + 38, 50, 4, '#5a161a')
  for (const x of [AX - 2, AX + 44]) px.rect(x, AY + 42, 3, 4, '#3a2420')
  for (let y = AY + 4; y < AY + 32; y++) for (let x = AX + 30; x < AX + 40 - Math.floor((y - AY) / 8); x++) px.set(x, y, (x + y) % 4 < 2 ? '#4a7a5a' : '#e8dcc0')
  const cat = [0, 1].map((k) => {
    const g = layer(), x0 = AX + 10, y0 = AY + 30
    for (let y = -6 - k; y <= 0; y++) { const hw = Math.round(11 * Math.sqrt(Math.max(0, 1 - ((y + 0.5) / (7 + k)) ** 2))); for (let x = -hw; x <= hw; x++) g.set(x0 + 10 + x, y0 + y, y < -4 ? '#f0a868' : (x + 20) % 4 === 0 ? '#c8763a' : '#e8944e') }
    for (let y = -6; y <= -1; y++) for (let x = -4; x <= 4; x++) if (x * x + (y + 3) ** 2 <= 12) g.set(x0 + 22 + x, y0 + y, x < -1 ? '#f0a868' : '#e8944e')
    for (const [x, y] of [[19, -7], [20, -8], [24, -7], [25, -8]]) g.set(x0 + x, y0 + y, '#e8944e')
    g.set(x0 + 20, y0 - 4, '#3a2420'); g.set(x0 + 21, y0 - 3, '#3a2420'); g.set(x0 + 24, y0 - 3, '#3a2420'); g.set(x0 + 25, y0 - 4, '#3a2420'); g.set(x0 + 23, y0 - 2, '#ff9ab0')
    for (let x = 0; x < 12; x++) g.set(x0 + 2 + x, y0 + 1, x % 3 ? '#e8944e' : '#c8763a')
    return g
  })
  const zzz = [0, 1, 2].map((k) => { const g = layer(); for (let i = 0; i <= k; i++) sprite(g, AX + 36 + i * 4, AY + 16 - i * 5, ['zzz', '..z', '.z.', 'zzz'].slice(0, 4).map((r) => r), { z: '#e8dcc0' }); return g })

  // Side table with cocoa, books, and a green desk lamp.
  const SX = 206
  px.rect(SX, 132, 20, 3, '#6a4636'); px.rect(SX, 132, 20, 1, '#8a6248'); px.rect(SX + 2, 135, 2, 20, '#4a3026'); px.rect(SX + 16, 135, 2, 20, '#4a3026'); px.rect(SX + 2, 148, 16, 2, '#4a3026')
  px.rect(SX + 2, 125, 6, 7, '#e8dcc0'); px.rect(SX + 2, 125, 6, 1, '#fff6e6'); px.rect(SX + 3, 126, 4, 1, '#6a3a24'); px.rect(SX + 8, 127, 2, 3, '#e8dcc0')
  for (const [w, c, i] of [[12, '#3a6a6a', 0], [10, '#8a3a3a', 1], [11, '#c8b48a', 2]]) { px.rect(SX + 9 - i, 129 - i * 2, w - 2, 2, c); px.rect(SX + 9 - i, 129 - i * 2, w - 2, 1, mix(c, '#ffffff', 0.25)) }
  px.rect(SX + 13, 118, 2, 6, '#c8a24a'); px.poly([[SX + 8, 118], [SX + 20, 118], [SX + 18, 113], [SX + 10, 113]], '#2a7a4a'); px.rect(SX + 10, 113, 8, 1, '#4aa06a'); px.rect(SX + 9, 118, 10, 1, '#ffe8a0')
  const steam = [0, 1, 2].map((k) => { const g = layer(); for (let i = 0; i < 4; i++) g.set(SX + 4 + ((i + k) % 2), 122 - i * 2 - k, mix('#e8dcc0', '#2e2120', 0.3 + i * 0.12)); return g })

  // A wood stove with a flickering fire and a pipe.
  const OX = 266
  px.rect(OX + 9, 40, 6, 82, '#2a2a30'); px.rect(OX + 9, 40, 2, 82, '#3a3a44')
  px.rect(OX, 120, 26, 28, '#24242a'); px.rect(OX, 120, 26, 2, '#3a3a44'); px.rect(OX + 2, 148, 4, 4, '#1a1a20'); px.rect(OX + 20, 148, 4, 4, '#1a1a20')
  px.rect(OX + 5, 127, 16, 14, '#1a1012')
  const fire = [0, 1, 2].map((k) => { const g = layer(); for (let x = 0; x < 14; x++) { const h = 4 + Math.round(5 * hash(x * 3 + k * 7)); for (let y = 0; y < h; y++) g.set(OX + 6 + x, 140 - y, y > h - 2 ? '#ffd86a' : y > h - 4 ? '#ff9a3a' : '#e8502a') } return g })

  // A hanging lamp and a rug.
  for (let y = 0; y < 18; y++) px.set(160, y, '#1a1210')
  px.poly([[152, 24], [168, 24], [164, 18], [156, 18]], '#c89a4a'); px.rect(152, 24, 16, 1, '#8a6230'); px.rect(158, 25, 4, 1, '#ffe8a0')
  for (let y = 0; y < 14; y++) { const hw = Math.round(60 * Math.sqrt(1 - (y / 14 - 0.5) ** 2 * 4)); px.rect(160 - hw, 166 + y, hw * 2, 1, y % 4 === 0 ? '#c8a24a' : y < 2 || y > 11 ? '#5a2a2a' : '#7a3434') }

  return svgDoc({
    defs: `<radialGradient id="lamp"><stop offset="0" stop-color="#ffd890" stop-opacity=".32"/><stop offset="1" stop-color="#ffd890" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="fire"><stop offset="0" stop-color="#ff9a4a" stop-opacity=".35"/><stop offset="1" stop-color="#ff9a4a" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="street"><stop offset="0" stop-color="#ffe8a0" stop-opacity=".45"/><stop offset="1" stop-color="#ffe8a0" stop-opacity="0"/></radialGradient>`,
    css: FRAME_CSS + `@keyframes glow{0%{opacity:1}50%{opacity:.8}}`,
    body:
      finish() + frames(snow, 1.5) +
      `<circle cx="${197 * P}" cy="${54 * P}" r="70" fill="url(#street)"/>` +
      frames(lights, 1.8) + frames(cat, 2.4) + frames(zzz, 3) + frames(steam, 1.2) + frames(fire, 0.6) +
      `<circle cx="${160 * P}" cy="${30 * P}" r="380" fill="url(#lamp)"/><circle cx="${220 * P}" cy="${118 * P}" r="160" fill="url(#lamp)"/>` +
      `<g style="animation:glow 1.2s steps(1,end) infinite"><circle cx="${279 * P}" cy="${136 * P}" r="200" fill="url(#fire)"/></g>`,
  })
}
