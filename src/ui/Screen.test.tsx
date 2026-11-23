import { render, screen } from '@testing-library/react'
import { Screen } from './Screen'

describe('Screen', () => {
  it('shows the wordmark in the header with a decorative logo', () => {
    render(<Screen title="T">body</Screen>)
    const header = screen.getByRole('banner')
    expect(header).toHaveTextContent('Tastebench')
    expect(header.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryByRole('img')).toBeNull()
  })
})

it('components use palette tokens, not raw hue utilities', () => {
  const sources = import.meta.glob(['../**/*.{ts,tsx}', '!../**/*.test.*'], {
    query: '?raw',
    import: 'default',
    eager: true,
  })
  const raw =
    /\b(?:bg|text|border|ring|fill|stroke|from|via|to|outline|shadow)-(?:(?!(?:brand|danger|warning)-)[a-z]+-\d{2,3}|white|black)\b|#[0-9a-f]{6}\b/i
  const offenders = Object.entries(sources).filter(([, src]) => raw.test(src as string))
  expect(offenders.map(([file]) => file)).toEqual([])
})
