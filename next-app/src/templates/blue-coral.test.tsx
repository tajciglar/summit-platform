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

describe('BlueCoral image slots', () => {
  const sidecar = (id: string, url: string, alt: string) => ({
    id,
    url,
    alt,
    width: 800,
    height: 600,
  });
  type Content = React.ComponentProps<typeof BlueCoral>['content'];

  it('renders hero lifestyle <img> when sidecar present', () => {
    const html = render({
      content: {
        ...blueCoralFixture,
        hero: {
          ...blueCoralFixture.hero,
          lifestyleImage: sidecar('1', 'https://cdn.test/lifestyle.jpg', 'Lifestyle'),
        },
      } as Content,
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).toContain('data-testid="blue-coral-hero-lifestyle"');
    expect(html).toContain('src="https://cdn.test/lifestyle.jpg"');
  });

  it('renders overview feature <img> when sidecar present and hides default illustration', () => {
    const html = render({
      content: {
        ...blueCoralFixture,
        overview: {
          ...blueCoralFixture.overview,
          featureImage: sidecar('2', 'https://cdn.test/overview.jpg', 'Overview'),
        },
      } as Content,
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).toContain('data-testid="blue-coral-overview-feature"');
    expect(html).not.toContain(blueCoralFixture.overview.illustrationCaption);
  });

  it('renders per-bonus thumbnail only for items with a sidecar', () => {
    const html = render({
      content: {
        ...blueCoralFixture,
        bonuses: {
          ...blueCoralFixture.bonuses,
          items: blueCoralFixture.bonuses.items.map((b, i) =>
            i === 0
              ? { ...b, thumbnail: sidecar(`b-${i}`, `https://cdn.test/bonus-${i}.jpg`, b.title) }
              : b,
          ),
        },
      } as Content,
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).toContain('data-testid="blue-coral-bonus-thumbnail-0"');
    expect(html).not.toContain('data-testid="blue-coral-bonus-thumbnail-1"');
  });

  it('renders founder photo when present and keeps initials fallback otherwise', () => {
    const html = render({
      content: {
        ...blueCoralFixture,
        founders: {
          ...blueCoralFixture.founders,
          items: blueCoralFixture.founders.items.map((f, i) =>
            i === 0
              ? { ...f, photo: sidecar(`f-${i}`, `https://cdn.test/founder-${i}.jpg`, f.name) }
              : f,
          ),
        },
      } as Content,
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).toContain('data-testid="blue-coral-founder-photo-0"');
    expect(html).toContain(blueCoralFixture.founders.items[1].initials);
  });

  it('renders footer logo when sidecar present', () => {
    const html = render({
      content: {
        ...blueCoralFixture,
        footer: {
          ...blueCoralFixture.footer,
          logo: sidecar('3', 'https://cdn.test/logo.svg', 'Brand'),
        },
      } as Content,
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).toContain('data-testid="blue-coral-footer-logo"');
  });

  it('omits all image elements when fixture has no sidecars', () => {
    const html = render({
      content: blueCoralFixture,
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).not.toContain('blue-coral-hero-lifestyle');
    expect(html).not.toContain('blue-coral-overview-feature');
    expect(html).not.toContain('blue-coral-bonus-thumbnail');
    expect(html).not.toContain('blue-coral-founder-photo');
    expect(html).not.toContain('blue-coral-footer-logo');
  });
});
