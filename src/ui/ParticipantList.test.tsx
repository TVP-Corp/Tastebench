import { fireEvent, render, screen } from '@testing-library/react'
import type { Participant, Room } from '../domain/types'
import { RoomContext, type RoomContextValue } from '../routes/RoomContext'

vi.mock('../firebase/rooms', () => ({
  removeParticipant: vi.fn(() => Promise.resolve()),
  closeRoom: vi.fn(() => Promise.resolve()),
}))
import { closeRoom, removeParticipant } from '../firebase/rooms'
import { ParticipantList } from './ParticipantList'

const entries = [
  { id: 'e1', title: 'E1' },
  { id: 'e2', title: 'E2' },
]
const criteria = [
  { id: 'c1', title: 'C1' },
  { id: 'c2', title: 'C2' },
]
const full = { e1: { c1: 10, c2: 20 }, e2: { c1: 30, c2: 'skip' as const } }
const mk = (uid: string, name: string, scores: Participant['scores']): Participant => ({ uid, name, scores, notes: {} })
const alice = mk('a', 'Alice', full)
const bob = mk('b', 'Bob', { e1: { c1: 10 } })

function renderList(opts: { isCreator: boolean; status?: Room['status']; me?: Participant | null }) {
  const me = opts.me === undefined ? (opts.isCreator ? alice : bob) : opts.me
  const value: RoomContextValue = {
    room: {
      code: 'ABC234',
      name: 'R',
      creatorUid: 'a',
      status: opts.status ?? 'open',
      entries,
      criteria,
      results: null,
    } as Room,
    participants: [alice, bob],
    me,
    isCreator: opts.isCreator,
    error: null,
    uid: me?.uid ?? 'x',
    code: 'ABC234',
  }
  const onLeave = vi.fn()
  render(
    <RoomContext.Provider value={value}>
      <ParticipantList onLeave={onLeave} />
    </RoomContext.Provider>,
  )
  return onLeave
}

beforeEach(() => vi.clearAllMocks())

describe('ParticipantList', () => {
  it('shows names with progress', () => {
    renderList({ isCreator: true })
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('4 / 4')).toBeInTheDocument()
    expect(screen.getByText('1 / 4')).toBeInTheDocument()
  })

  it('creator sees Remove for others, no Leave, and Close', () => {
    renderList({ isCreator: true })
    expect(screen.getAllByRole('button', { name: 'Remove' })).toHaveLength(1)
    expect(screen.queryByRole('button', { name: 'Leave room' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Close room and show results' })).toBeInTheDocument()
  })

  it('non-creator sees Leave, no Remove, no Close', () => {
    renderList({ isCreator: false })
    expect(screen.getByRole('button', { name: 'Leave room' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Remove' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Close room and show results' })).toBeNull()
  })

  it('non-participant sees no Leave', () => {
    renderList({ isCreator: false, me: null })
    expect(screen.queryByRole('button', { name: 'Leave room' })).toBeNull()
  })

  it('leave confirms, calls onLeave and removes', () => {
    const onLeave = renderList({ isCreator: false })
    fireEvent.click(screen.getByRole('button', { name: 'Leave room' }))
    expect(screen.getByText(/ratings and notes will be deleted/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Leave' }))
    expect(onLeave).toHaveBeenCalled()
    expect(removeParticipant).toHaveBeenCalledWith('ABC234', 'b')
  })

  it('creator removes another participant after confirmation', () => {
    renderList({ isCreator: true })
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }))
    fireEvent.click(screen.getByRole('button', { name: 'Remove participant' }))
    expect(removeParticipant).toHaveBeenCalledWith('ABC234', 'b')
  })

  it('close with an incomplete participant names them', () => {
    renderList({ isCreator: true })
    fireEvent.click(screen.getByRole('button', { name: 'Close room and show results' }))
    const dlg = screen.getByRole('alertdialog')
    expect(dlg).toHaveTextContent('Bob')
    expect(dlg).toHaveTextContent('A missing rating counts as 0. A skip does not count.')
    expect(closeRoom).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Close room' }))
    expect(closeRoom).toHaveBeenCalledWith('ABC234')
  })

  it('hides Close when not open', () => {
    renderList({ isCreator: true, status: 'preview' })
    expect(screen.queryByRole('button', { name: 'Close room and show results' })).toBeNull()
  })
})
