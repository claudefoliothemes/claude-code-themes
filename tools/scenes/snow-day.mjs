// A cute pixel-art snow day at dusk: a bunny in a red scarf building a snowman, a fox sledding down
// the hill, a bear cub tossing a snowball, a cabin with glowing windows and twinkling string lights,
// snowy pines, chimney smoke, and snow drifting down. Original characters on a 200 x 125 grid of
// 8-unit pixels. Every change lands on the shared 0.1 s tick.
import { H, W, rng, svgDoc } from './_lib.mjs'
import { pixelGrid } from './_pixel.mjs'

const P = 8, COLS = W / P, ROWS = H / P
const GROUND = 100
const INK = '#2a2440'
const SNOW = '#e4ecfa', SNOW2 = '#c4d0ec', SNOW3 = '#a8b6dc'
const BULBS = ['#ff6b6b', '#ffd166', '#6fe8d8', '#ff9fd0']

// A bunny facing right in a red scarf, standing or mid-hop.
function bunny(g, x, base) {
  g.disc(x - 4, base - 4, 2, INK); g.disc(x - 4, base - 4, 1, '#ffffff')
  g.ellipse(x, base - 5, 4, 5, INK); g.ellipse(x, base - 5, 3, 4, '#ffffff')
  for (const ex of [x - 1, x + 2]) { g.rect(ex - 1, base - 21, 3, 8, INK); g.rect(ex, base - 20, 1, 7, '#ffffff'); g.set(ex, base - 18, '#ffb0c8'); g.set(ex, base - 17, '#ffb0c8') }
  g.disc(x + 1, base - 12, 3, INK); g.disc(x + 1, base - 12, 2, '#ffffff')
  g.set(x + 2, base - 13, INK); g.set(x + 4, base - 12, '#ff8aa8'); g.set(x + 2, base - 11, '#ffb0c8')
  g.rect(x - 2, base - 9, 6, 2, '#e04a4a'); g.rect(x - 3, base - 8, 2, 3, '#c83a3a')
  g.rect(x + 3, base - 6, 2, 1, '#ffffff'); g.rect(x - 3, base, 3, 1, SNOW3); g.rect(x + 1, base, 3, 1, SNOW3)
}
// A fox on a sled, sliding downhill to the right.
function sledFox(g, x, y) {
  g.rect(x - 8, y + 1, 18, 2, '#b8402e'); g.rect(x - 9, y + 3, 20, 1, '#6a3a2a'); g.set(x + 11, y + 2, '#6a3a2a'); g.set(x + 12, y + 1, '#6a3a2a')
  g.ellipse(x, y - 3, 5, 3, INK); g.ellipse(x, y - 3, 4, 2, '#f08a3a'); g.rect(x - 1, y - 2, 4, 2, '#fff4e8')
  g.disc(x + 4, y - 8, 3, INK); g.disc(x + 4, y - 8, 2, '#f08a3a'); g.rect(x + 5, y - 7, 3, 2, '#fff4e8'); g.set(x + 8, y - 7, INK); g.set(x + 4, y - 9, INK)
  g.set(x + 2, y - 11, INK); g.set(x + 6, y - 11, INK); g.set(x + 2, y - 10, '#f08a3a'); g.set(x + 6, y - 10, '#f08a3a')
  g.rect(x + 1, y - 12, 7, 1, '#3aa86a'); g.rect(x + 2, y - 13, 5, 1, '#3aa86a'); g.set(x + 4, y - 14, '#ffffff')
  g.ellipse(x - 7, y - 4, 3, 2, '#f08a3a'); g.set(x - 10, y - 5, '#fff4e8'); g.set(x - 9, y - 5, '#fff4e8')
  for (const [dx, dy] of [[-12, 2], [-14, 1], [-13, 3], [-16, 2]]) g.set(x + dx, y + dy, '#ffffff')
}
// A bear cub in a red scarf tossing a snowball up and catching it (k = 0..3).
function bearCub(g, x, base, k) {
  g.ellipse(x, base - 5, 5, 5, INK); g.ellipse(x, base - 5, 4, 4, '#8a5a3a'); g.ellipse(x, base - 4, 2, 2, '#c8966a')
  g.disc(x - 3, base - 15, 1, INK); g.disc(x + 3, base - 15, 1, INK)
  g.disc(x, base - 12, 4, INK); g.disc(x, base - 12, 3, '#8a5a3a')
  g.rect(x - 1, base - 11, 3, 2, '#c8966a'); g.set(x, base - 11, INK); g.set(x - 2, base - 13, INK); g.set(x + 2, base - 13, INK); g.set(x - 3, base - 11, '#ff9fb4'); g.set(x + 3, base - 11, '#ff9fb4')
  g.rect(x - 4, base - 9, 9, 2, '#3a7ad0')
  const ay = k === 0 ? base - 8 : base - 10
  g.rect(x - 6, ay, 2, 3, '#8a5a3a'); g.rect(x - 7, ay - 1, 3, 2, '#e04a4a')
  const by = [ay - 3, ay - 4, ay - 10, ay - 7][k]
  g.disc(x - 6, by, 2, SNOW3); g.disc(x - 6, by, 1, '#ffffff')
  g.rect(x - 3, base, 2, 1, '#6a4020'); g.rect(x + 2, base, 2, 1, '#6a4020')
}

export default function scene() {
  const rnd = rng(0x5d47)
  const px = pixelGrid(COLS, ROWS)
  const layer = () => pixelGrid(COLS, ROWS)
  const frames = (grids, period) => grids.map((g, k) => `<g style="animation:f${grids.length} ${period}s steps(1,end) -${((k * period) / grids.length).toFixed(1)}s infinite">${g.svg(P)}</g>`).join('')

  // Dusk sky, a few stars, distant snowy mountains.
  px.gradient(0, 70, ['#181c48', '#24265c', '#3a3274', '#5e4486', '#946090', '#c07c90'])
  for (let i = 0; i < 30; i++) px.set(Math.floor(rnd() * COLS), Math.floor(rnd() * 34), i % 3 ? '#e8e4ff' : '#ffe8c0')
  for (let x = 0; x < COLS; x++) { const h = Math.round(18 + 8 * Math.sin(x / 17) + 4 * Math.sin(x / 7)); px.rect(x, 74 - h, 1, h + 4, x % 11 < 6 ? '#8a90c0' : '#7a80b4'); if (h > 22) px.rect(x, 74 - h, 1, 3, '#dfe4f8') }
  px.rect(0, 76, COLS, ROWS - 76, '#a9b3db'); px.rect(0, 76, COLS, 1, '#c8d0ee')
  for (let x = 2; x < COLS; x += 3 + Math.floor(rnd() * 3)) { const h = 3 + Math.floor(rnd() * 4); for (let i = 0; i < h; i++) px.rect(x - Math.floor(i / 2), 83 - h + i, 1 + 2 * Math.floor(i / 2), 1, '#4a5a80') }
  // The sledding hill: high on the left, sloping down to the right, then the snowy ground.
  for (let x = 0; x < COLS; x++) { const top = Math.round(x < 110 ? 62 + x * 0.34 : GROUND - 2); px.rect(x, top, 1, ROWS - top, SNOW); px.rect(x, top, 1, 1, '#ffffff') }
  for (let y = 70; y < ROWS; y += 4) for (let x = Math.floor(rnd() * 12); x < COLS; x += 10 + Math.floor(rnd() * 14)) if (px.get(x, y) === SNOW) px.rect(x, y, 2 + Math.floor(rnd() * 3), 1, SNOW2)
  for (const [x, y, w] of [[40, 112, 16], [120, 116, 20], [170, 108, 12]]) { px.ellipse(x, y, w, 2, SNOW2); px.rect(x - w + 2, y - 1, w * 2 - 3, 1, '#ffffff') }
  // Snowy pines on the far right and behind the hill.
  const pine = (x, base, h) => { for (let i = 0; i < h; i++) { const w = Math.floor((i * 0.45) + 1); px.rect(x - w, base - h + i, w * 2 + 1, 1, i % 4 === 0 ? '#ffffff' : '#2e5a4a') } px.rect(x - 1, base, 3, 3, '#5a3a2a') }
  pine(8, 62, 16); pine(196, 96, 18); pine(186, 98, 14); pine(60, 80, 12)
  // The cabin: log walls, snowy roof, glowing windows, a door, a chimney.
  const CX = 146, CB = GROUND - 2
  px.rect(CX, CB - 16, 32, 16, '#7a4a32'); for (let y = CB - 14; y < CB; y += 3) px.rect(CX, y, 32, 1, '#5a3424')
  px.poly([[CX - 4, CB - 16], [CX + 36, CB - 16], [CX + 16, CB - 28]], '#5a3a3a'); px.poly([[CX - 5, CB - 16], [CX + 37, CB - 16], [CX + 34, CB - 18], [CX + 16, CB - 29], [CX - 2, CB - 18]], SNOW)
  px.poly([[CX - 1, CB - 18], [CX + 33, CB - 18], [CX + 16, CB - 27]], '#5a3a3a')
  px.rect(CX + 24, CB - 30, 4, 8, '#6a5050'); px.rect(CX + 23, CB - 31, 6, 2, SNOW)
  for (const x of [CX + 4, CX + 21]) { px.rect(x, CB - 12, 7, 6, '#3a2418'); px.rect(x + 1, CB - 11, 5, 4, '#ffcf7a'); px.rect(x + 3, CB - 11, 1, 4, '#3a2418'); px.rect(x, CB - 5, 7, 1, SNOW) }
  px.rect(CX + 13, CB - 9, 6, 9, '#4a2a1e'); px.set(CX + 17, CB - 5, '#ffd166'); px.rect(CX + 12, CB - 10, 8, 1, '#ff6b6b')
  const sag = (x) => CB - 16 + Math.round(Math.sin((Math.PI * (x - CX)) / 8) * 1.2) + 1
  for (let x = CX - 3; x < CX + 36; x++) px.set(x, sag(x), '#2a2030')
  // The snowman, waiting for its nose.
  const SX = 116, SB = GROUND + 2
  px.disc(SX, SB - 4, 5, SNOW3); px.disc(SX, SB - 4, 4, '#ffffff'); px.disc(SX, SB - 12, 4, SNOW3); px.disc(SX, SB - 12, 3, '#ffffff'); px.disc(SX, SB - 18, 3, SNOW3); px.disc(SX, SB - 18, 2, '#ffffff')
  px.set(SX - 1, SB - 19, INK); px.set(SX + 1, SB - 19, INK); px.rect(SX, SB - 18, 2, 1, '#ff8a3a'); px.rect(SX - 3, SB - 22, 7, 1, INK); px.rect(SX - 2, SB - 25, 5, 3, INK); px.rect(SX - 2, SB - 23, 5, 1, '#e04a4a')
  for (const y of [SB - 13, SB - 10, SB - 5]) px.set(SX, y, INK)
  px.rect(SX - 3, SB - 15, 7, 1, '#3aa86a'); px.rect(SX + 2, SB - 14, 2, 3, '#3aa86a')
  for (const [x, y] of [[SX - 5, SB - 13], [SX - 6, SB - 14], [SX - 7, SB - 15], [SX + 5, SB - 13], [SX + 6, SB - 14], [SX + 7, SB - 15]]) px.set(x, y, '#6a4a3a')

  // Moving layers.
  // The bunny hopping beside the snowman.
  const bun = [0, 1].map((k) => { const g = layer(); bunny(g, 104, 101 - k * 3); return g })
  // The bear cub tossing a snowball and catching it.
  const bear = [0, 1, 2, 3].map((k) => { const g = layer(); bearCub(g, 132, GROUND + 4, k); return g })
  // The fox on its sled, sheared to sit on the slope, then slid down it in steps.
  const fox0 = layer(), fox = layer(), FX = 20, FY = 66
  sledFox(fox0, FX, FY)
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) { const c = fox0.get(x, y); if (c) fox.set(x, y + Math.round((x - FX) * 0.34), c) }
  // String lights on the cabin, chimney smoke, falling snow.
  const bulbs = [0, 1, 2].map(() => layer())
  for (let x = CX - 2, i = 0; x < CX + 35; x += 3, i++) bulbs[i % 3].set(x, sag(x) + 1, BULBS[i % 4])
  const smoke = [0, 1, 2].map((k) => { const g = layer(); for (let i = 0; i < 3; i++) { const y = CB - 33 - i * 4 - k * 2; g.rect(CX + 25 + ((i + k) % 2), y, 3, 2, '#c8c4d8') } return g })
  const snow = [0, 1, 2].map((k) => { const g = layer(); for (let i = 0; i < 44; i++) g.set((i * 53 + k * 7) % COLS, (i * 23 + k * 4) % (ROWS - 2), '#ffffff'); return g })

  return svgDoc({
    defs: `<radialGradient id="warm"><stop offset="0" stop-color="#ffcf7a" stop-opacity=".4"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></radialGradient>`,
    css:
      `@keyframes f2{0%{opacity:1}50%{opacity:0}}@keyframes f3{0%{opacity:1}33.333%{opacity:0}}@keyframes f4{0%{opacity:1}25%{opacity:0}}` +
      `@keyframes sled{0%{transform:translate(0,0)}80%,100%{transform:translate(${60 * P}px,${20 * P}px)}}`,
    body:
      px.svg(P) + `<circle cx="${(CX + 16) * P}" cy="${(CB - 9) * P}" r="220" fill="url(#warm)"/>` +
      frames(bulbs, 1.8) + frames(smoke, 1.8) + frames(bun, .8) + frames(bear, 2.4) +
      `<g style="animation:sled 7.5s steps(60,end) infinite">${fox.svg(P)}</g>` + frames(snow, 1.5),
  })
}
