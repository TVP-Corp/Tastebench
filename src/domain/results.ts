import type { Item, Participant, RankedEntry, ResultsSnapshot } from './types';

const EPS = 1e-9;

function criterionAverage(entryId: string, criterionId: string, participants: Participant[]): number | null {
  let sum = 0;
  let skips = 0;
  for (const p of participants) {
    const v = p.scores[entryId]?.[criterionId];
    if (v === 'skip') skips++;
    else if (typeof v === 'number') sum += v;
  }
  const divisor = participants.length - skips;
  return divisor === 0 ? null : sum / divisor;
}

function rankEntries(rows: { entry: Item; average: number | null }[]): RankedEntry[] {
  const sorted = rows
    .map((r, i) => ({ ...r, i }))
    .sort((a, b) => {
      if (a.average === null && b.average === null) return a.i - b.i;
      if (a.average === null) return 1;
      if (b.average === null) return -1;
      return Math.abs(a.average - b.average) < EPS ? a.i - b.i : b.average - a.average;
    });
  const out: RankedEntry[] = [];
  sorted.forEach((r, idx) => {
    let rank: number | null = null;
    if (r.average !== null) {
      const prev = out[idx - 1];
      rank = prev && prev.average !== null && Math.abs(prev.average - r.average) < EPS ? prev.rank : idx + 1;
    }
    out.push({ entryId: r.entry.id, title: r.entry.title, average: r.average, rank });
  });
  return out;
}

export function computeResults(entries: Item[], criteria: Item[], participants: Participant[]): ResultsSnapshot {
  const perEntry = new Map<string, (number | null)[]>(entries.map(e => [e.id, []]));
  const byCriterion: Record<string, RankedEntry[]> = {};
  for (const c of criteria) {
    const rows = entries.map(entry => {
      const average = criterionAverage(entry.id, c.id, participants);
      perEntry.get(entry.id)!.push(average);
      return { entry, average };
    });
    byCriterion[c.id] = rankEntries(rows);
  }
  const overall = rankEntries(entries.map(entry => {
    const vals = perEntry.get(entry.id)!.filter((v): v is number => v !== null);
    return { entry, average: vals.length === 0 ? null : vals.reduce((a, b) => a + b, 0) / vals.length };
  }));
  return { entries, criteria, overall, byCriterion, participants };
}
