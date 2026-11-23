// Pixel-art toolkit. Draw into a grid of colors, then emit compact SVG: one stroked path per
// color, each horizontal run of a color one segment. Because drawing fills a real grid, later
// strokes cover earlier ones, so z-order is simply draw order (unlike one-path-per-color drawing,
// where every pixel of a color lands at that color's first use).

// 4x4 ordered-dither thresholds, 0..15.
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]

export function pixelGrid(cols, rows) {
  const g = Array.from({ length: rows }, () => new Array(cols).fill(null))
  const set = (x, y, c) => {
    x = Math.round(x); y = Math.round(y)
    if (c && y >= 0 && y < rows && x >= 0 && x < cols) g[y][x] = c
  }
  const get = (x, y) => g[y]?.[x] ?? null
  const rect = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(x + i, y + j, c) }
  const disc = (cx, cy, r, c) => {
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.8) set(cx + x, cy + y, c)
  }
  // Scanline fill of a polygon given as [[x, y], ...].
  const poly = (pts, c) => {
    const ys = pts.map((p) => p[1])
    for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
      const xs = []
      for (let i = 0; i < pts.length; i++) {
        const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length]
        if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) xs.push(x1 + ((y - y1) / (y2 - y1)) * (x2 - x1))
      }
      xs.sort((a, b) => a - b)
      for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.round(xs[k]); x < Math.round(xs[k + 1]); x++) set(x, y, c)
    }
  }
  // A vertical gradient through color stops, ordered-dithered between neighbors like hand-made
  // pixel skies: solid bands with a short dithered seam where two colors meet.
  const gradient = (y0, y1, stops, seam = 0.35) => {
    for (let y = y0; y < y1; y++) {
      const t = ((y - y0) / Math.max(1, y1 - y0 - 1)) * (stops.length - 1)
      const i = Math.min(stops.length - 2, Math.floor(t)), f = t - i
      for (let x = 0; x < cols; x++) {
        let c = stops[i]
        if (f > 1 - seam) c = stops[i + 1]
        else if (f > seam) c = BAYER[y % 4][x % 4] / 16 < (f - seam) / (1 - 2 * seam) ? stops[i + 1] : stops[i]
        set(x, y, c)
      }
    }
  }
  // Emit at P units per pixel. Runs of one color in a row become one stroked segment.
  const svg = (P, extra = '') => {
    const paths = new Map()
    for (let y = 0; y < rows; y++) {
      let x = 0
      while (x < cols) {
        const c = g[y][x]
        if (!c) { x++; continue }
        let len = 1
        while (x + len < cols && g[y][x + len] === c) len++
        const p = paths.get(c) ?? { d: '', y: -1, end: 0 }
        p.d += p.y === y ? `m${(x - p.end) * P} 0h${len * P}` : `M${x * P} ${y * P + P / 2}h${len * P}`
        p.y = y; p.end = x + len
        paths.set(c, p)
        x += len
      }
    }
    return [...paths].map(([c, p]) => `<path d="${p.d}" stroke="${c}" stroke-width="${P}"${extra}/>`).join('')
  }
  return { cols, rows, g, set, get, rect, disc, poly, gradient, svg }
}

// A shaded blob (a canopy, a cloud, a bush): shadow below right, body, highlight above left.
export function shadedDisc(px, cx, cy, r, [shadow, body, light]) {
  px.disc(cx + 1, cy + 1, r, shadow)
  px.disc(cx, cy, r, body)
  if (r > 2) px.disc(cx - Math.ceil(r / 3), cy - Math.ceil(r / 3), Math.floor(r / 2), light)
}
