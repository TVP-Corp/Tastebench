import { onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { auth } from './app'

let signingIn: Promise<unknown> | null = null

function ensureSignedIn(): void {
  if (signingIn) return
  signingIn = signInAnonymously(auth).catch((e) => {
    console.error('Anonymous sign-in failed', e)
    signingIn = null
  })
}

export function useAuth(): string | null {
  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid ?? null)
  useEffect(
    () =>
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setUid(user.uid)
          signingIn = null
        } else {
          setUid(null)
          ensureSignedIn()
        }
      }),
    [],
  )
  return uid
}
