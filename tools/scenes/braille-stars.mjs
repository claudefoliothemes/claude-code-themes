// The braille-stars backdrop scene.
//
// Kept light on purpose. A backdrop repaints the whole window whenever anything in it changes, so:
// most dots are still; the twinkle lives in a few layers that switch in steps (a couple of
// repaints a second, not 60); no full-window pattern; and the desktop app freezes the animation
// if the SVG holds any @media rule but reduced-motion, or shape-rendering (claude-code#109770).

export default function scene() {
  let seed = 0x5eed1e5
  const rnd = () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const f = (n) => +n.toFixed(2)

  const W = 1600, H = 1000, DP = 8, CP = 19, LP = 38, OX = 6, OY = 8
  const CELL = [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [0, 3], [1, 3]]
  const DENSITY = 0.65
  const LAYERS = 8 // twinkle layers; each switches twice per cycle (about 7 repaints a second in all)
  const CYCLE = 2.4 // seconds
  const COLORS = { c: '#d6defc', b: '#9fb6ff', w: '#ffdcae' }
  const SIZE = { s: { w: 2.8, o: 0.6 }, m: { w: 3.8, o: 0.85 } }

  const bandDist = (x, y) => {
    const x1 = 0, y1 = 760, x2 = 1600, y2 = -60, dx = x2 - x1, dy = y2 - y1
    return Math.abs(dy * x - dx * y + x2 * y1 - y2 * x1) / Math.hypot(dx, dy)
  }
  const clusters = Array.from({ length: 7 }, () => ({ x: 80 + rnd() * 1440, y: 60 + rnd() * 880, r: 50 + rnd() * 90, k: 0.18 + rnd() * 0.2 }))

  const still = new Map() // size|color -> d
  const layers = Array.from({ length: LAYERS }, () => new Map()) // per layer: size|color -> d
  const bright = Array.from({ length: LAYERS }, () => [])
  const add = (map, key, x, y) => map.set(key, (map.get(key) ?? '') + `M${x} ${y}h0`)
  let dots = 0

  const cols = Math.floor((W - OX) / CP) + 1, rows = Math.floor((H - OY) / LP) + 1
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = OX + c * CP, cy = OY + r * LP, m = { x: cx + DP / 2, y: cy + DP * 1.5 }
      let p = 0.045 + 0.26 * Math.exp(-((bandDist(m.x, m.y) / 160) ** 2))
      for (const k of clusters) p += k.k * Math.exp(-((Math.hypot(m.x - k.x, m.y - k.y) / k.r) ** 2))
      if (m.x > 520 && m.x < 1080) p *= 0.72
      p *= DENSITY
      for (const [dx, dy] of CELL) {
        if (rnd() >= p) continue
        dots++
        const x = cx + dx * DP, y = cy + dy * DP
        const cr = rnd(), color = cr < 0.7 ? 'c' : cr < 0.88 ? 'b' : 'w'
        const sr = rnd()
        const layer = Math.floor(rnd() * LAYERS)
        if (sr > 0.97) { bright[layer].push({ x, y, color }); continue }
        const key = `${sr < 0.84 ? 's' : 'm'}|${color}`
        add(rnd() < 0.18 ? layers[layer] : still, key, x, y)
      }
    }
  }

  const pathsOf = (map) => [...map].map(([key, d]) => {
    const [size, color] = key.split('|')
    return `<path stroke="${COLORS[color]}" stroke-width="${SIZE[size].w}" stroke-opacity="${SIZE[size].o}" d="${d}"/>`
  }).join('')
  const brightOf = (list) => list.map((b) =>
    `<path stroke="${COLORS[b.color]}" stroke-width="13" stroke-opacity=".2" d="M${b.x} ${b.y}h0"/><path stroke="${COLORS[b.color]}" stroke-width="4.8" d="M${b.x} ${b.y}h0"/>`).join('')

  // "stars" in 6-dot braille, top right; it pulses with layer 0.
  const EP = 24, EC = 60
  const LETTERS = [
    { dots: [2, 3, 4], lines: [[4, 2, 3]] },
    { dots: [2, 3, 4, 5], lines: [[4, 5, 2, 3]] },
    { dots: [1], lines: [] },
    { dots: [1, 2, 3, 5], lines: [[1, 2, 3], [2, 5]] },
    { dots: [2, 3, 4], lines: [[4, 2, 3]] },
  ]
  const pos = (li, n) => [li * EC + (n <= 3 ? 0 : EP), ((n - 1) % 3) * EP]
  let eggLines = '', eggDots = '', eggGlow = ''
  LETTERS.forEach((L, li) => {
    for (const line of L.lines) eggLines += `M${line.map((n) => pos(li, n).join(' ')).join('L')}`
    for (const n of L.dots) {
      const [x, y] = pos(li, n)
      eggDots += `M${x} ${y}h0`
    }
  })
  eggGlow = `<path class="t0" stroke="#c9d4ff" stroke-width="18" stroke-opacity=".14" d="${eggDots}"/>`

  let meteor = ''
  for (let k = 0; k < 12; k++) {
    meteor += `<path stroke="#eef1ff" stroke-width="${f(5.5 - k * 0.42)}" stroke-opacity="${f(1 - k * 0.075)}" d="M${f(-k * 12 * 0.92)} ${f(-k * 12 * 0.39)}h0"/>`
  }

  const layerCss = Array.from({ length: LAYERS }, (_, i) =>
    `.t${i}{animation:tw ${CYCLE}s steps(1,end) ${f(-(i * CYCLE) / LAYERS - 0.3)}s infinite}`).join('')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">` +
    `<defs>` +
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0e1434"/><stop offset=".55" stop-color="#0a0e1f"/><stop offset="1" stop-color="#060914"/></linearGradient>` +
    `<radialGradient id="haze" cx=".78" cy=".12" r=".7"><stop offset="0" stop-color="#26306a" stop-opacity=".55"/><stop offset="1" stop-color="#26306a" stop-opacity="0"/></radialGradient>` +
    `</defs><style>` +
    `@keyframes tw{0%{opacity:1}82%{opacity:.12}}` + layerCss +
    `@keyframes met{0%,70%{transform:translate(120px,40px);opacity:0}70.5%{opacity:1}80%{transform:translate(980px,420px);opacity:1}80.5%,100%{transform:translate(980px,420px);opacity:0}}` +
    `.met{animation:met 9s steps(24,end) 2s infinite;opacity:0}` +
    `.egg{transform:translate(1270px,130px)}` +
    `@media (prefers-reduced-motion:reduce){*{animation:none!important}.met{display:none}}` +
    `</style>` +
    `<rect width="${W}" height="${H}" fill="url(#sky)"/><rect width="${W}" height="${H}" fill="url(#haze)"/>` +
    `<g fill="none" stroke-linecap="round">` +
    pathsOf(still) +
    layers.map((map, i) => `<g class="t${i}">${pathsOf(map)}${brightOf(bright[i])}</g>`).join('') +
    `<g class="egg"><path stroke="#b9c6ff" stroke-opacity=".3" stroke-width="1" d="${eggLines}"/>${eggGlow}<path stroke="#f6f3ff" stroke-width="6" d="${eggDots}"/></g>` +
    `<g class="met">${meteor}</g>` +
    `</g></svg>`

  return svg
}
