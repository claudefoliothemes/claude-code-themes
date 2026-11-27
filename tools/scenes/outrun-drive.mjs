// A synthwave night drive: a sports car of our own design seen from behind, its full-width tail
// light glowing, speeding down a neon-edged highway toward a city skyline outlined in pink and cyan
// under a setting sun, palms flicking past on both sides, lane dashes rushing toward you, stars,
// distant light trails, and VHS scanlines. Vector art. Every change lands on the shared 0.1 s tick.
import { H, W, f, rng, svgDoc } from './_lib.mjs'

const HZ = 560, VX = 800 // horizon and vanishing point
const BOTTOM = H

// A point on the road at depth t (0 = horizon, 1 = bottom of the screen), u from -1 (left edge) to 1.
const road = (t, u) => { const y = HZ + (BOTTOM - HZ) * t * t, half = 40 + 820 * t * t; return [VX + u * half, y] }

export default function scene() {
  const rnd = rng(0x0b7a)
  const defs =
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070214"/><stop offset=".45" stop-color="#2a0a4a"/><stop offset=".8" stop-color="#8a1a7a"/><stop offset="1" stop-color="#ff4a8a"/></linearGradient>` +
    `<linearGradient id="sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe86a"/><stop offset=".55" stop-color="#ff8a4a"/><stop offset="1" stop-color="#ff2a8a"/></linearGradient>` +
    `<radialGradient id="sunGlow"><stop offset="0" stop-color="#ff6a9a" stop-opacity=".55"/><stop offset="1" stop-color="#ff6a9a" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="asphalt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a0828"/><stop offset="1" stop-color="#08030e"/></linearGradient>` +
    `<linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14062a"/><stop offset="1" stop-color="#05020a"/></linearGradient>` +
    `<radialGradient id="tail"><stop offset="0" stop-color="#ff2a4a" stop-opacity=".55"/><stop offset="1" stop-color="#ff2a4a" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a1a5a"/><stop offset="1" stop-color="#120620"/></linearGradient>` +
    `<pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1.4" fill="#000000" fill-opacity=".25"/></pattern>`

  let body = `<rect width="${W}" height="${H}" fill="url(#sky)"/>`
  let stars = ''
  for (let i = 0; i < 90; i++) stars += `<circle cx="${f(rnd() * W)}" cy="${f(rnd() * 380)}" r="${f(0.7 + rnd() * 1.3)}"/>`
  body += `<g fill="#ffe8ff" fill-opacity=".75">${stars}</g>`
  body += [0, 1].map((k) => `<g fill="#ffffff" style="animation:f2 2.4s steps(1,end) -${k * 1.2}s infinite">` + Array.from({ length: 8 }, (_, i) => `<circle cx="${(i * 197 + k * 311) % W}" cy="${(i * 53 + k * 97) % 360}" r="1.8"/>`).join('') + `</g>`).join('')

  // The setting sun behind the city, and its glow.
  body += `<circle cx="${VX}" cy="${HZ - 40}" r="420" fill="url(#sunGlow)"/><circle cx="${VX}" cy="${HZ - 40}" r="170" fill="url(#sun)"/>`

  // Mountains with a pink rim, then the neon skyline at the horizon.
  body += `<path d="M0 ${HZ}L120 470L260 520L420 430L560 ${HZ}ZM1040 ${HZ}L1180 440L1320 500L1460 420L1600 480V${HZ}Z" fill="#14062a" stroke="#ff4aa8" stroke-width="2" stroke-opacity=".6"/>`
  let city = '', windows = ''
  for (let x = 520; x < 1080;) {
    const w = 26 + rnd() * 44, h = 50 + rnd() * 140, c = rnd() < 0.5 ? '#ff3ab0' : '#3ae8ff'
    city += `<rect x="${f(x)}" y="${f(HZ - h)}" width="${f(w)}" height="${f(h)}" fill="#0a0418" stroke="${c}" stroke-width="1.6" stroke-opacity=".8"/>`
    for (let y = HZ - h + 8; y < HZ - 6; y += 10) for (let wx = x + 5; wx < x + w - 5; wx += 8) if (rnd() < 0.22) windows += `<rect x="${f(wx)}" y="${f(y)}" width="3" height="4"/>`
    x += w + 3
  }
  body += city + `<g fill="#ffd8f0" fill-opacity=".7">${windows}</g>`

  // The ground and the road with glowing neon edges.
  body += `<rect y="${HZ}" width="${W}" height="${H - HZ}" fill="url(#ground)"/>`
  const [l0x, l0y] = road(0, -1), [r0x] = road(0, 1), [l1x] = road(1, -1), [r1x] = road(1, 1)
  body += `<path d="M${f(l0x)} ${l0y}L${f(r0x)} ${l0y}L${f(r1x)} ${H}L${f(l1x)} ${H}Z" fill="url(#asphalt)"/>`
  for (const u of [-1, 1]) {
    const [ax, ay] = road(0, u), [bx, by] = road(1, u)
    body += `<path d="M${f(ax)} ${ay}L${f(bx)} ${by}" stroke="#ff3ab0" stroke-width="14" stroke-opacity=".18"/><path d="M${f(ax)} ${ay}L${f(bx)} ${by}" stroke="#ff7ad0" stroke-width="3"/>`
  }
  // Light trails of distant traffic near the horizon.
  body += `<path d="M${VX - 20} ${HZ + 2}L${VX - 200} ${HZ + 30}M${VX + 20} ${HZ + 2}L${VX + 230} ${HZ + 34}" stroke="#ffd06a" stroke-width="2" stroke-opacity=".5"/>`

  // Lane dashes rushing toward you: four frames, each with the dashes shifted a quarter step.
  const dashes = [0, 1, 2, 3].map((k) => {
    let d = ''
    for (let i = 0; i < 8; i++) {
      const t0 = (i + k / 4) / 8, t1 = t0 + 0.045
      if (t1 > 1) continue
      const [ax, ay] = road(t0, 0), [bx, by] = road(t1, 0), w0 = 2 + 18 * t0 * t0
      d += `<path d="M${f(ax - w0 / 2)} ${f(ay)}L${f(ax + w0 / 2)} ${f(ay)}L${f(bx + w0 * 0.6)} ${f(by)}L${f(bx - w0 * 0.6)} ${f(by)}Z"/>`
    }
    return `<g fill="#ffe0f4" fill-opacity=".85" style="animation:f4 .4s steps(1,end) -${f(k * 0.1)}s infinite">${d}</g>`
  }).join('')
  body += dashes
  // Palms flicking past on both sides, four frames.
  const palm = (x, y, s, flip) => `<g transform="translate(${f(x)} ${f(y)}) scale(${f(flip * s)} ${f(s)})"><path d="M0 0C4 -60 14 -120 26 -170" fill="none" stroke="#0a0418" stroke-width="9"/>` +
    [[-60, -150], [-40, -190], [10, -205], [60, -185], [80, -150], [20, -150]].map(([x2, y2]) => `<path d="M26 -170Q${f((26 + x2) / 2)} ${f(Math.min(-170, y2) - 22)} ${x2} ${y2}" fill="none" stroke="#0a0418" stroke-width="7" stroke-linecap="round"/>`).join('') + `</g>`
  body += [0, 1, 2, 3].map((k) => {
    let g = ''
    for (let i = 0; i < 4; i++) {
      const t = (i + k / 4) / 4
      if (t < 0.22) continue
      for (const u of [-1, 1]) { const [x, y] = road(t, u * 1.35); g += palm(x, y, 0.2 + t * 1.6, u) }
    }
    return `<g style="animation:f4 1.6s steps(1,end) -${f(k * 0.4)}s infinite">${g}</g>`
  }).join('')

  // The car from behind: a long, low wedge with a slim glass cabin, a full-width tail light bar,
  // a lip spoiler, twin exhausts, and wide flat tires.
  const CX = VX, CY = 884
  body += `<ellipse cx="${CX}" cy="${CY + 36}" rx="300" ry="16" fill="#000000" fill-opacity=".6"/>`
  body += `<ellipse cx="${CX}" cy="${CY - 10}" rx="420" ry="80" fill="url(#tail)" style="animation:breathe 1.2s steps(1,end) infinite"/>`
  body += `<rect x="${CX - 262}" y="${CY + 2}" width="64" height="30" rx="6" fill="#08030c"/><rect x="${CX + 198}" y="${CY + 2}" width="64" height="30" rx="6" fill="#08030c"/>`
  body += `<path d="M${CX - 100} ${CY - 74}H${CX + 100}L${CX + 168} ${CY - 36}H${CX - 168}Z" fill="#0a0418" stroke="#3ae8ff" stroke-width="1.5" stroke-opacity=".55"/>`
  body += `<path d="M${CX - 92} ${CY - 69}H${CX + 92}L${CX + 150} ${CY - 40}H${CX - 150}Z" fill="#1a0a30"/><path d="M${CX - 60} ${CY - 66}L${CX - 110} ${CY - 42}" stroke="#3ae8ff" stroke-width="3" stroke-opacity=".25"/>`
  body += `<path d="M${CX - 270} ${CY + 16}L${CX - 264} ${CY - 14}Q${CX - 256} ${CY - 34} ${CX - 204} ${CY - 38}H${CX + 204}Q${CX + 256} ${CY - 34} ${CX + 264} ${CY - 14}L${CX + 270} ${CY + 16}Z" fill="url(#body)" stroke="#ff4aa8" stroke-width="2" stroke-opacity=".7"/>`
  body += `<path d="M${CX - 214} ${CY - 42}H${CX + 214}" stroke="#ff4aa8" stroke-width="4" stroke-linecap="round"/>`
  body += `<rect x="${CX - 248}" y="${CY - 26}" width="496" height="10" rx="4" fill="#ff1a3a"/><rect x="${CX - 240}" y="${CY - 23}" width="480" height="3" rx="1.5" fill="#ffc0c8"/>`
  body += `<rect x="${CX - 48}" y="${CY - 8}" width="96" height="16" rx="2" fill="#1a0a24" stroke="#5a3a7a"/><path d="M${CX - 276} ${CY + 16}H${CX + 276}" stroke="#ff4aa8" stroke-width="3"/>`
  for (const x of [CX - 150, CX + 120]) body += `<ellipse cx="${x + 15}" cy="${CY + 10}" rx="14" ry="6" fill="#2a2a34" stroke="#8a8a9a" stroke-width="2"/>`

  // VHS scanlines over everything.
  body += `<rect width="${W}" height="${H}" fill="url(#scan)"/>`

  const css =
    `@keyframes f2{0%{opacity:1}50%{opacity:0}}@keyframes f4{0%{opacity:1}25%{opacity:0}}@keyframes breathe{0%{opacity:.8}50%{opacity:1}}`

  return svgDoc({ defs, css, body })
}
