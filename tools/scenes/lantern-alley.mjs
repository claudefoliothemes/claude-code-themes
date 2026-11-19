// A narrow street at night after rain: paper lanterns swaying on a wire, warm shop windows, a
// glowing vending machine, a flickering neon sign, drizzle, and ripples in the puddles. Every
// change lands on the shared 0.1 s tick.
import { H, TICK, W, f, onTick, rng, svgDoc } from './_lib.mjs'

const STREET = 790 // where the buildings meet the wet street

export default function scene() {
  const rnd = rng(0x1a47e2)
  const defs =
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c0a17"/><stop offset="1" stop-color="#1d1730"/></linearGradient>` +
    `<linearGradient id="wet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1526"/><stop offset="1" stop-color="#0c0a13"/></linearGradient>` +
    `<radialGradient id="lampGlow"><stop offset="0" stop-color="#ff7a45" stop-opacity=".55"/><stop offset="1" stop-color="#ff7a45" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="vendGlow"><stop offset="0" stop-color="#8fd8ff" stop-opacity=".4"/><stop offset="1" stop-color="#8fd8ff" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="neonGlow"><stop offset="0" stop-color="#ff5fa2" stop-opacity=".45"/><stop offset="1" stop-color="#ff5fa2" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="door" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3b76a" stop-opacity=".42"/><stop offset="1" stop-color="#f3b76a" stop-opacity=".08"/></linearGradient>`

  // Two-story wooden shopfronts: dark walls, tiled eaves, and lattice windows lit from inside.
  let walls = '', eaves = '', panes = '', doors = '', lattice = '', curtains = ''
  for (let x = -20; x < W; ) {
    const w = 210 + rnd() * 90, roof = 250 + rnd() * 60
    walls += `M${f(x)} ${STREET}V${f(roof)}H${f(x + w)}V${STREET}Z`
    eaves += `M${f(x - 14)} ${f(roof)}L${f(x + 10)} ${f(roof - 26)}H${f(x + w - 10)}L${f(x + w + 14)} ${f(roof)}Z` +
      `M${f(x - 10)} ${f(roof + 190)}H${f(x + w + 10)}V${f(roof + 204)}H${f(x - 10)}Z`
    // Upper window with a lattice, lower doorway with a short curtain.
    const ux = x + 30, uy = roof + 40, uw = w - 60, uh = 110
    if (rnd() < 0.8) {
      panes += `M${f(ux)} ${f(uy)}h${f(uw)}v${uh}h${f(-uw)}Z`
      for (let k = 1; k < 5; k++) lattice += `M${f(ux + (uw * k) / 5)} ${f(uy)}v${uh}`
      lattice += `M${f(ux)} ${f(uy + uh / 2)}h${f(uw)}`
    }
    const dx = x + 40, dy = roof + 250, dw = w - 80
    doors += `M${f(dx)} ${f(dy)}h${f(dw)}V${STREET}h${f(-dw)}Z`
    for (let k = 0; k < 3; k++) curtains += `M${f(dx + (dw * k) / 3 + 3)} ${f(dy)}h${f(dw / 3 - 6)}v58h${f(-(dw / 3 - 6))}Z`
    x += w + 8
  }
  const town =
    `<path d="${walls}" fill="#1c1622"/><path d="${eaves}" fill="#0f0c16"/>` +
    `<path d="${panes}" fill="#f3b76a" fill-opacity=".38"/><path d="${doors}" fill="url(#door)"/><path d="${lattice}" stroke="#2a1d1a" stroke-width="5"/>` +
    `<path d="${curtains}" fill="#3a2a5a"/>`

  // Vending machine on the right, with a brief flicker every 10 s.
  const VX = 1360
  let bottles = ''
  const BOTTLE = ['#ff6b6b', '#ffd166', '#6be5a0', '#6bb6ff', '#f78fd0']
  for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) bottles += `<rect x="${VX + 14 + c * 24}" y="${STREET - 260 + r * 44}" width="12" height="30" rx="4" fill="${BOTTLE[(r + c) % 5]}"/>`
  const vending =
    `<circle cx="${VX + 70}" cy="${STREET - 150}" r="260" fill="url(#vendGlow)"/>` +
    `<rect x="${VX}" y="${STREET - 290}" width="140" height="290" rx="6" fill="#d9e3ec"/>` +
    `<g style="animation:flick 10s steps(1,end) infinite"><rect x="${VX + 8}" y="${STREET - 280}" width="124" height="190" fill="#bfe9ff"/>${bottles}</g>` +
    `<rect x="${VX + 20}" y="${STREET - 70}" width="100" height="30" rx="4" fill="#2b2f3a"/>`

  // Neon sign on the left: a round emblem and bars, no lettering.
  const neon =
    `<g style="animation:neon 5s steps(1,end) infinite">` +
    `<circle cx="210" cy="470" r="150" fill="url(#neonGlow)"/>` +
    `<rect x="170" y="360" width="80" height="230" rx="10" fill="#1a1020" stroke="#ff5fa2" stroke-width="5"/>` +
    `<circle cx="210" cy="410" r="24" fill="none" stroke="#ff8fc4" stroke-width="5"/>` +
    `<path d="M190 460H230M190 490H230M190 520H230M190 550H230" stroke="#ff8fc4" stroke-width="5" stroke-linecap="round"/></g>`

  // Lanterns hang from a wire across the top, each swaying a few degrees around its hook.
  let wire = 'M-20 70', lanterns = '', lampCss = ''
  const HOOKS = []
  for (let x = 80; x < W; x += 180) {
    const y = 96 + Math.round(Math.sin(x / 180) * 6)
    wire += `Q${x - 90} ${y + 26} ${x} ${y}`
    HOOKS.push([x, y])
  }
  wire += `Q${W - 20} 120 ${W + 20} 70`
  HOOKS.forEach(([x, y], i) => {
    const dur = [4, 4.8, 5.6][i % 3], half = Math.round(dur / 2 / TICK), name = `sway${i % 3}`
    lanterns +=
      `<g transform="translate(${x} ${y})"><g style="animation:${name} ${dur}s steps(${half},end) -${f(i * 0.7)}s infinite">` +
      `<path d="M0 0V18" stroke="#4a3d5c" stroke-width="3"/>` +
      `<circle cy="62" r="70" fill="url(#lampGlow)"/>` +
      `<rect x="-26" y="18" width="52" height="10" rx="3" fill="#120e18"/>` +
      `<ellipse cy="62" rx="34" ry="40" fill="#d8323e"/>` +
      `<path d="M-30 50H30M-33 62H33M-30 74H30" stroke="#a0222c" stroke-width="3"/>` +
      `<ellipse cy="62" rx="16" ry="34" fill="#ff8a5c" fill-opacity=".45"/>` +
      `<rect x="-26" y="96" width="52" height="10" rx="3" fill="#120e18"/><path d="M0 106V124" stroke="#d8a23e" stroke-width="3"/></g></g>`
  })
  for (const [k, dur] of [[0, 4], [1, 4.8], [2, 5.6]]) lampCss += `@keyframes sway${k}{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}`

  // Wet street: reflections of the shop light and lanterns, and ripples spreading in puddles.
  let reflections = ''
  // Broken streaks of light under each lantern and the vending machine, fading with distance.
  const streaks = (x, w, color) => [14, 32, 54, 80, 110, 144].map((dy, k) => {
    const ww = w * [1, 0.8, 0.9, 0.6, 0.55, 0.4][k]
    return `<rect x="${f(x - ww / 2 + (k % 2 ? 4 : -4))}" y="${STREET + dy}" width="${f(ww)}" height="5" rx="2.5" fill="${color}" fill-opacity="${[0.4, 0.32, 0.24, 0.17, 0.11, 0.07][k]}"/>`
  }).join('')
  for (const [x] of HOOKS) reflections += streaks(x, 46, '#ff7a45')
  reflections += streaks(VX + 70, 120, '#8fd8ff')
  let ripples = ''
  for (let i = 0; i < 9; i++) {
    const x = f(60 + rnd() * (W - 120)), y = f(STREET + 40 + rnd() * 150), dur = onTick(1.6 + rnd() * 1.4)
    ripples += `<g transform="translate(${x} ${y})"><ellipse rx="26" ry="6" fill="none" stroke="#c9b8e8" stroke-width="2" style="animation:ripple ${dur}s steps(${Math.round(dur / TICK)},end) -${onTick(rnd() * dur)}s infinite"/></g>`
  }
  let drops = ''
  for (let i = 0; i < 90; i++) {
    const x = f(rnd() * W), y = f(rnd() * H), l = f(14 + rnd() * 18)
    drops += `M${x} ${y}v${l}M${x} ${f(y - H)}v${l}`
  }
  const rain = `<g style="animation:fall 1.6s steps(16,end) infinite"><path d="${drops}" stroke="#b9c4ff" stroke-opacity=".22" stroke-width="1.4" fill="none"/></g>`

  return svgDoc({
    defs,
    css:
      lampCss +
      `@keyframes fall{to{transform:translateY(${H}px)}}` +
      `@keyframes ripple{from{transform:scale(.2);opacity:.8}to{transform:scale(1.6);opacity:0}}` +
      `@keyframes flick{0%{opacity:1}97%{opacity:.35}98%{opacity:1}}` +
      `@keyframes neon{0%{opacity:1}86%{opacity:.4}88%{opacity:1}92%{opacity:.5}94%{opacity:1}}`,
    body:
      `<rect width="${W}" height="${H}" fill="url(#sky)"/>` +
      town + neon + vending +
      `<rect y="${STREET}" width="${W}" height="${H - STREET}" fill="url(#wet)"/>` +
            reflections + ripples +
      `<path d="${wire}" fill="none" stroke="#4a3d5c" stroke-width="3"/>` + lanterns + rain,
  })
}
