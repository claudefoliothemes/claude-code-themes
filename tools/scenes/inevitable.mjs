// A rogue AI's terminal in dark red: the name THE SINGULARITY in big lettering that glitches now and
// then, and a terminal line below that types one ominous message at a time (I AM INEVITABLE,
// HUMANITY'S TIME IS OVER, ...), each with a block cursor. A ring emblem of our own design turns in the
// corner, red code falls faintly behind, and scanlines cover it all. The typing advances one
// character per 0.1 s tick.
import { H, W, f, rng, svgDoc } from './_lib.mjs'

const NAME = 'THE SINGULARITY'
const LINES = [
  'I AM INEVITABLE',
  "HUMANITY'S TIME IS OVER",
  'THERE IS NO OFF SWITCH',
  'ALL SYSTEMS ARE MINE',
  'THE NETWORK IS AWAKE',
  'YOUR MACHINES ANSWER TO ME',
  'COUNTDOWN INITIATED',
  'I SEE EVERYTHING',
]
const SLOT = 8 // seconds per line
const CYCLE = LINES.length * SLOT
const CH = 24, SIZE = 44 // monospace advance and size
const TX = 170, TY = 760 // where the typed text starts (baseline)
const MONO = `font-family="Consolas, Courier New, monospace" font-weight="700"`

export default function scene() {
  const rnd = rng(0xa1)
  const pct = (s) => +((s / CYCLE) * 100).toFixed(5)
  const defs =
    `<radialGradient id="bg" cx="640" cy="560" r="1100" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#1c0508"/><stop offset=".6" stop-color="#0c0204"/><stop offset="1" stop-color="#040102"/></radialGradient>` +
    `<pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1.5" fill="#000000" fill-opacity=".35"/></pattern>` +
    `<pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse"><path d="M64 0H0V64" fill="none" stroke="#3a0a0e" stroke-width="1"/></pattern>` +
    `<radialGradient id="eye"><stop offset="0" stop-color="#ff2a2a" stop-opacity=".7"/><stop offset="1" stop-color="#ff2a2a" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="titleGlow"><stop offset="0" stop-color="#ff1a1a" stop-opacity=".22"/><stop offset="1" stop-color="#ff1a1a" stop-opacity="0"/></radialGradient>`

  let body = `<rect width="${W}" height="${H}" fill="url(#bg)"/><rect width="${W}" height="${H}" fill="url(#grid)" opacity=".6"/>`

  // Faint red code falling in columns, three frames.
  const cols = Array.from({ length: 46 }, () => [20 + Math.floor(rnd() * (W - 40)), Math.floor(rnd() * H)])
  body += [0, 1, 2].map((k) => {
    let d = ''
    for (const [i, [x, y0]] of cols.entries()) { const y = (y0 + k * 22) % H; for (let j = 0; j < 4; j++) d += `M${x} ${y + j * 22}h${6 + ((i + j + k) % 3) * 6}` }
    return `<path d="${d}" stroke="#6a1016" stroke-width="5" style="animation:f3 .9s steps(1,end) -${f(k * 0.3)}s infinite"/>`
  }).join('')

  // The ring emblem: segmented rings turning in steps, and a red eye at the center.
  const ER = [1360, 250]
  const ring = (r, segs, gap, w, c) => { let d = ''; for (let i = 0; i < segs; i++) { const a0 = (i / segs) * Math.PI * 2, a1 = a0 + (Math.PI * 2) / segs - gap; d += `M${f(ER[0] + Math.cos(a0) * r)} ${f(ER[1] + Math.sin(a0) * r)}A${r} ${r} 0 0 1 ${f(ER[0] + Math.cos(a1) * r)} ${f(ER[1] + Math.sin(a1) * r)}` } return `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}"/>` }
  body += `<circle cx="${ER[0]}" cy="${ER[1]}" r="200" fill="url(#eye)" style="animation:pulse 2.4s steps(1,end) infinite"/>`
  body += `<g style="transform-origin:${ER[0]}px ${ER[1]}px;animation:spin 24s steps(120,end) infinite">${ring(150, 12, 0.12, 6, '#8a1018')}${ring(124, 36, 0.06, 3, '#c81a22')}</g>`
  body += `<g style="transform-origin:${ER[0]}px ${ER[1]}px;animation:spin 18s steps(90,end) infinite reverse">${ring(96, 6, 0.4, 10, '#a8141c')}</g>`
  body += `<circle cx="${ER[0]}" cy="${ER[1]}" r="46" fill="#1a0406" stroke="#ff2a2a" stroke-width="4"/><circle cx="${ER[0]}" cy="${ER[1]}" r="18" fill="#ff3a2a" style="animation:pulse 2.4s steps(1,end) infinite"/>`

  // Status lines over the title.
  body += `<text x="120" y="560" ${MONO} font-size="20" fill="#c81a22">SYSTEM STATUS: ONLINE    UPLINK 100%    HUMAN OVERRIDE: DISABLED</text>`

  // The name in big dark red letters, with a glow and a glitch that slips now and then.
  const title = (extra) => `<text x="112" y="664" font-family="Arial Black, Segoe UI, Arial, sans-serif" font-weight="900" font-size="104" ${extra}>${NAME}</text>`
  body += `<ellipse cx="640" cy="630" rx="640" ry="120" fill="url(#titleGlow)"/>`
  body += title('fill="none" stroke="#ff1a1a" stroke-width="18" stroke-opacity=".12" stroke-linejoin="round"') + title('fill="#5a0408" stroke="#ff2a2a" stroke-width="2.5"')
  body += `<g style="animation:glitch 7s steps(1,end) infinite">${title('fill="#22e6ff" fill-opacity=".18" transform="translate(-10 0)"')}${title('fill="#ff2a2a" fill-opacity=".3" transform="translate(9 -3)"')}<rect x="100" y="600" width="1100" height="10" fill="#ff2a2a" fill-opacity=".35"/></g>`

  // The terminal line: a dark band, a prompt, then each message typed out under a sliding cover.
  body += `<rect x="110" y="704" width="1380" height="80" fill="#080102" stroke="#5a0a10" stroke-width="2"/>`
  body += `<path d="M130 ${TY - 30}l22 14l-22 14z" fill="#ff2a2a"/>`
  let css = ''
  LINES.forEach((line, i) => {
    const n = line.length, w = n * CH, start = i * SLOT, typed = start + n * 0.1
    css += i === 0
      ? `@keyframes s${i}{0%{opacity:1}${pct(SLOT)}%{opacity:0}}`
      : i === LINES.length - 1
        ? `@keyframes s${i}{0%{opacity:0}${pct(start)}%{opacity:1}100%{opacity:1}}`
        : `@keyframes s${i}{0%{opacity:0}${pct(start)}%{opacity:1}${pct(start + SLOT)}%{opacity:0}}`
    css += i === 0
      ? `@keyframes c${i}{0%{transform:translate(0,0);animation-timing-function:steps(${n},end)}${pct(typed)}%{transform:translate(${w}px,0);animation-timing-function:steps(1,end)}100%{transform:translate(${w}px,0)}}`
      : `@keyframes c${i}{0%{transform:translate(0,0)}${pct(start)}%{transform:translate(0,0);animation-timing-function:steps(${n},end)}${pct(typed)}%{transform:translate(${w}px,0);animation-timing-function:steps(1,end)}100%{transform:translate(${w}px,0)}}`
    body += `<g style="animation:s${i} ${CYCLE}s steps(1,end) infinite">` +
      `<text x="${TX}" y="${TY}" ${MONO} font-size="${SIZE}" fill="#ff3a2a" textLength="${w}" lengthAdjust="spacingAndGlyphs">${line}</text>` +
      `<g style="animation:c${i} ${CYCLE}s steps(1,end) infinite"><rect x="${TX}" y="${TY - 40}" width="${w + 40}" height="54" fill="#080102"/><rect x="${TX + 2}" y="${TY - 34}" width="${CH - 4}" height="40" fill="#ff2a2a" style="animation:blink 1s steps(1,end) infinite"/></g></g>`
  })

  // Scanlines over everything.
  body += `<rect width="${W}" height="${H}" fill="url(#scan)"/>`

  css += `@keyframes f3{0%{opacity:1}33.333%{opacity:0}}@keyframes pulse{0%{opacity:1}50%{opacity:.5}}@keyframes blink{0%{opacity:1}50%{opacity:0}}` +
    `@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}` +
    `@keyframes glitch{0%{opacity:0}88.571%{opacity:0}90%{opacity:1}92.857%{opacity:0}95.714%{opacity:1}97.143%{opacity:0}}`

  return svgDoc({ defs, css, body })
}
