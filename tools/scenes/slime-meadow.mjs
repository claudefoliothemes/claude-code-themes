// A moonlit pixel-art meadow full of round, squishy slimes in pastel colors. Each one hops on its
// own beat (squash, stretch, land) and blinks now and then, among flowers, glowing mushrooms, and
// fireflies. Original characters on a 200 x 125 grid of 8-unit pixels. Every change lands on the
// shared 0.1 s tick.
import { H, W, rng, svgDoc } from './_lib.mjs'
import { pixelGrid, shadedDisc } from './_pixel.mjs'

const P = 8, COLS = W / P, ROWS = H / P
const GROUND = 94
const INK = '#23182e'

// A slime body: a dome with flat-ish bottom, outlined, shaded, with a shine and a face.
// pose: 'rest' | 'squash' | 'stretch'; lift raises it off the ground; blink closes the eyes.
function slime(px, cx, base, size, [dark, body, light], pose, lift = 0, blink = false) {
  const rx = Math.round(size * (pose === 'squash' ? 1.25 : pose === 'stretch' ? 0.85 : 1))
  const ry = Math.round(size * (pose === 'squash' ? 0.7 : pose === 'stretch' ? 1.2 : 0.9))
  const cy = base - ry - lift
  const dome = (r, ry2, c) => {
    for (let y = -ry2; y <= Math.round(ry2 * 0.55); y++) {
      const w = Math.round(r * Math.sqrt(Math.max(0, 1 - (Math.min(0, y) ** 2) / (ry2 * ry2 + 0.5))) + (y > 0 ? -y * 0.35 : 0))
      px.rect(cx - w, cy + y, w * 2 + 1, 1, c)
    }
  }
  dome(rx + 1, ry + 1, INK)
  dome(rx, ry, body)
  px.rect(cx - rx + 1, cy + Math.round(ry * 0.35), rx * 2 - 1, Math.max(1, Math.round(ry * 0.2)), dark)
  px.rect(cx - Math.round(rx * 0.55), cy - Math.round(ry * 0.6), Math.max(2, Math.round(rx * 0.35)), 2, light)
  px.set(cx - Math.round(rx * 0.6), cy - Math.round(ry * 0.3), light)
  // Face.
  const ex = Math.max(2, Math.round(rx * 0.4)), ey = cy - Math.round(ry * 0.05)
  if (blink) { px.rect(cx - ex - 1, ey, 2, 1, INK); px.rect(cx + ex, ey, 2, 1, INK) }
  else { px.rect(cx - ex - 1, ey - 1, 2, 3, INK); px.rect(cx + ex, ey - 1, 2, 3, INK); px.set(cx - ex - 1, ey - 1, '#ffffff'); px.set(cx + ex, ey - 1, '#ffffff') }
  px.rect(cx - ex - 3, ey + 2, 2, 1, '#ff9fc4'); px.rect(cx + ex + 2, ey + 2, 2, 1, '#ff9fc4')
  px.rect(cx - 1, ey + 2, 3, 1, INK); px.set(cx, ey + 3, INK)
  // Shadow on the grass when it's in the air.
  if (lift > 0) px.rect(cx - rx + 2, base, rx * 2 - 3, 1, '#1a2a2a')
}

export default function scene() {
  const rnd = rng(0x511e)
  const px = pixelGrid(COLS, ROWS)

  // Sky, moon, soft hills.
  px.gradient(0, GROUND, ['#0d0b24', '#16143a', '#22205a', '#33306f', '#4a4585'])
  px.disc(160, 20, 8, '#3d3a7a'); px.disc(160, 20, 7, '#f6eccf'); px.disc(161, 19, 5, '#fff7e0')
  for (let x = 0; x < COLS; x++) {
    const h1 = Math.round(14 + Math.sin(x / 16) * 5 + Math.sin(x / 7) * 2), h2 = Math.round(8 + Math.sin(x / 11 + 2) * 4)
    px.rect(x, GROUND - h1, 1, h1, '#24405a'); px.rect(x, GROUND - h2, 1, h2, '#2c5a5a')
  }
  // Meadow: grass with lighter tufts, then flowers.
  px.rect(0, GROUND, COLS, ROWS - GROUND, '#2f6b4f')
  for (let y = GROUND; y < ROWS; y += 3) for (let x = (y % 2) * 3; x < COLS; x += 7) px.rect(x, y, 1, 2, '#3b8060')
  px.rect(0, GROUND, COLS, 1, '#4a9a6e')
  const FLOWER = ['#ff9fc4', '#ffd166', '#b8a6ff', '#ffffff']
  for (let i = 0; i < 40; i++) {
    const x = Math.floor(rnd() * COLS), y = GROUND + 4 + Math.floor(rnd() * (ROWS - GROUND - 6)), c = FLOWER[i % 4]
    px.rect(x, y, 1, 2, '#245a3e'); px.set(x - 1, y - 1, c); px.set(x + 1, y - 1, c); px.set(x, y - 2, c); px.set(x, y - 1, '#ffd166')
  }
  // Glowing mushrooms (the glow is drawn over the grid).
  const shroom = (x, y, cap) => { px.rect(x - 1, y - 3, 3, 3, '#efe6d0'); px.ellipse(x, y - 4, 3, 2, INK); px.ellipse(x, y - 4, 2, 1, cap); px.set(x - 1, y - 5, '#ffffff') }
  const SHROOMS = [[8, 108, '#ff6b9e'], [14, 112, '#6fe8d8'], [188, 106, '#b8a6ff'], [194, 112, '#ff6b9e'], [178, 116, '#6fe8d8']]
  for (const [x, y, c] of SHROOMS) shroom(x, y, c)
  // A little tree on the right.
  px.rect(176, GROUND - 26, 3, 26, '#3a2a30')
  for (const [x, y, r] of [[170, GROUND - 30, 6], [182, GROUND - 32, 7], [176, GROUND - 38, 6]]) shadedDisc(px, x, y, r, ['#1f4a3a', '#2d6a4e', '#4a9a6e'])

  // The slimes: each has four frames (rest, squash, stretch in the air, land) and blinks on the
  // rest frame of one cycle in four.
  const layer = () => pixelGrid(COLS, ROWS)
  const SLIMES = [
    { x: 26, base: 104, size: 7, colors: ['#3fae8a', '#6fe8b8', '#c8ffe8'], period: 1.6, delay: 0 },
    { x: 46, base: 112, size: 5, colors: ['#d0628f', '#ff9fc4', '#ffe0ee'], period: 1.2, delay: 0.3 },
    { x: 162, base: 108, size: 8, colors: ['#7a68d0', '#b8a6ff', '#ece6ff'], period: 2, delay: 0.5 },
    { x: 186, base: 118, size: 4, colors: ['#4a8ad0', '#8ec5ff', '#e2f0ff'], period: 1.2, delay: 0.6 },
  ]
  const POSES = [['rest', 0], ['squash', 0], ['stretch', 3], ['squash', 0]]
  let slimes = ''
  for (const s of SLIMES) {
    const grids = POSES.map(([pose, lift]) => { const g = layer(); slime(g, s.x, s.base, s.size, s.colors, pose, lift * Math.ceil(s.size / 3)); return g })
    slimes += grids.map((g, k) => `<g style="animation:f4 ${s.period}s steps(1,end) -${(s.delay + (k * s.period) / 4).toFixed(1)}s infinite">${g.svg(P)}</g>`).join('')
  }
  // Blinks: a closed-eye rest pose shown briefly on top every few seconds.
  let blinks = ''
  for (const [i, s] of SLIMES.entries()) {
    const g = layer(); slime(g, s.x, s.base, s.size, s.colors, 'rest', 0, true)
    blinks += `<g style="animation:blink ${[4, 5, 6, 4.5][i]}s steps(1,end) -${i}s infinite">${g.svg(P)}</g>`
  }
  // Fireflies and stars.
  const flies = [0, 1, 2].map(() => layer())
  for (let i = 0; i < 24; i++) flies[i % 3].set(Math.floor(rnd() * COLS), GROUND - 24 + Math.floor(rnd() * 40), '#fff3a0')
  const stars = [0, 1, 2].map(() => layer())
  for (let i = 0; i < 50; i++) stars[i % 3].set(Math.floor(rnd() * COLS), Math.floor(rnd() * 50), '#e9e4ff')
  const frames = (grids, period) => grids.map((g, k) => `<g style="animation:f3 ${period}s steps(1,end) -${((k * period) / 3).toFixed(1)}s infinite">${g.svg(P)}</g>`).join('')

  return svgDoc({
    defs: `<radialGradient id="glow"><stop offset="0" stop-color="#b8fff0" stop-opacity=".35"/><stop offset="1" stop-color="#b8fff0" stop-opacity="0"/></radialGradient>`,
    css:
      `@keyframes f3{0%{opacity:1}33.333%{opacity:0}}@keyframes f4{0%{opacity:1}25%{opacity:0}}` +
      `@keyframes blink{0%{opacity:0}90%{opacity:1}95%{opacity:0}}`,
    body:
      px.svg(P) + SHROOMS.map(([x, y]) => `<circle cx="${x * P}" cy="${(y - 4) * P}" r="60" fill="url(#glow)"/>`).join('') +
      frames(stars, 3.6) + frames(flies, 1.2) + slimes + blinks,
  })
}
