// A snowy holiday night: strings of colored bulbs blinking across the top, a pine with its own
// lights and a glowing star, and snow falling over soft hills. Bulbs switch on 0.25 s steps and
// snow falls on the 0.1 s tick, so the window repaints at most 10 times a second.
import { H, TICK, W, f, onTick, rng, svgDoc } from './_lib.mjs'

export default function scene() {
  const rnd = rng(0x40e1)
  const BULBS = ['#ff4d4d', '#3ddc84', '#ffcc33', '#4da3ff']

  const defs =
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050c14"/><stop offset=".75" stop-color="#0b1b24"/><stop offset="1" stop-color="#12262e"/></linearGradient>` +
    BULBS.map((c, i) => `<radialGradient id="glow${i}"><stop offset="0" stop-color="${c}" stop-opacity=".7"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`).join('')

  // A strand sags between its ends; bulbs hang along it in three blink groups.
  const strand = (y0, sag, step, phase) => {
    const point = (x) => y0 + sag * (1 - ((x - W / 2) / (W / 2)) ** 2)
    let wire = `M0 ${f(point(0))}`
    for (let x = 40; x <= W; x += 40) wire += `L${x} ${f(point(x))}`
    const groups = ['', '', '']
    let k = 0
    for (let x = phase; x < W; x += step, k++) {
      const y = point(x) + 6, c = (k + Math.floor(phase / 10)) % BULBS.length
      groups[k % 3] += `<circle cx="${f(x)}" cy="${f(y + 9)}" r="22" fill="url(#glow${c})"/><rect x="${f(x - 2)}" y="${f(y - 3)}" width="4" height="5" fill="#2b3238"/><ellipse cx="${f(x)}" cy="${f(y + 8)}" rx="5" ry="8" fill="${BULBS[c]}"/>`
    }
    return `<path d="${wire}" fill="none" stroke="#0e1418" stroke-width="2"/>` +
      groups.map((g, i) => `<g class="bl${i}">${g}</g>`).join('')
  }

  // A layered pine on the right, with its own blinking lights and a star.
  const TX = 1360, TB = 900, TH = 520
  let tree = ''
  for (let i = 0; i < 5; i++) {
    const top = TB - TH + i * TH * 0.17, half = 60 + i * 38
    tree += `M${TX} ${f(top)}L${TX + half} ${f(top + TH * 0.26)}L${TX - half} ${f(top + TH * 0.26)}Z`
  }
  tree += `M${TX - 16} ${TB - 30}h32v60h-32Z`
  const treeLights = ['', '']
  for (let i = 0; i < 26; i++) {
    const t = 0.12 + rnd() * 0.85, y = TB - TH + TH * t, spread = (60 + t * 150) * (rnd() * 1.6 - 0.8)
    treeLights[i % 2] += `<circle cx="${f(TX + spread)}" cy="${f(y)}" r="${f(3 + rnd() * 2)}" fill="${BULBS[i % BULBS.length]}"/>`
  }
  const star = (cx, cy, r) => {
    let d = ''
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI / 5) * i - Math.PI / 2, rr = i % 2 ? r * 0.45 : r
      d += `${i ? 'L' : 'M'}${f(cx + rr * Math.cos(a))} ${f(cy + rr * Math.sin(a))}`
    }
    return d + 'Z'
  }

  // Snow: each flake falls at its own speed on the shared tick, swaying one of two ways.
  const SWAYS = [[30], [-26]]
  const css =
    SWAYS.map(([dx], i) => `@keyframes snow${i}{0%{transform:translate(0,-20px)}50%{transform:translate(${dx}px,${H / 2}px)}100%{transform:translate(0,${H + 20}px)}}`).join('') +
    `.bl0,.bl1,.bl2{animation:bulb 1.5s steps(1,end) infinite}.bl1{animation-delay:-.5s}.bl2{animation-delay:-1s}` +
    `@keyframes bulb{0%{opacity:1}66.67%{opacity:.25}}` +
    `.tl0{animation:twk 1s steps(1,end) infinite}.tl1{animation:twk 1s steps(1,end) -.5s infinite}@keyframes twk{0%{opacity:1}50%{opacity:.25}}` +
    `.st{animation:star 2s steps(1,end) infinite}@keyframes star{0%{opacity:1}50%{opacity:.6}}`
  let snow = ''
  // Two keyframe halves each get their own steps, so a flake takes dur / TICK / 2 per half.
  for (let i = 0; i < 70; i++) {
    const x = f(rnd() * W), dur = onTick(10 + rnd() * 8, 2 * TICK), delay = -onTick(rnd() * dur)
    snow += `<g transform="translate(${x} 0)"><circle r="${f(1.6 + rnd() * 2.4)}" fill="#f4f8ff" fill-opacity="${f(0.55 + rnd() * 0.4)}" style="animation:snow${i % 2} ${dur}s steps(${Math.round(dur / TICK / 2)},end) ${delay}s infinite"/></g>`
  }

  const hills = `M0 ${H}V930C300 880 520 905 800 925S1300 880 1600 915V${H}Z`

  return svgDoc({
    defs,
    css,
    body:
      `<rect width="${W}" height="${H}" fill="url(#sky)"/>` +
      `<path d="${hills}" fill="#dfe8ef"/><path d="M0 ${H}V960C400 935 900 975 1600 950V${H}Z" fill="#c9d6df"/>` +
      `<path d="${tree}" fill="#17472e"/>` +
      `<g class="tl0">${treeLights[0]}</g><g class="tl1">${treeLights[1]}</g>` +
      `<circle cx="${TX}" cy="${TB - TH - 6}" r="34" fill="url(#glow2)" class="st"/><path d="${star(TX, TB - TH - 6, 20)}" fill="#ffd84a"/>` +
      snow +
      strand(18, 70, 64, 20) + strand(-4, 120, 72, 52),
  })
}
