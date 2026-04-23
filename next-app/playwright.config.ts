import { defineConfig } from '@playwright/test';

/**
 * Playwright runs against a locally-running Next dev server + Laravel API.
 * Start them first:
 *
 *   # terminal 1
 *   cd ..
 *   composer dev
 *
 *   # terminal 2
 *   cd next-app
 *   pnpm dev
 *
 *   # terminal 3
 *   cd next-app
 *   pnpm exec playwright test
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  retries: 0,
  reporter: [['list']],
  globalSetup: './tests/e2e/global-setup.ts',
  use: {
    baseURL: process.env.NEXT_BASE ?? 'http://localhost:3000',
    headless: true,
    viewport: { width: 1280, height: 900 },
    trace: 'on-first-retry',
  },
});
