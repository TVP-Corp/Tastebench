import { useEffect, useState } from 'react'

export function OfflineBanner() {
  const [online, setOnline] = useState(() => navigator.onLine)
  useEffect(() => {
    const up = () => setOnline(true)
    const down = () => setOnline(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => {
      window.removeEventListener('online', up)
      window.removeEventListener('offline', down)
    }
  }, [])
  if (online) return null
  return (
    <div role="status" className="bg-ink px-4 py-2 text-center text-sm text-surface">
      Offline
    </div>
  )
}
