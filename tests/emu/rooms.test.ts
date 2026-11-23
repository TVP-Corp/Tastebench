import { signInAnonymously } from 'firebase/auth'
import { beforeAll, describe, expect, test } from 'vitest'
import { auth } from '../../src/firebase/app'
import {
  closeRoom, createRoom, joinRoom, lockRoom, renameEntry, setScore, subscribeParticipants, subscribeRoom,
} from '../../src/firebase/rooms'
import { isValidCode } from '../../src/domain/code'
import type { Participant, ResultsSnapshot, Room } from '../../src/domain/types'

let uid: string
beforeAll(async () => {
  uid = (await signInAnonymously(auth)).user.uid
})

const input = { name: 'Pizza night', entries: ['Margherita', 'Diavola', 'Funghi'], criteria: ['Taste', 'Crust'] }

const firstRoom = (code: string, pred: (r: Room) => boolean = () => true) =>
  new Promise<Room>((resolve) => {
    const off = subscribeRoom(code, (r) => { if (r && pred(r)) { off(); resolve(r) } })
  })
const firstParticipants = (code: string, pred: (ps: Participant[]) => boolean) =>
  new Promise<Participant[]>((resolve) => {
    const off = subscribeParticipants(code, (ps) => { if (pred(ps)) { off(); resolve(ps) } })
  })

describe('rooms data layer', () => {
  test('createRoom returns a valid code and an open room', async () => {
    const code = await createRoom(uid, input)
    expect(isValidCode(code)).toBe(true)
    const room = await firstRoom(code)
    expect(room.status).toBe('open')
    expect(room.results).toBeNull()
    expect(room.creatorUid).toBe(uid)
    expect(room.entries.map((e) => e.title)).toEqual(input.entries)
    expect(new Set(room.entries.map((e) => e.id)).size).toBe(3)
  })

  test('joinRoom delivers a participant with empty scores', async () => {
    const code = await createRoom(uid, input)
    await joinRoom(code, uid, 'Alice')
    const ps = await firstParticipants(code, (p) => p.length === 1)
    expect(ps[0]).toMatchObject({ uid, name: 'Alice', scores: {} })
  })

  test('fast taps keep both values', async () => {
    const code = await createRoom(uid, input)
    await joinRoom(code, uid, 'Alice')
    await Promise.all([setScore(code, uid, 'e1', 'c1', 70), setScore(code, uid, 'e1', 'c2', 'skip')])
    const ps = await firstParticipants(code, (p) => p.length === 1 && !!p[0].scores.e1?.c2)
    expect(ps[0].scores.e1).toEqual({ c1: 70, c2: 'skip' })
  })

  test('setScore rejects an invalid value and leaves the score', async () => {
    const code = await createRoom(uid, input)
    await joinRoom(code, uid, 'Alice')
    await setScore(code, uid, 'e1', 'c1', 70)
    await expect(setScore(code, uid, 'e1', 'c1', 111)).rejects.toThrow(/Invalid score/)
    const ps = await firstParticipants(code, (p) => p.length === 1 && p[0].scores.e1?.c1 === 70)
    expect(ps[0].scores.e1?.c1).toBe(70)
  })

  test('renameEntry changes only the title', async () => {
    const code = await createRoom(uid, input)
    const room = await firstRoom(code)
    await closeRoom(code)
    await renameEntry(code, room.entries, room.entries[1].id, 'Diavola Piccante')
    const after = await firstRoom(code, (r) => r.entries[1].title === 'Diavola Piccante')
    expect(after.entries.map((e) => e.id)).toEqual(room.entries.map((e) => e.id))
    expect(after.entries.map((e) => e.title)).toEqual(['Margherita', 'Diavola Piccante', 'Funghi'])
  })

  test('closeRoom then lockRoom stores the snapshot', async () => {
    const code = await createRoom(uid, input)
    const room = await firstRoom(code)
    await closeRoom(code)
    const results: ResultsSnapshot = {
      entries: room.entries, criteria: room.criteria, overall: [], byCriterion: {}, participants: [],
    }
    await lockRoom(code, results)
    const locked = await firstRoom(code, (r) => r.status === 'locked')
    expect(locked.results).toEqual(results)
  })
})
