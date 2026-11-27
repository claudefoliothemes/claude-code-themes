// A pixel-art dog park at golden hour full of dachshunds of every coat and size: smooth,
// long-haired, and wire-haired, in red, cream, black and tan, chocolate, wild boar, and dapple, from
// large to mini, plus puppies. A pack races along the path with a puppy tagging behind, a dapple and
// her puppy chase a bouncing ball, two touch noses while hearts float up, two puppies hop and play
// beside their sleeping mom, and the rest stand wagging. Chibi eyes with a sparkle and a blush.
// Original characters on a 200 x 125 grid of 8-unit pixels. Every change lands on the 0.1 s tick.
import { H, W, rng, svgDoc } from './_lib.mjs'
import { pixelGrid, shadedDisc } from './_pixel.mjs'

const P = 8, COLS = W / P, ROWS = H / P
const EYE = '#140c0c', NOSE = '#1a1012', SPARK = '#ffffff', BLUSH = '#ff8aa8', TONGUE = '#ff7a9a'
const COATS = {
  red: { body: '#c8692e', shade: '#9a4a1e', light: '#e8904e', out: '#3a1a0c' },
  cream: { body: '#f2d8a6', shade: '#d6b07a', light: '#fff2d2', out: '#6a4a26' },
  blacktan: { body: '#2c2428', shade: '#1a1418', light: '#4a3e44', tan: '#c8843a', out: '#0c0809' },
  choc: { body: '#6e3c22', shade: '#4c2614', light: '#8e5634', tan: '#d09048', out: '#24100a' },
  boar: { body: '#7c6c5a', shade: '#5a4a3a', light: '#ab9c88', out: '#261c14' },
  dapple: { body: '#3a3238', shade: '#262026', light: '#5a5058', tan: '#c8843a', spot: '#b0aab8', out: '#0e0a0c' },
}
// Torso length and height, snout length. Every size shares one big chibi head, so puppies look
// mostly head and the large dogs look long.
const SIZES = { large: { L: 22, T: 7, SN: 5 }, std: { L: 18, T: 6, SN: 4 }, mini: { L: 14, T: 5, SN: 3 }, pup: { L: 9, T: 4, SN: 2 } }
const HW = 6, HH = 5
const GAIT = [['reach', 'reach'], ['mid', 'mid'], ['tuck', 'tuck'], ['mid', 'mid']]
const TAILS = [[[2, -1], [1, -2], [1, -3], [0, -4]], [[2, -1], [1, -2], [0, -3], [-1, -3]], [[2, -1], [1, -1], [0, -2], [-1, -2]]]
const SPECKS = [[0.15, 1], [0.3, 2], [0.45, 1], [0.6, 2], [0.25, 3], [0.55, 3], [0.8, 1], [0.4, 2], [0.7, 3]]

// One dachshund facing right as a map of local cells ("x,y" -> color), ground at y = 0.
// legs: 'stand', a gallop frame 0-3, or 'lie'. tail: 0 up, 1 mid, 2 out. breath: lying chest rise.
function doxie({ pal, hair = 'smooth', size = 'std', legs = 'stand', tail = 0, breath = 0, dy = 0 }) {
  const m = new Map()
  const put = (x, y, c) => { if (c) m.set(`${x},${y + dy}`, c) }
  const rect = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(x + i, y + j, c) }
  const del = (x, y) => m.delete(`${x},${y + dy}`)
  const { body, shade, light, tan, spot } = pal

  if (legs === 'lie') {
    rect(3, -5, 17, 5, body); del(3, -5); del(19, -5); del(3, -1)
    if (breath) rect(6, -6, 10, 1, body)
    rect(5, -5 - breath, 11, 1, light)
    rect(19, -9, 6, 6, body); del(19, -9); del(24, -9)
    rect(25, -5, 3, 2, body); put(28, -5, NOSE); rect(20, -3, 7, 1, body)
    if (tan) { rect(24, -3, 4, 1, tan); put(22, -9, tan) }
    rect(22, -1, 6, 1, tan || body)
    put(21, -7, EYE); put(22, -6, EYE); put(23, -7, EYE); put(22, -5, BLUSH)
    rect(18, -8, 3, 7, shade); put(18, -1, light); put(20, -1, light)
    for (const [x, y] of [[2, -3], [1, -3], [0, -2], [0, -1], [1, -1]]) put(x, y, body)
  } else {
    const { L, T, SN } = SIZES[size], pup = size === 'pup'
    const xE = 3 + L - 1, top = -(T + 1), hb = top - 2, ht = hb - HH + 1, hx = xE, ex = hx + 3
    const FRONT = { reach: [[xE, -1], [xE + 1, 0]], mid: [[xE - 1, -1], [xE - 1, 0]], tuck: [[xE - 2, -1], [xE - 3, 0]] }
    const BACK = { reach: [[4, -1], [3, 0]], mid: [[5, -1], [5, 0]], tuck: [[6, -1], [7, 0]] }
    const legCells = (cells, c, dx = 0) => cells.forEach(([x, y]) => rect(x + dx, y, 2, 1, tan || c))
    // Far legs (in shade), then the long torso, then the near legs.
    const [fp, bp] = legs === 'stand' ? ['mid', 'mid'] : GAIT[(legs + 1) % 4]
    legCells(FRONT[fp], shade, pup ? -1 : -2); legCells(BACK[bp], shade, pup ? 1 : 2)
    rect(3, top, L, T, body); del(3, top); del(3, -2)
    rect(5, top, L - 5, 1, light); rect(6, -2, Math.max(1, L - 8), 1, shade)
    rect(xE - 2, hb, 4, top - hb + 1, body)
    // A big round head, short tapered snout, nose, sparkly eye, blush.
    rect(hx, ht, HW, HH, body); del(hx, ht); del(hx + HW - 1, ht)
    rect(hx + HW, hb - 2, SN - 1, 1, body); rect(hx + HW, hb - 1, SN, 1, body); rect(hx + 1, hb, HW + SN - 2, 1, body)
    put(hx + HW + SN - 1, hb - 1, NOSE)
    if (tan) { rect(ex, ht, 2, 1, tan); rect(hx + HW - 1, hb, SN, 1, tan); rect(xE - 1, top + 2, 2, Math.max(1, T - 3), tan) }
    rect(ex, ht + 1, 2, 2, EYE); put(ex + 1, ht + 1, SPARK); put(ex - 1, ht + 3, BLUSH)
    if (legs !== 'stand') { put(hx + HW + 1, hb + 1, TONGUE); put(hx + HW + 1, hb + 2, TONGUE) }
    const [nf, nb] = legs === 'stand' ? ['mid', 'mid'] : GAIT[legs]
    legCells(FRONT[nf], body); legCells(BACK[nb], body)
    const tailCells = TAILS[tail].slice(0, pup ? 3 : 4).map(([x, y]) => [x, top + y])
    tailCells.forEach(([x, y]) => put(x, y, body))
    if (hair === 'long') {
      for (let x = 6; x < xE - 2; x++) if (x % 3) put(x, -1, x % 2 ? shade : light)
      tailCells.forEach(([x, y], i) => { put(x, y + 1, i % 2 ? light : shade); if (i > 1) put(x - 1, y + 1, light) })
      const eb = hb + (pup ? 1 : 2)
      rect(hx - 1, ht + 1, 3, eb - ht, shade); put(hx - 1, eb + 1, light); put(hx + 1, eb + 1, light); put(hx, eb, shade)
    } else if (hair === 'wire') {
      rect(hx + HW, hb + 1, SN - 1, 1, light); put(hx + HW + 1, hb + 2, light)
      rect(ex - 1, ht, 3, 1, light)
      for (const [fx, fy] of SPECKS) if (fy < T - 1) put(3 + Math.round(fx * L), top + fy, light)
      rect(hx, ht + 1, 2, HH - 1, shade)
    } else {
      const eb = hb + (pup ? 1 : 2)
      rect(hx, ht + 1, 2, eb - ht, shade); del(hx, eb)
    }
    if (spot) for (const [fx, fy] of SPECKS) if (fy < T) put(3 + Math.round(fx * L) + 1, top + fy, spot)
  }
  // Outline every empty cell that touches the dog.
  const outline = []
  for (const k of m.keys()) {
    const [x, y] = k.split(',').map(Number)
    for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!m.has(`${x + ox},${y + oy}`)) outline.push(`${x + ox},${y + oy}`)
  }
  for (const k of outline) m.set(k, pal.out)
  return m
}
const blit = (g, m, x, base, flip = false) => { for (const [k, c] of m) { const [lx, ly] = k.split(',').map(Number); g.set(flip ? x - lx : x + lx, base + ly, c) } }
// Split an animated dog into the cells every frame shares and the cells each frame adds.
function split(frames, common, layers, x, base, flip = false) {
  const keys = new Set(frames.flatMap((m) => [...m.keys()]))
  const shared = new Map()
  for (const k of keys) { const c = frames[0].get(k); if (c && frames.every((m) => m.get(k) === c)) shared.set(k, c) }
  blit(common, shared, x, base, flip)
  frames.forEach((m, i) => blit(layers[i], new Map([...m].filter(([k]) => !shared.has(k))), x, base, flip))
}

export default function scene() {
  const rnd = rng(0xd0c5)
  const px = pixelGrid(COLS, ROWS)
  const layer = () => pixelGrid(COLS, ROWS)
  // Frame k of n shows at time k * period / n.
  const frames = (grids, period) => grids.map((g, k) => `<g style="animation:f${grids.length} ${period}s steps(1,end) -${(((grids.length - k) % grids.length) * period / grids.length).toFixed(1)}s infinite">${g.svg(P)}</g>`).join('')

  // Golden-hour sky, a low sun, soft clouds, rolling hills.
  px.gradient(0, 64, ['#2a2456', '#4a3070', '#7a3e7e', '#b85a7a', '#e8845e', '#f6b06a'])
  px.disc(96, 56, 10, '#ffd890'); px.disc(96, 56, 7, '#fff0c0')
  for (const [x, y, r] of [[30, 16, 4], [36, 15, 5], [42, 17, 3], [140, 24, 4], [146, 22, 5], [153, 24, 4], [118, 10, 3], [123, 9, 4]]) shadedDisc(px, x, y, r, ['#b06a8a', '#e8a0b0', '#ffd0d0'])
  for (let x = 0; x < COLS; x++) {
    const far = Math.round(56 + 4 * Math.sin(x / 13) + 2 * Math.sin(x / 5)); px.rect(x, far, 1, 70 - far, '#5a5a86')
    const near = Math.round(63 + 3 * Math.sin(x / 19 + 1)); px.rect(x, near, 1, 76 - near, '#3e6a5e')
  }
  // Trees behind the fence.
  const tree = (x, top) => {
    px.rect(x - 2, top + 8, 4, 70 - top, '#5a3a2a'); px.rect(x - 2, top + 8, 1, 70 - top, '#7a5236')
    for (const [dx, dy, r] of [[0, 0, 11], [-8, 6, 8], [8, 5, 9], [-3, 9, 8], [5, 11, 7]]) shadedDisc(px, x + dx, top + dy, r, ['#24503a', '#2e6a44', '#4a8a52'])
  }
  tree(16, 30); tree(184, 34)
  // Grass, a picket fence, bushes, a dirt path, flowers.
  px.gradient(74, ROWS, ['#5a9a4a', '#4a8a44', '#3e7a3e', '#346a38'])
  for (let x = 0; x < COLS; x += 4) { px.rect(x, 65, 2, 11, '#f0e6d4'); px.rect(x + 1, 65, 1, 11, '#c8bca8'); px.set(x, 64, '#f0e6d4') }
  px.rect(0, 67, COLS, 1, '#e0d4c0'); px.rect(0, 72, COLS, 1, '#e0d4c0')
  for (const x of [4, 34, 62, 120, 150, 176, 196]) shadedDisc(px, x, 76, 4, ['#2a5a34', '#3a7a40', '#5a9a50'])
  for (let x = 0; x < COLS; x++) {
    const top = 100 + Math.round(Math.sin(x / 7) * 0.8), bot = 111 + Math.round(Math.sin(x / 9 + 2) * 0.8)
    px.rect(x, top, 1, bot - top, '#c9a46e')
    if (rnd() < 0.3) px.set(x, top + 1 + Math.floor(rnd() * (bot - top - 2)), rnd() < 0.5 ? '#b08a58' : '#ddb984')
  }
  for (let i = 0; i < 160; i++) {
    const x = Math.floor(rnd() * COLS), y = 78 + Math.floor(rnd() * (ROWS - 78))
    if (px.get(x, y) === '#c9a46e' || px.get(x, y) === '#b08a58' || px.get(x, y) === '#ddb984') continue
    if (i % 5 === 0) px.set(x, y, ['#ffd0e0', '#fff2a0', '#ffffff', '#ff9ab8'][i % 4])
    else { px.set(x, y, '#6aaa52'); px.set(x, y - 1, '#6aaa52') }
  }
  // A water bowl and a bone.
  px.rect(46, 96, 6, 2, '#3a6ac8'); px.rect(47, 98, 4, 1, '#2a4a98'); px.rect(47, 95, 4, 1, '#8ac8ff')
  px.rect(99, 94, 6, 1, '#f4eee0'); px.rect(98, 93, 1, 3, '#f4eee0'); px.rect(105, 93, 1, 3, '#f4eee0')

  // Standing dogs wagging their tails: a standard and a mini touching noses, a large wire and a
  // long-haired black and tan watching from the sides.
  const wag = [0, 1, 2, 3].map(() => layer())
  const standers = [
    [COATS.red, 'smooth', 'std', 52, 88, false], [COATS.cream, 'long', 'mini', 107, 88, true],
    [COATS.boar, 'wire', 'large', 4, 98, false], [COATS.blacktan, 'long', 'std', 194, 98, true],
  ]
  standers.forEach(([pal, hair, size, x, base, flip], i) => {
    const order = [0, 1, 2, 1]
    split([0, 1, 2, 3].map((k) => doxie({ pal, hair, size, tail: order[(k + i) % 4] })), px, wag, x, base, flip)
  })
  // Mom asleep in a dog bed, chest rising and falling.
  px.ellipse(141, 81, 15, 4, '#8a2a3a'); px.ellipse(141, 81, 13, 3, '#c84a5a')
  const sleep = [0, 1].map(() => layer())
  split([0, 1].map((b) => doxie({ pal: COATS.choc, hair: 'long', legs: 'lie', breath: b })), px, sleep, 125, 83)
  px.rect(127, 83, 29, 2, '#8a2a3a'); px.rect(128, 83, 27, 1, '#a83a4a')
  // Her two puppies hopping and play-wagging in front of the bed, a beat apart.
  const hop = [0, 1, 2, 3].map(() => layer()), HOP = [0, -1, -2, -1]
  ;[[COATS.cream, 'smooth', 122, false, 0], [COATS.choc, 'long', 161, true, 2]].forEach(([pal, hair, x, flip, off]) => {
    split([0, 1, 2, 3].map((k) => doxie({ pal, hair, size: 'pup', tail: [0, 1, 2, 1][(k + off) % 4], dy: HOP[(k + off) % 4] })), px, hop, x, 97, flip)
  })
  // Hearts floating up between the nose-to-nose pair, and Zzz over mom.
  const heart = (g, x, y, c) => { ['.xx.xx.', 'xxxxxxx', 'xxxxxxx', '.xxxxx.', '..xxx..', '...x...'].forEach((row, j) => [...row].forEach((ch, i) => { if (ch === 'x') g.set(x - 3 + i, y + j, c) })); g.set(x - 2, y + 1, '#ffe0ea') }
  const hearts = [0, 1, 2, 3].map((k) => { const g = layer(); if (k < 3) heart(g, 82, 68 - k * 3, k === 2 ? '#ff8ab0' : '#ff5a8a'); return g })
  const zee = (g, x, y) => { g.rect(x, y, 3, 1, '#ece8ff'); g.set(x + 1, y + 1, '#ece8ff'); g.rect(x, y + 2, 3, 1, '#ece8ff') }
  const zzz = [0, 1, 2, 3].map((k) => { const g = layer(); for (let i = 0; i < k; i++) zee(g, 152 + i * 4, 68 - i * 4); return g })

  // A pack racing along the path, large to mini, with a puppy tagging behind, each a beat apart.
  const packCommon = layer(), pack = [0, 1, 2, 3].map(() => layer())
  ;[[COATS.red, 'smooth', 'pup', 4], [COATS.cream, 'wire', 'mini', 30], [COATS.red, 'long', 'std', 62], [COATS.blacktan, 'smooth', 'large', 98]].forEach(([pal, hair, size, x], i) => {
    split([0, 1, 2, 3].map((k) => doxie({ pal, hair, size, legs: (k + i) % 4, tail: (k + i) % 2 ? 2 : 1 })), packCommon, pack, x, 108)
  })
  // A dapple chasing a bouncing ball the other way, her dapple puppy close behind.
  const chaseCommon = layer(), chase = [0, 1, 2, 3].map(() => layer())
  split([0, 1, 2, 3].map((k) => doxie({ pal: COATS.dapple, legs: k, tail: k % 2 ? 2 : 1 })), chaseCommon, chase, 46, 121, true)
  split([0, 1, 2, 3].map((k) => doxie({ pal: COATS.dapple, size: 'pup', legs: (k + 2) % 4, tail: k % 2 ? 1 : 2 })), chaseCommon, chase, 72, 121, true)
  const ball = [0, -2, -3, -2].map((dy) => { const g = layer(); g.disc(10, 118 + dy, 2, '#e83a3a'); g.rect(9, 120 + dy, 3, 1, '#a82a2a'); g.set(9, 117 + dy, '#ffb0b0'); return g })

  return svgDoc({
    css:
      `@keyframes f2{0%{opacity:1}50%{opacity:0}}@keyframes f4{0%{opacity:1}25%{opacity:0}}` +
      `@keyframes pack{0%{transform:translate(-1120px,0)}100%{transform:translate(1600px,0)}}` +
      `@keyframes chase{0%{transform:translate(1600px,0)}100%{transform:translate(-608px,0)}}`,
    body:
      px.svg(P) + frames(wag, 0.4) + frames(sleep, 2.4) + frames(hop, 0.8) + frames(hearts, 2.4) + frames(zzz, 3.2) +
      `<g style="animation:pack 17s steps(170,end) -7s infinite">${packCommon.svg(P)}${frames(pack, 0.4)}</g>` +
      `<g style="animation:chase 13.8s steps(138,end) -6s infinite">${chaseCommon.svg(P)}${frames(chase, 0.4)}${frames(ball, 0.8)}</g>`,
  })
}
