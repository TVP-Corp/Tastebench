import { useState } from 'react'
import { useRoomContext } from '../routes/RoomContext'
import { PillButton } from './PillButton'

export function ShareCard() {
  const { code } = useRoomContext()
  const [copied, setCopied] = useState(false)
  const link = `${location.origin}${location.pathname}#/r/${code}`

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
    <div className="flex flex-col items-center gap-3 rounded-3xl bg-surface p-5 text-center shadow-card ring-1 ring-line">
      <p className="flex items-center gap-1 text-sm text-ink-muted">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-4 text-brand-600"
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
        <PillButton variant="secondary" onPress={copy}>
          {copied ? 'Copied' : 'Copy link'}
        </PillButton>
      </div>
    </div>
  )
}
