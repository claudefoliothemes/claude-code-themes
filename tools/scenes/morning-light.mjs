// A light theme with a moving scene: a sunlit room in the morning. Sunbeams slant in from the
// window with dust drifting through them, a plant on the sill and a hanging vine sway, tea steams,
// the sheer curtain stirs, and birds cross the sky outside. Kept pale so dark text reads over it.
// Every change lands on the shared 0.1 s tick.
import { H, TICK, W, f, onTick, rng, svgDoc } from './_lib.mjs'

const WX = 1080, WY = 150, WW = 420, WH = 470 // the window
const SILL = WY + WH

export default function scene() {
  const rnd = rng(0x5011)
  const defs =
    `<linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6efe3"/><stop offset="1" stop-color="#ecdfca"/></linearGradient>` +
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe6f5"/><stop offset="1" stop-color="#f1f7fa"/></linearGradient>` +
    `<linearGradient id="beam" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6d8" stop-opacity=".75"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></linearGradient>` +
    `<linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2cfb0"/><stop offset="1" stop-color="#d6c09c"/></linearGradient>` +
    `<clipPath id="pane"><rect x="${WX}" y="${WY}" width="${WW}" height="${WH}"/></clipPath>`

  // Outside: sky, drifting clouds, soft hills, and a few birds.
  let clouds = ''
  for (let i = 0; i < 4; i++) {
    const x = WX + rnd() * WW, y = WY + 40 + rnd() * 160, s = 0.5 + rnd() * 0.5
    for (const dx of [0, WW]) clouds += `<g transform="translate(${f(x + dx)} ${f(y)}) scale(${f(s)})"><ellipse rx="80" ry="22"/><ellipse cx="-30" cy="-12" rx="40" ry="26"/><ellipse cx="26" cy="-18" rx="46" ry="30"/></g>`
  }
  let birds = ''
  for (const [dx, dy] of [[0, 0], [-34, 14], [-60, -10]]) {
    birds += `<g transform="translate(${dx} ${dy})"><path d="M-8 0Q-4 -6 0 0Q4 -6 8 0" fill="none" stroke="#7a8a99" stroke-width="2" style="animation:flap .6s steps(1,end) infinite"/>` +
      `<path d="M-8 -3Q-4 2 0 -2Q4 2 8 -3" fill="none" stroke="#7a8a99" stroke-width="2" style="animation:flap .6s steps(1,end) -.3s infinite"/></g>`
  }
  const outside =
    `<g clip-path="url(#pane)"><rect x="${WX}" y="${WY}" width="${WW}" height="${WH}" fill="url(#sky)"/>` +
    `<g fill="#ffffff" fill-opacity=".9" style="animation:drift 60s steps(600,end) infinite">${clouds}</g>` +
    `<path d="M${WX} ${SILL}V${SILL - 120}Q${WX + 120} ${SILL - 170} ${WX + 240} ${SILL - 130}T${WX + WW} ${SILL - 140}V${SILL}Z" fill="#b9d6a6"/>` +
    `<path d="M${WX} ${SILL}V${SILL - 70}Q${WX + 160} ${SILL - 110} ${WX + 300} ${SILL - 75}T${WX + WW} ${SILL - 80}V${SILL}Z" fill="#9cc48b"/>` +
    `<g transform="translate(${WX} ${WY + 120})"><g style="animation:fly 14s steps(140,end) -4s infinite">${birds}</g></g></g>`
  const frame =
    `<path d="M${WX - 18} ${WY - 18}H${WX + WW + 18}V${SILL + 18}H${WX - 18}ZM${WX} ${WY}V${SILL}H${WX + WW}V${WY}Z" fill="#fbf8f2" fill-rule="evenodd"/>` +
    `<rect x="${WX + WW / 2 - 6}" y="${WY}" width="12" height="${WH}" fill="#fbf8f2"/><rect x="${WX}" y="${WY + WH / 2 - 6}" width="${WW}" height="12" fill="#fbf8f2"/>` +
    `<rect x="${WX - 40}" y="${SILL + 10}" width="${WW + 80}" height="22" fill="#f3ece0"/><rect x="${WX - 40}" y="${SILL + 32}" width="${WW + 80}" height="6" fill="#e0d3bd"/>`

  // A sheer curtain on the left of the window, stirring.
  const curtain = `<g style="animation:stir 6s steps(30,end) infinite" transform-origin="${WX - 30} ${WY - 30}"><path d="M${WX - 60} ${WY - 30}H${WX + 40}C${WX + 30} ${WY + 160} ${WX + 60} ${WY + 320} ${WX + 20} ${SILL + 40}H${WX - 70}C${WX - 50} ${WY + 300} ${WX - 80} ${WY + 140} ${WX - 60} ${WY - 30}Z" fill="#ffffff" fill-opacity=".55"/></g>` +
    `<rect x="${WX - 90}" y="${WY - 40}" width="${WW + 180}" height="10" rx="5" fill="#c9b79c"/>`

  // Sunbeams falling across the room from the window, brightening and easing back.
  const beams =
    `<g style="animation:shine 8s steps(1,end) infinite">` +
    `<path d="M${WX} ${WY}L${WX + WW} ${WY}L${WX - 260} ${H}H${WX - 900}Z" fill="url(#beam)" opacity=".55"/>` +
    `<path d="M${WX + 60} ${WY + 40}L${WX + 200} ${WY + 40}L${WX - 420} ${H}H${WX - 620}Z" fill="url(#beam)" opacity=".5"/></g>`
  // Dust motes drifting slowly through the light. Each cycle has two halves, so a half gets
  // the steps: one per tick.
  let motes = ''
  for (let i = 0; i < 26; i++) {
    const x = f(WX - 700 + rnd() * 900), y = f(WY + 200 + rnd() * 600), dur = onTick(10 + rnd() * 8, 0.2)
    motes += `<circle cx="${x}" cy="${y}" r="${f(1.6 + rnd() * 1.8)}" fill="#ffffff" style="animation:mote${i % 3} ${dur}s steps(${Math.round(dur / 2 / TICK)},end) -${onTick(rnd() * dur)}s infinite"/>`
  }
  const moteCss = [[30, -60], [-40, -40], [20, -80]].map(([dx, dy], i) => `@keyframes mote${i}{0%,100%{transform:translate(0,0);opacity:.2}50%{transform:translate(${dx}px,${dy}px);opacity:.9}}`).join('')

  // On the sill: a potted plant whose leaves sway, and a cup of tea steaming.
  const leaf = (a, l) => `<path transform="rotate(${a})" d="M0 0Q${l * 0.18} -${l / 2} 0 -${l}Q-${l * 0.18} -${l / 2} 0 0Z"/>`
  const plant =
    `<g transform="translate(${WX + 70} ${SILL + 10})"><path d="M-32 0L-26 -50H26L32 0Z" fill="#c9774a"/><rect x="-30" y="-56" width="60" height="10" rx="3" fill="#b8673d"/>` +
    `<g transform="translate(0 -54)" fill="#6c9a5b"><g style="animation:sway 5s steps(25,end) infinite">${[-50, -25, -5, 18, 42].map((a, i) => leaf(a, [80, 120, 140, 110, 85][i])).join('')}</g></g></g>`
  const tea =
    `<g transform="translate(${WX + 330} ${SILL + 10})"><path d="M-26 0V-38H26V0Z" fill="#ffffff"/><path d="M26 -32Q44 -32 44 -20Q44 -8 26 -8" fill="none" stroke="#ffffff" stroke-width="6"/>` +
    `<rect x="-26" y="-38" width="52" height="6" fill="#c98b5a"/>` +
    [0, 1, 2].map((k) => `<g transform="translate(${-12 + k * 12} -46)"><path d="M0 0C-6 -8 6 -16 0 -24S-6 -40 0 -48" fill="none" stroke="#b9a48a" stroke-opacity=".6" stroke-width="3" stroke-linecap="round" style="animation:steam 2.4s steps(24,end) -${f(k * 0.8)}s infinite"/></g>`).join('') + `</g>`

  // A hanging vine on the left, swaying from its hook.
  let vine = ''
  for (let i = 0; i < 9; i++) vine += `<ellipse cx="${f((i % 2 ? 1 : -1) * 14)}" cy="${80 + i * 34}" rx="16" ry="9" transform="rotate(${(i % 2 ? 30 : -30)} ${f((i % 2 ? 1 : -1) * 14)} ${80 + i * 34})"/>`
  const hanging =
    `<g transform="translate(300 0)"><path d="M0 0V60" stroke="#b8a487" stroke-width="3"/><g style="animation:sway 6s steps(30,end) -2s infinite">` +
    `<path d="M-36 60H36L28 100H-28Z" fill="#d98c5f"/><path d="M0 90V400" stroke="#6c9a5b" stroke-width="4" fill="none"/><g fill="#7fae6b">${vine}</g></g></g>`

  return svgDoc({
    defs,
    css:
      moteCss +
      `@keyframes drift{to{transform:translateX(-${WW}px)}}` +
      `@keyframes fly{from{transform:translate(-80px,0)}to{transform:translate(${WW + 80}px,-40px)}}` +
      `@keyframes flap{0%{opacity:1}50%{opacity:0}}` +
      `@keyframes stir{0%,100%{transform:skewX(0deg)}50%{transform:skewX(2.5deg)}}` +
      `@keyframes shine{0%{opacity:.85}25%{opacity:1}50%{opacity:.9}75%{opacity:.75}}` +
      `@keyframes sway{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}` +
      `@keyframes steam{from{transform:translateY(0);opacity:.7}to{transform:translateY(-40px);opacity:0}}`,
    body:
      `<rect width="${W}" height="${H}" fill="url(#wall)"/>` +
      `<rect y="880" width="${W}" height="${H - 880}" fill="url(#floor)"/><path d="M0 880H${W}" stroke="#cbb48f" stroke-width="4"/>` +
      `<ellipse cx="760" cy="950" rx="360" ry="34" fill="#c98b5a" fill-opacity=".25"/>` +
      outside + frame + curtain + plant + tea + hanging + beams + motes,
  })
}
