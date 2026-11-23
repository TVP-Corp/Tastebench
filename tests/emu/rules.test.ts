import { readFileSync } from 'node:fs'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore'
import { afterAll, beforeAll, beforeEach, describe, test } from 'vitest'

let env: RulesTestEnvironment
const ROOM = 'rooms/ROOM01'
const entries = [{ id: 'e1', title: 'One' }, { id: 'e2', title: 'Two' }]
const criteria = [{ id: 'c1', title: 'Taste' }]
const now = () => Timestamp.now()

const roomData = (status: string, extra: object = {}) => ({
  name: 'Room', creatorUid: 'alice', status, entries, criteria,
  results: null, createdAt: now(), closedAt: null, lockedAt: null, ...extra,
})
const partData = (name: string) => ({
  name, scores: {}, notes: {}, joinedAt: now(), updatedAt: now(),
})

async function seed(status: string) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore()
    await setDoc(doc(db, ROOM), roomData(status))
    await setDoc(doc(db, ROOM, 'participants', 'alice'), partData('Alice'))
    await setDoc(doc(db, ROOM, 'participants', 'bob'), partData('Bob'))
  })
}
const as = (uid: string) => env.authenticatedContext(uid).firestore()

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-rating-rooms',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
  })
})
afterAll(async () => { await env.cleanup() })
beforeEach(async () => { await env.clearFirestore(); await seed('open') })

describe('room read/create', () => {
  test('unauthenticated read fails', async () => {
    await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), ROOM)))
  })
  test('authenticated read succeeds', async () => {
    await assertSucceeds(getDoc(doc(as('carol'), ROOM)))
  })
  test('create own open room succeeds', async () => {
    await assertSucceeds(setDoc(doc(as('carol'), 'rooms/NEW001'), roomData('open', { creatorUid: 'carol' })))
  })
  test('create with other creatorUid fails', async () => {
    await assertFails(setDoc(doc(as('carol'), 'rooms/NEW001'), roomData('open', { creatorUid: 'alice' })))
  })
  test('create with 31 entries fails', async () => {
    const many = Array.from({ length: 31 }, (_, i) => ({ id: `e${i}`, title: 'T' }))
    await assertFails(setDoc(doc(as('carol'), 'rooms/NEW001'), roomData('open', { creatorUid: 'carol', entries: many })))
  })
  test('create with 30 entries succeeds', async () => {
    const many = Array.from({ length: 30 }, (_, i) => ({ id: `e${i}`, title: 'T' }))
    await assertSucceeds(setDoc(doc(as('carol'), 'rooms/NEW001'), roomData('open', { creatorUid: 'carol', entries: many })))
  })
  test('create with empty criteria fails', async () => {
    await assertFails(setDoc(doc(as('carol'), 'rooms/NEW001'), roomData('open', { creatorUid: 'carol', criteria: [] })))
  })
  test('create with preview status fails', async () => {
    await assertFails(setDoc(doc(as('carol'), 'rooms/NEW001'), roomData('preview', { creatorUid: 'carol' })))
  })
})

describe('participant create', () => {
  test('own doc while open succeeds', async () => {
    await assertSucceeds(setDoc(doc(as('carol'), ROOM, 'participants', 'carol'), partData('Carol')))
  })
  test("another uid's doc fails", async () => {
    await assertFails(setDoc(doc(as('carol'), ROOM, 'participants', 'dave'), partData('Dave')))
  })
  test('while preview fails', async () => {
    await seed('preview')
    await assertFails(setDoc(doc(as('carol'), ROOM, 'participants', 'carol'), partData('Carol')))
  })
  test('empty or too long name fails', async () => {
    await assertFails(setDoc(doc(as('carol'), ROOM, 'participants', 'carol'), partData('')))
    await assertFails(setDoc(doc(as('carol'), ROOM, 'participants', 'carol'), partData('x'.repeat(31))))
  })
})

describe('participant update', () => {
  const upd = (uid: string, target: string, data: object) =>
    updateDoc(doc(as(uid), ROOM, 'participants', target), data)
  test('own scores in open succeeds', async () => {
    await assertSucceeds(upd('bob', 'bob', { 'scores.e1.c1': 50 }))
  })
  test('own scores in preview succeeds', async () => {
    await seed('preview')
    await assertSucceeds(upd('bob', 'bob', { 'scores.e1.c1': 50 }))
  })
  test('own scores in locked fails', async () => {
    await seed('locked')
    await assertFails(upd('bob', 'bob', { 'scores.e1.c1': 50 }))
  })
  test("someone else's doc fails", async () => {
    await assertFails(upd('bob', 'alice', { 'scores.e1.c1': 50 }))
  })
  test('name change fails', async () => {
    await assertFails(upd('bob', 'bob', { name: 'Robert' }))
  })
})

describe('participant delete', () => {
  const del = (uid: string, target: string) => deleteDoc(doc(as(uid), ROOM, 'participants', target))
  test('self delete in open succeeds', async () => { await assertSucceeds(del('bob', 'bob')) })
  test('creator removes other succeeds', async () => { await assertSucceeds(del('alice', 'bob')) })
  test("bob deletes alice's fails", async () => { await assertFails(del('bob', 'alice')) })
  test('creator deletes self fails', async () => { await assertFails(del('alice', 'alice')) })
  test('any delete in locked fails', async () => {
    await seed('locked')
    await assertFails(del('bob', 'bob'))
    await assertFails(del('alice', 'bob'))
  })
})

describe('room update', () => {
  const upd = (uid: string, data: object) => updateDoc(doc(as(uid), ROOM), data)
  test('non-creator closing fails', async () => {
    await assertFails(upd('bob', { status: 'preview', closedAt: now() }))
  })
  test('creator open -> preview succeeds', async () => {
    await assertSucceeds(upd('alice', { status: 'preview', closedAt: now() }))
  })
  test('creator open -> locked fails', async () => {
    await assertFails(upd('alice', { status: 'locked', results: {}, lockedAt: now() }))
  })
  describe('preview', () => {
    beforeEach(async () => { await seed('preview') })
    test('rename entries same size succeeds', async () => {
      await assertSucceeds(upd('alice', { entries: [{ id: 'e1', title: 'Uno' }, { id: 'e2', title: 'Dos' }] }))
    })
    test('change criteria fails', async () => {
      await assertFails(upd('alice', { criteria: [{ id: 'c1', title: 'Smell' }] }))
    })
    test('entries of different size fails', async () => {
      await assertFails(upd('alice', { entries: [{ id: 'e1', title: 'One' }] }))
    })
    test('rename that changes an id fails', async () => {
      await assertFails(upd('alice', { entries: [{ id: 'x1', title: 'One' }, { id: 'e2', title: 'Two' }] }))
    })
    test('rename that reorders entries fails', async () => {
      await assertFails(upd('alice', { entries: [entries[1], entries[0]] }))
    })
    test('lock that also changes entries fails', async () => {
      await assertFails(upd('alice', {
        status: 'locked', results: { e1: 1 }, lockedAt: now(),
        entries: [{ id: 'e1', title: 'Hacked' }, { id: 'e2', title: 'Two' }],
      }))
    })
    test('lock with only status fails', async () => {
      await assertFails(upd('alice', { status: 'locked' }))
    })
    test('lock with results and lockedAt succeeds', async () => {
      await assertSucceeds(upd('alice', { status: 'locked', results: { e1: 1 }, lockedAt: now() }))
    })
  })
  test('any update in locked fails', async () => {
    await seed('locked')
    await assertFails(upd('alice', { entries: [{ id: 'e1', title: 'Uno' }, { id: 'e2', title: 'Dos' }] }))
    await assertFails(upd('alice', { status: 'open' }))
  })
})
