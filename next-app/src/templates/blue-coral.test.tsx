import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type React from 'react';
import { BlueCoral } from './BlueCoral';
import { blueCoralDefaultEnabledSections } from './blue-coral.sections';
import { blueCoralFixture } from './__fixtures__/blue-coral.fixture';

function render(props: React.ComponentProps<typeof BlueCoral>) {
  return renderToStaticMarkup(<BlueCoral {...props} />);
}

// `sticky top-0 z-50` is the TopBar-only sticky-header shell; proves it's mounted or not.
const TOP_BAR_MARKER = 'sticky top-0 z-50';

describe('BlueCoral enabled_sections', () => {
  it('renders every section by default (enabledSections omitted)', () => {
    const html = render({
      content: blueCoralFixture,
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).toContain('blue-coral-root');
    expect(html).toContain(blueCoralFixture.hero.headline);
    expect(html).toContain(blueCoralFixture.closing.headline);
    expect(html).toContain(blueCoralFixture.faqs[0].question);
    expect(html).toContain(blueCoralFixture.footer.copyright);
    expect(html).toContain(TOP_BAR_MARKER);
  });

  it('omits FAQ when excluded from enabledSections', () => {
    const enabled = blueCoralDefaultEnabledSections.filter((k) => k !== 'faq');
    const html = render({
      content: blueCoralFixture,
      enabledSections: [...enabled],
      speakers: {},
      funnelId: 'funnel-1',
    });
    for (const faq of blueCoralFixture.faqs) {
      expect(html).not.toContain(faq.question);
    }
  });

  it('omits closing-cta when excluded from enabledSections', () => {
    const enabled = blueCoralDefaultEnabledSections.filter((k) => k !== 'closing-cta');
    const html = render({
      content: blueCoralFixture,
      enabledSections: [...enabled],
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).not.toContain(blueCoralFixture.closing.headline);
  });

  it('omits footer when excluded from enabledSections', () => {
    const enabled = blueCoralDefaultEnabledSections.filter((k) => k !== 'footer');
    const html = render({
      content: blueCoralFixture,
      enabledSections: [...enabled],
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).not.toContain(blueCoralFixture.footer.copyright);
  });

  it('omits top-bar when excluded from enabledSections', () => {
    const enabled = blueCoralDefaultEnabledSections.filter((k) => k !== 'top-bar');
    const html = render({
      content: blueCoralFixture,
      enabledSections: [...enabled],
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).not.toContain(TOP_BAR_MARKER);
  });
});
