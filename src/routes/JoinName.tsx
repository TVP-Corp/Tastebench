import { useState } from 'react'
import { Input, Label, TextField } from 'react-aria-components'
import { joinRoom } from '../firebase/rooms'
import { PillButton } from '../ui/PillButton'
import { useDocumentTitle } from '../ui/useDocumentTitle'

export default function JoinName({ code, uid }: { code: string; uid: string }) {
  useDocumentTitle('Join room')
  const [name, setName] = useState('')
  const trimmed = name.trim()
  const valid = trimmed.length >= 1 && trimmed.length <= 30
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (!valid) return
        joinRoom(code, uid, trimmed).catch((err) => console.error('Join failed', err))
      }}
    >
      <TextField value={name} onChange={setName} maxLength={30} className="flex flex-col gap-1">
        <Label className="text-sm font-medium">Your name</Label>
        <Input className="min-h-12 rounded-xl border border-neutral-300 bg-white px-4 text-base" />
      </TextField>
      <PillButton type="submit" isDisabled={!valid}>
        Continue
      </PillButton>
    </form>
  )
}
