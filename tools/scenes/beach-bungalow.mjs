// A cozy pixel-art beach porch at sunset: a hut with a glowing window and string lights, deck
// chairs and a lantern, waves rolling up the sand, the sun shimmering on the water, a palm swaying,
// a lighthouse blinking on the headland, a sailboat drifting, gulls, and a crab scuttling by.
// Drawn on a 200 x 125 grid of 8-unit pixels. Every change lands on the shared 0.1 s tick.
import { H, W, rng, svgDoc } from './_lib.mjs'
import { pixelGrid } from './_pixel.mjs'

const P = 8, COLS = W / P, ROWS = H / P
const HORIZON = 62, SHORE = 88
const INK = '#2a1a28'
const BULBS = ['#ffd27a', '#ff9a7a', '#fff0b0', '#ffb8d0']

export default function scene() {
  const rnd = rng(0xbea4)
  const px = pixelGrid(COLS, ROWS)
  const layer = () => pixelGrid(COLS, ROWS)
  const frames = (grids, period) => grids.map((g, k) => `<g style="animation:f${grids.length} ${period}s steps(1,end) -${((k * period) / grids.length).toFixed(1)}s infinite">${g.svg(P)}</g>`).join('')

  // Sunset sky, the sun half under the horizon, and streaks of cloud.
  px.gradient(0, HORIZON, ['#221f4e', '#2f2866', '#4a3478', '#74427e', '#a8527c', '#d8687a', '#f4866a', '#ffaa6a'])
  px.disc(124, HORIZON, 13, '#ffc27a'); px.disc(124, HORIZON, 11, '#ffdc96'); px.disc(122, HORIZON - 2, 6, '#ffeab8')
  for (const [y, w] of [[HORIZON - 4, 1], [HORIZON - 7, 1]]) px.rect(112, y, 25, w, '#ffb27a')
  for (const [x, y, w, c] of [[14, 22, 30, '#c8607e'], [40, 18, 18, '#e07a80'], [84, 30, 36, '#f08a7a'], [150, 26, 28, '#e07a80'], [168, 34, 22, '#f4a07a'], [60, 40, 26, '#ff9a72'], [100, 46, 40, '#ffb07a']]) { px.rect(x, y, w, 1, c); px.rect(x + 4, y - 1, w - 10, 1, c) }

  // The headland with its lighthouse, on the right.
  for (let x = 146; x < COLS; x++) { const h = Math.round(Math.min(10, (x - 146) * 0.6) + Math.sin(x / 4)); px.rect(x, HORIZON - h, 1, h, '#3a2a5a') }
  px.rect(171, HORIZON - 24, 4, 15, '#f4ece8'); for (const y of [HORIZON - 21, HORIZON - 15]) px.rect(171, y, 4, 2, '#c84a4a')
  px.rect(170, HORIZON - 26, 6, 2, '#3a2a3a'); px.rect(171, HORIZON - 28, 4, 2, '#ffe08a'); px.rect(172, HORIZON - 29, 2, 1, '#3a2a3a')

  // The sea: brightest near the horizon, with glints.
  px.gradient(HORIZON, SHORE, ['#8a5a86', '#6a4e88', '#4e4486', '#3c3c7e', '#33367a'])
  for (let i = 0; i < 90; i++) { const y = HORIZON + 1 + Math.floor(rnd() * (SHORE - HORIZON - 3)), x = Math.floor(rnd() * COLS); px.rect(x, y, 2 + Math.floor(rnd() * 4), 1, y < HORIZON + 8 ? '#b8789a' : '#5a5a9a') }

  // The beach: wet sand at the waterline, then dry sand with shells.
  px.rect(0, SHORE, COLS, 4, '#9a7a86'); px.rect(0, SHORE + 4, COLS, ROWS - SHORE - 4, '#e0a882')
  for (let y = SHORE + 5; y < ROWS; y += 2) for (let x = (y * 7) % 9; x < COLS; x += 9) px.set(x, y, '#d0967a')
  for (let i = 0; i < 14; i++) px.set(70 + Math.floor(rnd() * 100), SHORE + 8 + Math.floor(rnd() * 30), i % 2 ? '#ffd0c8' : '#fff0e8')

  // The hut on the left: thatched roof, board wall, glowing window, porch posts and deck.
  px.rect(0, 58, 36, 38, '#a8704a'); for (let x = 3; x < 36; x += 4) px.rect(x, 58, 1, 38, '#8a5a38')
  px.rect(8, 66, 20, 16, '#5a3a28'); px.rect(9, 67, 18, 14, '#ffcf7a'); px.rect(17, 67, 2, 14, '#5a3a28'); px.rect(9, 73, 18, 1, '#5a3a28')
  px.rect(10, 68, 6, 4, '#ffe2a8'); px.rect(20, 75, 5, 4, '#ffe2a8')
  px.rect(6, 82, 24, 2, '#7a4a2a')
  for (let x = 0; x < 64; x++) { const fringe = 58 + (x % 3 === 0 ? 1 : 0) + (x % 5 === 0 ? 1 : 0); px.rect(x, 50, 1, fringe - 50, x % 4 < 2 ? '#c89a5a' : '#b8884a') }
  px.rect(0, 50, 64, 1, '#e0b46a'); for (let x = 2; x < 64; x += 6) px.rect(x, 52, 1, 4, '#a07a40')
  px.rect(58, 58, 3, 40, '#7a4a2a'); px.rect(58, 58, 1, 40, '#9a6a3a')
  px.rect(0, 96, 66, ROWS - 96, '#8a5a3a'); for (let y = 99; y < ROWS; y += 3) px.rect(0, y, 66, 1, '#6a4228'); px.rect(0, 96, 66, 1, '#a8744a')
  for (const x of [8, 30, 52]) px.rect(x, 100, 1, ROWS - 100, '#6a4228')
  // A surfboard leaning on the wall, two deck chairs, a table with a lantern and a mug, a plant.
  px.ellipse(33, 80, 2, 14, '#ff8a6a'); px.rect(33, 67, 1, 27, '#fff0e0')
  // A chair with a back leaning away from the sea, seat, armrest, and legs.
  const chair = (x, c, shade, base) => {
    for (let i = 0; i < 8; i++) px.rect(x + Math.round((7 - i) * 0.45), base - 13 + i, 3, 1, i % 2 ? c : shade)
    px.rect(x + 2, base - 5, 9, 2, c); px.rect(x + 2, base - 3, 9, 1, shade)
    px.rect(x + 1, base - 8, 11, 1, shade); px.rect(x + 11, base - 7, 1, 2, shade)
    px.rect(x + 3, base - 2, 1, 3, shade); px.rect(x + 10, base - 2, 1, 3, shade)
  }
  chair(37, '#5a9ac0', '#3a7aa0', 96); chair(70, '#e8a05a', '#c8803a', 100)
  px.rect(52, 91, 8, 1, '#6a4228'); px.rect(53, 92, 1, 5, '#6a4228'); px.rect(58, 92, 1, 5, '#6a4228')
  px.rect(53, 87, 3, 4, '#3a2a2a'); px.rect(54, 88, 1, 2, '#ffd27a'); px.rect(53, 86, 3, 1, '#3a2a2a'); px.rect(57, 89, 2, 2, '#f0e8e0'); px.set(59, 89, '#f0e8e0')
  px.rect(1, 90, 5, 6, '#b8673d'); for (const [dx, dy] of [[0, -3], [2, -5], [4, -3], [1, -7], [3, -6]]) px.rect(1 + dx, 90 + dy, 2, 3, '#4f9a6a')
  // String lights along the roof edge.
  const swag = (x) => 59 + Math.round(3 * Math.sin((Math.PI * ((x - 2) % 14)) / 14))
  for (let x = 2; x < 60; x++) px.set(x, swag(x), '#3a2a2a')

  // The palm on the right (its fronds sway on two frames).
  const TOP = [176, 58]
  for (let i = 0; i <= 66; i++) { const y = ROWS - i, x = Math.round(186 - 10 * Math.pow(i / 66, 1.6)); px.rect(x - 1, y, 3, 1, i % 4 === 0 ? '#5a4028' : '#7a5a3a') }
  px.disc(TOP[0] - 1, TOP[1] + 2, 1, '#5a3a20'); px.disc(TOP[0] + 2, TOP[1] + 2, 1, '#5a3a20')
  const fronds = [0, 1].map((k) => {
    const g = layer()
    for (const [ang, len] of [[200, 16], [235, 14], [270, 12], [305, 14], [340, 16], [160, 12], [20, 12]]) {
      const a = ((ang + (k ? 6 : -6)) * Math.PI) / 180
      for (let i = 1; i <= len; i++) {
        const x = TOP[0] + Math.round(Math.cos(a) * i), y = TOP[1] + Math.round(Math.sin(a) * i * 0.7 + (i * i) / 30)
        g.set(x, y, '#2f6a4a'); if (i > 2 && i < len - 1) { g.set(x, y + 1, '#3f8a5a'); if (i % 2) g.set(x, y - 1, '#2a5a40') }
      }
    }
    return g
  })

  // Moving layers.
  // Sun glitter on the water.
  const glitter = [0, 1, 2].map((k) => { const g = layer(); for (let y = HORIZON + 1; y < SHORE - 1; y += 2) { const w = Math.round(10 - (y - HORIZON) * 0.15), off = ((y * 5 + k * 3) % 5) - 2; g.rect(124 - Math.floor(w / 2) + off, y, Math.max(2, w - ((y + k) % 3) * 2), 1, (y + k) % 4 ? '#ffc27a' : '#ffe2a8') } return g })
  // Waves washing up the sand and back.
  const waves = [0, 1, 2, 3].map((k) => {
    const g = layer(), reach = [0, 2, 3, 1][k]
    for (let x = 64; x < COLS; x++) {
      const edge = SHORE + reach + Math.round(Math.sin(x / 6 + k) * 0.8)
      g.rect(x, SHORE - 1, 1, edge - SHORE + 1, '#6a6aa8'); g.set(x, edge, '#f4ecf0'); if ((x + k) % 3) g.set(x, edge - 1, '#c8c0e0')
    }
    for (let x = (k * 7) % 11; x < COLS; x += 11) g.rect(x, SHORE - 6 + (k % 2), 4, 1, '#9a8ac0')
    return g
  })
  // String light bulbs twinkling.
  const bulbs = [0, 1, 2].map(() => layer())
  for (let x = 4, i = 0; x < 58; x += 4, i++) bulbs[i % 3].rect(x, swag(x) + 1, 1, 2, BULBS[i % 4])
  // The lighthouse beam sweeping: left, off, right.
  const beam = [0, 1, 2].map((k) => { const g = layer(); if (k !== 1) for (let i = 2; i < 16; i++) { const x = 173 + (k === 0 ? -i : i), y = HORIZON - 27 + Math.round(i * 0.15); g.set(x, y, '#fff0b8'); if (i < 10) g.set(x, y + 1, '#ffe08a') } return g })
  // A crab scuttling along the sand, legs up and down.
  const crab = [0, 1].map((k) => { const g = layer(), x = 0, y = 108; g.rect(x, y, 5, 2, '#e8504a'); g.set(x + 1, y - 1, INK); g.set(x + 3, y - 1, INK); g.set(x - 1, y - 1, '#e8504a'); g.set(x + 5, y - 1, '#e8504a'); for (const dx of [0, 2, 4]) g.set(x + dx, y + 2 + ((dx / 2 + k) % 2), '#c83a3a'); return g })
  // Gulls flapping across the sky.
  const gulls = [0, 1].map((k) => { const g = layer(); for (const [x, y] of [[0, 0], [6, 3], [-5, 4]]) { if (k) { g.set(x - 2, y - 1, '#2a2040'); g.set(x - 1, y, '#2a2040'); g.set(x + 1, y, '#2a2040'); g.set(x + 2, y - 1, '#2a2040') } else { g.set(x - 2, y, '#2a2040'); g.set(x - 1, y, '#2a2040'); g.set(x + 1, y, '#2a2040'); g.set(x + 2, y, '#2a2040') } g.set(x, y + 1, '#2a2040') } return g })
  // A sailboat drifting along the horizon.
  const boat = layer(); boat.rect(0, HORIZON - 1, 7, 1, '#2a2040'); boat.rect(1, HORIZON, 5, 1, '#2a2040'); boat.poly([[3, HORIZON - 9], [3, HORIZON - 2], [7, HORIZON - 2]], '#f4e8e0'); boat.rect(3, HORIZON - 9, 1, 8, '#2a2040'); boat.poly([[2, HORIZON - 6], [2, HORIZON - 2], [0, HORIZON - 2]], '#ffd8c0')

  return svgDoc({
    defs:
      `<radialGradient id="sun"><stop offset="0" stop-color="#ffd08a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd08a" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="warm"><stop offset="0" stop-color="#ffcf7a" stop-opacity=".4"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></radialGradient>`,
    css:
      `@keyframes f2{0%{opacity:1}50%{opacity:0}}@keyframes f3{0%{opacity:1}33.333%{opacity:0}}@keyframes f4{0%{opacity:1}25%{opacity:0}}` +
      `@keyframes scuttle{0%{transform:translate(${72 * P}px,0)}100%{transform:translate(${150 * P}px,0)}}` +
      `@keyframes glide{0%{transform:translate(1700px,${18 * P}px)}100%{transform:translate(-120px,${12 * P}px)}}` +
      `@keyframes sail{0%{transform:translate(${72 * P}px,0)}100%{transform:translate(${140 * P}px,0)}}`,
    body:
      `<rect width="${W}" height="${H}" fill="#221f4e"/>` + px.svg(P) +
      `<circle cx="${124 * P}" cy="${HORIZON * P}" r="420" fill="url(#sun)"/>` +
      `<circle cx="${18 * P}" cy="${74 * P}" r="220" fill="url(#warm)"/><circle cx="${54 * P}" cy="${88 * P}" r="90" fill="url(#warm)"/>` +
      `<g style="animation:sail 272s steps(68,end) infinite alternate">${boat.svg(P)}</g>` +
      frames(glitter, 1.2) + frames(waves, 4) + frames(beam, 3) + frames(bulbs, 1.8) + frames(fronds, 2.4) +
      `<g style="animation:scuttle 15.6s steps(78,end) infinite alternate">${frames(crab, 0.4)}</g>` +
      `<g style="animation:glide 36s steps(180,end) -14s infinite">${frames(gulls, 0.6)}</g>`,
  })
}
