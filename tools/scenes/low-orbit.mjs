// Night over Earth from low orbit: city lights turning slowly below, faint clouds with the odd
// flash of lightning, an aurora shimmering along the edge, the sun about to rise over the curve, a
// space station gliding past, a satellite blinking by, a meteor burning up now and then, and the
// moon among the stars. Every change lands on the shared 0.1 s tick.
import { H, W, f, rng, svgDoc } from './_lib.mjs'

const EX = 800, EY = 2050, ER = 1400 // the Earth: a huge circle with its top at y 650
const limb = (x) => EY - Math.sqrt(ER * ER - (x - EX) * (x - EX))

export default function scene() {
  const rnd = rng(0x0b17)
  let defs =
    `<radialGradient id="space" cx=".3" cy=".2" r="1"><stop offset="0" stop-color="#0a0d24"/><stop offset="1" stop-color="#03040c"/></radialGradient>` +
    `<radialGradient id="milky"><stop offset="0" stop-color="#6a5aa8" stop-opacity=".22"/><stop offset=".6" stop-color="#3a4a8a" stop-opacity=".08"/><stop offset="1" stop-color="#3a4a8a" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="earth" cx=".5" cy=".05" r=".6"><stop offset="0" stop-color="#0e1c44"/><stop offset=".5" stop-color="#091532"/><stop offset="1" stop-color="#050b1e"/></radialGradient>` +
    `<radialGradient id="dawnside" cx="1470" cy="830" r="760" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#7ab4ff" stop-opacity=".55"/><stop offset=".35" stop-color="#3a6ab8" stop-opacity=".25"/><stop offset="1" stop-color="#3a6ab8" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="rim" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4aa8ff" stop-opacity=".35"/><stop offset=".6" stop-color="#6ab8ff" stop-opacity=".7"/><stop offset=".85" stop-color="#ffd0a0"/><stop offset="1" stop-color="#ffb070"/></linearGradient>` +
    `<radialGradient id="sun"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset=".12" stop-color="#fff2d0" stop-opacity=".7"/><stop offset=".4" stop-color="#ffb070" stop-opacity=".18"/><stop offset="1" stop-color="#ffb070" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="city"><stop offset="0" stop-color="#ffc870" stop-opacity=".5"/><stop offset="1" stop-color="#ffc870" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="flash"><stop offset="0" stop-color="#e8f0ff" stop-opacity=".8"/><stop offset="1" stop-color="#e8f0ff" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="aurora" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#5affb0" stop-opacity=".6"/><stop offset=".5" stop-color="#3ae0a0" stop-opacity=".22"/><stop offset="1" stop-color="#8a6aff" stop-opacity="0"/></linearGradient>` +
    `<clipPath id="globe"><circle cx="${EX}" cy="${EY}" r="${ER}"/></clipPath>` +
    `<pattern id="cells" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#1c2c5a"/><path d="M0 0H10V10" fill="none" stroke="#4a6aa8" stroke-width="1"/></pattern>`

  // Space: the Milky Way's haze, stars (three groups twinkle), and the moon.
  let body = `<rect width="${W}" height="${H}" fill="url(#space)"/>`
  body += `<ellipse cx="620" cy="300" rx="900" ry="170" transform="rotate(-24 620 300)" fill="url(#milky)"/>`
  let dust = ''
  for (let i = 0; i < 160; i++) {
    const t = rnd() * 2 - 1, s = (rnd() - 0.5) * 220, a = (-24 * Math.PI) / 180
    const x = 620 + t * 880 * Math.cos(a) - s * Math.sin(a), y = 300 + t * 880 * Math.sin(a) + s * Math.cos(a)
    if (y < limb(x) - 20) dust += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(0.5 + rnd() * 0.7)}"/>`
  }
  body += `<g fill="#c8c8ff" fill-opacity=".45">${dust}</g>`
  let stars = ''
  const twinkle = ['', '', '']
  for (let i = 0; i < 150; i++) {
    const x = rnd() * W, y = rnd() * 900
    if (y > limb(x) - 10) continue
    const c = `<circle cx="${f(x)}" cy="${f(y)}" r="${f(0.6 + rnd() * 1.3)}"/>`
    if (i % 6 === 0) twinkle[i % 3] += c
    else stars += c
  }
  body += `<g fill="#e8ecff" fill-opacity=".8">${stars}</g>`
  body += twinkle.map((g, k) => `<g fill="#ffffff" style="animation:tw 2.4s steps(1,end) -${f(k * 0.8)}s infinite">${g}</g>`).join('')
  body += `<g transform="translate(1480 110)"><circle r="36" fill="#cfd2e0"/><circle cx="8" cy="-6" r="30" fill="#e6e8f2"/><circle cx="-10" cy="8" r="7" fill="#b8bccc"/><circle cx="12" cy="12" r="4" fill="#c4c8d6"/><circle cx="4" cy="-14" r="5" fill="#d0d4e2"/><circle cx="14" cy="10" r="36" fill="#03040c" fill-opacity=".55"/></g>`

  // The Earth: night side, the dawn side brightening toward the sun, and turning city lights and
  // clouds (two copies side by side, so the slow drift loops).
  body += `<circle cx="${EX}" cy="${EY}" r="${ER}" fill="url(#earth)"/>`
  let lights = '', clouds = '', flashes = ''
  for (let tile = 0; tile < 2; tile++) {
    const r2 = rng(0xea27)
    for (let i = 0; i < 46; i++) {
      const cx = tile * W + r2() * W, cy = 690 + r2() * 320, n = 3 + Math.floor(r2() * 9), spread = 6 + r2() * 22
      lights += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(spread * 1.8)}" fill="url(#city)"/>`
      for (let k = 0; k < n; k++) lights += `<circle cx="${f(cx + (r2() - 0.5) * spread * 2)}" cy="${f(cy + (r2() - 0.5) * spread * 0.8)}" r="${f(0.8 + r2() * 1.4)}"/>`
    }
    for (let i = 0; i < 9; i++) clouds += `<ellipse cx="${f(tile * W + r2() * W)}" cy="${f(700 + r2() * 300)}" rx="${f(90 + r2() * 160)}" ry="${f(10 + r2() * 16)}"/>`
  }
  for (const [i, [x, y]] of [[420, 820], [1180, 760], [640, 930]].entries()) {
    flashes += `<circle cx="${x}" cy="${y}" r="46" fill="url(#flash)" style="animation:bolt ${[7.3, 11.1, 13.7][i]}s steps(1,end) -${[2, 5, 9][i]}s infinite"/>`
  }
  body += `<g clip-path="url(#globe)"><g style="animation:spin 400s steps(400,end) infinite">` +
    `<g fill="#9fb4d8" fill-opacity=".07">${clouds}</g><g fill="#ffd28a">${lights}</g></g>${flashes}` +
    `<rect x="0" y="640" width="${W}" height="${H - 640}" fill="url(#dawnside)"/></g>`

  // The atmosphere's rim, brightest where the sun is coming up, and the aurora along the left.
  body += `<circle cx="${EX}" cy="${EY}" r="${ER + 10}" fill="none" stroke="#3a8aff" stroke-opacity=".12" stroke-width="28"/>`
  body += `<circle cx="${EX}" cy="${EY}" r="${ER + 2}" fill="none" stroke="url(#rim)" stroke-width="5"/>`
  // Curtains of light: thin rays rising from the limb, tallest mid-arc, in three shimmer frames.
  const curtain = (k) => {
    let rays = ''
    for (let x = 80; x <= 660; x += 7) {
      const env = Math.sin((Math.PI * (x - 80)) / 580), h = env * (70 + 30 * Math.sin(x / 52 + 1.3) + 14 * Math.sin(x / 11 + k * 1.7))
      if (h < 8) continue
      rays += `<rect x="${x}" y="${f(limb(x) - 6 - h)}" width="7" height="${f(h)}" fill-opacity="${f(0.35 + 0.5 * Math.abs(Math.sin(x / 23 + k)))}"/>`
    }
    return rays
  }
  body += [0, 1, 2].map((k) => `<g fill="url(#aurora)" style="animation:f3 1.2s steps(1,end) -${f(k * 0.4)}s infinite">${curtain(k)}</g>`).join('')

  // The sun, just below the curve on the right: glow, a lens streak, and faint flares.
  body += `<g style="animation:breathe 5s steps(1,end) infinite"><circle cx="1470" cy="826" r="420" fill="url(#sun)"/>` +
    `<ellipse cx="1470" cy="822" rx="420" ry="2" fill="#fff6e0" fill-opacity=".45"/></g>`

  // A meteor burning up in the atmosphere now and then.
  body += `<path d="M0 0L-70 -26" stroke="#fff2d0" stroke-width="2.5" stroke-linecap="round" transform="translate(330 858)" style="animation:meteor 9s steps(1,end) -4s infinite"/>`

  // The space station: modules on a truss with four solar wings, gliding across the top.
  const wing = (x, y) => `<rect x="${x}" y="${y}" width="30" height="110" fill="url(#cells)" stroke="#6a8ac8" stroke-width="1.5"/>`
  const station =
    `<rect x="-160" y="-4" width="320" height="8" fill="#8a92a6"/>` +
    Array.from({ length: 16 }, (_, i) => `<path d="M${-160 + i * 20} -4l20 8" stroke="#5a6278" stroke-width="1.5"/>`).join('') +
    wing(-150, -122) + wing(-150, 12) + wing(120, -122) + wing(120, 12) +
    `<rect x="-112" y="-16" width="30" height="32" fill="#e8ecf4"/><rect x="82" y="-16" width="30" height="32" fill="#e8ecf4"/>` +
    `<rect x="-70" y="-13" width="140" height="26" rx="10" fill="#d8dce6"/><rect x="-70" y="-13" width="140" height="6" rx="3" fill="#f4f6fa"/>` +
    `<rect x="-16" y="-38" width="32" height="76" rx="8" fill="#c8ccd8"/><rect x="-16" y="-38" width="32" height="8" rx="4" fill="#e8ecf4"/>` +
    [-40, 0, 40].map((x) => `<rect x="${x - 1}" y="-13" width="2" height="26" fill="#a8aec0"/>`).join('') +
    `<rect x="30" y="-30" width="22" height="16" fill="#f4f6fa" stroke="#a8aec0"/><circle cx="-160" cy="0" r="4" fill="#ff5a5f" style="animation:blink 1.6s steps(1,end) infinite"/>` +
    `<circle cx="160" cy="0" r="4" fill="#5fe08a" style="animation:blink 1.6s steps(1,end) -0.8s infinite"/>`
  body += `<g style="animation:glide 220s steps(440,end) -164s infinite"><g transform="translate(0 250) rotate(-14) scale(.5)">${station}</g></g>`

  // A satellite blinking as it crosses.
  body += `<g style="animation:cross 70s steps(140,end) -20s infinite"><rect x="-6" y="-2" width="12" height="4" fill="#8a92a6"/><rect x="-18" y="-1" width="10" height="2" fill="#4a6aa8"/><rect x="8" y="-1" width="10" height="2" fill="#4a6aa8"/><circle r="2.5" fill="#ffffff" style="animation:blink 2s steps(1,end) infinite"/></g>`

  const css =
    `@keyframes tw{0%{opacity:1}50%{opacity:.25}}@keyframes f3{0%{opacity:1}33.333%{opacity:0}}` +
    `@keyframes blink{0%{opacity:1}20%{opacity:0}}@keyframes breathe{0%{opacity:.88}50%{opacity:1}}` +
    `@keyframes spin{0%{transform:translate(0,0)}100%{transform:translate(-${W}px,0)}}` +
    `@keyframes bolt{0%{opacity:0}97.26%{opacity:0}97.27%{opacity:1}98.63%{opacity:0}}` +
    `@keyframes glide{0%{transform:translate(-320px,0)}100%{transform:translate(1920px,-60px)}}` +
    `@keyframes cross{0%{transform:translate(1700px,80px)}100%{transform:translate(-100px,420px)}}` +
    `@keyframes meteor{0%{opacity:0;transform:translate(330px,858px)}90%{opacity:0;transform:translate(330px,858px)}91.111%{opacity:1;transform:translate(330px,858px);animation-timing-function:steps(4,end)}95.556%{opacity:1;transform:translate(170px,800px);animation-timing-function:steps(1,end)}96.667%{opacity:0;transform:translate(170px,800px)}100%{opacity:0;transform:translate(170px,800px)}}`

  return svgDoc({ defs, css, body })
}
