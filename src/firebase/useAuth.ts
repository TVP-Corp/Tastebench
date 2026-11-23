import { onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { auth } from './app'

export function useAuth(): string | null {
  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid ?? null)
  useEffect(() => {
    let requested = false
    return onAuthStateChanged(auth, (user) => {
      if (user) setUid(user.uid)
      else {
        setUid(null)
        if (!requested) {
          requested = true
          void signInAnonymously(auth)
        }
      }
    })
  }, [])
  return uid
}
