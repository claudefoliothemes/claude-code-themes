import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { SCENE } from './scene.js'

const SCENE_NAME = 'midnight-ramen'

const { theme, problems } = makeColors({
  label: 'Midnight Ramen',
  only: 'dark',
  roles: { accent: '#ff9a4a', danger: '#ff5a5a', success: '#7ad08a', warning: '#ffc86a', pro: '#ff7ab8' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#12132a',
        'surface-1': '#171831',
        'surface-2': '#1c1d38',
        'surface-3': '#21223f',
        'text-primary': '#f6f0ea',
        'text-secondary': '#d8d0d4',
        'text-muted': '#a09aae',
      },
    },
  },
})

// On Windows the backdrop shows only with Settings > Personalization > Colors > Transparency
// effects on (anthropics/claude-code#109853). No blur on the glass: blurring a moving backdrop
// costs CPU on every change underneath.
const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: SCENE_NAME, glass: { blur: 0, tint: '#12132a', opacity: 0.5 } },
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

    return <Svg source={SCENE} alt="Pixel-art ramen stall at night in the rain with a red curtain, a chef, two customers on stools, a red paper lantern, a cat, a pink karaoke sign, and a glowing vending machine" />
  })
}
