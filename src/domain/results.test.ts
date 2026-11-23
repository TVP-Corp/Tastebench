import { computeResults } from './results';
import type { Participant, Scores } from './types';
import { criteria, entries, people } from '../test/fixture';

const p = (uid: string, scores: Scores): Participant => ({ uid, name: uid, scores, notes: {} });

describe('computeResults', () => {
  it('computes the spec example', () => {
    const r = computeResults(entries, criteria, people);
    expect(r.byCriterion.c1.map(x => [x.entryId, x.average, x.rank])).toEqual([['e2', 60, 1], ['e1', 25, 2]]);
    expect(r.byCriterion.c2.map(x => [x.entryId, x.average])).toEqual([['e1', 40], ['e2', 20]]);
    expect(r.overall.map(x => [x.entryId, x.average, x.rank])).toEqual([['e2', 40, 1], ['e1', 32.5, 2]]);
  });

  it('all skipped -> null, sorted last', () => {
    const three = [...entries, { id: 'e3', title: '3' }];
    const ps = [
      p('a', { e1: { c1: 'skip', c2: 60 }, e2: { c1: 50 }, e3: { c1: 40 } }),
      p('b', { e1: { c1: 'skip', c2: 60 }, e2: { c1: 50 }, e3: { c1: 40 } }),
      p('c', { e1: { c1: 'skip', c2: 60 }, e2: { c1: 50 }, e3: { c1: 40 } }),
    ];
    const r = computeResults(three, criteria, ps);
    const c1 = r.byCriterion.c1;
    expect(c1[c1.length - 1]).toMatchObject({ entryId: 'e1', average: null, rank: null });
    const c2e1 = r.byCriterion.c2.find(x => x.entryId === 'e1')!;
    expect(r.overall.find(x => x.entryId === 'e1')!.average).toBe(c2e1.average);
  });

  it('ties share rank and keep entry order', () => {
    const three = [{ id: 'e1', title: '1' }, { id: 'e2', title: '2' }, { id: 'e3', title: '3' }];
    const ps = [p('a', { e1: { c1: 50 }, e2: { c1: 70 }, e3: { c1: 50 } })];
    const r = computeResults(three, [criteria[0]], ps);
    expect(r.overall.map(x => [x.entryId, x.rank])).toEqual([['e2', 1], ['e1', 2], ['e3', 2]]);
  });

  it('no participants -> every average null', () => {
    const r = computeResults(entries, criteria, []);
    expect(r.overall.every(x => x.average === null && x.rank === null)).toBe(true);
    expect(r.byCriterion.c1.every(x => x.average === null)).toBe(true);
    expect(r.participants).toEqual([]);
  });
});
