import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'

const { theme, problems } = makeColors({
  label: 'Clean Slate',
  only: 'light',
  roles: { accent: '#4a5568', danger: '#c53030', success: '#2f855a', warning: '#b7791f', pro: '#6b46c1' },
  light: {
    gray: {
      anchors: {
        'surface-0': '#eceef1',
        'surface-1': '#f4f5f7',
        'surface-2': '#fbfbfc',
        'text-primary': '#1d2127',
        'text-secondary': '#454b55',
        'text-muted': '#5f6672',
      },
    },
  },
})

// A still ground the app draws by itself: no render hook, nothing moving.
const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { gradient: { stops: ['#fbfbfc', '#e9ecef'], angle: 180 } },
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
