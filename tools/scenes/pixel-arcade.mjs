// A pixel-art arcade at night: cabinets with chasing marquee lights and screens playing made-up
// games (a paddle rally, falling stars, a racer's road, bouncing squares), a claw machine whose
// claw drops and rises, neon shapes on the wall, and a patterned carpet. Drawn on a 10-unit pixel
// grid, one path per color per layer. Every change lands on the shared 0.1 s tick.
import { H, W, rng, svgDoc } from './_lib.mjs'

const P = 10
const FLOOR = 82 // in pixels

const canvas = () => {
  const cells = new Map()
  const rect = (color, x, y, w = 1, h = 1) => {
    if (w <= 0 || h <= 0) return
    if (!cells.has(color)) cells.set(color, [])
    cells.get(color).push(`M${x * P} ${y * P}h${w * P}v${h * P}h-${w * P}Z`)
  }
  const svg = () => [...cells].map(([c, d]) => `<path d="${d.join('')}" fill="${c}"/>`).join('')
  return { rect, svg }
}
// Show one of n frames at a time, each for period / n seconds.
const frames = (layers, period) => layers.map((c, k) => `<g style="animation:f${layers.length} ${period}s steps(1,end) -${(k * period / layers.length).toFixed(1)}s infinite">${c.svg()}</g>`).join('')

export default function scene() {
  const rnd = rng(0xa4cade)
  const room = canvas()

  // Walls, a skirting stripe, and carpet with scattered bright specks.
  room.rect('#120d1f', 0, 0, W / P, FLOOR)
  room.rect('#2b1d45', 0, FLOOR - 2, W / P, 2)
  room.rect('#1d1230', 0, FLOOR, W / P, H / P - FLOOR)
  const SPECK = ['#3ff2c6', '#ff4fa3', '#ffd36b', '#7f8cff']
  for (let i = 0; i < 70; i++) room.rect(SPECK[i % 4], Math.floor(rnd() * (W / P)), FLOOR + 1 + Math.floor(rnd() * (H / P - FLOOR - 1)))

  // Layers draw in this order: room, bodies, panels, buttons. Within a layer each color is one
  // path drawn in first-use order, so anything that sits on top of another shape goes in a
  // later layer, never in the same one.
  const bodies = canvas(), panels = canvas(), buttons = canvas()

  // Cabinets: body, marquee band, screen bezel, control panel, buttons.
  const CABS = [[3, '#c2364b'], [25, '#2f6fd1'], [117, '#7a3fc0'], [139, '#1f9a86']]
  const marquee = [canvas(), canvas(), canvas()]
  for (const [x, body] of CABS) {
    bodies.rect(body, x, 40, 18, FLOOR - 40)
    panels.rect('#0b0812', x + 2, 48, 14, 14)
    panels.rect('#2a2236', x + 1, 64, 16, 4)
    panels.rect('#0b0812', x, 40, 18, 6)
    buttons.rect('#ffd36b', x + 4, 65, 2, 2); buttons.rect('#ff4fa3', x + 8, 65, 2, 2); buttons.rect('#3ff2c6', x + 12, 65, 2, 2)
    for (let i = 0; i < 8; i++) marquee[i % 3].rect(SPECK[(i + x) % 4], x + 1 + i * 2, 42, 1, 2)
  }

  // Screens, each its own little game with a few frames.
  const screenAt = (x) => ({ x: x + 3, y: 49 }) // 12 x 12 inside the bezel
  const games = []
  {
    // Paddle rally: two paddles and a ball moving between them.
    const { x, y } = screenAt(3)
    games.push(frames([[2, 3], [5, 5], [8, 7], [5, 9]].map(([bx, by], k) => {
      const c = canvas(); c.rect('#e8f0ff', x, y + 2 + (k % 2), 1, 4); c.rect('#e8f0ff', x + 11, y + 5 - (k % 2), 1, 4); c.rect('#ffd36b', x + bx, y + by); return c
    }), 0.8))
  }
  {
    // Falling stars: three drops of light at different heights.
    const { x, y } = screenAt(25)
    games.push(frames([0, 1, 2, 3].map((k) => {
      const c = canvas(); for (const [cx, off] of [[2, 0], [6, 4], [9, 7]]) c.rect('#7fd6ff', x + cx, y + ((off + k * 3) % 12)); c.rect('#3ff2c6', x + 4, y + 11, 4, 1); return c
    }), 0.8))
  }
  {
    // Racer: road edges sliding down past a little car.
    const { x, y } = screenAt(117)
    games.push(frames([0, 1, 2].map((k) => {
      const c = canvas(); for (let r = 0; r < 12; r++) if ((r + k) % 3 === 0) { c.rect('#ffffff', x + 1, y + r); c.rect('#ffffff', x + 10, y + r) }
      c.rect('#ff4fa3', x + 5, y + 8, 2, 3); return c
    }), 0.6))
  }
  {
    // Bouncing squares: two blocks trading corners.
    const { x, y } = screenAt(139)
    games.push(frames([[1, 1, 8, 8], [4, 2, 5, 7], [8, 4, 1, 5], [5, 7, 4, 2]].map(([ax, ay, bx, by]) => {
      const c = canvas(); c.rect('#ffd36b', x + ax, y + ay, 3, 3); c.rect('#a98bff', x + bx, y + by, 3, 3); return c
    }), 1.2))
  }

  // Claw machine on the right of the chat column: glass case, prizes, and a claw on a cable.
  const CX = 98
  bodies.rect('#ff4fa3', CX, 36, 16, FLOOR - 36); panels.rect('#0e1424', CX + 1, 40, 14, 26); panels.rect('#2a2236', CX + 1, 66, 14, 4)
  for (const [px, c] of [[2, '#ffd36b'], [5, '#3ff2c6'], [8, '#7f8cff'], [11, '#ff8fb1']]) buttons.rect(c, CX + px, 62, 2, 4)
  const claw = [0, 3, 6, 9, 6, 3].map((drop) => {
    const c = canvas(); c.rect('#9aa3b5', CX + 7, 40, 1, 2 + drop); c.rect('#cfd3e0', CX + 6, 42 + drop, 3, 1); c.rect('#cfd3e0', CX + 6, 43 + drop); c.rect('#cfd3e0', CX + 8, 43 + drop); return c
  })
  const clawAnim = claw.map((c, k) => `<g style="animation:f6 3.6s steps(1,end) -${(k * 0.6).toFixed(1)}s infinite">${c.svg()}</g>`).join('')

  // Neon shapes on the wall: a star and a zigzag, each flickering on its own beat.
  const star = canvas(), zig = canvas()
  for (const [x, y] of [[62, 10], [61, 11], [62, 11], [63, 11], [60, 12], [61, 12], [62, 12], [63, 12], [64, 12], [61, 13], [63, 13]]) star.rect('#ffd36b', x, y)
  for (let i = 0; i < 12; i++) zig.rect('#3ff2c6', 70 + i, 12 + (i % 2))

  return svgDoc({
    defs: `<radialGradient id="glow"><stop offset="0" stop-color="#7f8cff" stop-opacity=".18"/><stop offset="1" stop-color="#7f8cff" stop-opacity="0"/></radialGradient>`,
    css:
      `@keyframes f3{0%{opacity:1}33.333%{opacity:0}}` +
      `@keyframes f4{0%{opacity:1}25%{opacity:0}}` +
      `@keyframes f6{0%{opacity:1}16.667%{opacity:0}}` +
      `@keyframes buzz{0%{opacity:1}90%{opacity:.3}95%{opacity:1}}`,
    body:
      room.svg() + bodies.svg() + panels.svg() + buttons.svg() +
      CABS.map(([x]) => `<circle cx="${(x + 9) * P}" cy="${55 * P}" r="240" fill="url(#glow)"/>`).join('') +
      frames(marquee, 0.6) + games.join('') + clawAnim +
      `<g style="animation:buzz 4s steps(1,end) infinite">${star.svg()}</g>` +
      `<g style="animation:buzz 6s steps(1,end) -2s infinite">${zig.svg()}</g>`,
  })
}
