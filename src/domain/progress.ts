import type { Item, Participant } from './types';

export function entryState(p: Participant, entryId: string, criteria: Item[]): 'complete' | 'started' | 'empty' {
  const row = p.scores[entryId] ?? {};
  const filled = criteria.filter(c => row[c.id] !== undefined).length;
  if (filled === 0) return 'empty';
  return filled === criteria.length ? 'complete' : 'started';
}

export function participantProgress(p: Participant, entries: Item[], criteria: Item[]): { done: number; total: number } {
  let done = 0;
  for (const e of entries) {
    const row = p.scores[e.id] ?? {};
    done += criteria.filter(c => row[c.id] !== undefined).length;
  }
  return { done, total: entries.length * criteria.length };
}

export function firstIncompleteIndex(p: Participant, entries: Item[], criteria: Item[]): number {
  const i = entries.findIndex(e => entryState(p, e.id, criteria) !== 'complete');
  return i === -1 ? entries.length - 1 : i;
}
