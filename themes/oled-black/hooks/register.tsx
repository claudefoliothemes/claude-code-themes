import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'

const { theme, problems } = makeColors({
  label: 'OLED Black',
  only: 'dark',
  roles: { accent: '#9db8ff', danger: '#ff6b6b', success: '#5fd38a', warning: '#ffcc66', pro: '#c4a6ff' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#000000',
        'surface-1': '#0a0a0a',
        'surface-2': '#121212',
        'surface-3': '#1a1a1a',
        'text-primary': '#f5f5f5',
        'text-secondary': '#c4c4c4',
        'text-muted': '#8f8f8f',
      },
    },
  },
})

// A still ground the app draws by itself: no render hook, nothing moving.
const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { color: '#000000' },
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
}
