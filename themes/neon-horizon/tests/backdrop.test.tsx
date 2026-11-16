import { expect, test } from 'claude-code/testing'

const BACKDROP = {
  plugin: 'neon-horizon',
  component: 'Backdrop',
  requestId: 'backdrop',
  props: { scene: 'neon-horizon', plugin: 'neon-horizon', glass: { blur: 0, tint: '#0e0618', opacity: 0.55 } },
} as const

test('the backdrop draws its scene on desktop and mobile', async $ => {
  for (const surface of ['desktop', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...BACKDROP, surface })

    expect((await ui.find({ type: 'Svg' })) !== undefined).toBe(true)
    await ui.unmount()
  }
})
