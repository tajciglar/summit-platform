import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type React from 'react';
import { OpusV1Layout } from './layout';
import { opusV1DefaultEnabledSections } from './sections';
import { opusV1Fixture } from '../__fixtures__/opus-v1.fixture';

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
});
