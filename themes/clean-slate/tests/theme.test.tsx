import { expect, test } from 'claude-code/testing'

test('session start sets the colors and a still ground', async ($, on) => {
  const sets: unknown[] = []

  on('theme.set', (_, e) => {
    sets.push(e)

    return { value: { isDrawn: true, requestId: 'theme' } }
  })
  on('session.start', (_, e) => ({ cwd: e.cwd }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  const look = sets[0] as { colors?: { label: string }; backdrop?: { gradient?: unknown; color?: unknown } }

  expect(look.colors?.label).toBe('Clean Slate')
  expect(look.backdrop?.gradient !== undefined || look.backdrop?.color !== undefined).toBe(true)
})
