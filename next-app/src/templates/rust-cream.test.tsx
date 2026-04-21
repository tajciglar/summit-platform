import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type React from 'react';
import { RustCream } from './RustCream';
import { rustCreamDefaultEnabledSections } from './rust-cream.sections';
import { rustCreamFixture } from './__fixtures__/rust-cream.fixture';

function render(props: React.ComponentProps<typeof RustCream>) {
  return renderToStaticMarkup(<RustCream {...props} />);
}

// `sticky top-0 z-50` is the TopBar-only sticky-header shell; proves it's mounted or not.
const TOP_BAR_MARKER = 'sticky top-0 z-50';

describe('RustCream enabled_sections', () => {
  it('renders every section by default (enabledSections omitted)', () => {
    const html = render({
      content: rustCreamFixture,
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).toContain('rust-cream-root');
    expect(html).toContain(rustCreamFixture.hero.headline);
    expect(html).toContain(rustCreamFixture.closing.headline);
    expect(html).toContain(rustCreamFixture.faqs[0].question);
    expect(html).toContain(rustCreamFixture.footer.copyright);
    expect(html).toContain(TOP_BAR_MARKER);
  });

  it('omits FAQ when excluded from enabledSections', () => {
    const enabled = rustCreamDefaultEnabledSections.filter((k) => k !== 'faq');
    const html = render({
      content: rustCreamFixture,
      enabledSections: [...enabled],
      speakers: {},
      funnelId: 'funnel-1',
    });
    for (const faq of rustCreamFixture.faqs) {
      expect(html).not.toContain(faq.question);
    }
  });

  it('omits closing-cta when excluded from enabledSections', () => {
    const enabled = rustCreamDefaultEnabledSections.filter((k) => k !== 'closing-cta');
    const html = render({
      content: rustCreamFixture,
      enabledSections: [...enabled],
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).not.toContain(rustCreamFixture.closing.headline);
  });

  it('omits footer when excluded from enabledSections', () => {
    const enabled = rustCreamDefaultEnabledSections.filter((k) => k !== 'footer');
    const html = render({
      content: rustCreamFixture,
      enabledSections: [...enabled],
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).not.toContain(rustCreamFixture.footer.copyright);
  });

  it('omits top-bar when excluded from enabledSections', () => {
    const enabled = rustCreamDefaultEnabledSections.filter((k) => k !== 'top-bar');
    const html = render({
      content: rustCreamFixture,
      enabledSections: [...enabled],
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).not.toContain(TOP_BAR_MARKER);
  });
});
