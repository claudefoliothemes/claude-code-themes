// A cyberpunk street at night in the rain, in layers: hazy megatowers with searchlights, mid
// buildings with lit windows and animated billboards, an elevated sky-train gliding across, and
// near buildings with detailed facades, solid-panel blade signs in filled neon lettering, and
// glowing shopfronts. The wet street mirrors the whole city. Vector art; glows are layered strokes
// and gradients, never filters. Every change lands on the shared 0.1 s tick.
import { H, W, f, rng, svgDoc } from './_lib.mjs'

const HZ = 780 // the curb line
const PINK = '#ff2fd0', CYAN = '#22e6ff', VIOLET = '#9d5bff', YELLOW = '#ffe14d', GREEN = '#39ffa8', ORANGE = '#ffb86a'
const FONT = `font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-weight="800"`

// Filled neon lettering: a wide soft halo, a colored outline, and a pale fill.
const neon = (x, y, text, c, size, extra = '') =>
  `<g ${FONT} font-size="${size}" text-anchor="middle" ${extra}>` +
  `<text x="${x}" y="${y}" fill="none" stroke="${c}" stroke-width="${f(size / 3.2)}" stroke-opacity=".18" stroke-linejoin="round">${text}</text>` +
  `<text x="${x}" y="${y}" fill="#fff2fc" stroke="${c}" stroke-width="${f(size / 9)}" paint-order="stroke" stroke-linejoin="round">${text}</text></g>`
// A neon tube outline.
const tube = (d, c, w = 2.4) =>
  `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w * 6}" stroke-opacity=".12" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w * 2}" stroke-opacity=".5" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<path d="${d}" fill="none" stroke="#fff4ff" stroke-width="${w * 0.8}" stroke-linecap="round" stroke-linejoin="round"/>`
const bloom = (cx, cy, rx, ry, id) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id})"/>`

export default function scene() {
  const rnd = rng(0xd157)
  const glow = (id, c, o) => `<radialGradient id="${id}"><stop offset="0" stop-color="${c}" stop-opacity="${o}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`
  const defs =
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#040210"/><stop offset=".45" stop-color="#120830"/><stop offset=".72" stop-color="#3a0f4e"/><stop offset="1" stop-color="#5a1450"/></linearGradient>` +
    `<linearGradient id="farHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1250" stop-opacity="0"/><stop offset="1" stop-color="#6a1a6a" stop-opacity=".55"/></linearGradient>` +
    `<linearGradient id="fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff2fd0" stop-opacity="0"/><stop offset=".6" stop-color="#b03ad0" stop-opacity=".16"/><stop offset="1" stop-color="#22e6ff" stop-opacity=".06"/></linearGradient>` +
    `<linearGradient id="street" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0614" stop-opacity=".35"/><stop offset=".55" stop-color="#07040e" stop-opacity=".8"/><stop offset="1" stop-color="#05030a"/></linearGradient>` +
    `<linearGradient id="beam" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#c8e8ff" stop-opacity=".16"/><stop offset="1" stop-color="#c8e8ff" stop-opacity="0"/></linearGradient>` +
    `<linearGradient id="ramen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd890"/><stop offset="1" stop-color="#ff8a4a"/></linearGradient>` +
    `<linearGradient id="mart" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8fff4"/><stop offset="1" stop-color="#6affc8"/></linearGradient>` +
    `<linearGradient id="board1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a0a5a"/><stop offset="1" stop-color="#ff2fd0"/></linearGradient>` +
    `<linearGradient id="board2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#062a3a"/><stop offset="1" stop-color="#0a4a5a"/></linearGradient>` +
    `<linearGradient id="umbrella" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22e6ff" stop-opacity=".35"/><stop offset="1" stop-color="#22e6ff" stop-opacity=".05"/></linearGradient>` +
    glow('bPink', PINK, '.38') + glow('bCyan', CYAN, '.32') + glow('bGreen', GREEN, '.3') + glow('bWarm', ORANGE, '.35') + glow('bViolet', VIOLET, '.3') + glow('steam', '#d8c8ff', '.16')

  let city = ''

  // Sky and searchlights sweeping from the far city.
  let sky = `<rect width="${W}" height="${HZ + 10}" fill="url(#sky)"/>`
  const beam = (x, y, ang) => { const a = (ang * Math.PI) / 180, l = 900, w = 60; return `<path d="M${x} ${y}L${f(x + Math.sin(a) * l - Math.cos(a) * w)} ${f(y - Math.cos(a) * l - Math.sin(a) * w)}L${f(x + Math.sin(a) * l + Math.cos(a) * w)} ${f(y - Math.cos(a) * l + Math.sin(a) * w)}Z" fill="url(#beam)"/>` }
  for (const [x, y, angles, delay] of [[520, 470, [-30, -18, -6, -18], 0], [1120, 480, [24, 12, 0, 12], 1.2]]) {
    sky += angles.map((ang, k) => `<g style="animation:f4 4.8s steps(1,end) -${f(delay + k * 1.2)}s infinite">${beam(x, y, ang)}</g>`).join('')
  }

  // Far megatowers: hazy, with sparse dim windows and blinking beacons.
  let far = '', farWin = '', beacons = ''
  for (let x = -20; x < W + 20;) {
    const w = 46 + rnd() * 70, top = 170 + rnd() * 260
    far += `<path d="M${f(x)} ${HZ}V${f(top + 20)}l${f(w * 0.2)} -20h${f(w * 0.6)}l${f(w * 0.2)} 20V${HZ}Z"/>`
    if (rnd() < 0.5) far += `<rect x="${f(x + w / 2 - 1)}" y="${f(top - 40)}" width="2" height="40"/>`, beacons += `<circle cx="${f(x + w / 2)}" cy="${f(top - 42)}" r="2.6"/>`
    for (let y = top + 30; y < HZ - 200; y += 16) for (let wx = x + 8; wx < x + w - 8; wx += 12) if (rnd() < 0.16) farWin += `<rect x="${f(wx)}" y="${f(y)}" width="5" height="3"/>`
    x += w + 6
  }
  city += sky + `<g fill="#1a0e34">${far}</g><g fill="#7a5ab8" fill-opacity=".5">${farWin}</g><g fill="#ff3a5a" style="animation:blink 2s steps(1,end) infinite">${beacons}</g>`
  city += `<rect y="200" width="${W}" height="${HZ - 200}" fill="url(#farHaze)"/>`

  // Mid buildings between the near ones, with lit windows and a rim of light.
  let mid = '', midWin = ['', '', ''], rims = ''
  for (let x = 300; x < 1300;) {
    const w = 90 + rnd() * 90, top = 360 + rnd() * 200
    mid += `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(HZ - top)}"/>`
    rims += `<rect x="${f(x + w - 3)}" y="${f(top)}" width="3" height="${f(HZ - top)}" fill="${rnd() < 0.5 ? '#3a1a6a' : '#16405a'}"/>`
    for (let y = top + 14; y < HZ - 30; y += 20) for (let wx = x + 10; wx < x + w - 14; wx += 18) if (rnd() < 0.42) midWin[Math.floor(rnd() * 3)] += `<rect x="${f(wx)}" y="${f(y)}" width="10" height="8"/>`
    x += w + 4
  }
  city += `<g fill="#120a26">${mid}</g>${rims}<g fill="${CYAN}" fill-opacity=".45">${midWin[0]}</g><g fill="${PINK}" fill-opacity=".4">${midWin[1]}</g><g fill="${ORANGE}" fill-opacity=".45">${midWin[2]}</g>`

  // Billboard one: a synthwave sun whose stripes scroll, on a magenta panel.
  city += bloom(560, 470, 190, 110, 'bPink') + `<rect x="452" y="404" width="216" height="132" fill="#0a0612"/><rect x="460" y="412" width="200" height="116" fill="url(#board1)"/>`
  city += [0, 1, 2].map((k) => `<g style="animation:f3 1.5s steps(1,end) -${f(k * 0.5)}s infinite"><circle cx="560" cy="482" r="40" fill="${YELLOW}"/>` +
    Array.from({ length: 5 }, (_, i) => `<rect x="518" y="${f(470 + i * 9 + k * 3)}" width="84" height="${2 + i * 0.6}" fill="#c0207a"/>`).join('') + `</g>`).join('')
  city += `<rect x="460" y="508" width="200" height="20" fill="#2a0636" fill-opacity=".85"/>` + neon(560, 524, 'NIGHT DRIVE', PINK, 15)
  // Billboard two: an equalizer pulsing on a teal panel.
  city += bloom(1080, 440, 150, 90, 'bCyan') + `<rect x="992" y="382" width="176" height="112" fill="#0a0612"/><rect x="1000" y="390" width="160" height="96" fill="url(#board2)"/>`
  city += [[5, 9, 4, 7, 3, 8, 6], [8, 4, 9, 5, 7, 3, 9], [3, 7, 6, 9, 5, 9, 4], [6, 5, 8, 3, 9, 6, 7]].map((hs, k) =>
    `<g fill="${CYAN}" style="animation:f4 .8s steps(1,end) -${f(k * 0.2)}s infinite">` + hs.map((h, i) => `<rect x="${1014 + i * 20}" y="${474 - h * 8}" width="12" height="${h * 8}"/>`).join('') + `</g>`).join('')

  // The elevated rail and the sky-train that glides along it now and then.
  city += `<rect x="0" y="606" width="${W}" height="18" fill="#0a0614"/><rect x="0" y="606" width="${W}" height="2" fill="#3a2a5a"/>`
  city += [330, 560, 820, 1060, 1260].map((x) => `<rect x="${x}" y="624" width="16" height="${HZ - 624}" fill="#0a0614"/>`).join('')
  const train = `<rect x="0" y="570" width="520" height="34" rx="10" fill="#1c1734"/><rect x="0" y="570" width="520" height="5" rx="2" fill="#3a3456"/>` +
    Array.from({ length: 13 }, (_, i) => `<rect x="${18 + i * 38}" y="582" width="26" height="12" fill="#9af4ff" fill-opacity=".85"/>`).join('') +
    `<rect x="0" y="598" width="520" height="3" fill="${PINK}" fill-opacity=".7"/><circle cx="8" cy="588" r="4" fill="#ffffff"/>`
  city += `<g style="animation:train 20s steps(1,end) -6s infinite">${train}</g>`

  // Fog over the street.
  city += `<rect y="520" width="${W}" height="${HZ - 520 + 10}" fill="url(#fog)"/>`

  // Near building, left: facade, windows, AC units, a pipe, the HOTEL sign, and the ramen shop.
  const facade = (x0, x1, rimX, rimC) => {
    let s = `<rect x="${x0}" y="0" width="${x1 - x0}" height="${HZ}" fill="#0b0614"/><rect x="${rimX}" y="0" width="4" height="${HZ}" fill="${rimC}"/>`
    for (let y = 40; y < 600; y += 78) {
      s += `<rect x="${x0}" y="${y + 56}" width="${x1 - x0}" height="6" fill="#140c22"/>`
      for (let wx = x0 + 24; wx < x1 - 70; wx += 96) {
        const lit = rnd(), c = lit < 0.22 ? ORANGE : lit < 0.36 ? CYAN : lit < 0.46 ? PINK : '#140c20'
        s += `<rect x="${wx}" y="${y}" width="66" height="44" fill="#06040a"/><rect x="${wx + 3}" y="${y + 3}" width="60" height="38" fill="${c}" fill-opacity="${c === '#140c20' ? 1 : f(0.18 + rnd() * 0.22)}"/>`
        if (rnd() < 0.4) for (let b = 0; b < 4; b++) s += `<rect x="${wx + 3}" y="${y + 8 + b * 9}" width="60" height="2" fill="#06040a" fill-opacity=".6"/>`
        if (rnd() < 0.45) s += `<rect x="${wx + 14}" y="${y + 47}" width="38" height="18" fill="#221a30"/><path d="M${wx + 18} ${y + 52}h30M${wx + 18} ${y + 57}h30M${wx + 18} ${y + 62}h30" stroke="#3a3048" stroke-width="2"/>`
      }
    }
    return s
  }
  let near = facade(0, 330, 326, '#2a1448') + `<rect x="14" y="0" width="7" height="${HZ}" fill="#1a1426"/>`
  near += `<rect x="0" y="640" width="330" height="${HZ - 640}" fill="#06040a"/>` + bloom(165, 720, 220, 90, 'bWarm') +
    `<rect x="16" y="668" width="296" height="104" fill="url(#ramen)" fill-opacity=".9"/>` +
    Array.from({ length: 7 }, (_, i) => `<rect x="${22 + i * 42}" y="668" width="36" height="34" fill="#b8202e"/>`).join('') +
    `<rect x="30" y="740" width="270" height="10" fill="#3a1a12"/>` + [60, 120, 180, 240].map((x) => `<rect x="${x}" y="750" width="10" height="22" fill="#3a1a12"/><circle cx="${x + 5}" cy="730" r="9" fill="#2a1410"/>`).join('') +
    `<rect x="24" y="620" width="282" height="44" rx="4" fill="#0a0614"/>` + tube('M30 626h270v32h-270Z', CYAN, 1.6) + neon(165, 653, 'RAMEN', CYAN, 30) +
    `<g style="animation:flick 10s steps(1,end) infinite">${neon(280, 760, 'OPEN', PINK, 14)}</g>`
  near += bloom(390, 340, 130, 300, 'bPink') + `<rect x="326" y="170" width="30" height="8" fill="#140c22"/><rect x="326" y="500" width="30" height="8" fill="#140c22"/>` +
    `<rect x="352" y="120" width="82" height="440" rx="6" fill="#16061e"/>` + tube('M360 128h66v424h-66Z', PINK, 2) +
    ['H', 'O', 'T', 'E', 'L'].map((ch, i) => neon(393, 204 + i * 80, ch, PINK, 58)).join('')

  // Near building, right: facade, windows, the BAR and ARCADE signs, and the 24H mart.
  near += facade(1270, W, 1270, '#14304a')
  near += `<rect x="1270" y="640" width="330" height="${HZ - 640}" fill="#06040a"/>` + bloom(1435, 720, 220, 90, 'bGreen') +
    `<rect x="1290" y="668" width="294" height="104" fill="url(#mart)" fill-opacity=".85"/>` +
    [690, 718, 746].map((y) => `<rect x="1302" y="${y}" width="270" height="6" fill="#2a5a4a"/>` + Array.from({ length: 12 }, (_, i) => `<rect x="${1306 + i * 22}" y="${y - 12}" width="14" height="12" fill="${['#ff8a8a', '#ffe08a', '#8ad8ff', '#c8a6ff'][(i + y) % 4]}" fill-opacity=".8"/>`).join('')).join('') +
    `<rect x="1294" y="620" width="286" height="44" rx="4" fill="#0a0614"/>` + tube('M1300 626h274v32h-274Z', GREEN, 1.6) + neon(1437, 654, '24H MART', GREEN, 28)
  near += bloom(1210, 330, 110, 200, 'bCyan') + `<rect x="1248" y="230" width="26" height="8" fill="#140c22"/><rect x="1248" y="440" width="26" height="8" fill="#140c22"/>` +
    `<rect x="1170" y="200" width="80" height="290" rx="6" fill="#061620"/>` + tube('M1178 208h64v274h-64Z', CYAN, 2) +
    ['B', 'A', 'R'].map((ch, i) => neon(1210, 272 + i * 70, ch, CYAN, 56)).join('') + tube('M1194 440l16 18l16 -18zM1210 458v14M1200 472h20', CYAN, 1.4)
  near += bloom(1450, 190, 130, 110, 'bViolet') + `<circle cx="1450" cy="180" r="74" fill="#12061e"/>` + tube('M1450 110a70 70 0 1 0 0.1 0', VIOLET, 2.2) +
    tube('M1462 128l-30 54h26l-18 52', YELLOW, 2.4) + neon(1450, 290, 'ARCADE', VIOLET, 26)

  // A figure under a clear umbrella on the curb.
  near += `<g transform="translate(720 ${HZ})"><path d="M-7 0h14l-3 -40h-8z" fill="#05030a"/><circle cx="0" cy="-47" r="7" fill="#05030a"/>` +
    `<path d="M-38 -56q38 -34 76 0z" fill="url(#umbrella)"/>` + tube('M-38 -56q38 -34 76 0', CYAN, 1.2) + `<path d="M0 -56v16" stroke="#8a90a8" stroke-width="1.6"/></g>`
  city += near

  // The curb, then the wet street: the whole city mirrored, faded, and broken by ripples.
  let body = `<g id="city">${city}</g>`
  body += `<use href="#city" transform="translate(0 ${HZ * 2 + 16}) scale(1 -1)" opacity=".55"/>`
  body += `<rect y="${HZ}" width="${W}" height="${H - HZ}" fill="url(#street)"/>`
  let ripples = ''
  for (let y = HZ + 14, i = 0; y < H; y += 5 + i * 0.5, i++) ripples += `M0 ${f(y)}H${W}`
  body += `<path d="${ripples}" stroke="#05030a" stroke-opacity=".45" stroke-width="1.6"/>`
  body += `<rect y="${HZ}" width="${W}" height="10" fill="#140c22"/><rect y="${HZ}" width="${W}" height="2" fill="#4a3a6a"/>`

  // Steam from a grate in the street.
  body += `<ellipse cx="520" cy="900" rx="44" ry="8" fill="#140c22"/>` + [0, 1, 2].map((k) => `<g style="animation:f3 2.1s steps(1,end) -${f(k * 0.7)}s infinite">` +
    [0, 1, 2].map((i) => bloom(520 + ((i + k) % 3 - 1) * 14, 870 - i * 60 - k * 18, 70 + i * 24, 40 + i * 10, 'steam')).join('') + `</g>`).join('')

  // Rain in two depths, and ripples where it lands.
  const rain = (count, len, op, w, seed) => [0, 1, 2].map((k) => {
    let d = ''
    for (let i = 0; i < count; i++) { const x = (i * 97 + k * 41 + seed) % W, y = (i * 61 + k * 127 + seed) % H; d += `M${x} ${y}l${f(-len * 0.25)} ${len}` }
    return `<path d="${d}" stroke="#bfe6ff" stroke-opacity="${op}" stroke-width="${w}" style="animation:f3 .9s steps(1,end) -${f(k * 0.3)}s infinite"/>`
  }).join('')
  body += rain(110, 14, 0.2, 1, 0) + rain(46, 34, 0.32, 1.8, 500)
  body += [0, 1, 2].map((k) => `<g fill="none" stroke="#d8e8ff" stroke-opacity=".28" style="animation:f3 1.2s steps(1,end) -${f(k * 0.4)}s infinite">` +
    Array.from({ length: 12 }, (_, i) => `<ellipse cx="${(i * 137 + k * 59) % W}" cy="${HZ + 30 + ((i * 41 + k * 23) % 190)}" rx="${12 + (i % 3) * 5}" ry="3"/>`).join('') + `</g>`).join('')

  const css =
    `@keyframes f2{0%{opacity:1}50%{opacity:0}}@keyframes f3{0%{opacity:1}33.333%{opacity:0}}@keyframes f4{0%{opacity:1}25%{opacity:0}}` +
    `@keyframes blink{0%{opacity:1}50%{opacity:.15}}` +
    `@keyframes flick{0%{opacity:1}70%{opacity:1}71%{opacity:.15}72%{opacity:1}74%{opacity:.2}75%{opacity:1}}` +
    `@keyframes train{0%{transform:translate(1700px,0);animation-timing-function:steps(80,end)}40%{transform:translate(-620px,0);animation-timing-function:steps(1,end)}100%{transform:translate(-620px,0)}}`

  return svgDoc({ defs, css, body })
}
