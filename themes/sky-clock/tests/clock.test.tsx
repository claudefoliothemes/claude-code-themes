import { expect, test } from 'claude-code/testing'

const BACKDROP = {
  plugin: 'sky-clock',
  component: 'Backdrop',
  requestId: 'backdrop',
  surface: 'desktop',
  props: { scene: 'sky-clock', plugin: 'sky-clock', glass: { blur: 0, tint: '#0f1626', opacity: 0.5 } },
} as const

test('the sky starts at the local time of day', async $ => {
  const ui = await $.ui.mount(BACKDROP)
  const svg = await ui.find({ type: 'Svg' })
  const source = String((svg as { props?: { source?: unknown } } | undefined)?.props?.source ?? '')
  const now = new Date()
  const seconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
  const start = Number(source.match(/ 86400s steps\(\d+,end\) -(\d+)s infinite/)?.[1])
  const apart = Math.abs(start - seconds)

  expect(source.includes('-43200.01s')).toBe(false)
  expect(Math.min(apart, 86400 - apart) <= 2).toBe(true)
  await ui.unmount()
})
