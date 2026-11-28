// An empty classroom at sunset, anime style, drawn like a 16-bit console scene: tall windows glow
// with a pink and orange sky over the town, curtains billow in the breeze, golden light falls across
// the desks with dust drifting in it, cherry petals blow in through the open window, a student sits
// by the window looking out with hair stirring, a clock ticks over a chalkboard full of doodles, and
// crows cross the sky. Original art on a 320 x 200 grid of 5-unit pixels.
// Every change lands on the shared 0.1 s tick.
import { H, W, rng, svgDoc } from './_lib.mjs'
import { COLS, FRAME_CSS, P, ROWS, canvas, frames, hash, layer, mix, ramp, sprite } from './_bit16.mjs'

const SAK = ['#ffe4ef', '#ffc4dc', '#f7a0c6', '#e27aac']

export default function scene() {
  const rnd = rng(0xaf7e)
  const { px, V, finish } = canvas()
  const skyAt = ramp(['#2e2252', '#5a3672', '#9a4a7a', '#e06a72', '#f89a62', '#ffc884'], 6, 112, 5)

  // Back wall in warm shadow, a baseboard, and a wood floor catching the light.
  V(0, 0, COLS, 150, '#5a3a48'); V(0, 0, COLS, 6, '#4a2e3c')
  V(0, 146, COLS, 4, '#3a2430')
  for (let r = 0; r < 13; r++) { const y = 150 + r * 4; V(0, y, COLS, 4, mix('#8a5a44', '#a86a4a', (r % 3) / 3)); V(0, y + 3, COLS, 1, '#6a4234') }

  // Three tall windows: sky, sun, town, a cherry tree, and power lines outside.
  const WINS = [[8, 58], [70, 120], [132, 182]]
  for (const [x0, x1] of WINS) for (let y = 12; y < 112; y += 2) V(x0, y, x1 - x0, 2, skyAt(y))
  for (let y = -12; y <= 12; y++) for (let x = -12; x <= 12; x++) { const d = Math.sqrt(x * x + y * y); if (d <= 12) px.set(100 + x, 96 + y, d > 10 ? '#ffd8a0' : '#fff2d0') }
  for (const [x0, x1] of WINS) for (let x = x0; x < x1; x++) {
    const h = 6 + Math.round(10 * hash(Math.floor(x / 6))) + (Math.floor(x / 6) % 4 === 0 ? 8 : 0)
    for (let y = 112 - h; y < 112; y++) px.set(x, y, y === 112 - h ? '#5a3a5a' : '#3e2a48')
    if (x % 6 === 2 && h > 10) px.set(x, 112 - h + 4, '#ffc884')
    const wire = Math.round(60 + 6 * Math.sin((x / 190) * Math.PI)); px.set(x, wire, '#2a1e30'); px.set(x, wire + 5, '#2a1e30')
  }
  // A cherry tree outside the left window.
  for (let i = 0; i < 40; i++) px.rect(14 + Math.round(i * 0.4), 112 - i, 3, 1, '#3a2630')
  for (const [cx, cy, r] of [[24, 70, 10], [40, 62, 9], [16, 56, 8], [34, 50, 7], [50, 76, 7]]) for (let y = -r; y <= r; y++) for (let x = -r * 1.3; x <= r * 1.3; x++) if ((x / 1.3) ** 2 + y * y <= r * r && hash(x * 7 + y * 13 + cx) > 0.25) { const xx = Math.round(cx + x), yy = cy + y; if (xx >= 8 && xx < 58) px.set(xx, yy, y < -r / 3 ? SAK[1] : y > r / 3 ? SAK[3] : SAK[2]) }
  // Window frames and the sill.
  for (const [x0, x1] of WINS) {
    px.rect(x0 - 3, 9, x1 - x0 + 6, 3, '#e8dccc'); px.rect(x0 - 3, 112, x1 - x0 + 6, 3, '#e8dccc'); px.rect(x0 - 3, 9, 3, 106, '#d4c6b4'); px.rect(x1, 9, 3, 106, '#c4b6a4')
    px.rect(Math.round((x0 + x1) / 2), 12, 2, 100, '#e8dccc'); px.rect(x0, 60, x1 - x0, 2, '#e8dccc')
  }
  px.rect(0, 115, 190, 4, '#d4c6b4'); px.rect(0, 115, 190, 1, '#f4ece0')

  // Curtains, gathered at the sides; the one by the open window billows.
  const curtain = (g, x, w, sway) => { for (let y = 8; y < 116; y++) { const off = Math.round(sway * Math.sin((y - 8) / 30) * ((y - 8) / 108)); for (let i = 0; i < w; i++) g.set(x + i + off, y, i % 3 === 0 ? '#d8ccbc' : i % 3 === 1 ? '#f4ece0' : '#e8dccc') } }
  for (const x of [3, 120, 182]) curtain(px, x, 6, 0)
  const breeze = [0, 1, 2].map((k) => { const g = layer(); curtain(g, 58, 7, [4, 9, 6][k]); return g })

  // Chalkboard with doodles, a clock over it, and a speaker.
  V(204, 34, 108, 66, '#2f5a46'); px.rect(202, 32, 112, 2, '#a8784a'); px.rect(202, 100, 112, 2, '#a8784a'); px.rect(202, 32, 2, 70, '#a8784a'); px.rect(312, 32, 2, 70, '#a8784a')
  px.rect(206, 102, 104, 2, '#8a6038'); px.rect(212, 101, 4, 1, '#ffffff'); px.rect(222, 101, 3, 1, '#ffb0c8'); px.rect(286, 100, 8, 2, '#c8c0b0')
  const chalk = '#e8f0e8', pink = '#ffb8cc', yel = '#fff0a0'
  sprite(px, 216, 44, ['c....c..', 'cc..cc..', 'cccccc..', 'c.cc.c..', 'cccccc..', '.c..c...', '.cccc...'], { c: chalk })
  sprite(px, 236, 48, ['...u...', '..uuu..', '.uuuuu.', 'uuuuuuu', '...u...', '...u...', '..uu...'], { u: pink })
  sprite(px, 245, 46, ['.p.p.', 'ppppp', '.ppp.', '..p..'], { p: pink })
  for (const [x, y] of [[262, 42], [290, 50], [272, 66], [226, 80]]) sprite(px, x, y, ['..y..', '.yyy.', 'yyyyy', '.y.y.'], { y: yel })
  for (let i = 0; i < 4; i++) { const y = 64 + i * 7; px.rect(214, y, 10 + (i * 7) % 14, 1, chalk); px.rect(228 + (i * 5) % 8, y, 6, 1, chalk); if (i % 2) px.rect(240, y - 1, 1, 3, chalk) }
  for (let y = 40; y < 96; y += 6) px.rect(300, y, 6, 1, chalk)
  for (let i = 0; i < 30; i++) px.set(250 + Math.floor(rnd() * 40), 78 + Math.floor(rnd() * 16), '#4a7a64')
  const CX = 258, CY = 18
  for (let y = -9; y <= 9; y++) for (let x = -9; x <= 9; x++) { const d = Math.sqrt(x * x + y * y); if (d <= 9) px.set(CX + x, CY + y, d > 8 ? '#5a4a40' : '#fbf6ec') }
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; px.set(Math.round(CX + Math.cos(a) * 7), Math.round(CY + Math.sin(a) * 7), '#8a7a70') }
  for (let r = 0; r < 5; r++) px.set(CX, CY - r, '#2a2030'); for (let r = 0; r < 4; r++) px.set(CX + r, CY + Math.round(r * 0.6), '#2a2030')
  const tick = Array.from({ length: 12 }, (_, k) => { const g = layer(), a = (k / 12) * Math.PI * 2 - Math.PI / 2; for (let r = 1; r < 7; r++) g.set(Math.round(CX + Math.cos(a) * r), Math.round(CY + Math.sin(a) * r), '#d04a4a'); return g })
  px.rect(292, 10, 14, 12, '#d8ccbc'); for (let y = 12; y < 20; y += 2) px.rect(294, y, 10, 1, '#8a7a70')

  // Desks and chairs: a back row and a nearer front row, warm-lit tops and metal legs.
  const desk = (x, y, s) => {
    const w = Math.round(30 * s), d = Math.round(5 * s), legH = Math.round(14 * s)
    V(x, y, w, d, '#d8a874'); V(x, y, w, 1, '#f0c890'); V(x, y + d, w, Math.max(2, Math.round(3 * s)), '#a8784a')
    px.rect(x + 2, y + d + 2, Math.max(1, Math.round(1.4 * s)), legH, '#7a7a86'); px.rect(x + w - 4, y + d + 2, Math.max(1, Math.round(1.4 * s)), legH, '#5a5a66')
    const cx = x + Math.round(6 * s), cy = y + d + Math.round(6 * s), cw = Math.round(18 * s)
    V(cx, cy, cw, Math.max(2, Math.round(3 * s)), '#c08a5a'); px.rect(cx, cy - Math.round(9 * s), cw, Math.max(2, Math.round(5 * s)), '#b07a4a'); px.rect(cx, cy - Math.round(9 * s), cw, 1, '#d8a874')
    px.rect(cx + 1, cy + 2, 1, Math.round(8 * s), '#6a6a76'); px.rect(cx + cw - 2, cy + 2, 1, Math.round(8 * s), '#6a6a76')
  }
  for (const x of [26, 138, 194, 250]) desk(x, 128, 0.8)
  for (const x of [8, 92, 176, 260]) desk(x, 160, 1.25)
  // A school bag on one desk.
  px.rect(186, 154, 14, 7, '#3a3a5a'); px.rect(186, 154, 14, 2, '#4a4a6e'); px.rect(191, 152, 4, 2, '#2a2a44')

  // A student standing at the middle window, looking out, seen from behind; long hair stirs.
  const SX = 88, SY = 103
  sprite(px, SX, SY, [
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '..cccccccccccc..',
    '.ccwccccccccwcc.',
    'cccwccccccccwccc',
    'bcccwwwwwwwwcccb',
    'bbcccccccccccccbb'.slice(0, 16),
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbb',
    'hbbbbbbbbbbbbbbh',
    'hbbbbbbbbbbbbbbh',
    'hbbbbbbbbbbbbbbh',
    '.bbbbbbbbbbbbbb.',
    '.bbbbbbbbbbbbbb.',
    '..ssssssssssss..',
    '.ssSssSssSssSss.',
    '.sSssSssSssSssS.',
    'ssSssSssSssSssSs',
    'sSssSssSssSssSss',
    'ssSssSssSssSssSs',
    '..llll....llll..',
    '..llll....llll..',
    '..llll....llll..',
    '..llll....llll..',
    '..LLLL....LLLL..',
    '..dddd....dddd..',
    '..dddd....dddd..',
    '..dddd....dddd..',
    '..dddd....dddd..',
    '..dddd....dddd..',
    '..dddd....dddd..',
    '..dddd....dddd..',
    '..oooo....oooo..',
    '.ooooo...ooooo..',
  ], { c: '#2a2e4a', w: '#f4ece0', b: '#f2ece6', h: '#f0c8a8', s: '#2e3250', S: '#232640', l: '#f0c8a8', L: '#d8a888', d: '#24263a', o: '#5a3a2a' })
  for (let y = SY + 19; y < SY + 27; y++) { px.set(SX + 1, y, '#d8d0c8'); px.set(SX + 14, y, '#d8d0c8') }
  // A soft contact shadow where her shoes meet the floor.
  px.rect(SX, SY + 47, 16, 1, '#5a3a30'); px.rect(SX + 2, SY + 48, 12, 1, '#6a4436')
  const hair = [0, 1].map((k) => {
    const g = layer()
    for (let y = 0; y < 22; y++) {
      const top = y < 12, hw = top ? Math.round(6.5 * Math.sqrt(Math.max(0, 1 - ((y - 7) / 7.5) ** 2))) : 5 - Math.floor((y - 12) / 4)
      const sway = y > 14 ? Math.round(k * (y - 14) / 7) : 0
      for (let x = -hw; x <= hw; x++) g.set(SX + 8 + x + sway, SY + 4 + y, x < -hw / 2 ? '#4e3a4a' : x > hw / 2 ? '#24182a' : y < 4 ? '#6a5266' : '#36283a')
    }
    g.set(SX + 5, SY + 6, '#9a7a92'); g.set(SX + 6, SY + 5, '#9a7a92'); g.set(SX + 7, SY + 5, '#8a6a82')
    return g
  })

  // Light from the windows falling across the room, dust drifting in it, petals blowing in.
  const beams = WINS.map(([x0, x1]) => `<path d="M${x0 * P} ${12 * P}H${x1 * P}L${(x1 + 110) * P} ${200 * P}H${(x0 + 110) * P}Z" fill="url(#beam)"/>`).join('')
  const dust = [0, 1, 2].map((k) => { const g = layer(); for (let i = 0; i < 26; i++) { const x = 20 + ((i * 41 + k * 9) % 240), y = 30 + ((i * 29 + k * 13) % 140); g.set(x, y, '#fff2d0') } return g })
  const petals = [0, 1, 2].map((k) => { const g = layer(); for (let i = 0; i < 16; i++) { const x = 60 + ((i * 23 + k * 17) % 160), y = 20 + ((i * 37 + k * 11) % 150); g.set(x, y, SAK[1 + (i % 3)]); if ((i + k) % 2) g.set(x + 1, y, SAK[2]); else g.set(x, y + 1, SAK[3]) } return g })
  // Crows crossing the sky.
  const crows = [0, 1].map((k) => { const g = layer(); for (const [x, y] of [[6, 30], [14, 26], [20, 34]]) sprite(g, x, y, k ? ['k...k', '.kkk.', '..k..'] : ['.....', 'kkkkk', '..k..'], { k: '#2a1e30' }); return g })

  return svgDoc({
    defs: `<linearGradient id="beam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd8a0" stop-opacity=".22"/><stop offset="1" stop-color="#ffb070" stop-opacity="0"/></linearGradient>` +
      `<radialGradient id="sun"><stop offset="0" stop-color="#ffe8b0" stop-opacity=".45"/><stop offset="1" stop-color="#ff9a6a" stop-opacity="0"/></radialGradient>` +
      `<clipPath id="win">${WINS.map(([x0, x1]) => `<rect x="${x0 * P}" y="${12 * P}" width="${(x1 - x0) * P}" height="${100 * P}"/>`).join('')}</clipPath>`,
    css: FRAME_CSS + `@keyframes f12{0%{opacity:1}8.333%{opacity:0}}@keyframes fly{0%{transform:translate(-120px,0)}100%{transform:translate(1080px,0)}}`,
    body:
      finish() + `<circle cx="${100 * P}" cy="${96 * P}" r="240" fill="url(#sun)"/>` +
      `<g clip-path="url(#win)"><g style="animation:fly 24s steps(240,end) -7s infinite">${frames(crows, 0.4)}</g></g>` +
      frames(breeze, 2.4) + beams + frames(tick, 12) + frames(hair, 1.6) + frames(dust, 2.4) + frames(petals, 1.8),
  })
}
