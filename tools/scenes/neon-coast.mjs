// A beach boulevard at dusk: a low sun over the ocean, palm trees swaying, pastel art-deco hotels
// trimmed in flickering neon, a convertible cruising past, a helicopter crossing with its light
// blinking, and gulls. An original scene in the Miami-at-sunset style; no game's names, logos or
// characters. Every change lands on the shared 0.1 s tick.
import { H, TICK, W, f, onTick, rng, svgDoc } from './_lib.mjs'

const SEA = 600, SAND = 720, ROAD = 820

export default function scene() {
  const rnd = rng(0xc0a57)
  const defs =
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1446"/><stop offset=".45" stop-color="#9c3477"/><stop offset=".8" stop-color="#ff8a5b"/><stop offset="1" stop-color="#ffc48a"/></linearGradient>` +
    `<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b3a7d"/><stop offset="1" stop-color="#2d3f74"/></linearGradient>` +
    `<radialGradient id="sunGlow"><stop offset="0" stop-color="#ffe3a3" stop-opacity=".8"/><stop offset="1" stop-color="#ff8a5b" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0b8"/><stop offset="1" stop-color="#ff9a5c"/></linearGradient>` +
    `<clipPath id="aboveSea"><rect width="${W}" height="${SEA}"/></clipPath>`

  // Sun sinking into the sea, and its reflection broken into shimmering streaks.
  const SX = 1080
  const sun = `<circle cx="${SX}" cy="${SEA}" r="300" fill="url(#sunGlow)"/><g clip-path="url(#aboveSea)"><circle cx="${SX}" cy="${SEA + 20}" r="120" fill="url(#sun)"/></g>`
  const streaks = ['', '', '']
  for (let i = 0; i < 18; i++) {
    const y = SEA + 10 + i * 6 + rnd() * 4, w = 220 - i * 9 + rnd() * 40
    streaks[i % 3] += `<rect x="${f(SX - w / 2 + rnd() * 30 - 15)}" y="${f(y)}" width="${f(w)}" height="3" rx="1.5"/>`
  }
  const shimmer = streaks.map((g, i) => `<g fill="#ffd28a" fill-opacity=".55" style="animation:shimmer 1.2s steps(1,end) -${f(i * 0.4)}s infinite">${g}</g>`).join('')
  let swell = `M0 ${SEA + 50}`
  for (let x = 0; x <= W + 200; x += 100) swell += `Q${x + 50} ${SEA + 42} ${x + 100} ${SEA + 50}`
  const waves = `<g style="animation:wash 4s steps(40,end) infinite"><path d="${swell}" fill="none" stroke="#ffc9e0" stroke-opacity=".35" stroke-width="3"/><path d="${swell}" transform="translate(-50 40)" fill="none" stroke="#ffc9e0" stroke-opacity=".25" stroke-width="3"/></g>`

  // Hotels on the left: pastel facades, window rows, and neon trim that flickers.
  const NEON = ['#ff4fa3', '#3ff2c6', '#7fd6ff']
  let hotels = '', trim = ['', '', '']
  for (const [x, w, top, color] of [[-10, 190, 380, '#f6b8cf'], [180, 160, 450, '#b8eadb'], [340, 150, 410, '#d9c6f5']]) {
    hotels += `<rect x="${x}" y="${top}" width="${w}" height="${ROAD - top}" fill="${color}"/>` +
      `<rect x="${x}" y="${top}" width="${w}" height="18" fill="#ffffff" fill-opacity=".6"/>`
    for (let y = top + 50; y < ROAD - 60; y += 46) {
      hotels += `<rect x="${x + 16}" y="${y}" width="${w - 32}" height="22" fill="#6b4f7d" fill-opacity=".35"/>`
      for (let wx = x + 28; wx < x + w - 30; wx += 34) hotels += `<rect x="${wx}" y="${y + 3}" width="18" height="16" fill="#ffe7b3" fill-opacity="${f(0.35 + rnd() * 0.5)}"/>`
    }
    const k = Math.floor(rnd() * 3)
    trim[k] += `<path d="M${x + 6} ${top + 26}H${x + w - 6}M${x + 6} ${ROAD - 30}H${x + w - 6}" stroke="${NEON[k]}" stroke-width="5"/>`
  }
  // A tall neon fin sign with no lettering: a stack of glowing bars and a ring.
  trim[0] += `<rect x="140" y="250" width="44" height="200" fill="#2a1236"/><circle cx="162" cy="282" r="14" fill="none" stroke="#3ff2c6" stroke-width="5"/>` +
    `<path d="M150 318H174M150 344H174M150 370H174M150 396H174M150 422H174" stroke="#ff4fa3" stroke-width="6" stroke-linecap="round"/>`
  const neon = trim.map((g, i) => `<g style="animation:neon ${[5, 10, 15][i]}s steps(1,end) -${i}s infinite">${g}</g>`).join('')

  // Palms: trunk curves with fronds swaying from the top.
  const palm = (x, base, h, lean, dur, delay) => {
    const tx = x + lean, ty = base - h
    let fronds = ''
    for (const a of [-160, -125, -90, -55, -20, 15, 200]) {
      fronds += `<path transform="rotate(${a})" d="M0 0Q50 -26 110 6Q56 -8 0 6Z"/>`
    }
    return `<path d="M${x} ${base}Q${x + lean * 0.2} ${base - h * 0.6} ${tx} ${ty}" fill="none" stroke="#2a1236" stroke-width="12" stroke-linecap="round"/>` +
      `<g transform="translate(${tx} ${ty})"><g fill="#2a1236" style="animation:palm ${dur}s steps(${Math.round(dur / 2 / TICK)},end) -${delay}s infinite">${fronds}</g></g>`
  }
  const palms = palm(560, ROAD, 360, 40, 4, 0) + palm(680, ROAD, 300, -30, 4.8, 1) + palm(1380, ROAD, 380, -50, 5.6, 2) + palm(1520, ROAD, 320, 30, 4, 3)

  // A convertible cruising left to right with its headlight beam.
  const car =
    `<g transform="translate(0 ${ROAD + 30})"><g style="animation:cruise 12s steps(120,end) -3s infinite">` +
    `<path d="M70 -6L260 -30V-14L80 4Z" fill="#ffd28a" fill-opacity=".22"/>` +
    `<path d="M-90 0V-18Q-86 -30 -60 -32L-20 -34L10 -52H44L58 -34L72 -30Q86 -26 86 -14V0Z" fill="#ff4fa3"/>` +
    `<path d="M14 -48H40L50 -34H8Z" fill="#7fd6ff" fill-opacity=".7"/><rect x="-92" y="-18" width="8" height="6" fill="#ff3b3b"/>` +
    `<circle cx="-54" cy="2" r="13" fill="#1a0d24"/><circle cx="50" cy="2" r="13" fill="#1a0d24"/><circle cx="-54" cy="2" r="5" fill="#cfd3e0"/><circle cx="50" cy="2" r="5" fill="#cfd3e0"/></g></g>`

  // A helicopter crossing high up, its light blinking, and a few gulls.
  const heli =
    `<g transform="translate(0 140)"><g style="animation:heli 30s steps(300,end) -8s infinite">` +
    `<path d="M-28 -6Q-30 8 -10 10H18Q30 8 30 -2L-4 -8Z" fill="#1d0f2c"/><path d="M-28 -2H-70V2H-28Z" fill="#1d0f2c"/><path d="M-60 -60H40" stroke="#1d0f2c" stroke-width="3" transform="translate(0 50)"/>` +
    `<circle cx="-70" cy="0" r="4" fill="#ff3b3b" style="animation:blink 1s steps(1,end) infinite"/></g></g>`
  let gulls = ''
  for (const [dx, dy] of [[0, 0], [-40, 16], [-75, -8]]) {
    gulls += `<g transform="translate(${dx} ${dy})"><path d="M-10 0Q-5 -7 0 0Q5 -7 10 0" fill="none" stroke="#2a1236" stroke-width="2.5" style="animation:flap .6s steps(1,end) infinite"/>` +
      `<path d="M-10 -4Q-5 2 0 -2Q5 2 10 -4" fill="none" stroke="#2a1236" stroke-width="2.5" style="animation:flap .6s steps(1,end) -.3s infinite"/></g>`
  }
  const flock = `<g transform="translate(0 300)"><g style="animation:gulls 24s steps(240,end) -6s infinite">${gulls}</g></g>`

  return svgDoc({
    defs,
    css:
      `@keyframes shimmer{0%{opacity:1}50%{opacity:.35}}` +
      `@keyframes wash{to{transform:translateX(-100px)}}` +
      `@keyframes neon{0%{opacity:1}92%{opacity:.35}94%{opacity:1}96%{opacity:.5}98%{opacity:1}}` +
      `@keyframes palm{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}` +
      `@keyframes cruise{from{transform:translateX(-300px)}to{transform:translateX(${W + 300}px)}}` +
      `@keyframes heli{from{transform:translateX(${W + 120}px)}to{transform:translateX(-160px)}}` +
      `@keyframes gulls{from{transform:translate(-120px,0)}to{transform:translate(${W + 120}px,-40px)}}` +
      `@keyframes blink{0%{opacity:1}50%{opacity:.1}}` +
      `@keyframes flap{0%{opacity:1}50%{opacity:0}}`,
    body:
      `<rect width="${W}" height="${H}" fill="url(#sky)"/>` + sun + heli + flock +
      `<rect y="${SEA}" width="${W}" height="${SAND - SEA}" fill="url(#sea)"/>` + shimmer + waves +
      `<path d="M0 ${SAND}Q400 ${SAND - 14} 800 ${SAND}T${W} ${SAND - 6}V${ROAD}H0Z" fill="#e9b59a"/>` +
      `<rect y="${ROAD}" width="${W}" height="${H - ROAD}" fill="#231530"/>` +
      `<path d="M0 ${ROAD + 84}H${W}" stroke="#ffd28a" stroke-opacity=".5" stroke-width="4" stroke-dasharray="40 30"/>` +
      hotels + neon + palms + car,
  })
}
