import { expect, test } from 'claude-code/testing'

const BACKDROP = {
  plugin: 'cat-cafe-mocha',
  component: 'Backdrop',
  requestId: 'backdrop',
  props: { scene: 'cat-cafe-mocha', plugin: 'cat-cafe-mocha', glass: { blur: 0, tint: '#1e1e2e', opacity: 0.5 } },
} as const

test('the backdrop draws its scene on desktop and mobile', async $ => {
  for (const surface of ['desktop', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...BACKDROP, surface })

    expect((await ui.find({ type: 'Svg' })) !== undefined).toBe(true)
    await ui.unmount()
  }
})
