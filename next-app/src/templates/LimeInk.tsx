// Document chrome (html/head/body) is owned by the Next.js page/layout that
// renders this template. Fonts (Inter / JetBrains Mono) must be loaded by
// the page — see Task 19/20 (preview/public routes) for wiring.
import type { CSSProperties } from 'react';
import { OptinModal } from '@/components/OptinModal';
import { EventStatusBadge } from '@/components/EventStatusBadge';
import type { LimeInkContent } from './lime-ink.schema';
import { limeInkDefaultEnabledSections } from './lime-ink.sections';
import type { Speaker } from './types';

type Props = {
  content: LimeInkContent;
  speakers: Record<string, Speaker>;
};

type RootProps = Props & {
  funnelId: string;
  enabledSections?: string[];
  palette?: import('@/lib/palette').Palette | null;
};

// Deterministic sparkline heights keyed by trend label. Keeps the AI-fillable
// schema simple (one enum per figure item) while preserving visual intent.
const TREND_HEIGHTS: Record<'rising' | 'plateau' | 'falling' | 'volatile', number[]> = {
  rising:   [40, 55, 72, 88, 100],
  plateau:  [88, 90, 92, 94, 96],
  falling:  [100, 85, 68, 50, 35],
  volatile: [55, 92, 40, 78, 62],
};

// Visual gradients for speaker placeholders — deterministic, cycled by index.
// Drawn from the lime-ink HTML palette (ink + lime + indigo tints).
const SPEAKER_GRADIENTS = [
  'linear-gradient(160deg,#0A0A0B,#27272A)',
  'linear-gradient(160deg,#27272A,#0A0A0B)',
  'linear-gradient(160deg,#0A0A0B,#18181B)',
  'linear-gradient(160deg,#18181B,#27272A)',
  'linear-gradient(160deg,#27272A,#52525B)',
  'linear-gradient(160deg,#0A0A0B,#27272A)',
  'linear-gradient(160deg,#27272A,#0A0A0B)',
  'linear-gradient(160deg,#18181B,#0A0A0B)',
];

const SPEAKER_ACCENTS = [
  '#C4F245', // lime
  '#FFFFFF',
  '#C4F245',
  '#FFFFFF',
  '#C4F245',
  '#FFFFFF',
  '#C4F245',
  '#FFFFFF',
];

const HERO_CARD_GRADIENTS = [
  'linear-gradient(135deg,#18181B,#27272A)',
  'linear-gradient(135deg,#27272A,#18181B)',
  'linear-gradient(135deg,#18181B,#27272A)',
  'linear-gradient(135deg,#27272A,#18181B)',
];

const HERO_CARD_ACCENTS = ['#C4F245', '#6366F1', '#FFFFFF', '#C4F245'];
const HERO_CARD_BORDERS = [
  '1px solid rgba(196,242,69,0.2)',
  '1px solid rgba(99,102,241,0.2)',
  '1px solid rgba(255,255,255,0.08)',
  '1px solid rgba(196,242,69,0.2)',
];

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#C4F245,#AEE02B)',
  'linear-gradient(135deg,#6366F1,#4F46E5)',
  'linear-gradient(135deg,#52525B,#27272A)',
  'linear-gradient(135deg,#DCFF6B,#C4F245)',
];

const AVATAR_TEXT_COLORS = ['#0A0A0B', '#FFFFFF', '#FFFFFF', '#0A0A0B'];

const FOUNDER_GRADIENTS = [
  'linear-gradient(135deg,#C4F245,#AEE02B)',
  'linear-gradient(135deg,#6366F1,#4F46E5)',
];
const FOUNDER_TEXT_COLORS = ['#0A0A0B', '#FFFFFF'];

const TESTIMONIAL_GRADIENTS = [
  'linear-gradient(135deg,#C4F245,#AEE02B)',
  'linear-gradient(135deg,#6366F1,#4F46E5)',
  'linear-gradient(135deg,#DCFF6B,#C4F245)',
];
const TESTIMONIAL_TEXT_COLORS = ['#0A0A0B', '#FFFFFF', '#0A0A0B'];

function initialsFromSpeaker(s: Speaker): string {
  const a = s.firstName?.trim()?.[0] ?? '';
  const b = s.lastName?.trim()?.[0] ?? '';
  return (a + b).toUpperCase() || '??';
}

function displayName(s: Speaker): string {
  return `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() || '—';
}

/* ============== STICKY TOP BAR ============== */
function TopBar({ content }: { content: LimeInkContent }) {
  const t = content.topBar;
  return (
    <header
      className="sticky top-0 z-40 text-white"
      style={{ background: '#0A0A0B' }}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="lime-ink-mono text-xs" style={{ color: '#C4F245' }}>
            {t.codeTag}
          </span>
          <span className="font-bold tracking-tight text-sm md:text-base">{t.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="lime-ink-mono px-2.5 py-1 rounded-full"
            style={{
              fontSize: '0.65rem',
              color: '#DCFF6B',
              border: '1px solid rgba(196,242,69,0.4)',
            }}
          >
            {t.statusPill}
          </span>
          <a
            href="#optin"
            className="lime-ink-cta-primary text-xs md:text-sm font-bold px-5 py-2 rounded-full"
          >
            {t.ctaLabel}
          </a>
        </div>
      </div>
    </header>
  );
}

/* ============== HERO ============== */
function Hero({ content, speakers }: Props) {
  const h = content.hero;
  const heroSpeakers = h.heroSpeakerIds
    .map((id) => speakers[id])
    .filter((s): s is Speaker => Boolean(s));

  return (
    <section
      className="relative text-white overflow-hidden"
      style={{ background: '#0A0A0B' }}
    >
      <div className="absolute inset-0 lime-ink-grid-bg"></div>
      <div className="absolute inset-0 lime-ink-noise"></div>
      <div className="relative max-w-7xl mx-auto px-6 pt-20 md:pt-28 pb-20 md:pb-28">
        <div className="flex items-center gap-4 mb-10">
          <span className="lime-ink-mono text-xs" style={{ color: '#DCFF6B' }}>
            {h.sectionLabel}
          </span>
          <span
            className="h-[1px] w-16"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          ></span>
          <EventStatusBadge
            status={h.eventStatus}
            dateLabel={h.dateRangeLabel}
            liveLabel={h.liveLabel}
            endedLabel={h.endedLabel}
            style={{ '--esb-primary': '#DCFF6B', '--esb-fg': '#0A0A0B' } as CSSProperties}
          />
        </div>

        <div className="grid md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-8">
            <p
              className="lime-ink-mono text-sm mb-6 tracking-wide"
              style={{ color: '#DCFF6B' }}
            >
              {h.eyebrow}
            </p>
            <h1 className="font-black text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-[-0.04em] mb-8">
              {h.heroLine1}
              <br />
              {h.headlineLead}{' '}
              <span style={{ color: '#C4F245' }}>{h.headlineAccent}</span>{' '}
              {h.headlineTrail}
            </h1>
            <p
              className="text-lg md:text-xl leading-[1.55] max-w-2xl mb-10"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              {h.subheadline}
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-12">
              <a
                href="#optin"
                className="lime-ink-cta-primary inline-flex items-center gap-3 font-bold px-8 py-4 rounded-full text-base"
              >
                {h.primaryCtaLabel}
                <span className="lime-ink-mono text-sm">→</span>
              </a>
              <a
                href="#what-is-this"
                className="lime-ink-cta-ghost inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-medium"
              >
                {h.secondaryCtaLabel}
              </a>
            </div>

            <div className="flex items-center gap-4 pt-8 lime-ink-hairline-dark">
              <div className="flex -space-x-2">
                {heroSpeakers.slice(0, 4).map((s, idx) => (
                  <div
                    key={`hero-avatar-${s.id}`}
                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs"
                    style={{
                      background: AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length],
                      color: AVATAR_TEXT_COLORS[idx % AVATAR_TEXT_COLORS.length],
                      border: '2px solid #0A0A0B',
                    }}
                  >
                    {initialsFromSpeaker(s)}
                  </div>
                ))}
              </div>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                <span className="text-white font-semibold">{h.readerCount}</span>{' '}
                {h.readerCountSuffix} ·{' '}
                <span style={{ color: '#DCFF6B' }}>★★★★★</span> {h.ratingLabel}
              </p>
            </div>
          </div>

          <aside className="md:col-span-4">
            <p
              className="lime-ink-mono text-xs mb-4"
              style={{ color: '#71717A' }}
            >
              {h.featuredLabel}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {heroSpeakers.slice(0, 4).map((s, idx) => (
                <div
                  key={`hero-card-${s.id}`}
                  className="aspect-square rounded-2xl flex items-end p-3"
                  style={{
                    background: HERO_CARD_GRADIENTS[idx % HERO_CARD_GRADIENTS.length],
                    border: HERO_CARD_BORDERS[idx % HERO_CARD_BORDERS.length],
                  }}
                >
                  <div>
                    <p
                      className="font-bold text-xl leading-none"
                      style={{
                        color: HERO_CARD_ACCENTS[idx % HERO_CARD_ACCENTS.length],
                      }}
                    >
                      {initialsFromSpeaker(s)}
                    </p>
                    <p
                      className="lime-ink-mono mt-1"
                      style={{ fontSize: '0.6rem', color: '#71717A' }}
                    >
                      {(s.title ?? '').toUpperCase()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p
              className="lime-ink-mono mt-4 text-right"
              style={{ fontSize: '0.65rem', color: '#71717A' }}
            >
              {h.moreLabel}
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* ============== PRESS MARQUEE ============== */
function Press({ content }: { content: LimeInkContent }) {
  // Duplicate items so the marquee loops seamlessly.
  const items = [...content.press.outlets, ...content.press.outlets];
  return (
    <section className="bg-white py-10 lime-ink-hairline-b">
      <div className="max-w-7xl mx-auto px-6">
        <p
          className="lime-ink-mono text-xs mb-6 text-center"
          style={{ color: '#71717A' }}
        >
          {content.press.eyebrow}
        </p>
        <div className="lime-ink-marquee-wrap">
          <div className="lime-ink-marquee-track">
            {items.map((name, idx) => (
              <span className="lime-ink-marquee-item" key={`press-${idx}`}>
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============== STATS STRIP ============== */
function Stats({ content }: { content: LimeInkContent }) {
  return (
    <section className="bg-white py-16 md:py-20 lime-ink-hairline-b">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-12">
          <span
            className="lime-ink-mono text-xs"
            style={{ color: '#71717A' }}
          >
            {content.stats.sectionLabel}
          </span>
          <span
            className="h-[1px] w-16"
            style={{ background: '#E4E4E7' }}
          ></span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3">
          {content.stats.items.map((item, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === content.stats.items.length - 1;
            const boundaryClass = isFirst
              ? 'py-4 md:py-0 md:pr-10 md:border-r'
              : isLast
                ? 'py-4 md:py-0 md:pl-10'
                : 'py-4 md:py-0 md:px-10 md:border-r';
            return (
              <div
                key={`stat-${idx}`}
                className={boundaryClass}
                style={{
                  borderColor:
                    !isLast && idx !== content.stats.items.length - 1
                      ? '#E4E4E7'
                      : undefined,
                }}
              >
                <p
                  className="lime-ink-mono text-xs mb-3"
                  style={{ color: '#71717A' }}
                >
                  {item.label}
                </p>
                <p className="font-black text-8xl md:text-9xl leading-none tracking-[-0.05em]">
                  {item.value}
                  {item.suffix ? (
                    <span
                      className="text-7xl"
                      style={{
                        color: idx === 1 ? '#AEE02B' : '#71717A',
                      }}
                    >
                      {item.suffix}
                    </span>
                  ) : null}
                </p>
                <p className="mt-3 text-lg" style={{ color: '#52525B' }}>
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============== OVERVIEW ============== */
function Overview({ content }: { content: LimeInkContent }) {
  const o = content.overview;
  return (
    <section
      id="what-is-this"
      className="py-20 md:py-28 lime-ink-hairline-b"
      style={{ background: '#F4F4F5' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-12">
          <span
            className="lime-ink-mono text-xs"
            style={{ color: '#71717A' }}
          >
            {o.sectionLabel}
          </span>
          <span
            className="h-[1px] w-16"
            style={{ background: '#E4E4E7' }}
          ></span>
        </div>
        <div className="grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7">
            <h2 className="font-black text-4xl md:text-6xl leading-[1.02] tracking-[-0.03em] mb-8">
              {o.headlineLead}
              <span style={{ color: '#71717A' }}>{o.headlineAccent}</span>
              {o.headlineTrail}
            </h2>
            {o.bodyParagraphs.map((para, idx) => (
              <p
                key={`overview-p-${idx}`}
                className="text-lg md:text-xl leading-relaxed mb-5"
                style={{ color: '#52525B' }}
              >
                {para}
              </p>
            ))}
            <a
              href="#optin"
              className="lime-ink-cta-primary inline-flex items-center gap-3 font-bold px-7 py-3.5 rounded-full mt-3"
            >
              {o.ctaLabel}
              <span className="lime-ink-mono text-sm">→</span>
            </a>
          </div>
          <div className="md:col-span-5">
            <div
              className="bg-white rounded-2xl p-8 shadow-sm"
              style={{ border: '1px solid #E4E4E7' }}
            >
              <p
                className="lime-ink-mono text-xs mb-6"
                style={{ color: '#71717A' }}
              >
                {o.systemCardLabel}
              </p>
              <div className="space-y-5">
                {o.components.map((comp, idx) => (
                  <div key={`overview-comp-${idx}`} className="flex gap-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: '#0A0A0B' }}
                    >
                      <span
                        className="lime-ink-mono font-bold"
                        style={{ color: '#C4F245', fontSize: '0.95rem' }}
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold">{comp.title}</p>
                      <p className="text-sm mt-1" style={{ color: '#52525B' }}>
                        {comp.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============== SPEAKER GRID — DAY 1 ============== */
function SpeakersDay({ content, speakers }: Props) {
  const daySpeakers = content.speakersDay.speakerIds
    .map((id) => speakers[id])
    .filter((s): s is Speaker => Boolean(s));

  return (
    <section className="bg-white py-20 md:py-28 lime-ink-hairline-b">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12 pb-4 lime-ink-hairline-b">
          <div>
            <div className="flex items-center gap-4 mb-5">
              <span
                className="lime-ink-mono text-xs"
                style={{ color: '#71717A' }}
              >
                {content.speakersDay.sectionLabel}
              </span>
              <span
                className="h-[1px] w-12"
                style={{ background: '#E4E4E7' }}
              ></span>
            </div>
            <h2 className="font-black text-4xl md:text-5xl leading-tight tracking-[-0.03em]">
              {content.speakersDay.headline}
            </h2>
          </div>
          <p
            className="lime-ink-mono text-xs hidden md:block"
            style={{ color: '#71717A' }}
          >
            {content.speakersDay.countLabel}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          {daySpeakers.map((s, idx) => (
            <figure key={s.id}>
              <div
                className="lime-ink-spk-avatar aspect-square rounded-2xl mb-3 flex items-end justify-center pb-5"
                style={{
                  background:
                    SPEAKER_GRADIENTS[idx % SPEAKER_GRADIENTS.length],
                }}
              >
                <span
                  className="font-black text-4xl"
                  style={{
                    color: SPEAKER_ACCENTS[idx % SPEAKER_ACCENTS.length],
                  }}
                >
                  {initialsFromSpeaker(s)}
                </span>
              </div>
              <p className="font-bold">{displayName(s)}</p>
              {s.title ? (
                <p
                  className="lime-ink-mono mt-1"
                  style={{ fontSize: '0.65rem', color: '#71717A' }}
                >
                  {s.title.toUpperCase()}
                </p>
              ) : null}
            </figure>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="#optin"
            className="inline-flex items-center gap-2 font-bold pb-1"
            style={{
              color: '#0A0A0B',
              borderBottom: '2px solid #C4F245',
            }}
          >
            {content.speakersDay.ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============== OUTCOMES ============== */
function Outcomes({ content }: { content: LimeInkContent }) {
  const o = content.outcomes;
  return (
    <section
      className="py-20 md:py-28 lime-ink-hairline-b"
      style={{ background: '#F4F4F5' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-4">
          <span
            className="lime-ink-mono text-xs"
            style={{ color: '#71717A' }}
          >
            {o.sectionLabel}
          </span>
          <span
            className="h-[1px] w-12"
            style={{ background: '#E4E4E7' }}
          ></span>
        </div>
        <h2 className="font-black text-4xl md:text-6xl leading-[1.02] tracking-[-0.03em] mb-14 max-w-3xl">
          {o.headlineLead}
          {o.headlineAccent ? (
            <>
              {' '}
              <span style={{ color: '#AEE02B' }}>{o.headlineAccent}</span>
              {' '}
            </>
          ) : null}
          <span style={{ color: '#71717A' }}>{o.headlineTrail}</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {o.items.map((item, idx) => (
            <article
              key={`outcome-${idx}`}
              className="bg-white rounded-2xl p-8"
              style={{ border: '1px solid #E4E4E7' }}
            >
              <div className="flex items-center justify-between mb-8">
                <span
                  className="lime-ink-mono text-xs"
                  style={{ color: '#71717A' }}
                >
                  {String(idx + 1).padStart(2, '0')} /
                </span>
                <span
                  className="lime-ink-mono text-xs"
                  style={{ color: '#AEE02B' }}
                >
                  {o.itemBadge}
                </span>
              </div>
              <h3 className="font-black text-xl mb-2 tracking-tight">
                {item.title}
              </h3>
              <p className="leading-relaxed" style={{ color: '#52525B' }}>
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============== FREE GIFT ============== */
function FreeGift({ content }: { content: LimeInkContent }) {
  const g = content.freeGift;
  return (
    <section
      className="text-white py-20 md:py-28"
      style={{ background: '#0A0A0B' }}
    >
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-5">
          <div
            className="relative aspect-[3/4] max-w-xs mx-auto rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(180deg,#18181B,#0A0A0B)',
              border: '1px solid rgba(196,242,69,0.3)',
            }}
          >
            <div className="absolute top-0 left-0 right-0 p-6">
              <p
                className="lime-ink-mono text-xs mb-3"
                style={{ color: '#C4F245' }}
              >
                {g.cardFilename}
              </p>
              <h3 className="font-black text-2xl leading-tight">{g.cardTitle}</h3>
            </div>
            <div
              className="absolute inset-x-6 bottom-6 flex flex-col gap-2 lime-ink-mono"
              style={{ fontSize: '0.75rem', color: '#71717A' }}
            >
              {g.cardFiles.map((file, idx) => (
                <span key={`gift-file-${idx}`}>{file}</span>
              ))}
              <div
                className="pt-3 mt-2"
                style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
              >
                <span style={{ color: '#DCFF6B' }}>{g.cardCommand}</span>
              </div>
            </div>
            <span
              className="absolute top-4 right-4 lime-ink-mono px-2 py-1 rounded"
              style={{
                fontSize: '0.6rem',
                color: '#0A0A0B',
                background: '#C4F245',
              }}
            >
              {g.cardBadge}
            </span>
          </div>
        </div>
        <div className="md:col-span-7">
          <p
            className="lime-ink-mono text-xs mb-4"
            style={{ color: '#C4F245' }}
          >
            {g.codeEyebrow}
          </p>
          <h2 className="font-black text-4xl md:text-6xl leading-[1.02] tracking-[-0.03em] mb-6">
            {g.headline}
          </h2>
          <p
            className="text-lg md:text-xl leading-relaxed mb-8"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            {g.body}
          </p>
          <ul className="space-y-3 mb-8 lime-ink-mono text-sm">
            {g.bullets.map((bullet, idx) => (
              <li key={`gift-bullet-${idx}`} className="flex items-start gap-3">
                <span style={{ color: '#C4F245' }}>✓</span>
                <span style={{ color: 'rgba(255,255,255,0.8)' }}>{bullet}</span>
              </li>
            ))}
          </ul>
          <a
            href="#optin"
            className="lime-ink-cta-primary inline-flex items-center gap-3 font-bold px-8 py-4 rounded-full"
          >
            {g.ctaLabel}
            <span className="lime-ink-mono text-sm">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============== BONUS STACK ============== */
function Bonuses({ content }: { content: LimeInkContent }) {
  const b = content.bonuses;
  return (
    <section className="bg-white py-20 md:py-28 lime-ink-hairline-b">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-4">
          <span
            className="lime-ink-mono text-xs"
            style={{ color: '#71717A' }}
          >
            {b.sectionLabel}
          </span>
          <span
            className="h-[1px] w-12"
            style={{ background: '#E4E4E7' }}
          ></span>
        </div>
        <h2 className="font-black text-4xl md:text-6xl leading-[1.02] tracking-[-0.03em] mb-4">
          {b.headlineLead}
          <span style={{ color: '#AEE02B' }}>{b.headlineAccent}</span>
          {b.headlineTrail}
        </h2>
        <p className="text-lg mb-14 max-w-2xl" style={{ color: '#52525B' }}>
          {b.subhead}
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {b.items.map((bonus, idx) => (
            <article
              key={`bonus-${idx}`}
              className="text-white rounded-2xl p-8"
              style={{
                background: '#0A0A0B',
                border: '1px solid #27272A',
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <span
                  className="lime-ink-mono text-xs"
                  style={{ color: '#71717A' }}
                >
                  {bonus.filename}
                </span>
                <span
                  className="lime-ink-mono px-2 py-1 rounded font-bold"
                  style={{
                    fontSize: '0.65rem',
                    background: '#C4F245',
                    color: '#0A0A0B',
                  }}
                >
                  {bonus.valueLabel}
                </span>
              </div>
              <h3 className="font-black text-2xl mb-3 tracking-tight">
                {bonus.title}
              </h3>
              <p
                className="mb-6 leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                {bonus.description}
              </p>
              <ul
                className="space-y-2 lime-ink-mono text-xs"
                style={{ color: 'rgba(255,255,255,0.7)' }}
              >
                {bonus.bullets.map((bullet, bIdx) => (
                  <li
                    key={`bonus-${idx}-b-${bIdx}`}
                    className="flex gap-2"
                  >
                    <span style={{ color: '#C4F245' }}>→</span> {bullet}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="text-center mt-12">
          <a
            href="#optin"
            className="lime-ink-cta-primary inline-flex items-center gap-3 font-bold px-10 py-4 rounded-full text-lg"
          >
            {b.ctaLabel}
            <span className="lime-ink-mono text-sm">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============== FOUNDERS ============== */
function Founders({ content }: { content: LimeInkContent }) {
  const f = content.founders;
  return (
    <section
      className="py-20 md:py-28 lime-ink-hairline-b"
      style={{ background: '#F4F4F5' }}
    >
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-4">
          <span
            className="lime-ink-mono text-xs"
            style={{ color: '#71717A' }}
          >
            {f.sectionLabel}
          </span>
          <span
            className="h-[1px] w-12"
            style={{ background: '#E4E4E7' }}
          ></span>
        </div>
        <h2 className="font-black text-4xl md:text-5xl tracking-[-0.03em] mb-14">
          {f.headline}
        </h2>
        <div className="grid md:grid-cols-2 gap-12">
          {f.items.map((founder, idx) => (
            <div
              key={`founder-${idx}`}
              className="bg-white rounded-2xl p-8"
              style={{ border: '1px solid #E4E4E7' }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center font-black text-sm"
                  style={{
                    background:
                      FOUNDER_GRADIENTS[idx % FOUNDER_GRADIENTS.length],
                    color:
                      FOUNDER_TEXT_COLORS[idx % FOUNDER_TEXT_COLORS.length],
                  }}
                >
                  {founder.initials}
                </div>
                <div>
                  <p className="font-bold text-lg">{founder.name}</p>
                  <p
                    className="lime-ink-mono text-xs mt-0.5"
                    style={{ color: '#71717A' }}
                  >
                    {founder.role}
                  </p>
                </div>
              </div>
              <blockquote
                className="text-lg leading-relaxed pl-5"
                style={{
                  color: '#18181B',
                  borderLeft: '4px solid #C4F245',
                }}
              >
                &ldquo;{founder.quote}&rdquo;
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============== TESTIMONIALS ============== */
function Testimonials({ content }: { content: LimeInkContent }) {
  const t = content.testimonials;
  return (
    <section className="bg-white py-20 md:py-28 lime-ink-hairline-b">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-4">
          <span
            className="lime-ink-mono text-xs"
            style={{ color: '#71717A' }}
          >
            {t.sectionLabel}
          </span>
          <span
            className="h-[1px] w-12"
            style={{ background: '#E4E4E7' }}
          ></span>
        </div>
        <h2 className="font-black text-4xl md:text-6xl leading-[1.02] tracking-[-0.03em] mb-4 max-w-3xl">
          {t.headlineLead}
          {t.headlineAccent ? (
            <>
              {' '}
              <span style={{ color: '#AEE02B' }}>{t.headlineAccent}</span>
              {' '}
            </>
          ) : null}
          <span style={{ color: '#71717A' }}>{t.headlineTrail}</span>
        </h2>
        <p className="text-lg mb-14" style={{ color: '#52525B' }}>
          {t.subhead}
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {t.items.map((item, idx) => (
            <article
              key={`testimonial-${idx}`}
              className="rounded-2xl p-8"
              style={{
                background: '#F4F4F5',
                border: '1px solid #E4E4E7',
              }}
            >
              <p
                className="text-xl font-bold mb-4 tracking-widest"
                style={{ color: '#AEE02B' }}
              >
                ★★★★★
              </p>
              <p
                className="text-lg leading-relaxed mb-6"
                style={{ color: '#18181B' }}
              >
                &ldquo;{item.quote}&rdquo;
              </p>
              <div
                className="flex items-center gap-3 pt-5"
                style={{ borderTop: '1px solid #E4E4E7' }}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{
                    background:
                      TESTIMONIAL_GRADIENTS[idx % TESTIMONIAL_GRADIENTS.length],
                    color:
                      TESTIMONIAL_TEXT_COLORS[
                        idx % TESTIMONIAL_TEXT_COLORS.length
                      ],
                  }}
                >
                  {item.initials}
                </div>
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p
                    className="lime-ink-mono text-xs mt-0.5"
                    style={{ color: '#71717A' }}
                  >
                    {item.location}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============== PULL QUOTE ============== */
function PullQuote({ content }: { content: LimeInkContent }) {
  const pq = content.pullQuote;
  return (
    <section
      className="text-white py-24 md:py-32"
      style={{ background: '#0A0A0B' }}
    >
      <div className="max-w-4xl mx-auto px-6">
        <span
          className="lime-ink-mono text-xs block mb-6"
          style={{ color: '#C4F245' }}
        >
          {pq.eyebrow}
        </span>
        <p className="font-black text-4xl md:text-6xl leading-[1.08] tracking-[-0.03em] mb-8">
          &ldquo;{pq.quote}&rdquo;
        </p>
        <div className="flex items-center gap-4">
          <span
            className="w-12 h-[1px]"
            style={{ background: '#C4F245' }}
          ></span>
          <p
            className="lime-ink-mono text-xs"
            style={{ color: '#71717A' }}
          >
            {pq.attribution}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ============== FIGURES / WHY THIS MATTERS ============== */
function Figures({ content }: { content: LimeInkContent }) {
  const f = content.figures;
  return (
    <section className="bg-white py-20 md:py-28 lime-ink-hairline-b">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-4">
          <span
            className="lime-ink-mono text-xs"
            style={{ color: '#71717A' }}
          >
            {f.sectionLabel}
          </span>
          <span
            className="h-[1px] w-12"
            style={{ background: '#E4E4E7' }}
          ></span>
        </div>
        <h2 className="font-black text-4xl md:text-5xl leading-tight tracking-[-0.03em] mb-14 max-w-3xl">
          {f.headline}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-12">
          {f.items.map((item, idx) => {
            // idx 1 and 4 are highlighted in lime in the reference HTML
            const valueColor =
              idx === 1 || idx === 4 ? '#AEE02B' : '#0A0A0B';
            return (
              <div
                key={`figure-${idx}`}
                className="flex items-start justify-between gap-4 pb-6 lime-ink-hairline-b"
              >
                <div>
                  <p
                    className="lime-ink-mono text-xs mb-3"
                    style={{ color: '#71717A' }}
                  >
                    {item.label}
                  </p>
                  <p
                    className="font-black text-5xl tracking-[-0.03em] mb-2"
                    style={{ color: valueColor }}
                  >
                    {item.value}
                  </p>
                  <p style={{ color: '#52525B' }}>{item.description}</p>
                </div>
                <div className="lime-ink-spark" aria-hidden="true">
                  {TREND_HEIGHTS[item.trend].map((h, hIdx) => (
                    <span
                      key={`spark-${idx}-${hIdx}`}
                      style={{ height: `${h}%` }}
                    ></span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============== SHIFTS ============== */
function Shifts({ content }: { content: LimeInkContent }) {
  const s = content.shifts;
  return (
    <section
      className="py-20 md:py-28 lime-ink-hairline-b"
      style={{ background: '#F4F4F5' }}
    >
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-4">
          <span
            className="lime-ink-mono text-xs"
            style={{ color: '#71717A' }}
          >
            {s.sectionLabel}
          </span>
          <span
            className="h-[1px] w-12"
            style={{ background: '#E4E4E7' }}
          ></span>
        </div>
        <h2 className="font-black text-4xl md:text-5xl tracking-[-0.03em] mb-14">
          {s.headline}
        </h2>
        <div className="space-y-10">
          {s.items.map((item, idx) => {
            const isLast = idx === s.items.length - 1;
            return (
              <article
                key={`shift-${idx}`}
                className={`grid grid-cols-[auto_1fr] gap-8 items-start ${
                  isLast ? '' : 'pb-8 lime-ink-hairline-b'
                }`}
              >
                <span
                  className="lime-ink-mono font-black text-5xl leading-none"
                  style={{ color: '#AEE02B' }}
                >
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-black text-2xl mb-3 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-lg leading-relaxed" style={{ color: '#52525B' }}>
                    {item.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============== FAQ ============== */
function FAQ({ content }: { content: LimeInkContent }) {
  return (
    <section className="bg-white py-20 md:py-28 lime-ink-hairline-b">
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-4">
          <span
            className="lime-ink-mono text-xs"
            style={{ color: '#71717A' }}
          >
            {content.faqSection.sectionLabel}
          </span>
          <span
            className="h-[1px] w-12"
            style={{ background: '#E4E4E7' }}
          ></span>
        </div>
        <h2 className="font-black text-4xl md:text-5xl tracking-[-0.03em] mb-12">
          {content.faqSection.headline}
        </h2>
        <div>
          {content.faqs.map((faq, idx) => (
            <details key={`faq-${idx}`}>
              <summary>
                {faq.question}
                <span className="lime-ink-plus-icon">+</span>
              </summary>
              <p
                className="pb-6 leading-relaxed"
                style={{ color: '#52525B' }}
              >
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============== FINAL CTA ============== */
function FinalCTA({ content }: { content: LimeInkContent }) {
  const c = content.closing;
  return (
    <section
      className="relative text-white py-24 md:py-32 overflow-hidden"
      id="final-cta"
      style={{ background: '#0A0A0B' }}
    >
      <div className="absolute inset-0 lime-ink-grid-bg"></div>
      <div className="absolute inset-0 lime-ink-noise"></div>
      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <p
          className="lime-ink-mono text-xs mb-6"
          style={{ color: '#C4F245' }}
        >
          {c.eyebrow}
        </p>
        <h2 className="font-black text-5xl md:text-7xl lg:text-8xl leading-[0.98] tracking-[-0.04em] mb-8">
          {c.headline}
        </h2>
        <p
          className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.7)' }}
        >
          {c.subheadline}
        </p>
        <a
          href="#optin"
          className="lime-ink-cta-primary inline-flex items-center gap-3 font-bold px-10 py-5 rounded-full text-lg"
        >
          {c.ctaLabel}
          <span className="lime-ink-mono">→</span>
        </a>
        {c.fineprint ? (
          <p
            className="lime-ink-mono text-xs mt-8"
            style={{ color: '#71717A' }}
          >
            {c.fineprint}
          </p>
        ) : null}
      </div>
    </section>
  );
}

/* ============== FOOTER ============== */
function Footer({ content }: { content: LimeInkContent }) {
  const f = content.footer;
  return (
    <footer
      className="text-white py-14"
      style={{ background: '#050506' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-[2fr_1fr_1fr_1fr] gap-10">
          <div>
            <p
              className="lime-ink-mono text-xs mb-3"
              style={{ color: '#C4F245' }}
            >
              {f.codeTag}
            </p>
            <p className="font-black text-xl mb-3 tracking-tight">
              {f.brandName}
            </p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {f.tagline}
            </p>
          </div>
          <div>
            <p
              className="lime-ink-mono text-xs mb-4"
              style={{ color: '#71717A' }}
            >
              {f.summitLinksLabel}
            </p>
            <ul
              className="space-y-2 text-sm"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              {f.summitLinks.map((link, idx) => (
                <li key={`summit-link-${idx}`}>
                  <a href={link.href} className="hover:text-[#DCFF6B]">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p
              className="lime-ink-mono text-xs mb-4"
              style={{ color: '#71717A' }}
            >
              {f.legalLinksLabel}
            </p>
            <ul
              className="space-y-2 text-sm"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              {f.legalLinks.map((link, idx) => (
                <li key={`legal-link-${idx}`}>
                  <a href={link.href} className="hover:text-[#DCFF6B]">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p
              className="lime-ink-mono text-xs mb-4"
              style={{ color: '#71717A' }}
            >
              {f.contactLabel}
            </p>
            <ul
              className="space-y-2 text-sm"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              <li>{f.contactEmail}</li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>{f.copyright}</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ============== ROOT COMPONENT ============== */
export function LimeInk({ content, speakers, funnelId, enabledSections }: RootProps) {
  const enabled = new Set(enabledSections ?? limeInkDefaultEnabledSections);
  return (
    <div className="lime-ink-root lime-ink-body antialiased">
      <a href="#main" className="lime-ink-skip-nav">
        Skip to content
      </a>

      {enabled.has('top-bar') && <TopBar content={content} />}

      <main id="main">
        {enabled.has('hero') && <Hero content={content} speakers={speakers} />}
        {enabled.has('press') && <Press content={content} />}
        {enabled.has('stats') && <Stats content={content} />}
        {enabled.has('overview') && <Overview content={content} />}
        {enabled.has('speakers') && <SpeakersDay content={content} speakers={speakers} />}
        {enabled.has('outcomes') && <Outcomes content={content} />}
        {enabled.has('free-gift') && <FreeGift content={content} />}
        {enabled.has('bonuses') && <Bonuses content={content} />}
        {enabled.has('founders') && <Founders content={content} />}
        {enabled.has('testimonials') && <Testimonials content={content} />}
        {enabled.has('pull-quote') && <PullQuote content={content} />}
        {enabled.has('figures') && <Figures content={content} />}
        {enabled.has('shifts') && <Shifts content={content} />}
        {enabled.has('faq') && <FAQ content={content} />}
        {enabled.has('closing-cta') && <FinalCTA content={content} />}
      </main>

      {enabled.has('footer') && <Footer content={content} />}

      <OptinModal funnelId={funnelId} ctaLabel={content.hero.primaryCtaLabel} />
    </div>
  );
}
