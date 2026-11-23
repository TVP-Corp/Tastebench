import { useState } from 'react'
import { Button, Input, Label, TextField } from 'react-aria-components'
import { useNavigate } from 'react-router'
import { createRoom } from '../firebase/rooms'
import { useAuth } from '../firebase/useAuth'
import { PillButton } from '../ui/PillButton'
import { Screen } from '../ui/Screen'
import { useDocumentTitle } from '../ui/useDocumentTitle'

const MAX_ENTRIES = 30

function ListEditor({
  label,
  addLabel,
  values,
  onChange,
  max,
}: {
  label: string
  addLabel: string
  values: string[]
  onChange: (v: string[]) => void
  max?: number
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">{label}</h2>
      {values.map((v, i) => (
        <div key={i} className="flex items-end gap-2">
          <TextField
            value={v}
            onChange={(nv) => onChange(values.map((x, j) => (j === i ? nv : x)))}
            className="flex flex-1 flex-col"
          >
            <Label className="sr-only">{`${label} ${i + 1}`}</Label>
            <Input className="min-h-12 rounded-xl border border-line-strong bg-surface px-4 text-base outline-none data-[focused]:ring-2 data-[focused]:ring-ink" />
          </TextField>
          <Button
            aria-label={`Remove ${label} ${i + 1}`}
            isDisabled={values.length <= 1}
            onPress={() => onChange(values.filter((_, j) => j !== i))}
            className="size-12 rounded-full bg-surface text-lg outline-none transition-colors not-data-[pressed]:data-[hovered]:bg-ink/5 data-[pressed]:bg-ink/10 data-[disabled]:opacity-40 data-[focus-visible]:ring-2 data-[focus-visible]:ring-ink"
          >
            ✕
          </Button>
        </div>
      ))}
      <Button
        isDisabled={max !== undefined && values.length >= max}
        onPress={() => onChange([...values, ''])}
        className="min-h-11 rounded-full border border-line-strong px-4 text-sm font-medium outline-none transition-colors not-data-[pressed]:data-[hovered]:bg-ink/5 data-[pressed]:bg-ink/10 data-[disabled]:opacity-40 data-[focus-visible]:ring-2 data-[focus-visible]:ring-ink"
      >
        {addLabel}
      </Button>
    </section>
  )
}

export default function CreateRoom() {
  const navigate = useNavigate()
  const uid = useAuth()
  useDocumentTitle('Create a room')
  const [name, setName] = useState('')
  const [entries, setEntries] = useState<string[]>([''])
  const [criteria, setCriteria] = useState<string[]>([''])
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  const filled = (xs: string[]) => xs.every((x) => x.trim() !== '')
  const valid = uid !== null && name.trim() !== '' && filled(entries) && filled(criteria)

  async function submit() {
    if (!valid || !uid) return
    setBusy(true)
    setFailed(false)
    try {
      const code = await createRoom(uid, {
        name: name.trim(),
        entries: entries.map((e) => e.trim()),
        criteria: criteria.map((c) => c.trim()),
      })
      navigate(`/r/${code}`)
    } catch {
      setFailed(true)
      setBusy(false)
    }
  }

  return (
    <Screen title="Create a room" onBack={() => navigate('/')}>
      <div className="flex flex-col gap-6">
        <TextField value={name} onChange={setName} className="flex flex-col gap-1">
          <Label className="text-sm font-medium">Room name</Label>
          <Input className="min-h-12 rounded-xl border border-line-strong bg-surface px-4 text-base outline-none data-[focused]:ring-2 data-[focused]:ring-ink" />
        </TextField>
        <ListEditor label="Entry" addLabel="Add entry" values={entries} onChange={setEntries} max={MAX_ENTRIES} />
        <ListEditor label="Criterion" addLabel="Add criterion" values={criteria} onChange={setCriteria} />
        {failed && (
          <p role="alert" className="text-sm text-danger">
            Could not create the room. Try again.
          </p>
        )}
        <PillButton isDisabled={!valid || busy} onPress={() => void submit()}>
          Create room
        </PillButton>
      </div>
    </Screen>
  )
}
