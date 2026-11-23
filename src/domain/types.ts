export type RoomStatus = 'open' | 'preview' | 'locked';
export interface Item { id: string; title: string }
export type Score = number | 'skip'; // tenths 0..100
export type Scores = Record<string, Record<string, Score>>; // entryId -> criterionId -> Score
export interface Room {
  code: string; name: string; creatorUid: string; status: RoomStatus;
  entries: Item[]; criteria: Item[]; results: ResultsSnapshot | null;
}
export interface Participant { uid: string; name: string; scores: Scores; notes: Record<string, string> }
export interface RankedEntry { entryId: string; title: string; average: number | null; rank: number | null }
export interface ResultsSnapshot {
  entries: Item[]; criteria: Item[];
  overall: RankedEntry[]; // sorted
  byCriterion: Record<string, RankedEntry[]>; // criterionId -> sorted
  participants: Participant[]; // for the detail tables
}
