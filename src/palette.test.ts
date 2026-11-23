import tailwindTheme from 'tailwindcss/theme.css?raw'
import indexCss from './index.css?raw'

const sources = import.meta.glob<string>(['./**/*.{ts,tsx,css}', '!./**/*.test.*'], {
  query: '?raw',
  import: 'default',
  eager: true,
})
const themeBlock = indexCss.match(/@theme \{[\s\S]*?\n\}/)?.[0] ?? ''
const names = (css: string, prefix: string) =>
  new Set([...css.matchAll(new RegExp(`--${prefix}-([a-z0-9-]+):`, 'g'))].map((m) => m[1]))

it('reads the theme sources', () => {
  expect(names(tailwindTheme, 'color').has('violet-600')).toBe(true)
  expect(names(themeBlock, 'color').has('ink')).toBe(true)
  expect(sources['./index.css']).toBe(indexCss)
})

it('palette tokens do not share a name with a text size or shadow', () => {
  // A color token named like a size makes Tailwind emit `text-<name>` as a color.
  const taken = new Set([
    ...names(tailwindTheme, 'text'),
    ...names(tailwindTheme, 'shadow'),
    ...names(themeBlock, 'shadow'),
  ])
  expect([...names(themeBlock, 'color')].filter((n) => taken.has(n))).toEqual([])
})

it('source uses palette tokens, not raw colors', () => {
  const hues = [...names(tailwindTheme, 'color')].map((n) => n.replace(/-\d+$/, '')).filter((n) => !n.includes('-'))
  const raw = new RegExp(
    [
      `\\b(?:${[...new Set(hues)].join('|')})-\\d+\\b`,
      '\\b[a-z]+-(?:white|black)\\b',
      '#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\\b',
      '\\b(?:rgba?|hsla?|oklch)\\(',
    ].join('|'),
    'gi',
  )
  const offenders = Object.entries(sources).flatMap(([file, src]) =>
    [...src.replace(themeBlock, '').matchAll(raw)].map((m) => `${file}: ${m[0]}`),
  )
  expect(offenders).toEqual([])
})
