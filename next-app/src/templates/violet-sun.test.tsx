import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type React from 'react';
import { VioletSun } from './VioletSun';
import { violetSunDefaultEnabledSections } from './violet-sun.sections';
import { violetSunFixture } from './__fixtures__/violet-sun.fixture';

function render(props: React.ComponentProps<typeof VioletSun>) {
  return renderToStaticMarkup(<VioletSun {...props} />);
}

// `sticky top-0 z-40` is the TopBar-only sticky-header shell; proves it's mounted or not.
const TOP_BAR_MARKER = 'sticky top-0 z-40';

describe('VioletSun enabled_sections', () => {
  it('renders every section by default (enabledSections omitted)', () => {
    const html = render({
      content: violetSunFixture,
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).toContain('violet-sun-root');
    expect(html).toContain(violetSunFixture.hero.headlineAccent);
    expect(html).toContain(violetSunFixture.closing.eyebrow);
    expect(html).toContain(violetSunFixture.faqs[0].question);
    expect(html).toContain(violetSunFixture.footer.copyright);
    expect(html).toContain(TOP_BAR_MARKER);
  });

  it('omits FAQ when excluded from enabledSections', () => {
    const enabled = violetSunDefaultEnabledSections.filter((k) => k !== 'faq');
    const html = render({
      content: violetSunFixture,
      enabledSections: [...enabled],
      speakers: {},
      funnelId: 'funnel-1',
    });
    for (const faq of violetSunFixture.faqs) {
      expect(html).not.toContain(faq.question);
    }
  });

  it('omits closing-cta when excluded from enabledSections', () => {
    const enabled = violetSunDefaultEnabledSections.filter((k) => k !== 'closing-cta');
    const html = render({
      content: violetSunFixture,
      enabledSections: [...enabled],
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).not.toContain(violetSunFixture.closing.eyebrow);
  });

  it('omits footer when excluded from enabledSections', () => {
    const enabled = violetSunDefaultEnabledSections.filter((k) => k !== 'footer');
    const html = render({
      content: violetSunFixture,
      enabledSections: [...enabled],
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).not.toContain(violetSunFixture.footer.copyright);
  });

  it('omits top-bar when excluded from enabledSections', () => {
    const enabled = violetSunDefaultEnabledSections.filter((k) => k !== 'top-bar');
    const html = render({
      content: violetSunFixture,
      enabledSections: [...enabled],
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).not.toContain(TOP_BAR_MARKER);
  });
});
