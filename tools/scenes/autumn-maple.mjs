// An autumn night at a shrine: a vermilion torii gate under a full moon, a maple branch with red
// and orange leaves, leaves tumbling down, and a stone lantern glowing. Leaves fall on 0.1 s
// steps; all changes share the tick.
import { H, TICK, W, f, onTick, rng, svgDoc } from './_lib.mjs'

const GROUND = 840
// A five-pointed maple leaf around (0, 0), about 20 units across.
const LEAF = 'M0 -10L2 -4L7 -6L5 -1L10 1L5 3L6 7L1 4L0 10L-1 4L-6 7L-5 3L-10 1L-5 -1L-7 -6L-2 -4Z'
const REDS = ['#d9472b', '#f08a3c', '#e8b14a', '#c2362a']

export default function scene() {
  const rnd = rng(0xa07a1)
  const defs =
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b0916"/><stop offset=".7" stop-color="#1e1428"/><stop offset="1" stop-color="#2c1a2a"/></linearGradient>` +
    `<radialGradient id="moonHalo"><stop offset="0" stop-color="#f6e7c8" stop-opacity=".35"/><stop offset="1" stop-color="#f6e7c8" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="lampGlow"><stop offset="0" stop-color="#ffc56b" stop-opacity=".55"/><stop offset="1" stop-color="#ffc56b" stop-opacity="0"/></radialGradient>`

  // Torii gate on the right, on a low rise.
  const TX = 1300
  const torii =
    `<g transform="translate(${TX} ${GROUND})" fill="#b8382c">` +
    `<rect x="-150" y="-330" width="26" height="330"/><rect x="124" y="-330" width="26" height="330"/>` +
    `<rect x="-190" y="-286" width="380" height="20"/>` +
    `<path d="M-230 -350Q0 -372 230 -350L222 -326Q0 -344 -222 -326Z" fill="#2a1416"/>` +
    `<path d="M-214 -330Q0 -348 214 -330V-316Q0 -332 -214 -316Z"/>` +
    `<rect x="-14" y="-316" width="28" height="30" fill="#2a1416"/>` +
    `<rect x="-160" y="-12" width="46" height="12" fill="#2a1416"/><rect x="114" y="-12" width="46" height="12" fill="#2a1416"/></g>`

  // Stone lantern on the left, its light flickering.
  const LX = 230
  const lantern =
    `<g transform="translate(${LX} ${GROUND})">` +
    `<circle cy="-150" r="150" fill="url(#lampGlow)" style="animation:flicker 1.2s steps(1,end) infinite"/>` +
    `<rect x="-44" y="-20" width="88" height="20" fill="#4a4250"/><rect x="-14" y="-110" width="28" height="90" fill="#57505e"/>` +
    `<rect x="-40" y="-124" width="80" height="16" fill="#4a4250"/><rect x="-30" y="-176" width="60" height="52" fill="#57505e"/>` +
    `<rect x="-16" y="-166" width="32" height="32" fill="#ffc56b" style="animation:flicker 1.2s steps(1,end) -0.6s infinite"/>` +
    `<path d="M-56 -176L0 -214L56 -176Z" fill="#4a4250"/><circle cy="-222" r="8" fill="#4a4250"/></g>`

  // Maple branch along the top left, thick with leaves.
  const branch =
    `<g fill="none" stroke="#2a1a1c" stroke-linecap="round">` +
    `<path d="M-20 120C140 100 260 50 420 60S620 30 760 80" stroke-width="15"/>` +
    `<path d="M240 70C280 140 300 180 330 220" stroke-width="7"/><path d="M500 50C540 10 580 -6 620 -16" stroke-width="6"/></g>`
  const ALONG = [[40, 115], [120, 108], [190, 90], [250, 74], [320, 62], [400, 60], [470, 54], [560, 44], [650, 52], [730, 76], [330, 215], [300, 170], [600, 4]]
  let crown = ''
  for (const [x, y] of ALONG) {
    for (let i = 0; i < 6; i++) {
      crown += `<path transform="translate(${f(x + rnd() * 50 - 25)} ${f(y + rnd() * 40 - 20)}) rotate(${f(rnd() * 360)}) scale(${f(1.2 + rnd() * 0.9)})" d="${LEAF}" fill="${REDS[Math.floor(rnd() * 4)]}"/>`
    }
  }

  // Fallen leaves on the ground, and leaves tumbling down: each falls along one of three paths.
  let fallen = ''
  for (let i = 0; i < 40; i++) {
    fallen += `<path transform="translate(${f(rnd() * W)} ${f(GROUND + 10 + rnd() * 140)}) rotate(${f(rnd() * 360)}) scale(${f(0.9 + rnd() * 0.7)})" d="${LEAF}" fill="${REDS[i % 4]}" fill-opacity=".7"/>`
  }
  const PATHS = [[140, 340], [-120, -300], [240, 460]]
  const fallCss = PATHS.map(([dx, r], i) => `@keyframes fall${i}{from{transform:translate(0,-40px) rotate(0)}to{transform:translate(${dx}px,${GROUND + 60}px) rotate(${r}deg)}}`).join('')
  let tumbling = ''
  for (let i = 0; i < 36; i++) {
    const x = f(rnd() * W), dur = onTick(8 + rnd() * 6), p = Math.floor(rnd() * PATHS.length)
    tumbling += `<g transform="translate(${x} 0)"><g style="animation:fall${p} ${dur}s steps(${Math.round(dur / TICK)},end) -${onTick(rnd() * dur)}s infinite">` +
      `<path transform="scale(${f(1 + rnd() * 0.8)})" d="${LEAF}" fill="${REDS[i % 4]}"/></g></g>`
  }

  return svgDoc({
    defs,
    css: fallCss + `@keyframes flicker{0%{opacity:.85}25%{opacity:1}50%{opacity:.9}75%{opacity:1}}`,
    body:
      `<rect width="${W}" height="${H}" fill="url(#sky)"/>` +
      `<circle cx="1040" cy="230" r="230" fill="url(#moonHalo)"/><circle cx="1040" cy="230" r="86" fill="#f6e7c8"/>` +
      `<path d="M0 ${H}V${GROUND}Q400 ${GROUND - 40} 800 ${GROUND - 10}T${W} ${GROUND - 30}V${H}Z" fill="#1a1016"/>` +
      torii + lantern + fallen + branch + crown + tumbling,
  })
}
