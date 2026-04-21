import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type React from 'react';
import { GreenGold } from './GreenGold';
import { greenGoldDefaultEnabledSections } from './green-gold.sections';
import { greenGoldFixture } from './__fixtures__/green-gold.fixture';

function render(props: React.ComponentProps<typeof GreenGold>) {
  return renderToStaticMarkup(<GreenGold {...props} />);
}

// `sticky top-0 z-50` is the TopBar-only sticky-header shell; proves it's mounted or not.
const TOP_BAR_MARKER = 'sticky top-0 z-50';

describe('GreenGold enabled_sections', () => {
  it('renders every section by default (enabledSections omitted)', () => {
    const html = render({
      content: greenGoldFixture,
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).toContain('green-gold-root');
    expect(html).toContain(greenGoldFixture.hero.headline);
    expect(html).toContain(greenGoldFixture.closing.headline);
    expect(html).toContain(greenGoldFixture.faqs[0].question);
    expect(html).toContain(greenGoldFixture.footer.copyright);
    expect(html).toContain(TOP_BAR_MARKER);
  });

  it('omits FAQ when excluded from enabledSections', () => {
    const enabled = greenGoldDefaultEnabledSections.filter((k) => k !== 'faq');
    const html = render({
      content: greenGoldFixture,
      enabledSections: [...enabled],
      speakers: {},
      funnelId: 'funnel-1',
    });
    for (const faq of greenGoldFixture.faqs) {
      expect(html).not.toContain(faq.question);
    }
  });

  it('omits closing-cta when excluded from enabledSections', () => {
    const enabled = greenGoldDefaultEnabledSections.filter((k) => k !== 'closing-cta');
    const html = render({
      content: greenGoldFixture,
      enabledSections: [...enabled],
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).not.toContain(greenGoldFixture.closing.headline);
  });

  it('omits footer when excluded from enabledSections', () => {
    const enabled = greenGoldDefaultEnabledSections.filter((k) => k !== 'footer');
    const html = render({
      content: greenGoldFixture,
      enabledSections: [...enabled],
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).not.toContain(greenGoldFixture.footer.copyright);
  });

  it('omits top-bar when excluded from enabledSections', () => {
    const enabled = greenGoldDefaultEnabledSections.filter((k) => k !== 'top-bar');
    const html = render({
      content: greenGoldFixture,
      enabledSections: [...enabled],
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).not.toContain(TOP_BAR_MARKER);
  });
});
