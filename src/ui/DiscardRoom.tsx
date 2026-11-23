import { useState } from 'react'
import { discardRoom } from '../firebase/rooms'
import { useRoomContext } from '../routes/RoomContext'
import { ConfirmDialog } from './ConfirmDialog'
import { PillButton } from './PillButton'

export function DiscardRoom({ onLeave }: { onLeave: () => void }) {
  const { participants, code } = useRoomContext()
  const [discarding, setDiscarding] = useState(false)
  return (
    <>
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
      <ConfirmDialog
        isOpen={discarding}
        title="Discard room?"
        body="The room, all ratings and all notes will be deleted. Nothing is saved. You cannot undo this."
        confirmLabel="Discard room"
        destructive
        onCancel={() => setDiscarding(false)}
        onConfirm={() => {
          setDiscarding(false)
          onLeave()
          discardRoom(
            code,
            participants.map((p) => p.uid),
          ).catch(console.error)
        }}
      />
    </>
  )
}
