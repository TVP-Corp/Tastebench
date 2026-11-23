import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    exclude: ['tests/emu/**', 'tests/e2e/**', 'node_modules/**'],
    // Vitest blanks CSS by default; src/palette.test.ts reads theme files with `?raw`.
    css: { include: [/\.css\?raw$/] },
  },
})
