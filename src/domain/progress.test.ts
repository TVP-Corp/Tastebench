import { entryState, participantProgress, firstIncompleteIndex } from './progress'
import type { Participant, Scores } from './types'

const entries = [
  { id: 'e1', title: '1' },
  { id: 'e2', title: '2' },
]
const criteria = [
  { id: 'c1', title: 'Smell' },
  { id: 'c2', title: 'Flavor' },
]
const p = (uid: string, scores: Scores): Participant => ({ uid, name: uid, scores, notes: {} })
const people = [
  p('a', { e1: { c1: 100, c2: 100 }, e2: { c1: 80, c2: 50 } }),
  p('b', { e1: { c1: 'skip', c2: 100 }, e2: { c1: 70, c2: 50 } }),
  p('c', { e2: { c1: 90 } }),
]

describe('progress', () => {
  it('entryState', () => {
    expect(entryState(people[1], 'e1', criteria)).toBe('complete')
    expect(entryState(people[2], 'e2', criteria)).toBe('started')
    expect(entryState(people[2], 'e1', criteria)).toBe('empty')
  })
  it('participantProgress counts skip as done', () => {
    expect(participantProgress(people[1], entries, criteria)).toEqual({ done: 4, total: 4 })
    expect(participantProgress(people[2], entries, criteria)).toEqual({ done: 1, total: 4 })
  })
  it('firstIncompleteIndex', () => {
    expect(firstIncompleteIndex(people[2], entries, criteria)).toBe(0)
    expect(firstIncompleteIndex(people[0], entries, criteria)).toBe(1)
  })
})
