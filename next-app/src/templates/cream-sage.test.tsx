import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type React from 'react';
import { CreamSage } from './CreamSage';
import { creamSageDefaultEnabledSections } from './cream-sage.sections';
import { creamSageFixture } from './__fixtures__/cream-sage.fixture';

function render(props: React.ComponentProps<typeof CreamSage>) {
  return renderToStaticMarkup(<CreamSage {...props} />);
}

// `sticky top-0 z-40` is used only on the TopBar <header>; lets the test prove it's mounted (or not).
const TOP_BAR_MARKER = 'sticky top-0 z-40';

describe('CreamSage enabled_sections', () => {
  it('renders every section by default (enabledSections omitted)', () => {
    const html = render({
      content: creamSageFixture,
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).toContain('cream-sage-root');
    expect(html).toContain(creamSageFixture.hero.headlineAccent);
    expect(html).toContain(creamSageFixture.closing.headlineAccent);
    expect(html).toContain(creamSageFixture.faqs[0].question);
    expect(html).toContain(creamSageFixture.footer.copyright);
    expect(html).toContain(TOP_BAR_MARKER);
  });

  it('omits FAQ when excluded from enabledSections', () => {
    const enabled = creamSageDefaultEnabledSections.filter((k) => k !== 'faq');
    const html = render({
      content: creamSageFixture,
      enabledSections: [...enabled],
      speakers: {},
      funnelId: 'funnel-1',
    });
    for (const faq of creamSageFixture.faqs) {
      expect(html).not.toContain(faq.question);
    }
  });

  it('omits closing-cta when excluded from enabledSections', () => {
    const enabled = creamSageDefaultEnabledSections.filter((k) => k !== 'closing-cta');
    const html = render({
      content: creamSageFixture,
      enabledSections: [...enabled],
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).not.toContain(creamSageFixture.closing.headlineAccent);
  });

  it('omits footer when excluded from enabledSections', () => {
    const enabled = creamSageDefaultEnabledSections.filter((k) => k !== 'footer');
    const html = render({
      content: creamSageFixture,
      enabledSections: [...enabled],
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).not.toContain(creamSageFixture.footer.copyright);
  });

  it('omits top-bar when excluded from enabledSections', () => {
    const enabled = creamSageDefaultEnabledSections.filter((k) => k !== 'top-bar');
    const html = render({
      content: creamSageFixture,
      enabledSections: [...enabled],
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).not.toContain(TOP_BAR_MARKER);
  });
});
