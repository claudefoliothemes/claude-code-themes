import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { SCENE } from './scene.js'

const SCENE_NAME = 'neon-district'

const { theme, problems } = makeColors({
  label: 'Neon District',
  only: 'dark',
  roles: { accent: '#ff2fd0', danger: '#ff4f6b', success: '#39ff9a', warning: '#ffe14d', pro: '#22e6ff' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#0e0818',
        'surface-1': '#130c20',
        'surface-2': '#181028',
        'surface-3': '#1d1430',
        'text-primary': '#f6eeff',
        'text-secondary': '#d8cce8',
        'text-muted': '#a496bc',
      },
    },
  },
})

// On Windows the backdrop shows only with Settings > Personalization > Colors > Transparency
// effects on (anthropics/claude-code#109853). No blur on the glass: blurring a moving backdrop
// costs CPU on every change underneath.
const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: SCENE_NAME, glass: { blur: 0, tint: '#0e0818', opacity: 0.5 } },
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

    return <Svg source={SCENE} alt="Cyberpunk street at night with neon signs reading HOTEL, BAR, ARCADE, RAMEN, and 24H MART, billboards, a sky-train, rain, and the city reflected in the wet street" />
  })
}
