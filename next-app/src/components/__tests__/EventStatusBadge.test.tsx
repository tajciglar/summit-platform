import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { EventStatusBadge } from '../EventStatusBadge';

describe('EventStatusBadge', () => {
  it("shows the date label and skips the ping when status='before' (or omitted)", () => {
    const html = renderToStaticMarkup(
      <EventStatusBadge dateLabel="3–5 May, 2026" />,
    );
    expect(html).toContain('3–5 May, 2026');
    expect(html).toContain('data-event-status="before"');
    expect(html).not.toContain('animate-ping');
  });

  it("renders nothing when status='before' and dateLabel is empty", () => {
    const html = renderToStaticMarkup(<EventStatusBadge dateLabel="" />);
    expect(html).toBe('');
  });

  it("swaps in the live label and adds a ping when status='live'", () => {
    const html = renderToStaticMarkup(
      <EventStatusBadge
        status="live"
        dateLabel="3–5 May, 2026"
        liveLabel="Summit Now Live"
      />,
    );
    expect(html).toContain('Summit Now Live');
    expect(html).not.toContain('3–5 May, 2026');
    expect(html).toContain('data-event-status="live"');
    expect(html).toContain('animate-ping');
  });

  it("always paints red for status='ended' regardless of palette overrides", () => {
    const html = renderToStaticMarkup(
      <EventStatusBadge
        status="ended"
        dateLabel="3–5 May, 2026"
        endedLabel="Summit Has Ended"
        style={{ '--esb-primary': '#3C2E54' } as React.CSSProperties}
      />,
    );
    expect(html).toContain('Summit Has Ended');
    expect(html).toContain('data-event-status="ended"');
    expect(html).toContain('animate-ping');
    // Red (#DC2626) wins over the palette override.
    expect(html).toMatch(/background:\s*rgb\(220,\s*38,\s*38\)|#DC2626|#dc2626/);
  });
});
