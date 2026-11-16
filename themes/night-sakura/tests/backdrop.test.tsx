import { expect, test } from 'claude-code/testing'

const BACKDROP = {
  plugin: 'night-sakura',
  component: 'Backdrop',
  requestId: 'backdrop',
  props: { scene: 'night-sakura', plugin: 'night-sakura', glass: { blur: 0, tint: '#0d0b16', opacity: 0.5 } },
} as const

test('the backdrop draws its scene on desktop and mobile', async $ => {
  for (const surface of ['desktop', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...BACKDROP, surface })

    expect((await ui.find({ type: 'Svg' })) !== undefined).toBe(true)
    await ui.unmount()
  }
})
