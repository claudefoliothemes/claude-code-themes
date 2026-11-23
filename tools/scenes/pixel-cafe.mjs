// A cozy pixel-art café at night: rain streaming down the big front window over a lamplit street,
// warm pendant lights, a steaming espresso machine, a glowing pastry case, mugs on the counter,
// plants on the shelves, and a cat asleep on the window seat. Drawn on a 200 x 125 grid of 8-unit
// pixels. Every change lands on the shared 0.1 s tick.
import { H, W, rng, svgDoc } from './_lib.mjs'
import { pixelGrid } from './_pixel.mjs'

const P = 8, COLS = W / P, ROWS = H / P
const COUNTER = 88 // counter top row
const INK = '#21161c'

export default function scene() {
  const rnd = rng(0xcafe)
  const px = pixelGrid(COLS, ROWS)

  // Walls: warm wood paneling below, plaster above.
  px.gradient(0, COUNTER, ['#2a1d22', '#33232a', '#3d2a30'])
  // Big window across the back: the rainy street outside.
  const WX = 6, WY = 10, WW = 188, WH = 46
  px.rect(WX - 2, WY - 2, WW + 4, WH + 4, '#5a3a2c')
  px.gradient(WY, WY + WH, ['#0d1226', '#141c38', '#1c2848'])
  px.rect(0, 0, WX - 2, COUNTER, '#33232a'); px.rect(WX + WW + 2, 0, COLS, COUNTER, '#33232a') // keep walls outside the frame
  px.gradient(0, WY - 2, ['#2a1d22', '#2e2026'])
  // Street outside: buildings, lit windows, a lamp post, wet road.
  for (let x = WX; x < WX + WW; x += 14 + Math.floor(rnd() * 8)) {
    const h = 14 + Math.floor(rnd() * 20), w = Math.min(12 + Math.floor(rnd() * 6), WX + WW - x)
    px.rect(x, WY + WH - h - 6, w, h, '#1a2240')
    for (let y = WY + WH - h - 4; y < WY + WH - 8; y += 4) for (let wx = x + 2; wx < x + w - 2; wx += 4) if (rnd() < 0.4) px.rect(wx, y, 2, 2, rnd() < 0.7 ? '#ffcf7a' : '#9fd8ff')
  }
  px.rect(WX, WY + WH - 6, WW, 6, '#151b34')
  for (let x = WX; x < WX + WW; x += 9) px.rect(x, WY + WH - 4, 4, 1, '#2a3560')
  px.rect(172, WY + 14, 1, WH - 20, '#0c0f20'); px.rect(169, WY + 12, 7, 2, '#0c0f20'); px.rect(170, WY + 14, 5, 1, '#ffe2a0')
  // Window mullions.
  for (const x of [WX + 46, WX + 94, WX + 142]) px.rect(x, WY, 2, WH, '#5a3a2c')

  // Window seat with cushions and the sleeping cat (left).
  px.rect(WX, WY + WH + 2, 46, 3, '#6b4532'); px.rect(WX, WY + WH + 5, 46, 1, '#4f3226')
  px.rect(WX + 2, WY + WH, 16, 3, '#b8577a'); px.rect(WX + 20, WY + WH, 14, 3, '#5a8ab8')
  const catY = WY + WH - 1, catX = WX + 30
  px.ellipse(catX, catY - 1, 7, 3, INK); px.ellipse(catX, catY - 1, 6, 2, '#6b6b7a')
  px.disc(catX - 6, catY - 2, 3, INK); px.disc(catX - 6, catY - 2, 2, '#6b6b7a')
  px.set(catX - 8, catY - 5, INK); px.set(catX - 5, catY - 5, INK); px.set(catX - 8, catY - 4, '#6b6b7a'); px.set(catX - 5, catY - 4, '#6b6b7a')
  px.rect(catX - 8, catY - 2, 1, 1, INK); px.rect(catX - 5, catY - 2, 1, 1, INK)
  px.rect(catX + 5, catY, 4, 1, '#6b6b7a'); px.rect(catX + 8, catY - 1, 1, 1, '#6b6b7a')

  // Shelves on the right wall section above the counter with plants and jars.
  const shelf = (x, y, w) => { px.rect(x, y, w, 2, '#6b4532'); px.rect(x, y + 2, w, 1, '#4f3226') }
  shelf(152, 64, 40)
  for (const [x, h, c] of [[154, 6, '#c9a35a'], [160, 5, '#9fd8ff'], [166, 7, '#e8e2d8'], [174, 5, '#c9a35a']]) { px.rect(x, 64 - h, 4, h, c); px.rect(x, 64 - h, 4, 1, '#fff6e0') }
  px.rect(182, 59, 6, 5, '#b8673d'); for (const [dx, dy] of [[0, -3], [2, -5], [4, -3], [1, -7], [3, -8], [5, -6]]) px.rect(182 + dx, 59 + dy, 2, 3, '#5fa06a')

  // Left wall: a chalkboard menu with a little chalk mug and price lines.
  px.rect(8, 64, 22, 20, '#6b4532'); px.rect(9, 65, 20, 18, '#24302c')
  px.rect(12, 67, 5, 4, '#e8e2d8'); px.rect(13, 68, 3, 2, '#24302c'); px.rect(17, 68, 1, 2, '#e8e2d8'); px.set(13, 66, '#c8d0c8'); px.set(15, 65, '#c8d0c8')
  px.rect(20, 67, 7, 1, '#e8b14a'); px.rect(20, 69, 5, 1, '#c8d0c8')
  for (const [y, w] of [[73, 11], [76, 9], [79, 12]]) { px.rect(11, y, w, 1, '#c8d0c8'); px.rect(24, y, 3, 1, '#ff9fb4') }

  // Counter: wood top and front, with a pastry case on the left and the espresso machine on the right.
  px.rect(0, COUNTER, COLS, 3, '#8a5a3c'); px.rect(0, COUNTER + 3, COLS, 1, '#6b4532')
  px.rect(0, COUNTER + 4, COLS, ROWS - COUNTER - 4, '#4f3226')
  for (let x = 0; x < COLS; x += 10) px.rect(x, COUNTER + 4, 1, ROWS - COUNTER - 4, '#43291f')
  px.rect(0, COUNTER + 18, COLS, 1, '#6b4532')
  // Pastry case.
  px.rect(32, COUNTER - 14, 34, 14, '#9fd8ff'); px.rect(33, COUNTER - 13, 32, 12, '#2a2030')
  px.rect(33, COUNTER - 7, 32, 1, '#c9a35a')
  const pastry = (x, y, kind) => {
    if (kind === 'croissant') { px.rect(x, y + 1, 5, 2, '#c97a4a'); px.rect(x + 1, y, 3, 1, '#e8a45a'); px.set(x + 2, y + 1, '#e8a45a') }
    else if (kind === 'cupcake') { px.rect(x + 1, y + 2, 3, 1, '#b8673d'); px.rect(x, y + 1, 5, 1, '#ff9fb4'); px.rect(x + 1, y, 3, 1, '#ffd6e6'); px.set(x + 2, y - 1, '#ff5a5f') }
    else if (kind === 'donut') { px.rect(x, y, 5, 3, '#e8b14a'); px.rect(x, y, 5, 1, '#b8577a'); px.set(x + 2, y + 1, '#2a2030'); px.set(x + 1, y, '#ffd6e6') }
    else { px.rect(x, y, 5, 3, '#f2e2c4'); px.rect(x, y, 5, 1, '#7a4a2c'); px.set(x + 3, y, '#ff5a5f') }
  }
  for (const [i, kind] of ['croissant', 'cupcake', 'donut', 'cake', 'cupcake', 'croissant', 'cake', 'donut'].entries()) pastry(35 + (i % 4) * 7, COUNTER + (i < 4 ? -11 : -5), kind)
  px.rect(32, COUNTER - 14, 34, 1, '#e6f6ff')
  // Espresso machine.
  const MX = 156, MT = COUNTER - 18
  px.rect(MX, MT, 30, 2, '#c8cfdc'); px.rect(MX, MT + 2, 30, 1, '#9aa3b5')
  for (const x of [MX + 3, MX + 9, MX + 15, MX + 21]) { px.rect(x, MT - 3, 4, 3, '#e8e2d8'); px.rect(x, MT - 3, 4, 1, '#ffffff') }
  px.rect(MX + 1, MT + 3, 28, 9, '#a8443a'); px.rect(MX + 1, MT + 3, 28, 1, '#d0644f'); px.rect(MX + 27, MT + 4, 2, 8, '#7e2f2a')
  px.disc(MX + 15, MT + 7, 2, '#e8e2d8'); px.set(MX + 15, MT + 7, INK); px.set(MX + 16, MT + 6, INK)
  px.rect(MX + 1, MT + 12, 28, 1, '#7e2f2a')
  for (const x of [MX + 5, MX + 21]) { px.rect(x, MT + 13, 4, 2, '#c8cfdc'); px.rect(x - 4, MT + 14, 4, 1, INK); px.rect(x + 1, MT + 16, 3, 2, '#e8e2d8') }
  px.rect(MX + 26, MT + 4, 1, 8, '#c8cfdc'); px.rect(MX + 25, MT + 12, 3, 1, '#c8cfdc')
  px.rect(MX, COUNTER - 1, 30, 1, '#9aa3b5'); for (let x = MX + 1; x < MX + 29; x += 2) px.set(x, COUNTER - 1, '#6b7385')
  // Stools in front of the counter.
  for (const x of [40, 100, 160]) {
    px.rect(x - 1, 110, 3, ROWS - 110, '#9aa3b5'); px.rect(x, 110, 1, ROWS - 110, '#c8cfdc'); px.rect(x - 5, 118, 11, 1, '#9aa3b5')
    px.ellipse(x, 107, 9, 2, INK); px.ellipse(x, 106, 8, 1, '#b8577a'); px.rect(x - 5, 105, 8, 1, '#d77a9a')
  }
  // Mugs on the counter.
  for (const [x, c] of [[96, '#e8e2d8'], [112, '#b8577a'], [128, '#5a8ab8']]) { px.rect(x, COUNTER - 5, 6, 5, c); px.rect(x + 6, COUNTER - 4, 2, 3, c); px.rect(x + 1, COUNTER - 5, 4, 1, '#6b4532') }

  // Moving layers.
  const layer = () => pixelGrid(COLS, ROWS)
  const frames = (grids, period) => grids.map((g, k) => `<g style="animation:f${grids.length} ${period}s steps(1,end) -${((k * period) / grids.length).toFixed(1)}s infinite">${g.svg(P)}</g>`).join('')
  // Rain running down the window glass.
  const rain = [0, 1, 2].map((k) => { const r = layer(); for (let i = 0; i < 60; i++) { const x = WX + 1 + ((i * 53 + 7) % (WW - 2)), y = WY + ((i * 17 + k * 9) % (WH - 4)); r.rect(x, y, 1, 2 + (i % 2), '#7f9ad6') } return r })
  // Steam from the mugs and the machine.
  const steam = [0, 1, 2].map((k) => { const s = layer(); for (const x of [98, 114, 130]) for (let i = 0; i < 2; i++) s.rect(x + ((k + i) % 2), COUNTER - 8 - k * 2 - i * 3, 1, 2, '#d8cfd8'); s.rect(MX + 28 + k, MT + 11 - k, 1 + (k % 2), 1, '#d8cfd8'); return s })
  // Little z's drifting up from the sleeping cat.
  const zees = [0, 1, 2].map((k) => { const z = layer(); const x = catX - 9 - k * 2, y = catY - 8 - k * 3; z.rect(x, y, 4, 1, '#d8d4f0'); z.set(x + 2, y + 1, '#d8d4f0'); z.set(x + 1, y + 2, '#d8d4f0'); z.rect(x, y + 3, 4, 1, '#d8d4f0'); return z })
  // Pendant lamps: cords, shades, and a warm flicker (the glow is drawn over the grid).
  const LAMPS = [76, 100, 124]
  for (const x of LAMPS) { px.rect(x, 0, 1, 18, '#1a1218'); px.poly([[x - 5, 24], [x + 6, 24], [x + 3, 18], [x - 2, 18]], '#c9a35a'); px.rect(x - 1, 24, 3, 1, '#fff3c4') }

  return svgDoc({
    defs: `<radialGradient id="lamp"><stop offset="0" stop-color="#ffcf7a" stop-opacity=".42"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="case"><stop offset="0" stop-color="#ffe2a0" stop-opacity=".22"/><stop offset="1" stop-color="#ffe2a0" stop-opacity="0"/></radialGradient>`,
    css: `@keyframes f3{0%{opacity:1}33.333%{opacity:0}}@keyframes flicker{0%{opacity:.85}25%{opacity:1}50%{opacity:.92}75%{opacity:1}}`,
    body:
      px.svg(P) + frames(rain, 0.6) +
      LAMPS.map((x, i) => `<circle cx="${x * P + 4}" cy="${25 * P}" r="220" fill="url(#lamp)" style="animation:flicker 1.2s steps(1,end) -${(i * 0.3).toFixed(1)}s infinite"/>`).join('') +
      `<circle cx="${49 * P}" cy="${(COUNTER - 7) * P}" r="200" fill="url(#case)"/>` + frames(steam, 1.2) + frames(zees, 2.4),
  })
}
