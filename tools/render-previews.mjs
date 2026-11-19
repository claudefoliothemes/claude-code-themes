// Renders a preview of every theme: node tools/render-previews.mjs [--only <name>]
//
// Each preview is the theme's real scene with a mock chat window in the theme's colors on top.
// The chat is invented (no names, accounts, paths or real sessions), so nothing personal can leak.
// Writes previews/<name>.png (a still), .gif (looping) and .mp4 (looping, small) next to tools/,
// and previews/icons/<name>.png (the scene alone, 512 px square), which build-themes copies in.
// Needs Chrome (drives it headless over the DevTools protocol; CHROME env var to point at it) and
// ffmpeg with libx264 (FFMPEG env var, else ffmpeg on PATH).
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { THEMES as PUBLIC_THEMES } from './themes.config.mjs'

const TOOLS = dirname(fileURLToPath(import.meta.url))

// Private themes (tools/private-themes.config.mjs, scenes in tools/scenes-private/) build only
// into this folder, never into another --out such as the public repo, which doesn't carry them.
const privateThemes = async (include) => {
  const file = join(TOOLS, 'private-themes.config.mjs')
  if (!include || !existsSync(file)) return []
  return (await import(pathToFileURL(file).href)).THEMES.map((t) => ({ ...t, private: true }))
}
const sceneFile = (t) => join(TOOLS, t.private ? 'scenes-private' : 'scenes', `${t.name}.mjs`)
const THEMES = [...PUBLIC_THEMES, ...(await privateThemes(true))]
const OUT = join(TOOLS, '..', 'previews')
const CHROME = process.env.CHROME ?? {
  win32: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
}[process.platform] ?? 'google-chrome'
const FFMPEG = process.env.FFMPEG ?? 'ffmpeg'
const W = 1600, H = 1000
const FPS = 10 // every scene steps on a 0.1 s tick, so 10 fps shows every state
// A theme can override these (and pass options to its scene) with a `preview` entry in the config.
const SECONDS = 6
const STILL_AT = 2.0
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null

// A still theme's ground as CSS, as the app would draw it; scene themes paint over it anyway.
const ground = (t) => {
  const g = t.ground
  if (g?.gradient) return `linear-gradient(${g.gradient.angle ?? 180}deg,${g.gradient.stops.join(',')})`
  return g?.color ?? t.anchors['surface-0']
}

const page = (t, svg) => {
  const a = t.anchors, r = t.roles
  const line = a['surface-3'] ?? a['surface-0'] // borders; a light palette may leave surface-3 out
  const glass = (alpha) => `${t.tint}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`
  return `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:${a['surface-0']};font:15px/1.55 "Segoe UI",system-ui,sans-serif;color:${a['text-primary']}}
.scene{position:fixed;inset:0}.scene svg{width:100%;height:100%;display:block}
.app{position:fixed;inset:0;display:grid;grid-template-columns:260px 1fr}
.side{background:${glass(Math.min(1, t.opacity + 0.15))};border-right:1px solid ${line};padding:22px 14px}
.side h4{font-size:12px;letter-spacing:.04em;color:${a['text-muted']};font-weight:600;margin:4px 8px 12px}
.side div{padding:8px 10px;border-radius:8px;color:${a['text-secondary']};font-size:14px;margin-bottom:2px}
.side .on{background:${a['surface-2']};color:${a['text-primary']}}
.main{background:${glass(t.opacity)};display:flex;flex-direction:column;align-items:center;padding:40px 0 28px}
.col{width:760px;flex:1;display:flex;flex-direction:column;gap:18px}
.user{align-self:flex-end;max-width:70%;background:${a['surface-2']};padding:10px 16px;border-radius:14px}
.tool{font:13px Consolas,monospace;color:${a['text-secondary']};background:${a['surface-1']};border:1px solid ${line};border-radius:10px;padding:10px 14px}
.tool b{color:${a['text-primary']};font-weight:600}.add{color:${r.success}}.del{color:${r.danger}}
pre{font:14px/1.6 Consolas,monospace;background:${a['surface-1']};border:1px solid ${line};border-radius:10px;padding:14px 16px;color:${a['text-primary']}}
.k{color:${r.accent}}.s{color:${r.success}}.n{color:${r.pro}}.v{color:${r.warning}}.c{color:${a['text-muted']}}
.prompt{width:760px;background:${a['surface-1']};border:1px solid ${line};border-radius:14px;padding:16px 18px;color:${a['text-muted']}}
.tag{position:fixed;right:22px;bottom:18px;font-size:13px;color:${a['text-secondary']};background:${glass(0.85)};padding:6px 12px;border-radius:20px;border:1px solid ${line}}
</style></head><body>
<div class="scene" style="background:${ground(t)}">${svg}</div>
<div class="app">
  <div class="side"><h4>Sessions</h4><div class="on">Add upload spinner</div><div>Fix flaky date test</div><div>Write release notes</div><div>Tidy the settings page</div></div>
  <div class="main"><div class="col">
    <div class="user">Can you add a loading spinner to the upload button?</div>
    <div>Sure. The button now shows a spinner while the upload runs and stays disabled until it finishes.</div>
    <div class="tool"><b>Edit</b> &nbsp;src/components/UploadButton.tsx &nbsp;<span class="add">+12</span> <span class="del">-3</span></div>
<pre><span class="k">const</span> [<span class="v">busy</span>, <span class="v">setBusy</span>] = useState(<span class="n">false</span>)

<span class="k">async function</span> <span class="v">upload</span>(file) {
  setBusy(<span class="n">true</span>)
  <span class="k">try</span> { <span class="k">await</span> send(file, <span class="s">'/api/upload'</span>) }
  <span class="k">finally</span> { setBusy(<span class="n">false</span>) }  <span class="c">// always re-enable</span>
}</pre>
    <div>Want me to add a test for the disabled state too?</div>
  </div><div class="prompt">Type a message...</div></div>
</div>
<div class="tag">${t.label}</div>
</body></html>`
}

// A minimal DevTools-protocol client over the browser's own WebSocket.
async function devtools(port) {
  for (let i = 0; i < 50; i++) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
      const pageTarget = targets.find((x) => x.type === 'page')
      if (pageTarget) {
        const ws = new WebSocket(pageTarget.webSocketDebuggerUrl)
        await new Promise((ok, fail) => { ws.onopen = ok; ws.onerror = fail })
        let id = 0
        const waiting = new Map(), listeners = []
        ws.onmessage = ({ data }) => {
          const msg = JSON.parse(data)
          if (msg.id && waiting.has(msg.id)) { waiting.get(msg.id)(msg); waiting.delete(msg.id) } else listeners.forEach((l) => l(msg))
        }
        const send = (method, params = {}) => new Promise((ok, fail) => {
          const n = ++id
          waiting.set(n, (msg) => (msg.error ? fail(new Error(`${method}: ${msg.error.message}`)) : ok(msg.result)))
          ws.send(JSON.stringify({ id: n, method, params }))
        })
        const once = (method) => new Promise((ok) => listeners.push((m) => m.method === method && ok(m.params)))
        return { send, once, close: () => ws.close() }
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 200))
  }
  throw new Error('Chrome did not open its DevTools port')
}

const work = mkdtempSync(join(tmpdir(), 'theme-previews-'))
mkdirSync(OUT, { recursive: true })
const PORT = 9333
const chrome = spawn(CHROME, ['--headless=new', `--user-data-dir=${join(work, 'profile')}`, `--remote-debugging-port=${PORT}`, `--window-size=${W},${H}`, '--hide-scrollbars', '--no-first-run', 'about:blank'], { stdio: 'ignore' })

try {
  const cdp = await devtools(PORT)
  await cdp.send('Page.enable')
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false })
  for (const t of THEMES.filter((x) => !only || x.name === only)) {
    const svg = t.ground ? '' : (await import(pathToFileURL(sceneFile(t)).href)).default(t.preview?.scene)
    const seconds = t.preview?.seconds ?? SECONDS, stillAt = t.preview?.stillAt ?? STILL_AT
    const html = join(work, `${t.name}.html`)
    writeFileSync(html, page(t, svg))
    const loaded = cdp.once('Page.loadEventFired')
    await cdp.send('Page.navigate', { url: pathToFileURL(html).href })
    await loaded
    const frames = join(work, t.name)
    mkdirSync(frames, { recursive: true })
    const shoot = async (seconds, file) => {
      await cdp.send('Runtime.evaluate', {
        expression: `document.getAnimations().forEach(a => { a.pause(); a.currentTime = ${Math.round(seconds * 1000)} }); new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))`,
        awaitPromise: true,
      })
      const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' })
      writeFileSync(file, Buffer.from(data, 'base64'))
    }
    // Sample mid-tick: the scenes change exactly on tick boundaries.
    for (let i = 0; i < FPS * seconds; i++) await shoot(10.05 + i / FPS, join(frames, `f${String(i).padStart(3, '0')}.png`))
    await shoot(10.05 + stillAt, join(frames, 'still.png'))
    // The listing icon: the scene alone, cropped square.
    await cdp.send('Runtime.evaluate', { expression: `document.querySelectorAll('.app,.tag').forEach(e => e.style.display = 'none')` })
    await shoot(10.05 + stillAt, join(frames, 'scene.png'))
    const ff = (args) => {
      const r = spawnSync(FFMPEG, ['-y', '-loglevel', 'error', ...args])
      if (r.status !== 0) throw new Error(`ffmpeg: ${r.stderr}`)
    }
    const input = ['-framerate', String(FPS), '-i', join(frames, 'f%03d.png')]
    ff(['-i', join(frames, 'still.png'), '-vf', 'scale=1280:-1:flags=lanczos', join(OUT, `${t.name}.png`)])
    mkdirSync(join(OUT, 'icons'), { recursive: true })
    ff(['-i', join(frames, 'scene.png'), '-vf', `crop=${H}:${H}:${(W - H) / 2}:0,scale=512:512:flags=lanczos`, join(OUT, 'icons', `${t.name}.png`)])
    ff([...input, '-vf', 'scale=800:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle', '-loop', '0', join(OUT, `${t.name}.gif`)])
    ff([...input, '-vf', 'scale=1280:-2:flags=lanczos', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '24', '-movflags', '+faststart', join(OUT, `${t.name}.mp4`)])
    console.log(`${t.name}: previews written`)
  }
  cdp.close()
} finally {
  chrome.kill()
  await new Promise((r) => setTimeout(r, 500))
  rmSync(work, { recursive: true, force: true })
}
