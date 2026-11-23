import type { Score } from './types';

export function splitTenths(t: number): { whole: number; decimal: number } {
  return { whole: Math.floor(t / 10), decimal: t % 10 };
}

export function pickWhole(current: Score | undefined, whole: number): number {
  if (whole >= 11) return 110;
  const decimal = typeof current === 'number' ? splitTenths(current).decimal : 0;
  return whole * 10 + decimal;
}

export function pickDecimal(current: Score | undefined, decimal: number): number | null {
  if (typeof current !== 'number') return null;
  const { whole } = splitTenths(current);
  if (whole >= 11) return 110;
  return whole * 10 + decimal;
}

export function formatTenths(t: number): string {
  return (t / 10).toFixed(1);
}

export function formatAverage(avg: number | null): string {
  return avg === null ? '-' : (Math.round(avg) / 10).toFixed(1);
}

export function isValidScore(v: unknown): v is Score {
  return v === 'skip' || (typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 110);
}
