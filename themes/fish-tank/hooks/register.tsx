import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { SCENE } from './scene.js'

const SCENE_NAME = 'fish-tank'

const { theme, problems } = makeColors({
  label: 'Fish Tank',
  only: 'dark',
  roles: { accent: '#5ad8f0', danger: '#ff6a6a', success: '#6ae8a0', warning: '#ffd166', pro: '#b8a6ff' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#0b2a40',
        'surface-1': '#0f3048',
        'surface-2': '#133650',
        'surface-3': '#173c58',
        'text-primary': '#eaf6fb',
        'text-secondary': '#c8dde8',
        'text-muted': '#93acbb',
      },
    },
  },
})

// On Windows the backdrop shows only with Settings > Personalization > Colors > Transparency
// effects on (anthropics/claude-code#109853). No blur on the glass: blurring a moving backdrop
// costs CPU on every change underneath.
const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: SCENE_NAME, glass: { blur: 0, tint: '#0b2a40', opacity: 0.5 } },
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

    return <Svg source={SCENE} alt="Pixel-art aquarium with goldfish, an angelfish, clownfish, a blue tang, a school of neon tetras, jellyfish, a castle, a treasure chest, a diver helmet, and colorful gravel" />
  })
}
