import { expect, test } from 'claude-code/testing'

const BACKDROP = {
  plugin: 'holiday-lights',
  component: 'Backdrop',
  requestId: 'backdrop',
  props: { scene: 'holiday-lights', plugin: 'holiday-lights', glass: { blur: 0, tint: '#08121a', opacity: 0.5 } },
} as const

test('the backdrop draws its scene on desktop and mobile', async $ => {
  for (const surface of ['desktop', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...BACKDROP, surface })

    expect((await ui.find({ type: 'Svg' })) !== undefined).toBe(true)
    await ui.unmount()
  }
})
