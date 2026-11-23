import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import type { Participant, Room } from '../domain/types'

const state: { value: unknown } = { value: null }
vi.mock('../firebase/app', () => ({ db: {}, auth: {} }))
vi.mock('../firebase/rooms', () => ({ joinRoom: vi.fn(), createRoom: vi.fn(), roomExists: vi.fn() }))
vi.mock('../firebase/useAuth', () => ({ useAuth: () => 'u1' }))
vi.mock('../firebase/useRoom', () => ({ useRoom: () => state.value }))

import RoomGate, { decideView } from './RoomGate'

const room = (status: Room['status'] = 'open'): Room =>
  ({ code: 'ABC234', name: 'R', creatorUid: 'c', status, entries: [{ id: 'e1', title: 'E' }], criteria: [{ id: 'c1', title: 'C' }], results: null }) as Room
const me: Participant = { uid: 'u1', name: 'Me', scores: {}, notes: {} }

describe('decideView', () => {
  const base = { room: room(), me, wasMember: false, isCreator: false }
  it('undefined room is loading', () => expect(decideView({ ...base, room: undefined })).toBe('loading'))
  it('null room is not-found', () => expect(decideView({ ...base, room: null })).toBe('not-found'))
  it('was member but gone is removed', () =>
    expect(decideView({ ...base, me: null, wasMember: true })).toBe('removed'))
  it('preview is results', () => expect(decideView({ ...base, room: room('preview') })).toBe('results'))
  it('locked without me is results', () =>
    expect(decideView({ ...base, room: room('locked'), me: null })).toBe('results'))
  it('no me is join', () => expect(decideView({ ...base, me: null })).toBe('join'))
  it('creator is wait', () => expect(decideView({ ...base, isCreator: true })).toBe('wait'))
  it('others rate', () => expect(decideView(base)).toBe('rate'))
})

function renderGate(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes><Route path="/r/:code/*" element={<RoomGate />} /></Routes>
    </MemoryRouter>,
  )
}

describe('RoomGate', () => {
  const val = (over: object) => ({ room: room(), participants: [], me, isCreator: false, error: null, ...over })

  it('redirects a rater to the first incomplete entry', () => {
    state.value = val({})
    renderGate('/r/ABC234')
    expect(screen.getByRole('heading', { name: 'rate' })).toBeInTheDocument()
  })

  it('shows removed message after the participant disappears', () => {
    state.value = val({})
    const { rerender } = renderGate('/r/ABC234/rate/0')
    state.value = val({ me: null })
    rerender(
      <MemoryRouter initialEntries={['/r/ABC234/rate/0']}>
        <Routes><Route path="/r/:code/*" element={<RoomGate />} /></Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('You were removed from this room')).toBeInTheDocument()
  })

  it('shows not found', () => {
    state.value = val({ room: null, me: null })
    renderGate('/r/ABC234')
    expect(screen.getByText('No room with this code')).toBeInTheDocument()
  })

  it('shows load error', () => {
    state.value = val({ room: undefined, me: null, error: new Error('x') })
    renderGate('/r/ABC234')
    expect(screen.getByText('Could not load this room')).toBeInTheDocument()
  })

  it('locked redirects rate path to results', () => {
    state.value = val({ room: room('locked') })
    renderGate('/r/ABC234/rate/0')
    expect(screen.getByRole('heading', { name: 'results' })).toBeInTheDocument()
  })

  it('preview allows rate path for a participant', () => {
    state.value = val({ room: room('preview') })
    renderGate('/r/ABC234/rate/0')
    expect(screen.getByRole('heading', { name: 'rate' })).toBeInTheDocument()
  })

  it('shows join name for a non-member', () => {
    state.value = val({ me: null })
    renderGate('/r/ABC234')
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
  })
})
