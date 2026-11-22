// Good vibes on the clock: a card on the right shows a short, original line of encouragement
// that changes every hour, matched to the time of day, under a greeting (good morning, good
// afternoon, good evening, late night). The background shifts warm to cool through the day and
// soft lights drift up. Like Sky Clock, everything time-of-day runs on one 24-hour cycle built to
// start at noon; the render hook swaps that start (CLOCK_MARK) for the local time. The quotes and
// greeting switch once an hour, the colors once a minute; only the drifting lights use the tick.
import { H, TICK, W, f, onTick, rng, svgDoc } from './_lib.mjs'

const CLOCK_MARK = '-43200.01s' // noon, replaced at render time; must match build-themes.mjs

// One line per hour, 0:00 to 23:00, pre-split to fit the card. Original lines, so nothing is
// misattributed. No < > or & in the text: they break the SVG.
const QUOTES = [
  ['Rest counts', 'as progress too.'],
  ['The code will', 'still be here', 'after you sleep.'],
  ['Late nights', 'are fine.', "Burnout isn't."],
  ['Quiet hours,', 'clear head.'],
  ['Up early or', 'still up? Either', 'way, drink water.'],
  ['The day is a', 'blank file.', 'Start small.'],
  ['One thing', 'at a time.', "You've got this."],
  ['Coffee first.', 'Then the hard part.'],
  ['Ship something', 'small today.'],
  ['Start with the task', 'you keep avoiding.'],
  ['Shipped and good', 'beats perfect', 'and stuck.'],
  ["You've fixed harder", 'bugs than this one.'],
  ['Take a real lunch.', 'Your brain', 'needs it.'],
  ['Stuck? Explain it', 'out loud. It helps.'],
  ['Small commits,', 'steady progress.'],
  ['Stretch, breathe,', 'then back to it.'],
  ['Everyone good at', 'this started out', 'lost too.'],
  ['Look how far', 'you got today.'],
  ['Step away', 'for a bit. It', 'counts as work.'],
  ['Good work earns', 'a good evening.'],
  ["Write tomorrow's", 'first step down.', 'Then rest.'],
  ['Proud of you for', 'showing up today.'],
  ['Tomorrow is', 'a fresh build.'],
  ['Sleep is the', 'best debugger.'],
]
const GREETINGS = [['Good morning', 5, 12], ['Good afternoon', 12, 17], ['Good evening', 17, 21], ['Late night', 21, 29]]

const pct = (h) => f(((h % 24) / 24) * 100)
// Shown from hour a until hour b (b may pass midnight), hidden otherwise.
const window = (name, a, b) => {
  if (b <= 24) return `@keyframes ${name}{0%{opacity:0}${pct(a)}%{opacity:1}${f((b / 24) * 100)}%{opacity:0}}`.replace('0%{opacity:0}0%{opacity:1}', '0%{opacity:1}')
  return `@keyframes ${name}{0%{opacity:1}${pct(b)}%{opacity:0}${pct(a)}%{opacity:1}}`
}
const frames = (name, stops) => `@keyframes ${name}{${stops.map(([h, v]) => `${f((h / 24) * 100)}%{opacity:${v}}`).join('')}}`

export default function scene({ dayLength = 86400, startHour = null } = {}) {
  const rnd = rng(0x6006)
  const start = startHour === null ? CLOCK_MARK : `-${f((startHour / 24) * dayLength)}s`
  const fade = dayLength === 86400 ? 60 : 4 // color steps per keyframe interval: about once a minute
  const day = (name, steps) => `animation:${name} ${dayLength}s steps(${steps},end) ${start} infinite`

  const defs =
    `<linearGradient id="base" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c1533"/><stop offset="1" stop-color="#3a2445"/></linearGradient>` +
    `<linearGradient id="morning" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b3a6e"/><stop offset=".6" stop-color="#b86f7e"/><stop offset="1" stop-color="#f0a86a"/></linearGradient>` +
    `<linearGradient id="afternoon" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f4a7a"/><stop offset=".6" stop-color="#6c78a8"/><stop offset="1" stop-color="#d79a86"/></linearGradient>` +
    `<linearGradient id="evening" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1d52"/><stop offset=".6" stop-color="#8c3f78"/><stop offset="1" stop-color="#e2735e"/></linearGradient>` +
    `<linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b0b1e"/><stop offset="1" stop-color="#1e1838"/></linearGradient>` +
    `<radialGradient id="orb"><stop offset="0" stop-color="#ffe2b8" stop-opacity=".55"/><stop offset="1" stop-color="#ffe2b8" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="orbPink"><stop offset="0" stop-color="#ffb3d1" stop-opacity=".5"/><stop offset="1" stop-color="#ffb3d1" stop-opacity="0"/></radialGradient>`

  // Background layers, each strongest in its part of the day.
  const layers =
    frames('morning', [[0, 0], [4.5, 0], [7, 1], [10.5, 1], [12.5, 0], [24, 0]]) +
    frames('afternoon', [[0, 0], [10.5, 0], [12.5, 1], [16, 1], [17.5, 0], [24, 0]]) +
    frames('evening', [[0, 0], [16, 0], [17.5, 1], [20, 1], [21.5, 0], [24, 0]]) +
    frames('night', [[0, 1], [4.5, 1], [7, 0], [20, 0], [21.5, 1], [24, 1]])
  const sky = ['morning', 'afternoon', 'evening', 'night'].map((n) => `<rect width="${W}" height="${H}" fill="url(#${n})" style="${day(n, fade)}"/>`).join('')

  // Soft lights drifting up across the whole scene.
  let orbs = '', orbCss = ''
  for (let i = 0; i < 16; i++) {
    const x = f(rnd() * W), r = f(30 + rnd() * 70), dur = onTick(30 + rnd() * 30), rise = Math.round(H + 2 * r + 100)
    orbCss += `@keyframes rise${i}{from{transform:translate(0,0)}to{transform:translate(${Math.round(rnd() * 80 - 40)}px,-${rise}px)}}`
    orbs += `<g transform="translate(${x} ${f(H + r)})"><circle r="${r}" fill="url(#${i % 3 ? 'orb' : 'orbPink'})" style="animation:rise${i} ${dur}s steps(${Math.round(dur / TICK)},end) -${onTick(rnd() * dur)}s infinite"/></g>`
  }
  // A few sparkles twinkling.
  const sparkles = ['', '']
  for (let i = 0; i < 24; i++) {
    const x = f(rnd() * W), y = f(rnd() * H * 0.8), s = f(3 + rnd() * 4)
    sparkles[i % 2] += `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -1.6Q.18 -.18 1.6 0Q.18 .18 0 1.6Q-.18 .18 -1.6 0Q-.18 -.18 0 -1.6Z"/>`
  }
  const twinkles = sparkles.map((g, i) => `<g fill="#fff1d6" style="animation:tw ${[2.4, 3.2][i]}s steps(1,end) -${i}s infinite">${g}</g>`).join('')

  // The card: greeting and the hour's line, on the right of the chat column.
  const CX = 1314, CY = 360, CW = 268, CH = 214
  const FONT = `font-family="Segoe UI, Helvetica Neue, Arial, sans-serif"`
  const greetings = GREETINGS.map(([text, a, b], i) =>
    `<text x="${CX + 24}" y="${CY + 48}" ${FONT} font-size="20" font-weight="700" fill="#ffd2a1" style="${day(`g${i}`, 1)}">${text}</text>`).join('')
  const quotes = QUOTES.map((lines, h) =>
    `<g style="${day(`q${h}`, 1)}">${lines.map((line, k) => `<text x="${CX + 24}" y="${CY + 100 + k * 38}" ${FONT} font-size="26" font-weight="600" fill="#ffffff">${line}</text>`).join('')}</g>`).join('')
  const card =
    `<rect x="${CX}" y="${CY}" width="${CW}" height="${CH}" rx="18" fill="#140f24" fill-opacity=".62" stroke="#ffffff" stroke-opacity=".16"/>` +
    `<circle cx="${CX + CW - 32}" cy="${CY + 40}" r="7" fill="#ffc98f"/>` + greetings + quotes

  const css =
    layers + orbCss +
    GREETINGS.map(([, a, b], i) => window(`g${i}`, a, b)).join('') +
    QUOTES.map((_, h) => window(`q${h}`, h, h + 1)).join('') +
    `@keyframes tw{0%{opacity:1}50%{opacity:.2}}`

  return svgDoc({
    defs,
    css,
    body: `<rect width="${W}" height="${H}" fill="url(#base)"/>` + sky + orbs + twinkles + card,
  })
}
