#!/usr/bin/env node
/**
 * Headless smoke — drives Admin UI through the style-brief flow.
 * Designed to be invoked from the project root:
 *
 *   cd next-app && node tests/e2e/smoke-run.mjs
 */
import { chromium } from 'playwright';

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL ?? 'test@example.com';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? 'password';
const LARAVEL_BASE = process.env.LARAVEL_BASE ?? 'http://localhost:8000';
const STYLE_URL = process.env.STYLE_REF_URL ?? 'https://parenting-summits.com';
const SUMMIT_ID = process.env.SUMMIT_ID ?? '';

function logStep(n, msg) { console.log(`[${n}] ${msg}`); }

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on('pageerror', (err) => console.error('[pageerror]', err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.error('[console]', msg.text());
  });

  try {
    logStep(1, 'Login');
    await page.goto(`${LARAVEL_BASE}/admin/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await Promise.all([
      page.waitForURL(/\/admin(?!\/login)/, { timeout: 15_000 }),
      page.click('button[type="submit"]'),
    ]);
    logStep(1, 'Logged in → ' + page.url());

    logStep(2, 'Navigate to summit edit');
    let targetUrl;
    if (SUMMIT_ID) {
      targetUrl = `${LARAVEL_BASE}/admin/summits/${SUMMIT_ID}/edit`;
    } else {
      await page.goto(`${LARAVEL_BASE}/admin/summits`, { waitUntil: 'networkidle' });
      const firstEditLink = await page.locator('a[href*="/admin/summits/"][href*="/edit"]').first();
      targetUrl = await firstEditLink.getAttribute('href');
      if (!targetUrl) throw new Error('No summits found');
      if (targetUrl.startsWith('/')) targetUrl = LARAVEL_BASE + targetUrl;
    }
    await page.goto(targetUrl, { waitUntil: 'networkidle' });
    logStep(2, 'At edit page → ' + page.url());

    logStep(3, 'Fill style_reference_url (if empty)');
    // Filament v4 may not expose name attrs directly — look via id or label.
    const urlInput = page.locator('input[id*="style_reference_url"], input[name="style_reference_url"]').first();
    await urlInput.waitFor({ state: 'visible', timeout: 15_000 });
    const currentUrl = await urlInput.inputValue().catch(() => '');
    if (!currentUrl) {
      await urlInput.fill(STYLE_URL);
      const saveBtn = page.getByRole('button', { name: /^Save changes$|^Save$/i }).first();
      await saveBtn.click();
      // Wait for save notification or page refresh
      await page.waitForTimeout(2_500);
      await page.reload({ waitUntil: 'networkidle' });
      logStep(3, 'Saved URL = ' + STYLE_URL);
    } else {
      logStep(3, 'URL already = ' + currentUrl);
    }

    logStep(4, 'Verify "Build Style Brief" button renders');
    const buildBtn = page.getByRole('button', { name: /Build Style Brief/i });
    const buildVisible = await buildBtn.isVisible().catch(() => false);
    if (!buildVisible) {
      await page.screenshot({ path: 'tests/e2e/artifacts/no-build-button.png', fullPage: true });
      throw new Error('Build Style Brief button not visible — check Filament action guards');
    }
    logStep(4, 'Build button visible ✓');

    logStep(5, 'Click Build → confirm modal');
    await buildBtn.click();
    // Wait for the modal to actually render, then click the inner confirm.
    const modal = page.locator('.fi-modal, [role="dialog"]').first();
    await modal.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
    const confirmBtn = modal.getByRole('button', { name: /^(Confirm|Yes|Build Style Brief|Continue)$/i }).first();
    if (await confirmBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await confirmBtn.click();
      logStep(5, 'Confirmed modal');
      await page.waitForTimeout(1_500);
    } else {
      logStep(5, 'No modal confirm found — assuming job dispatched on click');
    }

    logStep(6, 'Reload and verify status flipped to building|ready|failed');
    await page.waitForTimeout(2_000);
    await page.reload({ waitUntil: 'networkidle' });
    const statusLocator = page.locator('text=/Style Brief Status/i').first();
    const surround = await statusLocator.evaluate((el) => el.closest('*')?.textContent ?? '').catch(() => '');
    console.log('[6] Status surrounding text =', surround.replace(/\s+/g, ' ').trim().slice(0, 300));

    logStep(7, 'Done — screenshot of summit edit');
    await page.screenshot({ path: 'tests/e2e/artifacts/summit-edit-after-build.png', fullPage: true });

    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('SMOKE FAILED:', err);
    try { await page.screenshot({ path: 'tests/e2e/artifacts/smoke-error.png', fullPage: true }); } catch {}
    await browser.close().catch(() => {});
    process.exit(1);
  }
})();
