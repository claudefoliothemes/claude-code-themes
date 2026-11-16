import { expect, test } from 'claude-code/testing'

const BACKDROP = {
  plugin: 'braille-stars',
  component: 'Backdrop',
  requestId: 'backdrop',
  props: { scene: 'braille-stars', plugin: 'braille-stars', glass: { blur: 0, tint: '#0a0e1d', opacity: 0.45 } },
} as const

test('the backdrop draws its scene on desktop and mobile', async $ => {
  for (const surface of ['desktop', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...BACKDROP, surface })

    expect((await ui.find({ type: 'Svg' })) !== undefined).toBe(true)
    await ui.unmount()
  }
})
