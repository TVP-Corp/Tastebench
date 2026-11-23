import { signInAnonymously, signOut } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { describe, expect, test } from 'vitest'
import { auth, db } from '../../src/firebase/app'
import { createRoom, subscribeParticipants, subscribeRoom } from '../../src/firebase/rooms'

describe('subscription errors and mapping', () => {
  test('participant without scores/notes maps to empty maps', async () => {
    const uid = (await signInAnonymously(auth)).user.uid
    const code = await createRoom(uid, { name: 'R', entries: ['a'], criteria: ['c'] })
    await setDoc(doc(db, 'rooms', code, 'participants', uid), { name: 'Bare' })
    const ps = await new Promise<{ uid: string; name: string; scores: object; notes: object }[]>((res) => {
      const off = subscribeParticipants(code, (p) => { if (p.length) { off(); res(p) } })
    })
    expect(ps[0]).toEqual({ uid, name: 'Bare', scores: {}, notes: {} })
  })

  test('onError is called when the rules deny the read', async () => {
    await signOut(auth)
    const err = await new Promise<Error>((res) => {
      subscribeRoom('NOROOM', () => {}, res)
    })
    expect(err).toBeInstanceOf(Error)
    const err2 = await new Promise<Error>((res) => {
      subscribeParticipants('NOROOM', () => {}, res)
    })
    expect(err2).toBeInstanceOf(Error)
  })
})
