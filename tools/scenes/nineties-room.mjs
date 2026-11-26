// A 90s bedroom at night in pixel art: Memphis-pattern wallpaper, a chunky CRT TV playing a
// made-up side-scroller on a generic 16-bit console with a corded controller, a beige tower PC
// under a CRT monitor running a starfield screensaver, VHS tapes, floppy disks, a boombox, a
// bubbling lava lamp, a poster, a bean bag, speckled carpet, and glow-in-the-dark stars on the
// ceiling. Original art on a 200 x 125 grid of 8-unit pixels. Every change lands on the 0.1 s tick.
import { H, W, rng, svgDoc } from './_lib.mjs'
import { pixelGrid } from './_pixel.mjs'

const P = 8, COLS = W / P, ROWS = H / P
const FLOOR = 100
const INK = '#14101c'

export default function scene() {
  const rnd = rng(0x1990)
  const px = pixelGrid(COLS, ROWS)
  const layer = () => pixelGrid(COLS, ROWS)
  const frames = (grids, period) => grids.map((g, k) => `<g style="animation:f${grids.length} ${period}s steps(1,end) -${((k * period) / grids.length).toFixed(1)}s infinite">${g.svg(P)}</g>`).join('')

  // Wall with a Memphis pattern: squiggles, triangles, dots, and zigzags in muted 90s colors.
  px.rect(0, 0, COLS, FLOOR, '#251c3e')
  const SHAPES = ['#33506a', '#5a2e5a', '#5a5230', '#2e5a52']
  for (let i = 0; i < 70; i++) {
    const x = Math.floor(rnd() * COLS), y = 4 + Math.floor(rnd() * (FLOOR - 14)), c = SHAPES[i % 4], kind = i % 4
    if (kind === 0) for (let j = 0; j < 7; j++) px.set(x + j, y + (j % 2), c)
    else if (kind === 1) { px.set(x + 1, y, c); px.rect(x, y + 1, 3, 1, c) }
    else if (kind === 2) px.rect(x, y, 2, 2, c)
    else for (let j = 0; j < 4; j++) px.set(x + j, y + Math.abs((j % 2) - 1), c)
  }
  px.rect(0, FLOOR - 4, COLS, 4, '#3a2e4e'); px.rect(0, FLOOR - 4, COLS, 1, '#4a3e62')
  // Speckled carpet.
  px.rect(0, FLOOR, COLS, ROWS - FLOOR, '#2c2440')
  const SPECK = ['#5a3a6a', '#2e5a6a', '#6a5a2a', '#4a2a3a']
  for (let i = 0; i < 260; i++) px.set(Math.floor(rnd() * COLS), FLOOR + 1 + Math.floor(rnd() * (ROWS - FLOOR - 1)), SPECK[i % 4])

  // (The poster is drawn last, below, so nothing paints over it.)
  // Desk on the left with a beige PC tower, CRT monitor, keyboard, mouse, and floppies.
  px.rect(2, 82, 70, 4, '#6a4a38'); px.rect(2, 82, 70, 1, '#8a6a50'); px.rect(4, 86, 3, FLOOR - 86 + 6, '#4a3428'); px.rect(66, 86, 3, FLOOR - 86 + 6, '#4a3428')
  const TX = 8
  px.rect(TX, 54, 14, 28, '#d8ccb0'); px.rect(TX, 54, 14, 1, '#ece4cc'); px.rect(TX + 13, 55, 1, 27, '#b8ac90')
  for (const y of [58, 63]) { px.rect(TX + 2, y, 10, 3, '#c4b898'); px.rect(TX + 3, y + 1, 8, 1, '#8a8070') }
  px.rect(TX + 2, 68, 6, 1, '#3a342c'); px.rect(TX + 3, 75, 3, 3, '#c4b898'); px.set(TX + 4, 76, '#6a6458')
  const MX = 26, MY = 52
  px.rect(MX, MY, 32, 26, '#d8ccb0'); px.rect(MX, MY, 32, 1, '#ece4cc'); px.rect(MX + 31, MY + 1, 1, 25, '#b8ac90')
  px.rect(MX + 3, MY + 3, 26, 18, '#1a1a24'); px.rect(MX + 4, MY + 4, 24, 16, '#06060e')
  px.rect(MX + 10, MY + 26, 12, 3, '#c4b898'); px.rect(MX + 6, MY + 29, 20, 2, '#d8ccb0')
  px.set(MX + 27, MY + 23, '#5aff7a'); px.rect(MX + 4, MY + 22, 6, 1, '#b8ac90')
  px.rect(28, 79, 26, 3, '#e8dcc0'); for (let x = 29; x < 53; x += 2) px.set(x, 80, '#b8ac90')
  px.rect(57, 79, 3, 3, '#e8dcc0'); px.set(58, 78, '#8a8070')
  for (const [x, c] of [[62, '#3a3a4a'], [64, '#4a6ab0'], [66, '#b03a4a']]) { px.rect(x, 78, 4, 4, c); px.rect(x + 1, 78, 2, 1, '#c8c8d0') }

  // The TV on a wood-grain stand, the console and VHS tapes on the shelf, the controller on the floor.
  const SX = 104
  px.rect(SX, 88, 70, 12, '#7a5236'); px.rect(SX, 88, 70, 1, '#a07048'); for (let y = 90; y < 100; y += 3) px.rect(SX, y, 70, 1, '#6a4428')
  px.rect(SX + 2, 92, 66, 7, '#3a2a20')
  const VX = 112, VY = 48
  px.rect(VX, VY, 52, 40, '#2e2c34'); px.rect(VX, VY, 52, 1, '#4a4852'); px.rect(VX + 51, VY + 1, 1, 39, '#1e1c24')
  px.rect(VX + 4, VY + 4, 36, 30, '#0e0e16'); px.rect(VX + 5, VY + 5, 34, 28, '#1e2a50')
  px.rect(VX + 43, VY + 6, 5, 5, '#4a4852'); px.set(VX + 45, VY + 8, '#2e2c34'); px.rect(VX + 43, VY + 14, 5, 5, '#4a4852'); px.set(VX + 45, VY + 16, '#2e2c34')
  for (let y = VY + 22; y < VY + 34; y += 2) px.rect(VX + 42, y, 7, 1, '#1e1c24')
  px.set(VX + 46, VY + 36, '#ff3a3a')
  for (let i = 0; i < 12; i++) { px.set(VX + 16 - i, VY - 1 - i, '#8a8a9a'); px.set(VX + 30 + i, VY - 1 - i, '#8a8a9a') }
  px.rect(VX + 14, VY - 2, 18, 2, '#4a4852')
  // Game cartridges and VHS tapes on the stand's shelf.
  for (const [x, label] of [[SX + 6, '#e85a8a'], [SX + 13, '#5ad0e0'], [SX + 20, '#f0c040']]) { px.rect(x, 92, 6, 7, '#9a98a2'); px.rect(x, 92, 6, 1, '#b8b6be'); px.rect(x + 1, 94, 4, 3, label) }
  for (const [x, c] of [[SX + 34, '#1a1a24'], [SX + 39, '#3a3a4a'], [SX + 44, '#1a1a24']]) { px.rect(x, 91, 4, 8, c); px.rect(x + 1, 92, 2, 2, '#e8e0d0') }
  // The console on the carpet: a boxy light-gray body with a darker top deck, purple power and reset
  // sliders, an eject lever, a cartridge plugged in, and two controller ports.
  const CX = 114, CY = 104
  px.rect(CX, CY, 30, 8, '#cdcbd2'); px.rect(CX, CY + 7, 30, 1, '#a8a6ae'); px.rect(CX, CY + 3, 30, 1, '#b8b6be'); px.rect(CX, CY + 5, 30, 1, '#bcbac2')
  px.rect(CX + 2, CY - 3, 26, 3, '#b4b2ba'); px.rect(CX + 2, CY - 3, 26, 1, '#c8c6ce')
  px.rect(CX + 9, CY - 4, 12, 1, '#5a5862'); px.rect(CX + 10, CY - 9, 10, 5, '#a2a0aa'); px.rect(CX + 10, CY - 9, 10, 1, '#c0bec8'); px.rect(CX + 11, CY - 8, 8, 3, '#e85a8a'); px.rect(CX + 12, CY - 7, 6, 1, '#ffd0e0')
  px.rect(CX + 4, CY - 2, 3, 1, '#6a5aa8'); px.rect(CX + 23, CY - 2, 3, 1, '#6a5aa8'); px.rect(CX + 13, CY - 1, 4, 1, '#8a7ac8')
  px.set(CX + 5, CY + 1, '#ff3a3a')
  px.rect(CX + 3, CY + 4, 3, 2, '#3a3842'); px.rect(CX + 8, CY + 4, 3, 2, '#3a3842')
  // Two controllers: the dog-bone shape, a D-pad, start and select, and four colored buttons in a diamond.
  const pad = (cx, cy) => {
    px.ellipse(cx - 5, cy, 4, 3, '#a8a6ae'); px.ellipse(cx + 5, cy, 4, 3, '#a8a6ae'); px.rect(cx - 5, cy - 3, 10, 7, '#a8a6ae')
    px.ellipse(cx - 5, cy, 3, 2, '#d0ced6'); px.ellipse(cx + 5, cy, 3, 2, '#d0ced6'); px.rect(cx - 5, cy - 2, 10, 5, '#d0ced6')
    px.rect(cx - 7, cy - 3, 4, 1, '#8a8892'); px.rect(cx + 4, cy - 3, 4, 1, '#8a8892')
    px.rect(cx - 7, cy, 3, 1, '#2a2832'); px.rect(cx - 6, cy - 1, 1, 3, '#2a2832')
    px.set(cx - 1, cy + 1, '#6a6872'); px.set(cx + 1, cy + 1, '#6a6872')
    px.set(cx + 5, cy - 1, '#3a5ae0'); px.set(cx + 6, cy, '#e04a4a'); px.set(cx + 5, cy + 1, '#f0c040'); px.set(cx + 4, cy, '#3ab05a')
  }
  pad(160, 114); pad(104, 118)
  // Cords from the controllers to the ports.
  for (let x = CX + 11; x <= 156; x++) px.set(x, Math.round(CY + 6 + (x - CX - 11) * 0.12 + Math.sin((x - CX) / 6) * 1.2), '#5a5866')
  for (let x = 108; x <= CX + 3; x++) px.set(x, Math.round(CY + 6 + (CX + 3 - x) * 0.6), '#5a5866')
  // The bean bag and a boombox with tapes.
  px.ellipse(88, 112, 13, 8, '#3a2050'); px.ellipse(88, 113, 12, 7, '#6a3a8a'); px.ellipse(85, 110, 6, 3, '#8a5aaa')
  px.rect(20, 104, 26, 12, '#3a3a44'); px.rect(20, 104, 26, 1, '#5a5a66'); px.disc(26, 110, 4, '#1a1a22'); px.disc(26, 110, 2, '#4a4a56'); px.disc(40, 110, 4, '#1a1a22'); px.disc(40, 110, 2, '#4a4a56')
  px.rect(30, 106, 6, 3, '#8ad8ff'); px.rect(22, 101, 22, 1, '#8a8a96'); px.rect(22, 101, 1, 3, '#8a8a96'); px.rect(43, 101, 1, 3, '#8a8a96')
  for (const [x, c] of [[50, '#e05a8a'], [56, '#5ad0e0']]) { px.rect(x, 112, 5, 3, c); px.rect(x + 1, 113, 3, 1, '#2a2a34') }
  // The lava lamp on a little table, right.
  px.rect(178, 92, 18, 3, '#4a3428'); px.rect(180, 95, 2, 5, '#3a2a20'); px.rect(192, 95, 2, 5, '#3a2a20')
  px.poly([[183, 92], [191, 92], [189, 86], [185, 86]], '#8a8a9a'); px.poly([[184, 86], [190, 86], [189, 66], [185, 66]], '#3a1a3a'); px.poly([[185, 66], [189, 66], [188, 62], [186, 62]], '#8a8a9a')
  // Glow-in-the-dark stars on the ceiling are on a layer; a desk lamp would wash out the CRTs, so the
  // room is lit by the screens.

  // A poster: sunset over the sea with a leaping dolphin, very 90s.
  for (let y = 11; y < 41; y++) for (let x = 169; x < 193; x++) {
    const t = (y - 11) / 19
    px.set(x, y, y < 30 ? (t < 0.25 ? '#3a2a6a' : t < 0.5 ? '#8a3a7a' : t < 0.75 ? '#e0607a' : '#ffa86a') : '#2a4a8a')
  }
  px.disc(181, 29, 4, '#ffd27a'); px.rect(169, 30, 24, 1, '#ffb070')
  for (let y = 31; y < 41; y += 2) px.rect(170 + (y % 4), y, 20, 1, '#3a6aaa')
  for (const [dx, dy] of [[0, 0], [1, -1], [2, -2], [3, -2], [4, -2], [5, -1], [6, 0], [7, 1], [2, -1], [3, -1], [4, -1], [-1, 1]]) px.set(174 + dx, 26 + dy, '#9ac0e0')
  px.rect(168, 10, 26, 1, '#e8e0d8'); px.rect(168, 41, 26, 1, '#e8e0d8'); px.rect(168, 10, 1, 32, '#e8e0d8'); px.rect(193, 10, 1, 32, '#e8e0d8')
  px.set(180, 9, '#c8c0b8')

  // Moving layers.
  // The TV game: a little hero running over scrolling ground, a coin bobbing, clouds drifting.
  const SCR = [VX + 5, VY + 5, 34, 28]
  const game = [0, 1, 2, 3].map((k) => {
    const g = layer(), [x0, y0, w, h] = SCR
    for (let y = y0; y < y0 + h - 7; y++) g.rect(x0, y, w, 1, y < y0 + 8 ? '#5a8af0' : '#7aa8f8')
    for (const cx of [x0 + 6 - k * 2, x0 + 26 - k * 2]) { const c = ((cx - x0) % w + w) % w + x0; g.rect(c, y0 + 4, 5, 2, '#ffffff'); g.rect(c + 1, y0 + 3, 3, 1, '#ffffff') }
    g.rect(x0, y0 + h - 7, w, 7, '#8a5a2a'); g.rect(x0, y0 + h - 7, w, 2, '#5ac05a')
    for (let x = x0 + ((k * 3) % 6); x < x0 + w; x += 6) g.rect(x, y0 + h - 4, 2, 2, '#6a4220')
    g.rect(x0 + 22, y0 + h - 14, 6, 3, '#7a4ad0'); g.rect(x0 + 22, y0 + h - 14, 6, 1, '#a87af0')
    g.disc(x0 + 25, y0 + h - 18 - (k % 2), 1, '#ffd23a')
    const hx = x0 + 9, hy = y0 + h - 7
    g.rect(hx, hy - 7, 4, 1, '#2a1a1a'); g.rect(hx, hy - 6, 4, 2, '#ffd8b0'); g.set(hx + 2, hy - 6, '#2a1a1a'); g.rect(hx, hy - 4, 4, 2, '#3ad8c0'); g.rect(hx, hy - 2, 4, 1, '#7a4ae0'); g.set(hx - 1, hy - 4, '#ff7ac0')
    if (k % 2) { g.set(hx, hy - 1, '#6a3a20'); g.set(hx + 3, hy - 1, '#6a3a20') } else { g.set(hx + 1, hy - 1, '#6a3a20'); g.set(hx + 2, hy - 1, '#6a3a20') }
    return g
  })
  // The PC screensaver: stars streaming out from the center.
  const MS = [MX + 4, MY + 4, 24, 16]
  const stars = [0, 1, 2].map((k) => {
    const g = layer(), [x0, y0, w, h] = MS, cx = x0 + w / 2, cy = y0 + h / 2
    for (let i = 0; i < 18; i++) {
      const a = i * 2.39, r = ((i * 3 + k * 3) % 12) + 1, x = Math.round(cx + Math.cos(a) * r * 1.1), y = Math.round(cy + Math.sin(a) * r * 0.7)
      if (x >= x0 && x < x0 + w && y >= y0 && y < y0 + h) g.set(x, y, r > 8 ? '#ffffff' : '#8a8ab8')
    }
    return g
  })
  // The PC's drive light blinking, the lava lamp's blobs rising, glow stars on the ceiling.
  const drive = layer(); drive.set(TX + 4, 70, '#ffb020')
  const lava = [0, 1, 2].map((k) => {
    const g = layer()
    g.rect(185, 83, 5, 3, '#ff6a3a'); g.rect(186, 82, 3, 1, '#ff6a3a')
    for (const [x, y, big] of [[186, 78 - k * 4, true], [187, 70 + k * 3, false], [186, 74 - ((k * 5) % 9), false]]) { if (big) { g.rect(x, y, 3, 3, '#ff6a3a'); g.set(x + 1, y - 1, '#ff6a3a'); g.set(x, y, '#ffa060') } else { g.rect(x, y, 2, 2, '#ff6a3a'); g.set(x, y, '#ffa060') } }
    return g
  })
  const glow = [0, 1].map(() => layer())
  for (let i = 0; i < 18; i++) { const x = Math.floor(rnd() * COLS), y = 1 + Math.floor(rnd() * 8), g = glow[i % 2]; g.set(x, y, '#c8ff8a'); if (i % 3 === 0) { g.set(x - 1, y, '#8acf6a'); g.set(x + 1, y, '#8acf6a'); g.set(x, y - 1, '#8acf6a'); g.set(x, y + 1, '#8acf6a') } }

  return svgDoc({
    defs:
      `<radialGradient id="tv"><stop offset="0" stop-color="#5a8af0" stop-opacity=".32"/><stop offset="1" stop-color="#5a8af0" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="pc"><stop offset="0" stop-color="#8a8ab8" stop-opacity=".22"/><stop offset="1" stop-color="#8a8ab8" stop-opacity="0"/></radialGradient>` +
      `<pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1.5" fill="#000000" fill-opacity=".28"/></pattern>` +
      `<radialGradient id="lamp"><stop offset="0" stop-color="#ff6a3a" stop-opacity=".35"/><stop offset="1" stop-color="#ff6a3a" stop-opacity="0"/></radialGradient>`,
    css:
      `@keyframes f2{0%{opacity:1}50%{opacity:0}}@keyframes f3{0%{opacity:1}33.333%{opacity:0}}@keyframes f4{0%{opacity:1}25%{opacity:0}}` +
      `@keyframes blink{0%{opacity:1}30%{opacity:0}40%{opacity:1}50%{opacity:0}}`,
    body:
      px.svg(P) +
      `<circle cx="${(VX + 22) * P}" cy="${(VY + 19) * P}" r="420" fill="url(#tv)"/><circle cx="${(MX + 16) * P}" cy="${(MY + 12) * P}" r="260" fill="url(#pc)"/><circle cx="${187 * P}" cy="${78 * P}" r="160" fill="url(#lamp)"/>` +
      frames(game, 0.8) + frames(stars, 0.6) + frames(lava, 2.4) + frames(glow, 3) +
      `<rect x="${SCR[0] * P}" y="${SCR[1] * P}" width="${SCR[2] * P}" height="${SCR[3] * P}" fill="url(#scan)"/><rect x="${MS[0] * P}" y="${MS[1] * P}" width="${MS[2] * P}" height="${MS[3] * P}" fill="url(#scan)"/>` +
      `<g style="animation:blink 2s steps(1,end) infinite">${drive.svg(P)}</g>`,
  })
}
