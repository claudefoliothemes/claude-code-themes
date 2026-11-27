// Northern lights over an arctic fjord in Nord colors: aurora curtains in green, teal, frost blue,
// and purple drift and shimmer across a starry sky, snowy peaks frame still water that mirrors
// everything, and a little red cabin glows on the shore among dark pines with smoke from the
// chimney. A shooting star now and then.
// Palette from nordtheme (MIT). Vector art. Every change lands on the shared 0.1 s tick.
import { H, W, f, rng, svgDoc } from './_lib.mjs'

const NORD = ['#2e3440', '#3b4252', '#434c5e', '#4c566a', '#d8dee9', '#e5e9f0', '#eceff4', '#8fbcbb', '#88c0d0', '#81a1c1', '#5e81ac', '#bf616a', '#d08770', '#ebcb8b', '#a3be8c', '#b48ead']
const WL = 720 // waterline

export default function scene() {
  const rnd = rng(0x40e7)
  const defs = [
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14161c"/><stop offset=".55" stop-color="#232833"/><stop offset="1" stop-color="${NORD[0]}"/></linearGradient>`,
    `<linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a303c"/><stop offset="1" stop-color="#1c2028"/></linearGradient>`,
    `<clipPath id="below"><rect y="${WL}" width="${W}" height="${H - WL}"/></clipPath>`,
    `<radialGradient id="win"><stop offset="0" stop-color="${NORD[13]}" stop-opacity=".4"/><stop offset="1" stop-color="${NORD[13]}" stop-opacity="0"/></radialGradient>`,
  ]

  // Aurora curtains: a ribbon two screens wide (so it can drift and repeat) with bright rays inside.
  const STOPS = {
    green: [[0, '#7ee0a0', 0], [0.06, '#d4ffdc', 1], [0.18, '#7ee0a0', 0.9], [0.42, '#7cd6d0', 0.55], [0.72, NORD[8], 0.22], [1, NORD[15], 0]],
    violet: [[0, '#c89ad8', 0], [0.12, '#e8c8f0', 0.6], [0.35, '#c89ad8', 0.42], [0.7, NORD[9], 0.16], [1, NORD[9], 0]],
  }
  const RAYS = [[0, '#eaffe8', 0], [0.06, '#eaffe8', 0.7], [0.4, '#7cd6d0', 0.25], [1, NORD[8], 0]]
  const grad = (id, y1, y2, stops) => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${y1}" x2="0" y2="${y2}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</linearGradient>`
  const curtain = (id, base, amp, len, hMin, hMax, phase, look, rays) => {
    defs.push(grad(id + 'g', base + amp * 1.4, base - hMax - amp, STOPS[look]), grad(id + 'r', base + amp * 1.4, base - hMax - amp, RAYS))
    const pts = [], X0 = -100, X1 = 3300
    for (let x = X0; x <= X1; x += 25) {
      const t = ((x % 1600) + 1600) % 1600 / 1600 * Math.PI * 2
      const yb = base + amp * Math.sin(t * len + phase) + amp * 0.4 * Math.sin(t * (len + 2) + phase * 2)
      const h = hMin + (hMax - hMin) * (0.5 + 0.5 * Math.sin(t * 3 + phase))
      pts.push([x, yb, yb - h])
    }
    let d = `M${pts[0][0]} ${f(pts[0][1])}` + pts.map(([x, yb]) => `L${x} ${f(yb)}`).join('') + pts.slice().reverse().map(([x, , yt]) => `L${x} ${f(yt)}`).join('') + 'Z'
    let r = ''
    if (rays) for (const [x, yb, yt] of pts) { if (((x / 25) | 0) % 2) continue; const k = 0.5 + 0.5 * Math.sin(x * 0.37 + phase); if (k < 0.35) continue; r += `M${x} ${f(yb)}V${f(yt + (yb - yt) * (1 - k) * 0.6)}` }
    defs.push(`<g id="${id}"><path d="${d}" fill="url(#${id}g)"/>${r ? `<path d="${r}" stroke="url(#${id}r)" stroke-width="9" fill="none"/>` : ''}</g>`)
  }
  curtain('c1', 470, 50, 2, 150, 300, 0.3, 'green', true)
  curtain('c2', 340, 40, 3, 110, 230, 2.1, 'violet', false)
  curtain('c3', 540, 30, 1, 80, 180, 4.0, 'green', true)
  const aurora = `<g style="animation:drift 160s steps(1600,end) infinite"><use href="#c1"/></g>` +
    `<g style="animation:drift2 200s steps(2000,end) -60s infinite"><use href="#c2"/></g>` +
    `<g style="animation:drift 120s steps(1200,end) -30s infinite;opacity:.8"><use href="#c3"/></g>`

  let body = `<rect width="${W}" height="${WL}" fill="url(#sky)"/>`
  let stars = ''
  for (let i = 0; i < 120; i++) stars += `<circle cx="${f(rnd() * W)}" cy="${f(rnd() * 560)}" r="${f(0.6 + rnd() * 1.2)}"/>`
  body += `<g fill="${NORD[6]}" fill-opacity=".7">${stars}</g>`
  body += [0, 1].map((k) => `<g fill="#ffffff" style="animation:f2 2.4s steps(1,end) -${f(k * 1.2)}s infinite">` + Array.from({ length: 9 }, (_, i) => `<circle cx="${(i * 181 + k * 97) % W}" cy="${(i * 67 + k * 41) % 520}" r="1.7"/>`).join('') + `</g>`).join('')
  body += `<g style="animation:shoot 9s steps(1,end) -2s infinite"><path d="M1180 90L1300 150" stroke="${NORD[6]}" stroke-width="2.5" stroke-linecap="round"/><path d="M1150 75L1300 150" stroke="${NORD[8]}" stroke-width="6" stroke-opacity=".25" stroke-linecap="round"/></g>`
  body += aurora

  // Mountains: a far range and near peaks framing the fjord, with snow.
  const ridge = (pts) => `M${pts.map(([x, y]) => `${x} ${y}`).join('L')}`
  const farR = [[0, 560], [120, 470], [210, 520], [330, 430], [430, 500], [520, 470], [610, 560], [700, 600], [900, 610], [1000, 560], [1090, 470], [1180, 520], [1290, 420], [1400, 500], [1500, 450], [1600, 520]]
  const nearL = [[0, 420], [90, 380], [180, 460], [260, 400], [380, 560], [470, 640], [560, WL]], nearR = [[1040, WL], [1130, 620], [1230, 520], [1330, 400], [1420, 470], [1510, 360], [1600, 430]]
  const range = (pts, close, fill) => `<path d="${ridge(pts)}${close}Z" fill="${fill}"/>`
  const snow = (pts, c) => pts.slice(1, -1).map(([x, y], i) => { const [px0, py0] = pts[i], [px1, py1] = pts[i + 2]; if (y > py0 || y > py1) return ''; const k = 0.28; return `<path d="M${f(x + (px0 - x) * k)} ${f(y + (py0 - y) * k)}L${x} ${y}L${f(x + (px1 - x) * k)} ${f(y + (py1 - y) * k)}L${f(x + (px1 - x) * k * 0.4)} ${f(y + (py1 - y) * k * 0.7)}L${f(x + (px0 - x) * k * 0.5)} ${f(y + (py0 - y) * k * 0.8)}Z" fill="${c}"/>` }).join('')
  let land = range(farR, `L1600 ${WL}L0 ${WL}`, NORD[2]) + snow(farR, NORD[4])
  land += range(nearL, `L0 ${WL}`, NORD[1]) + snow(nearL, NORD[5]) + range(nearR, `L1600 ${WL}`, NORD[1]) + snow(nearR, NORD[5])
  body += land

  // Water with everything mirrored, then ripples.
  body += `<rect y="${WL}" width="${W}" height="${H - WL}" fill="url(#water)"/>`
  body += `<g clip-path="url(#below)" opacity=".38"><g transform="translate(0 ${2 * WL}) scale(1 -1)">${aurora}${land}</g></g>`
  body += [0, 1].map((k) => `<g fill="${NORD[4]}" fill-opacity=".1" style="animation:f2 1.6s steps(1,end) -${f(k * 0.8)}s infinite">` + Array.from({ length: 40 }, (_, i) => `<rect x="${(i * 157 + k * 53) % W}" y="${WL + 10 + ((i * 41 + k * 17) % 260)}" width="${30 + (i % 5) * 18}" height="2"/>`).join('') + `</g>`).join('')

  // Shore with snow, pines, a red cabin with a glowing window, and chimney smoke.
  body += `<path d="M960 ${WL + 30}Q1180 ${WL - 10} 1600 ${WL - 20}V${H}H900Z" fill="${NORD[0]}"/><path d="M960 ${WL + 30}Q1180 ${WL - 10} 1600 ${WL - 20}V${WL - 6}Q1180 ${WL + 4} 990 ${WL + 36}Z" fill="${NORD[4]}"/>`
  const pine = (x, y, h) => `<path d="M${x} ${y - h}L${f(x - h * 0.28)} ${y}H${f(x + h * 0.28)}Z" fill="#232831"/><path d="M${x} ${y - h}L${f(x - h * 0.12)} ${f(y - h * 0.55)}H${f(x + h * 0.08)}Z" fill="${NORD[5]}" fill-opacity=".8"/>`
  body += [[1040, WL + 26, 70], [1080, WL + 20, 96], [1460, WL - 6, 120], [1510, WL - 10, 90], [1560, WL - 12, 140], [1000, WL + 32, 54]].map(([x, y, h]) => pine(x, y, h)).join('')
  const CX = 1260, CY = WL - 2
  body += `<rect x="${CX}" y="${CY - 70}" width="120" height="70" fill="${NORD[11]}"/><path d="M${CX - 14} ${CY - 68}L${CX + 60} ${CY - 118}L${CX + 134} ${CY - 68}Z" fill="#3a2a30"/><path d="M${CX - 16} ${CY - 66}L${CX + 60} ${CY - 120}L${CX + 136} ${CY - 66}L${CX + 126} ${CY - 64}L${CX + 60} ${CY - 108}L${CX - 6} ${CY - 64}Z" fill="${NORD[6]}"/>`
  body += `<rect x="${CX + 92}" y="${CY - 128}" width="16" height="36" fill="#3a2a30"/><rect x="${CX + 90}" y="${CY - 132}" width="20" height="6" fill="${NORD[6]}"/>`
  body += `<circle cx="${CX + 38}" cy="${CY - 38}" r="90" fill="url(#win)"/><rect x="${CX + 24}" y="${CY - 50}" width="28" height="24" fill="${NORD[13]}"/><path d="M${CX + 38} ${CY - 50}V${CY - 26}M${CX + 24} ${CY - 38}H${CX + 52}" stroke="#3a2a30" stroke-width="3"/>`
  body += `<rect x="${CX + 76}" y="${CY - 46}" width="22" height="46" fill="#5a3a3a"/><circle cx="${CX + 93}" cy="${CY - 22}" r="2" fill="${NORD[13]}"/>`
  body += `<rect x="${CX + 30}" y="${WL + 8}" width="16" height="40" fill="${NORD[13]}" fill-opacity=".14"/>`
  body += [0, 1, 2].map((k) => `<g fill="${NORD[4]}" fill-opacity=".35" style="animation:f3 2.4s steps(1,end) -${f(k * 0.8)}s infinite">` + [0, 1, 2].map((i) => `<circle cx="${CX + 100 + (i + k) % 2 * 8 + i * 6}" cy="${CY - 146 - i * 26 - k * 8}" r="${9 + i * 4}"/>`).join('') + `</g>`).join('')

  const css =
    `@keyframes f2{0%{opacity:1}50%{opacity:0}}@keyframes f3{0%{opacity:1}33.333%{opacity:0}}` +
    `@keyframes drift{0%{transform:translate(0,0)}100%{transform:translate(-1600px,0)}}@keyframes drift2{0%{transform:translate(-1600px,0)}100%{transform:translate(0,0)}}` +
    `@keyframes shoot{0%{opacity:0}96.666%{opacity:1}}`
  return svgDoc({ defs: defs.join(''), css, body })
}
