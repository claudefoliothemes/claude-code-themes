// A cozy pixel-art room at night with three pets: a ginger cat asleep on the sofa (tail swishing,
// little z's drifting up), a puppy on the rug wagging its tail by a bouncing ball, and a goldfish
// circling its bowl. Characters are outlined, shaded shapes on a 200 x 125 grid of 8-unit pixels.
// Every change lands on the shared 0.1 s tick.
import { H, W, rng, svgDoc } from './_lib.mjs'
import { pixelGrid } from './_pixel.mjs'

const P = 8, COLS = W / P, ROWS = H / P
const FLOOR = 92
const INK = '#2a1a24'

// Shapes with a one-pixel outline: draw the outline grown by one, then the fill.
const oEllipse = (px, cx, cy, rx, ry, fill) => { px.ellipse(cx, cy, rx + 1, ry + 1, INK); px.ellipse(cx, cy, rx, ry, fill) }
const oDisc = (px, cx, cy, r, fill) => { px.disc(cx, cy, r + 1, INK); px.disc(cx, cy, r, fill) }

export default function scene() {
  const rnd = rng(0x9e75)
  const px = pixelGrid(COLS, ROWS)

  // Room: wall, wainscot, floorboards, rug.
  px.gradient(0, FLOOR, ['#1c1830', '#221d3a', '#2a2346'])
  px.rect(0, FLOOR - 14, COLS, 1, '#3a3158'); px.rect(0, FLOOR - 13, COLS, 13, '#262040')
  for (let x = 0; x < COLS; x += 6) px.rect(x, FLOOR - 13, 1, 13, '#2e2750')
  px.rect(0, FLOOR, COLS, ROWS - FLOOR, '#4a3326')
  for (let y = FLOOR; y < ROWS; y += 4) px.rect(0, y, COLS, 1, '#3d2a20')
  for (let y = FLOOR; y < ROWS; y += 4) for (let x = (y / 4) % 2 ? 0 : 12; x < COLS; x += 24) px.rect(x, y, 1, 4, '#3d2a20')
  px.ellipse(40, 108, 34, 9, '#6b3f6b'); px.ellipse(40, 108, 30, 7, '#8a5a8a'); px.ellipse(40, 108, 22, 4, '#a070a0')

  // Window with the night outside.
  const WX = 8, WY = 14, WW = 40, WH = 36
  px.rect(WX - 2, WY - 2, WW + 4, WH + 4, '#3a2a40') // frame
  px.rect(WX, WY, WW, WH, '#0f1430'); px.rect(WX, WY + WH * 0.6, WW, WH * 0.4, '#16204a')
  px.disc(WX + 30, WY + 9, 4, '#f6e7c8'); px.disc(WX + 31, WY + 8, 3, '#fbf0d6')
  px.rect(WX + WW / 2 - 1, WY, 2, WH, '#3a2a40'); px.rect(WX, WY + WH / 2 - 1, WW, 2, '#3a2a40')
  px.rect(WX - 4, WY + WH + 2, WW + 8, 2, '#5a4060')
  // Curtains.
  for (let y = WY - 4; y < WY + WH + 6; y++) { px.rect(WX - 6 + ((y >> 2) % 2), y, 4, 1, '#8a3f5a'); px.rect(WX + WW + 2 - ((y >> 2) % 2), y, 4, 1, '#8a3f5a') }
  px.rect(WX - 8, WY - 6, WW + 16, 2, '#c9a35a')

  // Floor lamp by the window.
  px.rect(58, 40, 1, FLOOR - 40, '#3a3448'); px.rect(55, FLOOR - 1, 7, 1, '#3a3448')
  px.poly([[52, 40], [65, 40], [62, 32], [55, 32]], '#f0c87a'); px.rect(55, 32, 8, 1, '#c9a35a')

  // Sofa on the right, and a side table with the fishbowl.
  const SX = 140
  px.rect(SX, 62, 58, 16, '#4b5b8a'); px.rect(SX, 62, 58, 2, '#5d6fa3')
  px.rect(SX - 4, 70, 8, 22, '#3f4d78'); px.rect(SX + 54, 70, 8, 22, '#3f4d78')
  px.rect(SX + 2, 76, 54, 10, '#5d6fa3'); px.rect(SX + 2, 76, 54, 1, '#7084bd'); px.rect(SX + 28, 76, 1, 10, '#4b5b8a')
  px.rect(SX, 86, 58, 4, '#3f4d78'); px.rect(SX + 2, 90, 3, 2, '#2a2236'); px.rect(SX + 53, 90, 3, 2, '#2a2236')
  px.rect(118, 66, 16, 2, '#6b4a36'); px.rect(124, 68, 4, FLOOR - 68, '#5a3d2c'); px.rect(120, FLOOR - 1, 12, 1, '#5a3d2c')
  oDisc(px, 126, 58, 7, '#9fd8ff'); px.disc(126, 58, 7, '#7cc4f0'); px.rect(119, 52, 15, 2, '#c8ecff'); px.disc(123, 55, 1, '#e6f6ff')
  px.rect(122, 63, 8, 2, '#d9c08a')

  // The cat, asleep on the sofa cushion: curled body, head resting, ears, closed eyes, pink nose.
  const CX = 172, CY = 72
  oEllipse(px, CX, CY + 1, 11, 5, '#f0a04b')
  px.ellipse(CX + 1, CY + 3, 9, 2, '#d8873a')
  for (const dx of [-4, 0, 4]) px.rect(CX + dx, CY - 3, 1, 3, '#c9762f')
  oDisc(px, CX - 9, CY, 5, '#f0a04b')
  px.poly([[CX - 14, CY - 3], [CX - 13, CY - 9], [CX - 9, CY - 5]], INK); px.poly([[CX - 13, CY - 4], [CX - 12, CY - 7], [CX - 10, CY - 5]], '#f0a04b')
  px.poly([[CX - 8, CY - 5], [CX - 5, CY - 9], [CX - 4, CY - 3]], INK); px.poly([[CX - 7, CY - 5], [CX - 5, CY - 7], [CX - 5, CY - 4]], '#f0a04b')
  px.set(CX - 12, CY - 6, '#ff9fb4'); px.set(CX - 6, CY - 6, '#ff9fb4')
  px.ellipse(CX - 9, CY + 2, 3, 2, '#fff3e0')
  px.rect(CX - 12, CY, 2, 1, INK); px.rect(CX - 7, CY, 2, 1, INK)
  px.set(CX - 9, CY + 1, '#ff7a94')
  px.ellipse(CX + 6, CY + 5, 3, 1, '#fff3e0') // paw

  // The puppy, sitting on the rug: floppy ears, snout, tongue, front legs.
  const DX = 30, DY = 98
  oEllipse(px, DX, DY + 6, 7, 6, '#c8925c')
  px.ellipse(DX, DY + 8, 4, 4, '#f3e2c8')
  px.rect(DX - 4, DY + 10, 3, 4, INK); px.rect(DX - 3, DY + 10, 2, 4, '#c8925c'); px.rect(DX + 2, DY + 10, 3, 4, INK); px.rect(DX + 2, DY + 10, 2, 4, '#c8925c')
  oDisc(px, DX, DY - 4, 6, '#c8925c')
  oEllipse(px, DX - 6, DY - 3, 2, 4, '#7a5230'); oEllipse(px, DX + 6, DY - 3, 2, 4, '#7a5230')
  px.ellipse(DX, DY - 1, 3, 2, '#f3e2c8')
  px.rect(DX - 1, DY - 3, 3, 2, INK)
  px.rect(DX - 3, DY - 6, 2, 2, INK); px.rect(DX + 2, DY - 6, 2, 2, INK); px.set(DX - 3, DY - 6, '#ffffff'); px.set(DX + 2, DY - 6, '#ffffff')
  px.rect(DX, DY + 1, 1, 2, '#ff7a94')
  px.rect(DX - 2, DY + 2, 5, 1, '#d8402f'); px.set(DX, DY + 3, '#ffd166') // collar and tag

  // Moving layers.
  const layer = () => pixelGrid(COLS, ROWS)
  const frames = (grids, period) => grids.map((g, k) => `<g style="animation:f${grids.length} ${period}s steps(1,end) -${((k * period) / grids.length).toFixed(1)}s infinite">${g.svg(P)}</g>`).join('')
  // Cat tail, curled up then lifted, swishing slowly.
  const tail = [0, 1].map((k) => {
    const t = layer()
    const pts = k === 0 ? [[11, 0], [12, 2], [12, 4], [11, 6], [9, 7], [7, 7]] : [[11, 0], [13, -1], [15, -2], [16, -4], [16, -6], [15, -7]]
    // A thick stroke: an outlined 2 x 2 brush at each point, so the tail reads as one piece.
    for (const [x, y] of pts) t.rect(CX + x - 1, CY + y - 1, 4, 4, INK)
    for (const [x, y] of pts) t.rect(CX + x, CY + y, 2, 2, '#f0a04b')
    t.set(CX + pts[pts.length - 1][0], CY + pts[pts.length - 1][1], '#fff3e0')
    return t
  })
  // Little z's rising from the cat, one size at a time.
  const zees = [0, 1, 2].map((k) => {
    const z = layer(), s = [2, 2, 3][k], x0 = CX - 13 + k * 4, y0 = CY - 13 - k * 6
    for (let i = 0; i < 3 * s; i++) { z.set(x0 + i, y0, '#e6e1ff'); z.set(x0 + i, y0 + 3 * s - 1, '#e6e1ff'); z.set(x0 + 3 * s - 1 - i, y0 + i, '#e6e1ff') }
    return z
  })
  // Puppy tail wagging, and a ball bouncing beside the puppy.
  const wag = [0, 1].map((k) => { const t = layer(); const x = DX + 7, y = DY + 8; t.rect(x, y - 3, 3, 3, INK); t.rect(x + (k ? 2 : -1), y - 6, 3, 4, INK); t.rect(x + 1, y - 2, 1, 2, '#c8925c'); t.rect(x + (k ? 3 : 0), y - 5, 1, 3, '#c8925c'); return t })
  const ball = [0, 4, 6, 4].map((h) => { const b = layer(); const x = DX + 16, y = DY + 9 - h; b.disc(x, y, 3, INK); b.disc(x, y, 2, '#ff5a6e'); b.rect(x - 2, y, 5, 1, '#ffffff'); if (h === 0) b.rect(x - 3, y + 4, 7, 1, '#3d2a20'); return b })
  // Goldfish circling the bowl.
  const fish = [[-3, 0, 1], [0, -2, 1], [3, 0, -1], [0, 2, -1]].map(([x, y, dir]) => {
    const f = layer(), fx = 126 + x, fy = 59 + y
    f.rect(fx - 1, fy - 1, 3, 2, '#ff8a3c'); f.set(fx + dir * 2, fy - 1, '#ff8a3c'); f.set(fx - dir * 2, fy - 2, '#ffb36b'); f.set(fx - dir * 2, fy, '#ffb36b'); f.set(fx + dir, fy - 1, INK)
    return f
  })
  // Stars in the window.
  const stars = [0, 1, 2].map(() => layer())
  for (let i = 0; i < 24; i++) stars[i % 3].set(WX + 1 + Math.floor(rnd() * (WW - 2)), WY + 1 + Math.floor(rnd() * (WH * 0.55)), '#e9e4ff')

  return svgDoc({
    defs: `<radialGradient id="lamp"><stop offset="0" stop-color="#ffd27a" stop-opacity=".35"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>`,
    css:
      `@keyframes f2{0%{opacity:1}50%{opacity:0}}@keyframes f3{0%{opacity:1}33.333%{opacity:0}}@keyframes f4{0%{opacity:1}25%{opacity:0}}`,
    body:
      px.svg(P) + `<circle cx="${58 * P}" cy="${40 * P}" r="260" fill="url(#lamp)"/>` +
      frames(stars, 3.6) + frames(tail, 2.4) + frames(zees, 2.4) + frames(wag, 0.4) + frames(ball, 1.2) + frames(fish, 2),
  })
}
