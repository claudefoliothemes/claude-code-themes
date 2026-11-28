// The New York skyline at dusk, drawn like a 16-bit console scene: the Statue of Liberty stands in
// the foreground with her torch flickering, and across the harbor rise One World Trade, the Empire
// State Building with its crown cycling red, white, and blue, the Chrysler Building's steel crown,
// and the pencil towers of Billionaires' Row. Windows twinkle, beacons blink, a ferry crosses, a
// helicopter passes, and the city lights shimmer on the water.
// Original art on a 320 x 200 grid of 5-unit pixels. Every change lands on the shared 0.1 s tick.
import { H, W, rng, svgDoc } from './_lib.mjs'
import { COLS, FRAME_CSS, P, ROWS, bands, canvas, frames, layer, mix, ramp } from './_bit16.mjs'

const HZ = 150
const WARMS = ['#ffd890', '#ffc870', '#fff0c0', '#ffb060']

export default function scene() {
  const rnd = rng(0x9c11)
  const { px, V, finish } = canvas()
  const skyAt = ramp(['#090d22', '#121838', '#252456', '#4c2f6c', '#963f70', '#e2785c', '#ffb46c'], 0, HZ, 6)
  const waterAt = ramp(['#7a4460', '#32285a', '#161a3e', '#0b0f26'], HZ, ROWS, 5)
  const sky = bands(0, HZ, skyAt) + bands(HZ, ROWS, waterAt)

  // Windows that twinkle live in three frame layers; anything drawn later clears what it covers.
  const tw = [0, 1, 2].map(() => layer())
  const clear = (x, y) => { if (x >= 0 && x < COLS && y >= 0 && y < ROWS) for (const g of tw) g.g[y][x] = null }
  const dot = (x, y, c) => { px.set(x, y, c); clear(x, y) }
  const lit = (x, y, c) => { if (rnd() < 0.09) { const s = Math.floor(rnd() * 3); tw.forEach((g, k) => { if (k !== s) g.set(x, y, c) }); px.set(x, y, mix(c, '#1a1c3a', 0.7)) } else px.set(x, y, c) }
  const block = (x, w, top, color, p, edge, cols = WARMS) => {
    V(x, top, w, HZ - top, color); for (let yy = top; yy < HZ; yy++) for (let xx = x; xx < x + w; xx++) clear(xx, yy)
    if (edge) V(x, top, 1, HZ - top, edge)
    for (let y = top + 2; y < HZ - 1; y += 3) for (let xx = x + 1; xx < x + w - 1; xx += 2) if (rnd() < p) lit(xx, y, cols[Math.floor(rnd() * cols.length)])
  }

  // Stars, a crescent moon, and clouds lit from below by the sunset.
  const sparkle = [0, 1].map(() => layer())
  for (let i = 0; i < 70; i++) { const x = Math.floor(rnd() * COLS), y = Math.floor(rnd() * 62); px.set(x, y, mix(skyAt(y), '#ffffff', 0.3 + (i % 3) * 0.25)); if (i % 8 === 0) { const g = sparkle[i % 2], s = mix(skyAt(y), '#ffffff', 0.45); g.set(x, y, '#ffffff'); g.set(x - 1, y, s); g.set(x + 1, y, s); g.set(x, y - 1, s); g.set(x, y + 1, s) } }
  for (let y = -8; y <= 8; y++) for (let x = -8; x <= 8; x++) if (x * x + y * y <= 64 && (x - 4) ** 2 + (y + 2) ** 2 > 52) px.set(26 + x, 22 + y, x + y < -4 ? '#fffbe8' : '#f4e6c0')
  for (const [x0, y, len] of [[96, 104, 60], [150, 112, 80], [40, 118, 50], [230, 100, 70], [200, 122, 90], [90, 128, 60], [10, 108, 30]]) for (let i = 0; i < len; i++) { const e = Math.min(i, len - i); if (e > 2 || i % 2) px.set(x0 + i, y, mix(skyAt(y), '#ffc890', 0.5)); if (e > 8) px.set(x0 + i, y - 1, mix(skyAt(y - 1), '#3a2a5a', 0.55)); if (e > 14 && i % 3) px.set(x0 + i, y + 1, mix(skyAt(y + 1), '#ffd8a8', 0.6)) }

  // Three depths of ordinary buildings: hazy far, lit middle.
  for (let x = 74; x < COLS;) { const w = 6 + Math.floor(rnd() * 9), top = 92 + Math.floor(rnd() * 36); block(x, w, top, '#3f3266', 0.1, null, ['#d8a070', '#c89068']); x += w }
  for (let x = 78; x < COLS;) { const w = 8 + Math.floor(rnd() * 10), top = 80 + Math.floor(rnd() * 46); block(x, w, top, '#1c1e40', 0.3, '#2a2e58'); if (rnd() < 0.3) { V(x + Math.floor(w / 2), top - 6, 1, 6, '#1c1e40'); V(x + 2, top - 2, w - 4, 2, '#1c1e40') } x += w + (rnd() < 0.2 ? 2 : 0) }

  // One World Trade: a tapering glass tower of triangular facets with a tall mast.
  const WT = 110
  for (let y = 46; y < HZ; y++) { const t = (y - 46) / (HZ - 46), hw = Math.round(6 + 3 * t), fw = Math.round(9 * t); for (let dx = -hw; dx <= hw; dx++) { let c = Math.abs(dx) <= fw ? (dx > 0 ? '#3f6ba4' : '#5384c0') : '#253e6c'; if (y % 5 === 0) c = mix(c, '#ffffff', 0.1); dot(WT + dx, y, c) } }
  for (let y = 50; y < HZ - 2; y += 3) for (let dx = -8; dx <= 8; dx += 2) if (rnd() < 0.13 && px.get(WT + dx, y) && px.get(WT + dx, y) !== 'V') lit(WT + dx, y, '#e2f2ff')
  for (let dx = -6; dx <= 6; dx++) { dot(WT + dx, 45, '#a8cdf0'); dot(WT + dx, 44, '#6f9fd0') }
  for (let y = 20; y < 44; y++) dot(WT, y, y > 38 ? '#e8f0ff' : '#b8c6de'); for (const dx of [-1, 1]) { dot(WT + dx, 42, '#b8c6de'); dot(WT + dx, 43, '#b8c6de') }

  // The Empire State Building: limestone setbacks, a lit crown, and an antenna.
  const ES = 178, TIERS = [[13, 118, HZ], [11, 104, 118], [8, 58, 104], [6, 50, 58], [4, 44, 50], [3, 38, 44], [2, 31, 38], [1, 28, 31]]
  for (const [hw, y0, y1] of TIERS) for (let y = y0; y < y1; y++) for (let dx = -hw; dx <= hw; dx++) dot(ES + dx, y, y === y0 ? '#6a6888' : dx < -hw + 2 ? '#4c4a6c' : dx > hw - 2 ? '#2a2a48' : (dx + 20) % 2 ? '#3a3a5c' : '#32325a')
  for (const [hw, y0, y1] of TIERS.slice(0, 3)) for (let y = y0 + 2; y < y1 - 1; y += 2) for (let dx = -hw + 1; dx < hw; dx += 2) if (rnd() < 0.36) lit(ES + dx, y, WARMS[Math.floor(rnd() * 4)])
  for (let y = 12; y < 28; y++) dot(ES, y, '#9a9ab8')
  const crown = ['#ff5a5a', '#fff4d8', '#6aa8ff'].map((c) => { const g = layer(); for (const [hw, y0, y1] of TIERS.slice(3)) for (let y = y0; y < y1; y++) for (let dx = -hw; dx <= hw; dx++) g.set(ES + dx, y, y === y0 || Math.abs(dx) === hw ? c : (dx + 20) % 2 ? mix(c, '#38385a', 0.3) : mix(c, '#38385a', 0.55)); return g })

  // The Chrysler Building: brick shaft, eagle corners, and the stainless sunburst crown and spire.
  const CH = 226
  for (let y = 72; y < HZ; y++) { const hw = y >= 112 ? 9 : 6; for (let dx = -hw; dx <= hw; dx++) dot(CH + dx, y, dx < -hw + 2 ? '#50506e' : dx > hw - 2 ? '#2c2c4a' : '#3c3c5e') }
  for (let y = 75; y < HZ - 1; y += 2) for (let dx = -8; dx <= 8; dx += 2) if (px.get(CH + dx, y) === '#3c3c5e' && rnd() < 0.34) lit(CH + dx, y, WARMS[Math.floor(rnd() * 4)])
  for (const dx of [-8, -7, 7, 8]) dot(CH + dx, 72, '#c2cce0'); for (const dx of [-10, 10]) dot(CH + dx, 112, '#c2cce0')
  const chw = (y) => Math.round(6 * Math.pow((y - 42) / 30, 0.62))
  for (let y = 42; y <= 72; y++) for (let dx = -chw(y); dx <= chw(y); dx++) dot(CH + dx, y, dx < 0 ? '#ccd6ea' : '#8c98ba')
  for (const ya of [47, 52, 57, 62, 67]) for (let dx = -chw(ya) + 1; dx < chw(ya); dx += 2) { dot(CH + dx, ya, '#fff4b8'); if (Math.abs(dx) > 1) dot(CH + dx, ya + 1, '#ffd870') }
  for (let y = 22; y < 42; y++) dot(CH, y, y < 30 ? '#aab6d0' : '#ccd6ea')

  // Billionaires' Row: a slender gridded tower, a feathered pencil tower, a tall glass tower with an
  // overhang, and a blue tower with a curved top.
  const PK = 262
  for (let y = 34; y < HZ; y++) for (let dx = -4; dx <= 4; dx++) { const gap = (y - 34) % 14 >= 12; let c = gap ? '#141a34' : dx > 1 ? '#7c82a2' : '#9ea4bc'; if (!gap && (dx + 4) % 2 === 1 && y % 2 === 0) c = rnd() < 0.24 ? '#ffe2a0' : '#232a4a'; dot(PK + dx, y, c) }
  const ST = 280
  for (let y = 28; y < HZ; y++) { const right = y >= 74 ? 2 : y >= 56 ? 1 : y >= 44 ? 0 : y >= 36 ? -1 : -2; for (let dx = -2; dx <= right; dx++) dot(ST + dx, y, dx === -2 || dx === right ? (y % 3 ? '#c4945c' : '#e0b478') : rnd() < 0.2 ? '#ffe2a0' : '#35507e') }
  const CP = 298
  for (let y = 24; y < HZ; y++) { const right = y < 96 ? 7 : 5; for (let dx = -5; dx <= right; dx++) dot(CP + dx, y, dx > 3 ? '#2a4674' : (dx + 5) % 3 === 0 ? '#5c88be' : '#3c6294') }
  for (let y = 20; y < 24; y++) for (let dx = -3; dx <= 3; dx++) dot(CP + dx, y, '#5c88be')
  for (let y = 28; y < HZ - 1; y += 3) for (let dx = -4; dx <= 4; dx += 2) if (rnd() < 0.14) lit(CP + dx, y, '#e2f2ff')
  const O57 = 313
  for (let y = 56; y < HZ; y++) { const left = y < 64 ? -5 + Math.round(((64 - y) / 8) ** 2 * 6) : -5; for (let dx = left; dx <= 6; dx++) dot(O57 + dx, y, (dx + Math.floor(y / 9)) % 3 === 0 ? '#5a8cd0' : (dx + Math.floor(y / 9)) % 3 === 1 ? '#3a64a8' : '#2c4c88') }

  // A low waterfront row in front, then the seawall with dock lights.
  for (let x = 76; x < COLS;) { const w = 8 + Math.floor(rnd() * 12), top = 130 + Math.floor(rnd() * 14); block(x, w, top, '#111330', 0.34, '#1a1d44'); x += w }
  V(72, HZ - 1, 248, 2, '#0a0c1c'); for (let x = 76; x < COLS; x += 6) px.set(x, HZ - 1, x % 12 ? '#ffd890' : '#ff8a6a')

  // Liberty Island in the foreground: the star fort, the pedestal, and the statue.
  const SX = 42
  for (let x = 0; x < 86; x++) { const top = 153 - Math.round(2.5 * Math.sin((x / 86) * Math.PI)); px.rect(x, top, 1, 160 - top, '#10161e'); px.set(x, top, '#1c2a2a') }
  for (const [x, r] of [[6, 3], [12, 4], [70, 4], [77, 3], [82, 2]]) for (let y = -r; y <= 0; y++) for (let xx = -r; xx <= r; xx++) if (xx * xx + y * y <= r * r) px.set(x + xx, 152 + y, y < -r / 2 ? '#24403a' : '#16282a')
  for (let y = 145; y < 152; y++) { const hw = 22 + (y - 145); for (let dx = -hw; dx <= hw; dx++) px.set(SX + dx, y, y === 145 ? '#a8a2b8' : dx > 8 ? '#5a566e' : '#7a7690') }
  for (let dx = -20; dx <= 20; dx += 5) px.set(SX + dx, 148, '#ffd890')
  const stone = (dx, hw) => (dx < -hw + 2 ? '#aaa4ba' : dx > hw - 3 ? '#5e5a74' : '#86809a')
  for (let y = 112; y < 145; y++) { const hw = y < 115 ? 8 : y < 138 ? 6 : y < 141 ? 8 : 10; for (let dx = -hw; dx <= hw; dx++) px.set(SX + dx, y, y === 112 || y === 138 ? '#bcb6cc' : stone(dx, hw)) }
  for (const dx of [-4, -2, 0, 2, 4]) px.rect(SX + dx, 120, 1, 9, '#3a3650'); px.rect(SX - 2, 139, 5, 6, '#3a3650')
  const GR = ['#3f8272', '#5fae96', '#8fd4b8', '#c2f0d8']
  // Robe with folds, shoulders, the tablet arm, the head, and the crown's rays.
  for (let y = 76; y < 112; y++) { const hw = Math.round(4 + (y - 76) * 0.1); for (let dx = -hw; dx <= hw; dx++) px.set(SX + dx, y, dx === -hw ? GR[0] : (dx + hw + Math.floor((y - 76) / 5)) % 3 === 0 ? GR[0] : dx > 0 ? GR[2] : GR[1]) }
  for (let y = 88; y < 112; y++) px.set(SX - 1 + Math.round((y - 88) * 0.12), y, GR[3])
  for (let dx = -5; dx <= 5; dx++) { px.set(SX + dx, 74, dx > 0 ? GR[2] : GR[1]); px.set(SX + dx, 75, dx > 0 ? GR[2] : GR[1]) }
  px.rect(SX + 4, 76, 3, 5, GR[1]); px.rect(SX + 4, 79, 5, 8, GR[2]); px.rect(SX + 4, 79, 5, 1, GR[3]); px.rect(SX + 8, 79, 1, 8, GR[1])
  px.rect(SX - 1, 72, 3, 2, GR[1]); px.rect(SX - 2, 66, 5, 6, GR[1]); px.rect(SX, 67, 3, 5, GR[2]); px.set(SX - 1, 69, GR[0]); px.set(SX + 1, 69, GR[0]); px.rect(SX - 3, 66, 1, 5, GR[0])
  px.rect(SX - 3, 65, 7, 1, GR[2])
  for (let i = 0; i < 7; i++) { const ang = ((i - 3) / 3) * 1.25; for (let r = 1; r <= (i % 2 ? 4 : 6); r++) px.set(SX + Math.round(Math.sin(ang) * r * 1.15), 65 - Math.round(Math.cos(ang) * r), GR[i > 3 ? 3 : 2]) }
  // The raised arm and the torch.
  for (let i = 0; i < 17; i++) { const x = SX - 5 - Math.round(i * 0.22), y = 75 - i; px.set(x, y, GR[1]); px.set(x - 1, y, GR[0]); if (i < 6) px.set(x + 1, y, GR[2]) }
  px.rect(SX - 10, 55, 3, 4, GR[1]); px.rect(SX - 11, 53, 5, 2, '#e8c05a'); px.rect(SX - 11, 53, 5, 1, '#ffe89a')
  const flame = [0, 1, 2].map((k) => { const g = layer(), x = SX - 9; for (const [dx, dy, c] of [[0, -1, '#ffb040'], [-1, -1, '#ff8a2a'], [1, -1, '#ff8a2a'], [0, -2, '#ffd86a'], [k - 1, -3, '#ffd86a'], [0, -3, '#fff4b0'], [k - 1, -4, '#ffb040'], [(k % 2) * 2 - 1, -2, '#ffb040']]) g.set(x + dx, 53 + dy, c); return g })
  px.rect(SX + 26, 138, 1, 8, '#c8c8d8'); px.rect(SX + 27, 138, 4, 2, '#e85a5a'); px.rect(SX + 27, 140, 4, 1, '#f4f4ff')

  // Beacons, and light on the water: steady glints plus streaks that shimmer.
  const beacon = [0, 1].map((k) => { const g = layer(); if (!k) for (const [x, y] of [[WT, 19], [ES, 11], [CH, 21], [CP, 19], [PK, 33], [ST - 2, 27]]) { g.set(x, y, '#ff4a5a'); g.set(x, y + 1, '#ff8a8a') } return g })
  const shimmer = [0, 1].map(() => layer())
  const streak = (x0, x1, c, n, depth) => { for (let i = 0; i < n; i++) { const x = x0 + Math.floor(rnd() * (x1 - x0)), y = HZ + 2 + Math.floor(rnd() * depth), w = 1 + Math.floor(rnd() * 3), col = mix(waterAt(y), c, Math.max(0.2, 0.75 - (y - HZ) / (depth * 1.4))); if (i % 3 === 0) px.rect(x, y, w, 1, col); else shimmer[i % 2].rect(x, y, w, 1, col) } }
  streak(76, COLS, '#ffcf8a', 150, 16); streak(WT - 8, WT + 8, '#bfe0ff', 26, 40); streak(ES - 10, ES + 10, '#fff0c8', 34, 44); streak(CH - 6, CH + 6, '#e8ecff', 24, 40); streak(PK - 4, O57 + 4, '#bfd8ff', 40, 36); streak(SX - 12, SX + 12, '#9adcc0', 14, 26)
  for (let y = 160; y < ROWS; y += 5) for (let x = (y * 13) % 29; x < COLS; x += 29) px.rect(x, y, 5, 1, mix(waterAt(y), '#ffffff', 0.08))

  // The ferry and the helicopter.
  const ferry = layer()
  ferry.rect(9, 162, 4, 2, '#f09a3a'); ferry.rect(27, 162, 4, 2, '#f09a3a'); ferry.rect(19, 160, 2, 4, '#3a3040')
  ferry.rect(7, 164, 26, 2, '#f09a3a'); ferry.rect(7, 164, 26, 1, '#ffb85a'); ferry.rect(3, 166, 34, 3, '#e07a22'); ferry.rect(4, 169, 32, 1, '#4a2a2a')
  for (let x = 9; x < 32; x += 2) ferry.set(x, 165, '#fff4c8'); for (let x = 6; x < 35; x += 2) ferry.set(x, 167, '#fff4c8')
  for (const [x, y] of [[0, 170], [1, 169], [2, 170], [-2, 170]]) ferry.set(x + 2, y, '#e8f0ff')
  const heli = [0, 1].map((k) => { const g = layer(); g.rect(306, 70, 6, 3, '#14142a'); g.rect(312, 71, 5, 1, '#14142a'); g.set(317, 70, '#14142a'); g.set(307, 71, '#9ac8ff'); g.rect(305 + (k ? 2 : 0), 68, k ? 4 : 9, 1, '#5a5a78'); g.set(309, 69, '#14142a'); if (k) g.set(308, 73, '#ff4a5a'); return g })

  return svgDoc({
    defs: `<radialGradient id="torch"><stop offset="0" stop-color="#ffc060" stop-opacity=".55"/><stop offset="1" stop-color="#ffc060" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="halo"><stop offset="0" stop-color="#fff4d8" stop-opacity=".3"/><stop offset="1" stop-color="#fff4d8" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="dusk" cx=".5" cy="1" r=".8"><stop offset="0" stop-color="#ffb46c" stop-opacity=".22"/><stop offset="1" stop-color="#ffb46c" stop-opacity="0"/></radialGradient>`,
    css: FRAME_CSS + `@keyframes ferry{0%{transform:translate(-220px,0)}100%{transform:translate(1680px,0)}}@keyframes heli{0%{transform:translate(120px,0)}100%{transform:translate(-1680px,0)}}`,
    body:
      sky + frames(sparkle, 2.4) + finish() + frames(tw, 3.6) + frames(crown, 9) + frames(beacon, 1.6) + frames(flame, 0.6) +
      `<rect y="${90 * P}" width="${W}" height="${60 * P}" fill="url(#dusk)"/>` +
      `<circle cx="${(SX - 9) * P}" cy="${51 * P}" r="90" fill="url(#torch)"/><circle cx="${ES * P}" cy="${42 * P}" r="120" fill="url(#halo)"/>` +
      frames(shimmer, 1.2) +
      `<g style="animation:ferry 76s steps(380,end) -30s infinite">${ferry.svg(P)}</g>` +
      `<g style="animation:heli 45s steps(450,end) -12s infinite">${frames(heli, 0.2)}</g>`,
  })
}
