// A big LED dot-matrix board on a dim brick wall, scrolling positive lines one after another, each
// in its own color: "One day you will be wealthy", "It's all worth it", and more. Lit dots glow;
// unlit dots sit dark in the grid. A spotlight washes the wall, a little neon heart blinks, and a
// plant sits on the shelf below. The text scrolls one dot column per 0.1 s tick.
import { H, W, f, rng, svgDoc } from './_lib.mjs'

// Positive lines, all caps as an LED sign shows them. Only encouragement and good vibes.
const LINES = [
  ['ONE DAY YOU WILL BE WEALTHY', '#ffb020'],
  ["IT'S ALL WORTH IT", '#ff4f8b'],
  ['GOOD THINGS ARE COMING', '#3ae0ff'],
  ['BET ON YOURSELF', '#6aff8a'],
  ['THE GRIND PAYS OFF', '#ffb020'],
  ['YOUR BIG BREAK IS CLOSE', '#c08aff'],
  ['KEEP BUILDING, KEEP SHIPPING', '#3ae0ff'],
  ['YOU WERE BUILT FOR THIS', '#ff4f8b'],
  ['SUCCESS LOVES CONSISTENCY', '#6aff8a'],
  ['YOU ARE GOING PLACES', '#ffb020'],
  ['STAY THE COURSE', '#c08aff'],
  ['TODAY COUNTS', '#3ae0ff'],
  ['DREAM BIG. WORK SMART.', '#ff4f8b'],
  ['ONE STEP CLOSER EVERY DAY', '#6aff8a'],
  ['GOOD VIBES ONLY', '#ffb020'],
]

// A 5 x 7 dot font.
const FONT = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'], B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  C: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'], D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'], F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.####'], H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  I: ['.###.', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.'], J: ['..###', '...#.', '...#.', '...#.', '...#.', '#..#.', '.##..'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'], L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'], N: ['#...#', '#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'], P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  Q: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'], R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'], T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'], V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '#.#.#', '.#.#.'], X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'], Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  "'": ['..#..', '..#..', '.#...', '.....', '.....', '.....', '.....'], ',': ['.....', '.....', '.....', '.....', '.....', '..#..', '.#...'],
  '.': ['.....', '.....', '.....', '.....', '.....', '.....', '..#..'], '!': ['..#..', '..#..', '..#..', '..#..', '..#..', '.....', '..#..'],
  ' ': ['...', '...', '...', '...', '...', '...', '...'],
}

// The board.
const BX = 110, BY = 560, BW = 1380, BH = 260 // outer frame
const PITCH = 26, DOT = 15 // dot spacing and lit-dot size
const COLS_VISIBLE = Math.floor((BW - 60) / PITCH), IW = COLS_VISIBLE * PITCH, IH = 7 * PITCH
// The first dot's center, so the grid sits centered in the board's dark face (14-unit bezel).
const IX = BX + 14 + Math.round((BW - 28 - IW) / 2) + PITCH / 2, IY = BY + 14 + Math.round((BH - 28 - IH) / 2) + PITCH / 2
const GAP = 14 // dark columns between lines
const TICK = 0.1

export default function scene() {
  const rnd = rng(0xb0a2d)

  // Lay every line out on one long strip of dot columns, grouped by color.
  const byColor = new Map()
  let col = 0
  for (const [text, color] of LINES) {
    let d = byColor.get(color) ?? ''
    for (const ch of text) {
      const glyph = FONT[ch] ?? FONT[' ']
      glyph.forEach((row, y) => [...row].forEach((c, x) => { if (c === '#') d += `M${(col + x) * PITCH} ${y * PITCH}h0` }))
      col += glyph[0].length + 1
    }
    byColor.set(color, d)
    col += GAP
  }
  const total = col + COLS_VISIBLE // the strip scrolls in from the right edge and fully out the left
  const seconds = +(total * TICK).toFixed(1)

  let defs =
    `<linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1018"/><stop offset="1" stop-color="#120a12"/></linearGradient>` +
    `<radialGradient id="spot" cx="800" cy="520" r="900" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffd8a8" stop-opacity=".16"/><stop offset="1" stop-color="#ffd8a8" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="frame" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3644"/><stop offset=".5" stop-color="#22202a"/><stop offset="1" stop-color="#14121a"/></linearGradient>` +
    `<pattern id="unlit" x="${IX - PITCH / 2}" y="${IY - PITCH / 2}" width="${PITCH}" height="${PITCH}" patternUnits="userSpaceOnUse"><circle cx="${PITCH / 2}" cy="${PITCH / 2}" r="${DOT / 2}" fill="#241a1c"/></pattern>` +
    `<radialGradient id="boardGlow"><stop offset="0" stop-color="#ff9a4a" stop-opacity=".16"/><stop offset="1" stop-color="#ff9a4a" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="heart"><stop offset="0" stop-color="#ff4f8b" stop-opacity=".45"/><stop offset="1" stop-color="#ff4f8b" stop-opacity="0"/></radialGradient>` +
    `<clipPath id="window"><rect x="${IX - PITCH / 2}" y="${IY - PITCH / 2}" width="${IW}" height="${IH}"/></clipPath>`
  let i = 0
  for (const [color, d] of byColor) defs += `<path id="m${i++}" d="${d}"/>`

  // The wall: dim bricks under a spotlight.
  let body = `<rect width="${W}" height="${H}" fill="url(#wall)"/>`
  let bricks = ''
  for (let y = 0; y < H; y += 34) for (let x = (y / 34) % 2 ? -40 : 0; x < W; x += 80) bricks += `M${x} ${y}h76v30h-76z`
  body += `<path d="${bricks}" fill="#20141a"/>`
  body += `<rect width="${W}" height="${H}" fill="url(#spot)"/>`

  // The board: frame, mounting bolts, the dark dot grid, then the scrolling text.
  body += `<ellipse cx="800" cy="${BY + BH / 2}" rx="820" ry="260" fill="url(#boardGlow)"/>`
  body += `<rect x="${BX}" y="${BY}" width="${BW}" height="${BH}" rx="14" fill="url(#frame)"/><rect x="${BX + 14}" y="${BY + 14}" width="${BW - 28}" height="${BH - 28}" rx="6" fill="#0a0608"/>`
  for (const [x, y] of [[BX + 8, BY + 8], [BX + BW - 8, BY + 8], [BX + 8, BY + BH - 8], [BX + BW - 8, BY + BH - 8]]) body += `<circle cx="${x}" cy="${y}" r="4" fill="#5a5664"/>`
  body += `<rect x="${IX - PITCH / 2}" y="${IY - PITCH / 2}" width="${IW}" height="${IH}" fill="url(#unlit)"/>`
  let strip = ''
  i = 0
  for (const [color] of byColor) {
    strip += `<use href="#m${i}" stroke="${color}" stroke-width="${DOT + 16}" stroke-opacity=".16" stroke-linecap="round"/>` +
      `<use href="#m${i}" stroke="${color}" stroke-width="${DOT}" stroke-linecap="round"/>` +
      `<use href="#m${i}" stroke="#ffffff" stroke-opacity=".55" stroke-width="${DOT * 0.4}" stroke-linecap="round"/>`
    i++
  }
  body += `<g clip-path="url(#window)"><g style="animation:scroll ${seconds}s steps(${total},end) -${(COLS_VISIBLE * TICK).toFixed(1)}s infinite"><g transform="translate(${IX + IW} ${IY})">${strip}</g></g></g>`
  // Glass sheen across the board.
  body += `<path d="M${BX + 14} ${BY + 14}h${BW - 28}v40q-${(BW - 28) / 2} 30 -${BW - 28} 0z" fill="#ffffff" fill-opacity=".03"/>`

  // Above: a shelf with a plant and a little neon heart that blinks.
  body += `<rect x="1080" y="300" width="380" height="14" fill="#3a2a24"/><rect x="1080" y="314" width="380" height="6" fill="#24181a"/>`
  body += `<path d="M1112 300l8 -46h44l8 46z" fill="#b8673d"/><rect x="1110" y="250" width="64" height="8" fill="#c8784a"/>` +
    [[-26, -60, 28], [-6, -86, 30], [14, -70, 26], [30, -50, 24], [-40, -40, 22], [0, -40, 24]].map(([dx, dy, r]) => `<ellipse cx="${1142 + dx}" cy="${250 + dy}" rx="${r * 0.55}" ry="${r}" transform="rotate(${dx} ${1142 + dx} ${250 + dy})" fill="#3f8a5a"/>`).join('')
  body += `<circle cx="1340" cy="244" r="90" fill="url(#heart)" style="animation:blink 3s steps(1,end) infinite"/>`
  const heartD = 'M1340 284l-46 -46a26 26 0 0 1 46 -30a26 26 0 0 1 46 30z'
  body += `<g style="animation:blink 3s steps(1,end) infinite"><path d="${heartD}" fill="none" stroke="#ff4f8b" stroke-width="16" stroke-opacity=".18" stroke-linejoin="round"/>` +
    `<path d="${heartD}" fill="none" stroke="#ff4f8b" stroke-width="6" stroke-linejoin="round"/><path d="${heartD}" fill="none" stroke="#ffe0ee" stroke-width="2" stroke-linejoin="round"/></g>`

  const css =
    `@keyframes scroll{0%{transform:translate(0,0)}100%{transform:translate(-${total * PITCH}px,0)}}` +
    `@keyframes blink{0%{opacity:1}90%{opacity:1}93.333%{opacity:.25}96.667%{opacity:1}}`

  return svgDoc({ defs, css, body })
}
