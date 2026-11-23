import { pickWhole, pickDecimal, splitTenths, formatTenths, formatAverage, isValidScore } from './score';

describe('pickWhole', () => {
  test('sets whole from undefined', () => expect(pickWhole(undefined, 7)).toBe(70));
  test('keeps existing decimal', () => expect(pickWhole(73, 8)).toBe(83));
  test('10 drops the decimal', () => expect(pickWhole(75, 10)).toBe(100));
  test('skip resets decimal', () => expect(pickWhole('skip', 4)).toBe(40));
});
describe('pickDecimal', () => {
  test('adds decimal', () => expect(pickDecimal(70, 3)).toBe(73));
  test('10.0 stays 100', () => expect(pickDecimal(100, 3)).toBe(100));
  test('undefined gives null', () => expect(pickDecimal(undefined, 3)).toBeNull());
  test('skip gives null', () => expect(pickDecimal('skip', 3)).toBeNull());
});
describe('splitTenths', () => {
  test('splits', () => expect(splitTenths(73)).toEqual({ whole: 7, decimal: 3 }));
});
describe('formatTenths', () => {
  test('formats max', () => expect(formatTenths(100)).toBe('10.0'));
});
describe('formatAverage', () => {
  test('whole', () => expect(formatAverage(60)).toBe('6.0'));
  test('rounds', () => expect(formatAverage(32.5)).toBe('3.3'));
  test('null', () => expect(formatAverage(null)).toBe('-'));
});
describe('isValidScore', () => {
  test('accepts valid', () => expect([0, 100, 'skip'].every(isValidScore)).toBe(true));
  test('rejects invalid', () => expect([-1, 101, 110, 7.5, '7', null].some(isValidScore)).toBe(false));
});
