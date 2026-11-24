// Looking up at a starlight headliner, a luxury car's ceiling at night: dark perforated leather lined with over a thousand
// fiber-optic pinpoint stars that twinkle and now and then glint, a shooting star streaking across
// every so often, soft ambient light strips along the edges, and the sun visors and mirror at the
// front. Every change lands on the shared 0.1 s tick.
import { H, W, f, rng, svgDoc } from './_lib.mjs'

export default function scene() {
  const rnd = rng(0x57a2)
  const defs =
    `<radialGradient id="leather" cx="800" cy="470" r="1050" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#15141f"/><stop offset=".55" stop-color="#0c0b14"/><stop offset="1" stop-color="#040308"/></radialGradient>` +
    `<pattern id="perf" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r=".7" fill="#000000" fill-opacity=".35"/></pattern>` +
    `<linearGradient id="edgeL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000000" stop-opacity=".9"/><stop offset="1" stop-color="#000000" stop-opacity="0"/></linearGradient>` +
    `<linearGradient id="edgeR" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#000000" stop-opacity=".9"/><stop offset="1" stop-color="#000000" stop-opacity="0"/></linearGradient>` +
    `<linearGradient id="edgeB" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#000000" stop-opacity=".8"/><stop offset="1" stop-color="#000000" stop-opacity="0"/></linearGradient>` +
    `<linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity="0"/><stop offset=".5" stop-color="#ffffff" stop-opacity=".035"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>` +
    `<radialGradient id="halo"><stop offset="0" stop-color="#fff6e6" stop-opacity=".75"/><stop offset="1" stop-color="#fff6e6" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="tail" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#ffffff" stop-opacity=".95"/></linearGradient>` +
    `<linearGradient id="visor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#08080e"/><stop offset="1" stop-color="#14131c"/></linearGradient>`

  // The headliner: leather, its perforation, a soft sheen down the middle, and two stitched seams.
  let body = `<rect width="${W}" height="${H}" fill="url(#leather)"/><rect width="${W}" height="${H}" fill="url(#perf)"/>`
  body += `<rect x="420" y="0" width="760" height="${H}" fill="url(#sheen)"/>`
  for (const [x, bow] of [[372, -40], [1228, 40]]) {
    const d = `M${x} -10Q${x + bow} 500 ${x} ${H + 10}`
    body += `<path d="${d}" fill="none" stroke="#1d1c29" stroke-width="3"/><path d="${d}" transform="translate(${bow < 0 ? 7 : -7} 0)" fill="none" stroke="#2a2838" stroke-width="1.2" stroke-dasharray="7 6"/>`
  }

  // The front: sun visors in the corners and the mirror in the middle. Stars skip these.
  const keepOut = [[120, -40, 560, 78], [1040, -40, 1480, 78], [690, 0, 910, 70]]
  const inside = (x, y, pad = 6) => keepOut.some(([x0, y0, x1, y1]) => x > x0 - pad && x < x1 + pad && y > y0 - pad && y < y1 + pad)

  // Fiber-optic stars: most hold steady, some twinkle in six rhythms, a few glint now and then.
  let still = ''
  const twinkle = ['', '', '', '', '', '']
  const halos = []
  let placed = 0
  while (placed < 1450) {
    const x = 112 + rnd() * (W - 224), y = rnd() * H
    const edge = Math.min(x - 112, W - 112 - x) / 220, keep = Math.min(1, 0.35 + edge)
    if (rnd() > keep || inside(x, y)) continue
    placed++
    const big = rnd() < 0.06, r = big ? 1.4 + rnd() * 0.7 : 0.7 + rnd() * 0.7
    const c = `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}"${rnd() < 0.18 ? ' fill="#dfe8ff"' : ''}/>`
    if (big) halos.push([x, y])
    if (rnd() < 0.42) twinkle[placed % 6] += c
    else still += c
  }
  body += `<g fill="#fff6e6">${halos.map(([x, y]) => `<circle cx="${f(x)}" cy="${f(y)}" r="10" fill="url(#halo)"/>`).join('')}${still}</g>`
  const PERIODS = [1.6, 2.2, 2.8, 3.4, 4, 4.6]
  body += twinkle.map((g, k) => `<g fill="#ffffff" style="animation:tw ${PERIODS[k]}s steps(1,end) -${f((k * 0.7) % PERIODS[k])}s infinite">${g}</g>`).join('')

  // Glints: a four-point sparkle flaring on a bright star, on 5 to 20 second cycles.
  const sparkle = 'M0 -12Q.8 -.8 12 0Q.8 .8 0 12Q-.8 .8 -12 0Q-.8 -.8 0 -12Z'
  body += halos.slice(0, 32).map(([x, y], i) => `<path transform="translate(${f(x)} ${f(y)})" d="${sparkle}" fill="#fffaf0" style="animation:glint ${[5, 10, 15, 20][i % 4]}s steps(1,end) -${f((i * 1.3) % 5)}s infinite"/>`).join('')

  // Shooting stars, two paths on their own cycles.
  const streak = (x, y, dx, dy, cycle, delay) => {
    const at = (s) => f((s / cycle) * 100)
    const show = cycle - 1.5
    const kf = `@keyframes s${cycle}{0%{opacity:0;transform:translate(${x}px,${y}px)}${at(show)}%{opacity:1;transform:translate(${x}px,${y}px);animation-timing-function:steps(6,end)}${at(show + 0.6)}%{opacity:1;transform:translate(${x + dx}px,${y + dy}px);animation-timing-function:steps(1,end)}${at(show + 0.7)}%{opacity:0;transform:translate(${x + dx}px,${y + dy}px)}100%{opacity:0;transform:translate(${x + dx}px,${y + dy}px)}}`
    return [kf, `<g style="animation:s${cycle} ${cycle}s steps(1,end) -${delay}s infinite"><path d="M-120 -40L0 0" stroke="url(#tail)" stroke-width="2" stroke-linecap="round"/><circle r="2.2" fill="#ffffff"/><circle r="8" fill="url(#halo)"/></g>`]
  }
  const shots = [streak(260, 180, 420, 140, 10, 3), streak(980, 560, 380, 126, 20, 9)]
  body += shots.map(([, g]) => g).join('')

  // Edges: the roof curving down at the sides and back, with ambient light strips along each side.
  body += `<rect width="230" height="${H}" fill="url(#edgeL)"/><rect x="${W - 230}" width="230" height="${H}" fill="url(#edgeR)"/><rect y="${H - 160}" width="${W}" height="160" fill="url(#edgeB)"/>`
  for (const [x, bow] of [[96, -34], [W - 96, 34]]) {
    const d = `M${x} -10Q${x + bow} 500 ${x} ${H + 10}`
    body += `<path d="${d}" fill="none" stroke="#9fb8ff" stroke-opacity=".07" stroke-width="18"/><path d="${d}" fill="none" stroke="#c8d6ff" stroke-opacity=".38" stroke-width="2.5"/>`
  }

  // Sun visors and the mirror.
  for (const [x0, , x1] of keepOut.slice(0, 2)) {
    body += `<rect x="${x0}" y="-40" width="${x1 - x0}" height="118" rx="22" fill="url(#visor)" stroke="#1e1d2a" stroke-width="2"/><rect x="${x0 + 18}" y="58" width="${x1 - x0 - 36}" height="2" fill="#24232f"/>`
  }
  body += `<rect x="790" y="0" width="20" height="22" fill="#0e0d16"/><rect x="690" y="18" width="220" height="52" rx="14" fill="#0a0a12" stroke="#24232f" stroke-width="2"/><rect x="702" y="28" width="196" height="32" rx="9" fill="#11111c"/><path d="M712 30L760 58" stroke="#ffffff" stroke-opacity=".05" stroke-width="10"/>`

  const css =
    `@keyframes tw{0%{opacity:1}50%{opacity:.2}}` +
    `@keyframes glint{0%{opacity:0}88%{opacity:0}90%{opacity:1}94%{opacity:.5}96%{opacity:0}}` +
    shots.map(([kf]) => kf).join('')

  return svgDoc({ defs, css, body })
}
