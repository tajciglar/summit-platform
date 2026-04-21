import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type React from 'react';
import { LimeInk } from './LimeInk';
import { limeInkDefaultEnabledSections } from './lime-ink.sections';
import { limeInkFixture } from './__fixtures__/lime-ink.fixture';

function render(props: React.ComponentProps<typeof LimeInk>) {
  return renderToStaticMarkup(<LimeInk {...props} />);
}

describe('LimeInk enabled_sections', () => {
  it('renders every section by default (enabledSections omitted)', () => {
    const html = render({
      content: limeInkFixture,
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).toContain('lime-ink-root');
    expect(html).toContain(limeInkFixture.hero.headlineAccent);
    expect(html).toContain(limeInkFixture.closing.headline);
    expect(html).toContain(limeInkFixture.faqs[0].question);
    expect(html).toContain(limeInkFixture.footer.brandName);
  });

  it('omits FAQ when excluded from enabledSections', () => {
    const enabled = limeInkDefaultEnabledSections.filter((k) => k !== 'faq');
    const html = render({
      content: limeInkFixture,
      enabledSections: [...enabled],
      speakers: {},
      funnelId: 'funnel-1',
    });
    for (const faq of limeInkFixture.faqs) {
      expect(html).not.toContain(faq.question);
    }
  });

  it('omits closing-cta when excluded from enabledSections', () => {
    const enabled = limeInkDefaultEnabledSections.filter((k) => k !== 'closing-cta');
    const html = render({
      content: limeInkFixture,
      enabledSections: [...enabled],
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).not.toContain(limeInkFixture.closing.headline);
  });

  it('omits footer when excluded from enabledSections', () => {
    const enabled = limeInkDefaultEnabledSections.filter((k) => k !== 'footer');
    const html = render({
      content: limeInkFixture,
      enabledSections: [...enabled],
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).not.toContain(limeInkFixture.footer.copyright);
  });

  it('omits top-bar when excluded from enabledSections', () => {
    const enabled = limeInkDefaultEnabledSections.filter((k) => k !== 'top-bar');
    const html = render({
      content: limeInkFixture,
      enabledSections: [...enabled],
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).not.toContain(limeInkFixture.topBar.statusPill);
  });
});
