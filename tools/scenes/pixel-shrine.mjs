// A pixel-art shrine on a spring night: a full moon over snowcapped peaks, a five-tier pagoda with
// lit windows, a vermilion torii gate at the water's edge, cherry trees in bloom, stone lanterns,
// and a lake that mirrors it all. Petals drift down, the moon's reflection shimmers, the lanterns
// flicker, and stars twinkle. Drawn on a 200 x 125 grid of 8-unit pixels.
import { H, W, rng, svgDoc } from './_lib.mjs'
import { pixelGrid, shadedDisc } from './_pixel.mjs'

const P = 8, COLS = W / P, ROWS = H / P // 200 x 125
const SHORE = 97 // first water row

export default function scene() {
  const rnd = rng(0x5a17e)
  const px = pixelGrid(COLS, ROWS)

  // Sky, dithered from deep night down to a pink glow at the horizon.
  px.gradient(0, SHORE, ['#0a0a1e', '#141433', '#211d4d', '#3a2a63', '#5e3772', '#93507f'])

  // Moon with a dithered halo and a few craters.
  const MX = 152, MY = 22
  for (let y = -14; y <= 14; y++) for (let x = -14; x <= 14; x++) {
    const d = Math.hypot(x, y)
    if (d > 10 && d < 14 && (x + y) % 2 === 0) px.set(MX + x, MY + y, '#3d3570')
  }
  px.disc(MX, MY, 9, '#f6e7c8')
  px.disc(MX + 1, MY + 1, 8, '#efdcb6')
  px.disc(MX - 1, MY - 1, 7, '#fbf0d6')
  for (const [x, y, w, h] of [[-4, -3, 2, 2], [2, 1, 3, 3], [-3, 4, 2, 1], [4, -5, 2, 2], [-6, 1, 1, 2]]) px.rect(MX + x, MY + y, w, h, '#e2cca3')

  // Mountains: a far range with snowcaps, then darker nearer hills.
  const ridge = (base, peaks, color, snow) => {
    for (let x = 0; x < COLS; x++) {
      let h = 0
      for (const [px0, ph, pw] of peaks) h = Math.max(h, ph - Math.abs(x - px0) * (ph / pw))
      h = Math.round(h)
      if (h <= 0) continue
      px.rect(x, base - h, 1, h, color)
      if (snow) for (const [px0, ph, pw] of peaks) {
        const top = Math.round(ph - Math.abs(x - px0) * (ph / pw))
        if (top === h && top > ph * 0.72) px.rect(x, base - h, 1, Math.max(1, Math.round((top - ph * 0.72) * 0.9)), snow)
      }
    }
  }
  ridge(SHORE - 6, [[40, 30, 34], [96, 38, 40], [178, 26, 28]], '#3a2f66', '#cfc8ea')
  ridge(SHORE - 2, [[20, 12, 30], [70, 16, 36], [130, 11, 30], [190, 14, 26]], '#261f45', null)

  // Shore and grass.
  px.rect(0, SHORE - 3, COLS, 4, '#1b1530')
  for (let x = 0; x < COLS; x += 2) if (rnd() < 0.5) px.set(x, SHORE - 4, '#2b2347')

  // Pagoda: five tiers, each a body with lit windows under an upswept roof, and a spire.
  const PX = 128
  let base = SHORE - 3
  for (let tier = 0; tier < 5; tier++) {
    const bw = 18 - tier * 3, bh = tier === 0 ? 8 : 6
    const x0 = PX - Math.floor(bw / 2)
    px.rect(x0, base - bh, bw, bh, '#3b2238')
    px.rect(x0, base - bh, 1, bh, '#2a1828')
    for (let wx = x0 + 2; wx < x0 + bw - 2; wx += 3) px.rect(wx, base - bh + 2, 2, 2, '#ffb85c')
    const rw = bw + 8, rx = PX - Math.floor(rw / 2), ry = base - bh - 2
    px.rect(rx, ry, rw, 2, '#1a1020')
    px.rect(rx + 1, ry - 1, rw - 2, 1, '#2a1a2e')
    px.set(rx - 1, ry - 1, '#1a1020'); px.set(rx + rw, ry - 1, '#1a1020')
    px.set(rx - 2, ry - 2, '#1a1020'); px.set(rx + rw + 1, ry - 2, '#1a1020')
    base = ry - 1
  }
  px.rect(PX, base - 7, 1, 7, '#c9a35a'); for (let k = 0; k < 3; k++) px.rect(PX - 1, base - 2 - k * 2, 3, 1, '#c9a35a')

  // Torii gate at the water's edge, on the left.
  const TX = 34
  px.rect(TX - 9, SHORE - 22, 2, 22, '#c8402f'); px.rect(TX + 7, SHORE - 22, 2, 22, '#c8402f')
  px.rect(TX - 9, SHORE - 22, 1, 22, '#9c2f24'); px.rect(TX + 7, SHORE - 22, 1, 22, '#9c2f24')
  px.rect(TX - 12, SHORE - 25, 24, 2, '#c8402f'); px.rect(TX - 13, SHORE - 26, 26, 1, '#2a1416')
  px.set(TX - 14, SHORE - 27, '#2a1416'); px.set(TX + 13, SHORE - 27, '#2a1416')
  px.rect(TX - 10, SHORE - 20, 20, 1, '#c8402f'); px.rect(TX - 1, SHORE - 24, 2, 4, '#2a1416')

  // Stone lanterns (their glow is drawn over the grid so it can flicker).
  const lantern = (x) => {
    px.rect(x - 2, SHORE - 3, 5, 1, '#5d5670'); px.rect(x - 1, SHORE - 7, 3, 4, '#6b6478')
    px.rect(x - 3, SHORE - 9, 7, 2, '#5d5670'); px.rect(x - 2, SHORE - 12, 5, 3, '#6b6478')
    px.set(x, SHORE - 11, '#ffd27a'); px.rect(x - 3, SHORE - 13, 7, 1, '#4d4760'); px.set(x, SHORE - 14, '#4d4760')
  }
  lantern(98); lantern(166)

  // Cherry trees: a big one framing the top left, a smaller one by the pagoda.
  const PINK = ['#b8617f', '#eea2bf', '#ffd2e3']
  const trunk = (pts, w) => { for (let i = 0; i + 1 < pts.length; i++) { const [x1, y1] = pts[i], [x2, y2] = pts[i + 1], n = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)); for (let k = 0; k <= n; k++) px.rect(Math.round(x1 + ((x2 - x1) * k) / n), Math.round(y1 + ((y2 - y1) * k) / n), w, w, '#3a2230') } }
  trunk([[-2, 60], [10, 44], [22, 30], [40, 20], [60, 16]], 3); trunk([[22, 30], [28, 12]], 2); trunk([[10, 44], [4, 30]], 2)
  for (const [x, y, r] of [[8, 8, 9], [24, 4, 8], [40, 10, 9], [56, 6, 7], [66, 14, 6], [14, 22, 7], [30, 18, 7], [48, 20, 6], [2, 30, 6], [70, 4, 5]]) shadedDisc(px, x, y, r, PINK)
  // Speckle the canopies so they read as blossom, not flat circles.
  const speckle = (x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (px.get(x, y) === PINK[1] && rnd() < 0.12) px.set(x, y, rnd() < 0.5 ? PINK[2] : PINK[0]) }
  speckle(0, 0, 80, 40)
  trunk([[184, SHORE - 3], [182, 80], [176, 72]], 2); trunk([[182, 82], [190, 74]], 2)
  for (const [x, y, r] of [[172, 70, 6], [184, 66, 7], [194, 72, 5], [178, 62, 5]]) shadedDisc(px, x, y, r, PINK)
  speckle(164, 54, 199, 80)

  // The lake: mirror the scene above the shore, darkened, with ripple gaps.
  const WATER = ['#141236', '#1a1640']
  for (let y = SHORE; y < ROWS; y++) {
    const src = SHORE - 1 - (y - SHORE) * 1.4
    for (let x = 0; x < COLS; x++) {
      const c = src >= 0 ? px.get(x, Math.floor(src)) : null
      const ripple = (y + Math.floor(x / 7)) % 5 === 0
      px.set(x, y, ripple || !c ? WATER[y % 2] : darken(c))
    }
  }

  // Moving layers: moon shimmer on the water, twinkling stars, falling petals.
  const shimmer = [0, 1, 2].map((k) => {
    const s = pixelGrid(COLS, ROWS)
    for (let y = SHORE + 2; y < ROWS; y += 2) {
      const w = Math.max(2, 10 - Math.floor((y - SHORE) / 4)) + ((y + k) % 3)
      s.rect(MX - Math.floor(w / 2) + ((y * 3 + k * 2) % 5) - 2, y, w, 1, (y + k) % 3 ? '#f6e7c8' : '#cbb994')
    }
    return s
  })
  const stars = [0, 1, 2].map(() => pixelGrid(COLS, ROWS))
  for (let i = 0; i < 60; i++) {
    const x = Math.floor(rnd() * COLS), y = Math.floor(rnd() * 60)
    if (px.get(x, y) && Math.hypot(x - MX, y - MY) > 15 && !(x < 80 && y < 40)) stars[i % 3].set(x, y, i % 4 ? '#e9e4ff' : '#ffd2e3')
  }
  // Wider than the scene: the skew slants the fall, so petals start further right.
  const petals = pixelGrid(COLS + 40, ROWS * 2)
  for (let i = 0; i < 70; i++) {
    const x = Math.floor(rnd() * (COLS + 40)), y = Math.floor(rnd() * ROWS), c = i % 3 ? '#ffc0d9' : '#ff9fc4'
    petals.set(x, y, c); petals.set(x, y + ROWS, c)
    if (i % 4 === 0) { petals.set(x + 1, y, c); petals.set(x + 1, y + ROWS, c) }
  }

  const frames = (grids, period) => grids.map((g, k) => `<g style="animation:f${grids.length} ${period}s steps(1,end) -${((k * period) / grids.length).toFixed(1)}s infinite">${g.svg(P)}</g>`).join('')
  const lampGlow = (x) => `<circle cx="${x * P + 4}" cy="${(SHORE - 11) * P + 4}" r="70" fill="url(#lamp)" style="animation:flicker 1.2s steps(1,end) -${(x % 3) * 0.3}s infinite"/>`

  return svgDoc({
    defs: `<radialGradient id="lamp"><stop offset="0" stop-color="#ffcf7a" stop-opacity=".45"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></radialGradient>`,
    css:
      `@keyframes f3{0%{opacity:1}33.333%{opacity:0}}` +
      `@keyframes flicker{0%{opacity:.8}25%{opacity:1}50%{opacity:.9}75%{opacity:1}}` +
      `@keyframes petals{from{transform:translateY(-${ROWS * P}px)}to{transform:translateY(0)}}`,
    body:
      px.svg(P) + frames(stars, 3.6) + frames(shimmer, 0.9) + lampGlow(98) + lampGlow(166) +
      `<g transform="skewX(-14)"><g style="animation:petals 25s steps(125,end) infinite">${petals.svg(P)}</g></g>`,
  })
}

// Darken a #rrggbb color toward the lake's blue, for reflections.
function darken(hex) {
  const n = parseInt(hex.slice(1), 16)
  const mix = (v, w) => Math.round(v * 0.55 + w * 0.45)
  const r = mix(n >> 16, 0x14), g = mix((n >> 8) & 255, 0x12), b = mix(n & 255, 0x3a)
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}
