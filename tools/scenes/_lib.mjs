// Shared helpers for backdrop scenes.
//
// Rules every scene keeps (see tools/README.md):
// - every change lands on a shared tick (TICK or a whole multiple), so the window repaints a few
//   times a second at most, however many things move;
// - no @media rule but reduced-motion and no shape-rendering: either one freezes a desktop
//   backdrop (claude-code#109770);
// - text never holds < > or &, which break the SVG.

export const W = 1600
export const H = 1000
export const TICK = 0.1 // seconds

export const rng = (seed) => {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const f = (n) => +n.toFixed(2)

// Seconds rounded onto the shared tick grid.
export const onTick = (seconds, tick = TICK) => +(Math.max(1, Math.round(seconds / tick)) * tick).toFixed(2)

export const REDUCED_MOTION = '@media (prefers-reduced-motion:reduce){*{animation:none!important}}'

export const svgDoc = ({ defs = '', css = '', body }) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">` +
  `<defs>${defs}</defs><style>${css}${REDUCED_MOTION}</style>${body}</svg>`
