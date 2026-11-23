import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'

vi.mock('../firebase/app', () => ({ db: {}, auth: {} }))
vi.mock('../firebase/rooms', () => ({ createRoom: vi.fn() }))
vi.mock('../firebase/useAuth', () => ({ useAuth: () => 'u1' }))

import CreateRoom from './CreateRoom'

function renderCreate() {
  render(
    <MemoryRouter initialEntries={['/create']}>
      <Routes>
        <Route path="/" element={<p>Home</p>} />
        <Route path="/create" element={<CreateRoom />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('CreateRoom', () => {
  it('sets the page title', () => {
    renderCreate()
    expect(document.title).toBe('Tastebench | Create a room')
  })

  it('shows the Create a room heading', () => {
    renderCreate()
    expect(screen.getByRole('heading', { name: 'Create a room' })).toBeInTheDocument()
  })

  it('Back returns to the start screen', () => {
    renderCreate()
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByText('Home')).toBeInTheDocument()
  })
})
