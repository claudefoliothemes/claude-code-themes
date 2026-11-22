// A scramble crossing in Tokyo at night, in the rain: towers with glowing billboards (no
// lettering), an elevated train gliding past, and people with umbrellas crossing in waves when
// the walk signal turns green. Every change lands on the shared 0.1 s tick.
import { H, TICK, W, f, rng, svgDoc } from './_lib.mjs'

const TRACK = 430, CURB = 760
const CYCLE = 20 // seconds: wait at the curb, cross, clear the street
const WALK_FROM = 0.4, WALK_TO = 0.75 // fractions of the cycle

export default function scene() {
  const rnd = rng(0x70c10)
  const NEON = ['#ff7ac6', '#5ef2b5', '#6ee7ff', '#ffd166', '#a78bfa']
  const defs =
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07060f"/><stop offset="1" stop-color="#1e1636"/></linearGradient>` +
    `<linearGradient id="street" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1728"/><stop offset="1" stop-color="#0c0a14"/></linearGradient>` +
    NEON.map((c, i) => `<linearGradient id="bb${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="${NEON[(i + 2) % 5]}" stop-opacity=".7"/></linearGradient>`).join('')

  // Towers along the back with rows of lit windows, and billboards that flicker.
  let towers = ''
  const windows = {}
  for (let x = -10; x < W; ) {
    const w = 110 + rnd() * 90, top = 90 + rnd() * 220
    towers += `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(CURB - top)}" fill="${rnd() < 0.5 ? '#14111f' : '#18142a'}"/>`
    for (let y = top + 20; y < TRACK - 10; y += 22) for (let wx = x + 10; wx < x + w - 14; wx += 18) {
      if (rnd() < 0.35) { const c = rnd() < 0.7 ? '#ffe2a8' : '#9fd8ff'; windows[c] = (windows[c] ?? '') + `M${f(wx)} ${f(y)}h10v12h-10Z` }
    }
    x += w + 6
  }
  const lit = Object.entries(windows).map(([c, d]) => `<path d="${d}" fill="${c}" fill-opacity=".45"/>`).join('')
  const boards = [[30, 160, 150, 100, 0, 5], [240, 220, 90, 150, 1, 10], [1150, 120, 170, 110, 2, 15], [1380, 200, 120, 170, 3, 5], [600, 140, 140, 80, 4, 10]]
    .map(([x, y, w, h, i, dur]) =>
      `<g style="animation:sign ${dur}s steps(1,end) -${i}s infinite"><rect x="${x - 8}" y="${y - 8}" width="${w + 16}" height="${h + 16}" fill="${NEON[i]}" fill-opacity=".18"/>` +
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#bb${i})"/>` +
      `<path d="M${x + 14} ${y + 20}h${f(w * 0.5)}M${x + 14} ${y + 38}h${f(w * 0.7)}M${x + 14} ${y + 56}h${f(w * 0.35)}" stroke="#fff" stroke-opacity=".75" stroke-width="6" stroke-linecap="round"/></g>`).join('')

  // Elevated track on pillars, and a train gliding across on a long loop.
  const track =
    `<rect y="${TRACK}" width="${W}" height="26" fill="#3a3550"/><rect y="${TRACK + 26}" width="${W}" height="8" fill="#2a2640"/>` +
    [100, 420, 740, 1060, 1380].map((x) => `<rect x="${x}" y="${TRACK + 34}" width="34" height="${CURB - TRACK - 34}" fill="#24203a"/>`).join('')
  let cars = ''
  for (let k = 0; k < 4; k++) {
    const cx = k * 230
    cars += `<rect x="${cx}" y="-58" width="222" height="58" rx="10" fill="#d9dde8"/><rect x="${cx}" y="-22" width="222" height="8" fill="#22b5a8"/>`
    for (let w = 0; w < 6; w++) cars += `<rect x="${cx + 14 + w * 34}" y="-48" width="24" height="18" rx="3" fill="#ffe9b8"/>`
  }
  // Shopfronts under the track: warm windows, awnings, and a glow spilling onto the sidewalk.
  let shops = ''
  const SHOP = ['#ffd08a', '#ffb3c8', '#9fe3ff', '#c7f5a8']
  for (let x = 0; x < W; x += 160) {
    const c = SHOP[Math.floor(rnd() * 4)]
    shops += `<rect x="${x + 18}" y="${CURB - 130}" width="124" height="130" fill="#100d1a"/>` +
      `<rect x="${x + 26}" y="${CURB - 104}" width="108" height="64" fill="${c}" fill-opacity=".5"/>` +
      `<path d="M${x + 14} ${CURB - 124}h132l-10 18h-112Z" fill="${NEON[Math.floor(rnd() * 5)]}" fill-opacity=".55"/>` +
      `<rect x="${x + 18}" y="${CURB}" width="124" height="16" fill="${c}" fill-opacity=".12"/>`
  }
  const train = `<g transform="translate(0 ${TRACK})"><g style="animation:train 16s steps(160,end) -5s infinite">${cars}</g></g>`

  // The crossing: wet street, zebra stripes, and the walk signal.
  let stripes = ''
  for (let x = 40; x < W; x += 70) stripes += `M${x} ${CURB + 70}h44v90h-44Z`
  // The crossing's other direction runs down the middle, broken where it meets the main band.
  for (let y = CURB + 20; y < H; y += 50) if (y + 26 < CURB + 70 || y > CURB + 160) stripes += `M${W / 2 - 40} ${y}h80v26h-80Z`
  const at = (p) => +(p * 100).toFixed(3)
  const sig = (color, on) => `@keyframes ${color}{0%{opacity:${on ? 0 : 1}}${at(WALK_FROM)}%{opacity:${on ? 1 : 0}}${at(WALK_TO)}%{opacity:${on ? 0 : 1}}}`
  const signal = (x) =>
    `<g transform="translate(${x} ${CURB - 120})"><rect x="-4" y="40" width="8" height="80" fill="#2a2640"/><rect x="-22" y="-10" width="44" height="54" rx="4" fill="#1a1726"/>` +
    `<circle cy="5" r="11" fill="#ff4d5e" style="animation:red ${CYCLE}s steps(1,end) infinite"/><circle cy="29" r="11" fill="#5ef2b5" style="animation:green ${CYCLE}s steps(1,end) infinite"/></g>`

  // People with umbrellas: wait at a curb, cross while the signal is green, then fade out on the
  // far side and come back as the next wave.
  const walkSteps = Math.round(((WALK_TO - WALK_FROM) * CYCLE) / TICK)
  let people = '', walkCss = ''
  const UMB = ['#ff7ac6', '#6ee7ff', '#ffd166', '#5ef2b5', '#f5f5f5', '#a78bfa']
  for (let i = 0; i < 18; i++) {
    const dir = i % 2 ? 1 : -1
    const fromX = dir > 0 ? 40 + rnd() * 260 : W - 40 - rnd() * 260
    const toX = dir > 0 ? W - 120 - rnd() * 300 : 120 + rnd() * 300
    const y = CURB + 40 + rnd() * 190
    walkCss += `@keyframes walk${i}{0%{transform:translateX(0);opacity:1;animation-timing-function:steps(1,end)}` +
      `${at(WALK_FROM)}%{transform:translateX(0);opacity:1;animation-timing-function:steps(${walkSteps},end)}` +
      `${at(WALK_TO)}%{transform:translateX(${f(toX - fromX)}px);opacity:1;animation-timing-function:steps(1,end)}` +
      `${at(0.85)}%{transform:translateX(${f(toX - fromX)}px);opacity:0}100%{transform:translateX(${f(toX - fromX)}px);opacity:0}}`
    people += `<g transform="translate(${f(fromX)} ${f(y)})"><g style="animation:walk${i} ${CYCLE}s infinite">` +
      `<rect x="-5" y="-18" width="10" height="20" rx="3" fill="#1a1726"/><path d="M-4 2V12M4 2V12" stroke="#1a1726" stroke-width="3"/>` +
      `<path d="M-20 -18Q0 -40 20 -18Z" fill="${UMB[i % UMB.length]}" fill-opacity=".9"/><path d="M0 -38V-18" stroke="#1a1726" stroke-width="2"/></g></g>`
  }

  // Rain over everything.
  let drops = ''
  for (let i = 0; i < 110; i++) {
    const x = f(rnd() * (W + 200)), y = f(rnd() * H), l = f(16 + rnd() * 20)
    drops += `M${x} ${y}v${l}M${x} ${f(y - H)}v${l}`
  }
  const rain = `<g transform="skewX(-10)"><g style="animation:fall 1.4s steps(14,end) infinite"><path d="${drops}" stroke="#b9c4ff" stroke-opacity=".2" stroke-width="1.4" fill="none"/></g></g>`
  // Neon smeared on the wet street.
  let glow = ''
  for (let i = 0; i < 30; i++) glow += `<rect x="${f(rnd() * W)}" y="${f(CURB + 10 + rnd() * 220)}" width="${f(20 + rnd() * 60)}" height="4" rx="2" fill="${NEON[i % 5]}" fill-opacity="${f(0.08 + rnd() * 0.14)}"/>`

  return svgDoc({
    defs,
    css:
      walkCss + sig('red', false) + sig('green', true) +
      `@keyframes sign{0%{opacity:1}92%{opacity:.4}94%{opacity:1}96%{opacity:.55}98%{opacity:1}}` +
      `@keyframes train{from{transform:translateX(${W + 40}px)}to{transform:translateX(-1000px)}}` +
      `@keyframes fall{to{transform:translateY(${H}px)}}`,
    body:
      `<rect width="${W}" height="${H}" fill="url(#sky)"/>` + towers + lit + boards + track + shops + train +
      `<rect y="${CURB}" width="${W}" height="${H - CURB}" fill="url(#street)"/>` + glow +
      `<path d="${stripes}" fill="#e8e6f0" fill-opacity=".55"/>` + signal(330) + signal(1270) + people + rain,
  })
}
