import { expect, test } from 'claude-code/testing'

const BACKDROP = {
  plugin: 'pixel-camp',
  component: 'Backdrop',
  requestId: 'backdrop',
  props: { scene: 'pixel-camp', plugin: 'pixel-camp', glass: { blur: 0, tint: '#1e2326', opacity: 0.5 } },
} as const

test('the backdrop draws its scene on desktop and mobile', async $ => {
  for (const surface of ['desktop', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...BACKDROP, surface })

    expect((await ui.find({ type: 'Svg' })) !== undefined).toBe(true)
    await ui.unmount()
  }
})
