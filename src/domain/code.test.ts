import { normalizeCode, generateCode, isValidCode, newId } from './code';

describe('normalizeCode', () => {
  test('strips spaces and uppercases', () => expect(normalizeCode(' ab c2d9 ')).toBe('ABC2D9'));
});
describe('generateCode', () => {
  test('matches alphabet', () => expect(generateCode()).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/));
  test('uses injected random', () => expect(generateCode(() => 0)).toBe('AAAAAA'));
});
describe('isValidCode', () => {
  test('accepts valid', () => expect(isValidCode('ABC2D9')).toBe(true));
  test('rejects excluded chars', () => expect(isValidCode('ABC0D9')).toBe(false));
});
describe('newId', () => {
  test('8 lowercase chars', () => expect(newId()).toMatch(/^[abcdefghjkmnpqrstuvwxyz23456789]{8}$/));
});
