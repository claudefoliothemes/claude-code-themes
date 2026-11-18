import { expect, test } from 'claude-code/testing'

const BACKDROP = {
  plugin: 'ink-wave',
  component: 'Backdrop',
  requestId: 'backdrop',
  props: { scene: 'ink-wave', plugin: 'ink-wave', glass: { blur: 0, tint: '#16161d', opacity: 0.5 } },
} as const

test('the backdrop draws its scene on desktop and mobile', async $ => {
  for (const surface of ['desktop', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...BACKDROP, surface })

    expect((await ui.find({ type: 'Svg' })) !== undefined).toBe(true)
    await ui.unmount()
  }
})
