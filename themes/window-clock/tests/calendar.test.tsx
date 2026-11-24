import { expect, test } from 'claude-code/testing'

const BACKDROP = {
  plugin: 'window-clock',
  component: 'Backdrop',
  requestId: 'backdrop',
  surface: 'desktop',
  props: { scene: 'window-clock', plugin: 'window-clock', glass: { blur: 0, tint: '#1e1826', opacity: 0.5 } },
} as const

test('the calendar fills in today, the time zone and the season', async $ => {
  const ui = await $.ui.mount(BACKDROP)
  const svg = await ui.find({ type: 'Svg' })
  const source = String((svg as { props?: { source?: unknown } } | undefined)?.props?.source ?? '')

  expect(/__(WEEKDAY|MONTH|DAY)\d+__|__TZ__|__SEASON__/.test(source)).toBe(false)
  expect(source.includes(`>${new Date().getDate()}</text>`)).toBe(true)
  expect(/\.s-(spring|summer|autumn|winter)\{display:inline\}/.test(source)).toBe(true)
  await ui.unmount()
})
