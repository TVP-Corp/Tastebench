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
