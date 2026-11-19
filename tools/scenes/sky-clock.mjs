// A valley whose sky follows the local time of day: dawn, morning, afternoon, sunset, and a starry
// night, with the sun and moon crossing overhead, a cabin whose windows light up in the evening,
// and birds by day. Everything time-of-day runs on one 24-hour cycle (DAY seconds) built to start
// at noon; the theme's render hook swaps that start (CLOCK_MARK) for the computer's local time.
// Those animations step once a minute, so the sky costs almost nothing; only clouds, stars and
// birds move on the usual 0.1 s tick.
import { H, TICK, W, f, rng, svgDoc } from './_lib.mjs'

const CLOCK_MARK = '-43200.01s' // noon, replaced at render time; must match build-themes.mjs
const HORIZON = 720

// Keyframes from [hour, css] pairs, as percentages of the day.
const frames = (name, stops) => `@keyframes ${name}{${stops.map(([h, css]) => `${f((h / 24) * 100)}%{${css}}`).join('')}}`
const op = (stops) => stops.map(([h, v]) => [h, `opacity:${v}`])

// The sun's path: up from behind the hills at 6:00, highest at 12:30, down behind them by 19:00.
const sunAt = (h) => {
  const t = (h - 6) / 13
  if (t < 0 || t > 1) return [h < 6 ? 150 : 1450, HORIZON + 200]
  return [150 + t * 1300, HORIZON - Math.sin(Math.PI * t) * 560]
}
// The moon's path: rises at 19:00, highest around 0:30, sets at 6:00.
const moonAt = (h) => {
  const t = (((h - 19) % 24) + 24) % 24 / 11
  if (t > 1) return [h > 12 ? 150 : 1450, HORIZON + 200]
  return [150 + t * 1300, HORIZON - Math.sin(Math.PI * t) * 480]
}
const path = (at) => Array.from({ length: 49 }, (_, i) => {
  const [x, y] = at(i / 2)
  return [i / 2, `transform:translate(${f(x)}px,${f(y)}px)`]
})

export default function scene({ dayLength = 86400, startHour = null } = {}) {
  const rnd = rng(0x5c10c)
  // The preview squeezes the day into a few seconds and starts where it likes; the real theme
  // starts at the mark, which the render hook replaces.
  const start = startHour === null ? CLOCK_MARK : `-${f((startHour / 24) * dayLength)}s`
  const steps = dayLength === 86400 ? 60 : 4 // per keyframe interval: about once a minute for real
  const day = (name) => `animation:${name} ${dayLength}s steps(${steps},end) ${start} infinite`

  const NIGHT = op([[0, 1], [5, 1], [6.5, 0], [18.5, 0], [20, 1], [24, 1]])
  const css =
    frames('night', NIGHT) +
    frames('dawn', op([[0, 0], [4.5, 0], [6, 1], [7.5, 0], [24, 0]])) +
    frames('dusk', op([[0, 0], [17, 0], [18.25, 1], [19.25, 0.6], [20, 0], [24, 0]])) +
    frames('shade', op([[0, 0.72], [5, 0.72], [6.5, 0.25], [8, 0], [17, 0], [18.5, 0.25], [20, 0.72], [24, 0.72]])) +
    frames('warm', op([[0, 0], [5, 0], [6, 0.24], [7.5, 0], [17, 0], [18.25, 0.3], [19.5, 0], [24, 0]])) +
    frames('clouds', op([[0, 0.12], [5, 0.12], [6.5, 0.5], [18, 0.5], [19.5, 0.15], [24, 0.12]])) +
    frames('birds', op([[0, 0], [7, 0], [8, 1], [16, 1], [17, 0], [24, 0]])) +
    frames('lamps', op([[0, 0], [5, 0], [5.5, 1], [7, 1], [7.5, 0], [17.5, 0], [18, 1], [23.5, 1], [24, 0]])) +
    frames('sunPath', path(sunAt)) + frames('moonPath', path(moonAt)) +
    `@keyframes tw{0%{opacity:1}50%{opacity:.25}}` +
    `@keyframes drift{to{transform:translateX(-${W}px)}}` +
    `@keyframes flyby{from{transform:translate(-200px,0)}to{transform:translate(${W + 200}px,-60px)}}` +
    `@keyframes flap{0%{opacity:1}50%{opacity:0}}`

  const defs =
    `<linearGradient id="daySky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d5a8c"/><stop offset="1" stop-color="#7fb2d8"/></linearGradient>` +
    `<linearGradient id="dawnSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34396a"/><stop offset=".6" stop-color="#c47a8e"/><stop offset="1" stop-color="#f4b779"/></linearGradient>` +
    `<linearGradient id="duskSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#29234f"/><stop offset=".55" stop-color="#b14b64"/><stop offset="1" stop-color="#f28a4a"/></linearGradient>` +
    `<linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#060a1a"/><stop offset="1" stop-color="#1a2546"/></linearGradient>` +
    `<radialGradient id="sunGlow"><stop offset="0" stop-color="#fff1c4" stop-opacity=".7"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="lampGlow"><stop offset="0" stop-color="#ffd27a" stop-opacity=".28"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="moonGlow"><stop offset="0" stop-color="#e8ecff" stop-opacity=".35"/><stop offset="1" stop-color="#e8ecff" stop-opacity="0"/></radialGradient>`

  // Stars, in three twinkle groups, shown only at night.
  const stars = ['', '', '']
  for (let i = 0; i < 150; i++) stars[i % 3] += `<circle cx="${f(rnd() * W)}" cy="${f(rnd() * 600)}" r="${f(0.7 + rnd() ** 3 * 1.8)}"/>`
  const starGroups = stars.map((g, i) => `<g style="animation:tw ${[2.4, 3.2, 4][i]}s steps(1,end) -${i}s infinite">${g}</g>`).join('')

  // Clouds, tiled twice across and drifting one width every 240 s.
  let puffs = ''
  for (let i = 0; i < 7; i++) {
    const x = rnd() * W, y = 90 + rnd() * 300, s = 0.7 + rnd() * 0.8
    for (const dx of [0, W]) {
      puffs += `<g transform="translate(${f(x + dx)} ${f(y)}) scale(${f(s)})"><ellipse rx="90" ry="26"/><ellipse cx="-40" cy="-14" rx="46" ry="30"/><ellipse cx="30" cy="-22" rx="54" ry="36"/></g>`
    }
  }

  // Hills, far mountains, pines, and a cabin.
  let ridge = `M0 ${H}V560`
  for (let x = 0; x <= W; x += 80) ridge += `L${x} ${f(520 + rnd() * 110 - (x % 400 === 0 ? 60 : 0))}`
  ridge += `L${W} ${H}Z`
  const hill = (y0, amp, fill) => {
    let d = `M0 ${H}V${y0}`
    for (let x = 0; x <= W; x += 200) d += `Q${x + 100} ${f(y0 - amp * (0.5 + rnd()))} ${x + 200} ${f(y0 + (rnd() - 0.5) * 30)}`
    return `<path d="${d}V${H}Z" fill="${fill}"/>`
  }
  let pines = ''
  for (let i = 0; i < 26; i++) {
    const x = f(rnd() * W), base = f(760 + rnd() * 70), h = f(40 + rnd() * 70)
    pines += `M${x} ${f(base - h)}L${f(x + h * 0.3)} ${base}H${f(x - h * 0.3)}Z`
  }
  const cabin =
    `<g transform="translate(1250 850)"><path d="M-70 0V-60L0 -110L70 -60V0Z" fill="#5a3b2e"/><path d="M-84 -56L0 -124L84 -56L76 -48L0 -110L-76 -48Z" fill="#3a2a24"/>` +
    `<rect x="40" y="-120" width="16" height="36" fill="#3a2a24"/>` +
    `<g style="${day('lamps')}"><rect x="-46" y="-48" width="28" height="24" fill="#ffd27a"/><rect x="18" y="-48" width="28" height="24" fill="#ffd27a"/><circle cx="0" cy="-30" r="110" fill="url(#lampGlow)"/></g>` +
    `<rect x="-12" y="-36" width="24" height="36" fill="#2b1d18"/></g>`

  // A small flock crossing by day; wings flap between two shapes.
  let flock = ''
  for (const [dx, dy] of [[0, 0], [-40, 18], [-70, -14], [-105, 10]]) {
    flock += `<g transform="translate(${dx} ${dy})"><path d="M-10 0Q-5 -8 0 0Q5 -8 10 0" fill="none" stroke="#1d2a3a" stroke-width="2.5" style="animation:flap 0.6s steps(1,end) infinite"/>` +
      `<path d="M-10 -4Q-5 2 0 -2Q5 2 10 -4" fill="none" stroke="#1d2a3a" stroke-width="2.5" style="animation:flap 0.6s steps(1,end) -0.3s infinite"/></g>`
  }

  // Dawn light and night shade fall on the land only: the ridge is the top of the landscape.
  const landClip = `<clipPath id="land"><path d="${ridge}"/></clipPath>`

  return svgDoc({
    defs: defs + landClip,
    css,
    body:
      `<rect width="${W}" height="${H}" fill="url(#daySky)"/>` +
      `<rect width="${W}" height="${H}" fill="url(#dawnSky)" style="${day('dawn')}"/>` +
      `<rect width="${W}" height="${H}" fill="url(#duskSky)" style="${day('dusk')}"/>` +
      `<rect width="${W}" height="${H}" fill="url(#nightSky)" style="${day('night')}"/>` +
      `<g fill="#f4f1dc" style="${day('night')}">${starGroups}</g>` +
      `<g style="${day('moonPath')}"><circle r="130" fill="url(#moonGlow)"/><circle r="44" fill="#eef0fa"/><circle cx="-12" cy="-8" r="8" fill="#d6dae8"/><circle cx="14" cy="12" r="6" fill="#d6dae8"/></g>` +
      `<g style="${day('sunPath')}"><circle r="200" fill="url(#sunGlow)"/><circle r="56" fill="#fff3c8"/><circle r="56" fill="#ff9a4a" style="${day('warm')}"/></g>` +
      `<g fill="#ffffff" style="${day('clouds')}"><g style="animation:drift 240s steps(2400,end) infinite">${puffs}</g></g>` +
      `<g style="${day('birds')}"><g transform="translate(0 260)"><g style="animation:flyby 40s steps(400,end) -12s infinite">${flock}</g></g></g>` +
      `<path d="${ridge}" fill="#4b6a8f"/>` + hill(700, 70, '#3f7a5a') + `<path d="${pines}" fill="#2a5a42"/>` + hill(830, 50, '#4f8f62') +
      cabin +
      `<g clip-path="url(#land)"><rect width="${W}" height="${H}" fill="#ff8a4a" style="${day('warm')}"/>` +
      `<rect width="${W}" height="${H}" fill="#081024" style="${day('shade')}"/></g>` +
      `<g style="${day('lamps')}"><circle cx="1250" cy="814" r="120" fill="url(#lampGlow)"/><rect x="1204" y="802" width="28" height="24" fill="#ffd27a"/><rect x="1268" y="802" width="28" height="24" fill="#ffd27a"/></g>`,
  })
}
