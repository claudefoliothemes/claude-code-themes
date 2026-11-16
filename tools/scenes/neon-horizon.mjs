// A retro sunset: striped sun, magenta mountains, and a perspective grid rolling toward the viewer.
// The rolling grid is a flipbook: K groups of horizontal lines, one shown per tick, in order.
import { H, TICK, W, f, rng, svgDoc } from './_lib.mjs'

export default function scene() {
  const rnd = rng(0x5e7a)
  const HZ = 560 // horizon
  const VX = W / 2 // vanishing point

  const defs =
    `<linearGradient id="sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${HZ}"><stop offset="0" stop-color="#0b0420"/><stop offset=".6" stop-color="#2a0a3d"/><stop offset="1" stop-color="#6a1457"/></linearGradient>` +
    `<linearGradient id="sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe46b"/><stop offset=".55" stop-color="#ff8a4c"/><stop offset="1" stop-color="#ff3ea5"/></linearGradient>` +
    `<linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a0630"/><stop offset="1" stop-color="#05010b"/></linearGradient>` +
    `<radialGradient id="haze" gradientUnits="userSpaceOnUse" cx="${VX}" cy="${HZ}" r="700"><stop offset="0" stop-color="#ff3ea5" stop-opacity=".28"/><stop offset="1" stop-color="#ff3ea5" stop-opacity="0"/></radialGradient>`

  // Stars: most still, two small layers twinkling on the tick.
  let still = '', tw = ['', '']
  for (let i = 0; i < 90; i++) {
    const x = f(rnd() * W), y = f(rnd() * (HZ - 120)), r = f(0.8 + rnd() * 1.6)
    const dot = `<circle cx="${x}" cy="${y}" r="${r}"/>`
    const k = rnd()
    if (k < 0.15) tw[0] += dot
    else if (k < 0.3) tw[1] += dot
    else still += dot
  }

  // Sun with stripes cut in the sky's own gradient.
  let stripes = ''
  for (let i = 0; i < 6; i++) stripes += `<rect x="600" y="${f(430 + i * 22 + i * i * 1.5)}" width="400" height="${f(3 + i * 2.2)}" fill="url(#sky)"/>`

  const ridge = [[0, 560], [0, 470], [90, 430], [170, 480], [260, 410], [360, 500], [430, 470], [520, 560]]
  const mountain = (pts) => `<polygon points="${pts.map((p) => p.join(',')).join(' ')}" fill="#12052a" stroke="#ff3ea5" stroke-opacity=".55" stroke-width="2"/>`

  let verticals = ''
  for (let x = -2400; x <= 4000; x += 160) verticals += `M${VX} ${HZ}L${x} ${H}`

  const K = 8, N = 11
  let phases = ''
  for (let j = 0; j < K; j++) {
    let lines = ''
    for (let k = 0; k < N; k++) {
      const t = (k + j / K) / N
      const y = HZ + (H - HZ) * t ** 2.3
      if (y - HZ < 3) continue
      lines += `<path d="M0 ${f(y)}H${W}" stroke-width="${f(1 + 2.5 * t)}" stroke-opacity="${f(0.35 + 0.5 * t)}"/>`
    }
    phases += `<g class="ph" style="animation-delay:${f((j - K) * TICK)}s">${lines}</g>`
  }

  const css =
    `.ph{opacity:0;animation:ph ${f(K * TICK)}s steps(1,end) infinite}@keyframes ph{0%{opacity:1}${f(100 / K)}%{opacity:0}}` +
    `.t0{animation:tw 1.6s steps(1,end) infinite}.t1{animation:tw 1.6s steps(1,end) -.8s infinite}@keyframes tw{0%{opacity:1}50%{opacity:.2}}`

  const body =
    `<rect width="${W}" height="${HZ}" fill="url(#sky)"/>` +
    `<g fill="#f3d9ff">${still}<g class="t0">${tw[0]}</g><g class="t1">${tw[1]}</g></g>` +
    `<circle cx="${VX}" cy="420" r="165" fill="url(#sun)"/>${stripes}` +
    mountain(ridge) + mountain(ridge.map(([x, y]) => [W - x, y])) +
    `<rect y="${HZ}" width="${W}" height="${H - HZ}" fill="url(#ground)"/>` +
    `<rect width="${W}" height="${H}" fill="url(#haze)"/>` +
    `<rect y="${HZ - 2}" width="${W}" height="4" fill="#ff3ea5" fill-opacity=".85"/>` +
    `<g fill="none" stroke="#ff3ea5"><path d="${verticals}" stroke-width="2.5" stroke-opacity=".5"/>${phases}</g>`

  return svgDoc({ defs, css, body })
}
