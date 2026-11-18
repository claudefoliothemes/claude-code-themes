// Santa on a snowy rooftop beside a chimney, waving, with his sack of gifts. Snow falls over a
// sleeping village, string lights blink along the roof, and smoke puffs from the chimney.
// Every change lands on the shared 0.1 s tick.
import { CHRISTMAS_CSS, santa } from './_christmas.mjs'
import { H, TICK, W, f, onTick, rng, svgDoc } from './_lib.mjs'

const ROOF = 772 // top of the rooftop snow

export default function scene() {
  const rnd = rng(0x5a17a)
  const defs =
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#08102a"/><stop offset=".7" stop-color="#16244a"/><stop offset="1" stop-color="#223561"/></linearGradient>` +
    `<radialGradient id="moonHalo"><stop offset="0" stop-color="#f4f1dc" stop-opacity=".35"/><stop offset="1" stop-color="#f4f1dc" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="bulb"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`

  // Stars in three twinkle groups.
  const stars = ['', '', '']
  for (let i = 0; i < 120; i++) {
    stars[i % 3] += `<circle cx="${f(rnd() * W)}" cy="${f(rnd() * 520)}" r="${f(0.7 + rnd() ** 3 * 1.8)}"/>`
  }
  const starGroups = stars.map((g, i) => `<g fill="#f4f1dc" style="animation:tw ${[2.4, 3.2, 4][i]}s steps(1,end) -${i}s infinite">${g}</g>`).join('')

  // Far village: houses with snowy roofs and lit windows.
  let houses = '', snowRoofs = '', windows = ''
  for (let x = -40; x < W; x += 110 + rnd() * 60) {
    const w = 90 + rnd() * 60, top = 610 + rnd() * 70, peak = top - 40 - rnd() * 30
    houses += `M${f(x)} ${H}V${f(top)}L${f(x + w / 2)} ${f(peak)}L${f(x + w)} ${f(top)}V${H}Z`
    snowRoofs += `M${f(x - 4)} ${f(top + 2)}L${f(x + w / 2)} ${f(peak - 4)}L${f(x + w + 4)} ${f(top + 2)}L${f(x + w)} ${f(top + 8)}L${f(x + w / 2)} ${f(peak + 6)}L${f(x)} ${f(top + 8)}Z`
    for (let k = 0; k < 2; k++) if (rnd() < 0.7) windows += `M${f(x + 18 + k * (w - 54))} ${f(top + 26)}h18v22h-18Z`
  }
  const village = `<path d="${houses}" fill="#131d3f"/><path d="${snowRoofs}" fill="#dfe8f6" fill-opacity=".55"/><path d="${windows}" fill="#ffcf7a" fill-opacity=".8"/>`

  // The rooftop, chimney and smoke.
  const roof =
    `<rect x="860" y="${ROOF}" width="${W - 860}" height="${H - ROOF}" fill="#26304e"/>` +
    `<path d="M860 ${ROOF + 18}Q900 ${ROOF - 10} 960 ${ROOF}T1080 ${ROOF}T1220 ${ROOF - 4}T1380 ${ROOF}T1600 ${ROOF - 6}V${ROOF + 22}H860Z" fill="#eef3fb"/>`
  let bricks = ''
  for (let y = 612; y < ROOF; y += 18) for (let x = 1062 + ((y / 18) % 2) * 14; x < 1170; x += 28) bricks += `M${x} ${y}h24v14h-24Z`
  const chimney =
    `<rect x="1060" y="606" width="112" height="${ROOF - 600}" fill="#8e3b34"/><path d="${bricks}" fill="#a3473f"/>` +
    `<rect x="1050" y="590" width="132" height="22" rx="4" fill="#6f2c27"/><path d="M1046 594Q1080 572 1116 584T1186 590V598H1046Z" fill="#eef3fb"/>`
  let smoke = ''
  for (let i = 0; i < 4; i++) {
    smoke += `<circle cx="${1100 + i * 12}" cy="570" r="${14 + i * 3}" fill="#c9d2e4" style="animation:smoke 3.2s steps(32,end) -${f(i * 0.8)}s infinite"/>`
  }

  // String lights hanging in swags along the roof edge, blinking in two groups.
  const COLORS = ['#ff4d4d', '#ffd24d', '#4de08a', '#5aa9ff']
  let wire = `M860 ${ROOF + 26}`
  const bulbs = ['', '']
  let n = 0
  for (let x = 860; x < W; x += 80) {
    wire += `Q${x + 40} ${ROOF + 50} ${x + 80} ${ROOF + 26}`
    for (const t of [0.3, 0.7]) {
      const bx = x + 80 * t, by = ROOF + 26 + 24 * 2 * t * (1 - t)
      bulbs[n % 2] += `<circle cx="${f(bx)}" cy="${f(by + 5)}" r="16" fill="url(#bulb)"/><ellipse cx="${f(bx)}" cy="${f(by + 6)}" rx="5" ry="7" fill="${COLORS[n % 4]}"/>`
      n++
    }
  }
  const lights = `<path d="${wire}" fill="none" stroke="#0e1428" stroke-width="2.5"/>` +
    bulbs.map((g, i) => `<g style="animation:tw 1.6s steps(1,end) -${f(i * 0.8)}s infinite">${g}</g>`).join('')

  // The sack, gifts peeking out.
  const sack =
    `<g transform="translate(1470 ${ROOF + 2})">` +
    `<rect x="-30" y="-122" width="30" height="28" fill="#3ccf7e"/><rect x="-18" y="-122" width="6" height="28" fill="#ffd24d"/>` +
    `<rect x="4" y="-130" width="26" height="34" fill="#5aa9ff"/><rect x="4" y="-116" width="26" height="6" fill="#fff"/>` +
    `<path d="M-52 0Q-70 -60 -36 -100H40Q72 -60 54 0Z" fill="#7b3f2a"/><path d="M-36 -100Q2 -88 40 -100" fill="none" stroke="#5a2c1d" stroke-width="5"/></g>`

  // Falling snow: one tile that repeats every full height.
  let flakes = ''
  for (let i = 0; i < 130; i++) {
    const x = f(rnd() * W), y = f(rnd() * H), r = f(1.4 + rnd() * 2.4)
    flakes += `<circle cx="${x}" cy="${y}" r="${r}"/><circle cx="${x}" cy="${f(y - H)}" r="${r}"/>`
  }
  const SNOW = 12
  const snow = `<g fill="#f4f7ff" fill-opacity=".85" style="animation:snow ${SNOW}s steps(${Math.round(SNOW / TICK)},end) infinite">${flakes}</g>`

  return svgDoc({
    defs,
    css:
      CHRISTMAS_CSS +
      `@keyframes tw{0%{opacity:1}50%{opacity:.25}}` +
      `@keyframes smoke{from{transform:translate(0,0);opacity:.55}to{transform:translate(40px,-150px);opacity:0}}` +
      `@keyframes snow{to{transform:translateY(${H}px)}}`,
    body:
      `<rect width="${W}" height="${H}" fill="url(#sky)"/>` +
      `<circle cx="300" cy="190" r="190" fill="url(#moonHalo)"/><circle cx="300" cy="190" r="66" fill="#f4f1dc"/>` +
      `<circle cx="280" cy="176" r="10" fill="#e4dfc4"/><circle cx="318" cy="208" r="7" fill="#e4dfc4"/>` +
      starGroups + village + smoke + roof + chimney + lights + sack +
      `<g transform="translate(1320 ${ROOF + 4})">${santa({ wave: 1 })}</g>` +
      snow,
  })
}
