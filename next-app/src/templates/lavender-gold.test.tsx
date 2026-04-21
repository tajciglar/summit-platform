import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type React from 'react';
import { LavenderGold } from './LavenderGold';
import { lavenderGoldDefaultEnabledSections } from './lavender-gold.sections';
import { lavenderGoldFixture } from './__fixtures__/lavender-gold.fixture';

function render(props: React.ComponentProps<typeof LavenderGold>) {
  return renderToStaticMarkup(<LavenderGold {...props} />);
}

// TopBar-only sticky-header shell; proves top-bar is mounted or not.
const TOP_BAR_MARKER = 'position:sticky';

describe('LavenderGold enabled_sections', () => {
  it('renders every section by default (enabledSections omitted)', () => {
    const html = render({
      content: lavenderGoldFixture,
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).toContain(lavenderGoldFixture.topBar.name);
    expect(html).toContain(lavenderGoldFixture.intro.headline);
    expect(html).toContain(lavenderGoldFixture.comparisonTable.headline);
    expect(html).toContain(lavenderGoldFixture.guarantee.heading);
    expect(html).toContain(lavenderGoldFixture.whySection.headline);
    expect(html).toContain(lavenderGoldFixture.footer.copyright);
    expect(html).toContain(TOP_BAR_MARKER);
  });

  it('omits comparison-table when excluded from enabledSections', () => {
    const enabled = lavenderGoldDefaultEnabledSections.filter((k) => k !== 'comparison-table');
    const html = render({
      content: lavenderGoldFixture,
      enabledSections: [...enabled],
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).not.toContain(lavenderGoldFixture.comparisonTable.headline);
  });

  it('omits guarantee when excluded from enabledSections', () => {
    const enabled = lavenderGoldDefaultEnabledSections.filter((k) => k !== 'guarantee');
    const html = render({
      content: lavenderGoldFixture,
      enabledSections: [...enabled],
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).not.toContain(lavenderGoldFixture.guarantee.heading);
  });

  it('omits footer when excluded from enabledSections', () => {
    const enabled = lavenderGoldDefaultEnabledSections.filter((k) => k !== 'footer');
    const html = render({
      content: lavenderGoldFixture,
      enabledSections: [...enabled],
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).not.toContain(lavenderGoldFixture.footer.copyright);
  });

  it('omits top-bar when excluded from enabledSections', () => {
    const enabled = lavenderGoldDefaultEnabledSections.filter((k) => k !== 'top-bar');
    const html = render({
      content: lavenderGoldFixture,
      enabledSections: [...enabled],
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).not.toContain(TOP_BAR_MARKER);
  });
});
