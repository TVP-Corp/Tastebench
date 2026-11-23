import { render, screen } from '@testing-library/react'
import { Screen } from './Screen'

describe('Screen', () => {
  it('shows the wordmark in the header with a decorative logo', () => {
    render(<Screen title="T">body</Screen>)
    expect(screen.getByRole('banner')).toHaveTextContent('Tastebench')
    expect(screen.queryByRole('img')).toBeNull()
  })
})
