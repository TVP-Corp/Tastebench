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
  discardRoom: vi.fn(() => Promise.resolve()),
}))
vi.mock('../firebase/rooms', () => rooms)
const navigate = vi.hoisted(() => vi.fn())
vi.mock('react-router', async (orig) => ({
  ...(await orig<typeof import('react-router')>()),
  useNavigate: () => navigate,
}))

import Results from './Results'
import { RoomContext } from './RoomContext'

const base = { code: 'ABC234', name: 'R', creatorUid: 'c', entries, criteria }
function renderResults(opts: { room: Room; participants?: Participant[]; creator?: boolean; me?: Participant | null }) {
  const participants = opts.participants ?? people
  render(
    <MemoryRouter>
      <RoomContext.Provider
        value={{
          room: opts.room,
          participants,
          me: opts.me === undefined ? participants[0] : opts.me,
          isCreator: !!opts.creator,
          error: null,
          uid: 'a',
          code: 'ABC234',
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
  it('preview shows status text and overall order', () => {
    renderResults({ room: preview })
    expect(screen.getByText('Preview results')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Preview results' })).toBeNull()
    const rows = screen.getAllByTestId('ranking-row')
    expect(rows[0]).toHaveTextContent('2')
    expect(rows[0]).toHaveTextContent('4.0')
    expect(rows[1]).toHaveTextContent('3.3')
  })

  it('sets the page title', () => {
    renderResults({ room: preview })
    expect(document.title).toBe('Tastebench | Results')
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
    expect(d.getByRole('button', { name: 'Close' })).toHaveClass('bg-transparent')
  })

  it('detail lets a participant edit that entry', () => {
    renderResults({ room: preview })
    fireEvent.click(screen.getAllByTestId('ranking-row')[0].querySelector('button')!)
    const edit = within(screen.getByRole('dialog')).getByRole('button', { name: 'Edit my rating' })
    expect(edit).toHaveClass('bg-accent')
    fireEvent.click(edit)
    expect(navigate).toHaveBeenCalledWith('/r/ABC234/rate/1')
  })

  it('detail has no edit for a non-participant', () => {
    renderResults({ room: preview, me: null })
    fireEvent.click(screen.getAllByTestId('ranking-row')[0].querySelector('button')!)
    expect(within(screen.getByRole('dialog')).queryByRole('button', { name: 'Edit my rating' })).toBeNull()
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
    const confirm = within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Lock results' })
    expect(confirm).toHaveClass('bg-accent')
    fireEvent.click(confirm)
    expect(rooms.lockRoom).toHaveBeenCalledWith('ABC234', computeResults(entries, criteria, people))
  })

  it('creator discards the room in preview after confirmation', () => {
    renderResults({ room: preview, creator: true })
    fireEvent.click(screen.getByRole('button', { name: 'Discard room' }))
    fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Discard room' }))
    expect(rooms.discardRoom).toHaveBeenCalledWith(
      'ABC234',
      people.map((p) => p.uid),
    )
    expect(navigate).toHaveBeenCalledWith('/')
  })

  it('the Participants button shows the people icon', () => {
    renderResults({ room: preview })
    const button = screen.getByRole('button', { name: 'Participants' })
    expect(button.textContent).toBe('')
    expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('non-creator and non-participant see no creator controls', () => {
    renderResults({ room: preview, me: null })
    expect(screen.queryByRole('button', { name: 'Lock results' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Edit my ratings' })).toBeNull()
    expect(screen.queryByRole('button', { name: /Edit title/ })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Discard room' })).toBeNull()
  })

  it('preview shares the room code', () => {
    renderResults({ room: preview })
    fireEvent.click(screen.getByRole('button', { name: 'Share room code' }))
    expect(screen.getByText('ABC234')).toBeInTheDocument()
    expect(screen.getByText(/cannot join/)).toBeInTheDocument()
  })

  it('ranking tabs are text tabs with a brand underline', () => {
    renderResults({ room: preview })
    const tab = screen.getByRole('tab', { name: 'Overall' })
    expect(tab).toHaveAttribute('aria-selected', 'true')
    expect(tab).toHaveClass('min-h-11', 'data-[selected]:text-brand-700', 'data-[selected]:border-brand-600')
    expect(tab).not.toHaveClass('rounded-full')
  })

  it('share actions and Done are text buttons', () => {
    renderResults({ room: preview })
    const share = screen.getByRole('button', { name: 'Share room code' })
    expect(share).toHaveClass('bg-transparent')
    fireEvent.click(share)
    expect(screen.getByRole('button', { name: 'Done' })).toHaveClass('bg-transparent')
  })

  it('share dialog has no system Share button', () => {
    Object.defineProperty(navigator, 'share', { value: vi.fn(() => Promise.resolve()), configurable: true })
    try {
      renderResults({ room: preview })
      fireEvent.click(screen.getByRole('button', { name: 'Share room code' }))
      expect(screen.queryByRole('button', { name: 'Share' })).toBeNull()
    } finally {
      delete (navigator as { share?: unknown }).share
    }
  })

  it('locked reads the snapshot and hides controls', () => {
    const snap = computeResults(
      [
        { id: 'e1', title: 'Snap One' },
        { id: 'e2', title: 'Snap Two' },
      ],
      criteria,
      [{ uid: 'z', name: 'z', scores: { e1: { c1: 100, c2: 100 } }, notes: {} }],
    )
    renderResults({ room: { ...base, status: 'locked', results: snap } as Room, creator: true })
    expect(screen.getByText('Final results')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Final results' })).toBeNull()
    const rows = screen.getAllByTestId('ranking-row')
    expect(rows[0]).toHaveTextContent('Snap One')
    expect(rows[0]).toHaveTextContent('10.0')
    expect(screen.queryByRole('button', { name: /Edit title/ })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Share room code' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Lock results' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Edit my ratings' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Discard room' })).toBeNull()
    fireEvent.click(rows[0].querySelector('button')!)
    expect(within(screen.getByRole('dialog')).queryByRole('button', { name: 'Edit my rating' })).toBeNull()
  })
})
