import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

type Steps = Record<string, { optin?: string; sales_page?: string }>;
const steps: Steps = JSON.parse(
  readFileSync(resolve(__dirname, 'fixtures/steps.json'), 'utf8'),
);

const creamSageId = steps['cream-sage']?.optin ?? steps['cream-sage']?.sales_page;

test.describe('design tokens round-trip (CreamSage)', () => {
  test.skip(!creamSageId, 'no seeded cream-sage step');

  test('postMessage tokens override primary color on the root', async ({ page }) => {
    await page.goto(`/preview/step/${creamSageId}?inline=1`);
    const root = page.locator('.cream-sage-root').first();
    await expect(root).toBeVisible({ timeout: 15_000 });

    // Baseline: no --cs-primary inline style should be set on the root
    // before we override it.
    const baseline = await root.evaluate((el) => getComputedStyle(el).getPropertyValue('--cs-primary').trim());
    // stylesheet fallback is #C4663D
    expect(baseline.toLowerCase()).toBe('#c4663d');

    // Send a tokens update via postMessage exactly like the Filament bridge.
    await page.evaluate(() => {
      window.postMessage(
        {
          type: 'step-preview-update',
          tokens: { palette: { primary: '#112233' }, headingFont: 'Inter' },
        },
        '*',
      );
    });

    // Wait for the override to land.
    await expect
      .poll(
        () => root.evaluate((el) => getComputedStyle(el).getPropertyValue('--cs-primary').trim()),
        { timeout: 4_000 },
      )
      .toBe('#112233');

    const headingFont = await root.evaluate((el) => getComputedStyle(el).getPropertyValue('--heading-font').trim());
    expect(headingFont.toLowerCase()).toContain('inter');
  });

  test('CTA button reflects primary color override', async ({ page }) => {
    await page.goto(`/preview/step/${creamSageId}?inline=1`);
    const root = page.locator('.cream-sage-root').first();
    await expect(root).toBeVisible({ timeout: 15_000 });

    // Wait for React hydration + the shell's message listener to mount by
    // confirming the template default is readable before we try to change it.
    await expect
      .poll(() => root.evaluate((el) => getComputedStyle(el).getPropertyValue('--cs-primary').trim()), { timeout: 5_000 })
      .toBe('#c4663d');

    await page.evaluate(() => {
      window.postMessage(
        { type: 'step-preview-update', tokens: { palette: { primary: '#ff00aa' } } },
        '*',
      );
    });

    // Wait for the root inline style to reflect the override first — that is
    // what proves the React state update actually re-rendered the tree.
    await expect
      .poll(
        () => root.evaluate((el) => getComputedStyle(el).getPropertyValue('--cs-primary').trim()),
        { timeout: 4_000 },
      )
      .toBe('#ff00aa');

    // Then read the button background. Re-query each poll to avoid any stale
    // element handle after re-render.
    await expect
      .poll(
        () => page.evaluate(() => {
          const btn = document.querySelector('.cream-sage-btn-primary');
          return btn ? getComputedStyle(btn).backgroundColor : null;
        }),
        { timeout: 4_000 },
      )
      .toBe('rgb(255, 0, 170)');
  });

  test('inline-edit message posts back with new text', async ({ page }) => {
    await page.goto(`/preview/step/${creamSageId}?inline=1`);
    const editable = page.locator('[data-edit-path="hero.headlineLead"]').first();
    await expect(editable).toBeVisible({ timeout: 15_000 });

    // In a top-level preview tab `window.parent === window`, so the shell's
    // `window.parent.postMessage(...)` dispatches an event on the same window.
    // Install the listener from test context then trigger the edit.
    await page.evaluate(() => {
      (window as unknown as { __captured?: unknown }).__captured = null;
      window.addEventListener('message', (e: MessageEvent) => {
        if (e.data?.type === 'inline-edit') {
          (window as unknown as { __captured?: unknown }).__captured = e.data;
        }
      });
    });

    await editable.focus();
    await editable.evaluate((el) => {
      (el as HTMLElement).textContent = 'Hello visual editor';
    });
    await editable.blur();

    await expect
      .poll(() => page.evaluate(() => (window as unknown as { __captured?: unknown }).__captured), { timeout: 4_000 })
      .toMatchObject({
        type: 'inline-edit',
        path: 'hero.headlineLead',
        value: 'Hello visual editor',
      });
  });
});
