import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { SCENE } from './scene.js'

const SCENE_NAME = 'snowy-bookshop'

const { theme, problems } = makeColors({
  label: 'Snowy Bookshop',
  only: 'dark',
  roles: { accent: '#e8a45a', danger: '#e85a5a', success: '#7ac08a', warning: '#e8c05a', pro: '#b8a0e0' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#1e1614',
        'surface-1': '#241a18',
        'surface-2': '#2a201d',
        'surface-3': '#302522',
        'text-primary': '#f4ece4',
        'text-secondary': '#dccfc4',
        'text-muted': '#a8998c',
      },
    },
  },
})

// On Windows the backdrop shows only with Settings > Personalization > Colors > Transparency
// effects on (anthropics/claude-code#109853). No blur on the glass: blurring a moving backdrop
// costs CPU on every change underneath.
const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: SCENE_NAME, glass: { blur: 0, tint: '#1e1614', opacity: 0.5 } },
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

    return <Svg source={SCENE} alt="Pixel-art bookshop at night with tall bookshelves, a rolling ladder, a window onto snowy rooftops, a cat asleep on a red armchair, a small decorated tree, and a wood stove" />
  })
}
