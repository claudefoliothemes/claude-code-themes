// A pastel pixel-art ice shore at twilight with round, blushing penguins: one waving as hearts pop up, a
// fluffy chick hopping beside it, one waddling back and forth, one fishing at a hole in the ice
// with its bobber bobbing, and one sliding by on its belly, while fish leap in the bay, snow
// drifts down, and an igloo sits on the left. Original characters on a 200 x 125 grid of 8-unit
// pixels. Every change lands on the shared 0.1 s tick.
import { H, W, rng, svgDoc } from './_lib.mjs'
import { pixelGrid } from './_pixel.mjs'

const P = 8, COLS = W / P, ROWS = H / P
const HORIZON = 58, ICE = 76
const INK = '#2a2440', NAVY = '#3a4468', NAVY2 = '#2e3656', BELLY = '#ffffff', BEAK = '#ffaa3a', BLUSH = '#ffa0c0'

// A front-facing penguin standing with its feet on row `base`.
function penguin(g, cx, base, { wave = false, step = 0 } = {}) {
  g.ellipse(cx, base - 6, 5, 6, INK)
  g.ellipse(cx, base - 6, 4, 5, NAVY)
  g.rect(cx + 2, base - 10, 2, 7, NAVY2)
  g.ellipse(cx, base - 5, 3, 4, BELLY)
  g.set(cx - 2, base - 7, INK); g.set(cx + 2, base - 7, INK)
  g.set(cx - 3, base - 6, BLUSH); g.set(cx + 3, base - 6, BLUSH)
  g.set(cx, base - 6, BEAK); g.set(cx, base - 5, '#e88a2a')
  g.rect(cx - 6, base - 7, 1, 3, NAVY2)
  if (wave) { g.rect(cx + 6, base - 11, 1, 3, NAVY2); g.set(cx + 5, base - 8, NAVY2) } else g.rect(cx + 6, base - 7, 1, 3, NAVY2)
  g.rect(cx - 3 + (step === 1 ? -1 : 0), base, 2, 1, BEAK); g.rect(cx + 2 + (step === 1 ? 1 : 0), base - (step === 1 ? 1 : 0), 2, 1, BEAK)
}
// A fluffy grey chick.
function chick(g, cx, base) {
  g.ellipse(cx, base - 3, 3, 3, INK); g.ellipse(cx, base - 3, 2, 2, '#c4c8d4')
  g.set(cx - 3, base - 5, '#c4c8d4'); g.set(cx + 3, base - 5, '#c4c8d4')
  g.rect(cx - 1, base - 4, 3, 2, BELLY); g.set(cx - 1, base - 4, INK); g.set(cx + 1, base - 4, INK); g.set(cx, base - 3, BEAK)
  g.set(cx - 2, base - 3, BLUSH); g.set(cx + 2, base - 3, BLUSH)
  g.set(cx - 1, base, BEAK); g.set(cx + 1, base, BEAK)
}
// A penguin sliding on its belly, head to the right.
function slider(g, cx, cy) {
  g.ellipse(cx, cy, 7, 3, INK); g.ellipse(cx, cy, 6, 2, NAVY)
  g.rect(cx - 5, cy + 1, 10, 1, BELLY); g.rect(cx + 3, cy - 1, 3, 2, BELLY)
  g.set(cx + 4, cy - 1, INK); g.set(cx + 5, cy, BLUSH); g.set(cx + 7, cy, BEAK); g.set(cx + 8, cy, BEAK)
  g.rect(cx - 2, cy - 3, 3, 1, NAVY2); g.set(cx - 8, cy, BEAK); g.set(cx - 8, cy - 1, BEAK)
  for (const [dx, dy] of [[-10, 1], [-12, 0], [-11, -1], [-14, 1]]) g.set(cx + dx, cy + dy, '#ffffff')
}
const HEART = ['.#.#.', '#####', '.###.', '..#..']
const heart = (g, x, y, c) => HEART.forEach((row, j) => [...row].forEach((ch, i) => { if (ch === '#') g.set(x + i, y + j, c) }))

export default function scene() {
  const rnd = rng(0x9e7)
  const px = pixelGrid(COLS, ROWS)
  const layer = () => pixelGrid(COLS, ROWS)
  const frames = (grids, period) => grids.map((g, k) => `<g style="animation:f${grids.length} ${period}s steps(1,end) -${((k * period) / grids.length).toFixed(1)}s infinite">${g.svg(P)}</g>`).join('')

  // Pastel sky, a soft sun, and clouds.
  px.gradient(0, HORIZON, ['#1e1a48', '#2a2458', '#3c2f6c', '#5a3f82', '#8a5a98'])
  px.disc(158, 18, 6, '#e8e0ff'); px.disc(157, 17, 5, '#fff8f0'); px.set(159, 20, '#e0d8f4'); px.set(155, 16, '#f0e8fc')
  const cloud = (cx, cy, w) => { px.ellipse(cx, cy, w, 2, '#6c5ca4'); px.ellipse(cx - Math.round(w / 3), cy - 2, Math.round(w / 2), 2, '#6c5ca4'); px.ellipse(cx + Math.round(w / 4), cy - 3, Math.round(w / 2.5), 2, '#8474b8'); px.rect(cx - w + 1, cy + 2, w * 2 - 1, 1, '#4e4284') }
  cloud(30, 16, 10); cloud(96, 10, 12); cloud(186, 30, 8); cloud(128, 34, 7)
  // Distant snowy hills and icebergs on the bay.
  for (let x = 0; x < COLS; x++) { const h = Math.round(5 + 3 * Math.sin(x / 11) + 2 * Math.sin(x / 5)); px.rect(x, HORIZON - h, 1, h, x % 9 < 5 ? '#8c9ad0' : '#7a88c0') }
  px.rect(0, HORIZON, COLS, ICE - HORIZON, '#2c5c8a')
  for (let y = HORIZON + 2; y < ICE; y += 3) for (let x = (y * 7) % 13; x < COLS; x += 13) px.rect(x, y, 5, 1, '#26507a')
  for (const [x, w, h] of [[70, 9, 6], [136, 12, 8], [104, 6, 4]]) {
    px.poly([[x, HORIZON + 3], [x + w, HORIZON + 3], [x + w - 2, HORIZON + 3 - h], [x + 2, HORIZON + 1 - h]], '#c8d4f0')
    px.rect(x + Math.round(w / 2), HORIZON + 3 - h, Math.round(w / 2) - 1, h, '#a4b4dc'); px.rect(x - 1, HORIZON + 3, w + 2, 1, '#4a7aac')
  }
  // The ice shelf: an edge facing the water, then snow with soft shading.
  px.rect(0, ICE, COLS, 3, '#9aaedc'); px.rect(0, ICE + 3, COLS, 1, '#7a90c4')
  px.rect(0, ICE + 4, COLS, ROWS - ICE - 4, '#c4d0ee')
  for (let y = ICE + 6; y < ROWS; y += 3) for (let x = (y * 5) % 11; x < COLS; x += 11) px.rect(x, y, 4, 1, '#b4c2e6')
  for (const [x, y, w] of [[60, 96, 14], [120, 112, 18], [10, 116, 12], [176, 104, 10]]) { px.ellipse(x, y, w, 2, '#d6e0f8'); px.rect(x - w + 2, y + 2, w * 2 - 3, 1, '#a8b6dc') }

  // The igloo on the left.
  const IX = 22, IY = ICE + 16
  px.ellipse(IX, IY, 13, 10, '#8a9ed0'); px.ellipse(IX, IY, 12, 9, '#dae4f8')
  px.rect(IX - 13, IY, 27, 11, '#dae4f8')
  for (const y of [IY - 6, IY - 2, IY + 2]) px.rect(IX - 12, y, 25, 1, '#b4c2e6')
  for (const [y, xs] of [[IY - 8, [IX - 3, IX + 4]], [IY - 4, [IX - 8, IX, IX + 8]], [IY, [IX - 10, IX - 4, IX + 5, IX + 10]]]) for (const x of xs) px.rect(x, y + 1, 1, 3, '#b4c2e6')
  px.ellipse(IX + 4, IY + 5, 4, 5, '#8a9ed0'); px.ellipse(IX + 4, IY + 6, 3, 4, '#ffcf7a'); px.rect(IX, IY + 6, 9, 5, '#dae4f8'); px.rect(IX + 1, IY + 6, 7, 5, '#ffcf7a'); px.rect(IX + 2, IY + 8, 5, 3, '#ffe2a8')
  px.rect(IX - 13, IY + 11, 27, 1, '#b4c2e6')

  // The ice-fishing hole on the right, with a bucket of fish.
  const FX = 172, FB = ICE + 22
  px.ellipse(FX + 13, FB + 2, 5, 2, '#7a90c4'); px.ellipse(FX + 13, FB + 2, 4, 1, '#1e4a78')
  px.rect(FX - 14, FB - 4, 6, 5, '#5a7ab8'); px.rect(FX - 14, FB - 4, 6, 1, '#7a9ad0'); px.set(FX - 13, FB - 5, '#ff9a5a'); px.set(FX - 11, FB - 6, '#ff9a5a'); px.set(FX - 10, FB - 5, '#ffb070')

  // Characters that stand still: the waving penguin's friend and the fisher (rod in flipper).
  const WX = 50, WB = ICE + 18
  const fisher = layer()
  penguin(fisher, FX, FB)
  for (let i = 0; i < 7; i++) fisher.set(FX + 6 + i, FB - 8 - Math.round(i * 0.9), '#8a5a3a')
  for (let y = FB - 14; y < FB + 1; y++) fisher.set(FX + 13, y, '#c8d4e4')

  // Moving layers.
  // The waving penguin (two poses) and hearts that pop up above it now and then.
  const waver = [0, 1].map((k) => { const g = layer(); penguin(g, WX, WB, { wave: k === 0 }); return g })
  const hearts = [0, 1, 2, 3].map((k) => { const g = layer(); if (k < 3) heart(g, WX + 4 + k, WB - 18 - k * 4, k === 2 ? '#ffb8d4' : '#ff6b9e'); return g })
  // The chick hopping.
  const hops = [0, 1].map((k) => { const g = layer(); chick(g, WX + 12, WB - k * 2); return g })
  // The bobber bobbing.
  const bob = [0, 1].map((k) => { const g = layer(); g.set(FX + 13, FB + 1 + k, '#ff5a5f'); g.set(FX + 13, FB + k, '#ffffff'); return g })
  // The waddler: two stepping poses inside a group that walks back and forth.
  const waddle = [0, 1].map((k) => { const g = layer(); penguin(g, 80, ICE + 30, { step: k }); return g })
  // The slider, crossing the ice.
  const slide = layer(); slider(slide, 0, ICE + 40)
  // Fish leaping in the bay: a short arc, then gone for the rest of the cycle.
  const ARC = [[118, 72], [121, 66], [124, 63], [127, 66], [130, 72]]
  const fish = ARC.map(([x, y], k) => { const g = layer(); const c = '#ff9a5a'; if (k < 2) { g.rect(x, y, 3, 2, c); g.set(x - 1, y + 2, c) } else if (k === 2) { g.rect(x - 1, y, 4, 2, c); g.set(x + 3, y - 1, c) } else { g.rect(x, y, 3, 2, c); g.set(x + 3, y + 2, c) } g.set(x + 1, y, INK); return g })
  const splash = layer(); for (const [dx, dy] of [[-1, 0], [1, -1], [3, 0], [0, 1]]) splash.set(130 + dx, 73 + dy, '#ffffff')
  // Stars twinkling over the bay, in clear sky only.
  const stars = [0, 1, 2].map(() => layer())
  for (let i = 0; i < 45; i++) { const x = Math.floor(rnd() * COLS), y = Math.floor(rnd() * (HORIZON - 14)), c = px.get(x, y) ?? ''; if (!/^#(6c|84|4e)/.test(c)) stars[i % 3].set(x, y, i % 4 ? '#fff4e0' : '#ffd6ec') }
  // Snow drifting down.
  const snow = [0, 1, 2].map((k) => { const g = layer(); for (let i = 0; i < 40; i++) g.set(Math.floor(((i * 53 + 11) % 197)), (i * 13 + k * 3) % (ROWS - 4), '#ffffff'); return g })
  // The bay shimmering.
  const shimmer = [0, 1].map((k) => { const g = layer(); for (let y = HORIZON + 4; y < ICE - 1; y += 4) for (let x = (y * 3 + k * 6) % 17; x < COLS; x += 17) g.rect(x, y, 3, 1, '#5a8ac0'); return g })

  const show = (name, cycle, from, to) => `@keyframes ${name}{0%{opacity:${from === 0 ? 1 : 0}}${from ? `${((from / cycle) * 100).toFixed(3)}%{opacity:1}` : ''}${((to / cycle) * 100).toFixed(3)}%{opacity:0}}`
  const css =
    `@keyframes f2{0%{opacity:1}50%{opacity:0}}@keyframes f3{0%{opacity:1}33.333%{opacity:0}}@keyframes f4{0%{opacity:1}25%{opacity:0}}` +
    `@keyframes walk{0%{transform:translate(0,0)}100%{transform:translate(560px,0)}}` +
    `@keyframes slide{0%{transform:translate(-160px,0)}100%{transform:translate(1760px,0)}}` +
    fish.map((_, k) => show(`fish${k}`, 6, k * 0.2, (k + 1) * 0.2)).join('') + show('splash', 6, 1, 1.4)

  return svgDoc({
    defs: `<radialGradient id="sun"><stop offset="0" stop-color="#e8e0ff" stop-opacity=".5"/><stop offset="1" stop-color="#e8e0ff" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="warm"><stop offset="0" stop-color="#ffcf7a" stop-opacity=".45"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></radialGradient>`,
    css,
    body:
      px.svg(P) + `<circle cx="${158 * P}" cy="${18 * P}" r="160" fill="url(#sun)"/><circle cx="${(IX + 4) * P}" cy="${(IY + 8) * P}" r="150" fill="url(#warm)"/>` + frames(stars, 2.4) +
      frames(shimmer, 1.6) +
      fish.map((g, k) => `<g style="animation:fish${k} 6s steps(1,end) -1s infinite">${g.svg(P)}</g>`).join('') +
      `<g style="animation:splash 6s steps(1,end) -1s infinite">${splash.svg(P)}</g>` +
      fisher.svg(P) + frames(bob, 1.2) +
      frames(waver, 0.8) + frames(hops, 0.6) + frames(hearts, 4) +
      `<g style="animation:walk 14s steps(70,end) infinite alternate">${frames(waddle, 0.4)}</g>` +
      `<g style="animation:slide 24s steps(240,end) -10s infinite">${slide.svg(P)}</g>` +
      frames(snow, 1.5),
  })
}
