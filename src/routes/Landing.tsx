import { useState } from 'react'
import { FieldError, Input, Label, TextField } from 'react-aria-components'
import { useNavigate } from 'react-router'
import { normalizeCode } from '../domain/code'
import { roomExists } from '../firebase/rooms'
import { useAuth } from '../firebase/useAuth'
import { PillButton } from '../ui/PillButton'

export default function Landing() {
  const navigate = useNavigate()
  const uid = useAuth()
  const [joining, setJoining] = useState(false)
  const [code, setCode] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [busy, setBusy] = useState(false)

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
    <div className="min-h-dvh bg-gradient-to-b from-rose-50 via-sky-50 to-violet-50">
      <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col justify-center gap-4 px-4">
        <PillButton onPress={() => navigate('/create')}>Create a room</PillButton>
        {!joining ? (
          <PillButton className="!bg-white !text-black border border-black" onPress={() => setJoining(true)}>
            Join a room
          </PillButton>
        ) : (
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => { e.preventDefault(); void join() }}
          >
            <TextField
              value={code}
              onChange={(v) => { setCode(v); setNotFound(false) }}
              isInvalid={notFound}
              autoFocus
              className="flex flex-col gap-1"
            >
              <Label className="text-sm font-medium">Room code</Label>
              <Input className="min-h-12 rounded-xl border border-neutral-300 bg-white px-4 text-base uppercase" />
              <FieldError className="text-sm text-red-600">No room with this code</FieldError>
            </TextField>
            <PillButton type="submit" isDisabled={busy || uid === null || !normalizeCode(code)}>Join</PillButton>
          </form>
        )}
      </main>
    </div>
  )
}
