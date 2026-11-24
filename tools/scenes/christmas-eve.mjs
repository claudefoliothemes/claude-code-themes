// A cozy pixel-art living room on Christmas Eve: a crackling fire under a mantel hung with
// stockings, a tree with twinkling lights and a glowing star, presents underneath, snow falling past
// the window, cookies and milk left out, and a toy train chugging across the floor. Drawn on a
// 200 x 125 grid of 8-unit pixels. Every change lands on the shared 0.1 s tick.
import { H, W, rng, svgDoc } from './_lib.mjs'
import { pixelGrid } from './_pixel.mjs'

const P = 8, COLS = W / P, ROWS = H / P
const FLOOR = 96
const INK = '#1a1016'
const BULBS = ['#ff5a5f', '#ffd166', '#6fe8d8', '#8ab4ff', '#ff9fd0']

export default function scene() {
  const rnd = rng(0x12_24)
  const px = pixelGrid(COLS, ROWS)
  const layer = () => pixelGrid(COLS, ROWS)
  const frames = (grids, period) => grids.map((g, k) => `<g style="animation:f${grids.length} ${period}s steps(1,end) -${((k * period) / grids.length).toFixed(1)}s infinite">${g.svg(P)}</g>`).join('')

  // Wall: deep wallpaper with soft stripes, a wood wainscot, then the plank floor.
  px.gradient(0, FLOOR, ['#24161f', '#2b1b25', '#33212b'])
  for (let x = 3; x < COLS; x += 8) px.rect(x, 0, 1, 76, '#2f1f29')
  px.rect(0, 76, COLS, FLOOR - 76, '#3d2620'); px.rect(0, 76, COLS, 1, '#5a3a2a')
  for (let x = 0; x < COLS; x += 12) px.rect(x, 78, 10, 16, '#43291f')
  px.rect(0, FLOOR, COLS, ROWS - FLOOR, '#4a3024')
  for (let y = FLOOR + 3; y < ROWS; y += 4) px.rect(0, y, COLS, 1, '#3e281e')
  for (let y = FLOOR; y < ROWS; y += 4) for (let x = (y * 7) % 23; x < COLS; x += 23) px.rect(x, y, 1, 3, '#3e281e')

  // Window with snowy rooftops outside, a wreath, and a candle on the sill.
  const WX = 76, WY = 16, WW = 44, WH = 40
  px.rect(WX - 3, WY - 3, WW + 6, WH + 6, '#d8d0c4'); px.rect(WX - 2, WY - 2, WW + 4, WH + 4, '#efe8dc')
  for (let y = WY; y < WY + WH; y++) for (let x = WX; x < WX + WW; x++) { const t = (y - WY) / WH + ([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]][y % 4][x % 4] - 7.5) / 48; px.set(x, y, t < 0.33 ? '#101a40' : t < 0.66 ? '#16224e' : '#1e2c5c') }
  for (let x = WX; x < WX + WW; x += 11) {
    const h = 8 + Math.floor(rnd() * 8), w = Math.min(10, WX + WW - x)
    px.rect(x, WY + WH - h, w, h, '#1a1f3c'); px.rect(x, WY + WH - h - 1, w, 2, '#e6eef8')
    if (w > 5) { px.rect(x + 2, WY + WH - h + 3, 2, 2, '#ffd27a'); if (h > 11) px.rect(x + 6, WY + WH - h + 6, 2, 2, '#ffd27a') }
  }
  px.rect(WX, WY + WH - 2, WW, 2, '#e6eef8')
  px.disc(WX + 8, WY + 7, 3, '#f4efd8')
  px.rect(WX + WW / 2 - 1, WY, 2, WH, '#efe8dc'); px.rect(WX, WY + 18, WW, 2, '#efe8dc')
  px.rect(WX - 5, WY + WH + 3, WW + 10, 3, '#d8d0c4')
  // Wreath on the window cross.
  const wx = WX + WW / 2, wy = WY + 19
  for (let a = 0; a < 360; a += 12) { const t = (a * Math.PI) / 180; px.set(wx + Math.cos(t) * 5, wy + Math.sin(t) * 5, '#1f5c38'); px.set(wx + Math.cos(t) * 4, wy + Math.sin(t) * 4, a % 36 ? '#2f7a4a' : '#ff5a5f') }
  px.rect(wx - 2, wy + 4, 5, 2, '#c8323c'); px.set(wx - 2, wy + 6, '#c8323c'); px.set(wx + 2, wy + 6, '#c8323c')
  // Candle on the sill.
  px.rect(WX + 36, WY + WH + 0, 3, 3, '#f0ece4'); px.set(WX + 37, WY + WH - 1, INK)

  // Garland swagged across the top of the wall (bulbs twinkle on layers).
  const swag = (x) => 4 + Math.round(4 * Math.sin((Math.PI * (x % 25)) / 25))
  for (let x = 0; x < COLS; x++) { px.rect(x, swag(x), 1, 2, '#1f5c38'); if (x % 2) px.set(x, swag(x) - 1, '#2f7a4a') }

  // Fireplace: stone surround, firebox, logs, mantel with garland, stockings, hearth.
  px.rect(6, 54, 56, FLOOR - 54, '#6a5858')
  for (let y = 56; y < FLOOR; y += 4) for (let x = 6 + ((y / 4) % 2) * 4; x < 62; x += 8) px.rect(x, y, 1, 4, '#584848')
  for (let y = 57; y < FLOOR; y += 4) px.rect(6, y, 56, 1, '#584848')
  px.rect(18, 68, 32, FLOOR - 68, '#140c10'); px.rect(20, 66, 28, 2, '#140c10'); px.rect(22, 65, 24, 1, '#140c10')
  px.rect(22, 91, 24, 3, '#5a3420'); px.rect(22, 91, 2, 3, '#8a5a3a'); px.rect(44, 91, 2, 3, '#8a5a3a'); px.rect(26, 89, 16, 2, '#6a3e26')
  px.rect(2, 50, 64, 4, '#7a4a30'); px.rect(2, 50, 64, 1, '#9a6040'); px.rect(2, 53, 64, 1, '#5a3420')
  for (let x = 3; x < 65; x++) { px.set(x, 49, x % 3 ? '#1f5c38' : '#2f7a4a'); if (x % 4 === 1) px.set(x, 48, '#1f5c38') }
  px.rect(0, FLOOR - 2, 68, 4, '#7a6a6a'); px.rect(0, FLOOR - 2, 68, 1, '#8e7e7e')
  const stocking = (x, body, cuff, stripe) => {
    px.rect(x, 56, 6, 9, body); if (stripe) { px.rect(x, 59, 6, 1, stripe); px.rect(x, 62, 6, 1, stripe) }
    px.rect(x - 4, 63, 8, 4, body); px.rect(x - 4, 66, 7, 1, body)
    px.rect(x - 1, 54, 8, 3, cuff); px.set(x + 6, 53, '#d8d0c4')
  }
  stocking(12, '#c8323c', '#f0ece4'); stocking(30, '#2f7a4a', '#f0ece4', '#ffd166'); stocking(48, '#c8323c', '#f0ece4', '#f0ece4')
  // Cookies and milk on the hearth.
  px.rect(52, FLOOR - 3, 9, 1, '#efe8dc'); for (const x of [53, 56, 59]) { px.rect(x - 1, FLOOR - 5, 3, 2, '#c88a4a'); px.set(x, FLOOR - 5, '#5a3420') }
  px.rect(63, FLOOR - 8, 3, 6, '#f4f2ec'); px.rect(63, FLOOR - 8, 3, 1, '#d8d4cc')
  // Rug in front of the fire.
  px.ellipse(34, 108, 30, 6, '#c8a050'); px.ellipse(34, 108, 28, 5, '#8a2a34'); px.ellipse(34, 108, 20, 3, '#a8343e'); px.rect(20, 108, 29, 1, '#c8a050')

  // The tree: five tiers, light on the left and dark on the right, with a gold bead garland.
  const TX = 166
  for (let y = 26; y < 90; y++) {
    const tier = Math.min(4, Math.floor((y - 26) / 13)), local = y - 26 - tier * 13
    const w = Math.round(3 + tier * 4 + local * 0.9)
    for (let x = TX - w; x <= TX + w; x++) {
      const t = (x - TX) / Math.max(1, w)
      px.set(x, y, local === 12 || Math.abs(t) > 0.92 ? '#123a26' : t < -0.35 ? '#2f7a4a' : t > 0.4 ? '#174a30' : '#1f5c38')
    }
  }
  for (let tier = 0; tier < 5; tier++) for (let i = -12; i <= 12; i++) {
    const y = 34 + tier * 13 + Math.round(i * 0.35), x = TX + i
    if (px.get(x, y) && px.get(x, y) !== '#123a26') px.set(x, y, '#e8c45a')
  }
  const ORN = ['#c8323c', '#e8c45a', '#5a8ad8', '#d8d8e8', '#b8577a']
  for (let i = 0; i < 26; i++) {
    const y = 30 + Math.floor(rnd() * 56), tier = Math.min(4, Math.floor((y - 26) / 13)), w = Math.round(3 + tier * 4 + (y - 26 - tier * 13) * 0.9) - 2
    const x = TX - w + Math.floor(rnd() * (w * 2 + 1))
    if (w > 1) { px.set(x, y, ORN[i % ORN.length]); px.set(x - 1, y - 1, '#ffffff') }
  }
  px.rect(TX - 3, 90, 7, 4, '#5a3420'); px.ellipse(TX, 94, 18, 2, '#c8323c'); px.ellipse(TX, 94, 15, 1, '#f0ece4')
  // Star on top.
  for (const [dx, dy] of [[0, -4], [0, -3], [-1, -2], [0, -2], [1, -2], [-3, -1], [-2, -1], [-1, -1], [0, -1], [1, -1], [2, -1], [3, -1], [-1, 0], [0, 0], [1, 0], [-2, 1], [-1, 1], [1, 1], [2, 1], [-2, 2], [2, 2]]) px.set(TX + dx, 24 + dy, '#ffd166')
  px.set(TX, 22, '#fff3c4')
  // Presents under the tree.
  const gift = (x, y, w, h, box, ribbon) => {
    px.rect(x, y, w, h, box); px.rect(x, y, w, 1, ribbon === '#f0ece4' ? '#ffffff' : box)
    px.rect(x + Math.floor(w / 2), y, 1, h, ribbon); px.rect(x, y + Math.floor(h / 2), w, 1, ribbon)
    px.set(x + Math.floor(w / 2) - 1, y - 1, ribbon); px.set(x + Math.floor(w / 2) + 1, y - 1, ribbon)
  }
  gift(144, 86, 10, 9, '#c8323c', '#ffd166'); gift(156, 89, 8, 7, '#2f8a9a', '#f0ece4'); gift(174, 85, 12, 11, '#7a4ab0', '#ffd166')
  gift(187, 89, 9, 7, '#e8b14a', '#c8323c'); gift(138, 91, 7, 5, '#3a8a4a', '#f0ece4'); gift(165, 92, 7, 5, '#d77a9a', '#f0ece4')

  // Toy train track across the floor.
  const TRACK = 113
  for (let x = 0; x < COLS; x += 3) px.rect(x, TRACK, 2, 2, '#5a3a28')
  px.rect(0, TRACK, COLS, 1, '#a8a8b8')

  // Moving layers.
  // Snow falling past the window.
  const snow = [0, 1, 2].map((k) => { const s = layer(); for (let i = 0; i < 34; i++) { const x = WX + ((i * 29 + 5) % WW), y = WY + ((i * 11 + k * 3) % (WH - 3)); if (x !== WX + WW / 2 - 1 && x !== WX + WW / 2) s.set(x, y, '#f4f8ff') } return s })
  // Fire: three flame shapes.
  const fire = [0, 1, 2].map((k) => {
    const g = layer()
    for (let x = 21; x <= 46; x++) {
      const c = (x - 33.5) / 12.5, h = Math.round((1 - c * c) * (14 + 4 * Math.sin(x * 1.7 + k * 2.1)) + 2 * Math.sin(x * 0.9 + k))
      for (let i = 0; i < h; i++) g.set(x, 90 - i, i > h * 0.7 ? '#e0482a' : i > h * 0.35 || Math.abs(c) > 0.6 ? '#ff9a2a' : '#ffe08a')
    }
    g.rect(22, 91, 24, 1, '#ff6a2a')
    return g
  })
  // Twinkling tree lights and garland bulbs, three groups each.
  const lights = [0, 1, 2].map(() => layer())
  for (let tier = 0; tier < 5; tier++) for (let i = -10; i <= 10; i += 3) {
    const y = 31 + tier * 13 - Math.round(i * 0.3), x = TX + i
    if (px.get(x, y)) lights[(tier + i + 30) % 3].set(x, y, BULBS[(tier * 3 + i + 30) % 5])
  }
  const bulbs = [0, 1, 2].map(() => layer())
  for (let x = 2, i = 0; x < COLS; x += 5, i++) bulbs[i % 3].rect(x, swag(x) + 2, 1, 2, BULBS[i % 5])
  for (let x = 5, i = 0; x < 64; x += 6, i++) bulbs[(i + 1) % 3].set(x, 48, BULBS[(i + 2) % 5])
  // Candle flame.
  const candle = [0, 1].map((k) => { const g = layer(); g.set(WX + 37, WY + WH - 2, '#ffe08a'); g.set(WX + 37 + (k ? 1 : 0) - (k ? 0 : 0), WY + WH - 3, k ? '#ff9a2a' : '#ffd166'); return g })
  // The toy train: engine, a car of presents, a car of candy canes, with two puffs of smoke.
  const train = layer(), smoke = [layer(), layer()]
  const TX0 = 40, TY = TRACK - 8
  train.rect(TX0, TY + 1, 5, 6, '#c8323c'); train.rect(TX0 + 1, TY + 2, 3, 2, '#ffe08a'); train.rect(TX0 - 1, TY, 7, 1, INK)
  train.rect(TX0 + 5, TY + 3, 8, 4, '#c8323c'); train.rect(TX0 + 5, TY + 4, 8, 1, '#e8c45a'); train.rect(TX0 + 13, TY + 4, 1, 3, INK); train.rect(TX0 + 14, TY + 6, 1, 1, INK)
  train.rect(TX0 + 10, TY + 1, 2, 2, INK); train.rect(TX0 + 9, TY, 4, 1, INK)
  train.rect(TX0 - 1, TY + 7, 15, 1, INK)
  for (const x of [TX0 + 1, TX0 + 7, TX0 + 11]) { train.rect(x, TY + 7, 2, 2, '#3a3448'); train.set(x, TY + 7, '#9aa3b5') }
  train.rect(TX0 - 13, TY + 4, 11, 3, '#2f7a4a'); train.rect(TX0 - 13, TY + 4, 11, 1, '#3f9a5a')
  train.rect(TX0 - 12, TY + 1, 4, 3, '#ffd166'); train.rect(TX0 - 7, TY + 2, 4, 2, '#5a8ad8'); train.set(TX0 - 11, TY + 1, '#c8323c'); train.set(TX0 - 6, TY + 2, '#ffffff')
  train.rect(TX0 - 26, TY + 4, 11, 3, '#5a5ab0'); train.rect(TX0 - 26, TY + 4, 11, 1, '#7a7ad0')
  for (const x of [TX0 - 24, TX0 - 21, TX0 - 18]) { train.rect(x, TY + 1, 1, 3, '#f0ece4'); train.set(x, TY + 1, '#c8323c'); train.set(x + 1, TY + 1, '#f0ece4'); train.set(x, TY + 2, '#c8323c') }
  train.rect(TX0 - 2, TY + 5, 1, 1, INK); train.rect(TX0 - 15, TY + 5, 2, 1, INK)
  for (const x of [TX0 - 12, TX0 - 5, TX0 - 25, TX0 - 18]) { train.rect(x, TY + 7, 2, 2, '#3a3448'); train.set(x, TY + 7, '#9aa3b5') }
  smoke[0].rect(TX0 + 10, TY - 3, 2, 2, '#d8d4dc'); smoke[0].set(TX0 + 8, TY - 5, '#b8b4c0')
  smoke[1].rect(TX0 + 9, TY - 4, 3, 2, '#d8d4dc'); smoke[1].rect(TX0 + 6, TY - 6, 2, 1, '#b8b4c0')

  return svgDoc({
    defs:
      `<radialGradient id="fire"><stop offset="0" stop-color="#ff9a3a" stop-opacity=".38"/><stop offset="1" stop-color="#ff9a3a" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="star"><stop offset="0" stop-color="#ffe08a" stop-opacity=".55"/><stop offset="1" stop-color="#ffe08a" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="tree"><stop offset="0" stop-color="#ffd8a0" stop-opacity=".12"/><stop offset="1" stop-color="#ffd8a0" stop-opacity="0"/></radialGradient>`,
    css:
      `@keyframes f2{0%{opacity:1}50%{opacity:0}}@keyframes f3{0%{opacity:1}33.333%{opacity:0}}` +
      `@keyframes flicker{0%{opacity:.8}25%{opacity:1}50%{opacity:.9}75%{opacity:1}}` +
      `@keyframes glint{0%{opacity:.7}50%{opacity:1}}` +
      `@keyframes chug{0%{transform:translate(-440px,0)}100%{transform:translate(1480px,0)}}`,
    body:
      px.svg(P) +
      `<circle cx="${34 * P}" cy="${84 * P}" r="340" fill="url(#fire)" style="animation:flicker 1.2s steps(1,end) infinite"/>` +
      `<circle cx="${TX * P + 4}" cy="${60 * P}" r="300" fill="url(#tree)"/>` +
      `<circle cx="${TX * P + 4}" cy="${22 * P}" r="110" fill="url(#star)" style="animation:glint 2s steps(1,end) infinite"/>` +
      frames(snow, 0.9) + frames(fire, 0.6) + frames(lights, 1.8) + frames(bulbs, 1.2) + frames(candle, 0.6) +
      `<g style="animation:chug 48s steps(240,end) -14s infinite">${train.svg(P)}${frames(smoke, 0.8)}</g>`,
  })
}
