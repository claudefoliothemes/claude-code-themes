// A cozy pixel-art room at night: rain running down the window over city lights, an old monitor
// glowing with scrolling lines, a desk lamp, a mug steaming, a plant, and a cat asleep on a
// cushion with its tail flicking. Drawn on a 10-unit pixel grid, one path per color so
// neighboring pixels never show seams. Every change lands on the shared 0.1 s tick.
import { H, W, rng, svgDoc } from './_lib.mjs'

const P = 10
const FLOOR = 84 // in pixels

const canvas = () => {
  const cells = new Map()
  const rect = (color, x, y, w = 1, h = 1) => {
    if (w <= 0 || h <= 0) return
    if (!cells.has(color)) cells.set(color, [])
    cells.get(color).push(`M${x * P} ${y * P}h${w * P}v${h * P}h-${w * P}Z`)
  }
  const svg = (extra = '') => [...cells].map(([c, d]) => `<path d="${d.join('')}" fill="${c}"${extra}/>`).join('')
  return { rect, svg }
}

export default function scene() {
  const rnd = rng(0xd3e17)
  const room = canvas()

  // Walls in two bands, a baseboard, and the floor.
  room.rect('#1f1a30', 0, 0, W / P, 60)
  room.rect('#241e37', 0, 60, W / P, FLOOR - 60)
  room.rect('#2e2645', 0, FLOOR - 2, W / P, 2)
  room.rect('#2a2033', 0, FLOOR, W / P, H / P - FLOOR)
  for (let x = 0; x < W / P; x += 8) room.rect('#251c2e', x, FLOOR, 1, H / P - FLOOR)

  // Window on the left: frame, night sky, city lights.
  const WX = 6, WY = 14, WW = 34, WH = 30
  room.rect('#0f1628', WX, WY, WW, WH)
  room.rect('#162142', WX, WY + 14, WW, WH - 14)
  const LIGHTS = ['#ffd36b', '#ff8fb1', '#7fd0ff']
  for (let i = 0; i < 26; i++) room.rect(LIGHTS[i % 3], WX + 1 + Math.floor(rnd() * (WW - 2)), WY + 16 + Math.floor(rnd() * (WH - 18)))
  room.rect('#3b3150', WX - 1, WY - 1, WW + 2, 1); room.rect('#3b3150', WX - 1, WY + WH, WW + 2, 1)
  room.rect('#3b3150', WX - 1, WY, 1, WH); room.rect('#3b3150', WX + WW, WY, 1, WH)
  room.rect('#3b3150', WX + WW / 2, WY, 1, WH); room.rect('#4a3f63', WX - 2, WY + WH + 1, WW + 4, 2)

  // Desk on the right, a monitor, lamp, mug, and books.
  const DX = 104
  room.rect('#5a3f33', DX, 62, 50, 2); room.rect('#4a332a', DX + 2, 64, 2, FLOOR - 64); room.rect('#4a332a', DX + 46, 64, 2, FLOOR - 64)
  room.rect('#3a3a48', DX + 6, 44, 22, 17); room.rect('#2a2a36', DX + 14, 61, 6, 1)
  room.rect('#0e2a24', DX + 8, 46, 18, 12)
  room.rect('#6b4f3a', DX + 32, 58, 6, 4); room.rect('#7a5c44', DX + 32, 58, 6, 1) // mug
  room.rect('#c9a35a', DX + 38, 59, 2, 2)
  room.rect('#2e2a3a', DX + 42, 61, 4, 1); room.rect('#2e2a3a', DX + 43, 50, 1, 11); room.rect('#2e2a3a', DX + 40, 49, 4, 1) // lamp arm
  room.rect('#e8b34a', DX + 38, 50, 4, 2)
  for (const [c, x, h] of [['#b5523b', 0, 6], ['#3f7a6b', 2, 7], ['#6b5bb5', 4, 5]]) room.rect(c, DX + x, 62 - h, 2, h)

  // Plant in the corner and a poster on the wall.
  room.rect('#9a5a3c', 88, 76, 6, 8); room.rect('#4f8a5a', 86, 66, 2, 10); room.rect('#5fa06a', 90, 62, 2, 14); room.rect('#4f8a5a', 94, 68, 2, 8)
  room.rect('#4f8a5a', 84, 64, 2, 3); room.rect('#5fa06a', 96, 66, 2, 3)
  // The poster gets its own layer: one path per color draws in first-use order, so its pink and
  // blue (already used by the city lights) would land under its frame.
  const poster = canvas()
  poster.rect('#3b3150', 60, 16, 16, 20); poster.rect('#ff8fb1', 62, 18, 12, 8); poster.rect('#7fd0ff', 62, 27, 12, 7)
  poster.rect('#ffd36b', 66, 20, 4, 4)

  // Cushion and the sleeping cat (tail drawn separately so it can flick).
  room.rect('#7a4f8f', 52, 79, 22, 5); room.rect('#8d5fa3', 53, 78, 20, 1)
  room.rect('#2c2633', 56, 72, 14, 6); room.rect('#2c2633', 66, 69, 6, 4)
  room.rect('#2c2633', 66, 68, 1, 1); room.rect('#2c2633', 71, 68, 1, 1)
  room.rect('#4a4152', 67, 71, 1, 1); room.rect('#4a4152', 70, 71, 1, 1)
  const tailDown = canvas(); tailDown.rect('#2c2633', 52, 76, 4, 2)
  const tailUp = canvas(); tailUp.rect('#2c2633', 54, 73, 2, 3); tailUp.rect('#2c2633', 53, 71, 2, 2)

  // Rain in the window: pixel drops sliding down, clipped to the glass.
  const drops = canvas()
  for (let i = 0; i < 40; i++) {
    const x = WX + Math.floor(rnd() * WW), y = WY + Math.floor(rnd() * WH)
    drops.rect('#9ab3e6', x, y, 1, 2); drops.rect('#9ab3e6', x, y - WH, 1, 2)
  }

  // Monitor: twelve lines of text, drawn twice so a scroll of twelve rows loops without a jump.
  const screen = canvas()
  for (let row = 0; row < 12; row++) {
    const len = 3 + Math.floor(rnd() * 13), color = row % 5 === 0 ? '#7fffd4' : '#36d39a'
    screen.rect(color, DX + 9, 47 + row, len, 1)
    screen.rect(color, DX + 9, 59 + row, len, 1)
  }

  // Steam rising from the mug, a pixel at a time.
  let steam = ''
  for (let k = 0; k < 3; k++) {
    const dur = 1.8
    steam += `<rect x="${(DX + 33 + k * 2) * P}" y="${56 * P}" width="${P}" height="${P}" fill="#b9b2c8" style="animation:steam ${dur}s steps(18,end) -${(k * 0.6).toFixed(1)}s infinite"/>`
  }

  return svgDoc({
    defs:
      `<clipPath id="glass"><rect x="${WX * P}" y="${WY * P}" width="${WW * P}" height="${WH * P}"/></clipPath>` +
      `<clipPath id="screen"><rect x="${(DX + 8) * P}" y="${46 * P}" width="${18 * P}" height="${12 * P}"/></clipPath>` +
      `<radialGradient id="lamp"><stop offset="0" stop-color="#ffcf7a" stop-opacity=".45"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="crt"><stop offset="0" stop-color="#36d39a" stop-opacity=".25"/><stop offset="1" stop-color="#36d39a" stop-opacity="0"/></radialGradient>`,
    css:
      `@keyframes rain{to{transform:translateY(${WH * P}px)}}` +
      `@keyframes scroll{from{transform:translateY(0)}to{transform:translateY(-${12 * P}px)}}` +
      `@keyframes steam{from{transform:translateY(0);opacity:.8}to{transform:translateY(-${18 * P}px);opacity:0}}` +
      `@keyframes glow{0%{opacity:.9}25%{opacity:1}50%{opacity:.85}75%{opacity:1}}` +
      `@keyframes tailA{0%{opacity:1}80%{opacity:0}90%{opacity:1}}` +
      `@keyframes tailB{0%{opacity:0}80%{opacity:1}90%{opacity:0}}`,
    body:
      room.svg() + poster.svg() +
      `<g clip-path="url(#glass)"><g style="animation:rain 1.5s steps(15,end) infinite">${drops.svg()}</g></g>` +
      `<g clip-path="url(#screen)"><g style="animation:scroll 2.4s steps(12,end) infinite">${screen.svg()}</g></g>` +
      `<circle cx="${(DX + 17) * P}" cy="${52 * P}" r="260" fill="url(#crt)" style="animation:glow 1.2s steps(1,end) infinite"/>` +
      `<circle cx="${(DX + 40) * P}" cy="${54 * P}" r="300" fill="url(#lamp)"/>` +
      `<g style="animation:tailA 5s steps(1,end) infinite">${tailDown.svg()}</g>` +
      `<g style="animation:tailB 5s steps(1,end) infinite">${tailUp.svg()}</g>` +
      steam,
  })
}
