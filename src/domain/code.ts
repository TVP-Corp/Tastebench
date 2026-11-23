export const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function randomChars(n: number, random: () => number): string {
  let out = ''
  for (let i = 0; i < n; i++) {
    out += CODE_ALPHABET[Math.min(CODE_ALPHABET.length - 1, Math.floor(random() * CODE_ALPHABET.length))]
  }
  return out
}

export function generateCode(random: () => number = Math.random): string {
  return randomChars(6, random)
}

export function normalizeCode(input: string): string {
  return input.replace(/\s+/g, '').toUpperCase()
}

export function isValidCode(code: string): boolean {
  return new RegExp(`^[${CODE_ALPHABET}]{6}$`).test(code)
}

export function newId(): string {
  return randomChars(8, Math.random).toLowerCase()
}
