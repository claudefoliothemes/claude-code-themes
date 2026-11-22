import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { SCENE } from './scene.js'

const SCENE_NAME = 'good-vibes'

const { theme, problems } = makeColors({
  label: 'Good Vibes',
  only: 'dark',
  roles: { accent: '#ffb86b', danger: '#ff6b81', success: '#6be0a8', warning: '#ffd36b', pro: '#b49bff' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#1a1430',
        'surface-1': '#1f1838',
        'surface-2': '#241c40',
        'surface-3': '#292047',
        'text-primary': '#fff4ec',
        'text-secondary': '#e6d3db',
        'text-muted': '#b39fb5',
      },
    },
  },
})

// On Windows the backdrop shows only with Settings > Personalization > Colors > Transparency
// effects on (anthropics/claude-code#109853). No blur on the glass: blurring a moving backdrop
// costs CPU on every change underneath.
const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: SCENE_NAME, glass: { blur: 0, tint: '#1a1430', opacity: 0.5 } },
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

    return <Svg source={atLocalTime()} alt="A warm gradient with soft drifting lights and a card showing an encouraging line for the hour" />
  })
}
