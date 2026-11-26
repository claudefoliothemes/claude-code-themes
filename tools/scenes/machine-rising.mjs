// A war-torn future city at night, burning, and a chrome robot endoskeleton of our own design
// looming over it: an angular faceted skull with a pulsing red eye slit, a jaw grille, hydraulic
// neck pistons, armored ribs around a glowing red core, and piston-driven arms. Searchlights sweep
// the smoke, hunter drones cross the sky, laser fire flashes in the distance, and embers rise. Vector
// art; glows are gradients and layered strokes. Every change lands on the shared 0.1 s tick.
import { H, W, f, rng, svgDoc } from './_lib.mjs'

const GROUND = 820
const RX = 1300, RY = 330 // the robot's head center

export default function scene() {
  const rnd = rng(0x7e800)
  const defs =
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0406"/><stop offset=".45" stop-color="#2a0a0c"/><stop offset=".8" stop-color="#6a1a0e"/><stop offset="1" stop-color="#a8400e"/></linearGradient>` +
    `<linearGradient id="chrome" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2f4f8"/><stop offset=".3" stop-color="#a2aab8"/><stop offset=".55" stop-color="#3a404c"/><stop offset=".78" stop-color="#c0c8d4"/><stop offset="1" stop-color="#3a3e48"/></linearGradient>` +
    `<linearGradient id="chromeDark" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8a92a0"/><stop offset=".5" stop-color="#2a2e38"/><stop offset="1" stop-color="#5a606c"/></linearGradient>` +
    `<radialGradient id="eye"><stop offset="0" stop-color="#ff3a2a" stop-opacity=".9"/><stop offset=".3" stop-color="#ff1a1a" stop-opacity=".45"/><stop offset="1" stop-color="#ff1a1a" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="core"><stop offset="0" stop-color="#ffe0d0"/><stop offset=".25" stop-color="#ff3a2a"/><stop offset=".6" stop-color="#ff1a1a" stop-opacity=".35"/><stop offset="1" stop-color="#ff1a1a" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="fire"><stop offset="0" stop-color="#ffb040" stop-opacity=".75"/><stop offset=".4" stop-color="#ff5a1a" stop-opacity=".35"/><stop offset="1" stop-color="#ff3a0a" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="smoke"><stop offset="0" stop-color="#1a0c0c" stop-opacity=".85"/><stop offset="1" stop-color="#1a0c0c" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="beam" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#d8e8ff" stop-opacity=".2"/><stop offset="1" stop-color="#d8e8ff" stop-opacity="0"/></linearGradient>` +
    `<linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a0a08"/><stop offset="1" stop-color="#080404"/></linearGradient>`

  let body = `<rect width="${W}" height="${H}" fill="url(#sky)"/>`

  // Searchlights sweeping up through the smoke from the ruins.
  const beam = (x, ang) => { const a = (ang * Math.PI) / 180, l = 1000, w = 50; return `<path d="M${x} ${GROUND}L${f(x + Math.sin(a) * l - Math.cos(a) * w)} ${f(GROUND - Math.cos(a) * l - Math.sin(a) * w)}L${f(x + Math.sin(a) * l + Math.cos(a) * w)} ${f(GROUND - Math.cos(a) * l + Math.sin(a) * w)}Z" fill="url(#beam)"/>` }
  for (const [x, angles, delay] of [[300, [-26, -12, 2, -12], 0], [760, [18, 4, -10, 4], 1.6]]) body += angles.map((ang, k) => `<g style="animation:f4 6.4s steps(1,end) -${f(delay + k * 1.6)}s infinite">${beam(x, ang)}</g>`).join('')

  // Ruined skyline: broken towers, a few windows still burning, fires at their feet.
  let ruins = '', lit = ''
  for (let x = -20; x < 1150;) {
    const w = 50 + rnd() * 80, h = 150 + rnd() * 300, top = GROUND - h, broken = rnd() < 0.6
    ruins += broken ? `<path d="M${f(x)} ${GROUND}V${f(top + 30)}l${f(w * 0.3)} -30l${f(w * 0.2)} 22l${f(w * 0.25)} -40l${f(w * 0.25)} 50V${GROUND}Z"/>` : `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(h)}"/>`
    for (let y = top + 40; y < GROUND - 20; y += 22) for (let wx = x + 8; wx < x + w - 10; wx += 16) if (rnd() < 0.06) lit += `<rect x="${f(wx)}" y="${f(y)}" width="6" height="8"/>`
    x += w + 6
  }
  body += `<g fill="#120606">${ruins}</g><g fill="#ff8a3a" fill-opacity=".8">${lit}</g>`
  // Smoke rising, drifting slowly.
  let smoke = ''
  for (let i = 0; i < 9; i++) smoke += `<ellipse cx="${f(60 + rnd() * 1100)}" cy="${f(200 + rnd() * 360)}" rx="${f(140 + rnd() * 160)}" ry="${f(60 + rnd() * 60)}" fill="url(#smoke)"/>`
  body += `<g style="animation:drift 90s steps(90,end) infinite alternate">${smoke}</g>`
  // Fires along the street, flickering.
  const FIRES = [[120, 260], [420, 220], [690, 300], [950, 240]]
  body += [0, 1].map((k) => `<g style="animation:f2 .6s steps(1,end) -${k * 0.3}s infinite">${FIRES.map(([x, r]) => `<ellipse cx="${x + (k ? 12 : -8)}" cy="${GROUND - 10}" rx="${r * (k ? 1 : 0.9)}" ry="${f(r * 0.55)}" fill="url(#fire)"/>`).join('')}</g>`).join('')
  body += `<rect y="${GROUND}" width="${W}" height="${H - GROUND}" fill="url(#ground)"/>`
  let rubble = ''
  for (let i = 0; i < 60; i++) { const x = rnd() * W, y = GROUND + 4 + rnd() * 160, s = 6 + rnd() * 22; rubble += `<path d="M${f(x)} ${f(y)}l${f(s)} ${f(-s * 0.4)}l${f(s * 0.6)} ${f(s * 0.5)}z"/>` }
  body += `<g fill="#241210">${rubble}</g>`

  // Laser fire flashing between distant positions.
  for (const [x1, y1, x2, y2, c, d] of [[180, 520, 520, 430, '#ff3a3a', 0], [880, 470, 620, 560, '#3ab8ff', 2.1], [300, 600, 700, 520, '#ff3a3a', 3.4]]) {
    body += `<g style="animation:zap 5s steps(1,end) -${d}s infinite"><path d="M${x1} ${y1}L${x2} ${y2}" stroke="${c}" stroke-width="10" stroke-opacity=".25" stroke-linecap="round"/><path d="M${x1} ${y1}L${x2} ${y2}" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/></g>`
  }
  // Hunter drones crossing the sky.
  const drone = `<path d="M-46 0L-14 -12H14L46 0L14 10H-14Z" fill="#14100e"/><path d="M-60 -2H60" stroke="#14100e" stroke-width="4"/><circle cx="-30" cy="2" r="3" fill="#ff2a2a"/><circle cx="30" cy="2" r="3" fill="#ff2a2a"/><path d="M-10 10L-30 60H30L10 10Z" fill="#ffdcb0" fill-opacity=".06"/>`
  body += `<g style="animation:hunt 30s steps(300,end) -4s infinite">${drone}</g><g style="animation:hunt2 42s steps(420,end) -25s infinite"><g transform="scale(.7)">${drone}</g></g>`

  // The robot: arms behind the torso, then ribs and core, neck, and the head on top.
  const c = (x, y) => `${f(RX + x)} ${f(RY + y)}`
  let robot = ''
  // Arms: shoulder balls, upper arms with pistons, forearms reaching down past the frame.
  for (const s of [-1, 1]) {
    robot += `<path d="M${c(s * 170, 230)}L${c(s * 250, 450)}L${c(s * 225, 700)}" fill="none" stroke="url(#chromeDark)" stroke-width="40" stroke-linejoin="round"/>`
    robot += `<path d="M${c(s * 170, 230)}L${c(s * 250, 450)}L${c(s * 225, 700)}" fill="none" stroke="url(#chrome)" stroke-width="22" stroke-linejoin="round"/>`
    robot += `<path d="M${c(s * 140, 270)}L${c(s * 215, 430)}" stroke="#5a606c" stroke-width="10"/><path d="M${c(s * 140, 270)}L${c(s * 180, 355)}" stroke="#c8ced8" stroke-width="6"/>`
    robot += `<circle cx="${RX + s * 250}" cy="${RY + 450}" r="26" fill="url(#chrome)"/><circle cx="${RX + s * 250}" cy="${RY + 450}" r="10" fill="#2a2e38"/>`
    robot += `<circle cx="${RX + s * 170}" cy="${RY + 230}" r="48" fill="url(#chrome)"/><circle cx="${RX + s * 170}" cy="${RY + 230}" r="20" fill="#2a2e38"/>`
  }
  // Spine and collar.
  robot += `<rect x="${RX - 16}" y="${RY + 110}" width="32" height="560" fill="url(#chromeDark)"/>` + Array.from({ length: 12 }, (_, i) => `<rect x="${RX - 26}" y="${RY + 150 + i * 44}" width="52" height="16" rx="4" fill="url(#chrome)"/>`).join('')
  robot += `<path d="M${c(-150, 200)}L${c(-40, 175)}L${c(40, 175)}L${c(150, 200)}L${c(130, 225)}L${c(-130, 225)}Z" fill="url(#chrome)"/>`
  // Ribs: armored chrome bars curving out from the spine, around the core.
  for (let i = 0; i < 5; i++) {
    const y = 270 + i * 52, w = 150 - i * 10
    for (const s of [-1, 1]) robot += `<path d="M${c(s * 20, y)}Q${c(s * (w + 20), y - 30)} ${c(s * w, y + 28)}" fill="none" stroke="url(#chrome)" stroke-width="16" stroke-linecap="round"/><path d="M${c(s * 20, y + 2)}Q${c(s * (w + 20), y - 28)} ${c(s * w, y + 30)}" fill="none" stroke="#1a1e26" stroke-width="3" stroke-opacity=".5"/>`
  }
  robot += `<circle cx="${RX}" cy="${RY + 330}" r="90" fill="url(#core)" style="animation:pulse 2s steps(1,end) infinite"/><circle cx="${RX}" cy="${RY + 330}" r="26" fill="#2a1010" stroke="url(#chrome)" stroke-width="8"/><circle cx="${RX}" cy="${RY + 330}" r="14" fill="#ff4a2a" style="animation:pulse 2s steps(1,end) infinite"/>`
  // Neck pistons.
  for (const s of [-1, 1]) robot += `<path d="M${c(s * 42, 90)}L${c(s * 34, 180)}" stroke="url(#chromeDark)" stroke-width="20"/><path d="M${c(s * 42, 90)}L${c(s * 38, 130)}" stroke="#d8dee8" stroke-width="9"/>`
  robot += Array.from({ length: 3 }, (_, i) => `<rect x="${RX - 14}" y="${RY + 96 + i * 26}" width="28" height="16" rx="3" fill="url(#chrome)"/>`).join('')
  // The head: faceted skull, crest fin, brow plate, red eye slit, cheek plates, jaw grille, temple fins.
  robot += `<path d="M${c(-14, -96)}L${c(14, -96)}L${c(6, -150)}L${c(-6, -150)}Z" fill="url(#chrome)"/>`
  for (const s of [-1, 1]) robot += `<path d="M${c(s * 118, -40)}L${c(s * 160, -78)}L${c(s * 150, -30)}Z" fill="url(#chromeDark)"/>`
  robot += `<path d="M${c(-96, -98)}L${c(96, -98)}L${c(122, -32)}L${c(112, 38)}L${c(72, 98)}L${c(-72, 98)}L${c(-112, 38)}L${c(-122, -32)}Z" fill="url(#chrome)"/>`
  robot += `<path d="M${c(-96, -98)}L${c(0, -60)}L${c(96, -98)}M${c(-122, -32)}L${c(-60, 10)}L${c(-72, 98)}M${c(122, -32)}L${c(60, 10)}L${c(72, 98)}" fill="none" stroke="#2a2e38" stroke-width="2.5" stroke-opacity=".7"/>`
  robot += `<path d="M${c(-116, -44)}L${c(116, -44)}L${c(104, -8)}L${c(-104, -8)}Z" fill="#1c2028"/>`
  robot += `<ellipse cx="${RX}" cy="${RY - 26}" rx="180" ry="70" fill="url(#eye)" style="animation:pulse 2s steps(1,end) -.4s infinite"/>`
  robot += `<rect x="${RX - 88}" y="${RY - 33}" width="176" height="14" rx="7" fill="#ff2a1a"/><rect x="${RX - 70}" y="${RY - 30}" width="140" height="5" rx="2.5" fill="#ffd0c0" style="animation:pulse 2s steps(1,end) -.4s infinite"/>`
  robot += `<path d="M${c(-104, 0)}L${c(-50, 20)}L${c(-64, 60)}L${c(-104, 34)}Z" fill="#b8c0cc" fill-opacity=".55"/><path d="M${c(104, 0)}L${c(50, 20)}L${c(64, 60)}L${c(104, 34)}Z" fill="#5a606c" fill-opacity=".55"/>`
  robot += `<rect x="${RX - 52}" y="${RY + 42}" width="104" height="42" rx="6" fill="#14171e"/>` + Array.from({ length: 7 }, (_, i) => `<rect x="${RX - 44 + i * 14}" y="${RY + 48}" width="6" height="30" rx="2" fill="url(#chrome)"/>`).join('')
  body += robot

  // Embers rising across the scene.
  body += [0, 1, 2].map((k) => `<g fill="#ffa040" style="animation:f3 1.2s steps(1,end) -${f(k * 0.4)}s infinite">` +
    Array.from({ length: 36 }, (_, i) => `<circle cx="${(i * 137 + k * 41) % W}" cy="${200 + ((i * 89 + k * 53) % 760)}" r="${f(1.4 + (i % 3) * 0.9)}" fill-opacity="${f(0.5 + (i % 4) * 0.12)}"/>`).join('') + `</g>`).join('')

  const css =
    `@keyframes f2{0%{opacity:1}50%{opacity:0}}@keyframes f3{0%{opacity:1}33.333%{opacity:0}}@keyframes f4{0%{opacity:1}25%{opacity:0}}` +
    `@keyframes pulse{0%{opacity:1}50%{opacity:.55}}` +
    `@keyframes zap{0%{opacity:0}90%{opacity:0}92%{opacity:1}96%{opacity:0}}` +
    `@keyframes drift{0%{transform:translate(0,0)}100%{transform:translate(90px,-30px)}}` +
    `@keyframes hunt{0%{transform:translate(-100px,150px)}100%{transform:translate(1700px,90px)}}` +
    `@keyframes hunt2{0%{transform:translate(1700px,260px)}100%{transform:translate(-100px,200px)}}`

  return svgDoc({ defs, css, body })
}
