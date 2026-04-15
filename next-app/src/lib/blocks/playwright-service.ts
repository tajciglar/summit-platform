import { chromium } from 'playwright';

export interface ScreenshotResult {
  base64: string;
  mime: 'image/png';
  width: number;
  height: number;
}

export async function screenshotUrl(
  url: string,
  opts: { width?: number; height?: number; timeoutMs?: number } = {},
): Promise<ScreenshotResult> {
  const { width = 1440, height = 900, timeoutMs = 30_000 } = opts;
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto(url, { waitUntil: 'networkidle', timeout: timeoutMs });
    // Scroll to trigger lazy assets, then back to top so the screenshot
    // captures the above-the-fold + hero state that sets visual tone.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    const buf = await page.screenshot({ type: 'png', fullPage: false });
    return { base64: buf.toString('base64'), mime: 'image/png', width, height };
  } finally {
    await browser.close();
  }
}
