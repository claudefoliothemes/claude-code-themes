// A moonlit branch of blossoms with petals tumbling down. Each petal falls on 0.1 s steps; all of
// them share the tick, so the window repaints at most 10 times a second.
import { H, TICK, W, f, onTick, rng, svgDoc } from './_lib.mjs'

export default function scene() {
  const rnd = rng(0x5a6c0a)
  const defs =
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0814"/><stop offset="1" stop-color="#1d1128"/></linearGradient>` +
    `<radialGradient id="moonHalo"><stop offset="0" stop-color="#ffd9e8" stop-opacity=".35"/><stop offset="1" stop-color="#ffd9e8" stop-opacity="0"/></radialGradient>`

  const branch =
    `<g fill="none" stroke="#1d1018" stroke-linecap="round">` +
    `<path d="M-20 140C140 120 260 60 420 70S640 40 760 90" stroke-width="16"/>` +
    `<path d="M260 85C300 150 330 190 360 230" stroke-width="7"/>` +
    `<path d="M520 60C560 20 600 0 640 -10" stroke-width="6"/>` +
    `<path d="M140 125C160 190 150 240 170 290" stroke-width="6"/></g>`

  const PINKS = ['#ffc2d9', '#f7a1c4', '#ffd9e8']
  const ALONG = [[60, 130], [140, 125], [200, 105], [260, 85], [330, 72], [420, 70], [500, 62], [580, 50], [680, 62], [750, 88], [360, 230], [330, 190], [150, 200], [170, 290], [640, -5], [600, 20]]
  let blossoms = ''
  for (const [x, y] of ALONG) {
    for (let i = 0; i < 5; i++) {
      blossoms += `<circle cx="${f(x + rnd() * 36 - 18)}" cy="${f(y + rnd() * 30 - 15)}" r="${f(4 + rnd() * 5)}" fill="${PINKS[Math.floor(rnd() * 3)]}" fill-opacity="${f(0.75 + rnd() * 0.25)}"/>`
    }
  }

  // Three fall paths; each petal sits at its own x and starts at its own point in the fall.
  const FALLS = [[120, 300], [-90, -260], [220, 420]]
  const css = FALLS.map(([dx, r], i) => `@keyframes fall${i}{from{transform:translate(0,-60px) rotate(0)}to{transform:translate(${dx}px,${H + 60}px) rotate(${r}deg)}}`).join('')
  let petals = ''
  for (let i = 0; i < 44; i++) {
    const x = f(rnd() * W), dur = onTick(9 + rnd() * 7), fall = Math.floor(rnd() * FALLS.length)
    const delay = -onTick(rnd() * dur)
    const s = f(1.2 + rnd() * 0.9)
    petals += `<g transform="translate(${x} 0)"><g style="animation:fall${fall} ${dur}s steps(${Math.round(dur / TICK)},end) ${delay}s infinite">` +
      `<path transform="scale(${s})" d="M0 -6C5 -6 8 0 0 8C-8 0 -5 -6 0 -6Z" fill="${PINKS[i % 3]}" fill-opacity=".9"/></g></g>`
  }

  return svgDoc({
    defs,
    css,
    body:
      `<rect width="${W}" height="${H}" fill="url(#sky)"/>` +
      `<circle cx="1330" cy="170" r="190" fill="url(#moonHalo)"/><circle cx="1330" cy="170" r="62" fill="#fff1f6"/>` +
      branch + blossoms + petals,
  })
}
