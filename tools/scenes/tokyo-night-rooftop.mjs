// A rainy Tokyo rooftop at night in Tokyo Night colors: a hooded coder sits under a dripping awning
// with a laptop full of scrolling code, string lights glow overhead, a vending machine hums, the
// skyline flickers with neon signs, a lattice tower blinks, a train slides along the elevated
// track, rain falls, and puddles ripple with neon reflections.
// Palette from enkia/tokyo-night-vscode-theme (MIT). Original art on a 200 x 125 grid of 8-unit
// pixels. Every change lands on the shared 0.1 s tick.
import { H, W, rng, svgDoc } from './_lib.mjs'
import { pixelGrid, stamp } from './_pixel.mjs'

const P = 8, COLS = W / P, ROWS = H / P
const TN = {
  bg: '#1a1b26', bgDark: '#16161e', bgHi: '#292e42', storm: '#24283b', night: '#1f2335', termBlack: '#414868', fg: '#c0caf5', fgDark: '#a9b1d6',
  comment: '#565f89', dark3: '#545c7e', dark5: '#737aa2', blue0: '#3d59a1', blue: '#7aa2f7', cyan: '#7dcfff', blue1: '#2ac3de', blue5: '#89ddff',
  blue7: '#394b70', magenta: '#bb9af7', magenta2: '#ff007c', purple: '#9d7cd8', orange: '#ff9e64', yellow: '#e0af68', green: '#9ece6a',
  green1: '#73daca', teal: '#1abc9c', red: '#f7768e', red1: '#db4b4b',
}
const NEON = [TN.magenta, TN.cyan, TN.orange, TN.green1, TN.red, TN.blue, TN.yellow]
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('')

export default function scene() {
  const rnd = rng(0x70c1)
  const px = pixelGrid(COLS, ROWS)
  const layer = () => pixelGrid(COLS, ROWS)
  const frames = (grids, period) => grids.map((g, k) => `<g style="animation:f${grids.length} ${period}s steps(1,end) -${(((grids.length - k) % grids.length) * period / grids.length).toFixed(1)}s infinite">${g.svg(P)}</g>`).join('')

  // Night sky with a city glow at the horizon.
  px.gradient(0, 82, [TN.bgDark, TN.bg, TN.night, TN.storm, mix(TN.storm, TN.purple, 0.22)])
  // Far skyline.
  for (let x = 0; x < COLS;) {
    const w = 4 + Math.floor(rnd() * 7), h = 18 + Math.floor(rnd() * 26)
    px.rect(x, 80 - h, w, h + 4, '#20243a')
    for (let y = 82 - h; y < 80; y += 3) for (let xx = x + 1; xx < x + w - 1; xx += 2) if (rnd() < 0.18) px.set(xx, y, rnd() < 0.5 ? TN.blue7 : TN.comment)
    x += w
  }
  // A lattice tower with a blinking light on top.
  const TX = 150
  for (let y = 22; y < 82; y++) {
    const hw = Math.round(1 + (y - 22) * 0.14)
    px.set(TX - hw, y, TN.orange); px.set(TX + hw, y, TN.orange)
    if (y % 5 === 0) for (let x = TX - hw; x <= TX + hw; x++) px.set(x, y, (x + y) % 2 ? TN.orange : TN.red1)
    if (y % 5 === 2 && hw > 1) for (let i = 1; i < hw; i++) { px.set(TX - hw + i, y + Math.min(i, 2), TN.red1); px.set(TX + hw - i, y + Math.min(i, 2), TN.red1) }
  }
  px.rect(TX - 6, 42, 13, 2, TN.orange); px.rect(TX - 4, 34, 9, 2, TN.orange); px.rect(TX, 10, 1, 12, TN.orange)
  for (const x of [TX - 5, TX - 2, TX + 2, TX + 5]) px.set(x, 43, TN.yellow)
  const beacon = [0, 1].map((k) => { const g = layer(); if (!k) { g.set(TX, 9, TN.red); g.set(TX - 1, 9, mix(TN.red, TN.bg, 0.5)); g.set(TX + 1, 9, mix(TN.red, TN.bg, 0.5)) } return g })

  // Mid skyline with lit windows and neon signs that flicker.
  const signs = [0, 1, 2].map(() => layer())
  for (let x = -4, i = 0; x < COLS; i++) {
    const w = 10 + Math.floor(rnd() * 12), top0 = 38 + Math.floor(rnd() * 26), top = x + w > TX - 9 && x < TX + 9 ? Math.max(top0, 62) : top0
    px.rect(x, top, w, 92 - top, TN.bgDark); px.rect(x, top, w, 1, TN.night)
    for (let y = top + 3; y < 88; y += 3) for (let xx = x + 2; xx < x + w - 2; xx += 2) if (rnd() < 0.26) px.set(xx, y, [TN.yellow, TN.fgDark, TN.blue7, TN.cyan][Math.floor(rnd() * 4)])
    if (i % 2 === 0) {
      const c = NEON[i % NEON.length], sx = x + 1 + Math.floor(rnd() * Math.max(1, w - 6)), sy = top + 4, sh = 10 + Math.floor(rnd() * 6)
      px.rect(sx, sy, 5, sh, mix(c, TN.bgDark, 0.75))
      const g = signs[i % 3]
      g.rect(sx, sy, 5, 1, c); g.rect(sx, sy + sh - 1, 5, 1, c); g.rect(sx, sy, 1, sh, c); g.rect(sx + 4, sy, 1, sh, c)
      for (let y = sy + 2; y < sy + sh - 2; y += 3) { g.rect(sx + 1 + (y % 2), y, 2, 1, c); g.set(sx + 2, y + 1, c) }
      // The other two frames keep the sign lit, so each sign blinks off one beat in three.
      for (const o of signs) if (o !== g) { o.rect(sx, sy, 5, 1, c); o.rect(sx, sy + sh - 1, 5, 1, c); o.rect(sx, sy, 1, sh, c); o.rect(sx + 4, sy, 1, sh, c) }
    } else if (w > 14) {
      const c = NEON[(i + 3) % NEON.length], by = top + 3
      px.rect(x + 2, by, w - 4, 4, mix(c, TN.bgDark, 0.6)); px.rect(x + 2, by, w - 4, 1, c); px.rect(x + 2, by + 3, w - 4, 1, mix(c, TN.bgDark, 0.3))
      for (let xx = x + 3; xx < x + w - 3; xx += 3) px.set(xx, by + 1 + (xx % 2), TN.fg)
    }
    x += w
  }
  // Elevated track and a train sliding past.
  px.rect(0, 84, COLS, 2, TN.night); for (let x = 3; x < COLS; x += 18) px.rect(x, 86, 2, 6, TN.night)
  const train = layer()
  for (let c = 0; c < 3; c++) { const x0 = 4 + c * 15; train.rect(x0, 79, 14, 5, TN.termBlack); train.rect(x0, 79, 14, 1, TN.dark5); for (let x = x0 + 1; x < x0 + 13; x += 3) train.rect(x, 81, 2, 1, TN.yellow) }
  train.set(48, 82, TN.fg); train.set(3, 82, TN.red)

  const fg = layer()
  // The rooftop: railing, tiled floor, puddles with neon reflections.
  fg.rect(0, 92, COLS, ROWS - 92, TN.storm)
  for (let y = 95; y < ROWS; y += 5) fg.rect(0, y, COLS, 1, TN.night)
  for (let y = 92; y < ROWS; y++) for (let x = (y * 7) % 13; x < COLS; x += 13) fg.set(x, y, TN.night)
  fg.rect(0, 88, COLS, 1, TN.dark3); for (let x = 1; x < COLS; x += 6) fg.rect(x, 88, 1, 4, TN.dark3)
  const puddles = [[62, 108, 14], [138, 104, 10], [30, 117, 12], [176, 116, 9], [104, 119, 8]]
  for (const [x, y, w] of puddles) {
    fg.ellipse(x, y, w, 2, TN.bgHi)
    fg.rect(x - w + 3, y - 1, 2 * w - 5, 1, mix(TN.bgHi, TN.dark3, 0.5))
    for (let i = -w + 3; i < w - 2; i += 5) { const c = mix(NEON[(i + w + 7) % NEON.length], TN.bgHi, 0.5); fg.set(x + i, y, c); fg.set(x + i, y + 1, c); fg.set(x + i + 1, y, mix(c, TN.bgHi, 0.5)) }
  }
  // Water tank on stilts.
  for (const x of [11, 29]) fg.rect(x, 74, 2, 18, TN.dark3)
  fg.rect(12, 82, 18, 1, TN.dark3)
  fg.rect(8, 52, 26, 22, TN.termBlack); fg.rect(8, 52, 3, 22, TN.dark5); fg.rect(31, 52, 3, 22, TN.bgHi)
  for (const y of [56, 63, 70]) fg.rect(8, y, 26, 1, TN.dark3)
  fg.poly([[7, 52], [35, 52], [21, 45]], TN.dark3); fg.rect(34, 52, 1, 30, TN.comment); for (let y = 54; y < 82; y += 3) fg.rect(34, y, 3, 1, TN.comment)
  // AC units with spinning fans.
  const fans = [0, 1].map(() => layer())
  for (const [x, y] of [[176, 88], [188, 90]]) {
    fg.rect(x, y, 11, 9, TN.dark5); fg.rect(x, y, 11, 1, TN.fgDark); fg.disc(x + 5, y + 4, 3, TN.termBlack)
    fans[0].rect(x + 3, y + 4, 5, 1, TN.dark3); fans[0].rect(x + 5, y + 2, 1, 5, TN.dark3)
    fans[1].set(x + 3, y + 2, TN.dark3); fans[1].set(x + 4, y + 3, TN.dark3); fans[1].set(x + 6, y + 5, TN.dark3); fans[1].set(x + 7, y + 6, TN.dark3); fans[1].set(x + 7, y + 2, TN.dark3); fans[1].set(x + 6, y + 3, TN.dark3); fans[1].set(x + 4, y + 5, TN.dark3); fans[1].set(x + 3, y + 6, TN.dark3)
  }
  // A glowing vending machine.
  const VX = 154
  fg.rect(VX, 72, 14, 24, TN.blue0); fg.rect(VX, 72, 14, 1, TN.blue); fg.rect(VX + 1, 74, 12, 12, TN.blue5)
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) fg.rect(VX + 2 + c * 3, 75 + r * 4, 2, 3, NEON[(r * 4 + c) % NEON.length])
  fg.rect(VX + 2, 88, 10, 3, TN.bgDark); fg.rect(VX + 11, 87, 1, 1, TN.green)
  for (let y = 96; y < 103; y++) for (let x = VX - (y - 96); x < VX + 14 + (y - 96); x++) if ((x + y) % 2 === 0) fg.set(x, y, mix(TN.storm, TN.blue5, 0.22))

  // The coder's corner: an awning with string lights, a crate, a mug, and the coder from behind.
  fg.rect(82, 68, 46, 3, TN.dark5); for (let x = 82; x < 128; x += 2) fg.set(x, 70, TN.termBlack)
  fg.rect(84, 71, 1, 27, TN.dark3); fg.rect(125, 71, 1, 27, TN.dark3)
  const bulbs = [0, 1, 2].map(() => layer())
  for (let x = 86, i = 0; x < 125; x += 4, i++) { fg.set(x, 72 + (i % 2), TN.dark3); bulbs[i % 3].set(x, 73 + (i % 2), [TN.yellow, TN.orange, TN.magenta][i % 3]) }
  fg.rect(94, 92, 22, 6, '#3b3226'); fg.rect(94, 92, 22, 1, '#5a4a36'); for (const x of [98, 106, 112]) fg.rect(x, 93, 1, 5, '#2a241c')
  stamp(fg, 96, 75, [
    '....ooooo.....',
    '...ohhhhho....',
    '..ohhhhhhho...',
    '..ohhhhhhhs...',
    '..ohhhhhhhs...',
    '...ohhhhhs....',
    '..obbbbbbbbo..',
    '.obbbbbbbbbbo.',
    'obbbbbbcbbbbbo',
    'obbbbbbcbbbbaa',
    'obbbbbbcbbbbaa',
    'obbbbbbcbbbbo.',
    '.obbbbbbbbbbo.',
    '.pppppppppppp.',
    '.pppppppppppp.',
    '.pppppppppppp.',
  ], { o: TN.bgDark, h: TN.purple, s: mix(TN.purple, TN.bgDark, 0.3), b: mix(TN.purple, TN.bgDark, 0.42), c: mix(TN.purple, TN.bgDark, 0.6), a: mix(TN.purple, TN.fg, 0.15), p: TN.night })
  fg.rect(99, 74, 7, 1, TN.cyan); fg.rect(96, 77, 2, 3, TN.cyan); fg.rect(107, 77, 2, 3, TN.cyan)
  // Laptop screen beside the coder, code lines scrolling in Tokyo Night syntax colors.
  fg.rect(110, 78, 14, 11, TN.termBlack); fg.rect(111, 79, 12, 9, TN.bg); fg.rect(108, 89, 17, 1, TN.dark5)
  const SYN = [TN.magenta, TN.blue, TN.green, TN.orange, TN.cyan, TN.fgDark, TN.yellow]
  const code = [0, 1, 2, 3].map((k) => { const g = layer(); for (let r = 0; r < 4; r++) { const n = (r + k) * 5 + 3, ind = n % 3, len = 2 + (n * 7) % 7; g.rect(112 + ind, 80 + r * 2, Math.min(len, 10 - ind), 1, SYN[n % SYN.length]) } return g })
  fg.rect(119, 90, 3, 2, TN.fgDark); fg.set(122, 90, TN.fgDark)
  const steam = [0, 1, 2].map((k) => { const g = layer(); for (let i = 0; i < 3; i++) g.set(120 + ((i + k) % 2), 88 - i * 2 - (k % 2), TN.dark5); return g })

  // Rain, puddle ripples, and drips off the awning.
  const rain = [0, 1, 2].map((k) => {
    const g = layer()
    for (let i = 0; i < 170; i++) {
      const x = (i * 37 + k * 13) % COLS, y = (i * 53 + k * 29) % (ROWS - 3)
      if (x >= 82 && x <= 127 && y >= 66 && y <= 98) continue
      g.set(x, y, i % 3 ? TN.comment : TN.dark5); g.set(x, y + 1, i % 3 ? TN.comment : TN.dark5)
    }
    for (let j = 0; j < puddles.length; j++) if ((j + k) % 3 === 0) { const [x, y] = puddles[j]; g.set(x - 2, y, TN.dark5); g.set(x + 2, y, TN.dark5); g.set(x, y - 1, TN.dark5); g.set(x, y + 1, TN.dark5) }
    for (let x = 83 + k; x < 128; x += 9) g.set(x, 72 + k * 3, TN.blue5)
    return g
  })

  return svgDoc({
    defs: `<radialGradient id="screen"><stop offset="0" stop-color="${TN.blue}" stop-opacity=".35"/><stop offset="1" stop-color="${TN.blue}" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="vend"><stop offset="0" stop-color="${TN.blue5}" stop-opacity=".22"/><stop offset="1" stop-color="${TN.blue5}" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="warm"><stop offset="0" stop-color="${TN.yellow}" stop-opacity=".16"/><stop offset="1" stop-color="${TN.yellow}" stop-opacity="0"/></radialGradient>`,
    css:
      `@keyframes f2{0%{opacity:1}50%{opacity:0}}@keyframes f3{0%{opacity:1}33.333%{opacity:0}}@keyframes f4{0%{opacity:1}25%{opacity:0}}` +
      `@keyframes train{0%{transform:translate(1600px,0)}100%{transform:translate(-480px,0)}}`,
    body:
      px.svg(P) + frames(beacon, 1.6) + frames(signs, 2.7) +
      `<g style="animation:train 8.4s steps(84,end) -3s infinite">${train.svg(P)}</g>` + fg.svg(P) +
      `<circle cx="${(VX + 7) * P}" cy="${84 * P}" r="200" fill="url(#vend)"/><circle cx="${105 * P}" cy="${76 * P}" r="260" fill="url(#warm)"/><circle cx="${117 * P}" cy="${83 * P}" r="120" fill="url(#screen)"/>` +
      frames(fans, 0.2) + frames(bulbs, 1.8) + frames(code, 2.4) + frames(steam, 1.2) + frames(rain, 0.3),
  })
}
