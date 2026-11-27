// A classic stacked desktop music player skin, our own design: a main window with a green LCD clock
// counting up, a bouncing spectrum analyzer and a scrolling track title; an equalizer with ten band
// sliders and a preamp moving through presets; and a playlist of made-up coder songs. The player
// sits over a dark room with a faint giant visualizer. Every change lands on the shared 0.1 s tick.
import { H, W, f, rng, svgDoc } from './_lib.mjs'

const X0 = 520, X1 = 1080, WD = X1 - X0, CXW = (X0 + X1) / 2
const UI = `font-family="Tahoma, Verdana, Segoe UI, sans-serif"`
const LCD = '#3aff5a', LCD_DIM = '#0f2a14', LCD_BG = '#05080a'
const SONGS = [
  ['The Rubber Ducks', 'Async Heartbeat', '4:00'], ['DJ Debug', 'Null Pointer Blues', '3:47'],
  ['Merge Squad', 'Midnight Merge Conflict', '4:21'], ['The Semicolons', 'Ship It (Radio Edit)', '3:12'],
  ['Lofi Linter', 'Refactor Rain', '5:03'], ['Big O', 'Stack Trace Serenade', '4:38'],
  ['Null Set', 'Tabs vs Spaces', '2:59'], ['The Hotfixes', '404 Love Not Found', '3:33'],
  ['The Kernel Club', 'Cache Me If You Can', '4:05'], ['The Rubber Ducks', 'Hotfix Friday', '3:44'],
]

// A raised panel: fill, light top-left edge, dark bottom-right edge (sunk flips them).
const bevel = (x, y, w, h, fill, sunk = false) => {
  const hi = sunk ? '#0a0b0e' : '#7a8090', lo = sunk ? '#5a6070' : '#0a0b0e'
  return `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${fill}"/>` +
    `<path d="M${f(x + 0.5)} ${f(y + h)}V${f(y + 0.5)}H${f(x + w)}" fill="none" stroke="${hi}"/>` +
    `<path d="M${f(x + w - 0.5)} ${f(y)}V${f(y + h - 0.5)}H${f(x)}" fill="none" stroke="${lo}"/>`
}
const text = (x, y, s, size, fill, extra = '') => `<text x="${f(x)}" y="${f(y)}" font-size="${size}" fill="${fill}" ${UI} ${extra}>${s}</text>`

// A window: chassis, outer bevel, and a title bar with amber grip stripes around the title.
function win(y, h, title, tw) {
  let s = bevel(X0, y, WD, h, 'url(#chassis)')
  s += `<rect x="${X0 + 6}" y="${y + 5}" width="${WD - 12}" height="18" fill="#17191f"/>`
  let stripes = ''
  for (let k = 0; k < 4; k++) {
    const yy = y + 8.5 + k * 3.5
    stripes += `M${X0 + 12} ${yy}H${CXW - tw / 2 - 12}M${CXW + tw / 2 + 12} ${yy}H${X1 - 64}`
  }
  s += `<path d="${stripes}" stroke="#c9953a" stroke-width="1.4"/>`
  s += text(CXW, y + 19, title, 13, '#ffd27a', `font-weight="700" font-style="italic" text-anchor="middle"`)
  for (const [i, glyph] of [['0', 'M3 9H11'], ['1', 'M3 4H11V10H3Z'], ['2', 'M3 3L11 11M11 3L3 11']]) {
    const bx = X1 - 56 + Number(i) * 16
    s += bevel(bx, y + 7, 14, 14, '#2c303a') + `<path d="${glyph}" transform="translate(${bx} ${y + 7})" fill="none" stroke="#c9d0dc" stroke-width="1.4"/>`
  }
  return s
}

// Seven-segment digits for the LCD clock.
const DIG = ['abcdef', 'bc', 'abdeg', 'abcdg', 'bcfg', 'acdfg', 'acdefg', 'abc', 'abcdefg', 'abcdfg']
function digit(d, x, y, fill, w = 26, h = 46, t = 5) {
  const half = h / 2, v = half - 1.5 * t
  const seg = { a: [x + t, y, w - 2 * t, t], b: [x + w - t, y + t, t, v], c: [x + w - t, y + half + t / 2, t, v], d: [x + t, y + h - t, w - 2 * t, t], e: [x, y + half + t / 2, t, v], f: [x, y + t, t, v], g: [x + t, y + half - t / 2, w - 2 * t, t] }
  const on = d < 0 ? 'abcdefg' : DIG[d]
  return `<g fill="${fill}">` + on.split('').map((k) => { const [a, b, c, e] = seg[k]; return `<rect x="${f(a)}" y="${f(b)}" width="${f(c)}" height="${f(e)}"/>` }).join('') + `</g>`
}
// Frame k of n shows at time k * period / n (the delay puts each frame's lit slot in order).
const frame = (k, n, period, inner) => `<g style="animation:f${n} ${f(period)}s steps(1,end) -${f((((n - k) % n) * period) / n)}s infinite">${inner}</g>`

export default function scene() {
  const rnd = rng(0x90a3)
  const defs =
    `<radialGradient id="room" cx=".5" cy=".5" r=".75"><stop offset="0" stop-color="#1f1b36"/><stop offset="1" stop-color="#08090f"/></radialGradient>` +
    `<linearGradient id="chassis" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d4250"/><stop offset="1" stop-color="#22252d"/></linearGradient>` +
    `<linearGradient id="spec" gradientUnits="userSpaceOnUse" x1="0" y1="228" x2="0" y2="186"><stop offset="0" stop-color="#2ad84a"/><stop offset=".55" stop-color="#d8e84a"/><stop offset=".85" stop-color="#ff9a3a"/><stop offset="1" stop-color="#ff3a3a"/></linearGradient>` +
    `<linearGradient id="bgspec" gradientUnits="userSpaceOnUse" x1="0" y1="${H}" x2="0" y2="${H - 190}"><stop offset="0" stop-color="#7a3aff"/><stop offset=".6" stop-color="#ff3ab0"/><stop offset="1" stop-color="#ffb84a"/></linearGradient>` +
    `<linearGradient id="vol" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2ad84a"/><stop offset=".7" stop-color="#d8e84a"/><stop offset="1" stop-color="#ff5a3a"/></linearGradient>` +
    `<linearGradient id="knob" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8ecf2"/><stop offset="1" stop-color="#7a808c"/></linearGradient>` +
    `<linearGradient id="band" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff5a3a"/><stop offset=".5" stop-color="#d8e84a"/><stop offset="1" stop-color="#2ad84a"/></linearGradient>` +
    `<clipPath id="ticker"><rect x="784" y="118" width="276" height="26"/></clipPath>`

  // The room: dark glow, a faint giant visualizer along the bottom, and a soft glow behind the player.
  let body = `<rect width="${W}" height="${H}" fill="url(#room)"/>`
  const BARS = 48, bw = W / BARS
  const bgH = Array.from({ length: BARS }, (_, i) => 0.35 + 0.5 * Math.abs(Math.sin(i / 6.5)))
  body += Array.from({ length: 6 }, (_, k) => frame(k, 6, 2.4, `<g fill="url(#bgspec)" fill-opacity=".16">` +
    bgH.map((e, i) => { const h = Math.round(e * (0.4 + 0.6 * rnd()) * 190); return `<rect x="${f(i * bw + 3)}" y="${H - h}" width="${f(bw - 6)}" height="${h}"/>` }).join('') + `</g>`)).join('')

  // ===== Main window =====
  const MY = 80
  body += win(MY, 236, '90s AMP', 60)
  // LCD: play arrow, clock, spectrum analyzer.
  body += bevel(536, 118, 232, 118, LCD_BG, true)
  body += `<path d="M548 132L560 139L548 146Z" fill="${LCD}"/>`
  const DX = [578, 626, 660]
  for (const x of DX) body += digit(-1, x, 128, LCD_DIM)
  body += `<g fill="${LCD}"><rect x="612" y="140" width="5" height="5"/><rect x="612" y="158" width="5" height="5"/></g>`
  body += [0, 1, 2, 3].map((d) => frame(d, 4, 240, digit(d, DX[0], 128, LCD))).join('')
  body += [0, 1, 2, 3, 4, 5].map((d) => frame(d, 6, 60, digit(d, DX[1], 128, LCD))).join('')
  body += [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => frame(d, 10, 10, digit(d, DX[2], 128, LCD))).join('')
  const SN = 19, SF = 12, sh = [], peaks = []
  for (let k = 0; k < SF * 2; k++) sh.push(Array.from({ length: SN }, (_, i) => Math.max(2, Math.round(((0.95 - i * 0.03) * (0.3 + 0.7 * rnd()) * 42) / 2) * 2)))
  let prev = Array(SN).fill(0)
  for (let k = 0; k < SF * 2; k++) { prev = sh[k].map((h, i) => Math.max(h + 2, prev[i] - 4)); if (k >= SF) peaks.push(prev) }
  body += Array.from({ length: SF }, (_, k) => frame(k, SF, 1.2,
    `<g fill="url(#spec)">` + sh[SF + k].map((h, i) => `<rect x="${548 + i * 11}" y="${228 - h}" width="9" height="${h}"/>`).join('') + `</g>` +
    `<g fill="#c8d0dc">` + peaks[k].map((p, i) => `<rect x="${548 + i * 11}" y="${228 - p - 2}" width="9" height="2"/>`).join('') + `</g>`)).join('')
  // Scrolling track title.
  body += bevel(780, 116, 284, 30, LCD_BG, true)
  const tick = `1. ${SONGS[0][0]} - ${SONGS[0][1]} (${SONGS[0][2]})  ***  `
  body += `<g clip-path="url(#ticker)"><g style="animation:ticker 23s steps(230,end) infinite">` +
    [0, 460].map((dx) => text(790 + dx, 137, tick, 15, LCD, `textLength="440" lengthAdjust="spacing"`)).join('') + `</g></g>`
  // Bitrate, sample rate, mono and stereo.
  body += bevel(780, 152, 34, 18, LCD_BG, true) + text(797, 166, '128', 12, LCD, 'text-anchor="middle"') + text(820, 166, 'kbps', 11, '#c9d0dc')
  body += bevel(860, 152, 26, 18, LCD_BG, true) + text(873, 166, '44', 12, LCD, 'text-anchor="middle"') + text(892, 166, 'kHz', 11, '#c9d0dc')
  body += text(970, 166, 'mono', 11, '#4a5060') + text(1012, 166, 'stereo', 11, LCD)
  // Volume and balance sliders, EQ and playlist toggles.
  body += `<rect x="780" y="186" width="140" height="10" fill="url(#vol)" fill-opacity=".85"/>` + bevel(870, 182, 18, 18, 'url(#knob)')
  body += `<rect x="930" y="186" width="70" height="10" fill="#2a2e38"/><rect x="963" y="186" width="4" height="10" fill="${LCD}" fill-opacity=".6"/>` + bevel(956, 182, 18, 18, 'url(#knob)')
  for (const [x, label] of [[1010, 'EQ'], [1038, 'PL']]) body += bevel(x, 182, 26, 18, '#2c303a') + `<rect x="${x + 4}" y="${186}" width="3" height="10" fill="${LCD}"/>` + text(x + 16, 195, label, 10, '#e8ecf2', 'text-anchor="middle" font-weight="700"')
  // Seek bar with the position knob crossing in step with the clock.
  body += bevel(536, 246, 528, 14, '#14161c', true)
  body += `<g style="animation:seek 240s steps(480,end) infinite">${bevel(538, 247, 32, 12, 'url(#knob)')}</g>`
  // Transport buttons, eject, shuffle, repeat, and our lightning badge.
  const icons = [
    '<path d="M-10 -7V7M8 -7L-6 0L8 7Z"/>', '<path d="M-6 -8L9 0L-6 8Z"/>', '<path d="M-7 -7H-2V7H-7ZM2 -7H7V7H2Z"/>',
    '<path d="M-7 -7H7V7H-7Z"/>', '<path d="M10 -7V7M-8 -7L6 0L-8 7Z"/>',
  ]
  icons.forEach((ic, i) => { const bx = 536 + i * 48; body += bevel(bx, 272, 44, 32, '#2c303a') + `<g transform="translate(${bx + 22} 288)" fill="#e8ecf2">${ic}</g>` })
  body += bevel(786, 272, 38, 32, '#2c303a') + `<path d="M796 291L805 281L814 291ZM796 294H814V297H796Z" fill="#e8ecf2"/>`
  body += bevel(840, 276, 74, 24, '#2c303a') + text(877, 293, 'Shuffle', 12, '#c9d0dc', 'text-anchor="middle"')
  body += bevel(918, 276, 46, 24, '#2c303a') + `<path d="M929 292V284H951M947 280L951 284L947 288M953 284V292H931" fill="none" stroke="${LCD}" stroke-width="2"/>`
  body += `<circle cx="1040" cy="288" r="16" fill="#ffb84a"/><circle cx="1040" cy="288" r="13" fill="#17191f"/><path d="M1043 277L1033 290H1040L1037 299L1047 285H1040Z" fill="#ffb84a"/>`

  // ===== Equalizer =====
  const EY = 320
  body += win(EY, 236, '90s AMP Equalizer', 124)
  body += bevel(536, 354, 40, 18, '#2c303a') + `<rect x="541" y="359" width="7" height="8" fill="${LCD}"/>` + text(562, 368, 'On', 11, '#e8ecf2', 'text-anchor="middle" font-weight="700"')
  body += bevel(580, 354, 52, 18, '#2c303a') + `<rect x="585" y="359" width="7" height="8" fill="#3a4030"/>` + text(612, 368, 'Auto', 11, '#c9d0dc', 'text-anchor="middle"')
  body += bevel(992, 354, 72, 18, '#2c303a') + text(1028, 368, 'Presets', 11, '#e8ecf2', 'text-anchor="middle"')
  body += bevel(660, 350, 300, 30, LCD_BG, true) + `<path d="M662 365H958" stroke="#1e3a24"/>`
  body += text(600, 410, '+12 db', 10, '#c9d0dc', 'text-anchor="middle"') + text(600, 464, '+0 db', 10, '#c9d0dc', 'text-anchor="middle"') + text(600, 518, '-12 db', 10, '#c9d0dc', 'text-anchor="middle"')
  const BX = [556, ...Array.from({ length: 10 }, (_, i) => 660 + i * 44)]
  for (const x of BX) body += bevel(x - 4, 400, 8, 124, '#0c0d10', true) + `<rect x="${x - 2}" y="402" width="4" height="120" fill="url(#band)" fill-opacity=".55"/>`
  ;['60', '170', '310', '600', '1K', '3K', '6K', '12K', '14K', '16K'].forEach((l, i) => { body += text(BX[i + 1], 542, l, 11, '#c9d0dc', 'text-anchor="middle"') })
  body += text(556, 542, 'Preamp', 11, '#c9d0dc', 'text-anchor="middle"')
  const presets = [
    [0.1, -0.7, -0.5, -0.2, 0.1, 0.3, 0.1, -0.3, -0.5, -0.6, -0.6],
    [-0.1, -0.2, -0.4, -0.5, -0.3, 0, 0.3, 0.5, 0.6, 0.5, 0.4],
    [0.2, -0.6, -0.6, -0.3, 0.2, 0.5, 0.2, -0.3, -0.6, -0.6, -0.5],
    [0, -0.4, -0.2, 0.2, 0.4, 0.2, -0.2, -0.4, -0.2, 0.2, 0.4],
  ]
  body += presets.map((p, k) => frame(k, 4, 4.8,
    p.map((v, i) => bevel(BX[i] - 12, 456 + v * 54, 24, 12, 'url(#knob)')).join('') +
    `<polyline points="${p.slice(1).map((v, i) => `${f(668 + i * 31.5)},${f(365 + v * 13)}`).join(' ')}" fill="none" stroke="#d8e84a" stroke-width="2"/>`)).join('')

  // ===== Playlist =====
  const PY = 560
  body += win(PY, 364, '90s AMP Playlist', 112)
  body += bevel(536, 594, 528, 258, LCD_BG, true)
  body += `<rect x="538" y="600" width="506" height="24" fill="#1e3a8a"/>`
  SONGS.forEach(([artist, title, time], i) => {
    const y = 617 + i * 24, c = i === 0 ? '#ffffff' : LCD
    body += text(546, y, `${i + 1}. ${artist} - ${title}`, 14, c) + text(1036, y, time, 14, c, 'text-anchor="end"')
  })
  body += `<rect x="1048" y="598" width="12" height="250" fill="#14161c"/>` + bevel(1048, 600, 12, 40, 'url(#knob)')
  ;['Add', 'Rem', 'Sel', 'Misc'].forEach((l, i) => { body += bevel(536 + i * 56, 868, 50, 24, '#2c303a') + text(561 + i * 56, 885, l, 12, '#e8ecf2', 'text-anchor="middle"') })
  body += bevel(772, 868, 132, 24, LCD_BG, true) + text(838, 885, '4:00/39:22', 13, LCD, 'text-anchor="middle"')
  icons.forEach((ic, i) => { body += `<g transform="translate(${922 + i * 18} 880) scale(.55)" fill="#c9d0dc">${ic}</g>` })
  body += bevel(1014, 868, 50, 24, '#2c303a') + text(1039, 885, 'List', 12, '#e8ecf2', 'text-anchor="middle"')

  const css =
    `@keyframes f4{0%{opacity:1}25%{opacity:0}}@keyframes f6{0%{opacity:1}16.666%{opacity:0}}@keyframes f10{0%{opacity:1}10%{opacity:0}}@keyframes f12{0%{opacity:1}8.333%{opacity:0}}` +
    `@keyframes ticker{0%{transform:translate(0,0)}100%{transform:translate(-460px,0)}}@keyframes seek{0%{transform:translate(0,0)}100%{transform:translate(492px,0)}}`

  return svgDoc({ defs, css, body })
}
