// The New York skyline at dusk, drawn like a 16-bit console scene: across a calm harbor rise One
// World Trade, the Empire State Building with its crown cycling red, white, and blue, the Chrysler
// Building's steel crown, and the pencil towers of Billionaires' Row, in front of hazy layers of
// city. The Statue of Liberty stands small on her island to the left, torch flickering. Windows
// twinkle, beacons blink, a ferry crosses, a helicopter passes, and the lights shimmer on the water.
// Original art on a 320 x 200 grid of 5-unit pixels. Every change lands on the shared 0.1 s tick.
import { H, W, rng, svgDoc } from './_lib.mjs'
import { COLS, FRAME_CSS, P, ROWS, bands, canvas, frames, layer, mix, ramp, sprite } from './_bit16.mjs'

const HZ = 150

export default function scene() {
  const rnd = rng(0x9c12)
  const { px, V, finish } = canvas()
  const skyAt = ramp(['#0a0e24', '#131a3c', '#262658', '#4a306e', '#8c3e72', '#d8705e', '#ffb06c'], 0, HZ, 7)
  const waterAt = ramp(['#8a4a62', '#3a2c5e', '#181c42', '#0b0f28'], HZ, ROWS, 6)
  const sky = bands(0, HZ, skyAt) + bands(HZ, ROWS, waterAt)

  // Twinkling windows live in three frame layers; anything drawn later clears what it covers.
  const tw = [0, 1, 2].map(() => layer())
  const clear = (x, y) => { if (x >= 0 && x < COLS && y >= 0 && y < ROWS) for (const g of tw) g.g[y][x] = null }
  const dot = (x, y, c) => { px.set(x, y, c); clear(x, y) }
  const box = (x, y, w, h, c) => { V(x, y, w, h, c); for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) clear(x + i, y + j) }
  // A window one pixel wide and two tall; a few of them blink off now and then.
  const win = (x, y, c, wall) => { const low = mix(c, wall, 0.4); if (rnd() < 0.07) { const s = Math.floor(rnd() * 3); tw.forEach((g, k) => { if (k !== s) { g.set(x, y, c); g.set(x, y + 1, low) } }) } else { px.set(x, y, c); px.set(x, y + 1, low) } }
  // An ordinary building: flat wall, lit left edge, an orderly window grid with some floors busier.
  const tower = (x, w, top, wall, edge, lamp, p, roof = 0) => {
    box(x, top, w, HZ - top, wall); if (edge) box(x, top, 1, HZ - top, edge)
    if (roof === 1) box(x + Math.floor(w / 2), top - 7, 1, 7, wall)
    if (roof === 2) { box(x + 2, top - 4, 5, 4, wall); box(x + 3, top - 5, 3, 1, wall) }
    if (roof === 3) { box(x + 2, top - 3, w - 4, 3, wall); box(x + 4, top - 5, w - 8, 2, wall) }
    if (!lamp) return
    for (let y = top + 3; y < HZ - 4; y += 4) { const busy = rnd() < 0.45; for (let xx = x + 2; xx < x + w - 1; xx += 3) if (rnd() < (busy ? p * 1.7 : p * 0.45)) win(xx, y, lamp, wall) }
  }

  // Stars, a crescent moon, and three long clouds lit from below by the last light.
  const sparkle = [0, 1].map(() => layer())
  for (let i = 0; i < 44; i++) { const x = Math.floor(rnd() * COLS), y = Math.floor(rnd() * 56); px.set(x, y, mix(skyAt(y), '#ffffff', 0.3 + (i % 3) * 0.25)); if (i % 7 === 0) { const g = sparkle[i % 2], s = mix(skyAt(y), '#ffffff', 0.45); g.set(x, y, '#ffffff'); g.set(x - 1, y, s); g.set(x + 1, y, s); g.set(x, y - 1, s); g.set(x, y + 1, s) } }
  for (let y = -8; y <= 8; y++) for (let x = -8; x <= 8; x++) if (x * x + y * y <= 64 && (x - 4) ** 2 + (y + 2) ** 2 > 52) px.set(40 + x, 26 + y, x + y < -4 ? '#fffbe8' : '#f4e6c0')
  const cloud = (x0, y, len) => { for (let r = 0; r < 4; r++) { const inset = [10, 3, 0, 6][r], c = [mix(skyAt(y), '#2a2250', 0.5), mix(skyAt(y), '#3a2a5c', 0.55), mix(skyAt(y), '#c8688a', 0.5), mix(skyAt(y), '#ffc08a', 0.7)][r]; px.rect(x0 + inset, y + r, len - inset * 2 - (r === 0 ? 8 : 0), 1, c) } }
  cloud(96, 84, 86); cloud(206, 100, 100); cloud(8, 112, 70); cloud(150, 120, 60)

  // A far shore behind the statue, then the city in three depths: haze, middle, and (later) front.
  box(0, 147, 74, 3, '#3a2c58'); for (let x = 3; x < 72; x += 7) px.set(x, 148, '#e8a878')
  for (let x = 66; x < COLS;) { const w = 10 + Math.floor(rnd() * 14), top = 100 + Math.floor(rnd() * 32); tower(x, w, top, '#5a3a72', null, null, 0, rnd() < 0.3 ? 1 : 0); x += w }
  for (let x = 70; x < COLS;) { const w = 12 + Math.floor(rnd() * 10), top = 92 + Math.floor(rnd() * 34); tower(x, w, top, '#2c2658', '#3a3470', '#e8a878', 0.2, Math.floor(rnd() * 4)); x += w + 2 }

  // One World Trade: a tapering glass tower of triangular facets with a tall mast.
  const WT = 96
  for (let y = 46; y < HZ; y++) { const t = (y - 46) / (HZ - 46), hw = Math.round(6 + 3 * t), fw = Math.round(9 * t); for (let dx = -hw; dx <= hw; dx++) { let c = Math.abs(dx) <= fw ? (dx > 0 ? '#3f6ba4' : '#5788c4') : '#253e6c'; if (y % 6 === 0) c = mix(c, '#ffffff', 0.1); dot(WT + dx, y, c) } }
  for (let y = 54; y < HZ - 4; y += 4) for (let dx = -7; dx <= 7; dx += 3) if (rnd() < 0.12) win(WT + dx, y, '#e2f2ff', '#3f6ba4')
  for (let dx = -6; dx <= 6; dx++) { dot(WT + dx, 45, '#a8cdf0'); dot(WT + dx, 44, '#6f9fd0') }
  for (let y = 20; y < 44; y++) dot(WT, y, y > 38 ? '#e8f0ff' : '#b8c6de'); for (const dx of [-1, 1]) { dot(WT + dx, 42, '#b8c6de'); dot(WT + dx, 43, '#b8c6de') }

  // The Empire State Building: limestone setbacks with vertical piers, a lit crown, an antenna.
  const ES = 150, TIERS = [[14, 124, HZ], [12, 112, 124], [9, 62, 112], [7, 54, 62], [5, 47, 54], [4, 41, 47], [3, 35, 41], [2, 29, 35], [1, 26, 29]]
  const stone = (dx, hw, y, y0) => (y === y0 ? '#807e9e' : dx < -hw + 2 ? '#62608a' : dx > hw - 2 ? '#2c2c4c' : (dx + 40) % 2 ? '#4a4a72' : '#3c3c60')
  for (const [hw, y0, y1] of TIERS) for (let y = y0; y < y1; y++) for (let dx = -hw; dx <= hw; dx++) dot(ES + dx, y, stone(dx, hw, y, y0))
  for (const [hw, y0, y1] of TIERS.slice(0, 3)) for (let y = y0 + 3; y < y1 - 2; y += 4) for (let dx = -hw + 2; dx < hw - 1; dx += 2) if ((dx + 40) % 2 === 0 && rnd() < 0.3) win(ES + dx, y, '#ffd890', '#3c3c60')
  for (let y = 9; y < 26; y++) dot(ES, y, '#a4a4c0')
  const crown = ['#ff5a5a', '#fff4d8', '#6aa8ff'].map((c) => { const g = layer(); for (const [hw, y0, y1] of TIERS.slice(3)) for (let y = y0; y < y1; y++) for (let dx = -hw; dx <= hw; dx++) g.set(ES + dx, y, y === y0 || Math.abs(dx) === hw ? c : (dx + 40) % 2 ? mix(c, '#3c3c60', 0.3) : mix(c, '#3c3c60', 0.55)); return g })

  // The Chrysler Building: brick shaft, eagle corners, and the stainless crown of stacked arches.
  const CH = 198
  for (let y = 76; y < HZ; y++) { const hw = y >= 118 ? 10 : 7; for (let dx = -hw; dx <= hw; dx++) dot(CH + dx, y, y === 76 || y === 118 ? '#7c7c9e' : dx < -hw + 2 ? '#5c5c84' : dx > hw - 2 ? '#2c2c4c' : (dx + 40) % 2 ? '#48486e' : '#3a3a5e') }
  for (let y = 80; y < HZ - 4; y += 4) for (let dx = -5; dx <= 5; dx += 2) if ((dx + 40) % 2 === 1 && rnd() < 0.28) win(CH + dx, y, '#ffd890', '#3a3a5e')
  for (const dx of [-9, -8, 8, 9]) dot(CH + dx, 76, '#ccd6ea'); for (const dx of [-11, 11]) dot(CH + dx, 118, '#ccd6ea')
  const chw = (y) => Math.round(7 * Math.pow((y - 44) / 32, 0.6))
  for (let y = 44; y <= 76; y++) for (let dx = -chw(y); dx <= chw(y); dx++) dot(CH + dx, y, dx < 0 ? '#b4c0da' : '#7e8ab0')
  for (const yb of [76, 70, 64, 58, 52]) { const w = chw(yb); for (let dx = -w; dx <= w; dx++) { const ay = yb - 1 - Math.round(4 * Math.sqrt(Math.max(0, 1 - (dx / (w + 0.5)) ** 2))); dot(CH + dx, ay, '#f2f6ff'); if (Math.abs(dx) % 2 === 1 && ay + 1 < yb) dot(CH + dx, ay + 1, '#ffe890') } }
  for (let y = 22; y < 46; y++) dot(CH, y, y < 32 ? '#aab6d0' : '#e2e8f8')

  // Billionaires' Row: a slender gridded tower, a feathered pencil tower, a tall glass tower with an
  // overhang, and a blue tower with a curved top.
  const PK = 236
  for (let y = 34; y < HZ; y++) for (let dx = -4; dx <= 4; dx++) { const gap = (y - 34) % 14 >= 12; let c = gap ? '#141a34' : dx > 1 ? '#7c82a2' : '#a2a8c0'; if (!gap && (dx + 4) % 2 === 1 && y % 2 === 0) c = rnd() < 0.2 ? '#ffe2a0' : '#262e50'; dot(PK + dx, y, c) }
  const ST = 256
  for (let y = 28; y < HZ; y++) { const right = y >= 74 ? 2 : y >= 56 ? 1 : y >= 44 ? 0 : y >= 36 ? -1 : -2; for (let dx = -2; dx <= right; dx++) dot(ST + dx, y, dx === -2 || dx === right ? (y % 3 ? '#c4945c' : '#e4b87c') : rnd() < 0.16 ? '#ffe2a0' : '#35507e') }
  const CP = 276
  for (let y = 24; y < HZ; y++) { const right = y < 98 ? 7 : 5; for (let dx = -5; dx <= right; dx++) dot(CP + dx, y, y % 12 === 0 ? '#2a4674' : dx > 3 ? '#2e4c7c' : (dx + 5) % 3 === 0 ? '#6a96cc' : '#42689c') }
  for (let y = 19; y < 24; y++) for (let dx = -3; dx <= (y < 21 ? 1 : 4); dx++) dot(CP + dx, y, '#6a96cc')
  for (let y = 30; y < HZ - 4; y += 4) for (let dx = -4; dx <= 4; dx += 3) if (rnd() < 0.12) win(CP + dx, y, '#e2f2ff', '#42689c')
  const O57 = 300
  for (let y = 58; y < HZ; y++) { const left = y < 68 ? -6 + Math.round(((68 - y) / 10) ** 2 * 7) : -6; for (let dx = left; dx <= 6; dx++) dot(O57 + dx, y, (dx + Math.floor(y / 10) + 30) % 4 < 2 ? '#5a8cd0' : (dx + Math.floor(y / 10) + 30) % 4 === 2 ? '#3a64a8' : '#2c4c88') }

  // The front row along the water, then the seawall with dock lights.
  for (let x = 62; x < COLS;) { const w = 14 + Math.floor(rnd() * 12), top = 122 + Math.floor(rnd() * 18); tower(x, w, top, '#15173a', '#22265a', '#ffd890', 0.3, rnd() < 0.5 ? 2 : 0); x += w + 1 }
  box(58, HZ - 1, 262, 2, '#0a0c1e'); for (let x = 62; x < COLS; x += 8) px.set(x, HZ - 1, '#ffd890')

  // Liberty Island, small and far off: trees, the fort, the pedestal, and the statue.
  const SX = 30, FEET = 135
  for (let x = 8; x < 54; x++) { const top = 151 - Math.round(1.6 * Math.sin(((x - 8) / 46) * Math.PI)); px.rect(x, top, 1, 153 - top, '#121a22') }
  for (const [x, r] of [[11, 2], [15, 3], [47, 3], [51, 2]]) for (let y = -r; y <= 0; y++) for (let xx = -r; xx <= r; xx++) if (xx * xx + y * y <= r * r) px.set(x + xx, 150 + y, y < -r / 2 ? '#2a4a40' : '#18302c')
  for (let y = 148; y < 151; y++) for (let dx = -12 - (y - 148); dx <= 12 + (y - 148); dx++) px.set(SX + dx, y, y === 148 ? '#b0aac0' : dx > 4 ? '#5e5a74' : '#827c96')
  for (let dx = -10; dx <= 10; dx += 4) px.set(SX + dx, 149, '#ffd890')
  for (let y = FEET; y < 148; y++) { const hw = y === FEET ? 5 : y < 145 ? 4 : 6; for (let dx = -hw; dx <= hw; dx++) px.set(SX + dx, y, y === FEET || y === 145 ? '#c0bace' : dx < -hw + 2 ? '#aaa4ba' : dx > hw - 2 ? '#5e5a74' : '#86809a') }
  for (const dx of [-2, 0, 2]) px.rect(SX + dx, 138, 1, 5, '#3a3650')
  sprite(px, SX - 7, FEET - 26, [
    '.............',
    '..t..........',
    '..t..........',
    '..g..........',
    '..g...s.s.s..',
    '..g....sss...',
    '..gg..sgggs..',
    '...g..gllg...',
    '...g..gllg...',
    '...gg..gg....',
    '....ggggggg..',
    '....gglgggbb.',
    '.....glgggbb.',
    '.....glgdgbb.',
    '.....glgdgg..',
    '.....glgdgg..',
    '....gglgdgg..',
    '....gllgdgg..',
    '....gllgdggg.',
    '....gllgddgg.',
    '....gllgddgg.',
    '...ggllgddgg.',
    '...ggllggdgg.',
    '...gglllgdgg.',
    '...gglllgdgg.',
    '...ggggggggg.',
  ], { g: '#5fae96', l: '#9adcc0', d: '#3f8272', s: '#c2f0d8', b: '#8fd4b8', t: '#e8c05a' })
  const flame = [0, 1, 2].map((k) => { const g = layer(), x = SX - 5, y = FEET - 25; g.set(x, y, '#ffb040'); g.set(x, y - 1, '#ffd86a'); g.set(x + k - 1, y - 2, k === 1 ? '#fff4b0' : '#ffb040'); if (k !== 1) g.set(x, y - 2, '#ffd86a'); return g })

  // Beacons, soft reflections under the landmarks, and a few glints that shimmer.
  const beacon = [0, 1].map((k) => { const g = layer(); if (!k) for (const [x, y] of [[WT, 19], [ES, 8], [CH, 21], [CP - 1, 18], [PK, 33], [ST - 2, 27]]) { g.set(x, y, '#ff4a5a'); g.set(x, y + 1, '#ff8a8a') } return g })
  const glow = [[WT, 9, '#9ccaff', 34], [ES, 10, '#fff0c8', 40], [CH, 7, '#eef2ff', 36], [PK, 4, '#dfe6ff', 32], [ST, 2, '#ffd9a0', 34], [CP, 6, '#9ccaff', 36], [O57, 6, '#8ab8ff', 26], [SX, 5, '#a8e8cc', 14]]
  const columns = glow.map(([x, hw, c, depth], i) => `<rect x="${(x - hw) * P}" y="${(HZ + 1) * P}" width="${(hw * 2 + 1) * P}" height="${depth * P}" fill="url(#rf${i})"/>`).join('')
  const shimmer = [0, 1].map(() => layer())
  for (let i = 0; i < 90; i++) { const [x, hw, c, depth] = glow[i % glow.length], xx = x - hw + Math.floor(rnd() * (hw * 2 + 1)), y = HZ + 3 + Math.floor(rnd() * depth), col = mix(waterAt(y), c, Math.max(0.2, 0.7 - (y - HZ) / (depth * 1.3))); shimmer[i % 2].rect(xx, y, 1 + (i % 3), 1, col) }
  for (let i = 0; i < 46; i++) { const x = 60 + Math.floor(rnd() * 260), y = HZ + 2 + Math.floor(rnd() * 8); shimmer[i % 2].rect(x, y, 2 + (i % 3), 1, mix(waterAt(y), '#ffd8a0', 0.5)) }
  for (let y = 164; y < ROWS; y += 6) for (let x = (y * 17) % 41; x < COLS; x += 41) px.rect(x, y, 7, 1, mix(waterAt(y), '#ffffff', 0.07))

  // The ferry and the helicopter.
  const ferry = layer()
  ferry.rect(9, 166, 4, 2, '#f09a3a'); ferry.rect(27, 166, 4, 2, '#f09a3a'); ferry.rect(19, 164, 2, 4, '#3a3040')
  ferry.rect(7, 168, 26, 2, '#f09a3a'); ferry.rect(7, 168, 26, 1, '#ffb85a'); ferry.rect(3, 170, 34, 3, '#e07a22'); ferry.rect(4, 173, 32, 1, '#4a2a2a')
  for (let x = 9; x < 32; x += 2) ferry.set(x, 169, '#fff4c8'); for (let x = 6; x < 35; x += 2) ferry.set(x, 171, '#fff4c8')
  for (const [x, y] of [[0, 174], [1, 173], [2, 174], [4, 174]]) ferry.set(x, y, '#e8f0ff')
  const heli = [0, 1].map((k) => { const g = layer(); g.rect(306, 66, 6, 3, '#14142a'); g.rect(312, 67, 5, 1, '#14142a'); g.set(317, 66, '#14142a'); g.set(307, 67, '#9ac8ff'); g.rect(305 + (k ? 2 : 0), 64, k ? 4 : 9, 1, '#5a5a78'); g.set(309, 65, '#14142a'); if (k) g.set(308, 69, '#ff4a5a'); return g })

  return svgDoc({
    defs: glow.map(([, , c], i) => `<linearGradient id="rf${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}" stop-opacity=".34"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></linearGradient>`).join('') +
      `<radialGradient id="torch"><stop offset="0" stop-color="#ffc060" stop-opacity=".6"/><stop offset="1" stop-color="#ffc060" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="halo"><stop offset="0" stop-color="#fff4d8" stop-opacity=".28"/><stop offset="1" stop-color="#fff4d8" stop-opacity="0"/></radialGradient>` +
      `<linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9a6c" stop-opacity="0"/><stop offset="1" stop-color="#ff9a6c" stop-opacity=".2"/></linearGradient>`,
    css: FRAME_CSS + `@keyframes ferry{0%{transform:translate(-220px,0)}100%{transform:translate(1680px,0)}}@keyframes heli{0%{transform:translate(120px,0)}100%{transform:translate(-1680px,0)}}`,
    body:
      sky + frames(sparkle, 2.4) + finish() + frames(tw, 3.6) + frames(crown, 9) + frames(beacon, 1.6) + frames(flame, 0.6) +
      `<rect y="${100 * P}" width="${W}" height="${50 * P}" fill="url(#haze)"/>` +
      `<circle cx="${(SX - 5) * P}" cy="${(FEET - 26) * P}" r="46" fill="url(#torch)"/><circle cx="${ES * P}" cy="${40 * P}" r="120" fill="url(#halo)"/>` +
      columns + frames(shimmer, 1.2) +
      `<g style="animation:ferry 76s steps(380,end) -30s infinite">${ferry.svg(P)}</g>` +
      `<g style="animation:heli 45s steps(450,end) -8s infinite">${frames(heli, 0.2)}</g>`,
  })
}
