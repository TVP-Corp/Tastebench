import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import type { Room } from '../domain/types'

vi.mock('../firebase/app', () => ({ db: {}, auth: {} }))
vi.mock('../firebase/rooms', () => ({ removeParticipant: vi.fn(), closeRoom: vi.fn(), discardRoom: vi.fn() }))

import { RoomContext, type RoomContextValue } from './RoomContext'
import Waiting from './Waiting'

const value: RoomContextValue = {
  room: {
    code: 'ABC234',
    name: 'R',
    creatorUid: 'a',
    status: 'open',
    entries: [{ id: 'e1', title: 'E1' }],
    criteria: [{ id: 'c1', title: 'C1' }],
    results: null,
  } as Room,
  participants: [],
  me: null,
  isCreator: false,
  error: null,
  uid: 'a',
  code: 'ABC234',
}

function renderWaiting() {
  render(
    <MemoryRouter>
      <RoomContext.Provider value={value}>
        <Waiting />
      </RoomContext.Provider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  Object.defineProperty(navigator, 'share', { value: vi.fn(() => Promise.resolve()), configurable: true })
})
afterEach(() => {
  delete (navigator as { share?: unknown }).share
})

describe('Waiting', () => {
  it('shows the code and Copy link but no Share', () => {
    renderWaiting()
    expect(screen.getByText('ABC234')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copy link' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Share' })).toBeNull()
  })

  it('sets the page title', () => {
    renderWaiting()
    expect(document.title).toBe('Tastebench | Waiting room')
  })
})
