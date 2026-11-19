// A pixel-art campsite at night: a fire crackling between logs, sparks drifting up, a lit tent,
// pines, an owl that blinks, a pixel moon, and twinkling stars. Everything sits on a 10-unit
// pixel grid, and each color is one path so neighboring pixels never show seams.
import { H, TICK, W, onTick, rng, svgDoc } from './_lib.mjs'

const P = 10 // one pixel
const GROUND = 84 // ground line, in pixels (840 units)

// Collects pixels per color and emits one path per color.
const canvas = () => {
  const cells = new Map()
  const put = (color, x, y) => {
    if (!cells.has(color)) cells.set(color, [])
    cells.get(color).push(`M${x * P} ${y * P}h${P}v${P}h-${P}Z`)
  }
  // A block is one subpath; blocks of one color share a path, so their edges still meet cleanly.
  const rect = (color, x, y, w, h) => {
    if (w <= 0 || h <= 0) return
    if (!cells.has(color)) cells.set(color, [])
    cells.get(color).push(`M${x * P} ${y * P}h${w * P}v${h * P}h-${w * P}Z`)
  }
  const svg = (extra = '') => [...cells].map(([c, d]) => `<path d="${d.join('')}" fill="${c}"${extra}/>`).join('')
  return { put, rect, svg }
}

export default function scene() {
  const rnd = rng(0x91ce1)
  const back = canvas()

  // Sky in bands, darkest at the top.
  const BANDS = ['#1b2024', '#1e2326', '#21272b', '#232a2e', '#272e33', '#2d353b']
  BANDS.forEach((c, i) => back.rect(c, 0, i * 9, W / P, i === BANDS.length - 1 ? GROUND - i * 9 : 9))

  // Pixel moon with two craters.
  for (let y = -5; y <= 5; y++) for (let x = -5; x <= 5; x++) if (x * x + y * y <= 26) back.put('#e8dcb5', 128 + x, 16 + y)
  back.put('#cfc39c', 126, 14); back.put('#cfc39c', 127, 14); back.put('#cfc39c', 130, 18)

  // Far and near mountains, stepped.
  const ridge = (color, base, height, step, seed) => {
    const r = rng(seed)
    let h = height * 0.5
    for (let x = 0; x < W / P; x++) {
      h = Math.max(2, Math.min(height, h + (r() < 0.5 ? -1 : 1) * (r() < step ? 1 : 0)))
      back.rect(color, x, base - Math.round(h), 1, Math.round(h))
    }
  }
  ridge('#343f44', 66, 22, 0.7, 7)
  ridge('#2b3539', 74, 14, 0.6, 9)

  // Pines: stepped triangles with a trunk.
  const pine = (cx, base, h, color) => {
    for (let row = 0; row < h; row++) {
      const half = Math.floor(row / 2) + 1
      back.rect(color, cx - half, base - h + row, half * 2 + 1, 1)
    }
    back.rect('#3b2f2a', cx, base, 1, 2)
  }
  for (const [x, h] of [[6, 26], [16, 34], [27, 22], [140, 30], [151, 24], [118, 18]]) pine(x, GROUND - 2, h, '#1d2a24')
  for (const [x, h] of [[11, 16], [146, 14], [158, 20]]) pine(x, GROUND, h, '#25352d')

  // Ground with tufts of grass.
  back.rect('#1f2a24', 0, GROUND, W / P, H / P - GROUND)
  for (let x = 0; x < W / P; x += 3) if (rnd() < 0.6) back.put('#2f4034', x, GROUND)

  // Tent, lit from inside.
  for (let row = 0; row < 14; row++) back.rect(row < 2 ? '#7a8478' : '#5b6660', 44 - row, GROUND - 14 + row, row * 2 + 1, 1)
  for (let row = 4; row < 14; row++) back.rect('#dbbc7f', 44 - Math.floor((row - 4) / 2), GROUND - 14 + row, Math.floor((row - 4) / 2) * 2 + 1, 1)

  // Logs around the fire, and stones.
  const FX = 92 // fire center, in pixels
  back.rect('#5c4033', FX - 6, GROUND - 2, 12, 2); back.rect('#7a5543', FX - 5, GROUND - 3, 4, 1); back.rect('#7a5543', FX + 1, GROUND - 3, 4, 1)
  for (const dx of [-8, -7, 7, 8]) back.put('#4f5b58', FX + dx, GROUND - 1)

  // Owl on a branch of the tall pine on the left.
  back.rect('#3b2f2a', 17, 58, 6, 1)
  back.rect('#6b5a4e', 19, 54, 3, 4); back.rect('#8a7563', 19, 55, 3, 2)
  back.put('#6b5a4e', 19, 53); back.put('#6b5a4e', 21, 53)
  const owlEyes = canvas(); owlEyes.put('#dbbc7f', 19, 55); owlEyes.put('#dbbc7f', 21, 55)
  const owlShut = canvas(); owlShut.put('#4f4036', 19, 55); owlShut.put('#4f4036', 21, 55)

  // Stars in three twinkle groups.
  const stars = [canvas(), canvas(), canvas()]
  for (let i = 0; i < 70; i++) {
    const x = Math.floor(rnd() * (W / P)), y = Math.floor(rnd() * 44)
    if (Math.abs(x - 128) < 8 && Math.abs(y - 16) < 8) continue
    stars[i % 3].put(i % 5 ? '#d3c6aa' : '#a7c080', x, y)
  }
  const starGroups = stars.map((s, i) => `<g style="animation:tw ${[2.4, 3.2, 4][i]}s steps(1,end) -${i}s infinite">${s.svg()}</g>`).join('')

  // Fire: three drawn frames of flame columns, each shown a third of a 0.6 s cycle.
  const FRAMES = [[2, 4, 7, 9, 6, 3], [3, 6, 8, 7, 5, 2], [2, 5, 6, 9, 8, 4]]
  const flames = FRAMES.map((cols, k) => {
    const c = canvas()
    cols.forEach((h, i) => {
      const x = FX - 3 + i
      for (let j = 0; j < h; j++) {
        const y = GROUND - 3 - j
        const color = j >= h - 1 ? '#e67e80' : j >= h - 3 || i === 0 || i === cols.length - 1 ? '#e69875' : j >= 2 ? '#dbbc7f' : '#fff3c4'
        c.put(color, x, y)
      }
    })
    return `<g style="animation:frame 0.6s steps(1,end) -${(k * 0.2).toFixed(1)}s infinite">${c.svg()}</g>`
  }).join('')

  // Sparks rise one pixel per tick and fade.
  let sparks = ''
  for (let i = 0; i < 8; i++) {
    const rise = 22 + Math.floor(rnd() * 10), dur = onTick(rise * TICK)
    sparks += `<rect x="${(FX - 2 + Math.floor(rnd() * 5)) * P}" y="${(GROUND - 10) * P}" width="${P}" height="${P}" fill="${i % 2 ? '#dbbc7f' : '#e69875'}" style="animation:spark${rise} ${dur}s steps(${rise},end) -${onTick(rnd() * dur)}s infinite"/>`
  }
  const sparkCss = [...new Set(sparks.match(/spark\d+/g))].map((n) => `@keyframes ${n}{from{transform:translate(0,0);opacity:1}to{transform:translate(0,-${Number(n.slice(5)) * P}px);opacity:0}}`).join('')

  return svgDoc({
    defs:
      `<radialGradient id="fireGlow"><stop offset="0" stop-color="#e69875" stop-opacity=".35"/><stop offset="1" stop-color="#e69875" stop-opacity="0"/></radialGradient>`,
    css:
      `@keyframes tw{0%{opacity:1}50%{opacity:.2}}` +
      `@keyframes frame{0%{opacity:1}33.333%{opacity:0}}` +
      `@keyframes blink{0%{opacity:1}95%{opacity:0}97.5%{opacity:1}}` +
      `@keyframes shut{0%{opacity:0}95%{opacity:1}97.5%{opacity:0}}` +
      `@keyframes glow{0%{opacity:.85}25%{opacity:1}50%{opacity:.9}75%{opacity:1}}` +
      sparkCss,
    body:
      back.svg() + starGroups +
      `<circle cx="${FX * P}" cy="${(GROUND - 4) * P}" r="340" fill="url(#fireGlow)" style="animation:glow 1.2s steps(1,end) infinite"/>` +
      `<g style="animation:blink 4s steps(1,end) infinite">${owlEyes.svg()}</g>` +
      `<g style="animation:shut 4s steps(1,end) infinite">${owlShut.svg()}</g>` +
      flames + sparks,
  })
}
