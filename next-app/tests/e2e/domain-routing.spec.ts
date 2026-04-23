import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

/**
 * End-to-end check of the multi-domain public route: a request to
 * `http://localhost:3000/{funnel-slug}` with a forwarded host header should
 * resolve Domain → Summit → Funnel → Step and render the matching template.
 *
 * The test queries the local DB at setup time for one active funnel hung off
 * a known Domain so the spec stays in sync with whatever is seeded.
 */

type Fixture = { host: string; funnelSlug: string; templateKey: string } | null;

function seededFunnelForHost(): Fixture {
  try {
    const repoRoot = resolve(__dirname, '../../..');
    const php = 'test:pick-public-funnel';
    const raw = execFileSync('php', ['artisan', php, '--no-interaction'], {
      cwd: repoRoot,
      encoding: 'utf8',
    });
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start < 0 || end <= start) return null;
    const parsed = JSON.parse(raw.slice(start, end + 1));
    if (parsed.host && parsed.funnelSlug && parsed.templateKey) return parsed;
    return null;
  } catch {
    return null;
  }
}

const fixture = seededFunnelForHost();

test.describe('host-based public routing', () => {
  test('renders the funnel for a matching host + slug', async ({ page, request: _r }, testInfo) => {
    test.skip(!fixture, 'no active funnel with a domain to test against');
    if (!fixture) return;

    // Next's dev server reads Host off the wire, so setting it via the
    // playwright extraHTTPHeaders context works for the document request.
    await page.setExtraHTTPHeaders({ 'x-forwarded-host': fixture.host });

    await page.goto(`/${fixture.funnelSlug}`);

    // Each template paints a root with its key in the class name —
    // `.cream-sage-root`, `.violet-sun-root`, etc. We can assert on
    // `[class*="${templateKey}-root"]` without hard-coding each.
    const rootSelector = `[class*="${fixture.templateKey}-root"]`;
    await expect(page.locator(rootSelector).first()).toBeVisible({ timeout: 15_000 });

    testInfo.annotations.push({ type: 'resolved', description: `${fixture.host} /${fixture.funnelSlug} → ${fixture.templateKey}` });
  });

  test('404s for a funnel slug that does not belong to the host', async ({ page }) => {
    test.skip(!fixture, 'no active funnel with a domain to test against');
    if (!fixture) return;

    await page.setExtraHTTPHeaders({ 'x-forwarded-host': fixture.host });
    const response = await page.goto('/this-funnel-does-not-exist-anywhere');
    expect(response?.status()).toBe(404);
  });

  test('404s for an unknown host', async ({ page }) => {
    test.skip(!fixture, 'no active funnel with a domain to test against');
    if (!fixture) return;

    await page.setExtraHTTPHeaders({ 'x-forwarded-host': 'definitely-not-a-real-host.example' });
    const response = await page.goto(`/${fixture.funnelSlug}`);
    expect(response?.status()).toBe(404);
  });
});
