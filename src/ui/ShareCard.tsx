import { useState } from 'react'
import { Button } from 'react-aria-components'
import { useRoomContext } from '../routes/RoomContext'

const btn =
  'min-h-11 rounded-full border border-neutral-300 bg-white px-5 text-base font-medium outline-none transition-colors data-[hovered]:bg-neutral-100 data-[focus-visible]:ring-2 data-[focus-visible]:ring-black'

export function ShareCard({ showShare = true }: { showShare?: boolean }) {
  const { code } = useRoomContext()
  const [copied, setCopied] = useState(false)
  const link = `${location.origin}${location.pathname}#/r/${code}`
  const canShare = showShare && typeof navigator !== 'undefined' && typeof navigator.share === 'function'

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
    <div className="flex flex-col items-center gap-3 rounded-3xl bg-white/80 p-5 text-center shadow-card ring-1 ring-white">
      <p className="flex items-center gap-1 text-sm text-neutral-600">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="4" y="10" width="16" height="10" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
        Room code
      </p>
      <p className="font-mono text-4xl font-bold tracking-widest">{code}</p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button onPress={copy} className={btn}>
          {copied ? 'Copied' : 'Copy link'}
        </Button>
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
