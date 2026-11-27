// A retro pixel-art game level at night with a line of motivation every 15 seconds: a quest-log
// box on the right fades from one short, original, game-flavored line to the next while an XP bar
// fills. Below, a little knight runs across the level past floating platforms, spinning gems,
// flickering torches, a glowing treasure chest, and a castle under a big moon. Original art on a
// 200 x 125 grid of 8-unit pixels; the text is crisp SVG. Every change lands on the 0.1 s tick.
import { H, W, f, rng, svgDoc } from './_lib.mjs'
import { pixelGrid } from './_pixel.mjs'

const P = 8, COLS = W / P, ROWS = H / P
const GROUND = 98
const INK = '#120e24'

// Original lines, pre-split to fit the box. Only encouragement: no telling people to rest, sleep,
// eat, stretch or step away. No < > or & in the text.
const QUOTES = [
  ['Quest accepted:', 'ship one small', 'thing today.'],
  ['+1 XP for every', 'bug you squash.'],
  ['Checkpoint', 'reached. Keep', 'going.'],
  ['Your skills grow', 'with every try.'],
  ['New skill', 'unlocked: focus.'],
  ['Every boss has', 'a weak spot.', 'Find it.'],
  ['Save often.', 'Commit often.'],
  ['Level up by', 'finishing what', 'you start.'],
  ['Combo: one task', 'after another.'],
  ['The next level', 'is closer than', 'it looks.'],
  ['Power up: you', 'have beaten', 'hard levels.'],
  ['Retry. Learn.', 'Win.'],
  ['Small wins', 'stack up.'],
  ['Achievement:', 'showed up', 'today.'],
  ['Clear one level', 'at a time.'],
  ['High score:', 'progress over', 'perfect.'],
  ['Main quest first.', 'Side quests', 'can wait.'],
  ['You have the', 'stats for this.'],
  ['Keep your', 'streak alive.'],
  ['Game on.', 'You got this.'],
]
const SHOW = 15, CYCLE = QUOTES.length * SHOW

// The knight, facing right: helmet with a red plume, visor, blue tunic, red cape, sword.
const KNIGHT = [
  '...rr.....',
  '..rr......',
  '..ssss....',
  '.ssssss...',
  '.svvvvs...',
  '.ssssss...',
  'cc.bbbb.w.',
  'ccbbbbbbw.',
  'ccbbyybbw.',
  'c.bbbbb.w.',
  '..bb.bb.h.',
]
const LEGS = [['..d...d...', '.dd...dd..'], ['...d.d....', '...dd.dd..']]
const KPAL = { r: '#e04a4a', s: '#c8cfe0', v: '#2a2a40', c: '#c83a3a', b: '#4a7ae0', y: '#f0c050', w: '#e8ecf4', h: '#8a6a3a', d: '#3a3050' }
const stamp = (g, rows, x, y) => rows.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== '.') g.set(x + i, y + j, KPAL[ch]) }))

export default function scene() {
  const rnd = rng(0x1e7e1)
  const px = pixelGrid(COLS, ROWS)
  const layer = () => pixelGrid(COLS, ROWS)
  const frames = (grids, period) => grids.map((g, k) => `<g style="animation:f${grids.length} ${period}s steps(1,end) -${((k * period) / grids.length).toFixed(1)}s infinite">${g.svg(P)}</g>`).join('')

  // Night sky, the moon, a castle on the far hill, and rolling hills.
  px.gradient(0, 74, ['#14102e', '#1c1540', '#281d52', '#382864', '#4e3674'])
  px.disc(26, 18, 9, '#3e3a6a'); px.disc(26, 18, 8, '#f4ecd0'); px.disc(29, 16, 2, '#e0d6b4'); px.disc(22, 21, 1, '#e0d6b4'); px.disc(24, 14, 1, '#e8dfc0')
  for (let x = 0; x < COLS; x++) { const h = Math.round(16 + 5 * Math.sin(x / 15) + 3 * Math.sin(x / 6)); px.rect(x, 80 - h, 1, h + 20, '#2a2450') }
  const CX = 150, CB = 62
  px.rect(CX, CB - 14, 26, 14, '#1c1838'); for (const x of [CX - 2, CX + 11, CX + 24]) { px.rect(x, CB - 22, 5, 22, '#1c1838'); for (let i = 0; i < 5; i += 2) px.rect(x + i, CB - 24, 1, 2, '#1c1838') }
  px.poly([[CX + 10, CB - 22], [CX + 17, CB - 22], [CX + 13, CB - 30]], '#1c1838'); px.rect(CX + 13, CB - 34, 1, 4, '#1c1838'); px.rect(CX + 14, CB - 34, 3, 2, '#e04a4a')
  for (const [x, y] of [[CX + 3, CB - 10], [CX + 19, CB - 10], [CX + 12, CB - 17], [CX - 1, CB - 18], [CX + 25, CB - 18]]) px.rect(x, y, 2, 2, '#ffcf7a')
  for (let x = 0; x < COLS; x++) { const h = Math.round(10 + 4 * Math.sin(x / 10 + 1)); px.rect(x, GROUND - h, 1, h, '#2c3e5e') }
  for (let x = 0; x < COLS; x++) { const h = Math.round(5 + 2 * Math.sin(x / 7 + 3)); px.rect(x, GROUND - h, 1, h, '#33506a') }

  // The ground: grass, then stone bricks.
  px.rect(0, GROUND, COLS, 2, '#5ac06a'); px.rect(0, GROUND + 2, COLS, 1, '#3a8a4a')
  for (let x = 0; x < COLS; x += 3) px.set(x, GROUND - 1, '#5ac06a')
  px.rect(0, GROUND + 3, COLS, ROWS - GROUND - 3, '#5a4258')
  for (let y = GROUND + 3; y < ROWS; y += 4) { px.rect(0, y, COLS, 1, '#45324a'); for (let x = (y % 8 ? 0 : 4); x < COLS; x += 8) px.rect(x, y, 1, 4, '#45324a') }

  // Floating stone platforms with torches, and a treasure chest.
  const platform = (x, y, w) => { px.rect(x, y, w, 4, '#7a6a8a'); px.rect(x, y, w, 1, '#a898b8'); for (let i = 3; i < w; i += 4) px.rect(x + i, y + 1, 1, 3, '#5a4a6a'); px.rect(x, y + 4, w, 1, '#3a2e4a') }
  const PLAT = [[14, 72, 18], [52, 60, 14], [86, 76, 12], [120, 64, 16], [166, 78, 18]]
  for (const [x, y, w] of PLAT) platform(x, y, w)
  const torch = (x, y) => { px.rect(x, y - 4, 1, 4, '#6a4a3a'); px.rect(x - 1, y - 5, 3, 1, '#4a3a3a') }
  torch(16, 72); torch(30, 72); torch(121, 64); torch(134, 64)
  const CHX = 172, CHY = 78
  px.rect(CHX, CHY - 6, 9, 6, '#8a5a2a'); px.rect(CHX, CHY - 6, 9, 2, '#a8743a'); px.rect(CHX, CHY - 4, 9, 1, '#f0c050'); px.rect(CHX + 4, CHY - 4, 1, 2, '#f0c050'); px.rect(CHX, CHY - 6, 1, 6, '#f0c050'); px.rect(CHX + 8, CHY - 6, 1, 6, '#f0c050')

  // Moving layers.
  // Stars twinkling.
  const stars = [0, 1, 2].map(() => layer())
  for (let i = 0; i < 48; i++) { const x = Math.floor(rnd() * COLS), y = Math.floor(rnd() * 48); if (Math.hypot(x - 26, y - 18) > 11) stars[i % 3].set(x, y, i % 5 ? '#e8e4ff' : '#ffe08a') }
  // Torch flames.
  const flames = [0, 1, 2].map((k) => { const g = layer(); for (const [x, y] of [[16, 72], [30, 72], [121, 64], [134, 64]]) { g.set(x, y - 6, '#ffd27a'); g.set(x + ((k + x) % 3) - 1, y - 7, '#ff8a3a'); if (k !== 1) g.set(x, y - 8, '#ff5a3a') } return g })
  // Gems spinning: wide, mid, narrow.
  const GEMS = [[22, 64, '#5ae0ff'], [58, 52, '#ff6bd0'], [92, 68, '#8affa0'], [128, 56, '#5ae0ff'], [176, 66, '#ffd166'], [70, 88, '#ff6bd0'], [104, 88, '#5ae0ff'], [140, 88, '#8affa0']]
  const gems = [2, 1, 0].map((half) => { const g = layer(); for (const [x, y, c] of GEMS) { for (let j = -2; j <= 2; j++) { const w = Math.max(0, half - Math.abs(j) + (half ? 1 : 0)); g.rect(x - w, y + j, w * 2 + 1, 1, c) } g.set(x, y - 2, '#ffffff') } return g })
  // The knight running across, legs in two poses, with a little dust kick.
  const run = [0, 1].map((k) => { const g = layer(); stamp(g, KNIGHT, 20, GROUND - 13); stamp(g, LEGS[k], 20, GROUND - 2); if (k) { g.set(19, GROUND - 1, '#a898b8'); g.set(18, GROUND - 2, '#a898b8') } return g })

  // The quest log: a framed box with the current line and an XP bar.
  const BX = 1300, BY = 290, BW = 284, BH = 226
  const MONO = `font-family="Consolas, Courier New, monospace" font-weight="700"`
  let box = `<rect x="${BX}" y="${BY}" width="${BW}" height="${BH}" fill="${INK}" fill-opacity=".9"/>` +
    `<rect x="${BX + 4}" y="${BY + 4}" width="${BW - 8}" height="${BH - 8}" fill="none" stroke="#f4f0ff" stroke-width="4"/>` +
    `<rect x="${BX + 12}" y="${BY + 12}" width="${BW - 24}" height="${BH - 24}" fill="none" stroke="#6a5aa8" stroke-width="2"/>` +
    `<text x="${BX + 26}" y="${BY + 46}" ${MONO} font-size="18" fill="#ffd166">Quest log</text>` +
    `<path d="M${BX + BW - 46} ${BY + 32}h12v12h-12z" fill="#ffd166"/>`
  const pct = (s) => +((s / CYCLE) * 100).toFixed(5)
  const at = (k) => `-${(CYCLE - k * SHOW) % CYCLE}s`
  box += QUOTES.map((lines, k) => `<g style="animation:q ${CYCLE}s steps(1,end) ${at(k)} infinite">${lines.map((line, i) => `<text x="${BX + 26}" y="${BY + 92 + i * 32}" ${MONO} font-size="21" fill="#ffffff">${line}</text>`).join('')}</g>`).join('')
  box += `<text x="${BX + 26}" y="${BY + BH - 28}" ${MONO} font-size="15" fill="#8affa0">XP</text>` +
    `<rect x="${BX + 56}" y="${BY + BH - 40}" width="${BW - 96}" height="12" fill="#2a2450"/>` +
    `<rect x="${BX + 56}" y="${BY + BH - 40}" width="${BW - 96}" height="12" fill="#8affa0" style="transform-origin:${BX + 56}px 0;animation:xp ${SHOW}s steps(${SHOW},end) infinite"/>` +
    `<path d="M${BX + BW - 32} ${BY + BH - 40}l8 6l-8 6z" fill="#ffffff" style="animation:f2 1s steps(1,end) infinite"/>`

  return svgDoc({
    defs:
      `<radialGradient id="glow"><stop offset="0" stop-color="#ffb060" stop-opacity=".45"/><stop offset="1" stop-color="#ffb060" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="moon"><stop offset="0" stop-color="#f4ecd0" stop-opacity=".35"/><stop offset="1" stop-color="#f4ecd0" stop-opacity="0"/></radialGradient>`,
    css:
      `@keyframes f2{0%{opacity:1}50%{opacity:0}}@keyframes f3{0%{opacity:1}33.333%{opacity:0}}` +
      `@keyframes q{0%{opacity:0;animation-timing-function:steps(3,end)}${pct(0.3)}%{opacity:1;animation-timing-function:steps(1,end)}${pct(SHOW - 0.3)}%{opacity:1;animation-timing-function:steps(3,end)}${pct(SHOW)}%{opacity:0}100%{opacity:0}}` +
      `@keyframes xp{0%{transform:scaleX(0)}100%{transform:scaleX(1)}}` +
      `@keyframes run{0%{transform:translate(-${30 * P}px,0)}100%{transform:translate(${190 * P}px,0)}}`,
    body:
      px.svg(P) + `<circle cx="${26 * P}" cy="${18 * P}" r="200" fill="url(#moon)"/>` +
      [[16, 72], [30, 72], [121, 64], [134, 64], [176, 75]].map(([x, y]) => `<circle cx="${x * P + 4}" cy="${(y - 7) * P}" r="70" fill="url(#glow)"/>`).join('') +
      frames(stars, 2.4) + frames(flames, 0.6) + frames(gems, 0.9) +
      `<g style="animation:run 22s steps(220,end) -6s infinite">${frames(run, 0.4)}</g>` + box,
  })
}
