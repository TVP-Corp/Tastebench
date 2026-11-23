import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import type { Participant, Room } from '../domain/types'

vi.mock('../firebase/app', () => ({ db: {}, auth: {} }))
vi.mock('../firebase/rooms', () => ({
  setScore: vi.fn(() => Promise.resolve()),
  setNote: vi.fn(() => Promise.resolve()),
  closeRoom: vi.fn(),
  discardRoom: vi.fn(),
  removeParticipant: vi.fn(),
}))

import Rate from './Rate'
import { RoomContext } from './RoomContext'

const room = {
  code: 'ABC234',
  name: 'R',
  creatorUid: 'c',
  status: 'open',
  results: null,
  entries: [
    { id: 'e1', title: 'First' },
    { id: 'e2', title: 'Second' },
    { id: 'e3', title: 'Third' },
  ],
  criteria: [{ id: 'c1', title: 'Taste' }],
} as Room
const me: Participant = { uid: 'u1', name: 'Me', scores: {}, notes: {} }

function renderRate(index: number) {
  render(
    <MemoryRouter initialEntries={[`/r/ABC234/rate/${index}`]}>
      <RoomContext.Provider
        value={{ room, participants: [me], me, isCreator: false, error: null, uid: 'u1', code: 'ABC234' }}
      >
        <Routes>
          <Route path="/r/:code/rate/:index" element={<Rate />} />
        </Routes>
      </RoomContext.Provider>
    </MemoryRouter>,
  )
}

// Chrome returns a Promise from scrollTo; an effect must not return it.
const scrollTo = vi.fn(() => Promise.resolve())
beforeEach(() => {
  scrollTo.mockClear()
  window.scrollTo = scrollTo as unknown as typeof window.scrollTo
})

describe('Rate', () => {
  it('first entry has no Previous', () => {
    renderRate(0)
    expect(screen.queryByRole('button', { name: 'Previous' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()
  })

  it('Previous goes back one entry and scrolls to top', () => {
    renderRate(1)
    expect(screen.getByRole('heading', { name: 'Second' })).toBeInTheDocument()
    scrollTo.mockClear()
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }))
    expect(screen.getByRole('heading', { name: 'First' })).toBeInTheDocument()
    expect(scrollTo).toHaveBeenCalledWith({ top: 0 })
  })

  it('Next and the entry bar scroll to top', () => {
    renderRate(0)
    scrollTo.mockClear()
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByRole('heading', { name: 'Second' })).toBeInTheDocument()
    expect(scrollTo).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: /^Entry 3,/ }))
    expect(screen.getByRole('heading', { name: 'Third' })).toBeInTheDocument()
    expect(scrollTo).toHaveBeenCalledTimes(2)
  })
})
