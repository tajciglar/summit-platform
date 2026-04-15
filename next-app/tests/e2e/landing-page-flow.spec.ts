/**
 * End-to-end smoke for the landing-page quality pipeline.
 *
 * Not meant for CI — real Gemini calls and real Playwright browsers. Run
 * manually against a local dev server:
 *
 *   TEST_ADMIN_EMAIL=test@example.com \
 *   TEST_ADMIN_PASSWORD=password \
 *   npx playwright test tests/e2e/landing-page-flow.spec.ts
 *
 * Assumes `php artisan serve` on :8000 and `pnpm dev` on :3000.
 */
import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL ?? 'test@example.com';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? 'password';
const LARAVEL_BASE = process.env.LARAVEL_BASE ?? 'http://localhost:8000';
const STYLE_URL = process.env.STYLE_REF_URL ?? 'https://parenting-summits.com';

test.describe('landing-page quality flow', () => {
  test('build style brief → ready status on summit', async ({ page }) => {
    // 1) Login
    await page.goto(`${LARAVEL_BASE}/admin/login`);
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin/);

    // 2) Open first summit
    await page.goto(`${LARAVEL_BASE}/admin/summits`);
    const firstRow = page.locator('table tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 10_000 });
    await firstRow.click();

    // 3) Set style_reference_url if empty, save
    const urlInput = page.locator('input[wire\\:model*="style_reference_url"], input[name="style_reference_url"]').first();
    await urlInput.scrollIntoViewIfNeeded();
    const current = await urlInput.inputValue().catch(() => '');
    if (!current) {
      await urlInput.fill(STYLE_URL);
      await page.getByRole('button', { name: /^Save$/i }).click();
      await page.waitForTimeout(500);
    }

    // 4) Click "Build Style Brief"
    const buildBtn = page.getByRole('button', { name: /Build Style Brief/i });
    await expect(buildBtn).toBeVisible();
    await buildBtn.click();
    // confirm modal
    await page.getByRole('button', { name: /Confirm|Build|Continue/i }).click().catch(() => {});

    // 5) Poll the page up to 3 minutes for the "ready" status label
    let ready = false;
    for (let i = 0; i < 36; i++) {
      await page.reload();
      const statusLabel = page.getByText('ready', { exact: false }).first();
      if (await statusLabel.isVisible().catch(() => false)) {
        ready = true;
        break;
      }
      await page.waitForTimeout(5_000);
    }
    expect(ready, 'style brief should reach ready within 3 minutes').toBe(true);
  });
});
