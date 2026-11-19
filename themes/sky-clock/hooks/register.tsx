import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { SCENE } from './scene.js'

const SCENE_NAME = 'sky-clock'

const { theme, problems } = makeColors({
  label: 'Sky Clock',
  only: 'dark',
  roles: { accent: '#f2b05e', danger: '#ff6b78', success: '#5fd39a', warning: '#f7c95c', pro: '#9aa8ff' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#0f1626',
        'surface-1': '#131b2e',
        'surface-2': '#172036',
        'surface-3': '#1b253c',
        'text-primary': '#eef2f8',
        'text-secondary': '#c8d1e0',
        'text-muted': '#95a1b6',
      },
    },
  },
})

// On Windows the backdrop shows only with Settings > Personalization > Colors > Transparency
// effects on (anthropics/claude-code#109853). No blur on the glass: blurring a moving backdrop
// costs CPU on every change underneath.
const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: SCENE_NAME, glass: { blur: 0, tint: '#0f1626', opacity: 0.5 } },
}

// The scene's sky runs one 24-hour cycle, built to start at noon. Start it at the local time of
// day instead, so dawn, sunset and night match this computer's clock. Each render (session start,
// a client attaching) reads the clock again; between renders the CSS keeps time by itself.
const CLOCK_MARK = '-43200.01s'
const atLocalTime = (): string => {
  const now = new Date()
  const seconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()

  return SCENE.split(CLOCK_MARK).join(`-${seconds}s`)
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

    return <Svg source={atLocalTime()} alt="A valley with a cabin under a sky that changes with the local time of day" />
  })
}
