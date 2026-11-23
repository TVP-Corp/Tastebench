import {
  collection, deleteDoc, doc, getDoc, onSnapshot, runTransaction, serverTimestamp, setDoc, updateDoc,
} from 'firebase/firestore'
import { generateCode, newId } from '../domain/code'
import type { Item, Participant, ResultsSnapshot, Room, Score } from '../domain/types'
import { db } from './app'

const roomRef = (code: string) => doc(db, 'rooms', code)
const partRef = (code: string, uid: string) => doc(db, 'rooms', code, 'participants', uid)
const toItems = (titles: string[]): Item[] => titles.map((title) => ({ id: newId(), title }))

export async function createRoom(
  uid: string,
  input: { name: string; entries: string[]; criteria: string[] },
): Promise<string> {
  const entries = toItems(input.entries)
  const criteria = toItems(input.criteria)
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode()
    const created = await runTransaction(db, async (tx) => {
      const ref = roomRef(code)
      if ((await tx.get(ref)).exists()) return false
      tx.set(ref, {
        name: input.name, creatorUid: uid, status: 'open', entries, criteria, results: null,
        createdAt: serverTimestamp(), closedAt: null, lockedAt: null,
      })
      return true
    })
    if (created) return code
  }
  throw new Error('Could not find a free room code')
}

export async function joinRoom(code: string, uid: string, name: string): Promise<void> {
  await setDoc(partRef(code, uid), {
    name, scores: {}, notes: {}, joinedAt: serverTimestamp(), updatedAt: serverTimestamp(),
  })
}

export async function setScore(
  code: string, uid: string, entryId: string, criterionId: string, score: Score,
): Promise<void> {
  await updateDoc(partRef(code, uid), {
    [`scores.${entryId}.${criterionId}`]: score,
    updatedAt: serverTimestamp(),
  })
}

export async function setNote(code: string, uid: string, entryId: string, text: string): Promise<void> {
  await updateDoc(partRef(code, uid), { [`notes.${entryId}`]: text, updatedAt: serverTimestamp() })
}

export async function removeParticipant(code: string, uid: string): Promise<void> {
  await deleteDoc(partRef(code, uid))
}

export async function closeRoom(code: string): Promise<void> {
  await updateDoc(roomRef(code), { status: 'preview', closedAt: serverTimestamp() })
}

export async function renameEntry(
  code: string, entries: Item[], entryId: string, title: string,
): Promise<void> {
  await updateDoc(roomRef(code), {
    entries: entries.map((e) => (e.id === entryId ? { ...e, title } : e)),
  })
}

export async function lockRoom(code: string, results: ResultsSnapshot): Promise<void> {
  await updateDoc(roomRef(code), { status: 'locked', results, lockedAt: serverTimestamp() })
}

export async function roomExists(code: string): Promise<boolean> {
  return (await getDoc(roomRef(code))).exists()
}

export function subscribeRoom(
  code: string, cb: (room: Room | null) => void, onError?: (e: Error) => void,
): () => void {
  return onSnapshot(
    roomRef(code),
    (snap) => {
      if (!snap.exists()) return cb(null)
      const d = snap.data()
      cb({
        code: snap.id, name: d.name, creatorUid: d.creatorUid, status: d.status,
        entries: d.entries, criteria: d.criteria, results: d.results ?? null,
      })
    },
    onError,
  )
}

export function subscribeParticipants(
  code: string, cb: (ps: Participant[]) => void, onError?: (e: Error) => void,
): () => void {
  return onSnapshot(
    collection(db, 'rooms', code, 'participants'),
    (snap) => {
      cb(snap.docs.map((s) => {
        const d = s.data()
        return { uid: s.id, name: d.name, scores: d.scores ?? {}, notes: d.notes ?? {} }
      }))
    },
    onError,
  )
}
