import { expect, test } from 'claude-code/testing'

const BACKDROP = {
  plugin: 'snow-day',
  component: 'Backdrop',
  requestId: 'backdrop',
  props: { scene: 'snow-day', plugin: 'snow-day', glass: { blur: 0, tint: '#141838', opacity: 0.5 } },
} as const

test('the backdrop draws its scene on desktop and mobile', async $ => {
  for (const surface of ['desktop', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...BACKDROP, surface })

    expect((await ui.find({ type: 'Svg' })) !== undefined).toBe(true)
    await ui.unmount()
  }
})
