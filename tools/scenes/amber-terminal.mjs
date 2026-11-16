// An old amber CRT: two columns of log lines scrolling up a line at a time, scanlines, a vignette,
// and a blinking cursor. Lines move on 0.5 s and 0.3 s steps; the cursor on 0.5 s.
import { H, W, f, rng, svgDoc } from './_lib.mjs'

export default function scene() {
  const rnd = rng(0xa3b3e7)
  const hex = (n) => Array.from({ length: n }, () => '0123456789abcdef'[Math.floor(rnd() * 16)]).join('')
  const int = (a, b) => a + Math.floor(rnd() * (b - a))
  const TEMPLATES = [
    () => `ok    build ${hex(4)} linked in ${int(12, 90)}ms`,
    () => `sync  shard ${int(1, 64)}/64 .. done`,
    () => `warm  cache ${int(80, 99)}.${int(0, 9)}%`,
    () => `spawn worker ${hex(6)} pid ${int(1000, 9999)}`,
    () => `probe :${int(3000, 9000)} - 200`,
    () => `gc    pause ${int(1, 9)}ms heap ${int(120, 900)}mb`,
    () => `fetch ${hex(7)}..${hex(7)} 2xx`,
    () => `diff  +${int(1, 300)} -${int(1, 120)}`,
    () => `sum   ${hex(16)} ok`,
    () => `queue depth ${int(0, 40)}`,
    () => `tick  ${int(10000, 99999)} drift 0.${int(0, 9)}ms`,
  ]
  const LINE = 26, COUNT = 40

  const column = (x, secondsPerLine) => {
    let lines = ''
    const text = Array.from({ length: COUNT }, () => TEMPLATES[Math.floor(rnd() * TEMPLATES.length)]())
    for (let copy = 0; copy < 2; copy++) {
      text.forEach((t, i) => {
        const bright = rnd() < 0.12
        lines += `<text x="${x}" y="${(copy * COUNT + i) * LINE + 40}" fill="${bright ? '#ffd27a' : '#ffb000'}" fill-opacity="${bright ? 1 : f(0.45 + rnd() * 0.4)}">${t}</text>`
      })
    }
    return `<g style="animation:scroll ${f(COUNT * secondsPerLine)}s steps(${COUNT},end) infinite">${lines}</g>`
  }

  const defs =
    `<radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset="0" stop-color="#1c1003"/><stop offset="1" stop-color="#040200"/></radialGradient>` +
    `<pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#000" fill-opacity=".35"/></pattern>`

  return svgDoc({
    defs,
    css:
      `@keyframes scroll{from{transform:translateY(0)}to{transform:translateY(${-COUNT * LINE}px)}}` +
      `.cur{animation:cur 1s steps(1,end) infinite}@keyframes cur{0%{opacity:1}50%{opacity:0}}`,
    body:
      `<rect width="${W}" height="${H}" fill="url(#vig)"/>` +
      `<g font-family="Consolas,Courier New,monospace" font-size="17">${column(70, 0.5)}${column(880, 0.3)}</g>` +
      `<rect y="930" width="${W}" height="${H - 930}" fill="#0a0600" fill-opacity=".92"/>` +
      `<text x="70" y="972" font-family="Consolas,Courier New,monospace" font-size="20" fill="#ffd27a">$</text>` +
      `<rect class="cur" x="92" y="955" width="12" height="22" fill="#ffd27a"/>` +
      `<rect width="${W}" height="${H}" fill="url(#scan)"/>`,
  })
}
