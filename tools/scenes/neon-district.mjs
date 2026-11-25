// Street level in a cyberpunk district at night: a rain-soaked alley lined with glowing neon blade
// signs (one flickering, one shifting color), a wireframe hologram turning over the street, cables
// strung between the walls, a far skyline with blinking rooftop lights, steam from a vent, a drone
// gliding past, a figure under a clear umbrella, and the wet street reflecting everything. Vector
// art. Every change lands on the shared 0.1 s tick.
import { H, W, f, rng, svgDoc } from './_lib.mjs'

const NEAR = 640 // the far end of the alley, where the walls meet the street
const PINK = '#ff2fd0', CYAN = '#22e6ff', VIOLET = '#9d5bff', YELLOW = '#ffe14d', ROSE = '#ff4f8b', GREEN = '#39ff9a'
const FONT = `font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-weight="700"`

// A neon tube: a wide faint halo, a brighter glow, and a pale core.
const tube = (d, c, w = 2.5) =>
  `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w * 7}" stroke-opacity=".1" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w * 2.6}" stroke-opacity=".38" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<path d="${d}" fill="none" stroke="#fff6ff" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`
// Neon lettering, the same way.
const neonText = (x, y, text, c, size, extra = '') =>
  `<g ${FONT} font-size="${size}" text-anchor="middle" fill="none" ${extra}>` +
  `<text x="${x}" y="${y}" stroke="${c}" stroke-width="${size / 5}" stroke-opacity=".14">${text}</text>` +
  `<text x="${x}" y="${y}" stroke="${c}" stroke-width="${size / 12}" stroke-opacity=".5">${text}</text>` +
  `<text x="${x}" y="${y}" stroke="#fff6ff" stroke-width="${Math.max(1.2, size / 30)}">${text}</text></g>`
// Ground height under x: the street rises from the bottom corners to the far end.
const groundY = (x) => (x < 600 ? 1000 - (x / 600) * 360 : x > 1000 ? 1000 - ((1600 - x) / 600) * 360 : NEAR)

export default function scene() {
  const rnd = rng(0xc7b3)
  const defs =
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05030c"/><stop offset=".6" stop-color="#140a2a"/><stop offset="1" stop-color="#2a0f3e"/></linearGradient>` +
    `<linearGradient id="wallL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#07050e"/><stop offset="1" stop-color="#1c1032"/></linearGradient>` +
    `<linearGradient id="wallR" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#07050e"/><stop offset="1" stop-color="#1c1032"/></linearGradient>` +
    `<linearGradient id="street" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#06040c"/><stop offset="1" stop-color="#1a0e2c"/></linearGradient>` +
    `<linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff2fd0" stop-opacity="0"/><stop offset=".7" stop-color="#9d5bff" stop-opacity=".22"/><stop offset="1" stop-color="#ff2fd0" stop-opacity=".35"/></linearGradient>` +
    [PINK, CYAN, VIOLET, YELLOW, ROSE, GREEN].map((c, i) => `<linearGradient id="refl${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}" stop-opacity=".45"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></linearGradient>`).join('') +
    `<radialGradient id="pool"><stop offset="0" stop-color="#ff2fd0" stop-opacity=".25"/><stop offset="1" stop-color="#ff2fd0" stop-opacity="0"/></radialGradient>`
  const reflId = (c) => `refl${[PINK, CYAN, VIOLET, YELLOW, ROSE, GREEN].indexOf(c)}`

  // The far end: night sky, a skyline with lit windows and blinking rooftop lights, and haze.
  let body = `<rect width="${W}" height="${H}" fill="url(#sky)"/>`
  let towers = '', windows = '', beacons = ''
  for (let x = 560; x < 1040;) {
    const w = 34 + rnd() * 50, h = 220 + rnd() * 330, top = NEAR - h
    towers += `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(h)}"/>`
    for (let y = top + 10; y < NEAR - 10; y += 14) for (let wx = x + 5; wx < x + w - 6; wx += 9) if (rnd() < 0.3) windows += `<rect x="${f(wx)}" y="${f(y)}" width="4" height="5" fill="${rnd() < 0.5 ? CYAN : rnd() < 0.5 ? PINK : '#ffd8a0'}"/>`
    beacons += `<circle cx="${f(x + w / 2)}" cy="${f(top - 4)}" r="3"/>`
    x += w + 2
  }
  body += `<g fill="#0c0718">${towers}</g><g fill-opacity=".55">${windows}</g><g fill="#ff3a4a" style="animation:blink 2s steps(1,end) infinite">${beacons}</g>`
  body += `<rect x="560" y="300" width="480" height="${NEAR - 300}" fill="url(#haze)"/>`

  // The hologram: a wireframe cube turning above the street, eight frames per quarter turn.
  const cube = (k) => {
    const a = (k / 8) * (Math.PI / 2) + 0.35, tilt = 0.45, s = 70, cx = 800, cy = 200
    const pts = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]].map(([x, y, z]) => {
      const x1 = x * Math.cos(a) - z * Math.sin(a), z1 = x * Math.sin(a) + z * Math.cos(a)
      const y1 = y * Math.cos(tilt) - z1 * Math.sin(tilt)
      return [cx + x1 * s, cy + y1 * s]
    })
    const edges = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]
    return tube(edges.map(([i, j]) => `M${f(pts[i][0])} ${f(pts[i][1])}L${f(pts[j][0])} ${f(pts[j][1])}`).join(''), CYAN, 1.8)
  }
  body += Array.from({ length: 8 }, (_, k) => `<g style="animation:f8 1.6s steps(1,end) -${f(k * 0.2)}s infinite">${cube(k)}</g>`).join('')
  body += `<path d="M740 330L800 290L860 330Z" fill="${CYAN}" fill-opacity=".08"/><ellipse cx="800" cy="332" rx="70" ry="8" fill="none" stroke="${CYAN}" stroke-opacity=".45" stroke-width="2"/>`

  // The alley walls with floor lines running to the far end, and the street.
  body += `<path d="M0 0L600 250L600 ${NEAR}L0 1000Z" fill="url(#wallL)"/><path d="M${W} 0L1000 250L1000 ${NEAR}L${W} 1000Z" fill="url(#wallR)"/>`
  let lines = ''
  for (const t of [0.12, 0.3, 0.48, 0.66, 0.84]) {
    lines += `M0 ${f(t * 1000)}L600 ${f(250 + t * (NEAR - 250))}M${W} ${f(t * 1000)}L1000 ${f(250 + t * (NEAR - 250))}`
  }
  for (const x of [120, 260, 380, 480, 545]) lines += `M${x} ${f((x / 600) * 250)}V${f(groundY(x))}M${W - x} ${f((x / 600) * 250)}V${f(groundY(W - x))}`
  body += `<path d="${lines}" stroke="#2a1a44" stroke-opacity=".7" stroke-width="2" fill="none"/>`
  body += `<path d="M0 1000L600 ${NEAR}L1000 ${NEAR}L${W} 1000Z" fill="url(#street)"/>`
  body += `<path d="M800 ${NEAR}L700 1000M800 ${NEAR}L900 1000" stroke="#ffe14d" stroke-opacity=".25" stroke-width="3" stroke-dasharray="18 22"/>`

  // Cables strung across the alley, with small lights.
  for (const [y, sag, x0, x1] of [[150, 60, 0, W], [300, 30, 380, 1220], [360, 18, 520, 1080]]) {
    const d = `M${x0} ${y}Q800 ${y + sag * 2} ${x1} ${y}`
    body += `<path d="${d}" stroke="#0a0612" stroke-width="3" fill="none"/>`
  }

  // Neon blade signs sticking out from the walls, near to far, each with its reflection below.
  const signs = []
  const sign = (x, y, w, h, c, inner) => {
    signs.push([x, w, c])
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#0a0612"/>` + tube(`M${x + 6} ${y + 6}h${w - 12}v${h - 12}h${-(w - 12)}Z`, c, 2.2) + inner
  }
  const stacked = (x, y, letters, c, size, gap) => letters.split('').map((ch, i) => neonText(x, y + i * gap, ch, c, size)).join('')
  body += sign(140, 110, 96, 470, PINK, stacked(188, 190, 'HOTEL', PINK, 64, 86))
  body += `<rect x="236" y="180" width="40" height="8" fill="#0a0612"/><rect x="236" y="460" width="40" height="8" fill="#0a0612"/>`
  body += sign(372, 250, 64, 230, CYAN, stacked(404, 302, 'BAR', CYAN, 40, 56) + tube('M392 440l12 14l12 -14zM404 454v12M396 466h16', CYAN, 1.6))
  body += sign(512, 330, 40, 130, YELLOW, stacked(532, 368, '24H', YELLOW, 24, 32))
  // The noodle shop sign, round, on the right.
  body += `<circle cx="1400" cy="270" r="112" fill="#0a0612"/>` + tube('M1400 166a104 104 0 1 0 0.1 0', CYAN, 2.4) +
    tube('M1340 270h120a60 54 0 0 1 -120 0z', CYAN, 2.2) + tube('M1392 250l40 -70M1408 250l44 -62', YELLOW, 1.8) +
    tube('M1372 244q-8 -16 0 -30q8 -14 0 -28M1398 240q-8 -14 0 -26', '#ffffff', 1.4) + neonText(1400, 420, 'NOODLES', ROSE, 40)
  signs.push([1300, 200, CYAN])
  body += `<rect x="1288" y="262" width="12" height="16" fill="#0a0612"/>`
  // OPEN, flickering.
  body += `<g style="animation:flick 10s steps(1,end) infinite">${sign(1150, 270, 64, 250, ROSE, stacked(1182, 326, 'OPEN', ROSE, 40, 56))}</g>`
  // A small sign that shifts between violet and green.
  for (const [i, c] of [VIOLET, GREEN].entries()) {
    body += `<g style="animation:f2 4s steps(1,end) -${i * 2}s infinite"><rect x="1030" y="340" width="42" height="110" rx="5" fill="#0a0612"/>${tube('M1036 346h30v98h-30Z', c, 1.8)}${tube('M1051 370l12 22h-24z', c, 1.8)}${stacked(1051, 420, 'Z', c, 20, 0)}</g>`
  }
  signs.push([1030, 42, VIOLET])

  // Reflections on the wet street under each sign, and a pink pool of light under the hotel sign.
  // Each reflection is a stack of broken horizontal streaks, fading with distance from the sign.
  body += signs.map(([x, w, c]) => {
    const top = groundY(x + w / 2) + 6
    let streaks = ''
    for (let y = top, j = 0; y < 1000; y += 7 + (j % 3) * 2, j++) {
      const op = Math.max(0, 0.42 - j * 0.03), sw = w * (0.45 + rnd() * 0.55), sx = x + (w - sw) / 2 + (rnd() - 0.5) * w * 0.3
      if (op > 0.02) streaks += `<rect x="${f(sx)}" y="${f(y)}" width="${f(sw)}" height="3" fill-opacity="${f(op)}"/>`
    }
    return `<g fill="${c}">${streaks}</g>`
  }).join('')
  body += `<ellipse cx="190" cy="930" rx="260" ry="60" fill="url(#pool)"/>`

  // A figure under a clear umbrella in the middle of the street.
  body += `<g transform="translate(800 ${NEAR + 30})"><path d="M-6 0h12l-2 -34h-8z" fill="#06040a"/><circle cx="0" cy="-40" r="6" fill="#06040a"/>` +
    `<path d="M-30 -48q30 -26 60 0z" fill="${CYAN}" fill-opacity=".14"/>` + tube('M-30 -48q30 -26 60 0', CYAN, 1.4) + `<path d="M0 -48v14" stroke="#9aa0b0" stroke-width="1.5"/>` +
    `<ellipse cx="0" cy="2" rx="16" ry="3" fill="${CYAN}" fill-opacity=".18"/></g>`

  // Steam rising from a vent at the foot of the left wall.
  body += `<rect x="296" y="836" width="64" height="10" fill="#120a1c"/><path d="M300 841h56" stroke="#2a1a44" stroke-dasharray="4 4"/>`
  body += [0, 1, 2].map((k) => `<g fill="#d8c8ff" fill-opacity=".045" style="animation:f3 1.8s steps(1,end) -${f(k * 0.6)}s infinite">` +
    [0, 1, 2].map((i) => `<ellipse cx="${328 + ((i + k) % 3) * 8 - 8}" cy="${820 - i * 36 - k * 10}" rx="${26 + i * 10}" ry="${14 + i * 4}"/>`).join('') + `</g>`).join('')

  // A drone gliding across the top of the alley.
  body += `<g style="animation:drone 30s steps(150,end) -9s infinite"><rect x="-14" y="-3" width="28" height="6" rx="3" fill="#1a1428"/><path d="M-20 -6h12M8 -6h12" stroke="#4a4060" stroke-width="2"/><circle cx="0" cy="4" r="2.4" fill="#ff3a4a" style="animation:blink 1s steps(1,end) infinite"/></g>`

  // Rain, three frames of streaks over everything, and ripples on the street.
  const rain = [0, 1, 2].map((k) => {
    let d = ''
    for (let i = 0; i < 150; i++) { const x = (i * 97 + k * 37) % W, y = (i * 61 + k * 113) % 1000; d += `M${x} ${y}l-6 22` }
    return `<path d="${d}" stroke="#a8d8ff" stroke-opacity=".28" stroke-width="1.4" style="animation:f3 .9s steps(1,end) -${f(k * 0.3)}s infinite"/>`
  })
  body += rain.join('')
  body += [0, 1, 2].map((k) => `<g fill="none" stroke="#c8d8ff" stroke-opacity=".3" style="animation:f3 1.2s steps(1,end) -${f(k * 0.4)}s infinite">` +
    Array.from({ length: 10 }, (_, i) => { const x = 200 + ((i * 131 + k * 53) % 1200), y = Math.max(groundY(x) + 20, 700) + ((i * 37 + k * 19) % 260); return `<ellipse cx="${x}" cy="${f(Math.min(985, y))}" rx="${10 + (i % 3) * 4}" ry="3"/>` }).join('') + `</g>`).join('')

  const css =
    `@keyframes f2{0%{opacity:1}50%{opacity:0}}@keyframes f3{0%{opacity:1}33.333%{opacity:0}}@keyframes f8{0%{opacity:1}12.5%{opacity:0}}` +
    `@keyframes blink{0%{opacity:1}50%{opacity:.15}}` +
    `@keyframes flick{0%{opacity:1}70%{opacity:1}71%{opacity:.15}72%{opacity:1}74%{opacity:.2}75%{opacity:1}}` +
    `@keyframes drone{0%{transform:translate(-60px,90px)}100%{transform:translate(1660px,60px)}}`

  return svgDoc({ defs, css, body })
}
