import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type React from 'react';
import { OpusV1Layout } from './layout';
import { opusV1DefaultEnabledSections } from './sections';
import { opusV1Fixture } from '../__fixtures__/opus-v1.fixture';
import type { Palette } from '@/lib/palette';

function render(props: React.ComponentProps<typeof OpusV1Layout>) {
  return renderToStaticMarkup(<OpusV1Layout {...props} />);
}

describe('OpusV1Layout', () => {
  it('renders default enabled sections', () => {
    const html = render({
      content: opusV1Fixture,
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).toContain('opus-v1-root');
    expect(html).toContain(opusV1Fixture.hero.headline);
  });

  it('omits a section when enabledSections excludes it', () => {
    const enabled = opusV1DefaultEnabledSections.filter((k) => k !== 'speakers-by-day');
    const html = render({
      content: opusV1Fixture,
      enabledSections: enabled,
      speakers: {},
      funnelId: 'funnel-1',
    });
    // SpeakersByDay renders day labels; their absence is the assertion.
    const dayLabel = opusV1Fixture.speakersByDay[0]?.dayLabel;
    if (dayLabel) expect(html).not.toContain(dayLabel);
  });

  it('renders a section when explicitly enabled beyond the default', () => {
    const enabled = [...opusV1DefaultEnabledSections, 'marquee'];
    const html = render({
      content: opusV1Fixture,
      enabledSections: enabled,
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).toContain('marquee-wrap');
  });

  it('applies palette as inline CSS custom properties on root', () => {
    const palette: Palette = {
      primary: '#B1344A',
      'primary-contrast': '#FFFFFF',
      ink: '#18161A',
      paper: '#FAF8F4',
      'paper-alt': '#F5F1EA',
      muted: '#6B5B55',
      accent: '#E8A4B3',
      border: '#E8DDD2',
    };

    const html = render({
      content: opusV1Fixture,
      speakers: {},
      funnelId: 'funnel-1',
      palette,
    });

    // React serializes inline CSS vars as `--name:value;` (no space after colon)
    expect(html).toContain('--primary:#B1344A');
    expect(html).toContain('--primary-contrast:#FFFFFF');
    expect(html).toContain('--ink:#18161A');
    expect(html).toContain('--paper:#FAF8F4');
    expect(html).toContain('--paper-alt:#F5F1EA');
    expect(html).toContain('--muted:#6B5B55');
    expect(html).toContain('--accent:#E8A4B3');
    expect(html).toContain('--border:#E8DDD2');
  });

  it('omits palette vars when palette is null', () => {
    const html = render({
      content: opusV1Fixture,
      speakers: {},
      funnelId: 'funnel-1',
      palette: null,
    });
    // paletteStyle(null) returns undefined → React omits the style attr on
    // the root entirely (so no `--primary:` or `style=` shows up on .opus-v1-root).
    // Match the opening tag: `<div class="opus-v1-root ..."` with no style attr.
    expect(html).toMatch(/<div class="opus-v1-root[^"]*"(?!\s+style)/);
    expect(html).not.toContain('--primary:');
  });

  it('omits palette vars when palette is undefined', () => {
    const html = render({
      content: opusV1Fixture,
      speakers: {},
      funnelId: 'funnel-1',
    });
    expect(html).not.toContain('--primary:');
  });
});
