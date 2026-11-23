import { useState } from 'react'
import { Button } from 'react-aria-components'
import { useRoomContext } from '../routes/RoomContext'

const btn =
  'min-h-11 rounded-full border border-neutral-300 bg-white px-5 text-base font-medium outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-black'

export function ShareCard() {
  const { code } = useRoomContext()
  const [copied, setCopied] = useState(false)
  const link = `${location.origin}${location.pathname}#/r/${code}`
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  const copy = () => {
    navigator.clipboard
      .writeText(link)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch((err) => console.error('Copy failed', err))
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl bg-white/80 p-5 text-center shadow-sm">
      <p className="text-sm text-neutral-600">Room code</p>
      <p className="font-mono text-4xl font-bold tracking-widest">{code}</p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button onPress={copy} className={btn}>{copied ? 'Copied' : 'Copy link'}</Button>
        {canShare && (
          <Button
            onPress={() => navigator.share({ title: 'Join my rating room', url: link }).catch(() => {})}
            className={btn}
          >
            Share
          </Button>
        )}
      </div>
    </div>
  )
}
