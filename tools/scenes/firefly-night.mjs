// A dark forest edge with fireflies blinking and drifting above the grass.
// Every change sits on a 0.25 s grid (blink, and drift's 8 steps per 2 s half): at most 4 repaints a second.
import { H, W, f, rng, svgDoc } from './_lib.mjs'

export default function scene() {
  const rnd = rng(0xf1ef1e)
  const defs =
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#030907"/><stop offset=".7" stop-color="#08160f"/><stop offset="1" stop-color="#0c1f14"/></linearGradient>` +
    `<radialGradient id="halo"><stop offset="0" stop-color="#e8ff7a" stop-opacity=".8"/><stop offset="1" stop-color="#e8ff7a" stop-opacity="0"/></radialGradient>`

  // Far tree line, then near pines at both edges, then grass.
  let far = `M0 ${H}V780`
  for (let x = 0; x <= W; x += 40) far += `L${x} ${f(760 - rnd() * 60 - (x % 120 === 0 ? 40 : 0))}`
  far += `L${W} ${H}Z`
  const pine = (x, base, h, w) => {
    let d = ''
    for (let i = 0; i < 4; i++) {
      const top = base - h + i * h * 0.22, half = w * (0.45 + i * 0.18)
      d += `M${f(x)} ${f(top)}L${f(x + half)} ${f(top + h * 0.34)}L${f(x - half)} ${f(top + h * 0.34)}Z`
    }
    return d + `M${f(x - 6)} ${f(base - h * 0.2)}h12V${base}h-12Z`
  }
  const pines = pine(70, 1000, 620, 170) + pine(210, 1000, 470, 130) + pine(1420, 1000, 600, 160) + pine(1550, 1000, 520, 140)
  let grass = `M0 ${H}`
  for (let x = 0; x <= W; x += 9) grass += `L${x} ${f(940 - rnd() * 34)}L${x + 4.5} ${f(975 - rnd() * 10)}`
  grass += `L${W} ${H}Z`

  // Fireflies in blink groups; each group also drifts a few pixels and back.
  const GROUPS = 8
  const flies = Array.from({ length: GROUPS }, () => '')
  for (let i = 0; i < 72; i++) {
    const x = f(60 + rnd() * (W - 120)), y = f(320 + rnd() ** 0.7 * 600)
    flies[i % GROUPS] += `<g transform="translate(${x} ${y})"><circle r="22" fill="url(#halo)"/><circle r="3.2" fill="#fff6b0"/></g>`
  }
  let groups = '', css = ''
  flies.forEach((g, i) => {
    const blinkDelay = -(Math.floor(rnd() * 12) * 0.25)
    const driftDelay = -(Math.floor(rnd() * 8) * 0.5)
    const dx = Math.round(rnd() * 10 - 5), dy = -Math.round(4 + rnd() * 8)
    groups += `<g style="animation:blink 3s steps(1,end) ${blinkDelay}s infinite"><g style="animation:drift${i} 4s steps(8,end) ${driftDelay}s infinite">${g}</g></g>`
    css += `@keyframes drift${i}{0%,100%{transform:translate(0,0)}50%{transform:translate(${dx}px,${dy}px)}}`
  })

  return svgDoc({
    defs,
    css: `@keyframes blink{0%{opacity:.18}50%{opacity:1}83.33%{opacity:.18}}` + css,
    body:
      `<rect width="${W}" height="${H}" fill="url(#sky)"/>` +
      `<path d="${far}" fill="#06120c"/>` +
      groups +
      `<path d="${pines}" fill="#020604"/><path d="${grass}" fill="#020604"/>`,
  })
}
