// A cozy pixel-art cat café in Catppuccin colors, shared by the Mocha (night) and Latte (day) themes:
// an arched window with drifting clouds over the rooftops (stars and a crescent moon at night), a
// cat on the sill swishing her tail, a siamese kitten asleep in a mug, a tuxedo kitten batting a
// rolling ball of yarn on the rug, an orange tabby and a calico who blink and swish, a gray tabby
// asleep on a shelf, steaming coffee, pendant lamps, and twinkling string lights.
// Palettes from catppuccin/palette (MIT). Original characters on a 200 x 125 grid of 8-unit pixels.
// Every change lands on the shared 0.1 s tick.
import { H, W, rng, svgDoc } from './_lib.mjs'
import { pixelGrid } from './_pixel.mjs'

const P = 8, COLS = W / P, ROWS = H / P
export const CATPPUCCIN = {
  mocha: {
    rosewater: '#f5e0dc', flamingo: '#f2cdcd', pink: '#f5c2e7', mauve: '#cba6f7', red: '#f38ba8', maroon: '#eba0ac', peach: '#fab387', yellow: '#f9e2af',
    green: '#a6e3a1', teal: '#94e2d5', sky: '#89dceb', sapphire: '#74c7ec', blue: '#89b4fa', lavender: '#b4befe', text: '#cdd6f4', subtext1: '#bac2de',
    subtext0: '#a6adc8', overlay2: '#9399b2', overlay1: '#7f849c', overlay0: '#6c7086', surface2: '#585b70', surface1: '#45475a', surface0: '#313244',
    base: '#1e1e2e', mantle: '#181825', crust: '#11111b',
  },
  latte: {
    rosewater: '#dc8a78', flamingo: '#dd7878', pink: '#ea76cb', mauve: '#8839ef', red: '#d20f39', maroon: '#e64553', peach: '#fe640b', yellow: '#df8e1d',
    green: '#40a02b', teal: '#179299', sky: '#04a5e5', sapphire: '#209fb5', blue: '#1e66f5', lavender: '#7287fd', text: '#4c4f69', subtext1: '#5c5f77',
    subtext0: '#6c6f85', overlay2: '#7c7f93', overlay1: '#8c8fa1', overlay0: '#9ca0b0', surface2: '#acb0be', surface1: '#bcc0cc', surface0: '#ccd0da',
    base: '#eff1f5', mantle: '#e6e9ef', crust: '#dce0e8',
  },
}
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
// Blend color a toward color b by t.
const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('')

// Cat shapes as row half-widths (row -> half width), centered on x = 0, ground at y = 0.
const SIT = { head: { '-15': 3, '-14': 4, '-13': 5, '-12': 5, '-11': 5, '-10': 5, '-9': 4, '-8': 3 }, body: { '-8': 3, '-7': 4, '-6': 4, '-5': 5, '-4': 5, '-3': 5, '-2': 5, '-1': 5, '0': 4 } }
const KIT = { head: { '-12': 3, '-11': 4, '-10': 4, '-9': 4, '-8': 4, '-7': 3 }, body: { '-7': 2, '-6': 3, '-5': 3, '-4': 3, '-3': 4, '-2': 4, '-1': 4, '0': 3 } }
const TAILS = [[[5, -1], [6, -2], [7, -3], [7, -4], [7, -5], [6, -6]], [[5, -1], [6, -1], [7, -2], [8, -3], [8, -4], [8, -5]], [[5, 0], [6, 0], [7, 0], [8, -1], [9, -2], [9, -3]]]
const EYE = '#11111b', SPARK = '#ffffff', NOSE = '#f29ab0', BLUSH = '#f5a6bd'

// Sprite map helpers: cells "x,y" -> color, an outline pass, and a blit onto a grid.
const sprite = () => {
  const m = new Map()
  const put = (x, y, c) => { if (c) m.set(`${x},${y}`, c) }
  return { m, put, rect: (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(x + i, y + j, c) } }
}
const outline = (m, c) => {
  const add = []
  for (const k of m.keys()) {
    const [x, y] = k.split(',').map(Number)
    for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!m.has(`${x + ox},${y + oy}`)) add.push(`${x + ox},${y + oy}`)
  }
  for (const k of add) m.set(k, c)
  return m
}
const blit = (g, m, x, y) => { for (const [k, c] of m) { const [lx, ly] = k.split(',').map(Number); g.set(x + lx, y + ly, c) } }
function split(frames, common, layers, x, y) {
  const shared = new Map()
  for (const [k, c] of frames[0]) if (frames.every((m) => m.get(k) === c)) shared.set(k, c)
  blit(common, shared, x, y)
  frames.forEach((m, i) => blit(layers[i], new Map([...m].filter(([k]) => !shared.has(k))), x, y))
}

// A front-facing sitting cat (or kitten, or a back view). coat.paint(x, y) can return a pattern color.
function cat({ coat, out, kit = false, back = false, tail = 0, blink = false, paw = false, rim = null }) {
  const { m, put } = sprite()
  const shape = kit ? KIT : SIT, paint = (x, y) => (coat.paint && coat.paint(x, y, kit)) || coat.body
  const tails = kit ? TAILS.map((t) => t.slice(0, 4).map(([x, y]) => [x - 1, y])) : TAILS
  tails[tail].forEach(([x, y]) => put(x, y, coat.tail || coat.dark || coat.body))
  for (const part of ['body', 'head']) for (const [ys, hw] of Object.entries(shape[part])) { const y = Number(ys); for (let x = -hw; x <= hw; x++) put(x, y, paint(x, y)) }
  const ht = Math.min(...Object.keys(shape.head).map(Number))
  const ear = kit ? [[-4, -1], [-3, -1], [-2, -1], [-4, -2], [-3, -2], [-4, -3]] : [[-5, -1], [-4, -1], [-3, -1], [-5, -2], [-4, -2], [-5, -3]]
  for (const s of [-1, 1]) ear.forEach(([x, y]) => put(s * x, ht + y, coat.ears || paint(s * x, ht + y)))
  if (!back) {
    const ey = kit ? -10 : -12, ex = kit ? [-3, 1] : [-3, 2], ny = kit ? -8 : -10
    for (const s of [-1, 1]) put(s * (kit ? 3 : 4), ht + (kit ? 0 : 1) + 0, null)
    for (const s of [-1, 1]) put(s * (kit ? 3 : 4), ht - 1, NOSE)
    for (const x0 of ex) {
      if (blink) { put(x0, ey, paint(x0, ey)); put(x0 + 1, ey, paint(x0 + 1, ey)); put(x0, ey + 1, out); put(x0 + 1, ey + 1, out) }
      else { put(x0, ey, EYE); put(x0 + 1, ey, SPARK); put(x0, ey + 1, EYE); put(x0 + 1, ey + 1, EYE) }
    }
    put(0, ny, NOSE); put(-1, ny + 1, out); put(1, ny + 1, out)
    put(kit ? -4 : -4, ny, BLUSH); put(kit ? 4 : 4, ny, BLUSH)
    if (coat.light) { for (let y = ny + 3; y <= -1; y++) for (let x = -1; x <= 1; x++) put(x, y, coat.light) }
    const pw = coat.paws || coat.light || coat.body
    put(-3, 0, pw); put(-2, 0, pw); put(2, 0, pw); put(3, 0, pw)
    if (paw) { put(-3, 0, paint(-3, 0)); put(-2, 0, paint(-2, 0)); put(-5, -3, pw); put(-6, -4, pw); put(-6, -5, pw) }
  }
  outline(m, out)
  if (rim) for (const [ys] of Object.entries({ ...shape.head, ...shape.body })) { const y = Number(ys); const hw = (shape.head[ys] ?? 0) > (shape.body[ys] ?? 0) ? shape.head[ys] : shape.body[ys]; put(hw, y, rim) }
  return m
}
// A cat asleep in a loaf, facing right, chest rising with breath.
function loaf({ coat, out, breath = 0 }) {
  const { m, put } = sprite()
  const B = { '-6': 4, '-5': 6, '-4': 7, '-3': 8, '-2': 8, '-1': 8, '0': 7 }
  if (breath) B['-7'] = 3
  const paint = (x, y) => (coat.paint && coat.paint(x, y, false)) || coat.body
  for (const [ys, hw] of Object.entries(B)) { const y = Number(ys); for (let x = 8 - hw; x <= 8 + hw; x++) put(x, y, paint(x, y)) }
  const HD = { '-8': 2, '-7': 3, '-6': 3, '-5': 4, '-4': 3, '-3': 3, '-2': 2 }
  for (const [ys, hw] of Object.entries(HD)) { const y = Number(ys); for (let x = 16 - hw; x <= 16 + hw; x++) put(x, y, coat.body) }
  for (const [x, y] of [[14, -9], [14, -10], [15, -9], [18, -9], [18, -10], [17, -9]]) put(x, y, coat.body)
  put(15, -5, out); put(16, -4, out); put(17, -5, out); put(19, -4, NOSE); put(18, -3, BLUSH)
  for (const x of [14, 15, 16, 17]) put(x, 0, coat.dark || coat.body); put(18, -1, coat.dark || coat.body)
  put(11, 0, coat.light || coat.body); put(12, 0, coat.light || coat.body)
  return outline(m, out)
}
// A kitten asleep in a big mug with a heart on it.
function mugCat({ coat, out, mug }) {
  const { m, put, rect } = sprite()
  const paint = (x, y) => (coat.paint && coat.paint(x - 7, y + 5, true)) || coat.body
  for (const [ys, hw] of Object.entries(KIT.head)) { const y = Number(ys) - 5; for (let x = 7 - hw; x <= 7 + hw; x++) put(x, y, paint(x, y)) }
  for (const [x, y] of [[3, -18], [4, -18], [5, -18], [3, -19], [4, -19], [3, -20], [11, -18], [10, -18], [9, -18], [11, -19], [10, -19], [11, -20]]) put(x, y, coat.ears || coat.body)
  for (const [x, y] of [[4, -15], [5, -14], [6, -15], [8, -15], [9, -14], [10, -15]]) put(x, y, out)
  put(7, -13, NOSE); put(3, -13, BLUSH); put(11, -13, BLUSH); put(4, -18, NOSE); put(10, -18, NOSE)
  rect(0, -11, 15, 12, mug.body); rect(0, -11, 15, 1, mug.rim); rect(1, 0, 13, 1, mug.shade); rect(1, -10, 1, 9, mug.rim)
  for (const [x, y] of [[15, -9], [16, -9], [17, -8], [17, -7], [17, -6], [16, -5], [15, -5]]) put(x, y, mug.body)
  ;['.x.x.', 'xxxxx', '.xxx.', '..x..'].forEach((row, j) => [...row].forEach((ch, i) => { if (ch === 'x') put(5 + i, -7 + j, mug.heart) }))
  const pw = coat.paws || coat.body
  put(3, -11, pw); put(4, -11, pw); put(10, -11, pw); put(11, -11, pw)
  return outline(m, out)
}

export function catCafe(flavor) {
  const C = CATPPUCCIN[flavor], night = flavor === 'mocha'
  const rnd = rng(night ? 0xca7a : 0x1a77e)
  const px = pixelGrid(COLS, ROWS), front = pixelGrid(COLS, ROWS)
  const layer = () => pixelGrid(COLS, ROWS)
  const frames = (grids, period, extra = '') => grids.map((g, k) => `<g style="animation:f${grids.length} ${period}s steps(1,end) -${(((grids.length - k) % grids.length) * period / grids.length).toFixed(1)}s infinite${extra}">${g.svg(P)}</g>`).join('')
  const OUT = night ? C.crust : C.text
  const wall = C.base, stripe = night ? mix(C.base, C.mantle, 0.6) : mix(C.base, C.mantle, 0.7)
  const wood = mix(C.peach, night ? C.base : '#ffffff', night ? 0.76 : 0.74), wood2 = mix(C.peach, night ? C.base : '#ffffff', night ? 0.82 : 0.8), seam = night ? mix(C.peach, C.crust, 0.85) : mix(C.peach, '#ffffff', 0.58)

  // Wall with soft stripes, wainscot, plank floor, rug.
  px.rect(0, 0, COLS, 93, wall)
  for (let x = 2; x < COLS; x += 7) px.rect(x, 0, 2, 78, stripe)
  px.rect(0, 78, COLS, 15, C.surface0); px.rect(0, 78, COLS, 1, C.surface1); px.rect(0, 79, COLS, 1, mix(C.surface1, C.surface2, 0.5))
  for (let x = 6; x < COLS; x += 16) { px.rect(x, 82, 12, 8, mix(C.surface0, C.surface1, 0.35)); px.rect(x, 82, 12, 1, mix(C.surface0, C.mantle, 0.5)) }
  for (let y = 93; y < ROWS; y++) {
    const r = Math.floor((y - 93) / 4), off = (r * 23) % 31
    for (let x = 0; x < COLS; x++) px.set(x, y, (y - 93) % 4 === 3 ? seam : (Math.floor((x + off) / 31) % 2 ? wood : wood2))
    if ((y - 93) % 4 !== 3) px.set((off + 15) % COLS, y, seam)
  }
  px.ellipse(112, 114, 38, 7, mix(C.pink, C.base, night ? 0.45 : 0.35)); px.ellipse(112, 114, 35, 5, mix(C.mauve, C.base, night ? 0.5 : 0.55))
  for (let x = 82; x < 144; x += 6) px.set(x, 114, mix(C.pink, C.base, 0.2))

  // The arched window: sky, rooftops outside, moon or nothing, then the frame on top of the clouds.
  const WX = 48, WR = 28, WT = 10, WB = 69, AY = WT + WR
  const inner = (y) => { if (y < WT || y > WB) return null; if (y >= AY - 6) return [WX - WR + 2, WX + WR - 2]; const dy = AY - 6 - y, h = Math.floor(Math.sqrt(Math.max(0, (WR - 2) ** 2 - dy * dy))); return h > 0 ? [WX - h, WX + h] : null }
  const skyStops = night ? [C.crust, C.mantle, mix(C.base, C.lavender, 0.12), mix(C.base, C.lavender, 0.28)] : [mix(C.sky, C.base, 0.45), mix(C.sky, C.base, 0.62), mix(C.lavender, C.base, 0.78), mix(C.base, '#ffffff', 0.5)]
  const skyAt = (y) => { const t = ((y - WT) / (WB - WT)) * (skyStops.length - 1), i = Math.min(skyStops.length - 2, Math.floor(t)); return t - i < 0.5 ? skyStops[i] : skyStops[i + 1] }
  for (let y = WT; y <= WB; y++) { const s = inner(y); if (s) px.rect(s[0], y, s[1] - s[0] + 1, 1, skyAt(y)) }
  if (night) { px.disc(64, 24, 5, C.yellow); px.disc(66, 22, 4, null); for (let y = 18; y <= 27; y++) for (let x = 62; x <= 71; x++) if ((x - 66) ** 2 + (y - 22) ** 2 <= 17 && px.get(x, y) === C.yellow) px.set(x, y, skyAt(y)) }
  // Rooftops outside, lit windows at night.
  const roofC = night ? C.mantle : mix(C.blue, C.base, 0.72), roofW = night ? C.yellow : mix(C.blue, C.base, 0.55)
  for (let x = WX - WR + 2, i = 0; x <= WX + WR - 2; i++) {
    const w = 6 + Math.floor(rnd() * 6), top = 52 + Math.floor(rnd() * 8)
    for (let xx = x; xx < Math.min(x + w, WX + WR - 1); xx++) px.rect(xx, top, 1, WB - top + 1, roofC)
    px.rect(x, top, Math.min(w, WX + WR - 1 - x), 1, mix(roofC, night ? C.surface1 : '#ffffff', 0.4))
    for (let y = top + 2; y < WB - 1; y += 3) for (let xx = x + 1; xx < x + w - 1 && xx < WX + WR - 2; xx += 2) if (rnd() < (night ? 0.35 : 0.3)) px.set(xx, y, night && rnd() < 0.3 ? C.peach : roofW)
    x += w + 1
  }
  // Stars that twinkle (night), and clouds that drift past, clipped to the window.
  const stars = [0, 1, 2].map(() => layer())
  if (night) for (let i = 0; i < 26; i++) { const y = WT + 2 + Math.floor(rnd() * 36), s = inner(y); if (!s) continue; const x = s[0] + Math.floor(rnd() * (s[1] - s[0])); if (Math.abs(x - WX) < 2 || y === 40 || px.get(x, y) !== skyAt(y)) continue; px.set(x, y, mix(C.rosewater, C.base, 0.35)); stars[i % 3].set(x, y, i % 2 ? C.yellow : C.rosewater) }
  const clouds = layer(), cloudC = night ? mix(C.surface0, C.base, 0.3) : '#ffffff', cloudS = night ? C.surface0 : mix(C.lavender, '#ffffff', 0.8)
  const puff = (x, y, w) => { clouds.ellipse(x, y, w, 2, cloudC); clouds.ellipse(x - Math.floor(w / 3), y - 2, Math.floor(w / 2), 2, cloudC); clouds.rect(x - w + 1, y + 2, 2 * w - 1, 1, cloudS) }
  for (const dx of [0, 60]) for (const [x, y, w] of [[26, 30, 6], [50, 24, 5], [66, 36, 7]]) puff(x + dx, y, w)
  // Frame, mullions, and sill in front of the clouds.
  const frameC = night ? C.surface1 : C.surface2, frameL = night ? C.surface2 : C.surface0
  for (let y = WT - 2; y <= WB + 1; y++) {
    const s = inner(Math.min(Math.max(y, WT), WB)), o = y < AY - 6 ? (() => { const dy = AY - 6 - y, h = Math.floor(Math.sqrt(Math.max(0, WR ** 2 - dy * dy))); return h > 0 ? [WX - h, WX + h] : null })() : [WX - WR, WX + WR]
    if (!o) continue
    for (let x = o[0]; x <= o[1]; x++) if (!s || x < s[0] || x > s[1] || y < WT || y > WB) front.set(x, y, x < WX ? frameL : frameC)
  }
  front.rect(WX - 1, WT, 2, WB - WT + 1, frameC); front.rect(WX - WR + 2, 40, 2 * WR - 3, 2, frameC); front.rect(WX - 1, WT, 1, WB - WT + 1, frameL)
  front.rect(WX - WR - 4, 70, 2 * WR + 9, 3, frameC); front.rect(WX - WR - 4, 70, 2 * WR + 9, 1, frameL)

  // String lights along the top over the window, twinkling.
  const bulbs = [0, 1, 2].map(() => layer()), BULB = [C.pink, C.peach, C.yellow, C.green, C.sky, C.mauve]
  const sag = (x) => 3 + Math.round(4 * Math.sin((Math.PI * (x % 46)) / 46))
  for (let x = 0; x < 96; x++) px.set(x, sag(x), night ? C.surface2 : C.overlay1)
  for (let x = 3, i = 0; x < 96; x += 5, i++) { px.set(x, sag(x) + 1, mix(BULB[i % 6], C.base, 0.55)); bulbs[i % 3].set(x, sag(x) + 1, BULB[i % 6]); bulbs[i % 3].set(x, sag(x) + 2, mix(BULB[i % 6], C.base, 0.3)) }

  // Plants on the sill.
  const pot = (x, w, c) => { front.rect(x, 64, w, 6, c); front.rect(x - 1, 64, w + 2, 1, mix(c, '#ffffff', 0.25)); front.rect(x, 69, w, 1, mix(c, '#000000', 0.3)) }
  pot(20, 7, C.maroon); for (const [x, y, r] of [[23, 60, 3], [21, 57, 2], [26, 58, 2], [24, 55, 2]]) front.disc(x, y, r, y < 58 ? C.green : C.teal)
  pot(70, 7, C.peach); for (const [x, y] of [[71, 62], [73, 61], [75, 63], [69, 66], [77, 67], [68, 70], [78, 72], [67, 73]]) { front.set(x, y, C.green); front.set(x + 1, y, C.teal) }

  // Shelves on the right with books, jars, and plants.
  const shelf = (y) => { px.rect(96, y, 76, 2, C.surface1); px.rect(96, y, 76, 1, C.surface2); px.rect(100, y + 2, 2, 3, C.surface1); px.rect(166, y + 2, 2, 3, C.surface1) }
  shelf(28); shelf(50)
  ;[[C.mauve, 7], [C.blue, 8], [C.peach, 6], [C.green, 8], [C.pink, 7]].forEach(([c, h], i) => { px.rect(100 + i * 3, 28 - h, 3, h, c); px.rect(100 + i * 3, 28 - h, 3, 1, mix(c, '#ffffff', 0.3)); px.set(101 + i * 3, 25 - Math.floor(h / 2), mix(c, '#000000', 0.25)) })
  px.rect(117, 22, 5, 6, C.teal); px.rect(121, 23, 2, 3, C.teal); px.rect(117, 22, 5, 1, mix(C.teal, '#ffffff', 0.35))
  px.rect(158, 23, 7, 5, C.flamingo); for (const [x, y] of [[159, 21], [161, 20], [163, 21], [157, 26], [165, 29], [156, 30], [166, 32]]) { px.set(x, y, C.green); px.set(x + 1, y, C.teal) }
  px.rect(100, 41, 6, 9, mix(C.lavender, C.base, 0.5)); px.rect(100, 40, 6, 1, C.lavender); for (const [x, y] of [[101, 46], [103, 44], [104, 47]]) px.set(x, y, C.peach)
  px.rect(108, 44, 5, 6, C.yellow); px.rect(109, 42, 3, 2, C.yellow); px.rect(124, 43, 6, 7, C.sapphire); px.rect(124, 43, 6, 1, mix(C.sapphire, '#ffffff', 0.3))
  px.rect(156, 44, 6, 6, C.peach); px.rect(158, 39, 2, 5, C.green); px.set(157, 41, C.green); px.set(160, 40, C.green)

  // Cat tree on the far right.
  const post = mix(C.peach, C.base, night ? 0.55 : 0.4), carpet = mix(C.mauve, C.base, night ? 0.45 : 0.35)
  px.rect(186, 38, 4, 54, post); for (let y = 40; y < 92; y += 3) px.rect(186, y, 4, 1, mix(post, '#000000', 0.2))
  px.rect(178, 88, 22, 5, carpet); px.rect(176, 60, 24, 3, carpet); px.rect(178, 36, 22, 3, carpet)
  for (const y of [88, 60, 36]) px.rect(177, y, 24, 1, mix(carpet, '#ffffff', 0.25))

  // Café table with the mug kitten, a steaming cup, and a cookie.
  const tableC = mix(C.peach, night ? C.crust : C.text, night ? 0.6 : 0.45)
  px.rect(6, 96, 54, 3, tableC); px.rect(6, 96, 54, 1, mix(tableC, '#ffffff', 0.2)); px.rect(10, 99, 3, 26, tableC); px.rect(53, 99, 3, 26, tableC)
  px.rect(41, 89, 7, 7, C.lavender); px.rect(41, 89, 7, 1, mix(C.lavender, '#ffffff', 0.35)); px.rect(48, 91, 2, 3, C.lavender); px.rect(42, 90, 5, 1, mix(C.peach, '#000000', 0.45))
  px.ellipse(54, 95, 3, 1, C.yellow); px.set(53, 95, mix(C.yellow, '#000000', 0.4)); px.set(55, 94, mix(C.yellow, '#000000', 0.4))
  const steam = [0, 1, 2].map((k) => { const g = layer(); for (let i = 0; i < 3; i++) g.set(43 + ((i + k) % 2) * 2, 86 - i * 2 - k, mix(C.text, C.base, 0.45)); return g })

  // The cats.
  const T = {
    black: { body: '#42435a', dark: '#36374b', ears: null },
    gray: { body: C.overlay2, dark: mix(C.overlay2, '#000000', 0.25), light: mix(C.overlay2, '#ffffff', 0.5), paint: (x, y) => ((y % 2 === 0 && Math.abs(x) >= 3) || (y <= -14 && x === 0) ? mix(C.overlay2, '#000000', 0.25) : null) },
    orange: { body: '#fab387', dark: '#e08a5a', light: '#fff1e6', paint: (x, y, kit) => ((y % 2 === 0 && Math.abs(x) >= (kit ? 2 : 3)) || (y === (kit ? -12 : -15) && Math.abs(x) <= 1) ? '#e08a5a' : null) },
    calico: { body: '#f7ede4', dark: '#3a3044', light: '#ffffff', tail: '#e8935e', paint: (x, y) => (x < 0 && y <= -11 ? '#e8935e' : x > 1 && y <= -13 ? '#3a3044' : x > 1 && y >= -6 && y <= -3 ? '#3a3044' : x < -1 && y >= -4 ? '#e8935e' : null) },
    siamese: { body: '#f4e8da', dark: '#6e5448', ears: '#6e5448', paws: '#6e5448', paint: (x, y, kit) => (Math.abs(x) <= 1 && y >= (kit ? -9 : -11) && y <= (kit ? -7 : -9) ? '#8a6c5e' : null) },
    tux: { body: '#2a2a3c', dark: '#22222f', light: '#f4f2f8', paws: '#f4f2f8', paint: (x, y, kit) => (Math.abs(x) <= 1 && y >= (kit ? -8 : -10) && y <= (kit ? -7 : -9) ? '#f4f2f8' : null) },
  }
  // Window cat, seen from behind, tail swishing.
  const winCat = [0, 1, 2, 1].map((t) => cat({ coat: night ? T.black : T.gray, out: OUT, back: true, tail: t, rim: night ? mix(C.lavender, C.base, 0.2) : null }))
  const winL = [0, 1, 2, 3].map(() => layer()); split(winCat, front, winL, 40, 69)
  // Gray tabby asleep on the top shelf, breathing.
  const loafL = [0, 1].map(() => layer()); split([0, 1].map((b) => loaf({ coat: T.gray, out: OUT, breath: b })), px, loafL, 128, 27)
  // Orange tabby on the lower shelf and a calico on the cat tree: tails swish, eyes blink.
  const swish = [0, 1, 2, 3].map(() => layer()), lids = [layer(), layer()]
  ;[[T.orange, 142, 49, 0], [T.calico, 188, 35, 1]].forEach(([coat, x, y, i]) => {
    split([0, 1, 2, 1].map((t) => cat({ coat, out: OUT, tail: t })), px, swish.map((g, k) => swish[(k + i * 2) % 4]), x, y)
    const shut = cat({ coat, out: OUT, blink: true }), open = cat({ coat, out: OUT })
    blit(lids[i], new Map([...shut].filter(([k, c]) => open.get(k) !== c)), x, y)
  })
  // Siamese kitten asleep in a mug, with Zzz.
  blit(px, mugCat({ coat: { body: '#f6ece2', ears: '#f6ece2', paws: '#ffffff' }, out: OUT, mug: { body: C.peach, rim: mix(C.peach, '#ffffff', 0.4), shade: mix(C.peach, '#000000', 0.25), heart: C.pink } }), 18, 95)
  const zee = (g, x, y) => { g.rect(x, y, 3, 1, mix(C.text, C.base, 0.2)); g.set(x + 1, y + 1, mix(C.text, C.base, 0.2)); g.rect(x, y + 2, 3, 1, mix(C.text, C.base, 0.2)) }
  const zzz = [0, 1, 2, 3].map((k) => { const g = layer(); for (let i = 0; i < k; i++) zee(g, 31 + i * 4, 72 - i * 4); return g })
  // Tuxedo kitten on the rug batting a rolling ball of yarn.
  const kitL = [0, 1].map(() => layer()); split([true, false].map((paw) => cat({ coat: T.tux, out: OUT, kit: true, paw, tail: paw ? 1 : 2 })), px, kitL, 116, 116)
  const yarn = [0, 1].map((k) => { const g = layer(); g.disc(104, 114, 2, C.mauve); g.set(103 + k * 2, 113, C.lavender); g.set(104, 115 - k, C.lavender); g.set(105 - k * 2, 114, mix(C.mauve, '#000000', 0.25)); for (let x = 106; x < 112; x++) g.set(x, 116, C.mauve); return g })

  const glow = night ? C.yellow : C.peach
  return svgDoc({
    defs: `<radialGradient id="lamp"><stop offset="0" stop-color="${glow}" stop-opacity="${night ? 0.3 : 0.18}"/><stop offset="1" stop-color="${glow}" stop-opacity="0"/></radialGradient>` +
      `<clipPath id="pane"><rect x="${(WX - WR + 2) * P}" y="${(AY - 18) * P}" width="${(2 * WR - 3) * P}" height="${(WB - AY + 18) * P}"/></clipPath>`,
    css:
      `@keyframes f2{0%{opacity:1}50%{opacity:0}}@keyframes f3{0%{opacity:1}33.333%{opacity:0}}@keyframes f4{0%{opacity:1}25%{opacity:0}}` +
      `@keyframes lid{0%{opacity:0}95%{opacity:1}}@keyframes drift{0%{transform:translate(0,0)}100%{transform:translate(-480px,0)}}` +
      `@keyframes roll{0%{transform:translate(0,0)}50%{transform:translate(-48px,0)}}`,
    body:
      px.svg(P) + frames(stars, 2.4) +
      `<g clip-path="url(#pane)"><g style="animation:drift 60s steps(60,end) infinite">${clouds.svg(P)}</g></g>` +
      front.svg(P) + frames(winL, 1.6) + frames(bulbs, 1.8) + frames(loafL, 2.4) + frames(swish, 2.4) +
      `<g style="animation:lid 4s steps(1,end) -1s infinite">${lids[0].svg(P)}</g><g style="animation:lid 6s steps(1,end) -3s infinite">${lids[1].svg(P)}</g>` +
      frames(steam, 1.2) + frames(zzz, 3.2) + frames(kitL, 2.4) +
      `<g style="animation:roll 2.4s steps(6,end) infinite">${frames(yarn, 0.4)}</g>` +
      [[112, 16], [160, 16]].map(([x, y]) => `<circle cx="${x * P}" cy="${(y + 4) * P}" r="190" fill="url(#lamp)"/>` +
        `<path d="M${x * P} 0V${(y - 3) * P}" stroke="${night ? C.surface2 : C.overlay1}" stroke-width="8"/><path d="M${(x - 5) * P} ${(y + 1) * P}L${(x - 2) * P} ${(y - 3) * P}H${(x + 2) * P}L${(x + 5) * P} ${(y + 1) * P}Z" fill="${C.mauve}"/><rect x="${(x - 5) * P}" y="${(y + 1) * P}" width="${10 * P}" height="${P}" fill="${mix(C.mauve, '#000000', 0.25)}"/><rect x="${(x - 1) * P}" y="${(y + 2) * P}" width="${2 * P}" height="${P}" fill="${C.yellow}"/>`).join(''),
  })
}
