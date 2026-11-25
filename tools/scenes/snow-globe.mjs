// A snow globe on a windowsill on a winter night: inside the glass, a tiny village with lit
// windows and a twinkling tree, snow swirling around it; outside, soft bokeh string lights, a
// frosted window with snow falling past, and a mug of cocoa steaming on the sill. Vector art; every
// change lands on the shared 0.1 s tick.
import { H, W, f, rng, svgDoc } from './_lib.mjs'

const GX = 1250, GY = 470, GR = 230 // the globe
const SILL = 760

export default function scene() {
  const rnd = rng(0x9106)
  const defs =
    `<linearGradient id="room" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#140f22"/><stop offset="1" stop-color="#22182e"/></linearGradient>` +
    `<linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0e1636"/><stop offset="1" stop-color="#243258"/></linearGradient>` +
    `<radialGradient id="glass" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#2a3a68"/><stop offset=".75" stop-color="#18224a"/><stop offset="1" stop-color="#0e1430"/></radialGradient>` +
    `<radialGradient id="rimLight" cx=".5" cy=".5" r=".5"><stop offset=".86" stop-color="#9fc4ff" stop-opacity="0"/><stop offset=".97" stop-color="#cfe2ff" stop-opacity=".35"/><stop offset="1" stop-color="#ffffff" stop-opacity=".5"/></radialGradient>` +
    `<linearGradient id="base" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a4a2e"/><stop offset=".5" stop-color="#6a3420"/><stop offset="1" stop-color="#4a2416"/></linearGradient>` +
    `<linearGradient id="gold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b88a3a"/><stop offset=".5" stop-color="#f4d890"/><stop offset="1" stop-color="#a87a2a"/></linearGradient>` +
    `<linearGradient id="sill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a3c2e"/><stop offset="1" stop-color="#2e1e18"/></linearGradient>` +
    `<radialGradient id="warm"><stop offset="0" stop-color="#ffcf7a" stop-opacity=".45"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="inside"><stop offset="0" stop-color="#ffe2a8" stop-opacity=".35"/><stop offset="1" stop-color="#ffe2a8" stop-opacity="0"/></radialGradient>` +
    ['#ff8a6a', '#ffd27a', '#8ad8ff', '#ff9fd0', '#a8f0b8'].map((c, i) => `<radialGradient id="bk${i}"><stop offset="0" stop-color="${c}" stop-opacity=".55"/><stop offset=".6" stop-color="${c}" stop-opacity=".18"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`).join('') +
    `<clipPath id="globe"><circle cx="${GX}" cy="${GY}" r="${GR - 4}"/></clipPath>` +
    `<clipPath id="pane"><rect x="120" y="90" width="620" height="${SILL - 110}"/></clipPath>`

  // The room and the window with the snowy night outside.
  let body = `<rect width="${W}" height="${H}" fill="url(#room)"/>`
  body += `<rect x="100" y="70" width="660" height="${SILL - 70}" fill="#2a1e2a"/><rect x="120" y="90" width="620" height="${SILL - 110}" fill="url(#night)"/>`
  let outside = ''
  for (let x = 120; x < 740;) { const w = 50 + rnd() * 70, h = 60 + rnd() * 120; outside += `<path d="M${f(x)} ${SILL - 20}V${f(SILL - 20 - h)}l${f(w / 2)} -34l${f(w / 2)} 34V${SILL - 20}Z" fill="#1a2446"/><path d="M${f(x - 4)} ${f(SILL - 20 - h + 2)}l${f(w / 2 + 4)} -38l${f(w / 2 + 4)} 38" fill="none" stroke="#e8f0ff" stroke-width="6"/>`; if (rnd() < 0.7) outside += `<rect x="${f(x + w / 2 - 9)}" y="${f(SILL - 20 - h / 2)}" width="18" height="20" fill="#ffcf7a"/>`; x += w + 14 }
  outside += `<rect x="120" y="${SILL - 30}" width="620" height="30" fill="#dfe8f8"/>`
  body += `<g clip-path="url(#pane)">${outside}` + [0, 1, 2].map((k) => `<g fill="#ffffff" fill-opacity=".85" style="animation:f3 1.2s steps(1,end) -${f(k * 0.4)}s infinite">` +
    Array.from({ length: 50 }, (_, i) => `<circle cx="${120 + ((i * 89 + k * 31) % 620)}" cy="${90 + ((i * 53 + k * 47) % (SILL - 130))}" r="${f(1.6 + (i % 3))}"/>`).join('') + `</g>`).join('') + `</g>`
  body += `<rect x="425" y="90" width="10" height="${SILL - 110}" fill="#2a1e2a"/><rect x="120" y="380" width="620" height="10" fill="#2a1e2a"/>`
  // Frost in the window corners.
  body += `<path d="M120 90h150q-60 20 -90 60t-60 80zM740 ${SILL - 20}h-170q70 -10 110 -50t60 -90z" fill="#e8f0ff" fill-opacity=".18"/>`

  // Bokeh string lights across the top of the room, twinkling in two groups.
  const bokeh = ['', '']
  for (let i = 0; i < 30; i++) {
    const x = (i / 29) * W + (rnd() - 0.5) * 30, y = 40 + Math.sin(i * 0.7) * 26 + rnd() * 30, r = 26 + rnd() * 36
    bokeh[i % 2] += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="url(#bk${i % 5})"/>`
  }
  body += bokeh.map((g, k) => `<g style="animation:tw 2.4s steps(1,end) -${k * 1.2}s infinite">${g}</g>`).join('')

  // The windowsill.
  body += `<rect x="0" y="${SILL}" width="${W}" height="28" fill="#6a4a38"/><rect x="0" y="${SILL}" width="${W}" height="4" fill="#8a6650"/><rect x="0" y="${SILL + 28}" width="${W}" height="${H - SILL - 28}" fill="url(#sill)"/>`

  // A mug of cocoa with marshmallows, steaming.
  body += `<ellipse cx="880" cy="${SILL + 2}" rx="70" ry="10" fill="#000000" fill-opacity=".3"/>` +
    `<path d="M830 ${SILL - 90}h100v76q0 14 -14 14h-72q-14 0 -14 -14z" fill="#c8423a"/><path d="M930 ${SILL - 72}q34 0 34 28t-34 28" fill="none" stroke="#c8423a" stroke-width="12"/>` +
    `<ellipse cx="880" cy="${SILL - 90}" rx="50" ry="10" fill="#6a3a22"/>` + [[862, -94], [884, -96], [900, -92], [874, -88]].map(([x, dy]) => `<rect x="${x - 7}" y="${SILL + dy - 6}" width="14" height="10" rx="3" fill="#fff6ee"/>`).join('') +
    `<path d="M840 ${SILL - 60}h80" stroke="#ffffff" stroke-width="5" stroke-opacity=".7"/><path d="M850 ${SILL - 46}h60" stroke="#ffffff" stroke-width="5" stroke-opacity=".7"/>`
  body += [0, 1, 2].map((k) => `<path d="M${866 + k * 4} ${SILL - 110}q-14 -24 0 -48q14 -24 0 -48M${896 - k * 3} ${SILL - 104}q12 -22 0 -42" fill="none" stroke="#e8dcf0" stroke-opacity=".22" stroke-width="7" stroke-linecap="round" style="animation:f3 1.8s steps(1,end) -${f(k * 0.6)}s infinite" transform="translate(${(k - 1) * 6} ${-k * 8})"/>`).join('')

  // The snow globe: base, glass, the village inside, snow swirling, highlights.
  body += `<ellipse cx="${GX}" cy="${SILL + 4}" rx="240" ry="20" fill="#000000" fill-opacity=".35"/>` + `<ellipse cx="${GX}" cy="${SILL - 60}" rx="300" ry="160" fill="url(#warm)"/>`
  body += `<path d="M${GX - 200} ${SILL}L${GX - 170} ${GY + GR - 40}H${GX + 170}L${GX + 200} ${SILL}Z" fill="url(#base)"/>` +
    `<rect x="${GX - 186}" y="${GY + GR - 6}" width="372" height="22" fill="url(#gold)"/><rect x="${GX - 60}" y="${SILL - 50}" width="120" height="30" rx="4" fill="url(#gold)"/>` +
    `<path d="M${GX - 196} ${SILL - 6}h392" stroke="#c8423a" stroke-width="10"/>`
  body += `<circle cx="${GX}" cy="${GY}" r="${GR}" fill="url(#glass)"/>`
  let village = `<ellipse cx="${GX}" cy="${GY + 140}" rx="260" ry="80" fill="#e8f0fc"/><ellipse cx="${GX}" cy="${GY + 120}" rx="230" ry="40" fill="#f6faff"/>`
  village += `<circle cx="${GX}" cy="${GY + 40}" r="170" fill="url(#inside)"/>`
  const house = (x, y, w, h, c, roof) => `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" fill="${c}"/><path d="M${x - 8} ${y - h}L${x + w / 2} ${y - h - w * 0.45}L${x + w + 8} ${y - h}Z" fill="${roof}"/><path d="M${x - 8} ${y - h}L${x + w / 2} ${y - h - w * 0.45}L${x + w + 8} ${y - h}" fill="none" stroke="#ffffff" stroke-width="7" stroke-linejoin="round"/><rect x="${x + w * 0.2}" y="${y - h * 0.65}" width="${w * 0.22}" height="${h * 0.28}" fill="#ffcf7a"/><rect x="${x + w * 0.58}" y="${y - h * 0.65}" width="${w * 0.22}" height="${h * 0.28}" fill="#ffcf7a"/><rect x="${x + w * 0.4}" y="${y - h * 0.42}" width="${w * 0.2}" height="${h * 0.42}" fill="#5a3a2a"/>`
  village += house(GX - 150, GY + 110, 70, 56, '#c8705a', '#7a3a3a') + house(GX + 70, GY + 116, 80, 64, '#5a7aa8', '#3a4a6a') + house(GX - 60, GY + 96, 56, 46, '#d8b878', '#8a5a3a')
  // A pine with lights twinkling and a star.
  village += `<path d="M${GX + 10} ${GY - 40}l60 90h-28l42 60h-148l42 -60h-28z" fill="#2f6a4a" transform="translate(-10 20)"/><rect x="${GX - 6}" y="${GY + 90}" width="12" height="16" fill="#5a3a2a"/>`
  village += `<path d="M${GX} ${GY - 36}l5 12h13l-10 8l4 13l-12 -8l-12 8l4 -13l-10 -8h13z" fill="#ffe07a"/>`
  village += [0, 1].map((k) => `<g style="animation:f2 1.2s steps(1,end) -${k * 0.6}s infinite">` + [[-20, 20], [16, 34], [-34, 56], [30, 64], [-8, 74], [42, 88], [-46, 86], [4, 50]].filter((_, i) => i % 2 === k).map(([dx, dy], i) => `<circle cx="${GX + dx}" cy="${GY + dy}" r="5" fill="${['#ff6b6b', '#ffd27a', '#8ad8ff', '#ff9fd0'][(i + k) % 4]}"/>`).join('') + `</g>`).join('')
  // Snow swirling inside: three frames along a slow spiral.
  const swirl = [0, 1, 2].map((k) => {
    let g = ''
    for (let i = 0; i < 70; i++) {
      const a = i * 2.4 + k * 0.5, r = 30 + ((i * 37) % 190), x = GX + Math.cos(a) * r, y = GY - 20 + Math.sin(a) * r * 0.9 + k * 6
      g += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(1.8 + (i % 3) * 1.1)}"/>`
    }
    return `<g fill="#ffffff" fill-opacity=".9" style="animation:f3 1.5s steps(1,end) -${f(k * 0.5)}s infinite">${g}</g>`
  }).join('')
  body += `<g clip-path="url(#globe)">${village}${swirl}</g>`
  body += `<circle cx="${GX}" cy="${GY}" r="${GR}" fill="url(#rimLight)"/>`
  body += `<path d="M${GX - 150} ${GY - 120}Q${GX - 120} ${GY - 190} ${GX - 40} ${GY - 205}" fill="none" stroke="#ffffff" stroke-opacity=".45" stroke-width="14" stroke-linecap="round"/>` +
    `<path d="M${GX - 182} ${GY - 40}Q${GX - 186} ${GY - 70} ${GX - 176} ${GY - 92}" fill="none" stroke="#ffffff" stroke-opacity=".3" stroke-width="8" stroke-linecap="round"/>` +
    `<circle cx="${GX + 150}" cy="${GY - 130}" r="10" fill="#ffffff" fill-opacity=".25"/>`

  const css =
    `@keyframes f2{0%{opacity:1}50%{opacity:0}}@keyframes f3{0%{opacity:1}33.333%{opacity:0}}@keyframes tw{0%{opacity:1}50%{opacity:.55}}`

  return svgDoc({ defs, css, body })
}
