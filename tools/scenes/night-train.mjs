// An anime-style night train ride: from a warm, lamplit carriage, the city slides past the
// rain-flecked windows in layers (a far skyline, near houses with lit windows, a crossing with
// blinking lights, catenary poles flicking by), while a mug of tea steams and a rice ball waits on
// the ledge, straps sway from the rack, and the moon keeps pace. Vector art. Every change lands on
// the shared 0.1 s tick.
import { H, W, f, rng, svgDoc } from './_lib.mjs'

const WY = 120, WB = 640 // window top and bottom
const PANES = [[140, 780], [820, 1460]] // window panes, left and right edges
const TILE = 1320 // repeat width of each passing layer

export default function scene() {
  const rnd = rng(0x7ea1)
  const defs =
    `<linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a201e"/><stop offset="1" stop-color="#3a2c26"/></linearGradient>` +
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#080c26"/><stop offset=".7" stop-color="#18204a"/><stop offset="1" stop-color="#2a2858"/></linearGradient>` +
    `<radialGradient id="moonGlow"><stop offset="0" stop-color="#e8eaff" stop-opacity=".4"/><stop offset="1" stop-color="#e8eaff" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="lamp" cx="800" cy="40" r="900" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffd8a0" stop-opacity=".22"/><stop offset="1" stop-color="#ffd8a0" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="reflect"><stop offset="0" stop-color="#ffe0b0" stop-opacity=".12"/><stop offset="1" stop-color="#ffe0b0" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="seat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2e6a7a"/><stop offset="1" stop-color="#1e4652"/></linearGradient>` +
    `<linearGradient id="ledge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a6a54"/><stop offset="1" stop-color="#5a4234"/></linearGradient>` +
    `<radialGradient id="crossing"><stop offset="0" stop-color="#ff3a3a" stop-opacity=".7"/><stop offset="1" stop-color="#ff3a3a" stop-opacity="0"/></radialGradient>` +
    `<clipPath id="glass">${PANES.map(([x0, x1]) => `<rect x="${x0}" y="${WY}" width="${x1 - x0}" height="${WB - WY}" rx="34"/>`).join('')}</clipPath>`

  let body = `<rect width="${W}" height="${H}" fill="url(#wall)"/>`

  // Outside, clipped to the panes: sky, stars, the moon, and the passing layers.
  let out = `<rect x="${PANES[0][0]}" y="${WY}" width="${PANES[1][1] - PANES[0][0]}" height="${WB - WY}" fill="url(#sky)"/>`
  let stars = ''
  for (let i = 0; i < 60; i++) stars += `<circle cx="${f(140 + rnd() * 1320)}" cy="${f(WY + 10 + rnd() * 220)}" r="${f(0.8 + rnd() * 1.2)}"/>`
  out += `<g fill="#e8eaff" fill-opacity=".7">${stars}</g>`
  out += `<circle cx="1250" cy="230" r="120" fill="url(#moonGlow)"/><circle cx="1250" cy="230" r="34" fill="#f2f0ff"/><circle cx="1262" cy="222" r="30" fill="#18204a" fill-opacity=".25"/>`
  // A layer that repeats every TILE: drawn once, then the same drawing shifted by TILE, so the slide
  // loops with no jump.
  const tiled = (draw) => { const s = draw(0); return s + `<g transform="translate(${TILE} 0)">${s}</g>` }
  // Far skyline.
  const far = (dx) => {
    let s = '', w = ''
    for (let x = 0; x < TILE;) {
      const bw = 40 + rnd() * 70, h = 60 + rnd() * 150, top = 520 - h
      s += `<rect x="${f(dx + 140 + x)}" y="${f(top)}" width="${f(bw)}" height="${f(h + 20)}"/>`
      for (let y = top + 8; y < 515; y += 12) for (let wx = x + 6; wx < x + bw - 6; wx += 10) if (rnd() < 0.22) w += `<rect x="${f(dx + 140 + wx)}" y="${f(y)}" width="4" height="4"/>`
      x += bw + 4
    }
    return `<g fill="#151b3e">${s}</g><g fill="#ffcf7a" fill-opacity=".6">${w}</g>`
  }
  out += `<g style="animation:slideFar 88s steps(440,end) infinite">${tiled(far)}</g>`
  // Near houses, trees, and a level crossing with blinking lights.
  const near = (dx) => {
    let s = '', w = ''
    for (let x = 0; x < TILE;) {
      const kind = rnd(), bw = 70 + rnd() * 80
      if (kind < 0.6) {
        const h = 50 + rnd() * 50, top = 560 - h
        s += `<path d="M${f(dx + 140 + x)} 600V${f(top)}l${f(bw / 2)} -26l${f(bw / 2)} 26V600Z"/>`
        if (rnd() < 0.8) w += `<rect x="${f(dx + 140 + x + bw * 0.3)}" y="${f(top + 14)}" width="${f(bw * 0.22)}" height="16"/>`
      } else s += `<circle cx="${f(dx + 140 + x + bw / 2)}" cy="${f(540 - rnd() * 20)}" r="${f(26 + rnd() * 16)}"/><rect x="${f(dx + 140 + x + bw / 2 - 4)}" y="540" width="8" height="60"/>`
      x += bw + 10
    }
    // The crossing.
    const cx = dx + 140 + 640
    s += `<rect x="${cx}" y="470" width="6" height="130"/><rect x="${cx - 30}" y="470" width="66" height="8"/><path d="M${cx - 26} 492l58 30M${cx - 26} 522l58 -30" stroke="#0a0e22" stroke-width="7"/>`
    return `<g fill="#0a0e22">${s}</g><g fill="#ffd890" fill-opacity=".85">${w}</g>` +
      `<g style="animation:f2 1s steps(1,end) infinite"><circle cx="${cx - 22}" cy="${474}" r="9" fill="#ff3a3a"/><circle cx="${cx - 22}" cy="474" r="40" fill="url(#crossing)"/></g>` +
      `<g style="animation:f2 1s steps(1,end) -.5s infinite"><circle cx="${cx + 28}" cy="474" r="9" fill="#ff3a3a"/><circle cx="${cx + 28}" cy="474" r="40" fill="url(#crossing)"/></g>`
  }
  out += `<g style="animation:slideNear 22s steps(220,end) infinite">${tiled(near)}</g>`
  out += `<rect x="140" y="600" width="1320" height="${WB - 600}" fill="#060918"/>`
  // Catenary poles flicking past, with the wire along the top.
  const poles = (dx) => [0, TILE / 2].map((x) => `<rect x="${dx + 140 + x}" y="${WY}" width="22" height="${WB - WY}" fill="#05070f" fill-opacity=".92"/><rect x="${dx + 140 + x - 60}" y="${WY + 40}" width="140" height="8" fill="#05070f" fill-opacity=".9"/>`).join('')
  out += `<path d="M140 ${WY + 58}H1460" stroke="#05070f" stroke-width="2"/>`
  out += `<g style="animation:slidePoles 3s steps(30,end) infinite">${tiled(poles)}</g>`
  // Speed streaks low on the glass.
  out += [0, 1, 2].map((k) => `<g stroke="#ffd8a0" stroke-opacity=".25" stroke-width="2" style="animation:f3 .6s steps(1,end) -${f(k * 0.2)}s infinite">` +
    Array.from({ length: 6 }, (_, i) => `<path d="M${140 + ((i * 233 + k * 151) % 1200)} ${612 + ((i * 7 + k * 5) % 22)}h${60 + (i % 3) * 30}"/>`).join('') + `</g>`).join('')
  // Raindrops on the glass, and drops streaking back with the speed.
  let drops = ''
  for (let i = 0; i < 70; i++) drops += `<circle cx="${f(150 + rnd() * 1300)}" cy="${f(WY + 10 + rnd() * (WB - WY - 20))}" r="${f(1.6 + rnd() * 2.4)}"/>`
  out += `<g fill="#b8d0ff" fill-opacity=".28">${drops}</g>`
  out += [0, 1, 2].map((k) => `<g stroke="#b8d0ff" stroke-opacity=".3" stroke-width="1.6" stroke-linecap="round" style="animation:f3 .9s steps(1,end) -${f(k * 0.3)}s infinite">` +
    Array.from({ length: 16 }, (_, i) => { const x = 160 + ((i * 179 + k * 67) % 1280), y = WY + 20 + ((i * 97 + k * 41) % (WB - WY - 60)); return `<path d="M${x} ${y}l-34 6"/>` }).join('') + `</g>`).join('')
  // The carriage reflected faintly in the glass.
  out += `<ellipse cx="420" cy="260" rx="260" ry="120" fill="url(#reflect)"/><ellipse cx="1140" cy="280" rx="240" ry="110" fill="url(#reflect)"/>`
  body += `<g clip-path="url(#glass)">${out}</g>`

  // Window frames, the pillar between panes, and the ledge.
  for (const [x0, x1] of PANES) body += `<rect x="${x0}" y="${WY}" width="${x1 - x0}" height="${WB - WY}" rx="34" fill="none" stroke="#6a564c" stroke-width="16"/><rect x="${x0 + 8}" y="${WY + 8}" width="${x1 - x0 - 16}" height="${WB - WY - 16}" rx="28" fill="none" stroke="#8a7264" stroke-width="2"/>`
  body += `<rect x="100" y="${WB + 4}" width="1400" height="40" rx="8" fill="url(#ledge)"/><rect x="100" y="${WB + 4}" width="1400" height="4" rx="2" fill="#a8866c"/>`
  // On the ledge: a book, a mug of tea steaming, and a rice ball on a napkin.
  body += `<g transform="translate(300 ${WB + 4})"><rect x="0" y="-22" width="120" height="20" rx="3" fill="#3a5a8a"/><rect x="4" y="-18" width="112" height="14" fill="#f0e8dc"/><rect x="0" y="-26" width="116" height="6" rx="2" fill="#4a6aa0"/></g>`
  body += `<g transform="translate(1080 ${WB + 4})"><path d="M0 -58h56v44q0 12 -12 12h-32q-12 0 -12 -12z" fill="#e8e2d8"/><path d="M56 -48q22 0 22 16t-22 16" fill="none" stroke="#e8e2d8" stroke-width="8"/><ellipse cx="28" cy="-58" rx="28" ry="6" fill="#8a5a3a"/></g>`
  body += [0, 1, 2].map((k) => `<path d="M${1096 + k * 3} ${WB - 66}q-10 -18 0 -36q10 -18 0 -36M${1118 - k * 2} ${WB - 62}q8 -16 0 -32" fill="none" stroke="#f4e8f0" stroke-opacity=".2" stroke-width="6" stroke-linecap="round" transform="translate(${(k - 1) * 4} ${-k * 6})" style="animation:f3 1.8s steps(1,end) -${f(k * 0.6)}s infinite"/>`).join('')
  body += `<g transform="translate(1220 ${WB + 4})"><rect x="-10" y="-6" width="80" height="6" fill="#f4f0e8"/><path d="M30 -48l30 42h-60z" fill="#f8f6f0"/><rect x="12" y="-24" width="36" height="18" fill="#1e2a22"/></g>`

  // Seats in the foreground with white headrest covers, and the luggage rack with swaying straps.
  for (const [x, flip] of [[0, false], [1300, true]]) {
    const sx = flip ? x + 300 : x
    body += `<g transform="translate(${sx} 0) scale(${flip ? -1 : 1} 1)"><path d="M0 ${H}V760q0 -40 40 -40h220q40 0 40 40V${H}Z" fill="url(#seat)"/>` +
      `<path d="M40 720h220q40 0 40 40v40h-300v-40q0 -40 40 -40z" fill="#f2efe8"/><path d="M0 800h300" stroke="#c8c2b8" stroke-width="2"/>` +
      Array.from({ length: 30 }, (_, i) => `<circle cx="${20 + (i % 10) * 28}" cy="${830 + Math.floor(i / 10) * 40}" r="3" fill="#3e7a8a"/>`).join('') + `</g>`
  }
  body += `<rect x="0" y="30" width="${W}" height="10" fill="#8a8a96"/><rect x="0" y="56" width="${W}" height="6" fill="#6a6a76"/>`
  const strap = (x, tilt) => `<g transform="rotate(${tilt} ${x} 62)"><rect x="${x - 3}" y="62" width="6" height="40" fill="#e8e2d8"/><circle cx="${x}" cy="114" r="13" fill="none" stroke="#e8e2d8" stroke-width="5"/></g>`
  body += [-3, 3].map((tilt, k) => `<g style="animation:f2 2.4s steps(1,end) -${k * 1.2}s infinite">${[260, 540, 1060, 1340].map((x) => strap(x, tilt)).join('')}</g>`).join('')
  body += `<rect width="${W}" height="${H}" fill="url(#lamp)"/>`

  const css =
    `@keyframes f2{0%{opacity:1}50%{opacity:0}}@keyframes f3{0%{opacity:1}33.333%{opacity:0}}` +
    `@keyframes slideFar{0%{transform:translate(0,0)}100%{transform:translate(-${TILE}px,0)}}` +
    `@keyframes slideNear{0%{transform:translate(0,0)}100%{transform:translate(-${TILE}px,0)}}` +
    `@keyframes slidePoles{0%{transform:translate(0,0)}100%{transform:translate(-${TILE}px,0)}}`

  return svgDoc({ defs, css, body })
}
