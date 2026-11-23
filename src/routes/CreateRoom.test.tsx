import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

vi.mock('../firebase/app', () => ({ db: {}, auth: {} }))
vi.mock('../firebase/rooms', () => ({ createRoom: vi.fn() }))
vi.mock('../firebase/useAuth', () => ({ useAuth: () => 'u1' }))

import CreateRoom from './CreateRoom'

describe('CreateRoom', () => {
  it('sets the page title', () => {
    render(
      <MemoryRouter>
        <CreateRoom />
      </MemoryRouter>,
    )
    expect(document.title).toBe('Tastebench | Create a room')
  })
})
