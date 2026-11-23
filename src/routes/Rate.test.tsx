import { fireEvent, render, screen, within } from '@testing-library/react'
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

const room2 = { ...room, criteria: [...room.criteria, { id: 'c2', title: 'Smell' }] } as Room

function renderRate(index: number, r: Room = room) {
  render(
    <MemoryRouter initialEntries={[`/r/ABC234/rate/${index}`]}>
      <RoomContext.Provider
        value={{ room: r, participants: [me], me, isCreator: false, error: null, uid: 'u1', code: 'ABC234' }}
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
  it('participants sheet has one Participants heading', () => {
    renderRate(0)
    fireEvent.click(screen.getByRole('button', { name: 'Participants' }))
    expect(within(screen.getByRole('dialog')).getAllByRole('heading', { name: /participants/i })).toHaveLength(1)
  })

  it('first entry has no Previous', () => {
    renderRate(0)
    expect(screen.queryByRole('button', { name: 'Previous' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()
  })

  it('Previous goes back one entry and scrolls to top', () => {
    renderRate(1)
    expect(screen.getByRole('heading', { name: 'Second' })).toBeInTheDocument()
    scrollTo.mockClear()
    expect(screen.getByRole('button', { name: 'Previous' })).toHaveClass('bg-transparent')
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

  it('with one criterion there is no criterion bar', () => {
    renderRate(0)
    expect(screen.queryByRole('button', { name: /^Criterion 1,/ })).toBeNull()
  })

  it('Next steps through criteria, then to the next entry', () => {
    renderRate(0, room2)
    expect(screen.getByRole('radiogroup', { name: 'Taste whole number' })).toBeInTheDocument()
    expect(screen.queryByRole('radiogroup', { name: 'Smell whole number' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByRole('heading', { name: 'First' })).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: 'Smell whole number' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByRole('heading', { name: 'Second' })).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: 'Taste whole number' })).toBeInTheDocument()
  })

  it('Previous on the first criterion opens the last criterion of the previous entry', () => {
    renderRate(1, room2)
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }))
    expect(screen.getByRole('heading', { name: 'First' })).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: 'Smell whole number' })).toBeInTheDocument()
  })

  it('the criterion bar selects a criterion', () => {
    renderRate(0, room2)
    fireEvent.click(screen.getByRole('button', { name: /^Criterion 2,/ }))
    expect(screen.getByRole('radiogroup', { name: 'Smell whole number' })).toBeInTheDocument()
    expect(screen.getByText('Smell · 2 of 2')).toBeInTheDocument()
  })

  it('the criterion card slides in from the side of the step', () => {
    renderRate(0, room2)
    const card = (name: string) =>
      screen.getByRole('radiogroup', { name: `${name} whole number` }).closest('.touch-pan-y')
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(card('Smell')).toHaveClass('motion-safe:animate-card-in-left')
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }))
    expect(card('Taste')).toHaveClass('motion-safe:animate-card-in-right')
  })
})
