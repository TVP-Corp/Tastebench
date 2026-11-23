import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

vi.mock('../firebase/app', () => ({ db: {}, auth: {} }))
vi.mock('../firebase/rooms', () => ({ roomExists: vi.fn() }))
vi.mock('../firebase/useAuth', () => ({ useAuth: () => 'u1' }))

import Landing from './Landing'

function renderLanding() {
  render(
    <MemoryRouter>
      <Landing />
    </MemoryRouter>,
  )
}

describe('Landing', () => {
  it('shows the app title', () => {
    renderLanding()
    expect(screen.getByRole('heading', { name: 'Tastebench' })).toBeInTheDocument()
    expect(document.title).toBe('Tastebench')
  })

  it('hides Create a room while joining', () => {
    renderLanding()
    fireEvent.click(screen.getByRole('button', { name: 'Join a room' }))
    expect(screen.queryByRole('button', { name: 'Create a room' })).toBeNull()
  })

  it('Cancel restores both buttons and clears the code', () => {
    renderLanding()
    fireEvent.click(screen.getByRole('button', { name: 'Join a room' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Room code' }), { target: { value: 'ABC' } })
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('button', { name: 'Create a room' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Join a room' }))
    expect(screen.getByRole('textbox', { name: 'Room code' })).toHaveValue('')
  })
})
