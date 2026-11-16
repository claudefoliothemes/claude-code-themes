// The digital-rain backdrop scene.
//
// Two layers of glyph columns fall in whole-row steps: a near layer and a smaller, dimmer, slower
// far layer between its columns. Every column steps on a shared 0.1 s tick (its speed a whole
// number of ticks a row, its offset a whole number of ticks), so the window repaints at most 10
// times a second however many columns there are. Each column is one <text> with an x and y per glyph and
// a vertical gradient fill (tail dark and clear, head white), which keeps the SVG small.
// No @media rule but reduced-motion and no shape-rendering: either one freezes a desktop
// backdrop (claude-code#109770). The glyphs exclude < > and &, which break the SVG.

export default function scene() {
  let seed = 0x0d15c0
  const rnd = () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const f = (n) => +n.toFixed(2)

  const W = 1600, H = 1000
  const TICK = 0.1 // seconds; every step lands on this grid
  const COL = 16 // column pitch; the far layer sits halfway between near columns
  const GLYPHS = [...'ｦｧｨｩｪｫｬｭｮｯｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789Z:=*+']
  const glyph = () => GLYPHS[Math.floor(rnd() * GLYPHS.length)]

  const LAYERS = [
    { id: 'n', size: 15, row: 18, trail: 16, active: 0.75, ticks: [1, 1, 2], offset: 0, dim: 1 },
    { id: 'f', size: 11, row: 13, trail: 12, active: 0.45, ticks: [2, 3], offset: COL / 2, dim: 0.5 },
  ]

  // Hue drifts across the screen: emerald, then teal, then lime at the right edge.
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
  const toHex = (c) => '#' + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')
  const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t)
  const EMERALD = hex('#22e05e'), TEAL = hex('#1fd6b4'), LIME = hex('#8ee34f'), WHITE = hex('#f4fff6')
  const BUCKETS = 8
  const hueAt = (t) => (t < 0.6 ? mix(EMERALD, TEAL, t / 0.6) : mix(TEAL, LIME, (t - 0.6) / 0.4))

  let defs = '', css = '', columns = '', count = 0, glyphs = 0
  for (const L of LAYERS) {
    for (let b = 0; b < BUCKETS; b++) {
      const base = hueAt((b + 0.5) / BUCKETS)
      const deep = mix(base, [0, 0, 0], 0.6), bright = mix(base, WHITE, 0.45)
      defs += `<linearGradient id="${L.id}${b}" x1="0" y1="0" x2="0" y2="1">` +
        `<stop offset="0" stop-color="${toHex(deep)}" stop-opacity="0"/>` +
        `<stop offset=".45" stop-color="${toHex(base)}" stop-opacity="${f(0.55 * L.dim)}"/>` +
        `<stop offset=".85" stop-color="${toHex(bright)}" stop-opacity="${f(L.dim)}"/>` +
        `<stop offset="1" stop-color="${toHex(WHITE)}" stop-opacity="${f(L.dim)}"/></linearGradient>`
    }
    const rows = Math.ceil((H + L.trail * L.row) / L.row)
    const trips = { [`${L.id}a`]: rows, [`${L.id}b`]: rows + 30 } // the second waits a while above the top
    const start = -L.trail * L.row
    for (const [name, r] of Object.entries(trips)) css += `@keyframes ${name}{from{transform:translateY(${start}px)}to{transform:translateY(${start + r * L.row}px)}}`
    css += `.${L.id} text{transform:translateY(${start}px)}`
    const ys = Array.from({ length: L.trail }, (_, j) => j * L.row).join(' ')
    let texts = ''
    for (let x = COL / 2 + L.offset; x < W; x += COL) {
      if (rnd() > L.active) continue
      count++
      glyphs += L.trail
      const [name, r] = rnd() < 0.45 ? [`${L.id}b`, trips[`${L.id}b`]] : [`${L.id}a`, trips[`${L.id}a`]]
      const tpr = L.ticks[Math.floor(rnd() * L.ticks.length)]
      const delay = -Math.floor(rnd() * r) * tpr * TICK
      const bucket = Math.min(BUCKETS - 1, Math.floor((x / W) * BUCKETS))
      let word = ''
      for (let j = 0; j < L.trail; j++) word += glyph()
      texts += `<text x="${Array(L.trail).fill(x).join(' ')}" y="${ys}" fill="url(#${L.id}${bucket})" style="animation:${name} ${f(r * tpr * TICK)}s steps(${r},end) ${f(delay)}s infinite">${word}</text>`
    }
    columns += `<g class="${L.id}" font-size="${L.size}">${texts}</g>`
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">` +
    `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#020904"/><stop offset="1" stop-color="#010302"/></linearGradient>` +
    `<radialGradient id="glow" cx=".5" cy="0" r=".9"><stop offset="0" stop-color="#0b3a26" stop-opacity=".55"/><stop offset="1" stop-color="#0b3a26" stop-opacity="0"/></radialGradient>` +
    defs + `</defs>` +
    `<style>${css}@media (prefers-reduced-motion:reduce){text{animation:none!important}}</style>` +
    `<rect width="${W}" height="${H}" fill="url(#bg)"/><rect width="${W}" height="${H}" fill="url(#glow)"/>` +
    `<g font-family="MS Gothic,Yu Gothic,Meiryo,monospace" text-anchor="middle">${columns}</g>` +
    `</svg>`

  return svg
}
