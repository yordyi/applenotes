import { defineConfig, devices } from '@playwright/test'

const PORT = 3123

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
      testIgnore: /mobile/,
    },
    {
      name: 'iphone',
      use: { ...devices['iPhone 13'], browserName: 'chromium' },
      testMatch: /mobile/,
    },
  ],
  // Tests run against the production build: `npm run build` first.
  webServer: {
    command: `npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
})
