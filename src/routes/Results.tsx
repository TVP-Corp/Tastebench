import { useMemo, useState } from 'react'
import {
  Button,
  Dialog,
  Heading,
  Input,
  Label,
  Modal,
  ModalOverlay,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  TextField,
} from 'react-aria-components'
import { useNavigate } from 'react-router'
import { firstIncompleteIndex, participantProgress } from '../domain/progress'
import { computeResults } from '../domain/results'
import { lockRoom, renameEntry } from '../firebase/rooms'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { EntryDetail } from '../ui/EntryDetail'
import { ParticipantList } from '../ui/ParticipantList'
import { PillButton } from '../ui/PillButton'
import { RankingList } from '../ui/RankingList'
import { Screen } from '../ui/Screen'
import { useRoomContext } from './RoomContext'

const tabClass =
  'min-h-11 cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium outline-none data-[selected]:bg-black data-[selected]:text-white data-[focus-visible]:ring-2 data-[focus-visible]:ring-black'
const fail = (err: unknown) => console.error(err)

export default function Results() {
  const { room, participants, me, isCreator, code } = useRoomContext()
  const navigate = useNavigate()
  const [openId, setOpenId] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [locking, setLocking] = useState(false)
  const [people, setPeople] = useState(false)

  const locked = room?.status === 'locked'
  const data = useMemo(() => {
    if (!room) return null
    if (locked) return room.results
    return computeResults(room.entries, room.criteria, participants)
  }, [room, participants, locked])
  if (!room || !data) return null

  const editable = isCreator && !locked
  const incomplete = participants.filter((p) => {
    const { done, total } = participantProgress(p, room.entries, room.criteria)
    return done < total
  })
  const startEdit = (id: string) => {
    setDraft(room.entries.find((e) => e.id === id)?.title ?? '')
    setEditId(id)
  }
  const save = () => {
    const title = draft.trim()
    if (!title || !editId) return
    renameEntry(code, room.entries, editId, title).catch(fail)
    setEditId(null)
  }
  const confirmLock = () => {
    setLocking(false)
    lockRoom(code, computeResults(room.entries, room.criteria, participants)).catch(fail)
  }
  const action = editable
    ? (r: { entryId: string; title: string }) => (
        <Button
          aria-label={`Edit title of ${r.title}`}
          onPress={() => startEdit(r.entryId)}
          className="mr-1 flex size-11 items-center justify-center rounded-full outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-black"
        >
          ✎
        </Button>
      )
    : undefined

  return (
    <Screen
      title={room.name}
      actions={
        !locked && (
          <Button
            aria-label="Participants"
            onPress={() => setPeople(true)}
            className="flex size-11 items-center justify-center rounded-full text-xl outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-black"
          >
            👥
          </Button>
        )
      }
      footer={
        <div className="flex flex-col gap-2">
          {!locked && me && (
            <Button
              onPress={() => navigate(`/r/${code}/rate/${firstIncompleteIndex(me, room.entries, room.criteria)}`)}
              className="min-h-11 rounded-full text-base font-medium outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-black"
            >
              Edit my ratings
            </Button>
          )}
          {editable && <PillButton onPress={() => setLocking(true)}>Lock results</PillButton>}
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <span className="self-center rounded-full bg-white px-3 py-1 text-sm font-semibold">
          {locked ? 'Final' : 'Preview'}
        </span>
        <Tabs>
          <TabList aria-label="Rankings" className="mb-3 flex gap-1 overflow-x-auto">
            <Tab id="overall" className={tabClass}>
              Overall
            </Tab>
            {data.criteria.map((c) => (
              <Tab key={c.id} id={c.id} className={tabClass}>
                {c.title}
              </Tab>
            ))}
          </TabList>
          <TabPanel id="overall" className="outline-none">
            <RankingList rows={data.overall} onOpen={setOpenId} renderAction={action} />
          </TabPanel>
          {data.criteria.map((c) => (
            <TabPanel key={c.id} id={c.id} className="outline-none">
              <RankingList rows={data.byCriterion[c.id] ?? []} onOpen={setOpenId} renderAction={action} />
            </TabPanel>
          ))}
        </Tabs>
      </div>

      <EntryDetail data={data} entryId={openId} onClose={() => setOpenId(null)} />

      <ModalOverlay
        isOpen={editId !== null}
        onOpenChange={(o) => !o && setEditId(null)}
        isDismissable
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      >
        <Modal className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
          <Dialog className="flex flex-col gap-4 outline-none">
            <Heading slot="title" className="text-lg font-semibold">
              Edit title
            </Heading>
            <TextField value={draft} onChange={setDraft} className="flex flex-col gap-1">
              <Label className="text-sm">Title</Label>
              <Input className="min-h-11 rounded-xl border border-neutral-300 px-3 outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-black" />
            </TextField>
            <PillButton isDisabled={draft.trim() === ''} onPress={save}>
              Save
            </PillButton>
            <Button
              onPress={() => setEditId(null)}
              className="min-h-11 rounded-full text-base font-medium text-neutral-700 outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-black"
            >
              Cancel
            </Button>
          </Dialog>
        </Modal>
      </ModalOverlay>

      <ConfirmDialog
        isOpen={locking}
        title="Lock results?"
        body={
          <>
            <p>Titles and ratings cannot change after lock.</p>
            {incomplete.length > 0 && <p className="mt-2">Not complete: {incomplete.map((p) => p.name).join(', ')}.</p>}
          </>
        }
        confirmLabel="Lock results"
        onCancel={() => setLocking(false)}
        onConfirm={confirmLock}
      />

      <ModalOverlay
        isOpen={people}
        onOpenChange={setPeople}
        isDismissable
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      >
        <Modal className="max-h-[85dvh] w-full max-w-sm overflow-auto rounded-3xl bg-white p-6 shadow-xl">
          <Dialog aria-label="Participants" className="outline-none">
            <ParticipantList onLeave={() => navigate('/')} />
          </Dialog>
        </Modal>
      </ModalOverlay>
    </Screen>
  )
}
