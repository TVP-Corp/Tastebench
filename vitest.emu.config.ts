import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/emu/**/*.test.ts'],
    env: { VITE_USE_EMULATOR: 'true' },
    fileParallelism: false,
  },
})
