// Helpers for 16-bit console style scenes on a 320 x 200 grid of 5-unit pixels.
// Big flat shapes are drawn as plain vector rectangles under the pixels (their cells are cleared at
// the end), so a detailed scene stays well under the size limit. Sky gradients are drawn as bands.
import { W } from './_lib.mjs'
import { pixelGrid } from './_pixel.mjs'

export const P = 5, COLS = 320, ROWS = 200
export const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
// Blend color a toward color b by t.
export const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('')
export const hash = (n) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v) }

// A pixel canvas plus vector rectangles. V() draws a flat rectangle; finish() returns the svg.
export function canvas() {
  const px = pixelGrid(COLS, ROWS), vec = []
  const V = (x, y, w, h, c) => {
    vec.push([x, y, w, h, c])
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const xx = x + i, yy = y + j; if (xx >= 0 && yy >= 0 && xx < COLS && yy < ROWS) px.g[yy][xx] = 'V' }
  }
  const finish = () => {
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (px.g[y][x] === 'V') px.g[y][x] = null
    return vec.map(([x, y, w, h, c]) => `<rect x="${x * P}" y="${y * P}" width="${w * P}" height="${h * P}" fill="${c}"/>`).join('') + px.svg(P)
  }
  return { px, V, finish }
}
export const layer = () => pixelGrid(COLS, ROWS)
// Frame k of n shows at time k * period / n.
export const frames = (grids, period) => grids.map((g, k) => `<g style="animation:f${grids.length} ${period}s steps(1,end) -${(((grids.length - k) % grids.length) * period / grids.length).toFixed(1)}s infinite">${g.svg(P)}</g>`).join('')
export const FRAME_CSS = `@keyframes f2{0%{opacity:1}50%{opacity:0}}@keyframes f3{0%{opacity:1}33.333%{opacity:0}}@keyframes f4{0%{opacity:1}25%{opacity:0}}`
// Horizontal color bands from y0 to y1 (grid rows), every `step` rows, colors from colorAt(y).
export const bands = (y0, y1, colorAt, step = 2) => { let s = ''; for (let y = y0; y < y1; y += step) s += `<rect y="${y * P}" width="${W}" height="${step * P + 1}" fill="${colorAt(y)}"/>`; return s }
// A color ramp lookup: stops spread from y0 to y1, quantized into `sub` steps between stops.
export const ramp = (stops, y0, y1, sub = 5) => (y) => { const t = (Math.min(Math.max(y, y0), y1) - y0) / (y1 - y0) * (stops.length - 1), k = Math.min(stops.length - 2, Math.floor(t)); return mix(stops[k], stops[k + 1], Math.round((t - k) * sub) / sub) }
// Stamp rows of letters as pixels (letters map to colors in pal, '.' is clear).
export const sprite = (g, x, y, rows, pal, flip = false) => rows.forEach((row, j) => [...row].forEach((ch, i) => { const c = pal[ch]; if (c) g.set(flip ? x + row.length - 1 - i : x + i, y + j, c) }))
