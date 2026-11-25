// A cozy pixel-art Thanksgiving harvest at golden hour: a farmhouse with glowing windows and
// chimney smoke, a red barn, autumn trees on the hills, a pumpkin patch with hay bales, a wagon of
// pumpkins, and a scarecrow, a cute turkey strutting about, string lights twinkling on the fence,
// leaves falling, and geese flying south in a V. Original art on a 200 x 125 grid of 8-unit
// pixels. Every change lands on the shared 0.1 s tick.
import { H, W, rng, svgDoc } from './_lib.mjs'
import { pixelGrid } from './_pixel.mjs'

const P = 8, COLS = W / P, ROWS = H / P
const HORIZON = 60, FIELD = 68, GROUND = 86
const INK = '#2a1a14'
const BULBS = ['#ffd27a', '#ff8a5a', '#fff0b0', '#ffb070']

function pumpkin(px, cx, cy, r) {
  px.ellipse(cx, cy, r + 1, r, '#7a3a14')
  px.ellipse(cx, cy, r, r - 1, '#e8782a')
  for (const dx of [-Math.ceil(r / 2), Math.ceil(r / 2)]) px.rect(cx + dx, cy - r + 2, 1, r * 2 - 3, '#c85a1a')
  px.rect(cx - Math.floor(r / 2), cy - r + 1, Math.max(1, Math.floor(r / 2)), 1, '#f8a050')
  px.rect(cx, cy - r - 1, 1, 2, '#4a6a2a'); px.set(cx + 1, cy - r - 2, '#4a6a2a')
}

// A cute turkey facing right, fan tail open or puffed.
function turkey(g, cx, base, puffed) {
  const tail = puffed ? 11 : 10, ty = base - 7, lift = puffed ? 1 : 0
  for (const [rr, c] of [[tail + 1, INK], [tail, '#b8602a'], [tail - 2, '#e8843a'], [tail - 4, '#f4c450'], [tail - 6, '#d0682a'], [tail - 8, '#8a4a24']]) {
    for (let y = -rr; y <= 1; y++) for (let x = -rr; x <= rr; x++) if (x * x + y * y <= rr * rr + rr * 0.8) g.set(cx - 2 + x, ty + y, c)
  }
  for (let i = -tail + 2; i <= tail - 2; i += 3) g.set(cx - 2 + i, ty - Math.round(Math.sqrt(Math.max(0, tail * tail - i * i))) + 1, '#ffe08a')
  g.ellipse(cx, base - 4, 6, 4, INK); g.ellipse(cx, base - 4, 5, 3, '#8a5230'); g.rect(cx - 3, base - 4, 5, 1, '#6a3a1e'); g.rect(cx - 2, base - 2, 4, 1, '#6a3a1e')
  const hx = cx + 6, hy = base - 11 - lift
  g.rect(hx - 1, hy + 2, 2, 4, '#d8c0a0'); g.disc(hx, hy, 3, INK); g.disc(hx, hy, 2, '#e8d4b4')
  g.set(hx + 1, hy - 1, INK); g.set(hx - 1, hy + 1, '#ffa0b0'); g.rect(hx + 3, hy, 2, 1, '#f0a040'); g.rect(hx + 2, hy + 1, 1, 3, '#e04a4a'); g.set(hx + 1, hy + 3, '#e04a4a')
  g.rect(cx - 2, base, 1, 2, '#f0a040'); g.rect(cx + 2, base, 1, 2, '#f0a040'); g.rect(cx - 3, base + 2, 3, 1, '#f0a040'); g.rect(cx + 1, base + 2, 3, 1, '#f0a040')
}

export default function scene() {
  const rnd = rng(0x7ba6)
  const px = pixelGrid(COLS, ROWS)
  const layer = () => pixelGrid(COLS, ROWS)
  const frames = (grids, period) => grids.map((g, k) => `<g style="animation:f${grids.length} ${period}s steps(1,end) -${((k * period) / grids.length).toFixed(1)}s infinite">${g.svg(P)}</g>`).join('')

  // Golden-hour sky, the low sun, and streaks of cloud.
  px.gradient(0, HORIZON, ['#2e2450', '#4a2e62', '#7a3a6a', '#b04e66', '#e0705a', '#f6984e', '#ffbe66'])
  px.disc(132, HORIZON - 2, 10, '#ffc66a'); px.disc(132, HORIZON - 2, 8, '#ffde96'); px.disc(130, HORIZON - 4, 4, '#fff0c0')
  for (const [x, y, w, c] of [[20, 20, 32, '#c0607a'], [70, 14, 22, '#d8707a'], [104, 30, 38, '#f0886a'], [156, 22, 30, '#e07a7a'], [40, 38, 28, '#ff9a6a'], [150, 42, 34, '#ffb06a']]) { px.rect(x, y, w, 1, c); px.rect(x + 5, y - 1, w - 12, 1, c) }

  // Hills: far purple-brown, near ones crowned with autumn trees.
  for (let x = 0; x < COLS; x++) { const h = Math.round(9 + 3 * Math.sin(x / 13) + 2 * Math.sin(x / 5)); px.rect(x, HORIZON - h + 6, 1, h, '#6a3e52') }
  for (let x = 0; x < COLS; x++) { const h = Math.round(6 + 3 * Math.sin(x / 9 + 2)); px.rect(x, FIELD - h, 1, h, '#8a5a3a') }
  const TREE = ['#e07a3a', '#c84a3a', '#f0b040', '#d8602a']
  for (let i = 0; i < 26; i++) {
    const x = Math.floor(rnd() * COLS), top = FIELD - Math.round(6 + 3 * Math.sin(x / 9 + 2)), r = 2 + Math.floor(rnd() * 3), c = TREE[i % 4]
    px.rect(x, top - 1, 1, 2, '#5a3a2a'); px.disc(x, top - r - 1, r, c); px.set(x - 1, top - r - 2, '#ffd27a')
  }
  // The golden field with crop rows.
  px.rect(0, FIELD, COLS, GROUND - FIELD, '#b8843a')
  for (let y = FIELD + 2; y < GROUND; y += 3) px.rect(0, y, COLS, 1, '#9a6a2e')

  // The farmhouse on the left: walls, red roof, porch, chimney, warm windows.
  const FX = 8, FW = 34
  px.rect(FX, GROUND - 22, FW, 22, '#efe2c8'); for (let y = GROUND - 20; y < GROUND; y += 3) px.rect(FX, y, FW, 1, '#d8c8a8')
  px.poly([[FX - 3, GROUND - 22], [FX + FW + 3, GROUND - 22], [FX + FW / 2, GROUND - 36]], '#a83a2e'); px.rect(FX - 3, GROUND - 22, FW + 6, 1, '#7a2a22')
  px.rect(FX + 26, GROUND - 38, 4, 10, '#7a4a3a')
  for (const x of [FX + 4, FX + 14, FX + 24]) { px.rect(x, GROUND - 18, 6, 7, '#5a3a2a'); px.rect(x + 1, GROUND - 17, 4, 5, '#ffcf7a'); px.rect(x + 3, GROUND - 17, 1, 5, '#5a3a2a') }
  px.rect(FX + 15, GROUND - 31, 4, 4, '#5a3a2a'); px.rect(FX + 16, GROUND - 30, 2, 2, '#ffcf7a')
  px.rect(FX + 4, GROUND - 9, 26, 1, '#8a5a3a'); px.rect(FX + 16, GROUND - 8, 4, 8, '#6a3a2a'); px.set(FX + 19, GROUND - 4, '#f0c050')
  for (const x of [FX + 4, FX + 29]) px.rect(x, GROUND - 9, 1, 9, '#8a5a3a')
  // A wreath on the door and pumpkins on the steps.
  px.disc(FX + 18, GROUND - 6, 1, '#c84a2a'); pumpkin(px, FX + 12, GROUND - 1, 2); pumpkin(px, FX + 24, GROUND - 1, 2)

  // The barn on the right.
  const BX = 152, BW = 36
  px.rect(BX, GROUND - 24, BW, 24, '#b33a2a'); for (let x = BX + 2; x < BX + BW; x += 3) px.rect(x, GROUND - 24, 1, 24, '#9a2e22')
  px.poly([[BX - 3, GROUND - 24], [BX + BW + 3, GROUND - 24], [BX + BW - 6, GROUND - 34], [BX + 6, GROUND - 34]], '#4a2e2e'); px.poly([[BX + 6, GROUND - 34], [BX + BW - 6, GROUND - 34], [BX + BW / 2, GROUND - 39]], '#5a3a3a')
  px.rect(BX + 12, GROUND - 14, 12, 14, '#f0e4d0'); px.rect(BX + 13, GROUND - 13, 10, 13, '#7a2a22')
  for (let i = 0; i < 10; i++) { px.set(BX + 13 + i, GROUND - 13 + Math.round(i * 1.3), '#f0e4d0'); px.set(BX + 22 - i, GROUND - 13 + Math.round(i * 1.3), '#f0e4d0') }
  px.rect(BX + 14, GROUND - 22, 8, 6, '#f0e4d0'); px.rect(BX + 15, GROUND - 21, 6, 4, '#ffcf7a')

  // A wooden fence along the field edge (the string lights twinkle on layers).
  for (let x = 2; x < COLS; x += 8) px.rect(x, GROUND - 6, 1, 7, '#7a5a3a')
  px.rect(0, GROUND - 5, COLS, 1, '#8a6a4a'); px.rect(0, GROUND - 2, COLS, 1, '#8a6a4a')
  const sag = (x) => GROUND - 7 + Math.round(Math.sin((Math.PI * ((x - 2) % 8)) / 8) * 1.5)
  for (let x = 46; x < 150; x++) px.set(x, sag(x), '#3a2a2a')

  // The foreground: soil, vines, the pumpkin patch, hay bales, a wagon, corn stalks, a scarecrow.
  px.rect(0, GROUND, COLS, ROWS - GROUND, '#5a4224')
  for (let y = GROUND + 2; y < ROWS; y += 2) for (let x = (y * 5) % 7; x < COLS; x += 7) px.set(x, y, '#4a3a1e')
  for (let i = 0; i < 40; i++) { const x = Math.floor(rnd() * COLS), y = GROUND + 4 + Math.floor(rnd() * 34); px.rect(x, y, 3, 1, '#4a6a2a'); px.set(x + 1, y - 1, '#5a8a3a') }
  for (const [x, y, r] of [[52, 104, 4], [66, 112, 5], [96, 118, 4], [112, 121, 3], [140, 114, 5], [158, 104, 3], [176, 112, 4], [190, 100, 3], [22, 110, 4], [36, 118, 3], [124, 120, 3]]) pumpkin(px, x, y, r)
  const bale = (x, y) => { px.rect(x, y, 14, 8, '#e0b04a'); px.rect(x, y, 14, 1, '#f0c86a'); for (let i = 2; i < 14; i += 4) px.rect(x + i, y + 1, 1, 7, '#c8963a'); px.rect(x, y + 3, 14, 1, '#b8842e') }
  bale(56, GROUND + 2); bale(70, GROUND + 4); bale(63, GROUND - 5)
  // The wagon of pumpkins.
  const WX = 120
  px.rect(WX, GROUND + 6, 26, 7, '#8a5a3a'); px.rect(WX, GROUND + 6, 26, 1, '#a8744a'); for (let x = WX + 4; x < WX + 26; x += 5) px.rect(x, GROUND + 7, 1, 6, '#6a4228')
  for (const x of [WX + 5, WX + 20]) { px.disc(x, GROUND + 14, 3, '#3a2a1e'); px.disc(x, GROUND + 14, 2, '#6a4a2a'); px.set(x, GROUND + 14, '#3a2a1e') }
  px.rect(WX - 6, GROUND + 9, 6, 1, '#6a4228')
  for (const [x, r] of [[WX + 5, 3], [WX + 12, 4], [WX + 20, 3]]) pumpkin(px, x, GROUND + 4, r)
  px.disc(WX + 16, GROUND + 3, 1, '#c83a2a'); px.disc(WX + 8, GROUND + 2, 1, '#d84a2a')
  // Corn stalk bundles.
  for (const x of [46, 148]) for (let i = 0; i < 5; i++) { px.rect(x + i, GROUND - 14 + (i % 2) * 2, 1, 14 - (i % 2) * 2, '#c8a050'); px.set(x + i - 1, GROUND - 14 + (i % 2) * 2, '#e0c070') }
  // The scarecrow.
  const SX = 102
  px.rect(SX, GROUND - 22, 1, 30, '#6a4a2a'); px.rect(SX - 7, GROUND - 16, 15, 1, '#6a4a2a')
  px.rect(SX - 4, GROUND - 17, 9, 9, '#c83a2a'); for (const y of [GROUND - 15, GROUND - 12]) px.rect(SX - 4, y, 9, 1, '#e8c060'); px.rect(SX - 1, GROUND - 17, 1, 9, '#e8c060')
  px.rect(SX - 6, GROUND - 16, 2, 3, '#c83a2a'); px.rect(SX + 5, GROUND - 16, 2, 3, '#c83a2a'); px.set(SX - 7, GROUND - 14, '#f0d070'); px.set(SX + 7, GROUND - 14, '#f0d070')
  px.disc(SX, GROUND - 21, 3, '#f0d8a0'); px.set(SX - 1, GROUND - 22, INK); px.set(SX + 1, GROUND - 22, INK); px.rect(SX - 1, GROUND - 20, 3, 1, '#8a4a2a')
  px.rect(SX - 5, GROUND - 24, 11, 1, '#6a4a2a'); px.rect(SX - 3, GROUND - 27, 7, 3, '#6a4a2a'); px.rect(SX - 3, GROUND - 25, 7, 1, '#c83a2a')
  for (const dx of [-4, -2, 2, 4]) px.set(SX + dx, GROUND - 8, '#f0d070')

  // Moving layers.
  // The turkey strutting, tail puffing.
  const strut = [0, 1].map((k) => { const g = layer(); turkey(g, 20, 105, k === 1); return g })
  // String lights on the fence.
  const bulbs = [0, 1, 2].map(() => layer())
  for (let x = 48, i = 0; x < 150; x += 4, i++) bulbs[i % 3].rect(x, sag(x) + 1, 1, 2, BULBS[i % 4])
  // Chimney smoke.
  const smoke = [0, 1, 2].map((k) => { const g = layer(); for (let i = 0; i < 3; i++) { const y = GROUND - 41 - i * 4 - k * 2, x = FX + 28 + ((i + k) % 2) * 2 - i; g.rect(x - 1, y, 3, 2, '#c8b8c8'); g.set(x + 2, y - 1, '#a898b0') } return g })
  // Leaves drifting down.
  const LEAF = ['#e07a3a', '#c84a3a', '#f0b040']
  const leaves = [0, 1, 2].map((k) => { const g = layer(); for (let i = 0; i < 34; i++) { const x = (i * 53 + k * 7) % COLS, y = (i * 29 + k * 4) % (ROWS - 6); g.set(x, y, LEAF[i % 3]); if (i % 2) g.set(x + 1, y + 1, LEAF[(i + 1) % 3]) } return g })
  // Geese in a V, flapping, flying south across the sky.
  const geese = [0, 1].map((k) => { const g = layer(); for (const [dx, dy] of [[0, 0], [-4, 2], [-8, 4], [-12, 6], [-4, -2], [-8, -4]]) { const x = dx, y = 18 + dy; g.set(x, y, '#2a1e2e'); g.set(x + 1, y, '#2a1e2e'); if (k) { g.set(x - 1, y - 1, '#2a1e2e'); g.set(x + 2, y - 1, '#2a1e2e') } else { g.set(x - 1, y + 1, '#2a1e2e'); g.set(x + 2, y + 1, '#2a1e2e') } } return g })

  return svgDoc({
    defs:
      `<radialGradient id="sun"><stop offset="0" stop-color="#ffd890" stop-opacity=".6"/><stop offset="1" stop-color="#ffd890" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="warm"><stop offset="0" stop-color="#ffcf7a" stop-opacity=".4"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></radialGradient>`,
    css:
      `@keyframes f2{0%{opacity:1}50%{opacity:0}}@keyframes f3{0%{opacity:1}33.333%{opacity:0}}` +
      `@keyframes strut{0%{transform:translate(${70 * P}px,0)}100%{transform:translate(${94 * P}px,0)}}` +
      `@keyframes fly{0%{transform:translate(1700px,0)}100%{transform:translate(-200px,${6 * P}px)}}`,
    body:
      px.svg(P) + `<circle cx="${132 * P}" cy="${(HORIZON - 2) * P}" r="380" fill="url(#sun)"/>` +
      `<circle cx="${(FX + 17) * P}" cy="${(GROUND - 14) * P}" r="200" fill="url(#warm)"/><circle cx="${(BX + 18) * P}" cy="${(GROUND - 19) * P}" r="90" fill="url(#warm)"/>` +
      frames(smoke, 1.8) + frames(bulbs, 1.8) +
      `<g style="animation:strut 9.6s steps(24,end) infinite alternate">${frames(strut, 0.8)}</g>` +
      `<g style="animation:fly 38s steps(190,end) -12s infinite">${frames(geese, 0.6)}</g>` +
      frames(leaves, 1.5),
  })
}
