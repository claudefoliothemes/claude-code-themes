import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { SCENE } from './scene.js'

const SCENE_NAME = 'digital-rain'

const { theme, problems } = makeColors({
  label: 'Digital Rain',
  only: 'dark',
  roles: { accent: '#39e58c', danger: '#ff5f6d', success: '#7be37b', warning: '#e6c84f', pro: '#9b8cff' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#030805',
        'surface-1': '#07100a',
        'surface-2': '#0a150d',
        'surface-3': '#0d1a10',
        'text-primary': '#dcffe4',
        'text-secondary': '#a9e6b6',
        'text-muted': '#78b886',
      },
    },
  },
})

// On Windows the backdrop shows only with Settings > Personalization > Colors > Transparency
// effects on (anthropics/claude-code#109853). No blur on the glass: blurring a moving backdrop
// costs CPU on every change underneath.
const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: SCENE_NAME, glass: { blur: 0, tint: '#030805', opacity: 0.55 } },
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

    return <Svg source={SCENE} alt="Matrix-style green code rain falling behind the conversation" />
  })
}
