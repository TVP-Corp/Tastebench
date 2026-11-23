import { useState } from 'react'
import { FieldError, Input, Label, TextField } from 'react-aria-components'
import { useNavigate } from 'react-router'
import { normalizeCode } from '../domain/code'
import { roomExists } from '../firebase/rooms'
import { useAuth } from '../firebase/useAuth'
import { Logo } from '../ui/Logo'
import { PillButton } from '../ui/PillButton'
import { useDocumentTitle } from '../ui/useDocumentTitle'

export default function Landing() {
  const navigate = useNavigate()
  const uid = useAuth()
  const [joining, setJoining] = useState(false)
  const [code, setCode] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [busy, setBusy] = useState(false)
  useDocumentTitle()

  const cancel = () => {
    setJoining(false)
    setCode('')
    setNotFound(false)
  }

  async function join() {
    const c = normalizeCode(code)
    if (!c) return
    setBusy(true)
    try {
      if (await roomExists(c)) navigate(`/r/${c}`)
      else setNotFound(true)
    } catch {
      setNotFound(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-dvh bg-page">
      <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col justify-center gap-4 px-4 motion-safe:animate-fade-in">
        <div className="mb-4 flex flex-col items-center gap-2 text-center">
          <Logo size={56} wordmark={false} />
          <h1 className="text-3xl font-bold">Tastebench</h1>
          <p className="text-ink-muted">Rate anything with friends</p>
        </div>
        {!joining ? (
          <>
            <PillButton onPress={() => navigate('/create')}>Create a room</PillButton>
            <PillButton variant="secondary" onPress={() => setJoining(true)}>
              Join a room
            </PillButton>
          </>
        ) : (
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              void join()
            }}
          >
            <TextField
              value={code}
              onChange={(v) => {
                setCode(v)
                setNotFound(false)
              }}
              isInvalid={notFound}
              autoFocus
              className="flex flex-col gap-1"
            >
              <Label className="text-sm font-medium">Room code</Label>
              <Input className="min-h-12 rounded-xl border border-line-strong bg-surface px-4 text-base uppercase outline-none data-[focused]:ring-2 data-[focused]:ring-ink" />
              <FieldError className="text-sm text-danger">No room with this code</FieldError>
            </TextField>
            <PillButton type="submit" isDisabled={busy || uid === null || !normalizeCode(code)}>
              Join
            </PillButton>
            <PillButton variant="tertiary" isDisabled={busy} onPress={cancel}>
              Cancel
            </PillButton>
          </form>
        )}
      </main>
    </div>
  )
}
