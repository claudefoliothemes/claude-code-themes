// A minimal dark theme: charcoal gray with faint contour lines that drift slowly sideways, one step
// a second, and a soft light that breathes in one corner. Nothing else moves, so it stays quiet
// and nearly free on the CPU.
import { H, W, f, svgDoc } from './_lib.mjs'

export default function scene() {
  const defs =
    `<linearGradient id="base" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#17181c"/><stop offset="1" stop-color="#101114"/></linearGradient>` +
    `<radialGradient id="glow" cx="1240" cy="220" r="760" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#8a9ab8" stop-opacity=".09"/><stop offset="1" stop-color="#8a9ab8" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#101114" stop-opacity=".55"/><stop offset=".25" stop-color="#101114" stop-opacity="0"/><stop offset=".75" stop-color="#101114" stop-opacity="0"/><stop offset="1" stop-color="#101114" stop-opacity=".6"/></linearGradient>`

  // Contour lines: gently wavy, spaced like a topographic map, wider than the screen so the drift
  // never shows an edge.
  let lines = ''
  for (let k = 0; k < 34; k++) {
    const y0 = -40 + k * 32, a = 8 + (k % 3) * 2, p = k * 0.18
    let d = ''
    for (let x = -240; x <= W + 240; x += 32) {
      const y = y0 + a * Math.sin(x / 260 + p) + 4 * Math.sin(x / 97 + p * 1.3) + 26 * Math.sin(x / 610 + k * 0.05)
      d += `${d ? 'L' : 'M'}${x} ${f(y)}`
    }
    lines += `<path d="${d}"${k % 4 === 0 ? ' stroke="#34363e" stroke-width="1.6"' : ''}/>`
  }

  const body =
    `<rect width="${W}" height="${H}" fill="url(#base)"/>` +
    `<rect width="${W}" height="${H}" fill="url(#glow)" style="animation:breathe 12s steps(1,end) infinite"/>` +
    `<g fill="none" stroke="#25272d" stroke-width="1.2" style="animation:drift 160s steps(160,end) infinite alternate">${lines}</g>` +
    `<rect width="${W}" height="${H}" fill="url(#fade)"/>`

  const css =
    `@keyframes drift{0%{transform:translate(0,0)}100%{transform:translate(-160px,12px)}}` +
    `@keyframes breathe{0%{opacity:.75}50%{opacity:1}}`

  return svgDoc({ defs, css, body })
}
