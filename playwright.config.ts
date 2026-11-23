import { defineConfig, devices } from '@playwright/test'

const PORT = 5199

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 90_000,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    viewport: { width: 390, height: 844 },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } } }],
  webServer: {
    command: `npx vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    env: { VITE_USE_EMULATOR: 'true' },
    reuseExistingServer: false,
  },
})
