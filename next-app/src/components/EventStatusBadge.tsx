import type { CSSProperties } from 'react';
import {
  DEFAULT_ENDED_LABEL,
  DEFAULT_LIVE_LABEL,
  type EventStatus,
} from './event-status';

type Props = {
  status?: EventStatus;
  dateLabel: string;
  liveLabel?: string;
  endedLabel?: string;
  className?: string;
  /** Additional inline styles. `--esb-primary` / `--esb-fg` overrides accepted. */
  style?: CSSProperties;
};

const ENDED_BG = '#DC2626';
const ENDED_FG = '#FFFFFF';
const DEFAULT_BG = '#3C2E54';
const DEFAULT_FG = '#FFFFFF';

/**
 * Uniform event-status pill used by every landing-page template.
 *
 *   status 'before' → dateLabel (e.g. "3–5 May, 2026"), palette-primary bg
 *   status 'live'   → liveLabel pulsing in palette-primary
 *   status 'ended'  → endedLabel pulsing in red (always red)
 *
 * Templates set the palette colour via inline `--esb-primary` / `--esb-fg`
 * custom properties on the badge, e.g.
 *
 *   <EventStatusBadge
 *     status={h.eventStatus}
 *     dateLabel={h.dateRangeLabel}
 *     style={{ '--esb-primary': '#5A4589', '--esb-fg': '#fff' } as CSSProperties}
 *   />
 *
 * Ended state ignores the palette and always paints red.
 *
 * Styles are inline so the component stays side-effect-free (template-manifest
 * export runs under plain tsx which cannot parse `.css` imports).
 */
export function EventStatusBadge({
  status = 'before',
  dateLabel,
  liveLabel = DEFAULT_LIVE_LABEL,
  endedLabel = DEFAULT_ENDED_LABEL,
  className,
  style,
}: Props) {
  const label =
    status === 'ended' ? endedLabel : status === 'live' ? liveLabel : dateLabel;
  if (status === 'before' && !label) return null;
  const pulsing = status === 'live' || status === 'ended';
  const isEnded = status === 'ended';

  const background = isEnded
    ? ENDED_BG
    : `var(--esb-primary, ${DEFAULT_BG})`;
  const color = isEnded ? ENDED_FG : `var(--esb-fg, ${DEFAULT_FG})`;

  const pillStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.55rem',
    padding: '0.5rem 1rem',
    borderRadius: 9999,
    fontWeight: 700,
    fontSize: '0.85rem',
    lineHeight: 1,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    background,
    color,
    boxShadow: isEnded
      ? '0 8px 22px -8px rgba(220,38,38,0.4)'
      : '0 6px 18px -10px rgba(0,0,0,0.35)',
    ...style,
  };

  return (
    <span className={className} style={pillStyle} data-event-status={status}>
      <span
        aria-hidden
        style={{
          position: 'relative',
          display: 'inline-block',
          width: '0.55rem',
          height: '0.55rem',
          borderRadius: 9999,
          background: 'currentColor',
          flexShrink: 0,
        }}
      >
        {pulsing ? (
          <span
            aria-hidden
            className="animate-ping"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 9999,
              background: 'currentColor',
              opacity: 0.6,
            }}
          />
        ) : null}
      </span>
      {label}
    </span>
  );
}
