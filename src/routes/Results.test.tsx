import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { computeResults } from '../domain/results'
import type { Participant, Room } from '../domain/types'
import { criteria, entries, people } from '../test/fixture'

vi.mock('../firebase/app', () => ({ db: {}, auth: {} }))
const rooms = vi.hoisted(() => ({
  renameEntry: vi.fn(() => Promise.resolve()),
  lockRoom: vi.fn(() => Promise.resolve()),
  closeRoom: vi.fn(),
  removeParticipant: vi.fn(),
}))
vi.mock('../firebase/rooms', () => rooms)

import Results from './Results'
import { RoomContext } from './RoomContext'

const base = { code: 'ABC234', name: 'R', creatorUid: 'c', entries, criteria }
function renderResults(opts: { room: Room; participants?: Participant[]; creator?: boolean; me?: Participant | null }) {
  const participants = opts.participants ?? people
  render(
    <MemoryRouter>
      <RoomContext.Provider
        value={{
          room: opts.room, participants, me: opts.me === undefined ? participants[0] : opts.me,
          isCreator: !!opts.creator, error: null, uid: 'a', code: 'ABC234',
        }}
      >
        <Results />
      </RoomContext.Provider>
    </MemoryRouter>,
  )
}
const preview = { ...base, status: 'preview', results: null } as Room

beforeEach(() => vi.clearAllMocks())

describe('Results', () => {
  it('preview shows badge and overall order', () => {
    renderResults({ room: preview })
    expect(screen.getByText('Preview')).toBeInTheDocument()
    const rows = screen.getAllByTestId('ranking-row')
    expect(rows[0]).toHaveTextContent('2')
    expect(rows[0]).toHaveTextContent('4.0')
    expect(rows[1]).toHaveTextContent('3.3')
  })

  it('Smell tab shows 6.0 first', () => {
    renderResults({ room: preview })
    fireEvent.click(screen.getByRole('tab', { name: 'Smell' }))
    expect(screen.getAllByTestId('ranking-row')[0]).toHaveTextContent('6.0')
  })

  it('detail shows skipped and dash', () => {
    renderResults({ room: preview })
    fireEvent.click(screen.getAllByTestId('ranking-row')[0].querySelector('button')!)
    const d = within(screen.getByRole('dialog'))
    expect(d.getByText('d').closest('tr')).toHaveTextContent('skipped')
    expect(d.getByText('e').closest('tr')).toHaveTextContent('-')
  })

  it('creator renames; empty disables save', () => {
    renderResults({ room: preview, creator: true })
    fireEvent.click(screen.getByRole('button', { name: 'Edit title of 1' }))
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '   ' } })
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    fireEvent.change(input, { target: { value: ' Gelato Uno ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(rooms.renameEntry).toHaveBeenCalledWith('ABC234', entries, 'e1', 'Gelato Uno')
  })

  it('creator locks via confirm', () => {
    renderResults({ room: preview, creator: true })
    fireEvent.click(screen.getByRole('button', { name: 'Lock results' }))
    expect(screen.getByRole('alertdialog')).toHaveTextContent('cannot change')
    fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Lock results' }))
    expect(rooms.lockRoom).toHaveBeenCalledWith('ABC234', computeResults(entries, criteria, people))
  })

  it('non-creator and non-participant see no creator controls', () => {
    renderResults({ room: preview, me: null })
    expect(screen.queryByRole('button', { name: 'Lock results' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Edit my ratings' })).toBeNull()
    expect(screen.queryByRole('button', { name: /Edit title/ })).toBeNull()
  })

  it('preview shares the room code', () => {
    renderResults({ room: preview })
    fireEvent.click(screen.getByRole('button', { name: 'Share room code' }))
    expect(screen.getByText('ABC234')).toBeInTheDocument()
    expect(screen.getByText(/cannot join/)).toBeInTheDocument()
  })

  it('locked reads the snapshot and hides controls', () => {
    const snap = computeResults(
      [{ id: 'e1', title: 'Snap One' }, { id: 'e2', title: 'Snap Two' }],
      criteria,
      [{ uid: 'z', name: 'z', scores: { e1: { c1: 100, c2: 100 } }, notes: {} }],
    )
    renderResults({ room: { ...base, status: 'locked', results: snap } as Room, creator: true })
    expect(screen.getByText('Final')).toBeInTheDocument()
    const rows = screen.getAllByTestId('ranking-row')
    expect(rows[0]).toHaveTextContent('Snap One')
    expect(rows[0]).toHaveTextContent('10.0')
    expect(screen.queryByRole('button', { name: /Edit title/ })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Share room code' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Lock results' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Edit my ratings' })).toBeNull()
  })
})
