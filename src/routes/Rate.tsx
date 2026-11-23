import { useEffect, useState } from 'react'
import { Button, Dialog, Heading, Label, Modal, ModalOverlay, TextArea, TextField } from 'react-aria-components'
import { useNavigate, useParams } from 'react-router'
import { entryState } from '../domain/progress'
import type { Score } from '../domain/types'
import { setNote, setScore } from '../firebase/rooms'
import { ParticipantList } from '../ui/ParticipantList'
import { PillButton } from '../ui/PillButton'
import { ProgressSegments } from '../ui/ProgressSegments'
import { ScorePicker } from '../ui/ScorePicker'
import { Screen } from '../ui/Screen'
import { TINTS } from '../ui/tints'
import { useDebounced } from '../ui/useDebounced'
import { useRoomContext } from './RoomContext'

export default function Rate() {
  const { index } = useParams()
  const { room } = useRoomContext()
  if (!room) return null
  const i = Math.min(Math.max(Number.parseInt(index ?? '0', 10) || 0, 0), room.entries.length - 1)
  return <RateEntry key={i} index={i} />
}

function RateEntry({ index }: { index: number }) {
  const { room, me, code, uid } = useRoomContext()
  const navigate = useNavigate()
  const [sheet, setSheet] = useState(false)
  const entry = room?.entries[index]
  const [note, setNoteText] = useState(() => (entry ? (me?.notes[entry.id] ?? '') : ''))
  const saveNote = useDebounced((text: string) => {
    if (entry) setNote(code, uid, entry.id, text).catch((e) => console.error('Save note failed', e))
  }, 500)
  // RateEntry remounts per entry (keyed by index), so this runs on every entry change.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])
  if (!room || !me || !entry) return null

  const base = `/r/${code}`
  const last = index === room.entries.length - 1
  const states = room.entries.map((e) => entryState(me, e.id, room.criteria))
  const go = (i: number) => {
    saveNote.flush()
    navigate(`${base}/rate/${i}`)
  }
  const next = () => {
    saveNote.flush()
    if (!last) navigate(`${base}/rate/${index + 1}`)
    else navigate(`${base}/${room.status === 'preview' ? 'results' : 'wait'}`)
  }

  return (
    <Screen
      title={entry.title}
      subtitle={`Entry ${index + 1} of ${room.entries.length}`}
      onBack={index > 0 ? () => go(index - 1) : undefined}
      actions={
        <Button
          aria-label="Participants"
          onPress={() => setSheet(true)}
          className="flex size-11 items-center justify-center rounded-full text-2xl outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-black"
        >
          <span aria-hidden>👥</span>
        </Button>
      }
      footer={
        <div className="flex gap-2">
          {index > 0 && (
            <PillButton variant="secondary" onPress={() => go(index - 1)}>
              Previous
            </PillButton>
          )}
          <PillButton onPress={next}>{last ? 'Save' : 'Next'}</PillButton>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <ProgressSegments states={states} current={index} onSelect={go} />
        <div className={`flex flex-col gap-6 rounded-3xl p-4 ${TINTS[index % TINTS.length]}`}>
          {room.criteria.map((c) => (
            <ScorePicker
              key={c.id}
              label={c.title}
              value={me.scores[entry.id]?.[c.id]}
              onChange={(s: Score) =>
                setScore(code, uid, entry.id, c.id, s).catch((e) => console.error('Save score failed', e))
              }
            />
          ))}
          <TextField
            value={note}
            onChange={(t) => {
              setNoteText(t)
              saveNote(t)
            }}
            className="flex flex-col gap-1"
          >
            <Label className="text-sm font-medium">Notes</Label>
            <TextArea rows={3} className="rounded-xl border border-neutral-300 bg-white p-3 text-base" />
          </TextField>
        </div>
      </div>

      <ModalOverlay
        isOpen={sheet}
        onOpenChange={setSheet}
        isDismissable
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      >
        <Modal className="w-full max-w-[480px] rounded-t-3xl bg-white p-6 shadow-xl">
          <Dialog className="flex flex-col gap-4 outline-none" aria-label="Participants">
            <Heading slot="title" className="text-lg font-semibold">
              Participants
            </Heading>
            <ParticipantList onLeave={() => navigate('/')} />
          </Dialog>
        </Modal>
      </ModalOverlay>
    </Screen>
  )
}
