// A rainy night through a window: a soft city glowing in the distance, rain sheeting past, drops
// running down the glass, and a mug steaming on the sill. Every change lands on the shared 0.1 s
// tick, so the window repaints at most 10 times a second.
import { H, TICK, W, f, onTick, rng, svgDoc } from './_lib.mjs'

const SILL = 860 // top of the windowsill

export default function scene() {
  const rnd = rng(0x10f1a1)
  const BOKEH = ['#ffb36b', '#ff8fb1', '#7aa2f7', '#bb9af7', '#ffd27a']
  const defs =
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c0d18"/><stop offset=".55" stop-color="#161728"/><stop offset="1" stop-color="#2a2340"/></linearGradient>` +
    `<linearGradient id="fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9d2ff" stop-opacity="0"/><stop offset="1" stop-color="#c9d2ff" stop-opacity=".07"/></linearGradient>` +
    BOKEH.map((c, i) => `<radialGradient id="b${i}"><stop offset="0" stop-color="${c}" stop-opacity=".5"/><stop offset=".6" stop-color="${c}" stop-opacity=".18"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`).join('')

  // Two rows of buildings. Lit windows go into one still group and three groups that switch off and on.
  // lamps[group] maps "color|opacity" to one path of window rectangles, which keeps the SVG small.
  const newLamps = () => [{}, {}, {}, {}]
  let lamps = newLamps()
  const OPAC = [0.45, 0.65, 0.85]
  const LIT = ['#ffcf8a', '#ffb36b', '#ffe2a8', '#9ec1ff']
  const skyline = (minTop, maxTop, fill, win) => {
    let d = '', x = -20
    while (x < W + 20) {
      const w = 50 + rnd() * 80, top = minTop + rnd() * (maxTop - minTop)
      d += `M${f(x)} ${SILL}V${f(top)}h${f(w)}V${SILL}Z`
      for (let wy = top + 14; wy < SILL - 20; wy += win * 2.2) {
        for (let wx = x + 8; wx < x + w - win; wx += win * 2) {
          if (rnd() < 0.17) {
            const g = lamps[Math.floor(rnd() * 4)], key = `${LIT[Math.floor(rnd() * LIT.length)]}|${OPAC[Math.floor(rnd() * 3)]}`
            g[key] = (g[key] ?? '') + `M${f(wx)} ${f(wy)}h${win}v${f(win * 1.4)}h-${win}Z`
          }
        }
      }
      x += w + 4 + rnd() * 10
    }
    return `<path d="${d}" fill="${fill}"/>`
  }
  const far = skyline(430, 620, '#1b1b2e', 5)
  const farLamps = lamps
  lamps = newLamps()
  const near = skyline(560, 720, '#11111d', 7)

  let bokeh = ''
  for (let i = 0; i < 34; i++) {
    const r = f(24 + rnd() * 70)
    bokeh += `<circle cx="${f(rnd() * W)}" cy="${f(380 + rnd() * 460)}" r="${r}" fill="url(#b${Math.floor(rnd() * BOKEH.length)})" opacity="${f(0.45 + rnd() * 0.55)}"/>`
  }

  // Lamps switch off for part of each cycle; all switch points are whole seconds.
  const lampCss = `@keyframes lamp{0%{opacity:1}60%{opacity:.06}}`
  const lampPaths = (g) => Object.entries(g).map(([k, d]) => { const [c, o] = k.split('|'); return `<path d="${d}" fill="${c}" fill-opacity="${o}"/>` }).join('')
  const lampGroup = (g, i) => i === 0 ? lampPaths(g) : `<g style="animation:lamp ${[0, 10, 14, 17][i]}s steps(1,end) -${[0, 3, 9, 5][i]}s infinite">${lampPaths(g)}</g>`

  // Rain: two layers of streaks, each tiled twice so a one-tile slide loops seamlessly. The skew
  // slants the streaks and the fall together.
  const rainLayer = (count, len, width, color, opacity, dur, name) => {
    let lines = ''
    for (let i = 0; i < count; i++) {
      const x = f(rnd() * (W + 220)), y = f(rnd() * H), l = f(len * (0.6 + rnd() * 0.8))
      lines += `M${x} ${y}v${l}M${x} ${f(y - H)}v${l}`
    }
    return `<g style="animation:${name} ${dur}s steps(${Math.round(dur / TICK)},end) infinite"><path d="${lines}" stroke="${color}" stroke-opacity="${opacity}" stroke-width="${width}" stroke-linecap="round" fill="none"/></g>`
  }
  const rainCss = `@keyframes fall{to{transform:translateY(${H}px)}}`
  const rain =
    `<g transform="skewX(-10)">` +
    rainLayer(170, 22, 1, '#9fb4ff', 0.22, 2, 'fall') +
    rainLayer(80, 56, 1.6, '#cbd6ff', 0.3, 1.2, 'fall') +
    `</g>`

  // Beads on the glass, and a few drops that run down and slip behind the sill.
  let beads = ''
  for (let i = 0; i < 110; i++) {
    const x = f(rnd() * W), y = f(rnd() * (SILL - 40)), r = f(1.2 + rnd() * 3)
    beads += `<circle cx="${x}" cy="${y}" r="${r}" fill="#d6ddff" fill-opacity=".14"/><circle cx="${f(x - r * 0.35)}" cy="${f(y - r * 0.35)}" r="${f(r * 0.35)}" fill="#ffffff" fill-opacity=".35"/>`
  }
  let drips = ''
  const DRIP = 800
  for (let i = 0; i < 8; i++) {
    const x = f(60 + rnd() * (W - 120)), y = f(80 + rnd() * 90), dur = onTick(7 + rnd() * 7)
    drips += `<g transform="translate(${x} ${y})"><g style="animation:drip ${dur}s steps(${Math.round(dur / TICK)},end) -${onTick(rnd() * dur)}s infinite">` +
      `<path d="M0 -70V-4" stroke="#d6ddff" stroke-opacity=".16" stroke-width="2.4" stroke-linecap="round"/>` +
      `<circle r="4.6" fill="#d6ddff" fill-opacity=".3"/><circle cx="-1.6" cy="-1.6" r="1.5" fill="#fff" fill-opacity=".6"/></g></g>`
  }
  const dripCss = `@keyframes drip{to{transform:translateY(${DRIP}px)}}`

  // The sill, a mug with steam, and a small plant, all in silhouette.
  const sill =
    `<rect x="0" y="${SILL}" width="${W}" height="${H - SILL}" fill="#0a0a12"/>` +
    `<rect x="0" y="${SILL}" width="${W}" height="5" fill="#2c2a44"/>`
  const mug =
    `<g transform="translate(1360 ${SILL})">` +
    `<path d="M-38 0V-74Q-38 -80 -32 -80H32Q38 -80 38 -74V0Z" fill="#0a0a12"/>` +
    `<path d="M38 -62Q66 -62 66 -40Q66 -18 38 -18" fill="none" stroke="#0a0a12" stroke-width="10"/>` +
    `<path d="M-32 -80H32" stroke="#3a3656" stroke-width="2"/></g>`
  const steamCss = `@keyframes steam{from{transform:translateY(0);opacity:.5}to{transform:translateY(-60px);opacity:0}}`
  let steam = ''
  for (let i = 0; i < 3; i++) {
    steam += `<g transform="translate(${1345 + i * 15} ${SILL - 92})"><g style="animation:steam 2.4s steps(24,end) -${(i * 0.8).toFixed(1)}s infinite">` +
      `<path d="M0 0C-8 -10 8 -20 0 -30S-8 -50 0 -60" fill="none" stroke="#dcdcf5" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/></g></g>`
  }
  const plant =
    `<g transform="translate(200 ${SILL})" fill="#0a0a12">` +
    `<path d="M-34 0L-28 -56H28L34 0Z"/>` +
    [[-58, 100, 26], [-32, 150, 30], [-8, 178, 32], [16, 160, 30], [40, 128, 28], [66, 92, 24]].map(([a, l, w]) => `<path transform="translate(0 -54) rotate(${a})" d="M0 0Q${w} -${l / 2} 0 -${l}Q-${w} -${l / 2} 0 0Z"/>`).join('') +
    `</g>`

  return svgDoc({
    defs,
    css: lampCss + rainCss + dripCss + steamCss,
    body:
      `<rect width="${W}" height="${H}" fill="url(#sky)"/>` +
      far + farLamps.map(lampGroup).join('') +
      near + lamps.map(lampGroup).join('') +
      bokeh + rain +
      `<rect y="560" width="${W}" height="${SILL - 560}" fill="url(#fog)"/>` +
      beads + drips + sill + steam + mug + plant,
  })
}
