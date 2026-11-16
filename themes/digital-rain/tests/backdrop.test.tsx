import { expect, test } from 'claude-code/testing'

const BACKDROP = {
  plugin: 'digital-rain',
  component: 'Backdrop',
  requestId: 'backdrop',
  props: { scene: 'digital-rain', plugin: 'digital-rain', glass: { blur: 0, tint: '#030805', opacity: 0.55 } },
} as const

test('the backdrop draws its scene on desktop and mobile', async $ => {
  for (const surface of ['desktop', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...BACKDROP, surface })

    expect((await ui.find({ type: 'Svg' })) !== undefined).toBe(true)
    await ui.unmount()
  }
})
