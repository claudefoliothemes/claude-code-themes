// A cozy room at night: a fire crackling in a stone hearth, embers drifting up, candles on the
// mantel, snow falling past the window, and a cat asleep by the fire. Flames switch between
// drawn frames and everything else steps on the shared 0.1 s tick.
import { H, TICK, W, f, onTick, rng, svgDoc } from './_lib.mjs'

const FLOOR = 880

export default function scene() {
  const rnd = rng(0xf12e51)
  const defs =
    `<linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14121d"/><stop offset="1" stop-color="#1f1d2e"/></linearGradient>` +
    `<linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#151a2c"/><stop offset="1" stop-color="#26304a"/></linearGradient>` +
    `<radialGradient id="glow"><stop offset="0" stop-color="#f6c177" stop-opacity=".42"/><stop offset=".5" stop-color="#eb6f92" stop-opacity=".1"/><stop offset="1" stop-color="#eb6f92" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="candle"><stop offset="0" stop-color="#f6c177" stop-opacity=".45"/><stop offset="1" stop-color="#f6c177" stop-opacity="0"/></radialGradient>` +
    `<clipPath id="pane"><rect x="150" y="150" width="300" height="360"/></clipPath>`

  // Window: night sky, moon, pines, and snow sliding down a tile that repeats every 360 px.
  let flakes = ''
  for (let i = 0; i < 70; i++) {
    const x = f(150 + rnd() * 300), y = f(150 + rnd() * 360), r = f(1.2 + rnd() * 2)
    flakes += `<circle cx="${x}" cy="${y}" r="${r}"/><circle cx="${x}" cy="${f(y - 360)}" r="${r}"/>`
  }
  const pine = (x, base, h) => `M${x} ${base - h}L${x + h * 0.3} ${base}H${x - h * 0.3}Z`
  const window_ =
    `<g clip-path="url(#pane)"><rect x="150" y="150" width="300" height="360" fill="url(#night)"/>` +
    `<circle cx="380" cy="215" r="26" fill="#e0def4" fill-opacity=".85"/>` +
    `<path d="${pine(200, 520, 150)}${pine(260, 520, 110)}${pine(330, 520, 170)}${pine(410, 520, 120)}" fill="#0f1322"/>` +
    `<path d="M150 470Q300 440 450 470V510H150Z" fill="#c9cde0" fill-opacity=".55"/>` +
    `<g fill="#f2f2fa" fill-opacity=".8" style="animation:snow 9s steps(90,end) infinite">${flakes}</g></g>` +
    `<path d="M140 140H460V520H140ZM150 150V510H450V150Z" fill="#2a2638" fill-rule="evenodd"/>` +
    `<rect x="295" y="150" width="10" height="360" fill="#2a2638"/><rect x="150" y="326" width="300" height="10" fill="#2a2638"/>` +
    `<rect x="120" y="520" width="360" height="16" fill="#2f2a40"/>`

  // Hearth: stone surround, firebox, logs, and the fire.
  const HX = 1320 // hearth center
  let stones = ''
  for (let y = 520; y < FLOOR; y += 46) {
    for (let x = HX - 210 + ((y / 46) % 2) * 30; x < HX + 210; x += 60) {
      stones += `<rect x="${f(x + 2)}" y="${y + 2}" width="56" height="42" rx="6" fill="#2a2638" fill-opacity="${f(0.75 + rnd() * 0.25)}"/>`
    }
  }
  const hearth =
    `<rect x="${HX - 214}" y="516" width="428" height="${FLOOR - 516}" fill="#211e2f"/>` + stones +
    `<path d="M${HX - 120} ${FLOOR}V690Q${HX - 120} 620 ${HX} 620Q${HX + 120} 620 ${HX + 120} 690V${FLOOR}Z" fill="#0c0b12"/>` +
    `<rect x="${HX - 250}" y="496" width="500" height="26" rx="4" fill="#3a2f3f"/>`
  const logs =
    `<g transform="translate(${HX} ${FLOOR - 20})"><rect x="-90" y="-18" width="180" height="26" rx="13" fill="#3b2a2c" transform="rotate(-6)"/>` +
    `<rect x="-86" y="-16" width="172" height="24" rx="12" fill="#45302f" transform="rotate(7)"/></g>`

  // Each flame tongue cycles through three drawn shapes; tongues use different periods so the
  // fire never repeats in lockstep. Periods are multiples of 0.3 s, so each frame lasts a whole
  // number of ticks.
  const tongue = (x, h, w, color, period, seed) => {
    const r = rng(seed)
    let out = ''
    for (let k = 0; k < 3; k++) {
      const hh = h * (0.8 + r() * 0.35), lean = (r() - 0.5) * w * 0.8
      const d = `M${f(x - w)} ${FLOOR - 24}C${f(x - w)} ${f(FLOOR - 24 - hh * 0.5)} ${f(x + lean - w * 0.2)} ${f(FLOOR - 24 - hh * 0.75)} ${f(x + lean)} ${f(FLOOR - 24 - hh)}` +
        `C${f(x + lean + w * 0.25)} ${f(FLOOR - 24 - hh * 0.7)} ${f(x + w)} ${f(FLOOR - 24 - hh * 0.45)} ${f(x + w)} ${FLOOR - 24}Z`
      out += `<path d="${d}" fill="${color}" style="animation:frame ${period}s steps(1,end) -${f((period / 3) * k)}s infinite"/>`
    }
    return out
  }
  const fire =
    tongue(HX - 50, 120, 34, '#eb6f92', 0.9, 1) + tongue(HX + 45, 130, 36, '#eb6f92', 0.6, 2) +
    tongue(HX - 10, 175, 46, '#f6a96b', 0.6, 3) + tongue(HX + 20, 120, 30, '#f6c177', 0.9, 4) +
    tongue(HX - 30, 95, 26, '#f6c177', 0.3, 5) + tongue(HX + 5, 70, 20, '#fde7c4', 0.6, 6)

  // Embers float up out of the firebox and fade.
  let embers = ''
  for (let i = 0; i < 16; i++) {
    const dur = onTick(2.4 + rnd() * 2.2), drift = i % 4
    embers += `<g transform="translate(${f(HX - 60 + rnd() * 120)} ${FLOOR - 120})"><circle r="${f(1.6 + rnd() * 1.6)}" fill="#f6c177" style="animation:ember${drift} ${dur}s steps(${Math.round(dur / TICK)},end) -${onTick(rnd() * dur)}s infinite"/></g>`
  }

  // Candles on the mantel, each flame flickering between two shapes.
  const candle = (x, h) =>
    `<circle cx="${x}" cy="${496 - h - 14}" r="44" fill="url(#candle)"/>` +
    `<rect x="${x - 9}" y="${496 - h}" width="18" height="${h}" rx="3" fill="#e0def4" fill-opacity=".85"/>` +
    `<path d="M${x} ${496 - h - 26}Q${x + 7} ${496 - h - 12} ${x} ${496 - h - 3}Q${x - 7} ${496 - h - 12} ${x} ${496 - h - 26}Z" fill="#f6c177" style="animation:half 0.6s steps(1,end) infinite"/>` +
    `<path d="M${x + 2} ${496 - h - 22}Q${x + 7} ${496 - h - 11} ${x} ${496 - h - 3}Q${x - 6} ${496 - h - 12} ${x + 2} ${496 - h - 22}Z" fill="#f6c177" style="animation:half 0.6s steps(1,end) -0.3s infinite"/>`
  const mantel = candle(HX - 170, 56) + candle(HX - 130, 40) + candle(HX + 180, 48)

  // A cat curled up on the rug, tail flicking now and then.
  const cat =
    `<g transform="translate(1000 ${FLOOR - 2})" fill="#0f0d16">` +
    `<ellipse cx="0" cy="-30" rx="74" ry="34"/>` +
    `<circle cx="58" cy="-40" r="26"/>` +
    `<path d="M44 -58L50 -82L64 -62Z M66 -62L80 -80L82 -56Z"/>` +
    `<path d="M-70 -14Q-100 -10 -92 12Q-40 14 30 4" fill="none" stroke="#0f0d16" stroke-width="12" stroke-linecap="round" style="animation:tailDown 6s steps(1,end) infinite"/>` +
    `<path d="M-70 -14Q-110 -36 -96 -60" fill="none" stroke="#0f0d16" stroke-width="12" stroke-linecap="round" style="animation:tail 6s steps(1,end) infinite"/></g>`

  let planks = ''
  for (let x = 0; x < W; x += 160) planks += `M${x} ${FLOOR}V${H}`

  return svgDoc({
    defs,
    css:
      `@keyframes snow{to{transform:translateY(360px)}}` +
      `@keyframes frame{0%{opacity:1}33.333%{opacity:0}}` +
      `@keyframes tail{0%{opacity:0}66.667%{opacity:1}83.333%{opacity:0}}` +
      [-36, -12, 14, 38].map((dx, k) => `@keyframes ember${k}{from{transform:translate(0,0);opacity:1}to{transform:translate(${dx}px,-340px);opacity:0}}`).join('') +
      `@keyframes half{0%{opacity:1}50%{opacity:0}}@keyframes tailDown{0%{opacity:1}66.667%{opacity:0}83.333%{opacity:1}}` +
      `@keyframes flicker{0%{opacity:.85}30%{opacity:1}50%{opacity:.9}80%{opacity:1}}`,
    body:
      `<rect width="${W}" height="${H}" fill="url(#wall)"/>` +
      `<circle cx="${HX}" cy="760" r="640" fill="url(#glow)" style="animation:flicker 1s steps(1,end) infinite"/>` +
      window_ + hearth + logs + fire + embers + mantel +
      `<rect y="${FLOOR}" width="${W}" height="${H - FLOOR}" fill="#14121c"/>` +
      `<path d="${planks}" stroke="#1f1c2b" stroke-width="3"/>` +
      `<ellipse cx="1000" cy="${FLOOR + 6}" rx="230" ry="26" fill="#eb6f92" fill-opacity=".14"/>` +
      cat,
  })
}
