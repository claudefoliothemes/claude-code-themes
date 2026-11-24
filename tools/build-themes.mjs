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
import { PUBLISHER, THEMES as PUBLIC_THEMES, VERSION } from './themes.config.mjs'

const TOOLS = dirname(fileURLToPath(import.meta.url))
const outFlag = process.argv.indexOf('--out')
const OUT = outFlag > -1 ? process.argv[outFlag + 1] : join(TOOLS, '..')

// Private themes (tools/private-themes.config.mjs, scenes in tools/scenes-private/) build only
// into this folder, never into another --out such as the public repo, which doesn't carry them.
const privateThemes = async (include) => {
  const file = join(TOOLS, 'private-themes.config.mjs')
  if (!include || !existsSync(file)) return []
  return (await import(pathToFileURL(file).href)).THEMES.map((t) => ({ ...t, private: true }))
}
const sceneFile = (t) => join(TOOLS, t.private ? 'scenes-private' : 'scenes', `${t.name}.mjs`)
const THEMES = [...PUBLIC_THEMES, ...(await privateThemes(outFlag === -1))]

// A clock theme's scene runs one 24-hour cycle built to start at noon; this delay marks it.
const CLOCK_MARK = '-43200.01s'
// A calendar theme (also a clock theme) carries __WEEKDAYi__, __MONTHi__ and __DAYi__ for today
// and the following days, __TZ__ and __SEASON__; its render hook fills them in.
const CALENDAR_DAYS = 7
const CALENDAR_MARKS = ['__TZ__', '__SEASON__', ...Array.from({ length: CALENDAR_DAYS }, (_, i) => [`__WEEKDAY${i}__`, `__MONTH${i}__`, `__DAY${i}__`]).flat()]

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
${t.clock ? `
// The scene's sky runs one 24-hour cycle, built to start at noon. Start it at the local time of
// day instead, so dawn, sunset and night match this computer's clock. Each render (session start,
// a client attaching) reads the clock again; between renders the CSS keeps time by itself.
const CLOCK_MARK = '${CLOCK_MARK}'
const atLocalTime = (): string => {
  const now = new Date()
  const seconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()

  return ${t.calendar ? 'withCalendar(SCENE.split(CLOCK_MARK).join(`-${seconds}s`), now)' : 'SCENE.split(CLOCK_MARK).join(`-${seconds}s`)'}
}
` : ''}${t.calendar ? `
// The scene also carries calendar marks: the names and numbers of today and the next six days
// (each shown from its local midnight, so the date turns over while the app stays open), the time
// zone's short name, and the season, which flips for time zones south of the equator.
const SOUTHERN = /^(Australia|Antarctica)\\/|^America\\/(Argentina|Sao_Paulo|Santiago|Montevideo|Asuncion|La_Paz)|^Pacific\\/(Auckland|Chatham|Fiji|Tongatapu|Noumea)|^Africa\\/(Johannesburg|Maputo|Windhoek|Harare|Gaborone|Lusaka)|^Indian\\/(Mauritius|Reunion)/
const clean = (text: string): string => text.replace(/[<>&]/g, '')
const withCalendar = (scene: string, now: Date): string => {
  let source = scene
  for (let i = 0; i < ${CALENDAR_DAYS}; i++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i)

    source = source
      .split(\`__WEEKDAY\${i}__\`).join(clean(day.toLocaleDateString(undefined, { weekday: 'long' })))
      .split(\`__MONTH\${i}__\`).join(clean(day.toLocaleDateString(undefined, { month: 'long' })))
      .split(\`__DAY\${i}__\`).join(String(day.getDate()))
  }
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? ''
  const tz = new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' }).formatToParts(now).find(part => part.type === 'timeZoneName')?.value ?? ''
  const month = (now.getMonth() + (SOUTHERN.test(zone) ? 6 : 0)) % 12
  const season = month === 11 || month < 2 ? 'winter' : month < 5 ? 'spring' : month < 8 ? 'summer' : 'autumn'

  return source.split('__TZ__').join(clean(tz)).split('__SEASON__').join(season)
}
` : ''}
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

    return <Svg source={${t.clock ? 'atLocalTime()' : 'SCENE'}} alt="${t.alt}" />
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

// A clock theme's scene must start at the local time of day, not at the noon it was built with.
const clockTest = (t) => `import { expect, test } from 'claude-code/testing'

const BACKDROP = {
  plugin: '${t.name}',
  component: 'Backdrop',
  requestId: 'backdrop',
  surface: 'desktop',
  props: { scene: '${t.name}', plugin: '${t.name}', glass: { blur: 0, tint: '${t.tint}', opacity: ${t.opacity} } },
} as const

test('the sky starts at the local time of day', async $ => {
  const ui = await $.ui.mount(BACKDROP)
  const svg = await ui.find({ type: 'Svg' })
  const source = String((svg as { props?: { source?: unknown } } | undefined)?.props?.source ?? '')
  const now = new Date()
  const seconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
  const start = Number(source.match(/ 86400s steps\\(\\d+,end\\) -(\\d+)s infinite/)?.[1])
  const apart = Math.abs(start - seconds)

  expect(source.includes('${CLOCK_MARK}')).toBe(false)
  expect(Math.min(apart, 86400 - apart) <= 2).toBe(true)
  await ui.unmount()
})
`

// A calendar theme's scene must show today's date and a season, with no mark left unfilled.
const calendarTest = (t) => `import { expect, test } from 'claude-code/testing'

const BACKDROP = {
  plugin: '${t.name}',
  component: 'Backdrop',
  requestId: 'backdrop',
  surface: 'desktop',
  props: { scene: '${t.name}', plugin: '${t.name}', glass: { blur: 0, tint: '${t.tint}', opacity: ${t.opacity} } },
} as const

test('the calendar fills in today, the time zone and the season', async $ => {
  const ui = await $.ui.mount(BACKDROP)
  const svg = await ui.find({ type: 'Svg' })
  const source = String((svg as { props?: { source?: unknown } } | undefined)?.props?.source ?? '')

  expect(/__(WEEKDAY|MONTH|DAY)\\d+__|__TZ__|__SEASON__/.test(source)).toBe(false)
  expect(source.includes(\`>\${new Date().getDate()}</text>\`)).toBe(true)
  expect(/\\.s-(spring|summer|autumn|winter)\\{display:inline\\}/.test(source)).toBe(true)
  await ui.unmount()
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
  const svg = (await import(pathToFileURL(sceneFile(t)).href)).default()
  if (t.clock && !svg.includes(CLOCK_MARK)) failures.push(`${t.name}: a clock theme without the ${CLOCK_MARK} start mark`)
  if (t.calendar && !t.clock) failures.push(`${t.name}: a calendar theme must also be a clock theme`)
  if (t.calendar) for (const mark of CALENDAR_MARKS) if (!svg.includes(mark)) failures.push(`${t.name}: a calendar theme without ${mark}`)
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
  writeFileSync(join(dir, '.claude-plugin', 'plugin.json'), JSON.stringify({ name: t.name, version: t.version ?? VERSION, description: t.description, ...PUBLISHER }, null, 2) + '\n')
  writeFileSync(join(dir, 'hooks', 'hooks.json'), '{ "modules": ["./register.tsx"] }\n')
  writeFileSync(join(dir, 'hooks', 'register.tsx'), t.ground ? stillRegister(t) : sceneRegister(t))
  if (!t.ground) {
    writeFileSync(join(dir, 'hooks', 'scene.js'), `// Generated by tools/build-themes.mjs from tools/${t.private ? 'scenes-private' : 'scenes'}/${t.name}.mjs.\nexport const SCENE = ${JSON.stringify(t.svg)}\n`)
    writeFileSync(join(dir, 'hooks', 'scene.d.ts'), `/** The ${t.name} backdrop: one SVG document. */\nexport declare const SCENE: string\n`)
  }
  copyFileSync(join(TOOLS, 'shared', 'make-colors.js'), join(dir, 'hooks', 'make-colors.js'))
  copyFileSync(join(TOOLS, 'shared', 'make-colors.d.ts'), join(dir, 'hooks', 'make-colors.d.ts'))
  writeFileSync(join(dir, 'tests', t.ground ? 'theme.test.tsx' : 'backdrop.test.tsx'), t.ground ? stillTest(t) : sceneTest(t))
  if (t.clock) writeFileSync(join(dir, 'tests', 'clock.test.tsx'), clockTest(t))
  if (t.calendar) writeFileSync(join(dir, 'tests', 'calendar.test.tsx'), calendarTest(t))
  const icon = join(TOOLS, '..', 'previews', 'icons', `${t.name}.png`)
  if (existsSync(icon)) copyFileSync(icon, join(dir, '.claude-plugin', 'icon.png'))
  console.log(`${t.name}: ${t.ground ? 'still' : `${t.svg.length} chars`}${existsSync(icon) ? ', icon' : ''}`)
}
