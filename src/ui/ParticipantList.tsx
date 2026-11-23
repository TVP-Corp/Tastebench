import { useState } from 'react'
import { Button } from 'react-aria-components'
import { participantProgress } from '../domain/progress'
import type { Participant } from '../domain/types'
import { closeRoom, removeParticipant } from '../firebase/rooms'
import { useRoomContext } from '../routes/RoomContext'
import { ConfirmDialog } from './ConfirmDialog'
import { DiscardRoom } from './DiscardRoom'
import { PeopleIcon } from './PeopleIcon'
import { PillButton } from './PillButton'

const link =
  'min-h-11 rounded-full px-4 text-sm font-medium text-danger outline-none transition-colors data-[hovered]:bg-danger-50 data-[focus-visible]:ring-2 data-[focus-visible]:ring-ink'
const DELETE_NOTE = 'All of this person’s ratings and notes will be deleted.'

export function ParticipantList({ onLeave, showHeading = true }: { onLeave: () => void; showHeading?: boolean }) {
  const { room, participants, me, isCreator, code, uid } = useRoomContext()
  const [leaving, setLeaving] = useState(false)
  const [removing, setRemoving] = useState<Participant | null>(null)
  const [closing, setClosing] = useState(false)
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
      {showHeading && (
        <h2 className="flex items-center gap-1 text-sm font-medium text-ink-muted">
          <PeopleIcon />
          {`Participants · ${participants.length}`}
        </h2>
      )}
      <ul className="flex flex-col gap-2">
        {participants.map((p) => {
          const { done, total } = progress(p)
          return (
            <li
              key={p.uid}
              className="flex items-center justify-between rounded-2xl bg-surface px-4 py-2 shadow-card ring-1 ring-line-strong"
            >
              <span className="font-medium">{p.name}</span>
              <span className="flex items-center gap-2">
                {done === total ? (
                  <span className="rounded-full bg-brand-100 px-2 py-0.5 text-sm font-semibold text-brand-800">
                    Done
                  </span>
                ) : (
                  <span className="text-sm text-ink-muted tabular-nums">{`${done} of ${total} rated`}</span>
                )}
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
        <PillButton variant="danger" onPress={() => setLeaving(true)}>
          Leave room
        </PillButton>
      )}
      {isCreator && room.status === 'open' && (
        <>
          <PillButton variant="warning" onPress={() => setClosing(true)}>
            Close room and show results
          </PillButton>
          <DiscardRoom onLeave={onLeave} />
        </>
      )}

      <ConfirmDialog
        isOpen={leaving}
        title="Leave room?"
        body={DELETE_NOTE}
        confirmLabel="Leave"
        variant="danger"
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
        variant="danger"
        onCancel={() => setRemoving(null)}
        onConfirm={() => {
          const target = removing
          setRemoving(null)
          if (target) removeParticipant(code, target.uid).catch(fail)
        }}
      />
      <ConfirmDialog
        isOpen={closing}
        title="Close room?"
        body={
          <>
            <p>People can no longer join or rate, but everyone can still see the results.</p>
            {incomplete.length > 0 && (
              <>
                <p className="mt-2">
                  These participants have not finished: {incomplete.map((p) => p.name).join(', ')}.
                </p>
                <p className="mt-2">A missing rating counts as 0. A skip does not count.</p>
              </>
            )}
          </>
        }
        confirmLabel="Close room"
        variant="warning"
        onCancel={() => setClosing(false)}
        onConfirm={close}
      />
    </div>
  )
}
