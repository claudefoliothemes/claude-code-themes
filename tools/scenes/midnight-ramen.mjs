// A ramen stall on a rainy back street at midnight, drawn like a 16-bit console scene: behind a red
// noren curtain the chef shakes a basket of noodles, two customers slurp at the counter, steam rolls
// off the big pot, a paper lantern sways, a cat waits for scraps, a karaoke sign flickers, and the
// stall's warm light shimmers on the wet road while rain falls.
// Original art on a 320 x 200 grid of 5-unit pixels. Every change lands on the shared 0.1 s tick.
import { H, W, rng, svgDoc } from './_lib.mjs'
import { COLS, FRAME_CSS, P, ROWS, bands, canvas, frames, layer, mix, ramp, sprite } from './_bit16.mjs'

// Katakana in 7 x 7 pixels: ra, the long-vowel bar, me, n (ramen), and ka, o, ke (karaoke).
const KANA = {
  ra: ['.#####.', '.......', '#######', '......#', '.....#.', '....#..', '..##...'],
  bar: ['.......', '.......', '.......', '#######', '.......', '.......', '.......'],
  me: ['.....#.', '.#...#.', '..#.#..', '...#...', '..#.#..', '.#.....', '#......'],
  n: ['#......', '.#....#', '......#', '.....#.', '....#..', '..##...', '##.....'],
  ka: ['..#....', '..#....', '######.', '..#...#', '..#...#', '.#....#', '#...##.'],
  o: ['....#..', '#######', '....#..', '...##..', '..#.#..', '.#..#..', '#..##..'],
  ke: ['.#.....', '.#.....', '.######', '#...#..', '....#..', '...#...', '..#....'],
}
const kana = (g, x, y, id, c, s = 1) => KANA[id].forEach((row, j) => [...row].forEach((ch, i) => { if (ch === '#') g.rect(x + i * s, y + j * s, s, s, c) }))
const WARM = '#ffb870', G = 154

export default function scene() {
  const rnd = rng(0x4a3e)
  const { px, V, finish } = canvas()
  const skyAt = ramp(['#080a1a', '#0e1228', '#171a38', '#22204a'], 0, 148, 5)
  const sky = bands(0, 148, skyAt)

  // Far towers in the gap between the buildings, one with a blinking beacon.
  for (let x = 66, i = 0; x < 250; i++) { const w = 8 + Math.floor(rnd() * 12), top = 14 + Math.floor(rnd() * 22); V(x, top, w, 46 - top, '#11132a'); for (let y = top + 3; y < 44; y += 4) for (let xx = x + 2; xx < x + w - 1; xx += 3) if (rnd() < 0.25) px.set(xx, y, rnd() < 0.5 ? '#3a4470' : '#8a7a50'); x += w + (i % 3 === 0 ? 6 : 0) }
  V(170, 4, 2, 16, '#11132a')
  const beacon = [0, 1].map((k) => { const g = layer(); if (!k) { g.set(170, 3, '#ff4a5a'); g.set(171, 3, '#ff4a5a') } return g })

  // Windows for a wall: warm lamps, blue TVs, mostly dark.
  const windows = (x0, x1, y0, y1, cool) => { for (let y = y0; y < y1; y += 14) for (let x = x0; x < x1; x += 12) { const r = rnd(), c = r < 0.26 ? (cool ? '#8ab0e0' : '#e8b060') : r < 0.36 ? '#5a7ac8' : '#0e0e1c'; px.rect(x, y, 8, 9, c); if (c !== '#0e0e1c') { px.rect(x, y, 8, 1, mix(c, '#ffffff', 0.35)); px.rect(x + 5, y + 1, 3, 8, mix(c, '#000000', 0.25)) } px.rect(x + 4, y, 1, 9, '#1b1b32'); px.rect(x - 1, y + 9, 10, 1, '#2c2c4a') } }
  // Left building with a shutter, a parked bicycle, and a karaoke sign.
  V(0, 18, 66, 130, '#1b1b32'); V(0, 18, 66, 2, '#2c2c4a'); V(64, 20, 2, 128, '#131326')
  windows(6, 50, 28, 112, false)
  V(4, 122, 42, 26, '#22223a'); for (let y = 124; y < 148; y += 3) V(4, y, 42, 1, '#18182c')
  const ring = (cx, cy, r, c) => { for (let a = 0; a < 40; a++) px.set(Math.round(cx + Math.cos((a / 40) * 6.283) * r), Math.round(cy + Math.sin((a / 40) * 6.283) * r), c) }
  ring(22, 147, 6, '#6a6e84'); ring(42, 147, 6, '#6a6e84'); px.set(22, 147, '#9a9eb4'); px.set(42, 147, '#9a9eb4')
  for (let i = 0; i <= 10; i++) { px.set(22 + i, 147 - i, '#c8483a'); px.set(32 + i, 137 + i, '#c8483a') } px.rect(26, 137, 12, 1, '#c8483a'); px.rect(30, 134, 5, 1, '#2a2a3a'); px.rect(39, 133, 1, 5, '#9a9eb4'); px.rect(37, 132, 5, 1, '#2a2a3a')
  const signs = [0, 1, 2].map(() => layer())
  const KX = 57, KY = 30
  V(KX, KY, 11, 42, '#2a1226')
  signs.forEach((g, k) => { if (k === 1) return; g.rect(KX, KY, 11, 1, '#ff5aa8'); g.rect(KX, KY + 41, 11, 1, '#ff5aa8'); g.rect(KX, KY, 1, 42, '#ff5aa8'); g.rect(KX + 10, KY, 1, 42, '#ff5aa8'); ['ka', 'ra', 'o', 'ke'].forEach((id, i) => kana(g, KX + 2, KY + 3 + i * 9, id, '#ffc0dc')) })

  // The dark wall behind the stall, with a door on the left and a shuttered shop on the right.
  V(66, 46, 184, 102, '#131428'); V(66, 46, 184, 2, '#20203a')
  for (let x = 74; x < 240; x += 16) { const lit = rnd() < 0.2; px.rect(x, 54, 9, 10, lit ? '#b8884a' : '#0c0c18'); if (lit) px.rect(x, 54, 9, 1, '#d8b070'); px.rect(x - 1, 64, 11, 1, '#20203a') }
  V(72, 112, 16, 36, '#20182a'); px.rect(74, 114, 12, 14, '#2a2038'); px.set(85, 131, '#c8a24a'); px.rect(78, 107, 4, 2, '#ffe0a0')
  V(228, 100, 20, 48, '#1c1c30'); for (let y = 102; y < 148; y += 3) V(228, y, 20, 1, '#141426')
  // Right building, a utility pole with sagging wires, and a glowing vending machine.
  V(250, 10, 70, 138, '#1d1d36'); V(250, 10, 2, 138, '#2c2c4c')
  windows(262, 314, 20, 100, true)
  V(256, 4, 3, 150, '#0b0b16'); px.rect(248, 12, 19, 2, '#0b0b16'); px.rect(250, 20, 15, 2, '#0b0b16'); px.rect(260, 26, 7, 10, '#191926'); px.rect(260, 26, 7, 1, '#2c2c40')
  for (const [ya, yb, sag] of [[6, 12, 12], [16, 20, 9]]) for (let x = 0; x <= 256; x++) { const t = x / 256; px.set(x, Math.round(ya + (yb - ya) * t + sag * Math.sin(Math.PI * t)), '#05060c') }
  const VX = 288
  V(VX, 112, 18, 42, '#2c4c8c'); px.rect(VX, 112, 18, 1, '#5a80c8'); px.rect(VX, 112, 1, 42, '#4468b0'); px.rect(VX + 2, 115, 14, 19, '#d8f0ff'); px.rect(VX + 2, 115, 14, 2, '#ffffff')
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { px.rect(VX + 3 + c * 3, 118 + r * 5, 2, 4, ['#e84a4a', '#4a9ae8', '#f0c040', '#4ac880', '#e88a3a', '#b06ae0'][(r * 4 + c) % 6]) }
  px.rect(VX + 3, 137, 12, 2, '#18284c'); px.set(VX + 13, 135, '#6aff8a'); px.rect(VX + 3, 142, 12, 6, '#0e1830')

  // Sidewalk and wet road.
  V(0, 148, COLS, 12, '#28283e'); V(0, 148, COLS, 1, '#3a3a5c'); for (let x = 10; x < COLS; x += 20) V(x, 149, 1, 10, '#1e1e30'); V(0, 159, COLS, 2, '#131320')
  for (let y = 161; y < ROWS; y += 3) V(0, y, COLS, 3, mix('#141526', '#0b0c16', (y - 161) / 39))
  for (let x = 14; x < COLS; x += 62) V(x, 180, 28, 2, '#2c2e48')

  // ===== The stall =====
  // Roof, a stove pipe, posts, and the lit interior.
  V(94, 70, 132, 6, '#5c3a26'); V(94, 70, 132, 1, '#8a5e3c'); V(94, 75, 132, 2, '#2e1c12'); for (let x = 104; x < 226; x += 11) px.rect(x, 71, 1, 4, '#4a2e1e')
  V(196, 56, 4, 14, '#5a5e6c'); px.rect(196, 56, 1, 14, '#8a8e9c'); px.rect(194, 54, 8, 2, '#3a3e4c')
  for (let y = 78; y < 120; y += 3) V(103, y, 114, 3, mix('#f8c878', '#dc8c3c', (y - 78) / 42))
  V(100, 77, 3, 71, '#4a2e1e'); V(217, 77, 3, 71, '#3e2616'); px.rect(100, 77, 1, 71, '#6a4630')
  V(101, 77, 118, 1, '#2a1810')
  // Back shelf with bottles, menu slips, a bare bulb, and the big pot.
  px.rect(196, 105, 21, 1, '#8a5228')
  ;[['#3a7a4a', 198], ['#7a4a2a', 202], ['#e8e4d8', 206], ['#3a7a4a', 210], ['#a83a3a', 214]].forEach(([c, x]) => { px.rect(x, 99, 2, 6, c); px.set(x, 98, mix(c, '#ffffff', 0.3)); px.set(x, 100, mix(c, '#ffffff', 0.4)) })
  for (const x of [171, 177, 189]) { px.rect(x, 96, 4, 9, '#f6ecd0'); for (let y = 98; y < 104; y += 2) px.set(x + 1 + (y % 4 === 0 ? 1 : 0), y, '#5a3a2a') }
  px.rect(146, 95, 1, 2, '#2a1810'); px.rect(145, 97, 3, 3, '#fffbe0')
  V(106, 108, 18, 12, '#7a7e8c'); px.rect(105, 107, 20, 1, '#c0c4d0'); px.rect(108, 109, 2, 10, '#a8acb8'); px.rect(121, 109, 3, 11, '#5a5e6c'); px.rect(118, 99, 1, 8, '#8a6a3a')
  // The chef: headband, happy eyes, white coat, navy apron.
  const CX = 160, SKIN = '#f2c494'
  px.rect(CX - 7, 106, 15, 14, '#f6f2ec'); px.rect(CX - 7, 106, 2, 14, '#ffffff'); px.rect(CX + 6, 106, 2, 14, '#cfc6bc'); px.rect(CX - 3, 112, 7, 8, '#2a3a5e'); px.rect(CX - 3, 112, 7, 1, '#3e5484')
  px.set(CX - 1, 106, '#b8aea4'); px.set(CX + 1, 106, '#b8aea4'); px.set(CX, 107, '#b8aea4')
  px.rect(CX - 3, 97, 7, 1, SKIN); px.rect(CX - 4, 98, 9, 7, SKIN); px.rect(CX - 3, 105, 7, 1, '#dca878')
  px.rect(CX - 3, 94, 7, 1, '#1c1418'); px.rect(CX - 4, 95, 9, 2, '#1c1418'); px.rect(CX - 4, 97, 9, 2, '#ffffff'); px.rect(CX + 5, 98, 2, 3, '#ffffff')
  px.set(CX - 3, 101, '#2a1c1c'); px.set(CX - 2, 100, '#2a1c1c'); px.set(CX - 1, 101, '#2a1c1c'); px.set(CX + 1, 101, '#2a1c1c'); px.set(CX + 2, 100, '#2a1c1c'); px.set(CX + 3, 101, '#2a1c1c')
  px.set(CX - 3, 103, '#f09a8a'); px.set(CX + 3, 103, '#f09a8a'); px.rect(CX - 1, 103, 3, 1, '#a8483a')
  px.rect(CX + 8, 108, 2, 8, '#f6f2ec'); px.rect(CX + 8, 116, 2, 2, SKIN)
  const chef = [0, 1].map((k) => {
    const g = layer(), d = k ? 8 : 0
    if (!k) { g.set(CX - 8, 108, '#f6f2ec'); g.set(CX - 9, 107, '#f6f2ec'); g.rect(CX - 10, 105, 1, 2, '#f6f2ec'); g.set(CX - 11, 104, SKIN) }
    else { g.set(CX - 8, 109, '#f6f2ec'); g.set(CX - 9, 110, '#f6f2ec'); g.set(CX - 10, 111, '#f6f2ec'); g.set(CX - 11, 112, SKIN); g.set(CX - 12, 109, '#cfe8ff'); g.set(CX - 10, 108, '#cfe8ff') }
    g.rect(CX - 11, 100 + d, 1, 4, '#8a6a3a'); g.rect(CX - 13, 96 + d, 5, 4, '#9a9eaa'); g.rect(CX - 12, 96 + d, 3, 2, '#f6e08a'); g.set(CX - 11, 95 + d, '#f6e08a')
    return g
  })
  // The noren: four red panels reading ra-a-me-n, fluttering at the hem.
  const NP = [103, 132, 161, 190]
  NP.forEach((x, i) => { px.rect(x, 78, 28, 17, '#c4302c'); px.rect(x, 78, 1, 17, '#e45446'); px.rect(x + 26, 78, 2, 17, '#98201e'); px.rect(x, 78, 28, 1, '#8a1c1c'); kana(px, x + 7, 80, ['ra', 'bar', 'me', 'n'][i], '#fff4e4', 2) })
  const noren = [0, 1].map((k) => { const g = layer(); NP.forEach((x, i) => { if ((i + k) % 2) return; for (let y = 91; y < 95; y++) { for (let xx = x + 27; xx >= x; xx--) g.set(xx + 1, y, px.get(xx, y)); g.set(x, y, '#eeb060') } }); return g })
  // Counter, plank front, and wooden wheels.
  V(103, 124, 114, 22, '#6a4028'); V(103, 124, 114, 2, '#3a2214'); for (let x = 114; x < 217; x += 13) px.rect(x, 126, 1, 20, '#55321e')
  V(98, 120, 124, 4, '#d8a060'); V(98, 120, 124, 1, '#f6cf8e'); V(98, 123, 124, 1, '#a8743c')
  const wheel = (cx, cy) => { for (let y = -8; y <= 8; y++) for (let x = -8; x <= 8; x++) { const d = Math.sqrt(x * x + y * y); if (d > 8.4) continue; let c = null; if (d > 6.2) c = y < -2 ? '#6a4630' : '#3e2718'; else if (d < 2.2) c = '#8a6a4a'; else if (Math.abs(x) < 1 || Math.abs(y) < 1 || Math.abs(Math.abs(x) - Math.abs(y)) < 1) c = '#54361f'; if (c) px.set(cx + x, cy + y, c) } }
  wheel(114, 146); wheel(206, 146)
  // Bowls on the counter.
  for (const bx of [150, 197]) { px.rect(bx, 116, 8, 1, '#d83a2e'); px.rect(bx, 117, 8, 2, '#f6f2ea'); px.rect(bx + 1, 119, 6, 1, '#d2ccc2'); px.rect(bx + 6, 113, 1, 3, '#8a5a34') }

  // Two customers on stools, seen from behind, rim-lit by the stall; their heads dip as they slurp.
  const person = (cx, body, pants, shoe) => {
    px.rect(cx - 6, 140, 13, 2, '#9a6a3c'); px.rect(cx - 6, 140, 13, 1, '#c08a54'); px.rect(cx - 5, 142, 2, 12, '#5a3a22'); px.rect(cx + 4, 142, 2, 12, '#4a2e1a'); px.rect(cx - 4, 148, 9, 1, '#5a3a22')
    for (let y = 118; y < 139; y++) { const hw = y < 119 ? 6 : y < 121 ? 8 : 9; for (let x = -hw; x <= hw; x++) px.set(cx + x, y, y === 118 || Math.abs(x) === hw ? mix(body, WARM, 0.5) : x > 3 ? mix(body, '#000000', 0.2) : body) }
    px.rect(cx, 121, 1, 16, mix(body, '#000000', 0.15))
    px.rect(cx - 9, 138, 19, 3, pants); px.rect(cx - 8, 141, 3, 5, pants); px.rect(cx + 6, 141, 3, 5, pants); px.rect(cx - 9, 146, 5, 3, shoe); px.rect(cx + 5, 146, 5, 3, shoe)
  }
  person(137, '#2e4a6a', '#22263c', '#e8e4dc'); person(185, '#dcd8d2', '#1e2032', '#2a1c16')
  px.rect(196, 146, 11, 8, '#4a3020'); px.rect(196, 146, 11, 1, '#6a4830'); px.rect(199, 144, 5, 2, '#2a1c14')
  const heads = [0, 1].map((k) => {
    const g = layer()
    const a = 112 + k, b = 111 + (1 - k)
    for (let y = -6; y <= 6; y++) for (let x = -6; x <= 6; x++) if (x * x + y * y <= 38) g.set(137 + x, a + y, x * x + y * y > 26 && y < 1 ? mix('#2e4a6a', WARM, 0.55) : x > 2 ? '#243a54' : '#2e4a6a')
    g.rect(134, a + 5, 7, 2, '#243a54')
    for (let y = -5; y <= 5; y++) for (let x = -5; x <= 5; x++) if (x * x + y * y <= 27) g.set(185 + x, b + y, x * x + y * y > 18 && y < 1 ? mix('#1c1620', WARM, 0.5) : '#1c1620')
    g.rect(183, b + 5, 5, 2, '#d8a880'); g.set(179, b + 1, '#d8a880'); g.set(191, b + 1, '#d8a880')
    return g
  })

  // Beer crates, a leaning umbrella, the swaying lantern, and the cat.
  px.rect(74, 144, 16, 10, '#c89a28'); px.rect(74, 144, 16, 1, '#e8c050'); for (let x = 76; x < 90; x += 4) px.rect(x, 147, 2, 4, '#7a5a14')
  px.rect(76, 134, 14, 10, '#b03a30'); px.rect(76, 134, 14, 1, '#d85a48'); for (let x = 78; x < 90; x += 4) { px.rect(x, 137, 2, 4, '#6a1e1a'); px.rect(x, 131, 2, 3, '#5a3a22'); px.set(x, 130, '#d8c8a0') }
  for (let i = 0; i < 26; i++) { const x = 224 + Math.round(i * 0.2), y = 153 - i; px.rect(x, y, 2, 1, i < 3 ? '#2a2a3a' : i > 22 ? '#8a6a3a' : i % 6 === 0 ? '#3a629a' : '#4a7ab8') } px.rect(229, 126, 3, 1, '#8a6a3a'); px.set(231, 127, '#8a6a3a')
  const lantern = [0, 1].map((k) => {
    const g = layer(), cx = 88 + k
    g.rect(88, 76, 1, 5, '#1a1210')
    for (let y = 0; y < 18; y++) { const hw = Math.round(6 * Math.sqrt(1 - ((y - 8.5) / 9.5) ** 2)); for (let x = -hw; x <= hw; x++) g.set(cx + x, 83 + y, x < -hw + 2 ? '#f6705a' : x > hw - 2 ? '#9a2420' : '#dc3c2e') }
    for (const yy of [86, 89, 92, 95, 98]) for (let x = -6; x <= 6; x++) { const cur = g.get(cx + x, yy); if (cur) g.set(cx + x, yy, mix(cur, '#000000', 0.2)) }
    g.rect(cx - 1, 87, 3, 9, '#fff0d8'); g.rect(cx, 88, 1, 7, '#2a1810'); g.rect(cx - 1, 88, 3, 1, '#2a1810'); g.rect(cx - 1, 94, 3, 1, '#2a1810')
    g.rect(cx - 3, 81, 7, 2, '#1a1210'); g.rect(cx - 3, 101, 7, 2, '#1a1210'); g.rect(cx, 103, 1, 3, '#e8c05a')
    return g
  })
  sprite(px, 233, 142, [
    '.e.....e..',
    '.oe...eo..',
    '.wwwwwww..',
    '.wkwwwkw..',
    '.wwwpwww..',
    '..wwwww...',
    '..wwooww..',
    '.wwwoooww.',
    '.wwwwooww.',
    '.wwwwwwww.',
    '.wwwwwwww.',
    '.ww.ww.ww.',
  ], { w: '#f4f0e8', o: '#e89a4a', e: '#e89a4a', k: '#2a1c1c', p: '#ff9ab0' })
  const tail = [0, 1].map((k) => { const g = layer(); for (const [x, y] of k ? [[242, 152], [243, 152], [244, 151], [245, 150]] : [[242, 151], [243, 150], [243, 149], [244, 148]]) g.set(x, y, '#e89a4a'); return g })

  // Steam off the pot and the bowls, and smoke from the stove pipe.
  const steam = [0, 1, 2].map((k) => {
    const g = layer()
    for (let i = 0; i < 9; i++) { const y = 104 - i * 3 - k, x = 114 + Math.round(Math.sin(i * 0.9 + k * 2.1) * 3), c = mix('#fff6e4', '#e8a050', Math.min(0.7, i * 0.08)); g.rect(x, y, 2, 1, c); if (i % 2) g.set(x + (k % 2), y - 1, c) }
    for (const bx of [153, 200]) for (let i = 0; i < 3; i++) g.set(bx + ((i + k) % 2), 114 - i * 2 - (k % 2), '#fff6e4')
    for (let i = 0; i < 8; i++) { const y = 50 - i * 4 - k, x = 197 + Math.round(Math.sin(i * 0.8 + k * 2) * (1 + i * 0.5)); g.rect(x, y, 2 + (i > 3 ? 1 : 0), 2, mix('#8a8ea8', skyAt(y), Math.min(0.8, i * 0.11))) }
    return g
  })
  // Light shimmering on the wet road: warm under the stall, red, pink, and blue to the sides.
  const refl = [0, 1].map(() => layer())
  const streaks = (x0, x1, c, n) => { for (let i = 0; i < n; i++) { const x = x0 + Math.floor(rnd() * (x1 - x0)), y0 = 162 + Math.floor(rnd() * 30), L = 3 + Math.floor(rnd() * 5); for (let y = y0; y < Math.min(ROWS, y0 + L); y++) refl[(y + i) % 2].set(x + ((y + i) % 2), y, mix('#10111e', c, Math.max(0.18, 0.6 - (y - 162) * 0.012))) } }
  streaks(104, 218, '#ffa850', 46); streaks(82, 96, '#e84a3a', 7); streaks(54, 70, '#ff5aa8', 8); streaks(284, 310, '#9ad8ff', 12)
  // Rain everywhere but under the roof, with little splashes.
  const rain = [0, 1, 2].map((k) => {
    const g = layer()
    for (let i = 0; i < 150; i++) { const x = (i * 37 + k * 61) % COLS, y = (i * 53 + k * 47) % (ROWS - 4); if (x > 91 && x < 229 && y > 66 && y < 150) continue; const c = i % 3 ? '#4a5488' : '#6a76ac'; g.set(x, y, c); g.set(x, y + 1, c); g.set(x - 1, y + 2, c) }
    for (let i = 0; i < 16; i++) { const x = (i * 71 + k * 29) % COLS, y = 150 + ((i * 17 + k * 11) % 48); if (x > 96 && x < 224 && y < 156) continue; g.set(x - 1, y, '#8a94c4'); g.set(x + 1, y, '#8a94c4') }
    g.set(93, 80 + k * 9, '#9ad0ff'); g.set(227, 84 + k * 9, '#9ad0ff')
    return g
  })

  return svgDoc({
    defs: `<radialGradient id="warm"><stop offset="0" stop-color="${WARM}" stop-opacity=".34"/><stop offset=".5" stop-color="${WARM}" stop-opacity=".12"/><stop offset="1" stop-color="${WARM}" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="red"><stop offset="0" stop-color="#ff6a4a" stop-opacity=".4"/><stop offset="1" stop-color="#ff6a4a" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="cold"><stop offset="0" stop-color="#9ad8ff" stop-opacity=".3"/><stop offset="1" stop-color="#9ad8ff" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="pink"><stop offset="0" stop-color="#ff5aa8" stop-opacity=".3"/><stop offset="1" stop-color="#ff5aa8" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="wet"><stop offset="0" stop-color="${WARM}" stop-opacity=".3"/><stop offset="1" stop-color="${WARM}" stop-opacity="0"/></radialGradient><clipPath id="road"><rect y="${160 * P}" width="${W}" height="${40 * P}"/></clipPath>`,
    css: FRAME_CSS + `@keyframes pulse{0%{opacity:1}50%{opacity:.86}}`,
    body:
      sky + finish() + frames(beacon, 1.6) + frames(signs, 2.7) + frames(chef, 1.6) + frames(noren, 1.6) + frames(heads, 2.4) + frames(lantern, 2.4) + frames(tail, 1.2) +
      `<ellipse cx="${160 * P}" cy="${160 * P}" rx="${78 * P}" ry="${40 * P}" fill="url(#wet)" clip-path="url(#road)"/>` + frames(refl, 1.2) +
      `<g style="animation:pulse 2.4s steps(1,end) infinite"><circle cx="${160 * P}" cy="${106 * P}" r="460" fill="url(#warm)"/></g>` +
      `<circle cx="${88 * P}" cy="${92 * P}" r="120" fill="url(#red)"/><circle cx="${297 * P}" cy="${126 * P}" r="170" fill="url(#cold)"/><circle cx="${62 * P}" cy="${51 * P}" r="130" fill="url(#pink)"/>` +
      frames(steam, 1.2) + frames(rain, 0.3),
  })
}
