// New Year's Eve at midnight: fireworks burst over a city skyline in gold, pink, cyan, green, and
// purple, rockets climbing first, then peonies, a ring, and a drooping gold willow, each mirrored
// in the river below. A clock tower in the middle reads twelve. Stars twinkle, windows glow.
// Vector art. Every change lands on the shared 0.1 s tick: each burst is a run of 0.2 s frames.
import { H, W, f, rng, svgDoc } from './_lib.mjs'

const WL = 760 // waterline
const SLOT = 0.2

export default function scene() {
  const rnd = rng(0x2027)
  const defs =
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#04050c"/><stop offset=".6" stop-color="#0c0e26"/><stop offset="1" stop-color="#1e1640"/></linearGradient>` +
    `<linearGradient id="river" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0e0c24"/><stop offset="1" stop-color="#04040a"/></linearGradient>` +
    `<radialGradient id="glow" cx=".5" cy="1" r=".7"><stop offset="0" stop-color="#ff9a6a" stop-opacity=".22"/><stop offset="1" stop-color="#ff9a6a" stop-opacity="0"/></radialGradient>`

  let body = `<rect width="${W}" height="${WL}" fill="url(#sky)"/><rect y="${WL - 360}" width="${W}" height="360" fill="url(#glow)"/>`
  let stars = ''
  for (let i = 0; i < 80; i++) stars += `<circle cx="${f(rnd() * W)}" cy="${f(rnd() * 420)}" r="${f(0.6 + rnd() * 1.1)}"/>`
  body += `<g fill="#e8e8ff" fill-opacity=".6">${stars}</g>`
  body += [0, 1].map((k) => `<g fill="#ffffff" style="animation:f2 2s steps(1,end) -${k}s infinite">` + Array.from({ length: 7 }, (_, i) => `<circle cx="${(i * 233 + k * 157) % W}" cy="${(i * 61 + k * 83) % 400}" r="1.6"/>`).join('') + `</g>`).join('')

  // River.
  body += `<rect y="${WL}" width="${W}" height="${H - WL}" fill="url(#river)"/>`

  // Firework styles, drawn once around (0, 0): [main color, tip color, style, particles, size].
  const TYPES = [
    ['#ff5a8a', '#ffd166', 'peony', 26, 1.05], ['#ffd166', '#ffffff', 'peony', 32, 1.35], ['#5ad8ff', '#d8b8ff', 'peony', 26, 1.1],
    ['#ffc25a', '#fff0c0', 'willow', 22, 1.15], ['#6ae89a', '#e8fff0', 'ring', 28, 1.0], ['#ff4a5a', '#ffffff', 'peony', 22, 0.9], ['#b88aff', '#ffffff', 'peony', 22, 0.9],
  ]
  // Each launch: [x, y, style, frames per cycle, start slot]. Cycles of 0.2 s slots.
  const LAUNCHES = [[300, 320, 0, 20, 0], [800, 300, 1, 24, 7], [1290, 330, 2, 28, 13], [560, 410, 3, 30, 18], [1060, 390, 4, 20, 10], [1450, 270, 5, 24, 3],
    [170, 440, 6, 26, 9], [990, 250, 3, 22, 15], [1500, 450, 2, 28, 21], [660, 240, 5, 26, 20], [1180, 230, 0, 30, 25]]
  const RAD = [0, 0, 0, 44, 92, 128, 148, 158, 164]
  const DROOP = [0, 0, 0, 0, 4, 12, 26, 46, 72]
  const FADE = [1, 1, 1, 1, 1, 1, 0.85, 0.6, 0.35]
  const RK = 0.3 // reflection squash
  let paths = '', fw = '', mirror = ''
  TYPES.forEach(([c1, c2, style, n, size], ti) => {
    paths += `<radialGradient id="g${ti}"><stop offset="0" stop-color="${c1}" stop-opacity=".1"/><stop offset="1" stop-color="${c1}" stop-opacity="0"/></radialGradient>`
    for (let s = 0; s < RAD.length; s++) {
      let trail = '', tips = '', refl = ''
      if (s < 3) { const ry = [230, 130, 40][s]; trail = `M0 ${ry}L0 ${ry + 70}`; tips = `M0 ${ry}l0 0` }
      else {
        const droopK = style === 'willow' ? 2.4 : 1, tl = style === 'willow' ? 90 : style === 'ring' ? 18 : 50
        for (let i = 0; i < n; i++) {
          const ang = (i / n) * Math.PI * 2 + 0.13, r2 = RAD[s] * size, r1 = s === 3 ? 6 : Math.max(0, r2 - tl * size)
          const d2 = DROOP[s] * droopK, d1 = DROOP[Math.max(0, s - 1)] * droopK
          const x1 = Math.round(Math.cos(ang) * r1), y1 = Math.round(Math.sin(ang) * r1 + d1), x2 = Math.round(Math.cos(ang) * r2), y2 = Math.round(Math.sin(ang) * r2 + d2)
          if (s <= 6 || style === 'willow') trail += `M${x1} ${y1}L${x2} ${y2}`
          if (s <= 6 || (i + s) % 2 === 0) tips += `M${x2} ${y2}l0 0`
          if (s >= 4 && s <= 6 && i % 2 === 0) refl += `M${x2} ${Math.round(-y2 * RK)}l0 ${5 + (i % 4) * 3}`
        }
      }
      let g = ''
      if (trail) g += `<path id="t${ti}-${s}" d="${trail}"/><use href="#t${ti}-${s}" stroke="${c1}" stroke-width="${s < 3 ? 7 : 12}" stroke-opacity=".2"/><use href="#t${ti}-${s}" stroke="${s < 3 ? '#fff2c8' : c1}" stroke-width="${s < 3 ? 2.6 : 2.4}"/>`
      g += `<path d="${tips}" stroke="${s >= 7 ? c2 : '#ffffff'}" stroke-width="${s < 3 ? 5 : s >= 7 ? 3.4 : 4.6}"/>`
      if (s >= 3 && s <= 6) g = `<circle cy="${DROOP[s]}" r="${f(RAD[s] * size * 1.2)}" fill="url(#g${ti})"/>` + g
      paths += `<g id="b${ti}-${s}" fill="none" stroke-linecap="round" opacity="${FADE[s]}">${g}</g>`
      if (refl) paths += `<g id="r${ti}-${s}"><path d="${refl}" stroke="${c1}" stroke-width="3" stroke-opacity=".5" stroke-linecap="round" fill="none"/><ellipse rx="${f(RAD[s] * size)}" ry="${f(RAD[s] * size * RK * 0.6)}" fill="url(#g${ti})"/></g>`
    }
  })
  const keyframes = new Set()
  for (const [x, y, ti, slots, start] of LAUNCHES) {
    keyframes.add(slots)
    const period = f(slots * SLOT), ry = f(WL + (WL - y) * RK)
    for (let s = 0; s < RAD.length; s++) {
      const k = (start + s) % slots, anim = `animation:f${slots} ${period}s steps(1,end) -${f(((slots - k) % slots) * SLOT)}s infinite`
      fw += `<use href="#b${ti}-${s}" x="${x}" y="${y}" style="${anim}"/>`
      if (s >= 4 && s <= 6) mirror += `<use href="#r${ti}-${s}" x="${x}" y="${ry}" style="${anim}"/>`
    }
  }
  body += fw

  // Skyline with lit windows, and a clock tower reading midnight.
  let city = '', warm = '', cool = ''
  for (let x = -10; x < W;) {
    const w = 40 + rnd() * 80, h = 70 + rnd() * 170
    if (x > 700 && x < 860) { x += w; continue }
    city += `<rect x="${f(x)}" y="${f(WL - h)}" width="${f(w)}" height="${f(h)}"/>`
    if (rnd() < 0.35) city += `<rect x="${f(x + w / 2 - 2)}" y="${f(WL - h - 30)}" width="4" height="30"/>`
    for (let y = WL - h + 10; y < WL - 8; y += 14) for (let wx = x + 7; wx < x + w - 8; wx += 11) if (rnd() < 0.3) { const r = `<rect x="${f(wx)}" y="${f(y)}" width="5" height="6"/>`; if (rnd() < 0.7) warm += r; else cool += r }
    x += w + 2
  }
  body += `<g fill="#0a0a1a">${city}</g><g fill="#ffd28a" fill-opacity=".75">${warm}</g><g fill="#9ac8ff" fill-opacity=".6">${cool}</g>`
  body += `<path d="M752 ${WL}V470H848V${WL}Z" fill="#0c0c1e"/><path d="M748 470H852L800 380Z" fill="#0c0c1e"/><rect x="798" y="340" width="4" height="40" fill="#0c0c1e"/>`
  body += `<circle cx="800" cy="520" r="34" fill="#fff0c8"/><circle cx="800" cy="520" r="34" fill="none" stroke="#c8a060" stroke-width="4"/>` +
    `<path d="M800 520V492M800 520V498" stroke="#2a2030" stroke-width="5" stroke-linecap="round"/><circle cx="800" cy="520" r="4" fill="#2a2030"/>` +
    [0, 1, 2, 3].map((i) => `<rect x="${[798, 828, 798, 764][i]}" y="${[490, 518, 548, 518][i]}" width="${i % 2 ? 6 : 4}" height="${i % 2 ? 4 : 6}" fill="#2a2030"/>`).join('')
  body += `<g fill="#ffd28a" fill-opacity=".8">${[580, 610, 640].map((y) => `<rect x="772" y="${y}" width="10" height="14"/><rect x="818" y="${y}" width="10" height="14"/>`).join('')}</g>`

  // Reflections in the river: city lights as shimmering streaks, then the fireworks' glow.
  const streaks = [0, 1].map((k) => {
    let d = ''
    for (let i = 0; i < 70; i++) { const x = (i * 97 + k * 31) % W, y = WL + 8 + ((i * 37) % 180), w = 6 + (i % 4) * 6; d += `<rect x="${x}" y="${y}" width="${w}" height="2"/>` }
    return `<g fill="#ffd28a" fill-opacity=".22" style="animation:f2 1.6s steps(1,end) -${f(k * 0.8)}s infinite">${d}</g>`
  }).join('')
  body += streaks + `<rect x="784" y="${WL + 6}" width="32" height="60" fill="#fff0c8" fill-opacity=".08"/>` + mirror
  body += `<rect y="${WL}" width="${W}" height="2" fill="#2a2450"/>`

  const css = `@keyframes f2{0%{opacity:1}50%{opacity:0}}` + [...keyframes].map((n) => `@keyframes f${n}{0%{opacity:1}${(Math.floor((100 / n) * 1000) / 1000)}%{opacity:0}}`).join('')
  return svgDoc({ defs: defs + paths, css, body })
}
