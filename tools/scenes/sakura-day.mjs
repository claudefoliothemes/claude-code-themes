// A light theme with a moving scene: a bright spring day in a Japanese garden. Cherry trees in full
// bloom frame the view, petals drift down in layers, a vermilion arched bridge crosses a calm pond
// where koi circle and the water shimmers, a snow-capped mountain stands pale in the distance,
// clouds drift, and swallows dart past. Kept pale and soft so dark text reads over it. Every change
// lands on the shared 0.1 s tick.
import { H, W, f, rng, svgDoc } from './_lib.mjs'

const WATER = 640, BANK = 770

export default function scene() {
  const rnd = rng(0x5a4)
  const defs =
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d4e8f6"/><stop offset=".7" stop-color="#eef3f8"/><stop offset="1" stop-color="#f8f1f2"/></linearGradient>` +
    `<radialGradient id="sun" cx="1260" cy="90" r="520" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fffbe8" stop-opacity=".9"/><stop offset="1" stop-color="#fffbe8" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="mount" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9d3e8"/><stop offset="1" stop-color="#dfe6f2"/></linearGradient>` +
    `<linearGradient id="pond" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d6e6f0"/><stop offset="1" stop-color="#c4dbe8"/></linearGradient>` +
    `<linearGradient id="grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2eedb"/><stop offset="1" stop-color="#d4e6cc"/></linearGradient>` +
    `<linearGradient id="path" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1e8dc"/><stop offset="1" stop-color="#e8dccb"/></linearGradient>` +
    `<radialGradient id="bloomGlow"><stop offset="0" stop-color="#ffe4ee" stop-opacity=".8"/><stop offset="1" stop-color="#ffe4ee" stop-opacity="0"/></radialGradient>`

  let body = `<rect width="${W}" height="${H}" fill="url(#sky)"/><rect width="${W}" height="${H}" fill="url(#sun)"/>`

  // Clouds drifting.
  const cloud = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse rx="110" ry="24"/><ellipse cx="-46" cy="-14" rx="52" ry="28"/><ellipse cx="30" cy="-24" rx="64" ry="34"/><ellipse cx="80" cy="-6" rx="40" ry="20"/></g>`
  body += `<g fill="#ffffff" fill-opacity=".85" style="animation:drift 160s steps(160,end) infinite alternate">${cloud(300, 150, 1)}${cloud(980, 110, 0.8)}${cloud(640, 260, 0.6)}${cloud(1420, 230, 0.7)}</g>`

  // The far mountain with its snowcap, and soft hills.
  body += `<path d="M380 ${WATER}L740 300Q770 280 800 300L1180 ${WATER}Z" fill="url(#mount)"/>`
  body += `<path d="M740 300Q770 280 800 300L850 348L826 340L804 360L780 342L756 362L734 344L708 352Z" fill="#fbfcff"/>`
  body += `<path d="M0 ${WATER}V560Q160 520 320 548T640 556T980 540T1300 552T1600 530V${WATER}Z" fill="#d8e6d8"/>`
  body += `<path d="M0 ${WATER}V590Q220 570 440 590T900 596T1300 584T1600 596V${WATER}Z" fill="#cfe0cf"/>`
  // A pagoda far off on the right hill.
  const pagoda = (x, y) => [0, 1, 2, 3].map((i) => `<path d="M${x - 34 + i * 6} ${y - i * 26}h${68 - i * 12}l-10 -10h${-(48 - i * 12)}z" fill="#b8a6b8"/><rect x="${x - 16 + i * 3}" y="${y - 10 - i * 26 - 16}" width="${32 - i * 6}" height="16" fill="#cbbccb"/>`).join('') + `<rect x="${x - 1}" y="${y - 136}" width="2" height="30" fill="#b8a6b8"/>`
  body += pagoda(1180, 586)

  // The pond, shimmering, with koi circling.
  body += `<rect y="${WATER}" width="${W}" height="${BANK - WATER}" fill="url(#pond)"/>`
  body += [0, 1].map((k) => `<g stroke="#ffffff" stroke-opacity=".7" stroke-width="2" style="animation:f2 1.6s steps(1,end) -${k * 0.8}s infinite">` +
    Array.from({ length: 22 }, (_, i) => { const x = (i * 173 + k * 61) % W, y = WATER + 14 + ((i * 37 + k * 19) % (BANK - WATER - 30)); return `<path d="M${x} ${y}h${20 + (i % 4) * 8}"/>` }).join('') + `</g>`).join('')
  const koi = (c, spot) => `<path d="M0 0q14 -7 28 0q-14 7 -28 0z" fill="${c}"/><path d="M0 0l-9 -6l2 6l-2 6z" fill="${c}"/><circle cx="16" cy="-1" r="3" fill="${spot}"/>`
  body += `<g style="animation:swim 26s steps(130,end) infinite alternate"><g transform="translate(980 712)">${koi('#f08a5a', '#ffffff')}</g><g transform="translate(1030 728)">${koi('#ffffff', '#f06a4a')}</g></g>`
  body += `<g style="animation:swim2 30s steps(150,end) -8s infinite alternate"><g transform="translate(260 690) scale(-1 1)">${koi('#f5b04a', '#ffffff')}</g></g>`

  // The arched bridge, with its reflection.
  const bridge = `<path d="M560 ${WATER + 50}Q760 ${WATER - 70} 960 ${WATER + 50}" fill="none" stroke="#e8735a" stroke-width="16"/>` +
    `<path d="M560 ${WATER + 22}Q760 ${WATER - 100} 960 ${WATER + 22}" fill="none" stroke="#e8735a" stroke-width="6"/>` +
    Array.from({ length: 9 }, (_, i) => { const t = i / 8, x = 560 + t * 400, deck = WATER + 50 - 4 * t * (1 - t) * 60, rail = WATER + 22 - 4 * t * (1 - t) * 61; return `<rect x="${f(x - 3)}" y="${f(rail - 4)}" width="6" height="${f(deck - rail + 4)}" fill="#d8604a"/>` }).join('') +
    `<rect x="576" y="${WATER + 40}" width="10" height="44" fill="#c85a44"/><rect x="934" y="${WATER + 40}" width="10" height="44" fill="#c85a44"/>`
  body += `<g opacity=".25" transform="translate(0 ${2 * (WATER + 84)}) scale(1 -1)">${bridge}</g>` + bridge

  // The near bank: grass, a path, a stone lantern, and fallen petals.
  body += `<path d="M0 ${BANK}Q400 ${BANK - 16} 800 ${BANK}T${W} ${BANK - 10}V${H}H0Z" fill="url(#grass)"/>`
  body += `<path d="M560 ${H}Q700 880 820 ${BANK + 6}L880 ${BANK + 6}Q820 880 860 ${H}Z" fill="url(#path)"/>`
  body += `<g fill="#b8b0a8"><rect x="1236" y="836" width="56" height="10"/><rect x="1252" y="806" width="24" height="30"/><path d="M1224 806h80l-16 -20h-48z"/><rect x="1258" y="770" width="12" height="16"/><path d="M1246 772h36l-18 -14z"/></g><rect x="1256" y="812" width="16" height="14" fill="#fff0c8"/>`
  body += `<g fill="#f6c2d4">${Array.from({ length: 70 }, () => { const x = f(rnd() * W), y = f(BANK + 20 + rnd() * (H - BANK - 30)); return `<ellipse cx="${x}" cy="${y}" rx="4.5" ry="2.6"/>` }).join('')}</g>`

  // Cherry trees framing the view, left and right: trunks, branches, and clouds of blossom.
  const tree = (side) => {
    const flip = side === 'right' ? ` transform="translate(${W} 0) scale(-1 1)"` : ''
    let t = `<g${flip}>`
    t += `<path d="M120 ${H}C140 860 110 760 150 640C180 560 200 500 260 440" fill="none" stroke="#7a5e62" stroke-width="34" stroke-linecap="round"/>`
    t += `<path d="M160 600C230 540 330 520 420 470M180 520C140 440 80 400 20 380M240 450C300 380 380 340 470 330M200 470C200 380 230 300 280 230" fill="none" stroke="#7a5e62" stroke-width="12" stroke-linecap="round"/>`
    t += `<ellipse cx="260" cy="320" rx="320" ry="220" fill="url(#bloomGlow)"/>`
    const r2 = rng(side === 'left' ? 11 : 23)
    const blobs = [[60, 300, 110], [190, 240, 120], [330, 280, 110], [440, 360, 90], [120, 420, 90], [280, 400, 80], [40, 160, 100], [230, 120, 110], [400, 170, 90], [520, 300, 70]]
    for (const [shade, dy] of [['#f2b3c8', 8], ['#f7c8d8', 0], ['#fbdde8', -10]]) {
      t += `<g fill="${shade}">`
      for (const [x, y, r] of blobs) for (let k = 0; k < 4; k++) t += `<circle cx="${f(x + (r2() - 0.5) * r)}" cy="${f(y + dy + (r2() - 0.5) * r * 0.6)}" r="${f(r * (0.35 + r2() * 0.25))}"/>`
      t += `</g>`
    }
    return t + `</g>`
  }
  body += tree('left') + tree('right')

  // Swallows darting across.
  const swallow = `<path d="M0 0q-10 -8 -22 -4q10 0 14 6q-14 4 -24 14q14 -6 26 -8l6 6l6 -6q12 2 26 8q-10 -10 -24 -14q4 -6 14 -6q-12 -4 -22 4z" fill="#5a6478"/>`
  body += `<g style="animation:dart 14s steps(140,end) -5s infinite"><g transform="scale(.7)">${swallow}</g><g transform="translate(-60 30) scale(.55)">${swallow}</g></g>`

  // Petals drifting down in two depths.
  const petals = (count, size, op, seed, period) => [0, 1, 2].map((k) => {
    let g = ''
    for (let i = 0; i < count; i++) {
      const x = (i * 137 + k * 47 + seed) % W, y = (i * 89 + k * 53 + seed) % H, a = (i * 47 + k * 30) % 180
      g += `<ellipse cx="${x}" cy="${y}" rx="${size}" ry="${f(size * 0.6)}" transform="rotate(${a} ${x} ${y})"/>`
    }
    return `<g fill="#f4a6c0" fill-opacity="${op}" style="animation:f3 ${period}s steps(1,end) -${f((k * period) / 3)}s infinite">${g}</g>`
  }).join('')
  body += petals(40, 4, 0.75, 0, 1.2) + petals(18, 7, 0.85, 300, 0.9)

  const css =
    `@keyframes f2{0%{opacity:1}50%{opacity:0}}@keyframes f3{0%{opacity:1}33.333%{opacity:0}}` +
    `@keyframes drift{0%{transform:translate(0,0)}100%{transform:translate(-160px,0)}}` +
    `@keyframes swim{0%{transform:translate(0,0)}100%{transform:translate(-260px,-10px)}}` +
    `@keyframes swim2{0%{transform:translate(0,0)}100%{transform:translate(300px,20px)}}` +
    `@keyframes dart{0%{transform:translate(1700px,160px)}100%{transform:translate(-200px,300px)}}`

  return svgDoc({ defs, css, body })
}
