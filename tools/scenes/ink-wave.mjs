// Woodblock-print ocean: three rows of indigo waves with cream crests and foam rolling past a red
// sun, under drifting bands of cloud. Every layer slides one whole wavelength per loop on the
// shared 0.1 s tick, so the window repaints at most 10 times a second.
import { H, TICK, W, f, rng, svgDoc } from './_lib.mjs'

export default function scene() {
  const rnd = rng(0x1a7e0a)
  const CREAM = '#dcd7ba'
  const defs =
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121218"/><stop offset=".55" stop-color="#1c1c26"/><stop offset="1" stop-color="#2a2a3a"/></linearGradient>` +
    `<radialGradient id="halo"><stop offset="0" stop-color="#c34043" stop-opacity=".35"/><stop offset="1" stop-color="#c34043" stop-opacity="0"/></radialGradient>`

  // A row of waves, one wavelength per crest, from x = -wl to W + wl so a one-wavelength slide
  // loops seamlessly. Each crest leans forward and throws a few foam "claws" ahead of it.
  const waveRow = ({ base, amp, wl, fill, crest, foam, dur, bob, name }) => {
    let body = `M${-wl} ${H}V${base}`, line = '', inner = '', claws = ''
    for (let x = -wl; x < W + wl; x += wl) {
      const a = amp * (0.85 + rnd() * 0.3)
      const seg = `C${f(x + wl * 0.25)} ${base} ${f(x + wl * 0.38)} ${f(base - a)} ${f(x + wl * 0.56)} ${f(base - a)}` +
        `C${f(x + wl * 0.68)} ${f(base - a)} ${f(x + wl * 0.74)} ${f(base - a * 0.55)} ${f(x + wl)} ${base}`
      body += seg
      line += `M${x} ${base}${seg}`
      // The crest curls forward into a hook, like a woodblock wave.
      line += `M${f(x + wl * 0.56)} ${f(base - a)}Q${f(x + wl * 0.7)} ${f(base - a * 1.3)} ${f(x + wl * 0.67)} ${f(base - a * 0.6)}`
      // Print-style lines inside the wave, following the crest a little lower each time.
      for (const dy of [14, 28]) inner += `M${f(x + wl * 0.12)} ${base + dy}C${f(x + wl * 0.3)} ${base + dy} ${f(x + wl * 0.4)} ${f(base - a * 0.7 + dy)} ${f(x + wl * 0.56)} ${f(base - a * 0.7 + dy)}C${f(x + wl * 0.66)} ${f(base - a * 0.7 + dy)} ${f(x + wl * 0.72)} ${f(base - a * 0.3 + dy)} ${f(x + wl * 0.84)} ${base + dy}`
      for (let k = 0; k < 4; k++) {
        claws += `<circle cx="${f(x + wl * (0.6 + k * 0.035))}" cy="${f(base - a * (0.98 - k * 0.12) - 4)}" r="${f(2 + rnd() * 2.5)}"/>`
      }
    }
    body += `L${W + wl} ${H}Z`
    const steps = Math.round(dur / TICK)
    const half = Math.round(bob.dur / 2 / TICK)
    return {
      css: `@keyframes roll${name}{to{transform:translateX(-${wl}px)}}@keyframes bob${name}{0%,100%{transform:translateY(0)}50%{transform:translateY(-${bob.dy}px)}}`,
      body:
        `<g style="animation:bob${name} ${bob.dur}s steps(${half},end) infinite"><g style="animation:roll${name} ${dur}s steps(${steps},end) infinite">` +
        `<path d="${body}" fill="${fill}"/>` +
        `<path d="${inner}" fill="none" stroke="${CREAM}" stroke-opacity="${f(crest * 0.35)}" stroke-width="2" stroke-linecap="round"/>` +
        `<path d="${line}" fill="none" stroke="${CREAM}" stroke-opacity="${crest}" stroke-width="3" stroke-linecap="round"/>` +
        `<g fill="${CREAM}" fill-opacity="${foam}">${claws}</g></g></g>`,
    }
  }
  const rows = [
    waveRow({ base: 640, amp: 24, wl: 220, fill: '#25324b', crest: 0.3, foam: 0.35, dur: 6, bob: { dur: 4.8, dy: 3 }, name: 'A' }),
    waveRow({ base: 770, amp: 44, wl: 320, fill: '#223249', crest: 0.55, foam: 0.6, dur: 5, bob: { dur: 4, dy: 5 }, name: 'B' }),
    waveRow({ base: 905, amp: 70, wl: 460, fill: '#1a2638', crest: 0.85, foam: 0.85, dur: 4, bob: { dur: 3.2, dy: 7 }, name: 'C' }),
  ]

  // Bands of cloud, tiled twice across the width and drifting one width per 160 s.
  let bands = ''
  for (let i = 0; i < 9; i++) {
    const x = f(rnd() * W), y = f(70 + rnd() * 380), w = f(160 + rnd() * 320), h = f(9 + rnd() * 9)
    for (const dx of [0, W]) bands += `<rect x="${f(x + dx)}" y="${y}" width="${w}" height="${h}" rx="${f(h / 2)}"/>`
  }
  const clouds = `<g style="animation:drift 160s steps(1600,end) infinite" fill="${CREAM}" fill-opacity=".1">${bands}</g>`

  // Spray above the front crests, blinking in three groups.
  const spray = ['', '', '']
  for (let i = 0; i < 60; i++) {
    spray[i % 3] += `<circle cx="${f(rnd() * W)}" cy="${f(800 + rnd() * 60)}" r="${f(1.2 + rnd() * 1.8)}"/>`
  }
  const sprayGroups = spray.map((g, i) => `<g fill="${CREAM}" fill-opacity=".55" style="animation:blink ${[1.2, 1.6, 2][i]}s steps(1,end) -${(i * 0.4).toFixed(1)}s infinite">${g}</g>`).join('')

  const peak =
    `<path d="M790 640L1040 452L1290 640Z" fill="#2a3045"/>` +
    `<path d="M1040 452L1098 496L1076 492L1060 506L1042 492L1022 504L1006 494L982 496Z" fill="${CREAM}" fill-opacity=".8"/>`

  return svgDoc({
    defs,
    css: rows.map((r) => r.css).join('') + `@keyframes drift{to{transform:translateX(-${W}px)}}@keyframes blink{0%{opacity:1}50%{opacity:.15}}`,
    body:
      `<rect width="${W}" height="${H}" fill="url(#sky)"/>` +
      `<circle cx="1260" cy="250" r="260" fill="url(#halo)"/><circle cx="1260" cy="250" r="108" fill="#c34043" fill-opacity=".9"/>` +
      clouds + peak + rows[0].body + rows[1].body + sprayGroups + rows[2].body,
  })
}
