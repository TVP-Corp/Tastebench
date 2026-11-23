import { render, screen } from '@testing-library/react'
import App from './App'

test('landing shows both actions', () => {
  render(<App />)
  expect(screen.getByRole('button', { name: 'Create a room' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Join a room' })).toBeInTheDocument()
})
