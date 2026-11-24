// Sunrise over the mountains with a fresh line of motivation every 15 seconds: a card on the right
// fades from one short, original line to the next, with a bar that fills while each one shows. A
// small climber works up the trail to a flag waving on the summit, clouds drift, birds cross, and
// the sun's glow breathes. Every change lands on the shared 0.1 s tick.
import { H, W, f, rng, svgDoc } from './_lib.mjs'

// Original lines, pre-split to fit the card, so nothing is misattributed. Only encouragement: no
// telling people to rest, sleep, eat, stretch or step away. No < > or & in the text.
const QUOTES = [
  ['Every summit', 'starts with', 'one step.'],
  ['Small progress', 'is still progress.'],
  ['You are closer', 'than you think.'],
  ['The hard part is', 'where you grow.'],
  ['Keep going.', 'It all adds up.'],
  ['One problem solved', 'is a real win.'],
  ['Doubt less.', 'Build more.'],
  ['The climb is', 'making you strong.'],
  ['Done today beats', 'perfect someday.'],
  ['You have handled', 'tough days before.'],
  ['Make it work.', 'Then make it', 'great.'],
  ['Momentum loves', 'a small start.'],
  ['Your effort', 'is showing.'],
  ['Stay curious.', 'Stay at it.'],
  ['Every try teaches', 'you something.'],
  ['Big goals,', 'steady steps.'],
  ['Hard things get', 'easier with reps.'],
  ['Trust the work', 'you put in.'],
  ['Climb your own', 'mountain.'],
  ['Today is a good', 'day to finish it.'],
]
const SHOW = 15 // seconds per line
const CYCLE = QUOTES.length * SHOW // 300 s

export default function scene() {
  const rnd = rng(0x5033)
  const pct = (s) => f((s / CYCLE) * 100)
  const at = (k, step) => `-${(CYCLE - k * step) % CYCLE}s`

  const defs =
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#211f52"/><stop offset=".4" stop-color="#6a4688"/><stop offset=".62" stop-color="#d9708a"/><stop offset=".74" stop-color="#ffb06e"/><stop offset="1" stop-color="#ffd08a"/></linearGradient>` +
    `<radialGradient id="glow"><stop offset="0" stop-color="#ffe0a0" stop-opacity=".75"/><stop offset=".45" stop-color="#ffb070" stop-opacity=".25"/><stop offset="1" stop-color="#ffb070" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="peakL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a2150"/><stop offset="1" stop-color="#3a2d64"/></linearGradient>` +
    `<linearGradient id="mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd8c8" stop-opacity="0"/><stop offset=".5" stop-color="#ffd8c8" stop-opacity=".18"/><stop offset="1" stop-color="#ffd8c8" stop-opacity="0"/></linearGradient>`

  // Sky, sun and its glow, drifting clouds.
  let body = `<rect width="${W}" height="${H}" fill="url(#sky)"/>`
  body += `<circle cx="860" cy="650" r="460" fill="url(#glow)" style="animation:breathe 6s steps(1,end) infinite"/>`
  body += `<circle cx="860" cy="655" r="96" fill="#ffe6a8"/><circle cx="860" cy="655" r="78" fill="#fff2c8"/>`
  const cloud = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="120" ry="16"/><ellipse cx="-40" cy="-12" rx="56" ry="16"/><ellipse cx="34" cy="-16" rx="62" ry="20"/></g>`
  body += `<g fill="#ffd0c4" opacity=".42" style="animation:drift 120s steps(120,end) infinite alternate">${cloud(260, 170, 1)}${cloud(1180, 120, 0.8)}${cloud(720, 300, 1.2)}</g>`
  body += `<g fill="#ffc4b0" opacity=".3" style="animation:drift2 90s steps(90,end) infinite alternate">${cloud(1420, 260, 0.9)}${cloud(520, 90, 0.7)}</g>`

  // Stars still fading out high up.
  let stars = ''
  for (let i = 0; i < 40; i++) stars += `<circle cx="${f(rnd() * W)}" cy="${f(rnd() * 200)}" r="${f(1 + rnd() * 1.4)}"/>`
  body += `<g fill="#fff4e8" fill-opacity=".7" style="animation:tw 3s steps(1,end) infinite">${stars}</g>`

  // Ridges, far to near.
  const ridge = (base, pts, fill, op = 1) => `<path d="M0 ${H}L0 ${base}${pts.map(([x, y]) => `L${x} ${y}`).join('')}L${W} ${base}L${W} ${H}Z" fill="${fill}" fill-opacity="${op}"/>`
  body += ridge(640, [[120, 600], [260, 560], [420, 610], [600, 540], [760, 600], [980, 560], [1140, 520], [1300, 590], [1460, 548]], '#a06a9c')
  body += ridge(700, [[160, 640], [340, 600], [520, 660], [700, 620], [940, 680], [1120, 600], [1260, 630], [1440, 570], [1560, 610]], '#6e4c8a')
  body += `<rect x="0" y="600" width="${W}" height="160" fill="url(#mist)"/>`

  // The main peak on the left: a shadowed west face, a sunlit east face, and a snowcap.
  const SX = 400, SY = 250
  body += `<path d="M-40 ${H}L${SX} ${SY}L${SX + 40} ${SY + 70}L${SX + 10} ${SY + 140}L${SX + 70} ${SY + 260}L${SX + 30} ${SY + 400}L${SX + 120} ${SY + 560}L${SX + 60} ${H}Z" fill="url(#peakL)"/>`
  body += `<path d="M${SX} ${SY}L${SX + 230} ${SY + 260}L${SX + 330} ${SY + 380}L${SX + 470} ${SY + 520}L${SX + 560} ${H}L${SX + 60} ${H}L${SX + 120} ${SY + 560}L${SX + 30} ${SY + 400}L${SX + 70} ${SY + 260}L${SX + 10} ${SY + 140}L${SX + 40} ${SY + 70}Z" fill="#54407e"/>`
  body += `<path d="M${SX} ${SY}L${SX + 64} ${SY + 74}L${SX + 46} ${SY + 70}L${SX + 36} ${SY + 82}L${SX + 40} ${SY + 70}Z" fill="#f6e2e6"/>`
  body += `<path d="M${SX} ${SY}L${SX + 40} ${SY + 70}L${SX + 22} ${SY + 90}L${SX + 4} ${SY + 72}L${SX - 20} ${SY + 94}L${SX - 34} ${SY + 70}Z" fill="#b9a6cc"/>`
  // A smaller peak on the right, behind the card.
  body += `<path d="M1150 ${H}L1450 560L1530 620L1600 584L1600 ${H}Z" fill="#3e2f68"/><path d="M1450 560L1490 594L1468 600L1450 588L1426 600Z" fill="#e8d4e0"/>`

  // The trail: switchbacks up the sunlit face, with the climber's stops along it.
  const TRAIL = [[820, 840], [640, 770], [740, 690], [580, 620], [660, 540], [520, 470], [560, 390], [470, 330], [SX + 12, SY + 22]]
  body += `<path d="M${TRAIL.map(([x, y]) => `${x} ${y}`).join('L')}" fill="none" stroke="#ffd8b0" stroke-opacity=".55" stroke-width="3" stroke-dasharray="7 9" stroke-linecap="round"/>`
  const climber = (x, y) => `<g transform="translate(${x} ${y})"><circle cx="0" cy="-17" r="4"/><path d="M-3 -12h6v9h-6z"/><path d="M-6 -12h4v7h-4z" fill="#ff7a5a"/><path d="M-3 -3l-2 7M3 -3l2 7" stroke="#1a1430" stroke-width="2.4" stroke-linecap="round"/><path d="M4 -10l6 10" stroke="#e8c8a8" stroke-width="1.6"/></g>`
  // Ten stops spaced evenly along the trail, the last one at the top.
  const STOPS = 10, STOP = CYCLE / STOPS
  const segs = TRAIL.slice(1).map((b, i) => Math.hypot(b[0] - TRAIL[i][0], b[1] - TRAIL[i][1])), total = segs.reduce((a, b) => a + b, 0)
  const along = (d) => { let i = 0; while (i < segs.length - 1 && d > segs[i]) d -= segs[i++]; const a = TRAIL[i], b = TRAIL[i + 1], t = Math.min(1, d / segs[i]); return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t] }
  for (let i = 0; i < STOPS; i++) {
    const [px, py] = along(total * (0.04 + (0.96 * i) / (STOPS - 1))), x = f(px), y = f(py)
    body += `<g fill="#1a1430" style="animation:stop ${CYCLE}s steps(1,end) ${at(i, STOP)} infinite">${climber(x, y)}</g>`
  }
  // The summit flag, waving in three frames.
  body += `<path d="M${SX} ${SY}V${SY - 64}" stroke="#2a2040" stroke-width="3"/>`
  const FLAGS = [
    `M${SX + 1} ${SY - 63}C${SX + 18} ${SY - 70} ${SX + 30} ${SY - 56} ${SX + 46} ${SY - 60}L${SX + 44} ${SY - 38}C${SX + 30} ${SY - 34} ${SX + 18} ${SY - 46} ${SX + 1} ${SY - 41}Z`,
    `M${SX + 1} ${SY - 63}C${SX + 16} ${SY - 58} ${SX + 30} ${SY - 68} ${SX + 46} ${SY - 62}L${SX + 46} ${SY - 40}C${SX + 30} ${SY - 46} ${SX + 16} ${SY - 36} ${SX + 1} ${SY - 41}Z`,
    `M${SX + 1} ${SY - 63}C${SX + 14} ${SY - 64} ${SX + 32} ${SY - 60} ${SX + 46} ${SY - 66}L${SX + 45} ${SY - 44}C${SX + 32} ${SY - 38} ${SX + 14} ${SY - 42} ${SX + 1} ${SY - 41}Z`,
  ]
  body += FLAGS.map((d, k) => `<path d="${d}" fill="#ff6b5a" style="animation:f3 0.9s steps(1,end) -${f(k * 0.3)}s infinite"/>`).join('')

  // Birds crossing, wings up and down.
  const bird = (x, y, up) => `<path transform="translate(${x} ${y})" d="${up ? 'M-9 -5Q-4 -1 0 2Q4 -1 9 -5' : 'M-9 2Q-4 -2 0 2Q4 -2 9 2'}"/>`
  const flock = (up) => [[0, 0], [22, 10], [-18, 14]].map(([x, y]) => bird(x, y, up)).join('')
  body += `<g style="animation:fly 64s steps(320,end) -20s infinite"><g transform="translate(1700 210)" fill="none" stroke="#3a2a50" stroke-width="2.2" stroke-linecap="round">` +
    [true, false].map((up, k) => `<g style="animation:f2 0.6s steps(1,end) -${f(k * 0.3)}s infinite">${flock(up)}</g>`).join('') + `</g></g>`

  // Foreground pines.
  let pines = ''
  for (let i = 0; i < 26; i++) {
    const x = f((i / 25) * W + rnd() * 30 - 15), h = f(70 + rnd() * 110), w = f(h * 0.32)
    pines += `<path d="M${x} ${f(H - 60 - h)}L${f(x + w)} ${H - 40}L${f(x - w)} ${H - 40}Z"/>`
  }
  body += `<g fill="#1c1634">${pines}</g><rect x="0" y="${H - 44}" width="${W}" height="44" fill="#1c1634"/>`

  // The card: a header, the current line (fading in and out), and a bar that fills while it shows.
  const CX = 1314, CY = 300, CW = 268, CH = 212
  const FONT = `font-family="Segoe UI, Helvetica Neue, Arial, sans-serif"`
  body += `<rect x="${CX}" y="${CY}" width="${CW}" height="${CH}" rx="18" fill="#171230" fill-opacity=".62" stroke="#ffffff" stroke-opacity=".16"/>`
  body += `<path d="M${CX + 24} ${CY + 44}l9 -15l6 9l4 -6l9 12z" fill="#ffb86b"/><text x="${CX + 62}" y="${CY + 43}" ${FONT} font-size="18" font-weight="700" fill="#ffc98f">Keep climbing</text>`
  body += QUOTES.map((lines, k) => `<g style="animation:q ${CYCLE}s steps(1,end) ${at(k, SHOW)} infinite">${lines.map((line, i) => `<text x="${CX + 24}" y="${CY + 92 + i * 34}" ${FONT} font-size="24" font-weight="600" fill="#ffffff">${line}</text>`).join('')}</g>`).join('')
  body += `<rect x="${CX + 24}" y="${CY + CH - 26}" width="${CW - 48}" height="4" rx="2" fill="#ffffff" fill-opacity=".14"/>`
  body += `<rect x="${CX + 24}" y="${CY + CH - 26}" width="${CW - 48}" height="4" rx="2" fill="#ffb86b" style="transform-origin:${CX + 24}px 0;animation:bar ${SHOW}s steps(${SHOW},end) infinite"/>`

  const css =
    `@keyframes q{0%{opacity:0;animation-timing-function:steps(3,end)}${pct(0.3)}%{opacity:1;animation-timing-function:steps(1,end)}${pct(SHOW - 0.3)}%{opacity:1;animation-timing-function:steps(3,end)}${pct(SHOW)}%{opacity:0}100%{opacity:0}}` +
    `@keyframes stop{0%{opacity:1}${pct(STOP)}%{opacity:0}}` +
    `@keyframes bar{0%{transform:scaleX(0)}100%{transform:scaleX(1)}}` +
    `@keyframes f2{0%{opacity:1}50%{opacity:0}}@keyframes f3{0%{opacity:1}33.333%{opacity:0}}` +
    `@keyframes breathe{0%{opacity:.85}50%{opacity:1}}@keyframes tw{0%{opacity:.7}50%{opacity:.35}}` +
    `@keyframes drift{0%{transform:translate(0,0)}100%{transform:translate(-120px,0)}}` +
    `@keyframes drift2{0%{transform:translate(0,0)}100%{transform:translate(90px,0)}}` +
    `@keyframes fly{0%{transform:translate(0,0)}100%{transform:translate(-1920px,60px)}}`

  return svgDoc({ defs, css, body })
}
