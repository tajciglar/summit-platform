import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type React from 'react';
import { IndigoGold } from './IndigoGold';
import { indigoGoldDefaultEnabledSections } from './indigo-gold.sections';
import { indigoGoldFixture } from './__fixtures__/indigo-gold.fixture';
import type { Palette } from '@/lib/palette';

function render(props: React.ComponentProps<typeof IndigoGold>) {
  return renderToStaticMarkup(<IndigoGold {...props} />);
}

describe('IndigoGold enabled_sections', () => {
  it('renders every section by default (enabledSections omitted)', () => {
    const html = render({
      content: indigoGoldFixture,
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).toContain('indigo-gold-root');
    expect(html).toContain(indigoGoldFixture.hero.headline);
    // FAQ + closing CTA + press outlets should all appear in the default render.
    expect(html).toContain(indigoGoldFixture.closing.headline);
    expect(html).toContain(indigoGoldFixture.faqs[0].question);
  });

  it('omits FAQ when excluded from enabledSections', () => {
    const enabled = indigoGoldDefaultEnabledSections.filter((k) => k !== 'faq');
    const html = render({
      content: indigoGoldFixture,
      enabledSections: [...enabled],
      speakers: {},
      funnelId: 'funnel-1',
    });
    // Every FAQ question copy is unique enough to assert absence.
    for (const faq of indigoGoldFixture.faqs) {
      expect(html).not.toContain(faq.question);
    }
  });

  it('omits closing-cta when excluded from enabledSections', () => {
    const enabled = indigoGoldDefaultEnabledSections.filter((k) => k !== 'closing-cta');
    const html = render({
      content: indigoGoldFixture,
      enabledSections: [...enabled],
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).not.toContain(indigoGoldFixture.closing.headline);
  });

  it('applies palette CSS custom properties on the root when provided', () => {
    const palette: Palette = {
      primary: '#5A4589',
      'primary-contrast': '#FFFFFF',
      ink: '#1B132C',
      paper: '#FAF7F2',
      'paper-alt': '#F4F0FB',
      muted: '#6E57A3',
      accent: '#FFD93D',
      border: '#DDD2F0',
    };
    const html = render({
      content: indigoGoldFixture,
      speakers: {},
      funnelId: 'funnel-1',
      palette,
    });
    expect(html).toContain('--primary:#5A4589');
    expect(html).toContain('--paper:#FAF7F2');
  });

  it('omits palette vars when palette is null', () => {
    const html = render({
      content: indigoGoldFixture,
      speakers: {},
      funnelId: 'funnel-1',
      palette: null,
    });
    expect(html).not.toContain('--primary:');
  });
});

describe('IndigoGold image slots', () => {
  it('renders hero <img> when hero.backgroundImage sidecar is present', () => {
    const html = render({
      content: {
        ...indigoGoldFixture,
        hero: {
          ...indigoGoldFixture.hero,
          backgroundImage: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            url: 'https://cdn.example.test/hero-bg.jpg',
            alt: 'Backdrop',
            width: 1920,
            height: 1080,
          },
        },
      } as React.ComponentProps<typeof IndigoGold>['content'],
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).toContain('data-testid="indigo-gold-hero-background"');
    expect(html).toContain('src="https://cdn.example.test/hero-bg.jpg"');
  });

  it('omits hero <img> when sidecar is absent', () => {
    const html = render({
      content: indigoGoldFixture,
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).not.toContain('data-testid="indigo-gold-hero-background"');
  });

  it('renders footer logo <img> when sidecar present', () => {
    const html = render({
      content: {
        ...indigoGoldFixture,
        footer: {
          ...indigoGoldFixture.footer,
          logo: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            url: 'https://cdn.example.test/logo.svg',
            alt: 'Brand',
            width: 120,
            height: 40,
          },
        },
      } as React.ComponentProps<typeof IndigoGold>['content'],
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).toContain('data-testid="indigo-gold-footer-logo"');
    expect(html).toContain('src="https://cdn.example.test/logo.svg"');
  });
});
