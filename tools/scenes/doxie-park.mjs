// A pixel-art dog park at golden hour full of dachshunds of every coat: smooth, long-haired, and
// wire-haired, in red, cream, black and tan, chocolate, wild boar, and dapple. A pack races along the
// path, one chases a bouncing ball, two touch noses while hearts float up, others stand wagging,
// and one sleeps in a dog bed. Original characters on a 200 x 125 grid of 8-unit pixels. Every
// change lands on the shared 0.1 s tick.
import { H, W, rng, svgDoc } from './_lib.mjs'
import { pixelGrid, shadedDisc } from './_pixel.mjs'

const P = 8, COLS = W / P, ROWS = H / P
const EYE = '#140c0c', NOSE = '#1a1012'
const COATS = {
  red: { body: '#c8692e', shade: '#9a4a1e', light: '#e8904e', out: '#3a1a0c' },
  cream: { body: '#f2d8a6', shade: '#d6b07a', light: '#fff2d2', out: '#6a4a26' },
  blacktan: { body: '#2c2428', shade: '#1a1418', light: '#4a3e44', tan: '#c8843a', out: '#0c0809' },
  choc: { body: '#6e3c22', shade: '#4c2614', light: '#8e5634', tan: '#d09048', out: '#24100a' },
  boar: { body: '#7c6c5a', shade: '#5a4a3a', light: '#ab9c88', out: '#261c14' },
  dapple: { body: '#3a3238', shade: '#262026', light: '#5a5058', tan: '#c8843a', spot: '#b0aab8', out: '#0e0a0c' },
}
// Gallop leg poses (cells two wide, hip then paw), and the four-beat cycle. Legs are two cells
// tall under a six-cell body: long and low.
const FRONT = { reach: [[20, -1], [21, 0]], mid: [[19, -1], [19, 0]], tuck: [[18, -1], [17, 0]] }
const BACK = { reach: [[4, -1], [3, 0]], mid: [[5, -1], [5, 0]], tuck: [[6, -1], [7, 0]] }
const GAIT = [['reach', 'reach'], ['mid', 'mid'], ['tuck', 'tuck'], ['mid', 'mid']]
const TAILS = [[[2, -7], [1, -8], [1, -9], [0, -10]], [[2, -7], [1, -8], [0, -9], [-1, -9]], [[2, -7], [1, -7], [0, -8], [-1, -8]]]

// One dachshund facing right as a map of local cells ("x,y" -> color), ground at y = 0.
// legs: 'stand', a gallop frame 0-3, or 'lie'. tail: 0 up, 1 mid, 2 out. breath: lying chest rise.
function doxie({ pal, hair = 'smooth', legs = 'stand', tail = 0, breath = 0 }) {
  const m = new Map()
  const put = (x, y, c) => { if (c) m.set(`${x},${y}`, c) }
  const rect = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(x + i, y + j, c) }
  const del = (x, y) => m.delete(`${x},${y}`)
  const { body, shade, light, tan, spot } = pal
  const legCells = (cells, c, dx = 0) => cells.forEach(([x, y]) => { rect(x + dx, y, 2, 1, tan || c) })

  if (legs === 'lie') {
    rect(3, -5, 17, 5, body); del(3, -5); del(19, -5); del(3, -1)
    if (breath) rect(6, -6, 10, 1, body)
    rect(5, -5 - breath, 11, 1, light)
    rect(19, -8, 5, 5, body); del(19, -8); del(23, -8)
    rect(24, -5, 3, 3, body); put(27, -4, body); put(27, -5, NOSE)
    if (tan) { rect(24, -3, 4, 1, tan); put(22, -8, tan) }
    rect(22, -1, 6, 1, tan || body)
    put(21, -6, EYE); put(22, -6, EYE)
    rect(19, -7, 2, 6, shade)
    if (hair === 'long') { put(18, -1, light); put(20, -1, shade) }
    for (const [x, y] of [[2, -3], [1, -3], [0, -2], [0, -1], [1, -1]]) put(x, y, body)
  } else {
    // Far legs (in shade), then the long torso, then the near legs.
    const [fp, bp] = legs === 'stand' ? ['mid', 'mid'] : GAIT[(legs + 1) % 4]
    legCells(FRONT[fp], tan ? shade : shade, -2); legCells(BACK[bp], shade, 2)
    rect(3, -7, 18, 6, body); del(3, -7); del(3, -2)
    rect(5, -7, 13, 1, light); rect(6, -2, 10, 1, shade)
    // Neck, domed head, tapered snout, nose, eye.
    rect(19, -10, 3, 3, body)
    rect(21, -13, 5, 4, body); del(21, -13); del(25, -13)
    rect(26, -11, 3, 1, body); rect(26, -10, 4, 1, body); rect(22, -9, 7, 1, body)
    put(29, -11, NOSE); put(24, -12, EYE)
    if (legs !== 'stand') { put(27, -8, '#ff7a9a'); put(27, -7, '#ff7a9a') }
    if (tan) { put(24, -13, tan); rect(25, -9, 4, 1, tan); rect(19, -5, 2, 3, tan) }
    const [nf, nb] = legs === 'stand' ? ['mid', 'mid'] : GAIT[legs]
    legCells(FRONT[nf], body); legCells(BACK[nb], body)
    TAILS[tail].forEach(([x, y]) => put(x, y, body))
    if (hair === 'long') {
      for (let x = 6; x < 17; x++) if (x % 3) put(x, -1, x % 2 ? shade : light)
      TAILS[tail].forEach(([x, y], i) => { put(x, y + 1, i % 2 ? light : shade); if (i > 1) put(x - 1, y + 1, light) })
      rect(20, -12, 3, 8, shade); put(20, -5, light); put(22, -5, light); put(21, -4, shade); del(22, -4)
    } else if (hair === 'wire') {
      rect(26, -8, 3, 1, light); put(27, -7, light)
      rect(23, -14, 3, 1, light)
      for (const [x, y] of [[6, -6], [9, -5], [12, -6], [15, -5], [8, -3], [13, -3], [17, -6], [11, -4]]) put(x, y, light)
      rect(21, -12, 2, 4, shade)
    } else {
      rect(21, -12, 2, 6, shade); put(21, -6, shade); del(22, -6)
    }
    if (spot) for (const [x, y] of [[7, -5], [11, -6], [14, -4], [9, -3], [5, -5], [24, -11], [17, -6], [12, -4]]) put(x, y, spot)
  }
  // Outline every empty cell that touches the dog.
  const outline = []
  for (const k of m.keys()) {
    const [x, y] = k.split(',').map(Number)
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!m.has(`${x + dx},${y + dy}`)) outline.push(`${x + dx},${y + dy}`)
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
  px.rect(38, 96, 6, 2, '#3a6ac8'); px.rect(39, 98, 4, 1, '#2a4a98'); px.rect(39, 95, 4, 1, '#8ac8ff')
  px.rect(160, 93, 6, 1, '#f4eee0'); px.rect(159, 92, 1, 3, '#f4eee0'); px.rect(166, 92, 1, 3, '#f4eee0')

  // Standing dogs wagging their tails: two touching noses, two watching from the sides.
  const wagCommon = px, wag = [0, 1, 2, 3].map(() => layer())
  const standers = [
    [COATS.red, 'smooth', 52, 88, false], [COATS.cream, 'long', 112, 88, true],
    [COATS.boar, 'wire', 6, 98, false], [COATS.blacktan, 'long', 194, 98, true],
  ]
  standers.forEach(([pal, hair, x, base, flip], i) => {
    const order = [0, 1, 2, 1]
    split([0, 1, 2, 3].map((k) => doxie({ pal, hair, tail: order[(k + i) % 4] })), wagCommon, wag, x, base, flip)
  })
  // The sleeper in a dog bed, chest rising and falling.
  px.ellipse(141, 85, 15, 4, '#8a2a3a'); px.ellipse(141, 85, 13, 3, '#c84a5a')
  const sleep = [0, 1].map(() => layer())
  split([0, 1].map((b) => doxie({ pal: COATS.choc, hair: 'long', legs: 'lie', breath: b })), px, sleep, 126, 87)
  px.rect(127, 87, 29, 2, '#8a2a3a'); px.rect(128, 87, 27, 1, '#a83a4a')
  // Hearts floating up between the nose-to-nose pair, and Zzz over the sleeper.
  const heart = (g, x, y, c) => { ['.xx.xx.', 'xxxxxxx', 'xxxxxxx', '.xxxxx.', '..xxx..', '...x...'].forEach((row, j) => [...row].forEach((ch, i) => { if (ch === 'x') g.set(x - 3 + i, y + j, c) })); g.set(x - 2, y + 1, '#ffe0ea') }
  const hearts = [0, 1, 2, 3].map((k) => { const g = layer(); if (k < 3) heart(g, 82, 68 - k * 3, k === 2 ? '#ff8ab0' : '#ff5a8a'); return g })
  const zee = (g, x, y) => { g.rect(x, y, 3, 1, '#ece8ff'); g.set(x + 1, y + 1, '#ece8ff'); g.rect(x, y + 2, 3, 1, '#ece8ff') }
  const zzz = [0, 1, 2, 3].map((k) => { const g = layer(); for (let i = 0; i < k; i++) zee(g, 150 + i * 4, 76 - i * 4); return g })

  // A pack racing along the path, legs in a four-beat gallop, each a beat apart.
  const packCommon = layer(), pack = [0, 1, 2, 3].map(() => layer())
  ;[[COATS.blacktan, 'smooth', 10], [COATS.red, 'long', 50], [COATS.cream, 'wire', 90]].forEach(([pal, hair, x], i) => {
    split([0, 1, 2, 3].map((k) => doxie({ pal, hair, legs: (k + i) % 4, tail: (k + i) % 2 ? 2 : 1 })), packCommon, pack, x, 108)
  })
  // A dapple chasing a bouncing ball the other way along the front of the lawn.
  const chaseCommon = layer(), chase = [0, 1, 2, 3].map(() => layer())
  split([0, 1, 2, 3].map((k) => doxie({ pal: COATS.dapple, legs: k, tail: k % 2 ? 2 : 1 })), chaseCommon, chase, 46, 121, true)
  const ball = [0, -2, -3, -2].map((dy) => { const g = layer(); g.disc(10, 118 + dy, 2, '#e83a3a'); g.rect(9, 120 + dy, 3, 1, '#a82a2a'); g.set(9, 117 + dy, '#ffb0b0'); return g })

  return svgDoc({
    css:
      `@keyframes f2{0%{opacity:1}50%{opacity:0}}@keyframes f4{0%{opacity:1}25%{opacity:0}}` +
      `@keyframes pack{0%{transform:translate(-960px,0)}100%{transform:translate(1600px,0)}}` +
      `@keyframes chase{0%{transform:translate(1600px,0)}100%{transform:translate(-400px,0)}}`,
    body:
      px.svg(P) + frames(wag, 0.4) + frames(sleep, 2.4) + frames(hearts, 2.4) + frames(zzz, 3.2) +
      `<g style="animation:pack 16s steps(160,end) -7s infinite">${packCommon.svg(P)}${frames(pack, 0.4)}</g>` +
      `<g style="animation:chase 12.5s steps(125,end) -6s infinite">${chaseCommon.svg(P)}${frames(chase, 0.4)}${frames(ball, 0.8)}</g>`,
  })
}
