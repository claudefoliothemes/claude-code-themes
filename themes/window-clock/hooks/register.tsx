import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { SCENE } from './scene.js'

const SCENE_NAME = 'window-clock'

const { theme, problems } = makeColors({
  label: 'Window Clock',
  only: 'dark',
  roles: { accent: '#ff7a5a', danger: '#ff5a6e', success: '#6fd08a', warning: '#ffd166', pro: '#b8a6ff' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#1e1826',
        'surface-1': '#241d2d',
        'surface-2': '#2a2234',
        'surface-3': '#30273b',
        'text-primary': '#fbf1ea',
        'text-secondary': '#e0d2d4',
        'text-muted': '#ab9ca6',
      },
    },
  },
})

// On Windows the backdrop shows only with Settings > Personalization > Colors > Transparency
// effects on (anthropics/claude-code#109853). No blur on the glass: blurring a moving backdrop
// costs CPU on every change underneath.
const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: SCENE_NAME, glass: { blur: 0, tint: '#1e1826', opacity: 0.5 } },
}

// The scene's sky runs one 24-hour cycle, built to start at noon. Start it at the local time of
// day instead, so dawn, sunset and night match this computer's clock. Each render (session start,
// a client attaching) reads the clock again; between renders the CSS keeps time by itself.
const CLOCK_MARK = '-43200.01s'
const atLocalTime = (): string => {
  const now = new Date()
  const seconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()

  return withCalendar(SCENE.split(CLOCK_MARK).join(`-${seconds}s`), now)
}

// The scene also carries calendar marks: the names and numbers of today and the next six days
// (each shown from its local midnight, so the date turns over while the app stays open), the time
// zone's short name, and the season, which flips for time zones south of the equator.
const SOUTHERN = /^(Australia|Antarctica)\/|^America\/(Argentina|Sao_Paulo|Santiago|Montevideo|Asuncion|La_Paz)|^Pacific\/(Auckland|Chatham|Fiji|Tongatapu|Noumea)|^Africa\/(Johannesburg|Maputo|Windhoek|Harare|Gaborone|Lusaka)|^Indian\/(Mauritius|Reunion)/
const clean = (text: string): string => text.replace(/[<>&]/g, '')
const withCalendar = (scene: string, now: Date): string => {
  let source = scene
  for (let i = 0; i < 7; i++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i)

    source = source
      .split(`__WEEKDAY${i}__`).join(clean(day.toLocaleDateString(undefined, { weekday: 'long' })))
      .split(`__MONTH${i}__`).join(clean(day.toLocaleDateString(undefined, { month: 'long' })))
      .split(`__DAY${i}__`).join(String(day.getDate()))
  }
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? ''
  const tz = new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' }).formatToParts(now).find(part => part.type === 'timeZoneName')?.value ?? ''
  const month = (now.getMonth() + (SOUTHERN.test(zone) ? 6 : 0)) % 12
  const season = month === 11 || month < 2 ? 'winter' : month < 5 ? 'spring' : month < 8 ? 'summer' : 'autumn'

  return source.split('__TZ__').join(clean(tz)).split('__SEASON__').join(season)
}

// The theme stands for the session; re-send it when a client attaches so one that joined late gets it.
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
  })

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

    return <Svg source={atLocalTime()} alt="Pixel-art room with a big window onto a field and cottage, a red digital alarm clock, and a wall calendar" />
  })
}
