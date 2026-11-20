// A neon city at night in the rain: towers edged in cyan and magenta, windows flickering,
// glowing billboards with no lettering, flying cars streaking between the towers, and the street
// reflecting it all. Every change lands on the shared 0.1 s tick.
import { H, TICK, W, f, onTick, rng, svgDoc } from './_lib.mjs'

const STREET = 860

export default function scene() {
  const rnd = rng(0xc1b3c)
  const NEON = ['#38e1ff', '#ff4fd8', '#ffd166', '#7b5cff']
  const defs =
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07040f"/><stop offset=".6" stop-color="#1e0b30"/><stop offset="1" stop-color="#4a1550"/></linearGradient>` +
    `<linearGradient id="street" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a0d28"/><stop offset="1" stop-color="#07040c"/></linearGradient>` +
    NEON.map((c, i) => `<linearGradient id="board${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c}" stop-opacity=".85"/><stop offset="1" stop-color="${NEON[(i + 1) % 4]}" stop-opacity=".55"/></linearGradient>`).join('') +
    NEON.map((c, i) => `<radialGradient id="halo${i}"><stop offset="0" stop-color="${c}" stop-opacity=".35"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`).join('')

  // Towers: far row then near row. Windows go into a still layer and three flicker groups.
  const lit = [{}, {}, {}, {}]
  const tower = (x, w, top, fill, edge, win) => {
    let out = `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(STREET - top)}" fill="${fill}"/>` +
      `<path d="M${f(x)} ${f(STREET)}V${f(top)}H${f(x + w)}" fill="none" stroke="${edge}" stroke-opacity=".7" stroke-width="2"/>`
    for (let y = top + 16; y < STREET - 20; y += win * 2.4) for (let wx = x + 8; wx < x + w - win - 4; wx += win * 2) {
      if (rnd() < 0.3) {
        const g = lit[Math.floor(rnd() * 4)], c = NEON[Math.floor(rnd() * 4)]
        g[c] = (g[c] ?? '') + `M${f(wx)} ${f(y)}h${win}v${f(win * 0.8)}h-${win}Z`
      }
    }
    return out
  }
  let far = '', near = ''
  for (let x = -20; x < W; x += 70 + rnd() * 50) far += tower(x, 50 + rnd() * 50, 300 + rnd() * 260, '#140a26', NEON[Math.floor(rnd() * 4)], 4)
  const farLit = lit.splice(0, 4, {}, {}, {}, {})
  for (const [x, w, top] of [[-20, 170, 180], [160, 120, 360], [1210, 140, 300], [1360, 260, 120]]) near += tower(x, w, top, '#0c0617', NEON[Math.floor(rnd() * 4)], 6)
  const windows = (groups, opacity) => groups.map((g, i) => {
    const paths = Object.entries(g).map(([c, d]) => `<path d="${d}" fill="${c}" fill-opacity="${opacity}"/>`).join('')
    return i === 0 ? paths : `<g style="animation:flick ${[7, 9, 11][i - 1]}s steps(1,end) -${i * 2}s infinite">${paths}</g>`
  }).join('')

  // Billboards on the near towers: glowing panels with abstract bars, no lettering.
  const board = (x, y, w, h, i, dur) =>
    `<g style="animation:sign ${dur}s steps(1,end) -${i}s infinite"><circle cx="${x + w / 2}" cy="${y + h / 2}" r="${Math.max(w, h)}" fill="url(#halo${i})"/>` +
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#board${i})"/>` +
    `<path d="M${x + 12} ${y + 16}h${w * 0.5}M${x + 12} ${y + 30}h${w * 0.7}M${x + 12} ${y + 44}h${w * 0.35}" stroke="#fff" stroke-opacity=".7" stroke-width="5" stroke-linecap="round"/></g>`
  const boards = board(20, 260, 110, 70, 0, 5) + board(1385, 210, 120, 80, 1, 10) + board(1230, 420, 90, 120, 2, 15)

  // Flying cars: a body and a fading light trail, crossing at different heights and speeds.
  let cars = '', carCss = ''
  ;[[180, 9, 1], [300, 13, -1], [420, 7, 1], [520, 11, -1], [240, 16, 1]].forEach(([y, dur, dir], i) => {
    const color = NEON[i % 4]
    const from = dir > 0 ? -200 : W + 200, to = dir > 0 ? W + 200 : -200
    carCss += `@keyframes car${i}{from{transform:translateX(${from}px)}to{transform:translateX(${to}px)}}`
    const flip = dir > 0 ? '' : ' scale(-1 1)'
    cars += `<g transform="translate(0 ${y})"><g style="animation:car${i} ${dur}s steps(${Math.round(dur / TICK)},end) -${onTick(rnd() * dur)}s infinite"><g transform="${flip.trim() || 'scale(1 1)'}">` +
      `<rect x="-120" y="-2" width="110" height="4" fill="${color}" fill-opacity=".35"/>` +
      `<rect x="-14" y="-7" width="34" height="12" rx="6" fill="#c9d2ff"/><rect x="14" y="-4" width="8" height="5" rx="2" fill="${color}"/></g></g></g>`
  })

  // Rain and the wet street, with streaks of reflected neon.
  let drops = ''
  for (let i = 0; i < 120; i++) {
    const x = f(rnd() * (W + 200)), y = f(rnd() * H), l = f(16 + rnd() * 22)
    drops += `M${x} ${y}v${l}M${x} ${f(y - H)}v${l}`
  }
  const rain = `<g transform="skewX(-12)"><g style="animation:fall 1.4s steps(14,end) infinite"><path d="${drops}" stroke="#9fe8ff" stroke-opacity=".2" stroke-width="1.4" fill="none"/></g></g>`
  let streaks = ''
  for (let i = 0; i < 40; i++) {
    const x = f(rnd() * W), w = f(20 + rnd() * 70), y = f(STREET + 12 + rnd() * 120)
    streaks += `<rect x="${x}" y="${y}" width="${w}" height="4" rx="2" fill="${NEON[i % 4]}" fill-opacity="${f(0.08 + rnd() * 0.18)}"/>`
  }

  return svgDoc({
    defs,
    css:
      carCss +
      `@keyframes flick{0%{opacity:1}80%{opacity:.25}90%{opacity:1}}` +
      `@keyframes sign{0%{opacity:1}92%{opacity:.35}94%{opacity:1}96%{opacity:.5}98%{opacity:1}}` +
      `@keyframes fall{to{transform:translateY(${H}px)}}`,
    body:
      `<rect width="${W}" height="${H}" fill="url(#sky)"/>` +
      far + windows(farLit, 0.55) + cars + near + windows(lit, 0.75) + boards +
      `<rect y="${STREET}" width="${W}" height="${H - STREET}" fill="url(#street)"/>` + streaks + rain,
  })
}
