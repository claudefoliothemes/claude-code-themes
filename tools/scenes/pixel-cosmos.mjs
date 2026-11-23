// Pixel-art deep space: a dithered nebula, a banded ringed planet, a cratered moon, the curve of a
// big blue planet in the corner, a little rocket cruising past with a flickering flame, tumbling
// asteroids, twinkling stars, and a shooting star now and then. Drawn on a 200 x 125 grid of
// 8-unit pixels. Every change lands on the shared 0.1 s tick.
import { H, W, rng, svgDoc } from './_lib.mjs'
import { pixelGrid } from './_pixel.mjs'

const P = 8, COLS = W / P, ROWS = H / P
const INK = '#0b0718'
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]

export default function scene() {
  const rnd = rng(0xc05305)
  const px = pixelGrid(COLS, ROWS)

  // Deep space, then two nebula clouds blended in with an ordered dither.
  px.gradient(0, ROWS, ['#07061a', '#0b0a24', '#100d2e', '#0d0b28'])
  const cloud = (cx, cy, rx, ry, shades) => {
    for (let y = Math.max(0, cy - ry); y < Math.min(ROWS, cy + ry); y++) for (let x = Math.max(0, cx - rx); x < Math.min(COLS, cx + rx); x++) {
      const dx = (x - cx) / rx, dy = (y - cy) / ry
      const wob = 0.18 * Math.sin(x / 5 + y / 9) + 0.12 * Math.sin(y / 4 - x / 11)
      const d = 1 - Math.sqrt(dx * dx + dy * dy) + wob
      if (d <= 0) continue
      const level = d * shades.length * 1.4 + BAYER[y % 4][x % 4] / 16 - 0.5
      const i = Math.min(shades.length - 1, Math.floor(level))
      if (i >= 0) px.set(x, y, shades[i])
    }
  }
  cloud(52, 40, 60, 30, ['#1a1240', '#2a1656', '#3f1d6a', '#5a2478', '#7a3186'])
  cloud(150, 92, 56, 26, ['#0f1a3e', '#13284e', '#173a5e', '#1d5070', '#26687e'])

  // Static stars (the twinkling ones are on layers).
  const STAR = ['#5a5a8a', '#8a8ab8', '#c8c8f0']
  for (let i = 0; i < 160; i++) px.set(Math.floor(rnd() * COLS), Math.floor(rnd() * ROWS), STAR[i % 3])

  // The big blue planet curving up from the bottom left corner, with a lit rim and clouds.
  const BX = -20, BY = 150, BR = 62
  for (let y = 80; y < ROWS; y++) for (let x = 0; x < 60; x++) {
    const d = Math.hypot(x - BX, y - BY)
    if (d > BR) continue
    const rim = BR - d, light = (x - BX) / BR + (BY - y) / BR
    let c = '#16326a'
    if (light > 1.05) c = '#1f4a8a'
    if (light > 1.2) c = '#2c64a8'
    if (rim < 1.2) c = '#9fd8ff'
    else if (rim < 2.4) c = '#5aa8e0'
    if (rim > 3 && (Math.sin(x / 3 + y / 6) + Math.sin(x / 7 - y / 2)) > 1.3) c = light > 1.1 ? '#e6f2ff' : '#8fb0d8'
    px.set(x, y, c)
  }

  // The ringed planet: back half of the ring, banded sphere with shading, front half of the ring.
  const RX = 166, RY = 42, RR = 17
  const ring = (front) => {
    for (let a = 0; a < 360; a += 0.5) {
      const t = (a * Math.PI) / 180, s = Math.sin(t)
      if (front ? s < 0 : s >= 0) continue
      for (const [k, c] of [[31, '#8a6a9a'], [30, '#b89890'], [29, '#d8b89a'], [28, '#f0d8b0'], [27, '#e8c8a0'], [26, '#8a6a7a'], [25, '#c8a080'], [24, '#b89078']]) {
        const x = RX + Math.cos(t) * k, y = RY + s * k * 0.28 - Math.cos(t) * k * 0.12
        if (front || Math.hypot(x - RX, y - RY) > RR + 0.3) px.set(x, y, c)
      }
    }
  }
  ring(false)
  const BANDS = ['#e8a86a', '#d88a5a', '#f0c48a', '#c8704a', '#e8b07a', '#d07a52', '#f0c890']
  for (let y = -RR; y <= RR; y++) for (let x = -RR; x <= RR; x++) {
    if (x * x + y * y > RR * RR + RR * 0.8) continue
    const band = BANDS[Math.min(BANDS.length - 1, Math.floor(((y + x * 0.25 + RR) / (RR * 2 + 1)) * BANDS.length))]
    const shade = (x + y * 0.6) / RR
    let c = band
    if (shade > 0.55 + BAYER[(y + 40) % 4][(x + 40) % 4] / 32) c = '#6a3a4a'
    else if (shade > 0.3 + BAYER[(y + 40) % 4][(x + 40) % 4] / 32) c = '#9a5a52'
    if (shade < -0.75 && x * x + y * y < (RR - 2) * (RR - 2)) c = '#fff0d0'
    px.set(RX + x, RY + y, c)
  }
  ring(true)

  // A small cratered moon off to the left of the ringed planet.
  const MX = 188, MY = 13, MR = 6
  px.disc(MX, MY, MR, '#8a8aa8'); px.disc(MX + 1, MY + 1, MR - 1, '#6a6a88'); px.disc(MX - 1, MY - 1, MR - 2, '#b8b8d0')
  for (const [dx, dy, r] of [[-2, -2, 1], [2, 1, 1], [-1, 3, 0], [3, -3, 0]]) { px.disc(MX + dx, MY + dy, r, '#7a7a98'); px.set(MX + dx - 1, MY + dy - 1, '#d8d8ec') }
  px.set(MX - 3, MY - 4, '#ececfa'); px.set(MX - 4, MY - 3, '#ececfa')

  // A far-off space station: a tiny ring with a blinking light (the light is on a layer).
  px.rect(178, 100, 9, 1, '#6a7088'); px.rect(182, 97, 1, 7, '#6a7088'); px.rect(180, 99, 5, 3, '#9aa3b5'); px.rect(181, 100, 3, 1, '#ffd27a')

  // Moving layers.
  const layer = () => pixelGrid(COLS, ROWS)
  const frames = (grids, period, name = `f${grids.length}`) => grids.map((g, k) => `<g style="animation:${name} ${period}s steps(1,end) -${((k * period) / grids.length).toFixed(1)}s infinite">${g.svg(P)}</g>`).join('')

  // Twinkling stars: three groups, each with a 5-pixel sparkle.
  const twinkle = [0, 1, 2].map(() => layer())
  for (let i = 0; i < 27; i++) {
    const g = twinkle[i % 3], x = Math.floor(rnd() * COLS), y = Math.floor(rnd() * (ROWS - 20)), c = i % 4 === 0 ? '#ffe6a0' : '#ffffff'
    g.set(x, y, c); if (i % 2 === 0) { g.set(x - 1, y, '#8a8ab8'); g.set(x + 1, y, '#8a8ab8'); g.set(x, y - 1, '#8a8ab8'); g.set(x, y + 1, '#8a8ab8') }
  }

  // The rocket: an original little ship drawn once, with three flame frames; the whole group glides
  // across on a 24 s loop.
  const rocket = layer(), flames = [0, 1, 2].map(() => layer())
  const R0 = 30, RYc = 70
  const ROCKET = [
    '......ww......',
    '.....wWWw.....',
    '....wWWWWw....',
    '...wWWbbWWw...',
    '...wWbBBbWw...',
    '...wWbBBbWw...',
    '...wWWbbWWw...',
    '...wWWWWWWw...',
    '..rwWWWWWWwr..',
    '.rrwWWrrWWwrr.',
    'rrr.wWWWWw.rrr',
    'rr...dddd...rr',
  ]
  const ROCKET_PAL = { w: '#9aa3b5', W: '#e8ecf4', b: '#3a6aa8', B: '#9fd8ff', r: '#e04a5a', d: '#5a6278' }
  // Drawn turned on its side (nose to the right).
  ROCKET.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== '.') rocket.set(R0 + (ROCKET.length - 1 - y), RYc - 7 + x, ROCKET_PAL[ch]) }))
  const FLAME = ['#fff3c4', '#ffd166', '#ff8a4a', '#e04a5a']
  flames.forEach((g, k) => {
    const len = [5, 7, 4][k]
    for (let i = 0; i < len; i++) for (let j = -1; j <= 1; j++) if (Math.abs(j) <= Math.max(0, 1 - Math.floor(i / 3))) g.set(R0 - 1 - i, RYc - 1 + j + 1, FLAME[Math.min(3, Math.floor((i / len) * 4))])
    g.set(R0 - 1, RYc - 1, '#ffd166'); g.set(R0 - 1, RYc + 1, '#ffd166')
  })

  // Asteroids: lumpy rocks that tumble through four poses while they drift.
  const rock = (g, cx, cy, r, turn) => {
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
      const a = Math.atan2(y, x) + turn, lump = r * (0.9 + 0.1 * Math.sin(a * 2) + 0.06 * Math.cos(a * 3)) + 0.4
      const d = Math.hypot(x, y)
      if (d > lump) continue
      g.set(cx + x, cy + y, d > lump - 1 ? '#3a3450' : x + y < -r * 0.4 ? '#a89cb0' : x + y > r * 0.5 ? '#4a4258' : '#6e6480')
    }
    const k = Math.round(Math.cos(turn) * r * 0.4), m = Math.round(Math.sin(turn) * r * 0.4)
    g.set(cx + k, cy + m, '#4a4258'); g.set(cx - m, cy + k, '#4a4258')
  }
  // Each one is drawn mid-screen and slides right to left, one art pixel per step.
  const ROCKS = [
    { y: 96, r: 5, period: 1.6, step: 0.5, delay: 20 },
    { y: 108, r: 4, period: 1.2, step: 0.4, delay: 70 },
    { y: 58, r: 3, period: 0.8, step: 0.6, delay: 100 },
    { y: 20, r: 2, period: 0.8, step: 0.6, delay: 30 },
  ]
  let rocks = ''
  for (const s of ROCKS) {
    const poses = [0, 1, 2, 3].map((k) => { const g = layer(); rock(g, 100, s.y, s.r, (k * Math.PI) / 4); return g })
    const dur = +(225 * s.step).toFixed(1)
    rocks += `<g style="animation:drift ${dur}s steps(225,end) -${s.delay}s infinite">${frames(poses, s.period)}</g>`
  }

  // A blinking light on the station and a shooting star.
  const beacon = layer(); beacon.set(182, 96, '#ff5a5f')
  const meteor = layer()
  for (let i = 0; i < 10; i++) meteor.set(40 + i, 12 + Math.floor(i / 2), i > 7 ? '#ffffff' : i > 4 ? '#c8c8f0' : '#5a5a8a')

  return svgDoc({
    defs: `<radialGradient id="glow"><stop offset="0" stop-color="#ffd8a0" stop-opacity=".16"/><stop offset="1" stop-color="#ffd8a0" stop-opacity="0"/></radialGradient>`,
    css:
      `@keyframes f3{0%{opacity:1}33.333%{opacity:0}}@keyframes f4{0%{opacity:1}25%{opacity:0}}` +
      `@keyframes fly{0%{transform:translate(-400px,40px)}100%{transform:translate(2000px,-120px)}}` +
      `@keyframes drift{0%{transform:translate(900px,-24px)}100%{transform:translate(-900px,24px)}}` +
      `@keyframes beacon{0%{opacity:1}10%{opacity:0}}` +
      `@keyframes shoot{0%{opacity:0;transform:translate(0,0)}91%{opacity:1;transform:translate(0,0);animation-timing-function:steps(5,end)}96%{opacity:1;transform:translate(520px,260px);animation-timing-function:steps(1,end)}97%{opacity:0;transform:translate(520px,260px)}100%{opacity:0;transform:translate(520px,260px)}}`,
    body:
      px.svg(P) + `<circle cx="${RX * P}" cy="${RY * P}" r="320" fill="url(#glow)"/>` +
      frames(twinkle, 2.4) + rocks +
      `<g style="animation:beacon 2s steps(1,end) infinite">${beacon.svg(P)}</g>` +
      `<g style="animation:shoot 10s steps(1,end) infinite">${meteor.svg(P)}</g>` +
      `<g style="animation:fly 24s steps(240,end) -3.6s infinite">${rocket.svg(P)}${frames(flames, 0.3)}</g>`,
  })
}
