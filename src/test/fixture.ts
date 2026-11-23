import type { Participant, Scores } from '../domain/types';

export const entries = [{ id: 'e1', title: '1' }, { id: 'e2', title: '2' }];
export const criteria = [{ id: 'c1', title: 'Smell' }, { id: 'c2', title: 'Flavor' }];
const p = (uid: string, scores: Scores): Participant => ({ uid, name: uid, scores, notes: {} });
export const people = [
  p('a', { e1: { c1: 100, c2: 100 }, e2: { c1: 80, c2: 50 } }),
  p('b', { e1: { c1: 'skip', c2: 100 }, e2: { c1: 70, c2: 50 } }),
  p('c', { e2: { c1: 90 } }),
  p('d', { e2: { c1: 'skip' } }),
  p('e', {}),
];
