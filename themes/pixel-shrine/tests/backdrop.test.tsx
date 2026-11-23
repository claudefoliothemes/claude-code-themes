import { expect, test } from 'claude-code/testing'

const BACKDROP = {
  plugin: 'pixel-shrine',
  component: 'Backdrop',
  requestId: 'backdrop',
  props: { scene: 'pixel-shrine', plugin: 'pixel-shrine', glass: { blur: 0, tint: '#141233', opacity: 0.5 } },
} as const

test('the backdrop draws its scene on desktop and mobile', async $ => {
  for (const surface of ['desktop', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...BACKDROP, surface })

    expect((await ui.find({ type: 'Svg' })) !== undefined).toBe(true)
    await ui.unmount()
  }
})
