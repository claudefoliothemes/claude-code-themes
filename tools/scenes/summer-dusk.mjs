// An anime-style summer evening: towering clouds lit pink and gold, power lines with birds on
// them, a plane drawing a contrail, the first stars, a railroad crossing whose lights blink while
// a little train passes, and tall grass swaying. An original scene in the anime style, not from
// any show. Every change lands on the shared 0.1 s tick.
import { H, TICK, W, f, rng, svgDoc } from './_lib.mjs'

const GROUND = 860, RAIL = 830

export default function scene() {
  const rnd = rng(0x5d05c)
  const defs =
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#262a62"/><stop offset=".35" stop-color="#5d4a95"/><stop offset=".7" stop-color="#d9798d"/><stop offset="1" stop-color="#f6b26b"/></linearGradient>` +
    `<radialGradient id="sunGlow"><stop offset="0" stop-color="#fff0c2" stop-opacity=".85"/><stop offset="1" stop-color="#ffb26b" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="trail" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".7"/></linearGradient>`

  // Towering clouds: a body, a lit top edge, and a shaded base, each a stack of round puffs.
  const cloud = (cx, cy, s) => {
    const puffs = Array.from({ length: 14 }, () => [cx + (rnd() - 0.5) * 360 * s, cy - rnd() ** 1.4 * 260 * s, (50 + rnd() * 70) * s])
    const ring = (dx, dy, k, color, op) => `<g fill="${color}" fill-opacity="${op}">${puffs.map(([x, y, r]) => `<circle cx="${f(x + dx)}" cy="${f(y + dy)}" r="${f(r * k)}"/>`).join('')}</g>`
    return ring(0, 18 * s, 1, '#8e5f93', 1) + ring(0, 0, 1, '#f1a3a8', 1) + ring(-10 * s, -14 * s, 0.82, '#ffd6b3', 0.85)
  }
  const clouds =
    `<g style="animation:drift 120s steps(600,end) infinite">${cloud(260, 520, 1.15)}${cloud(1340, 470, 1.3)}${cloud(820, 300, 0.6)}</g>`

  // The first stars near the top, twinkling.
  const stars = ['', '']
  for (let i = 0; i < 40; i++) stars[i % 2] += `<circle cx="${f(rnd() * W)}" cy="${f(rnd() * 180)}" r="${f(0.8 + rnd() * 1.2)}"/>`
  const starGroups = stars.map((g, i) => `<g fill="#fff6e0" style="animation:tw ${[2.4, 3.2][i]}s steps(1,end) -${i}s infinite">${g}</g>`).join('')

  // A plane crossing high up, its contrail trailing behind it.
  const plane =
    `<g transform="translate(0 150)"><g style="animation:fly 40s steps(400,end) -14s infinite">` +
    `<rect x="-420" y="-2" width="420" height="4" fill="url(#trail)"/><path d="M0 0L14 -3L18 0L14 3Z" fill="#fff8ee"/></g></g>`

  // Power lines: poles at both sides, three sagging wires, and birds sitting on the top wire.
  const pole = (x, h) =>
    `<rect x="${x - 7}" y="${GROUND - h}" width="14" height="${h}" fill="#1c1a33"/>` +
    `<rect x="${x - 60}" y="${GROUND - h + 30}" width="120" height="8" fill="#1c1a33"/><rect x="${x - 44}" y="${GROUND - h + 70}" width="88" height="7" fill="#1c1a33"/>`
  const P1 = 180, P2 = 1460, TOP = GROUND - 640
  const wire = (dx, y, sag) => `M${P1 + dx} ${y}Q${(P1 + P2) / 2} ${y + sag} ${P2 + dx} ${y}`
  const wires = `<path d="${wire(-56, TOP + 34, 90)}${wire(56, TOP + 34, 90)}${wire(-40, TOP + 74, 70)}M-20 ${TOP + 120}Q${P1 / 2} ${TOP + 150} ${P1} ${TOP + 34}M${P2} ${TOP + 34}Q${(P2 + W) / 2} ${TOP + 150} ${W + 20} ${TOP + 120}" fill="none" stroke="#1c1a33" stroke-width="3"/>`
  const sagAt = (x) => { const t = (x - (P1 - 56)) / ((P2 - 56) - (P1 - 56)); return TOP + 34 + 2 * t * (1 - t) * 90 }
  let birds = ''
  for (const [x, flip] of [[520, 1], [560, -1], [980, 1], [1130, -1], [1170, 1]]) {
    const y = sagAt(x)
    birds += `<g transform="translate(${x} ${f(y)}) scale(${flip} 1)"><g style="animation:hop 4s steps(1,end) -${(Math.round(rnd() * 30) / 10).toFixed(1)}s infinite">` +
      `<ellipse cx="0" cy="-8" rx="9" ry="7" fill="#1c1a33"/><circle cx="7" cy="-15" r="5" fill="#1c1a33"/><path d="M11 -15l5 1-5 1Z" fill="#1c1a33"/><path d="M-8 -6l-8 4" stroke="#1c1a33" stroke-width="3"/></g></g>`
  }

  // Railroad crossing: the signal's two lights blink in turn, and a short train runs past.
  const crossing =
    `<g transform="translate(1240 ${GROUND})"><rect x="-5" y="-170" width="10" height="170" fill="#1c1a33"/>` +
    `<path d="M-34 -150L34 -120M-34 -120L34 -150" stroke="#f4f0e6" stroke-width="7"/><path d="M-34 -150L34 -120M-34 -120L34 -150" stroke="#1c1a33" stroke-width="7" stroke-dasharray="10 10"/>` +
    `<rect x="-36" y="-108" width="72" height="22" rx="11" fill="#1c1a33"/>` +
    `<circle cx="-18" cy="-97" r="8" fill="#ff4a4a" style="animation:bell 1s steps(1,end) infinite"/><circle cx="18" cy="-97" r="8" fill="#ff4a4a" style="animation:bell 1s steps(1,end) -.5s infinite"/></g>`
  let cars = ''
  for (let k = 0; k < 3; k++) {
    cars += `<rect x="${k * 150}" y="-46" width="144" height="40" rx="6" fill="#2a2748"/><rect x="${k * 150}" y="-18" width="144" height="5" fill="#e88a6a"/>`
    for (let w = 0; w < 4; w++) cars += `<rect x="${k * 150 + 12 + w * 32}" y="-38" width="22" height="14" rx="2" fill="#ffe2a0"/>`
  }
  const train = `<g transform="translate(0 ${RAIL})"><g style="animation:train 22s steps(220,end) -6s infinite">${cars}</g></g>`

  // Field and grass, swaying in two groups.
  const grass = ['', '']
  for (let x = 0; x < W; x += 9) {
    const h = 20 + rnd() * 40
    grass[Math.floor(x / 9) % 2] += `M${x} ${H}L${f(x + 3)} ${f(GROUND + 60 - h)}L${x + 6} ${H}Z`
  }
  const field = `<rect y="${GROUND}" width="${W}" height="${H - GROUND}" fill="#231f3d"/>` +
    `<path d="M0 ${RAIL}H${W}" stroke="#3b3658" stroke-width="5"/>` +
    grass.map((d, i) => `<g transform="translate(0 0)"><path d="${d}" fill="#1a1830" style="animation:grass${i} 3.2s steps(16,end) infinite"/></g>`).join('')
  const grassCss = [0, 1].map((i) => `@keyframes grass${i}{0%,100%{transform:skewX(${i ? 2 : -2}deg)}50%{transform:skewX(${i ? -2 : 2}deg)}}`).join('')

  return svgDoc({
    defs,
    css:
      grassCss +
      `@keyframes drift{0%,100%{transform:translateX(0)}50%{transform:translateX(-40px)}}` +
      `@keyframes tw{0%{opacity:1}50%{opacity:.25}}` +
      `@keyframes fly{from{transform:translateX(-60px)}to{transform:translateX(${W + 480}px)}}` +
      `@keyframes hop{0%{transform:translateY(0)}90%{transform:translateY(-4px)}95%{transform:translateY(0)}}` +
      `@keyframes bell{0%{opacity:1}50%{opacity:.15}}` +
      `@keyframes train{from{transform:translateX(${W + 60}px)}to{transform:translateX(-520px)}}`,
    body:
      `<rect width="${W}" height="${H}" fill="url(#sky)"/>` + starGroups +
      `<circle cx="760" cy="${GROUND - 120}" r="420" fill="url(#sunGlow)"/>` +
      clouds + plane + wires + pole(P1, 680) + pole(P2, 680) + birds + train + field + crossing,
  })
}
