// Builds every theme mod from one config: node tools/build-themes.mjs [--out <dir>]
//
// Two kinds of theme:
// - a scene theme (tools/scenes/<name>.mjs exists): colors plus a moving SVG backdrop drawn by a
//   Backdrop render hook;
// - a still theme (`ground` in the config): colors plus a backdrop the app draws by itself (a
//   color or gradient), with no render hook and nothing moving.
// For each it writes <out>/<name>/ with plugin.json, hooks (register.tsx, make-colors, scene.js
// for scene themes) and a test, after checking every palette and scene. <out> defaults to the
// folder above tools/. A theme gets previews/icons/<name>.png as its listing icon once
// render-previews has made one. Run /reload-plugins after.
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { makeColors } from './shared/make-colors.mjs'
import { PUBLISHER, THEMES, VERSION } from './themes.config.mjs'

const TOOLS = dirname(fileURLToPath(import.meta.url))
const outFlag = process.argv.indexOf('--out')
const OUT = outFlag > -1 ? process.argv[outFlag + 1] : join(TOOLS, '..')

const modeOf = (t) => t.mode ?? 'dark'

// A plain value as TypeScript source: { key: 'text', list: [1, 2] }.
const toTs = (v) =>
  Array.isArray(v) ? `[${v.map(toTs).join(', ')}]`
    : v && typeof v === 'object' ? `{ ${Object.entries(v).map(([k, x]) => `${k}: ${toTs(x)}`).join(', ')} }`
      : typeof v === 'string' ? `'${v}'` : String(v)

const palette = (t) => `const { theme, problems } = makeColors({
  label: '${t.label}',
  only: '${modeOf(t)}',
  roles: { ${Object.entries(t.roles).map(([k, v]) => `${k}: '${v}'`).join(', ')} },
  ${modeOf(t)}: {
    gray: {
      anchors: {
${Object.entries(t.anchors).map(([k, v]) => `        '${k}': '${v}',`).join('\n')}
      },
    },
  },
})`

const lifecycle = `// The theme stands for the session; re-send it when a client attaches so one that joined late gets it.
async function applyLook($: EngineInterface): Promise<void> {
  const set = await $.theme.set(LOOK)

  $.ui.status(set.isDrawn ? undefined : set.reason)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    await applyLook($)

    return next(e)
  })

  on('session.attach', async ($, e, next) => {
    const result = await next(e)

    await applyLook($)

    return result
  })`

const sceneRegister = (t) => `import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { SCENE } from './scene.js'

const SCENE_NAME = '${t.name}'

${palette(t)}

// On Windows the backdrop shows only with Settings > Personalization > Colors > Transparency
// effects on (anthropics/claude-code#109853). No blur on the glass: blurring a moving backdrop
// costs CPU on every change underneath.
const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: SCENE_NAME, glass: { blur: 0, tint: '${t.tint}', opacity: ${t.opacity} } },
}

${lifecycle}

  // Drawn once, as a plain image (cheaper than isInteractive's frame); the scene's own CSS moves it.
  // Never redraw it on a timer: each redraw blanks the backdrop and slows the app.
  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.props.plugin !== $.plugin.name || e.props.scene !== SCENE_NAME) {
      return next(e)
    }
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }

    const { Svg } = $.ui.resolve(e)

    return <Svg source={SCENE} alt="${t.alt}" />
  })
}
`

const stillRegister = (t) => `import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'

${palette(t)}

// A still ground the app draws by itself: no render hook, nothing moving.
const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: ${toTs(t.ground)},
}

${lifecycle}
}
`

const sceneTest = (t) => `import { expect, test } from 'claude-code/testing'

const BACKDROP = {
  plugin: '${t.name}',
  component: 'Backdrop',
  requestId: 'backdrop',
  props: { scene: '${t.name}', plugin: '${t.name}', glass: { blur: 0, tint: '${t.tint}', opacity: ${t.opacity} } },
} as const

test('the backdrop draws its scene on desktop and mobile', async $ => {
  for (const surface of ['desktop', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...BACKDROP, surface })

    expect((await ui.find({ type: 'Svg' })) !== undefined).toBe(true)
    await ui.unmount()
  }
})
`

const stillTest = (t) => `import { expect, test } from 'claude-code/testing'

test('session start sets the colors and a still ground', async ($, on) => {
  const sets: unknown[] = []

  on('theme.set', (_, e) => {
    sets.push(e)

    return { value: { isDrawn: true, requestId: 'theme' } }
  })
  on('session.start', (_, e) => ({ cwd: e.cwd }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  const look = sets[0] as { colors?: { label: string }; backdrop?: { gradient?: unknown; color?: unknown } }

  expect(look.colors?.label).toBe('${t.label}')
  expect(look.backdrop?.gradient !== undefined || look.backdrop?.color !== undefined).toBe(true)
})
`

const failures = []
for (const t of THEMES) {
  const mode = modeOf(t)
  const { problems } = makeColors({ label: t.label, only: mode, roles: t.roles, [mode]: { gray: { anchors: t.anchors } } })
  const unpainted = problems.filter((p) => p.startsWith("Desktop won't paint"))
  if (unpainted.length) failures.push(`${t.name}: ${unpainted[0]}`)
  if (t.ground) continue
  const svg = (await import(pathToFileURL(join(TOOLS, 'scenes', `${t.name}.mjs`)).href)).default()
  const media = (svg.match(/@media/g) ?? []).length
  if (media !== 1 || !svg.includes('@media (prefers-reduced-motion:reduce)')) failures.push(`${t.name}: an @media rule other than reduced-motion`)
  if (svg.includes('shape-rendering')) failures.push(`${t.name}: shape-rendering`)
  if (svg.length > 131072) failures.push(`${t.name}: ${svg.length} characters, over 131072`)
  t.svg = svg
}
if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

for (const t of THEMES) {
  const dir = join(OUT, t.name)
  mkdirSync(join(dir, '.claude-plugin'), { recursive: true })
  mkdirSync(join(dir, 'hooks'), { recursive: true })
  mkdirSync(join(dir, 'tests'), { recursive: true })
  writeFileSync(join(dir, '.claude-plugin', 'plugin.json'), JSON.stringify({ name: t.name, version: VERSION, description: t.description, ...PUBLISHER }, null, 2) + '\n')
  writeFileSync(join(dir, 'hooks', 'hooks.json'), '{ "modules": ["./register.tsx"] }\n')
  writeFileSync(join(dir, 'hooks', 'register.tsx'), t.ground ? stillRegister(t) : sceneRegister(t))
  if (!t.ground) {
    writeFileSync(join(dir, 'hooks', 'scene.js'), `// Generated by tools/build-themes.mjs from tools/scenes/${t.name}.mjs.\nexport const SCENE = ${JSON.stringify(t.svg)}\n`)
    writeFileSync(join(dir, 'hooks', 'scene.d.ts'), `/** The ${t.name} backdrop: one SVG document. */\nexport declare const SCENE: string\n`)
  }
  copyFileSync(join(TOOLS, 'shared', 'make-colors.js'), join(dir, 'hooks', 'make-colors.js'))
  copyFileSync(join(TOOLS, 'shared', 'make-colors.d.ts'), join(dir, 'hooks', 'make-colors.d.ts'))
  writeFileSync(join(dir, 'tests', t.ground ? 'theme.test.tsx' : 'backdrop.test.tsx'), t.ground ? stillTest(t) : sceneTest(t))
  const icon = join(TOOLS, '..', 'previews', 'icons', `${t.name}.png`)
  if (existsSync(icon)) copyFileSync(icon, join(dir, '.claude-plugin', 'icon.png'))
  console.log(`${t.name}: ${t.ground ? 'still' : `${t.svg.length} chars`}${existsSync(icon) ? ', icon' : ''}`)
}
