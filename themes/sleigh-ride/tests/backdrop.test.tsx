import { expect, test } from 'claude-code/testing'

const BACKDROP = {
  plugin: 'sleigh-ride',
  component: 'Backdrop',
  requestId: 'backdrop',
  props: { scene: 'sleigh-ride', plugin: 'sleigh-ride', glass: { blur: 0, tint: '#0a1024', opacity: 0.5 } },
} as const

test('the backdrop draws its scene on desktop and mobile', async $ => {
  for (const surface of ['desktop', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...BACKDROP, surface })

    expect((await ui.find({ type: 'Svg' })) !== undefined).toBe(true)
    await ui.unmount()
  }
})
