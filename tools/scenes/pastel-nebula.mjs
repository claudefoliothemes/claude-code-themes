// Soft pastel nebula clouds, a ringed planet and a small moon, twinkling stars, and the odd
// shooting star. Twinkles switch on the 0.1 s grid and the clouds breathe every 3 s, so most
// seconds repaint only a few times.
import { H, TICK, W, f, rng, svgDoc } from './_lib.mjs'

export default function scene() {
  const rnd = rng(0xb1ab1e)
  const CLOUD = ['#cba6f7', '#f5c2e7', '#89b4fa', '#b4befe', '#f5a8d8', '#94e2d5', '#cba6f7', '#89b4fa']
  const defs =
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#11101c"/><stop offset=".6" stop-color="#191728"/><stop offset="1" stop-color="#211d33"/></linearGradient>` +
    CLOUD.map((c, i) => `<radialGradient id="c${i}"><stop offset="0" stop-color="${c}" stop-opacity=".36"/><stop offset=".55" stop-color="${c}" stop-opacity=".14"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`).join('') +
    `<linearGradient id="planet" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f5c2e7"/><stop offset=".5" stop-color="#fab387"/><stop offset="1" stop-color="#8f5f7e"/></linearGradient>` +
    `<linearGradient id="moon" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b8e8ff"/><stop offset="1" stop-color="#4a6a9a"/></linearGradient>` +
    `<radialGradient id="glow"><stop offset="0" stop-color="#f5c2e7" stop-opacity=".22"/><stop offset="1" stop-color="#f5c2e7" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="trail" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".9"/></linearGradient>` +
    `<clipPath id="disc"><circle r="96"/></clipPath>`

  // Nebula clouds: overlapping soft ellipses in two groups that brighten and dim out of step.
  const clouds = ['', '']
  const SPOTS = [[330, 300, 520, 300], [620, 520, 600, 260], [1050, 380, 560, 320], [1350, 700, 480, 260], [240, 760, 460, 240], [880, 160, 520, 200], [1200, 120, 380, 180], [760, 820, 520, 200]]
  SPOTS.forEach(([x, y, rx, ry], i) => {
    for (let k = 0; k < 2; k++) {
      clouds[(i + k) % 2] += `<ellipse cx="${f(x + rnd() * 120 - 60)}" cy="${f(y + rnd() * 80 - 40)}" rx="${f(rx * (0.7 + rnd() * 0.4))}" ry="${f(ry * (0.7 + rnd() * 0.4))}" transform="rotate(${f(rnd() * 40 - 20)} ${x} ${y})" fill="url(#c${Math.floor(rnd() * CLOUD.length)})"/>`
    }
  })
  const breathe = `@keyframes breathe{0%{opacity:.7}25%{opacity:.85}50%{opacity:1}75%{opacity:.85}}`
  const cloudLayer = clouds.map((c, i) => `<g style="animation:breathe 12s steps(1,end) -${i * 6}s infinite">${c}</g>`).join('')

  // Stars: half hold still, the rest twinkle in six groups with different periods.
  const STAR = ['#f5f3ff', '#f5f3ff', '#b4befe', '#f5c2e7', '#f9e2af', '#94e2d5']
  const twinkle = Array.from({ length: 6 }, () => '')
  let still = ''
  for (let i = 0; i < 240; i++) {
    const x = f(rnd() * W), y = f(rnd() * H), r = f(0.6 + rnd() ** 3 * 1.8)
    const star = `<circle cx="${x}" cy="${y}" r="${r}" fill="${STAR[Math.floor(rnd() * STAR.length)]}" fill-opacity="${f(0.5 + rnd() * 0.5)}"/>`
    if (i % 2) still += star
    else twinkle[i % 6] += star
  }
  // A few four-point sparkles, spread over the twinkle groups.
  for (let i = 0; i < 12; i++) {
    const x = f(rnd() * W), y = f(rnd() * H * 0.9), s = f(5 + rnd() * 6)
    twinkle[i % 6] += `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -1.6Q.18 -.18 1.6 0Q.18 .18 0 1.6Q-.18 .18 -1.6 0Q-.18 -.18 0 -1.6Z" fill="${STAR[2 + (i % 4)]}"/>`
  }
  const PERIODS = [2.4, 3.2, 4, 2.8, 3.6, 4.4]
  const twinkleCss = `@keyframes tw{0%{opacity:1}50%{opacity:.2}}`
  const twinkles = twinkle.map((g, i) => `<g style="animation:tw ${PERIODS[i]}s steps(1,end) -${(i * 0.7).toFixed(1)}s infinite">${g}</g>`).join('')

  // A ringed planet: back half of the ring, the banded disc, then the front half.
  const planet =
    `<g transform="translate(1400 200)">` +
    `<circle r="200" fill="url(#glow)"/>` +
    `<ellipse rx="170" ry="38" transform="rotate(-18)" fill="none" stroke="#8a90c8" stroke-width="10"/>` +
    `<circle r="96" fill="url(#planet)"/>` +
    `<g clip-path="url(#disc)" fill="#fff" fill-opacity=".12"><rect x="-100" y="-40" width="200" height="14" transform="rotate(-18)"/><rect x="-100" y="6" width="200" height="22" transform="rotate(-18)"/><rect x="-100" y="48" width="200" height="10" transform="rotate(-18)"/></g>` +
    `<path d="M-170 0A170 38 0 0 0 170 0" transform="rotate(-18)" fill="none" stroke="#c3cbff" stroke-width="10"/></g>`
  const moon = `<g transform="translate(230 770)"><circle r="40" fill="url(#moon)"/><circle cx="-12" cy="-8" r="7" fill="#fff" fill-opacity=".14"/><circle cx="10" cy="12" r="5" fill="#fff" fill-opacity=".1"/></g>`

  // Shooting stars: hidden most of the cycle, then a 1.2 s streak in 12 tick-sized steps.
  const shoot = (x, y, dur, delay, dx, dy) => {
    const hold = +(((dur - 1.2) / dur) * 100).toFixed(4)
    const name = `shoot${dur * 10}`
    return {
      css: `@keyframes ${name}{0%{transform:translate(0,0);opacity:0;animation-timing-function:steps(1,end)}${hold}%{transform:translate(0,0);opacity:1;animation-timing-function:steps(12,end)}100%{transform:translate(${dx}px,${dy}px);opacity:1}}`,
      body: `<g transform="translate(${x} ${y})"><g style="animation:${name} ${dur}s -${delay}s infinite"><g transform="rotate(${f((Math.atan2(dy, dx) * 180) / Math.PI)})"><rect x="-150" y="-1.5" width="150" height="3" rx="1.5" fill="url(#trail)"/><circle r="2.6" fill="#fff"/></g></g></g>`,
    }
  }
  const s1 = shoot(1120, 520, 9, 2, -520, 240)
  const s2 = shoot(560, 90, 14, 9, -420, 300)

  return svgDoc({
    defs,
    css: breathe + twinkleCss + s1.css + s2.css,
    body:
      `<rect width="${W}" height="${H}" fill="url(#sky)"/>` +
      cloudLayer + still + twinkles + planet + moon + s1.body + s2.body,
  })
}
