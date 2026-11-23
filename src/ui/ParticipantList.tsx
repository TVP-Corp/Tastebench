import { useState } from 'react'
import { Button } from 'react-aria-components'
import { participantProgress } from '../domain/progress'
import type { Participant } from '../domain/types'
import { closeRoom, discardRoom, removeParticipant } from '../firebase/rooms'
import { useRoomContext } from '../routes/RoomContext'
import { ConfirmDialog } from './ConfirmDialog'
import { PillButton } from './PillButton'

const link =
  'min-h-11 rounded-full px-4 text-sm font-medium text-red-700 outline-none transition-colors data-[hovered]:bg-red-50 data-[focus-visible]:ring-2 data-[focus-visible]:ring-black'
const DELETE_NOTE = 'All of this person’s ratings and notes will be deleted.'

export function ParticipantList({ onLeave }: { onLeave: () => void }) {
  const { room, participants, me, isCreator, code, uid } = useRoomContext()
  const [leaving, setLeaving] = useState(false)
  const [removing, setRemoving] = useState<Participant | null>(null)
  const [closing, setClosing] = useState(false)
  const [discarding, setDiscarding] = useState(false)
  if (!room) return null

  const progress = (p: Participant) => participantProgress(p, room.entries, room.criteria)
  const incomplete = participants.filter((p) => {
    const { done, total } = progress(p)
    return done < total
  })
  const fail = (err: unknown) => console.error(err)
  const close = () => {
    setClosing(false)
    closeRoom(code).catch(fail)
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="flex items-center gap-1 text-sm font-medium text-neutral-600">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="9" cy="8" r="3" />
          <path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M18 20a6 6 0 0 0-3-5" />
        </svg>
        {`Participants · ${participants.length}`}
      </h2>
      <ul className="flex flex-col gap-2">
        {participants.map((p) => {
          const { done, total } = progress(p)
          return (
            <li
              key={p.uid}
              className="flex items-center justify-between rounded-2xl bg-white/80 px-4 py-2 shadow-card ring-1 ring-white"
            >
              <span className="font-medium">{p.name}</span>
              <span className="flex items-center gap-2">
                <span className="text-sm text-neutral-600">{`${done} / ${total}`}</span>
                {isCreator && p.uid !== me?.uid && (
                  <Button onPress={() => setRemoving(p)} className={link}>
                    Remove
                  </Button>
                )}
              </span>
            </li>
          )
        })}
      </ul>

      {!isCreator && me && (
        <Button onPress={() => setLeaving(true)} className={link}>
          Leave room
        </Button>
      )}
      {isCreator && room.status === 'open' && (
        <PillButton onPress={() => (incomplete.length ? setClosing(true) : close())}>
          Close room and show results
        </PillButton>
      )}
      {isCreator && room.status !== 'locked' && (
        <PillButton variant="danger" onPress={() => setDiscarding(true)}>
          <span className="inline-flex items-center justify-center gap-2">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
            </svg>
            Discard room
          </span>
        </PillButton>
      )}

      <ConfirmDialog
        isOpen={leaving}
        title="Leave room?"
        body={DELETE_NOTE}
        confirmLabel="Leave"
        onCancel={() => setLeaving(false)}
        onConfirm={() => {
          setLeaving(false)
          onLeave()
          removeParticipant(code, uid).catch(fail)
        }}
      />
      <ConfirmDialog
        isOpen={removing !== null}
        title={`Remove ${removing?.name ?? ''}?`}
        body={DELETE_NOTE}
        confirmLabel="Remove participant"
        onCancel={() => setRemoving(null)}
        onConfirm={() => {
          const target = removing
          setRemoving(null)
          if (target) removeParticipant(code, target.uid).catch(fail)
        }}
      />
      <ConfirmDialog
        isOpen={closing}
        title="Some people are not done"
        body={
          <>
            <p>These participants have not finished: {incomplete.map((p) => p.name).join(', ')}.</p>
            <p className="mt-2">A missing rating counts as 0. A skip does not count.</p>
          </>
        }
        confirmLabel="Close room"
        onCancel={() => setClosing(false)}
        onConfirm={close}
      />
      <ConfirmDialog
        isOpen={discarding}
        title="Discard room?"
        body="The room, all ratings and all notes will be deleted. Nothing is saved. You cannot undo this."
        confirmLabel="Discard room"
        onCancel={() => setDiscarding(false)}
        onConfirm={() => {
          setDiscarding(false)
          onLeave()
          discardRoom(
            code,
            participants.map((p) => p.uid),
          ).catch(fail)
        }}
      />
    </div>
  )
}
