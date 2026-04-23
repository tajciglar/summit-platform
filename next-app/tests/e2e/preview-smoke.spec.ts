import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

type Steps = Record<string, { optin?: string; sales_page?: string }>;

const stepsPath = resolve(__dirname, 'fixtures/steps.json');
const steps: Steps = JSON.parse(readFileSync(stepsPath, 'utf8'));

const TEMPLATES = [
  'cream-sage',
  'blue-coral',
  'green-gold',
  'indigo-gold',
  'lime-ink',
  'ochre-ink',
  'rust-cream',
  'violet-sun',
] as const;

test.describe('preview renders clean — every template', () => {
  for (const tpl of TEMPLATES) {
    const id = steps[tpl]?.optin ?? steps[tpl]?.sales_page;
    test(`${tpl} preview renders without console errors`, async ({ page }) => {
      test.skip(!id, `no seeded step for template "${tpl}"`);
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
      });
      await page.goto(`/preview/step/${id}`);
      // Wait for the template root to paint.
      await expect(page.locator('main, [class*="-root"]').first()).toBeVisible({ timeout: 15_000 });
      expect(errors, `unexpected runtime errors in ${tpl}`).toEqual([]);
    });
  }
});
