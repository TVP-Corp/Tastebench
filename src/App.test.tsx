import { render, screen } from '@testing-library/react'

vi.mock('./firebase/app', () => ({ db: {}, auth: {} }))
vi.mock('./firebase/rooms', () => ({ createRoom: vi.fn(), joinRoom: vi.fn(), roomExists: vi.fn() }))
vi.mock('./firebase/useAuth', () => ({ useAuth: () => 'u1' }))
vi.mock('./firebase/useRoom', () => ({ useRoom: vi.fn() }))

import App from './App'

test('landing shows both actions', () => {
  render(<App />)
  expect(screen.getByRole('button', { name: 'Create a room' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Join a room' })).toBeInTheDocument()
})
