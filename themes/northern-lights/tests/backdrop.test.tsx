import { expect, test } from 'claude-code/testing'

const BACKDROP = {
  plugin: 'northern-lights',
  component: 'Backdrop',
  requestId: 'backdrop',
  props: { scene: 'northern-lights', plugin: 'northern-lights', glass: { blur: 0, tint: '#2b303b', opacity: 0.45 } },
} as const

test('the backdrop draws its scene on desktop and mobile', async $ => {
  for (const surface of ['desktop', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...BACKDROP, surface })

    expect((await ui.find({ type: 'Svg' })) !== undefined).toBe(true)
    await ui.unmount()
  }
})
