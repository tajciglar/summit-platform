import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'node:url';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src')
    }
  },
  test: {
    // Playwright e2e specs (tests/e2e) talk to @playwright/test directly
    // and are not runnable under vitest.
    exclude: ['**/node_modules/**', '**/dist/**', 'tests/e2e/**'],
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  }
});
