// Santa's sleigh and a team of reindeer flying across a full moon, the lead reindeer's red nose
// glowing, over snowy hills, pines and a sleeping village. The team crosses in 24 s of tick-sized
// steps, rests offscreen for 6 s, and starts again.
import { CHRISTMAS_CSS, NOSE_GLOW, reindeer, santa, sleigh } from './_christmas.mjs'
import { H, TICK, W, f, rng, svgDoc } from './_lib.mjs'

export default function scene() {
  const rnd = rng(0x51e16)
  const defs =
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070c1f"/><stop offset=".65" stop-color="#14204a"/><stop offset="1" stop-color="#26386a"/></linearGradient>` +
    `<radialGradient id="moonHalo"><stop offset="0" stop-color="#f6eecb" stop-opacity=".4"/><stop offset="1" stop-color="#f6eecb" stop-opacity="0"/></radialGradient>` +
    NOSE_GLOW

  // Stars in three twinkle groups.
  const stars = ['', '', '']
  for (let i = 0; i < 140; i++) {
    stars[i % 3] += `<circle cx="${f(rnd() * W)}" cy="${f(rnd() * 600)}" r="${f(0.7 + rnd() ** 3 * 1.8)}"/>`
  }
  const starGroups = stars.map((g, i) => `<g fill="#f6eecb" style="animation:tw ${[2.4, 3.2, 4][i]}s steps(1,end) -${i}s infinite">${g}</g>`).join('')

  // Snowy hills, pines, and a few lit cottages.
  const hill = (y0, amp, fill) => {
    let d = `M0 ${H}V${y0}`
    for (let x = 0; x <= W; x += 200) d += `Q${x + 100} ${f(y0 - amp * (0.5 + rnd()))} ${x + 200} ${f(y0 + (rnd() - 0.5) * 30)}`
    return `<path d="${d}V${H}Z" fill="${fill}"/>`
  }
  let pines = ''
  for (let i = 0; i < 22; i++) {
    const x = f(rnd() * W), base = f(800 + rnd() * 60), h = f(50 + rnd() * 70)
    pines += `M${x} ${f(base - h)}L${f(x + h * 0.32)} ${base}H${f(x - h * 0.32)}Z`
  }
  let cottages = '', lit = ''
  for (const x of [180, 420, 1240, 1460]) {
    cottages += `M${x} 890V850L${x + 30} 826L${x + 60} 850V890Z`
    lit += `M${x + 22} 858h16v16h-16Z`
  }
  const ground =
    hill(760, 60, '#7f90b4') + `<path d="${pines}" fill="#16233f"/>` + hill(860, 50, '#aab8d4') +
    `<path d="${cottages}" fill="#2a2f4a"/><path d="${lit}" fill="#ffcf7a"/>`

  // The team: four reindeer in single file, the lead one with the glowing nose, reins to the
  // sleigh, and Santa waving from his seat.
  const deer = [0, -150, -300, -450].map((x, i) =>
    `<g transform="translate(${x} ${i % 2 ? -10 : 0})">${reindeer({ gallop: 0.4, glow: i === 0 })}</g>`).join('')
  const reins = `<path d="M-560 -40L-450 -14L-300 -4L-150 -14L30 -10" fill="none" stroke="#e8c062" stroke-width="2.5"/>`
  const rider = `<g transform="translate(-640 -10)"><g transform="translate(-10 10) scale(.5)">${santa({ wave: 1 })}</g>${sleigh()}</g>`
  let sparkle = ''
  for (let i = 0; i < 18; i++) sparkle += `<circle cx="${f(-780 - rnd() * 220)}" cy="${f(-20 + rnd() * 60)}" r="${f(1.5 + rnd() * 2)}"/>`
  const trail = `<g fill="#ffe7a3" style="animation:tw 0.6s steps(1,end) infinite">${sparkle}</g>`

  // Flight path: from below the left edge up across the moon and out at the top right.
  const DUR = 30, FLY = 24
  const hold = +((FLY / DUR) * 100).toFixed(3)
  const flightCss =
    `@keyframes fly{0%{transform:translate(-200px,640px);animation-timing-function:steps(${Math.round(FLY / TICK)},end)}` +
    `${hold}%{transform:translate(${W + 1100}px,300px);animation-timing-function:steps(1,end)}100%{transform:translate(${W + 1100}px,300px)}}`
  const team = `<g style="animation:fly ${DUR}s -0.4s infinite"><g transform="scale(1.05)">${trail}${reins}${rider}${deer}</g></g>`

  return svgDoc({
    defs,
    css: CHRISTMAS_CSS + `@keyframes tw{0%{opacity:1}50%{opacity:.25}}` + flightCss,
    body:
      `<rect width="${W}" height="${H}" fill="url(#sky)"/>` +
      starGroups +
      `<circle cx="1060" cy="330" r="360" fill="url(#moonHalo)"/><circle cx="1060" cy="330" r="200" fill="#efe5bd"/>` +
      `<circle cx="1000" cy="280" r="34" fill="#e9dfb6"/><circle cx="1130" cy="400" r="22" fill="#e9dfb6"/><circle cx="1110" cy="250" r="14" fill="#e9dfb6"/>` +
      team + ground,
  })
}
