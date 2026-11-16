import { expect, test } from 'claude-code/testing'

const BACKDROP = {
  plugin: 'amber-terminal',
  component: 'Backdrop',
  requestId: 'backdrop',
  props: { scene: 'amber-terminal', plugin: 'amber-terminal', glass: { blur: 0, tint: '#0b0600', opacity: 0.6 } },
} as const

test('the backdrop draws its scene on desktop and mobile', async $ => {
  for (const surface of ['desktop', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...BACKDROP, surface })

    expect((await ui.find({ type: 'Svg' })) !== undefined).toBe(true)
    await ui.unmount()
  }
})
