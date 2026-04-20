'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:8000';
const VIDEO_DIR = path.join(__dirname);
const OUTPUT_NAME = 'demo-landing-preview.webm';
const REHEARSAL = process.argv.includes('--rehearse');
const DISCOVER = process.argv.includes('--discover');

// --- Helpers ---

async function injectCursor(page) {
  await page.evaluate(() => {
    if (document.getElementById('demo-cursor')) return;
    const cursor = document.createElement('div');
    cursor.id = 'demo-cursor';
    // Use DOM API to build SVG safely
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', 'M5 3L19 12L12 13L9 20L5 3Z');
    p.setAttribute('fill', 'white');
    p.setAttribute('stroke', 'black');
    p.setAttribute('stroke-width', '1.5');
    p.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(p);
    cursor.appendChild(svg);
    cursor.style.cssText = `
      position: fixed; z-index: 999999; pointer-events: none;
      width: 24px; height: 24px;
      transition: left 0.1s, top 0.1s;
      filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.3));
    `;
    cursor.style.left = '0px';
    cursor.style.top = '0px';
    document.body.appendChild(cursor);
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
  });
}

async function injectSubtitleBar(page) {
  await page.evaluate(() => {
    if (document.getElementById('demo-subtitle')) return;
    const bar = document.createElement('div');
    bar.id = 'demo-subtitle';
    bar.style.cssText = `
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 999998;
      text-align: center; padding: 12px 24px;
      background: rgba(0, 0, 0, 0.75);
      color: white; font-family: -apple-system, "Segoe UI", sans-serif;
      font-size: 16px; font-weight: 500; letter-spacing: 0.3px;
      transition: opacity 0.3s;
      pointer-events: none;
    `;
    bar.textContent = '';
    bar.style.opacity = '0';
    document.body.appendChild(bar);
  });
}

async function showSubtitle(page, text) {
  await page.evaluate((t) => {
    const bar = document.getElementById('demo-subtitle');
    if (!bar) return;
    if (t) {
      bar.textContent = t;
      bar.style.opacity = '1';
    } else {
      bar.style.opacity = '0';
    }
  }, text);
  if (text) await page.waitForTimeout(800);
}

async function smoothScroll(page, targetY, duration = 1500) {
  await page.evaluate(({ y }) => {
    window.scrollTo({ top: y, behavior: 'smooth' });
  }, { y: targetY });
  await page.waitForTimeout(duration);
}

async function ensureVisible(page, locator, label) {
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator;
  const visible = await el.isVisible().catch(() => false);
  if (!visible) {
    console.error(`REHEARSAL FAIL: "${label}" not found`);
    return false;
  }
  console.log(`REHEARSAL OK: "${label}"`);
  return true;
}

// --- Main ---

(async () => {
  const browser = await chromium.launch({ headless: true });

  // DISCOVER
  if (DISCOVER) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/storage/generated-preview.html`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    const info = await page.evaluate(() => {
      const root = document.getElementById('root');
      if (!root) return { error: 'No #root element found' };
      return {
        totalHeight: document.body.scrollHeight,
        viewHeight: window.innerHeight,
        scrollPages: Math.ceil(document.body.scrollHeight / window.innerHeight),
        topLevelChildren: root.children.length,
        bodyText: document.body.innerText.substring(0, 500),
      };
    });
    console.log('DISCOVER:', JSON.stringify(info, null, 2));
    await browser.close();
    return;
  }

  // REHEARSE
  if (REHEARSAL) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/storage/generated-preview.html`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000);
    let allOk = true;
    if (!await ensureVisible(page, '#root', 'React root')) allOk = false;
    const hasContent = await page.evaluate(() => {
      const root = document.getElementById('root');
      return root && root.children.length > 0 && root.innerText.length > 100;
    });
    if (!hasContent) {
      console.error('REHEARSAL FAIL: React did not render content');
      allOk = false;
    } else {
      console.log('REHEARSAL OK: React rendered content');
    }
    const height = await page.evaluate(() => document.body.scrollHeight);
    console.log(`Page height: ${height}px (${Math.ceil(height / 720)} scroll pages)`);
    if (allOk) console.log('REHEARSAL PASSED');
    else { console.error('REHEARSAL FAILED'); process.exit(1); }
    await browser.close();
    return;
  }

  // RECORD
  const context = await browser.newContext({
    recordVideo: { dir: VIDEO_DIR, size: { width: 1280, height: 720 } },
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

  try {
    await page.goto(`${BASE_URL}/storage/generated-preview.html`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000);
    await injectCursor(page);
    await injectSubtitleBar(page);

    const totalHeight = await page.evaluate(() => document.body.scrollHeight);
    const scrollSteps = Math.ceil(totalHeight / 500);

    const sectionLabels = [
      'Sticky Countdown Bar',
      'Hero with Countdown Timer',
      'Social Proof Badges',
      'Stats Bar',
      'Feature with Image',
      'Speaker Grid by Day',
      'Bonus Stack',
      'Closing CTA with List',
      'FAQ Accordion',
      'Footer',
    ];

    await showSubtitle(page, 'AI-Generated Landing Page — ADHD Parenting Summit 2026');
    await page.waitForTimeout(3000);
    await page.mouse.move(640, 200, { steps: 10 });
    await page.waitForTimeout(1000);
    await showSubtitle(page, 'Generated with Gemini 2.5 Flash from reference PNGs');
    await page.waitForTimeout(2500);

    let currentLabelIdx = -1;
    for (let step = 0; step <= scrollSteps; step++) {
      const y = step * 500;
      const labelIdx = Math.min(
        Math.floor((y / totalHeight) * sectionLabels.length),
        sectionLabels.length - 1
      );
      if (labelIdx !== currentLabelIdx) {
        currentLabelIdx = labelIdx;
        await showSubtitle(page, `Section ${labelIdx + 1}: ${sectionLabels[labelIdx]}`);
      }
      await smoothScroll(page, y, 1200);
      await page.mouse.move(400 + (step % 3) * 150, 300 + (step % 2) * 100, { steps: 8 });
      await page.waitForTimeout(800);
    }

    await showSubtitle(page, 'Complete landing page — 10 sections generated in ~5 minutes');
    await page.waitForTimeout(3000);
    await showSubtitle(page, '');
    await smoothScroll(page, 0, 2000);
    await page.waitForTimeout(2000);

  } catch (err) {
    console.error('DEMO ERROR:', err.message);
  } finally {
    await context.close();
    const video = page.video();
    if (video) {
      const src = await video.path();
      const dest = path.join(VIDEO_DIR, OUTPUT_NAME);
      try {
        fs.copyFileSync(src, dest);
        console.log('Video saved:', dest);
      } catch (e) {
        console.error('ERROR: Failed to copy video:', e.message);
      }
    }
    await browser.close();
  }
})();
