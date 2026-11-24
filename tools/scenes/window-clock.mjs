// A pixel-art room with a big window, a digital alarm clock, and a wall calendar, all on local
// time. The clock shows the hour and minute in 12-hour time with AM or PM and the time zone; the
// calendar shows today's month, date, and weekday; and the view out the window follows the time of
// day (dawn, day, golden hour, dusk, a starry night, the sun and moon crossing hour by hour) and the
// season (spring blossoms, summer green, autumn leaves, winter snow).
//
// Everything that keeps time runs from local midnight: the build marks the start with CLOCK_MARK
// (noon), and the render hook swaps in the seconds since local midnight. The hook also fills the
// calendar marks: __WEEKDAYi__, __MONTHi__, __DAYi__ for today and the next six days (each shown
// from its own midnight), __TZ__, and __SEASON__ (spring, summer, autumn or winter), which picks
// the one season group the CSS shows. Every change lands on the shared 0.1 s tick.
import { H, W, rng, svgDoc } from './_lib.mjs'
import { pixelGrid } from './_pixel.mjs'

const CLOCK_MARK = '-43200.01s' // noon, replaced at render time; must match build-themes.mjs
const P = 8, COLS = W / P, ROWS = H / P
const DAY = 86400
const WX = 24, WY = 8, WW = 126, WH = 62, HORIZON = 46
const DESK = 92
const INK = '#1a1420'
const LED = '#ff5a4a'
const FONT = `font-family="Segoe UI, Helvetica Neue, Arial, sans-serif"`
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

// 5 x 7 clock digits and 3 x 5 (M is 5 x 5) letters.
const DIGITS = [
  ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
  ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  ['.###.', '#...#', '....#', '..##.', '....#', '#...#', '.###.'],
  ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  ['..##.', '.#...', '#....', '####.', '#...#', '#...#', '.###.'],
  ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
  ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  ['.###.', '#...#', '#...#', '.####', '....#', '...#.', '.##..'],
]
const LETTERS = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
  P: ['##.', '#.#', '##.', '#..', '#..'],
  M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'],
}
const glyph = (g, rows, x, y, c) => rows.forEach((row, j) => [...row].forEach((ch, i) => { if (ch === '#') g.set(x + i, y + j, c) }))

// Percent of a cycle, precise enough that a step lands within a few hundredths of a second.
const pct = (s, cycle) => +((s / cycle) * 100).toFixed(5)
// Shown from second a to second b of a cycle, hidden otherwise.
const shown = (name, a, b, cycle) => a === 0
  ? `@keyframes ${name}{0%{opacity:1}${pct(b, cycle)}%{opacity:0}}`
  : b >= cycle
    ? `@keyframes ${name}{0%{opacity:0}${pct(a, cycle)}%{opacity:1}100%{opacity:1}}`
    : `@keyframes ${name}{0%{opacity:0}${pct(a, cycle)}%{opacity:1}${pct(b, cycle)}%{opacity:0}}`
// Opacity through the day, as [hour, value] stops.
const through = (name, stops) => `@keyframes ${name}{${stops.map(([h, v]) => `${pct(h * 3600, DAY)}%{opacity:${v}}`).join('')}}`

export default function scene({ start = null, season = null, date = null, tz = null } = {}) {
  const rnd = rng(0xc10c)
  const mark = start === null ? CLOCK_MARK : `-${start}s`
  const timed = (name, cycle, steps = 1) => `animation:${name} ${cycle}s steps(${steps},end) ${mark} infinite`
  const layer = () => pixelGrid(COLS, ROWS)
  const css = []
  let body = ''

  // Sky: night underneath, then dawn, day, golden hour, and dusk fading in and out in turn.
  const band = (id, colors) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${colors.map((c, i) => `<stop offset="${i / colors.length}" stop-color="${c}"/><stop offset="${(i + 1) / colors.length}" stop-color="${c}"/>`).join('')}</linearGradient>`
  const SKIES = {
    night: ['#0a0f2c', '#0e1436', '#121a40', '#17204a', '#1c2652'],
    dawn: ['#2c3070', '#5a4486', '#a0608e', '#e8888a', '#ffb88a'],
    day: ['#4f9ee6', '#62aaea', '#78b8ee', '#90c8f2', '#b4dcf6'],
    golden: ['#3e4a92', '#7a5a9a', '#d87a7a', '#f4a070', '#ffd08a'],
    dusk: ['#1e2058', '#38306e', '#664a88', '#a0608e', '#d08090'],
  }
  let defs = Object.entries(SKIES).map(([id, c]) => band(id, c)).join('')
  const skyRect = (id) => `<rect x="${WX * P}" y="${WY * P}" width="${WW * P}" height="${(HORIZON + 4 - WY) * P}" fill="url(#${id})"`
  body += `${skyRect('night')}/>`
  const SKY_STOPS = {
    dawn: [[0, 0], [4.5, 0], [6, 1], [8.5, 1], [8.6, 0], [24, 0]],
    day: [[0, 0], [7, 0], [8.5, 1], [17.2, 1], [17.3, 0], [24, 0]],
    golden: [[0, 0], [16, 0], [17.2, 1], [19.2, 1], [19.3, 0], [24, 0]],
    dusk: [[0, 0], [18.3, 0], [19.2, 1], [20, 1], [21, 0], [24, 0]],
  }
  for (const [id, stops] of Object.entries(SKY_STOPS)) { css.push(through(id, stops)); body += `${skyRect(id)} style="${timed(id, DAY, 60)}"/>` }

  // Stars at night.
  const stars = layer()
  for (let i = 0; i < 46; i++) stars.set(WX + Math.floor(rnd() * WW), WY + Math.floor(rnd() * (HORIZON - WY - 6)), i % 5 ? '#c8ccf0' : '#ffffff')
  css.push(through('stars', [[0, 1], [5, 1], [6.3, 0], [19.6, 0], [21, 1], [24, 1]]))
  body += `<g style="${timed('stars', DAY, 60)}">${stars.svg(P)}</g>`

  // The sun, hour by hour from 6 AM to 6 PM, and the moon from 7 PM to 5 AM.
  defs += `<radialGradient id="sunGlow"><stop offset="0" stop-color="#fff0b0" stop-opacity=".6"/><stop offset="1" stop-color="#fff0b0" stop-opacity="0"/></radialGradient>`
  defs += `<radialGradient id="moonGlow"><stop offset="0" stop-color="#dfe6ff" stop-opacity=".3"/><stop offset="1" stop-color="#dfe6ff" stop-opacity="0"/></radialGradient>`
  const arc = (t) => [Math.round(WX + 10 + t * (WW - 20)), Math.round(HORIZON + 4 - Math.sin(Math.PI * t) * 34)]
  for (let h = 6; h <= 18; h++) {
    const [x, y] = arc((h - 6) / 12), low = h <= 7 || h >= 17, g = layer()
    g.disc(x, y, 4, low ? '#ffb060' : '#ffe08a'); g.disc(x - 1, y - 1, 2, low ? '#ffd8a0' : '#fff6cc')
    css.push(shown(`sun${h}`, h * 3600, (h + 1) * 3600, DAY))
    body += `<g style="${timed(`sun${h}`, DAY)}"><circle cx="${x * P + 4}" cy="${y * P + 4}" r="${low ? 90 : 120}" fill="url(#sunGlow)"/>${g.svg(P)}</g>`
  }
  for (let h = 19; h <= 29; h++) {
    const [x, y] = arc((h - 19) / 11), g = layer()
    g.disc(x, y, 3, '#e8ecf8'); g.disc(x + 1, y - 1, 3, null); g.set(x - 2, y + 1, '#c8d0e8'); g.set(x - 1, y - 1, '#c8d0e8')
    g.disc(x, y, 3, '#e8ecf8'); g.disc(x + 2, y - 1, 2, '#0e1436')
    const hour = h % 24
    css.push(shown(`moon${hour}`, hour * 3600, (hour + 1) * 3600, DAY))
    body += `<g style="${timed(`moon${hour}`, DAY)}"><circle cx="${x * P + 4}" cy="${y * P + 4}" r="70" fill="url(#moonGlow)"/>${g.svg(P)}</g>`
  }

  // Clouds drifting, brighter by day.
  const clouds = layer()
  const cloud = (cx, cy, w) => { clouds.ellipse(cx, cy, w, 2, '#f4f0f8'); clouds.ellipse(cx - Math.round(w / 3), cy - 2, Math.round(w / 2), 2, '#f4f0f8'); clouds.ellipse(cx + Math.round(w / 4), cy - 3, Math.round(w / 2.5), 2, '#ffffff'); clouds.rect(cx - w + 1, cy + 2, w * 2 - 1, 1, '#d8d4e4') }
  cloud(48, 18, 9); cloud(98, 12, 11); cloud(134, 24, 7)
  css.push(through('clouds', [[0, 0.3], [5.5, 0.3], [7.5, 0.95], [17, 0.95], [20, 0.3], [24, 0.3]]))
  css.push('@keyframes drift{0%{transform:translate(0,0)}100%{transform:translate(-96px,0)}}')
  body += `<g style="${timed('clouds', DAY, 60)}"><g style="animation:drift 240s steps(12,end) infinite alternate">${clouds.svg(P)}</g></g>`

  // The landscape, one group per season; the CSS shows only the current one.
  const SEASONS = {
    spring: { hill: ['#6aa880', '#5a9470'], ground: ['#78c070', '#68a860'], leaf: ['#e888b0', '#f4a8c8', '#ffd4e6'], bits: ['#ffffff', '#ffb8d0', '#ffe08a'], fall: '#ffc8dc', roof: '#a8504a' },
    summer: { hill: ['#4a9458', '#3c7e4a'], ground: ['#58a850', '#4a9444'], leaf: ['#2f7030', '#3a8a3a', '#5aa850'], bits: ['#ffe08a', '#ffffff', '#ff9a5a'], fall: null, roof: '#a8504a' },
    autumn: { hill: ['#b0844a', '#946a3a'], ground: ['#a89048', '#8a7438'], leaf: ['#c85a2a', '#e08a3a', '#f4b860'], bits: ['#e0702a', '#c84a2a', '#f4b03a'], fall: '#e0782a', roof: '#a8504a' },
    winter: { hill: ['#e2eaf4', '#c4d2e4'], ground: ['#f2f6fb', '#d6e0ee'], leaf: null, bits: [], fall: '#ffffff', roof: '#f4f8fc' },
  }
  const landscape = (name, s) => {
    const g = layer()
    for (let x = WX; x < WX + WW; x++) {
      const far = 7 + Math.round(3 * Math.sin(x / 9) + 2 * Math.sin(x / 4.3)), near = 3 + Math.round(2 * Math.sin(x / 13 + 1))
      g.rect(x, HORIZON - far, 1, far + 2, s.hill[1]); g.rect(x, HORIZON - near, 1, near + 2, s.hill[0])
    }
    g.rect(WX, HORIZON + 2, WW, WY + WH - HORIZON - 2, s.ground[0])
    for (let y = HORIZON + 3; y < WY + WH; y += 2) for (let x = WX + ((y * 5) % 7); x < WX + WW; x += 7) g.set(x, y, s.ground[1])
    for (let i = 0; i < s.bits.length * 9; i++) g.set(WX + Math.floor(rnd() * WW), HORIZON + 4 + Math.floor(rnd() * (WY + WH - HORIZON - 5)), s.bits[i % s.bits.length])
    // A cottage across the field.
    const HX = 108, HY = 44
    g.rect(HX, HY, 14, 8, '#d8c4a8'); g.rect(HX, HY + 7, 14, 1, '#b8a488')
    g.poly([[HX - 2, HY], [HX + 16, HY], [HX + 7, HY - 7]], s.roof); g.rect(HX + 11, HY - 7, 2, 4, '#7a5a4a')
    if (name === 'winter') { g.rect(HX - 2, HY - 1, 18, 1, '#ffffff'); g.rect(HX + 11, HY - 8, 2, 1, '#ffffff') }
    else g.rect(HX - 2, HY - 1, 18, 1, '#8a3a34')
    g.rect(HX + 2, HY + 2, 3, 3, '#3a3448'); g.rect(HX + 9, HY + 2, 3, 3, '#3a3448'); g.rect(HX + 6, HY + 3, 2, 5, '#6a4a3a')
    // The tree by the fence.
    const TX = 46, TY = 34
    g.rect(TX - 1, TY, 3, HORIZON + 14 - TY, '#6a4a3a'); g.rect(TX + 2, TY + 6, 4, 1, '#6a4a3a'); g.rect(TX - 5, TY + 4, 4, 1, '#6a4a3a'); g.rect(TX + 5, TY + 2, 1, 4, '#6a4a3a'); g.rect(TX - 5, TY + 1, 1, 3, '#6a4a3a')
    if (s.leaf) {
      for (const [dx, dy, r] of [[0, -4, 8], [-7, 0, 6], [7, 1, 6], [-3, 3, 6], [4, -9, 5]]) g.disc(TX + dx, TY + dy, r, s.leaf[0])
      for (const [dx, dy, r] of [[-1, -6, 6], [-7, -2, 4], [6, -1, 4], [3, -10, 3]]) g.disc(TX + dx, TY + dy, r, s.leaf[1])
      for (const [dx, dy, r] of [[-3, -9, 2], [-8, -3, 1], [4, -3, 1]]) g.disc(TX + dx, TY + dy, r, s.leaf[2])
    } else {
      // Bare branches, each a line from the trunk with snow along its top.
      const line = (x0, y0, x1, y1) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) { const x = Math.round(x0 + ((x1 - x0) * i) / n), y = Math.round(y0 + ((y1 - y0) * i) / n); g.set(x, y, '#6a4a3a'); if (i % 2 === 0 && i > 1) g.set(x, y - 1, '#ffffff') } }
      g.rect(TX, TY - 6, 1, 6, '#6a4a3a')
      for (const [x0, y0, x1, y1] of [[0, 8, -8, 1], [1, 6, 8, -1], [0, 2, -6, -6], [1, 0, 6, -8], [0, -5, -3, -11], [0, -5, 3, -12], [-5, 3, -9, 0], [5, 2, 9, 0]]) line(TX + x0, TY + y0, TX + x1, TY + y1)
      // A snowman in the field.
      g.disc(76, 58, 3, '#ffffff'); g.disc(76, 53, 2, '#ffffff'); g.set(75, 53, INK); g.set(77, 53, INK); g.set(76, 54, '#ff8a3a'); g.rect(74, 50, 5, 1, INK); g.rect(75, 48, 3, 2, INK); g.set(76, 57, INK); g.set(76, 59, INK)
    }
    // A fence along the bottom of the view.
    for (let x = WX + 2; x < WX + WW; x += 6) { g.rect(x, WY + WH - 9, 1, 7, '#8a6a50'); if (name === 'winter') g.set(x, WY + WH - 10, '#ffffff') }
    g.rect(WX, WY + WH - 7, WW, 1, '#9a7a5a'); g.rect(WX, WY + WH - 4, WW, 1, '#9a7a5a')
    if (name === 'winter') g.rect(WX, WY + WH - 8, WW, 1, '#ffffff')
    return g
  }
  const falling = (color, count, drift) => [0, 1, 2].map((k) => {
    const g = layer()
    for (let i = 0; i < count; i++) {
      const x = WX + ((i * 37 + k * drift) % WW), y = WY + ((i * 17 + k * 4) % (WH - 2))
      g.set(x, y, color); if (drift > 2 && i % 2) g.set(x + 1, y, color)
    }
    return g
  })
  const frames = (grids, period) => grids.map((g, k) => `<g style="animation:f${grids.length} ${period}s steps(1,end) -${((k * period) / grids.length).toFixed(1)}s infinite">${g.svg(P)}</g>`).join('')
  const SEASON = season ?? '__SEASON__'
  css.push(`.season{display:none}.s-${SEASON}{display:inline}`)
  for (const [name, s] of Object.entries(SEASONS)) {
    let moving = ''
    if (name === 'winter') moving = frames(falling(s.fall, 40, 1), 0.9)
    else if (s.fall) moving = frames(falling(s.fall, 16, 3), 1.8)
    else {
      // Summer: two butterflies flitting over the field.
      const flits = [0, 1].map((k) => { const g = layer(); for (const [x, y] of [[66, 54], [92, 58]]) { const yy = y - k; g.set(x - 1, yy, '#ffd166'); g.set(x + 1, yy, '#ffd166'); g.set(x, yy + 1, INK); if (k) { g.set(x - 1, yy - 1, '#ffd166'); g.set(x + 1, yy - 1, '#ffd166') } } return g })
      moving = frames(flits, 0.4)
    }
    body += `<g class="season s-${name}">${landscape(name, s).svg(P)}${moving}</g>`
  }

  // Night falls over the field; the cottage windows light up.
  defs += `<linearGradient id="dark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0f2c" stop-opacity="0"/><stop offset=".45" stop-color="#0a0f2c" stop-opacity=".85"/><stop offset="1" stop-color="#0a0f2c"/></linearGradient>`
  css.push(through('dark', [[0, 0.6], [5, 0.6], [7, 0.05], [8.5, 0], [17, 0], [19, 0.2], [20.5, 0.6], [24, 0.6]]))
  body += `<rect x="${WX * P}" y="${(WY + 12) * P}" width="${WW * P}" height="${(WH - 12) * P}" fill="url(#dark)" style="${timed('dark', DAY, 60)}"/>`
  const lit = layer(); lit.rect(110, 46, 3, 3, '#ffd27a'); lit.rect(117, 46, 3, 3, '#ffd27a')
  css.push(through('lit', [[0, 1], [6.5, 1], [7.2, 0], [17.8, 0], [18.5, 1], [24, 1]]))
  body += `<g style="${timed('lit', DAY, 6)}">${lit.svg(P)}</g>`

  // The room, drawn over everything with the window left open.
  const px = pixelGrid(COLS, ROWS)
  px.gradient(0, DESK, ['#241c2a', '#2a2130', '#302636'])
  for (let x = 2; x < COLS; x += 6) px.rect(x, 0, 1, DESK, '#2c2333')
  // Window frame, mullions, and sill.
  px.rect(WX - 3, WY - 3, WW + 6, WH + 6, '#7a5a44'); px.rect(WX - 2, WY - 2, WW + 4, WH + 4, '#9a7458')
  for (let y = WY; y < WY + WH; y++) for (let x = WX; x < WX + WW; x++) px.g[y][x] = null
  px.rect(WX + WW / 2 - 1, WY, 2, WH, '#9a7458'); px.rect(WX, WY + 24, WW, 2, '#9a7458')
  px.rect(WX - 6, WY + WH + 2, WW + 12, 3, '#a8805e'); px.rect(WX - 6, WY + WH + 5, WW + 12, 1, '#6a4a36')
  // Curtains on a rod.
  px.rect(WX - 14, WY - 6, WW + 28, 2, '#5a4a40'); px.disc(WX - 15, WY - 5, 1, '#c8a050'); px.disc(WX + WW + 14, WY - 5, 1, '#c8a050')
  const curtain = (x0, flip) => {
    for (let y = WY - 4; y < WY + WH + 8; y++) {
      const pinch = y > WY + 30 && y < WY + 36 ? 3 : 0
      for (let i = 0; i < 11 - pinch; i++) {
        const x = flip ? x0 + 10 - i : x0 + i
        px.set(x, y, (i + (flip ? 1 : 0)) % 4 === 0 ? '#3a5866' : (i % 4 === 2 ? '#5a7a88' : '#4a6a78'))
      }
    }
    px.rect(flip ? x0 + 3 : x0, WY + 32, 8, 2, '#c8a050')
  }
  curtain(WX - 14, false); curtain(WX + WW + 3, true)
  // A plant on the sill.
  px.rect(136, WY + WH - 3, 6, 5, '#b8673d'); px.rect(136, WY + WH - 3, 6, 1, '#d07a4a')
  for (const [dx, dy] of [[0, -3], [2, -5], [4, -3], [1, -7], [3, -8], [5, -5]]) px.rect(136 + dx, WY + WH - 3 + dy, 2, 3, '#5fa06a')
  // Wall calendar: rings, red header, and the page (the text is drawn over it).
  const CX0 = 166, CW = 31
  px.set(CX0 + 15, 8, '#8a8a9a')
  px.rect(CX0, 12, CW, 8, '#c8423a'); px.rect(CX0, 12, CW, 1, '#e0605a')
  px.rect(CX0, 20, CW, 24, '#f4efe6'); px.rect(CX0, 43, CW, 1, '#d8d0c4'); px.rect(CX0 + 1, 44, CW, 1, '#1e1824')
  for (const x of [CX0 + 5, CX0 + 15, CX0 + 25]) { px.rect(x, 10, 1, 4, '#3a3440'); px.set(x, 10, '#8a8a9a') }
  px.poly([[CX0 + CW - 4, 44], [CX0 + CW, 40], [CX0 + CW, 44]], '#d8d0c4')
  // Desk with books and a mug.
  px.rect(0, DESK, COLS, 3, '#8a5e40'); px.rect(0, DESK, COLS, 1, '#a07050'); px.rect(0, DESK + 3, COLS, ROWS - DESK - 3, '#5a3a28')
  for (const x of [40, 100, 160]) { px.rect(x, DESK + 8, 30, 1, '#4a2f20'); px.rect(x + 13, DESK + 11, 4, 1, '#a07050') }
  for (const [x, w, h, c] of [[6, 4, 12, '#5a7ab8'], [10, 3, 10, '#b8577a'], [13, 4, 13, '#e8b14a'], [17, 3, 9, '#4f9a6a']]) { px.rect(x, DESK - h, w, h, c); px.rect(x, DESK - h + 2, w, 1, '#f0e8dc') }
  px.rect(30, DESK - 6, 6, 6, '#e8e2d8'); px.rect(36, DESK - 5, 2, 3, '#e8e2d8'); px.rect(31, DESK - 6, 4, 1, '#6b4532')
  // The alarm clock: body, feet, dark display with faint unlit digits.
  const KX = 164, KY = 60
  px.rect(KX, KY, 35, 31, '#3a3448'); px.rect(KX, KY, 35, 1, '#5a5468'); px.set(KX, KY, null); px.set(KX + 34, KY, null)
  px.rect(KX + 2, KY + 2, 31, 22, '#100a0e')
  px.rect(KX + 3, DESK - 1, 4, 1, '#2a2434'); px.rect(KX + 28, DESK - 1, 4, 1, '#2a2434')
  px.rect(KX + 3, KY + 27, 3, 2, '#5a5468'); px.rect(KX + 8, KY + 27, 3, 2, '#5a5468'); px.disc(KX + 30, KY + 28, 1, '#7a7488')
  const DX = [KX + 4, KX + 10, KX + 18, KX + 24], DY = KY + 5
  for (const x of DX) glyph(px, DIGITS[8], x, DY, '#2a1214')
  body += px.svg(P)
  defs += `<radialGradient id="led"><stop offset="0" stop-color="${LED}" stop-opacity=".22"/><stop offset="1" stop-color="${LED}" stop-opacity="0"/></radialGradient>`
  body += `<circle cx="${(KX + 17) * P}" cy="${(KY + 12) * P}" r="200" fill="url(#led)"/>`

  // The time: hours (1 to 12), tens and ones of minutes, AM or PM, and a blinking colon.
  for (let k = 0; k < 12; k++) {
    const g = layer(), n = k === 0 ? 12 : k
    if (n >= 10) glyph(g, DIGITS[1], DX[0], DY, LED)
    glyph(g, DIGITS[n % 10], DX[1], DY, LED)
    css.push(shown(`h${k}`, k * 3600, (k + 1) * 3600, 43200))
    body += `<g style="${timed(`h${k}`, 43200)}">${g.svg(P)}</g>`
  }
  for (let k = 0; k < 6; k++) {
    const g = layer(); glyph(g, DIGITS[k], DX[2], DY, LED)
    css.push(shown(`t${k}`, k * 600, (k + 1) * 600, 3600))
    body += `<g style="${timed(`t${k}`, 3600)}">${g.svg(P)}</g>`
  }
  for (let k = 0; k < 10; k++) {
    const g = layer(); glyph(g, DIGITS[k], DX[3], DY, LED)
    css.push(shown(`o${k}`, k * 60, (k + 1) * 60, 600))
    body += `<g style="${timed(`o${k}`, 600)}">${g.svg(P)}</g>`
  }
  for (const [k, letter] of ['A', 'P'].entries()) {
    const g = layer(); glyph(g, LETTERS[letter], KX + 22, KY + 15, LED); glyph(g, LETTERS.M, KX + 26, KY + 15, LED)
    css.push(shown(`ap${k}`, k * 43200, (k + 1) * 43200, DAY))
    body += `<g style="${timed(`ap${k}`, DAY)}">${g.svg(P)}</g>`
  }
  const colon = layer(); colon.set(KX + 16, DY + 2, LED); colon.set(KX + 16, DY + 4, LED)
  css.push('@keyframes blink{0%{opacity:1}50%{opacity:0}}')
  body += `<g style="animation:blink 2s steps(1,end) ${mark} infinite">${colon.svg(P)}</g>`
  body += `<text x="${(KX + 4) * P}" y="${(KY + 20) * P - 1}" ${FONT} font-size="26" font-weight="700" fill="${LED}" fill-opacity=".8">${tz ?? '__TZ__'}</text>`

  // The calendar page for today and the next six days, each from its own midnight.
  const WEEK = DAY * 7, mid = (CX0 + CW / 2) * P
  for (let i = 0; i < 7; i++) {
    const d = date ? new Date(date.getFullYear(), date.getMonth(), date.getDate() + i) : null
    const month = d ? MONTHS[d.getMonth()] : `__MONTH${i}__`, day = d ? d.getDate() : `__DAY${i}__`, weekday = d ? WEEKDAYS[d.getDay()] : `__WEEKDAY${i}__`
    css.push(shown(`d${i}`, i * DAY, (i + 1) * DAY, WEEK))
    body += `<g style="${timed(`d${i}`, WEEK)}" ${FONT} font-weight="700" text-anchor="middle">` +
      `<text x="${mid}" y="${18 * P + 2}" font-size="24" fill="#ffffff">${month}</text>` +
      `<text x="${mid}" y="${37 * P}" font-size="100" fill="#2a2030">${day}</text>` +
      `<text x="${mid}" y="${42 * P + 2}" font-size="22" fill="#a8423a">${weekday}</text></g>`
  }

  return svgDoc({
    defs,
    css: `@keyframes f2{0%{opacity:1}50%{opacity:0}}@keyframes f3{0%{opacity:1}33.333%{opacity:0}}` + css.join(''),
    body,
  })
}
