// Lavender / gold "trusted family" aesthetic — visually ported from
// next-app/public/aps-parenting.html. Document chrome (html/head/body) is
// owned by the Next.js page/layout that renders this template. The fonts
// (Cormorant Garamond + Poppins) are loaded inside `indigo-gold.styles.css`
// so the template is self-contained when dropped into the preview or
// public funnel routes.
import './indigo-gold.styles.css';
import type { CSSProperties } from 'react';
import { OptinModal } from '@/components/OptinModal';
import { EventStatusBadge } from '@/components/EventStatusBadge';
import { paletteStyle, type Palette } from '@/lib/palette';
import type { IndigoGoldContent } from './indigo-gold.schema';
import { resolveCheckoutHref } from './lib/checkout-href';
import type { Speaker } from './types';
import { indigoGoldDefaultEnabledSections } from './indigo-gold.sections';

type Props = {
  content: IndigoGoldContent;
  speakers: Record<string, Speaker>;
};

type RootProps = Props & {
  funnelId: string;
  enabledSections?: string[];
  palette?: Palette | null;
  wpCheckoutRedirectUrl?: string | null;
};

/* =======================================================================
 * PALETTE TOKENS — matches the `lav/sun/ink/cream` Tailwind config in the
 * static HTML. Kept here so the component works even without Tailwind v4
 * theme variables (the styles.css file is scoped to .indigo-gold-root).
 * ======================================================================= */
const LAV = {
  c50: '#F4F0FB',
  c100: '#ECE6F7',
  c200: '#DDD2F0',
  c300: '#C5B5E4',
  c400: '#A891D1',
  c500: '#8C72BF',
  c600: '#6E57A3',
  c700: '#5A4589',
};

const SUN = {
  c300: '#FFE066',
  c400: '#FFD93D',
  c500: '#FFCE29',
  c600: '#E9B60C',
};

const INK = {
  c900: '#1B132C',
  c800: '#2A1F3F',
  c700: '#3C2E54',
  c600: '#5A4989',
};

/* Speaker photo fallback: deterministic pravatar avatars so the visual
 * never collapses to monograms when a summit was seeded without photos.
 * The index is derived from the stable speaker id so it's reproducible. */
const FALLBACK_AVATAR_SLOTS = [12, 5, 47, 68, 33, 59, 45, 16, 49, 20, 60, 23, 44, 10, 28, 30, 26, 58, 41, 65, 24, 36, 52, 19, 9, 67, 48, 18, 31, 13];

function hashToIndex(id: string | number, modulo: number): number {
  const s = String(id);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % modulo;
}

function speakerPhoto(s: Speaker, size: number = 200): string {
  if (s.photoUrl) return s.photoUrl;
  const slot = FALLBACK_AVATAR_SLOTS[hashToIndex(s.id, FALLBACK_AVATAR_SLOTS.length)];
  return `https://i.pravatar.cc/${size}?img=${slot}`;
}

function displayName(s: Speaker): string {
  return `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() || '—';
}

/* =======================================================================
 * INLINE ICON SPRITE — mirrors the <symbol> defs used by the static file.
 * Rendered once, then referenced by <use href="#ig-*" />.
 * ======================================================================= */
function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <symbol id="ig-arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </symbol>
        <symbol id="ig-arrow-up-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <line x1="7" y1="17" x2="17" y2="7" />
          <polyline points="7 7 17 7 17 17" />
        </symbol>
        <symbol id="ig-star" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </symbol>
        <symbol id="ig-gift" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 12 20 22 4 22 4 12" />
          <rect x="2" y="7" width="20" height="5" />
          <line x1="12" y1="22" x2="12" y2="7" />
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
        </symbol>
        <symbol id="ig-clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </symbol>
        <symbol id="ig-users" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </symbol>
        <symbol id="ig-trending" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </symbol>
        <symbol id="ig-heart" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </symbol>
        <symbol id="ig-brain" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2z" />
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2z" />
        </symbol>
        <symbol id="ig-message" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </symbol>
        <symbol id="ig-book" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </symbol>
        <symbol id="ig-chevron-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </symbol>
        <symbol id="ig-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </symbol>
        <symbol id="ig-shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </symbol>
        <symbol id="ig-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </symbol>
        <symbol id="ig-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </symbol>
        <symbol id="ig-target" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </symbol>
        <symbol id="ig-school" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10L12 3 2 10l10 7 10-7z" />
          <path d="M6 12v5a6 6 0 0 0 12 0v-5" />
        </symbol>
      </defs>
    </svg>
  );
}

type IconId =
  | 'arrow-right'
  | 'arrow-up-right'
  | 'star'
  | 'gift'
  | 'clock'
  | 'users'
  | 'trending'
  | 'heart'
  | 'brain'
  | 'message'
  | 'book'
  | 'chevron-down'
  | 'check'
  | 'shield'
  | 'lock'
  | 'info'
  | 'target'
  | 'school';

function Icon({ id, className, style }: { id: IconId; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} aria-hidden="true">
      <use href={`#ig-${id}`} />
    </svg>
  );
}

/* Map schema outcome icons → sprite symbols. */
const OUTCOME_ICON: Record<string, IconId> = {
  brain: 'brain',
  chat: 'message',
  clock: 'clock',
  heart: 'heart',
  school: 'school',
  users: 'users',
};
const TRUST_ICON: Record<string, IconId> = {
  shield: 'shield',
  lock: 'lock',
  info: 'info',
  star: 'star',
};

/* =======================================================================
 * TOP BAR — thin purple gradient strip, centered uppercase letterspaced
 * ======================================================================= */
function TopBar({ content }: Props) {
  return (
    <div
      className="w-full text-center text-white text-xs md:text-sm font-semibold py-2.5"
      style={{
        background: `linear-gradient(90deg,${LAV.c700},${LAV.c600},${LAV.c700})`,
        letterSpacing: '0.18em',
      }}
    >
      {content.topBar.name}
    </div>
  );
}

/* =======================================================================
 * HERO — two-tone lavender background, headline with serif italic tail,
 * organic 3×3 photo cluster on the right (1 large + 5 small circles).
 * ======================================================================= */
function Hero({ content, speakers }: Props) {
  const h = content.hero;
  const collage = h.collageSpeakerIds.map((id) => speakers[id]).filter((s): s is Speaker => Boolean(s));

  // Overrides: if content supplied explicit photo URLs they win, else we
  // use speaker.photoUrl, else fall back to pravatar.
  const resolvePhoto = (idx: number, s?: Speaker) => {
    const override = h.collagePhotoUrls?.[idx];
    if (override) return override;
    if (s?.photoUrl) return s.photoUrl;
    if (s) return speakerPhoto(s);
    const slot = FALLBACK_AVATAR_SLOTS[idx % FALLBACK_AVATAR_SLOTS.length];
    return `https://i.pravatar.cc/500?img=${slot}`;
  };

  // Ensure we always render 6 photo slots; pad with placeholders if the
  // summit has fewer speakers.
  const photoSlots = Array.from({ length: 6 }, (_, i) => ({
    s: collage[i],
    url: resolvePhoto(i, collage[i]),
    alt: collage[i] ? displayName(collage[i]) : '',
  }));

  return (
    <section className="indigo-gold-hero-bg">
      <div className="max-w-7xl mx-auto px-5 md:px-8 pt-10 pb-16 md:pt-20 md:pb-24 grid md:grid-cols-2 gap-10 md:gap-14 items-center">
        <div>
          <div className="mb-6">
            <EventStatusBadge
              status={h.eventStatus ?? (h.eventStatusLabel ? 'ended' : 'before')}
              dateLabel={h.dateRangeLabel ?? h.eventStatusLabel ?? ''}
              liveLabel={h.liveLabel ?? undefined}
              endedLabel={h.endedLabel ?? h.eventStatusLabel ?? undefined}
              style={{ '--esb-primary': LAV.c700, '--esb-fg': '#ffffff' } as CSSProperties}
            />
          </div>


          <p className="font-bold text-2xl md:text-3xl mb-3 leading-tight" style={{ color: INK.c900 }}>
            {h.eyebrow}
          </p>
          <h1
            className="indigo-gold-display font-bold mb-6"
            style={{
              color: INK.c900,
              fontSize: 'clamp(2.2rem, 4.5vw, 4rem)',
              lineHeight: 1.02,
            }}
          >
            {h.headline}
            {h.headlineItalicTail ? (
              <>
                {' '}
                <span className="italic">{h.headlineItalicTail}</span>
              </>
            ) : null}
          </h1>
          <p className="text-base md:text-lg mb-8 max-w-xl" style={{ color: INK.c800 }}>
            <strong>{h.subheadlineLead}</strong>
            {h.subheadlineTrail}
          </p>

          <a href="#optin" className="indigo-gold-btn-cta indigo-gold-btn-pulse">
            {h.ctaLabel}
            <span className="indigo-gold-btn-arrow">
              <Icon id="arrow-right" className="w-3.5 h-3.5" />
            </span>
          </a>
          {h.ctaNote ? (
            <p className="mt-3 text-sm" style={{ color: LAV.c700 }}>
              {h.ctaNote}
            </p>
          ) : null}

          <div className="mt-6 flex items-center gap-3">
            <div className="flex" style={{ color: SUN.c500 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Icon key={`hstar-${i}`} id="star" className="w-5 h-5" />
              ))}
            </div>
            <p className="text-sm" style={{ color: INK.c800 }}>
              {h.ratingLead}
              <strong>{h.ratingCount}</strong>
              {h.ratingTrail}
            </p>
          </div>

          <p className="mt-5">
            <span
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm"
              style={{ background: 'rgba(255,255,255,0.85)', color: LAV.c700 }}
            >
              <Icon id="gift" className="w-4 h-4" />
              {h.giftNoteLead}
              <strong style={{ color: LAV.c700 }}>{h.giftNoteAccent}</strong>
              {h.giftNoteTrail}
            </span>
          </p>
        </div>

        {/* Organic photo cluster: 1 large + 5 smaller */}
        <div className="relative">
          <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-md mx-auto">
            {/* Large tile, spans 2 cols × 2 rows */}
            <div className="col-start-1 col-span-2 row-span-2">
              <PhotoCircle url={photoSlots[0].url} alt={photoSlots[0].alt} />
            </div>
            <PhotoCircle url={photoSlots[1].url} alt={photoSlots[1].alt} />
            <PhotoCircle url={photoSlots[2].url} alt={photoSlots[2].alt} />
            <PhotoCircle url={photoSlots[3].url} alt={photoSlots[3].alt} />
            <PhotoCircle url={photoSlots[4].url} alt={photoSlots[4].alt} />
            <PhotoCircle url={photoSlots[5].url} alt={photoSlots[5].alt} />
          </div>
          <div
            className="absolute -bottom-4 right-4 bg-white rounded-full shadow-lg px-4 py-2 text-xs font-semibold flex items-center gap-2"
            style={{ color: INK.c800 }}
          >
            <span className="flex" style={{ color: SUN.c500 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Icon key={`hrat-${i}`} id="star" className="w-3.5 h-3.5" />
              ))}
            </span>
            {h.ratingCount} parents
          </div>
        </div>
      </div>
    </section>
  );
}

function PhotoCircle({ url, alt }: { url: string; alt: string }) {
  return (
    <div className="w-full aspect-square rounded-full overflow-hidden shadow-lg">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={alt} className="w-full h-full object-cover" loading="lazy" />
    </div>
  );
}

/* =======================================================================
 * PRESS MARQUEE — greyscale logo strip. Uses the press.outlets from schema
 * (text is rendered as brand-style wordmarks since we don't have logo URLs
 * bundled with every summit).
 * ======================================================================= */
function Press({ content }: { content: IndigoGoldContent }) {
  const outlets = content.press.outlets;
  // Duplicate twice for seamless loop
  const full = [...outlets, ...outlets];
  return (
    <section className="py-10 bg-white">
      <p className="text-center text-xs font-semibold mb-5" style={{ color: LAV.c700, letterSpacing: '0.25em' }}>
        {content.press.eyebrow.toUpperCase()}
      </p>
      <div className="indigo-gold-marquee-wrap">
        <div className="indigo-gold-marquee-track">
          {full.map((name, idx) => (
            <span className="indigo-gold-logo-wordmark" key={`logo-${idx}`}>
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =======================================================================
 * STAT PILLS — 3 gradient pills, white text, rounded-2xl
 * ======================================================================= */
function StatPills({ content }: { content: IndigoGoldContent }) {
  const icons: IconId[] = ['clock', 'trending', 'users'];
  const items = content.stats.items;
  return (
    <section className="py-10 bg-white">
      <div className="max-w-5xl mx-auto px-5 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {items.map((item, idx) => (
          <div
            key={`stat-${idx}`}
            className="flex items-center justify-center gap-3 rounded-2xl px-5 py-4 text-white shadow-lg"
            style={{
              background: `linear-gradient(135deg,${LAV.c700},${LAV.c500})`,
              boxShadow: '0 10px 24px -10px rgba(140,114,191,0.45)',
            }}
          >
            <span
              className="w-10 h-10 rounded-full grid place-items-center"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              <Icon id={icons[idx] ?? 'clock'} className="w-5 h-5" />
            </span>
            <div>
              <p
                className="text-[0.65rem] uppercase"
                style={{ letterSpacing: '0.2em', opacity: 0.8 }}
              >
                {item.label}
              </p>
              <p className="font-bold text-lg leading-tight">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =======================================================================
 * OVERVIEW — two-column "What Is This?" with image
 * ======================================================================= */
function Overview({ content }: { content: IndigoGoldContent }) {
  const o = content.overview;
  const image =
    o.imageUrl ??
    'https://images.unsplash.com/photo-1591343395082-e120087004b4?w=700&auto=format&fit=crop&q=60';

  return (
    <section className="py-16" style={{ background: '#F4EFFA' }}>
      <div className="max-w-6xl mx-auto px-5 md:px-8 grid md:grid-cols-2 gap-12 items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt=""
          className="rounded-2xl shadow-xl w-full max-w-md mx-auto"
          loading="lazy"
        />
        <div>
          <p className="indigo-gold-eyebrow-head mb-2">{o.eyebrow}</p>
          <h2 className="indigo-gold-h2-head mb-5">{o.headline}</h2>
          <div className="space-y-4 leading-relaxed" style={{ color: INK.c800 }}>
            {o.bodyParagraphs.map((para, idx) => (
              <p key={`ovp-${idx}`}>{para}</p>
            ))}
          </div>
          <div className="mt-6">
            <a href="#optin" className="indigo-gold-btn-cta">
              {o.ctaLabel}
              <span className="indigo-gold-btn-arrow">
                <Icon id="arrow-right" className="w-3.5 h-3.5" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =======================================================================
 * SPEAKER GRID — fully derived from the summit's Speaker table. Distinct
 * `speaker.dayNumber` values become day blocks; labels are generated as
 * "DAY N". Adding a speaker with a new day_number makes a new block
 * appear without touching the funnel. If the summit has zero speakers,
 * we render a single placeholder block so preview layouts don't collapse.
 * ======================================================================= */
function groupSpeakersByDay(speakers: Record<string, Speaker>): Array<{ dayNumber: number; speakers: Speaker[] }> {
  const grouped = new Map<number, Speaker[]>();
  for (const s of Object.values(speakers)) {
    if (s.dayNumber === null) continue;
    const bucket = grouped.get(s.dayNumber) ?? [];
    bucket.push(s);
    grouped.set(s.dayNumber, bucket);
  }
  return [...grouped.entries()]
    .sort(([a], [b]) => a - b)
    .map(([dayNumber, list]) => ({
      dayNumber,
      speakers: list.sort((a, b) => a.sortOrder - b.sortOrder),
    }));
}

function SpeakersGrid({ speakers }: Props) {
  const dayBlocks = groupSpeakersByDay(speakers);
  const showPlaceholder = dayBlocks.length === 0;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-5 md:px-8 text-center">
        <p className="indigo-gold-eyebrow-head mb-2">Learn From These</p>
        <h2 className="indigo-gold-h2-head mb-12">40+ World-Leading Experts and Authorities</h2>

        {showPlaceholder ? (
          <PlaceholderDayBlock dayNumber={1} count={6} />
        ) : (
          dayBlocks.map(({ dayNumber, speakers: daySpeakers }) => (
            <div key={`day-${dayNumber}`} className="mb-16">
              <p className="indigo-gold-eyebrow-head mb-1">DAY {dayNumber}</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
                {daySpeakers.map((s) => (
                  <SpeakerCard key={s.id} speaker={s} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function PlaceholderDayBlock({ dayNumber, count }: { dayNumber: number; count: number }) {
  return (
    <div className="mb-16">
      <p className="indigo-gold-eyebrow-head mb-1">DAY {dayNumber}</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={`placeholder-${idx}`}
            className="indigo-gold-spk"
            style={{ opacity: 0.45 }}
            aria-hidden="true"
          >
            <div className="flex gap-4 items-start p-4">
              <div
                className="indigo-gold-spk-ava"
                style={{ background: '#E5E7EB', flexShrink: 0 }}
              />
              <div className="flex-1 space-y-2">
                <div className="h-4 rounded" style={{ background: '#E5E7EB', width: '70%' }} />
                <div className="h-3 rounded" style={{ background: '#F3F4F6', width: '50%' }} />
                <div className="h-3 rounded mt-3" style={{ background: '#F3F4F6', width: '85%' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm" style={{ color: INK.c700 }}>
        Speakers coming soon — assign them a day in the admin to see them here.
      </p>
    </div>
  );
}

function SpeakerCard({ speaker }: { speaker: Speaker }) {
  const quote = speaker.masterclassTitle;
  const credentials = speaker.title;
  const longBio = speaker.longBio ?? speaker.shortBio ?? '';

  return (
    <details className="indigo-gold-spk">
      <summary>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="indigo-gold-spk-ava" src={speakerPhoto(speaker, 200)} alt={displayName(speaker)} loading="lazy" />
        <div>
          <p className="font-bold" style={{ color: INK.c900 }}>
            {displayName(speaker)}
          </p>
          {credentials ? (
            <p className="text-xs mt-1" style={{ color: INK.c700 }}>
              {credentials}
            </p>
          ) : null}
          {quote ? (
            <p className="text-sm italic mt-2" style={{ color: LAV.c700 }}>
              &ldquo;{quote}&rdquo;
            </p>
          ) : null}
        </div>
      </summary>
      {longBio ? <div className="indigo-gold-spk-body">{longBio}</div> : null}
    </details>
  );
}

/* =======================================================================
 * OUTCOMES — white pills with icons ("You'll Discover How To…" row)
 * ======================================================================= */
function Outcomes({ content }: { content: IndigoGoldContent }) {
  const o = content.outcomes;
  return (
    <section className="py-16" style={{ background: '#F4EFFA' }}>
      <div className="max-w-6xl mx-auto px-5 md:px-8 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="indigo-gold-eyebrow-head mb-2">{o.eyebrow}</p>
          <h2 className="indigo-gold-h2-head mb-8">{o.headline}</h2>
          <ul className="space-y-4">
            {o.items.map((item, idx) => (
              <li key={`out-${idx}`} className="flex gap-4 items-start">
                <span
                  className="w-11 h-11 rounded-full grid place-items-center flex-shrink-0 shadow"
                  style={{ background: '#fff', color: LAV.c700 }}
                >
                  <Icon id={OUTCOME_ICON[item.icon] ?? 'heart'} className="w-5 h-5" />
                </span>
                <p>
                  <strong style={{ color: INK.c900 }}>{item.title}</strong>
                  <span style={{ color: INK.c800 }}>
                    {' — '}
                    {item.description}
                  </span>
                </p>
              </li>
            ))}
          </ul>
          <a href="#optin" className="indigo-gold-btn-cta mt-6">
            Get Instant Access
            <span className="indigo-gold-btn-arrow">
              <Icon id="arrow-right" className="w-3.5 h-3.5" />
            </span>
          </a>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=700&auto=format&fit=crop&q=60"
          alt=""
          className="rounded-2xl shadow-xl w-full max-w-md mx-auto"
          loading="lazy"
        />
      </div>
    </section>
  );
}

/* =======================================================================
 * FREE GIFT — "mastery collection" panel with card mock + bullets
 * ======================================================================= */
function FreeGift({ content, speakers }: Props) {
  const g = content.freeGift;
  const heroCollage = content.hero.collageSpeakerIds
    .map((id) => speakers[id])
    .filter((s): s is Speaker => Boolean(s))
    .slice(0, 3);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-5 md:px-8 grid md:grid-cols-2 gap-12 items-center">
        <div className="relative">
          <div
            className="rounded-2xl overflow-hidden shadow-2xl aspect-video grid place-items-center text-white relative"
            style={{ background: INK.c900 }}
          >
            <div className="absolute inset-x-0 top-4 flex justify-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.3)' }} />
              <span className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.3)' }} />
              <span className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.3)' }} />
            </div>
            <div className="flex gap-3 px-6">
              {(heroCollage.length > 0 ? heroCollage : [undefined, undefined, undefined]).map((s, idx) => (
                <div
                  key={`gift-mini-${idx}`}
                  className="w-20 h-24 rounded-lg bg-cover bg-center"
                  style={{
                    background: s
                      ? `#C5B5E4 url(${speakerPhoto(s, 200)}) center/cover`
                      : `linear-gradient(135deg,${LAV.c400},${LAV.c600})`,
                  }}
                />
              ))}
            </div>
            <div className="absolute bottom-5 left-5 right-5 text-center">
              <p className="text-[0.6rem]" style={{ letterSpacing: '0.4em', opacity: 0.7 }}>
                {g.badgeLabel}
              </p>
              <p className="indigo-gold-display text-2xl italic">{g.cardTitle}</p>
            </div>
          </div>
        </div>
        <div>
          <p className="indigo-gold-eyebrow-head mb-2">{g.eyebrow}</p>
          <h2 className="indigo-gold-h2-head mb-5">{g.headline}</h2>
          <p className="font-semibold mb-4" style={{ color: INK.c800 }}>
            {g.body}
          </p>
          <ul className="space-y-3 list-disc pl-5 mb-6" style={{ color: INK.c800 }}>
            {g.bullets.map((bullet, idx) => (
              <li key={`gift-b-${idx}`}>{bullet}</li>
            ))}
          </ul>
          <a href="#optin" className="indigo-gold-btn-cta">
            {g.ctaLabel}
            <span className="indigo-gold-btn-arrow">
              <Icon id="arrow-right" className="w-3.5 h-3.5" />
            </span>
          </a>
          <p className="text-sm mt-3" style={{ color: LAV.c700 }}>
            {g.cardNote}
          </p>
        </div>
      </div>
    </section>
  );
}

/* =======================================================================
 * HOSTS / FOUNDERS — "We're Changing The Way" centered white panel
 * ======================================================================= */
function Founders({ content }: { content: IndigoGoldContent }) {
  const f = content.founders;
  return (
    <section className="py-16" style={{ background: '#F4EFFA' }}>
      <div className="max-w-6xl mx-auto px-5 md:px-8 text-center">
        <p className="indigo-gold-eyebrow-head mb-2">From the</p>
        <h2 className="indigo-gold-h2-head mb-12">{f.headline}</h2>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-3xl mx-auto text-left">
          <div className="flex justify-center gap-8 mb-8 flex-wrap">
            {f.items.map((founder, idx) => (
              <div key={`fndr-${idx}`} className="text-center">
                <div
                  className="w-24 h-24 rounded-full mx-auto flex items-center justify-center indigo-gold-display font-bold text-2xl"
                  style={{
                    background: `linear-gradient(135deg,${LAV.c400},${LAV.c600})`,
                    color: '#fff',
                    border: `4px solid ${LAV.c300}`,
                  }}
                >
                  {founder.initials}
                </div>
                <p className="font-bold mt-3" style={{ color: INK.c900 }}>
                  {founder.name}
                </p>
                <p className="text-xs max-w-[180px] mx-auto" style={{ color: INK.c700 }}>
                  {founder.role}
                </p>
              </div>
            ))}
          </div>
          <div className="space-y-4 leading-relaxed" style={{ color: INK.c800 }}>
            {f.items.map((founder, idx) => (
              <p key={`fndrq-${idx}`}>
                <strong>{founder.name}:</strong> &ldquo;{founder.quote}&rdquo;
              </p>
            ))}
          </div>
          <div className="text-center mt-6">
            <a href="#optin" className="indigo-gold-btn-cta">
              Get Instant Access
              <span className="indigo-gold-btn-arrow">
                <Icon id="arrow-right" className="w-3.5 h-3.5" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =======================================================================
 * TESTIMONIALS — quote cards with quotation marks
 * ======================================================================= */
function Testimonials({ content }: { content: IndigoGoldContent }) {
  const t = content.testimonials;
  return (
    <section className="py-16" style={{ background: '#F4EFFA' }}>
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="text-center mb-10">
          <p className="indigo-gold-eyebrow-head mb-2">{t.eyebrow}</p>
          <h2 className="indigo-gold-h2-head">{t.headline}</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {t.items.map((item, idx) => (
            <div key={`testi-${idx}`} className="indigo-gold-testi">
              <span className="indigo-gold-testi-qmark indigo-gold-testi-qmark-l">&ldquo;</span>
              <span className="indigo-gold-testi-qmark indigo-gold-testi-qmark-r">&rdquo;</span>
              <div
                className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center indigo-gold-display font-bold"
                style={{
                  background: `linear-gradient(135deg,${LAV.c400},${LAV.c600})`,
                  color: '#fff',
                }}
              >
                {item.initials}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: INK.c800 }}>
                &ldquo;{item.quote}&rdquo;
              </p>
              <p className="text-xs mt-3 font-semibold text-center" style={{ color: LAV.c700 }}>
                — {item.name}, {item.location}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =======================================================================
 * BONUSES — soft lavender cards with checklist and value pricing
 * ======================================================================= */
function Bonuses({ content }: { content: IndigoGoldContent }) {
  const b = content.bonuses;
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-5 md:px-8 text-center">
        <p className="indigo-gold-eyebrow-head mb-2">{b.eyebrow}</p>
        <h2 className="indigo-gold-h2-head mb-12">{b.headline}</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {b.items.map((bonus, idx) => (
            <article
              key={`bonus-${idx}`}
              className="rounded-2xl p-6 flex flex-col gap-3"
              style={{ background: LAV.c50, border: `1px solid ${LAV.c200}` }}
            >
              <span
                className="self-start text-xs font-bold rounded-full px-3 py-1"
                style={{ background: '#fff', color: LAV.c700, border: `1px solid ${LAV.c200}` }}
              >
                {bonus.valueLabel}
              </span>
              <h3 className="font-bold text-lg" style={{ color: INK.c900 }}>
                {bonus.title}
              </h3>
              <p className="text-sm" style={{ color: INK.c700 }}>
                {bonus.description}
              </p>
              <ul className="space-y-2 text-sm" style={{ color: INK.c800 }}>
                {bonus.bullets.map((bullet, bIdx) => (
                  <li key={`bonus-${idx}-b-${bIdx}`} className="flex items-start gap-2">
                    <span
                      className="w-5 h-5 rounded-full grid place-items-center flex-shrink-0 mt-0.5"
                      style={{ background: '#DCFCE7', color: '#16A34A' }}
                    >
                      <Icon id="check" className="w-3 h-3" />
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <a href="#optin" className="indigo-gold-btn-cta mt-12">
          {b.ctaLabel}
          <span className="indigo-gold-btn-arrow">
            <Icon id="arrow-right" className="w-3.5 h-3.5" />
          </span>
        </a>
      </div>
    </section>
  );
}

/* =======================================================================
 * PULL QUOTE
 * ======================================================================= */
function PullQuote({ content }: { content: IndigoGoldContent }) {
  const pq = content.pullQuote;
  return (
    <section className="py-14 md:py-20" style={{ background: INK.c900 }}>
      <div className="max-w-3xl mx-auto px-6 text-center">
        <svg
          className="w-10 h-10 mx-auto mb-4"
          fill="currentColor"
          viewBox="0 0 24 24"
          style={{ color: LAV.c300, opacity: 0.6 }}
          aria-hidden="true"
        >
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
        </svg>
        <p className="indigo-gold-display font-bold text-2xl md:text-3xl text-white leading-relaxed italic">
          &ldquo;{pq.quote}&rdquo;
        </p>
        <p className="font-medium text-sm mt-4" style={{ color: LAV.c300 }}>
          {pq.attribution}
        </p>
      </div>
    </section>
  );
}

/* =======================================================================
 * FIGURES — "Why This Matters" soft-card grid with icons
 * ======================================================================= */
function Figures({ content }: { content: IndigoGoldContent }) {
  const f = content.figures;
  const icons: IconId[] = ['brain', 'users', 'heart', 'message', 'book', 'target'];
  return (
    <section className="py-16" style={{ background: '#F4EFFA' }}>
      <div className="max-w-5xl mx-auto px-5 md:px-8 text-center">
        <p className="indigo-gold-eyebrow-head mb-2">{f.eyebrow}</p>
        <h2 className="indigo-gold-h2-head mb-10">{f.headline}</h2>
        <div className="grid md:grid-cols-2 gap-4 text-left">
          {f.items.map((item, idx) => (
            <div key={`fig-${idx}`} className="indigo-gold-factcard">
              <div className="indigo-gold-factcard-ico">
                <Icon id={icons[idx % icons.length]} className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-lg" style={{ color: INK.c900 }}>
                  {item.value}
                </p>
                <p className="text-sm" style={{ color: INK.c800 }}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =======================================================================
 * SHIFTS — "5 Reasons you can't miss this Summit" style panel
 * ======================================================================= */
function Shifts({ content }: { content: IndigoGoldContent }) {
  const s = content.shifts;
  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-5 md:px-8 text-center">
        <p className="indigo-gold-eyebrow-head mb-2">{s.eyebrow}</p>
        <h2 className="indigo-gold-h2-head mb-10">{s.headline}</h2>
        <div
          className="rounded-2xl p-8 md:p-10 text-left space-y-5 shadow"
          style={{ background: LAV.c50 }}
        >
          {s.items.map((item, idx) => (
            <p key={`shift-${idx}`} className="flex gap-3">
              <span
                className="w-8 h-8 rounded-full grid place-items-center flex-shrink-0"
                style={{ background: '#DCFCE7', color: '#16A34A' }}
              >
                <Icon id="arrow-up-right" className="w-4 h-4" />
              </span>
              <span style={{ color: INK.c800 }}>
                <strong style={{ color: INK.c900 }}>{item.title}.</strong> {item.description}
              </span>
            </p>
          ))}
        </div>
        <a href="#optin" className="indigo-gold-btn-cta mt-8">
          Get Instant Access
          <span className="indigo-gold-btn-arrow">
            <Icon id="arrow-right" className="w-3.5 h-3.5" />
          </span>
        </a>
      </div>
    </section>
  );
}

/* =======================================================================
 * CLOSING CTA — lavender gradient block with chips + final CTA
 * ======================================================================= */
function ClosingCTA({ content }: { content: IndigoGoldContent }) {
  const c = content.closing;
  return (
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-5 md:px-8 text-center">
        <p className="indigo-gold-eyebrow-head mb-2">Whatever Your Situation, We Believe Every Child Is Capable Of More</p>
        <h2 className="indigo-gold-h2-head mb-8">{c.headline}</h2>
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {c.chips.map((chip, idx) => (
            <span key={`chip-${idx}`} className="indigo-gold-plus-pill">
              <span className="indigo-gold-plus-pill-plus">+</span>
              {chip}
            </span>
          ))}
        </div>
        <a href="#optin" className="indigo-gold-btn-cta">
          {c.ctaLabel}
          <span className="indigo-gold-btn-arrow">
            <Icon id="arrow-right" className="w-3.5 h-3.5" />
          </span>
        </a>
      </div>
    </section>
  );
}

/* =======================================================================
 * FAQ — accordion with lavender border & chevron
 * ======================================================================= */
function FAQ({ content }: { content: IndigoGoldContent }) {
  return (
    <section className="py-16" style={{ background: '#F4EFFA' }}>
      <div className="max-w-3xl mx-auto px-5 md:px-8">
        <div className="text-center mb-10">
          <p className="indigo-gold-eyebrow-head mb-2">{content.faqSection.eyebrow}</p>
          <h2 className="indigo-gold-h2-head">{content.faqSection.headline}</h2>
        </div>
        {content.faqs.map((faq, idx) => (
          <details className="indigo-gold-qa" key={`faq-${idx}`}>
            <summary>
              <span>{faq.question}</span>
              <Icon id="chevron-down" className="w-5 h-5" style={{ color: LAV.c700 }} />
            </summary>
            <div className="indigo-gold-qa-body">{faq.answer}</div>
          </details>
        ))}
        <div className="text-center mt-8">
          <a href="#optin" className="indigo-gold-btn-cta">
            Get Instant Access
            <span className="indigo-gold-btn-arrow">
              <Icon id="arrow-right" className="w-3.5 h-3.5" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

/* =======================================================================
 * TRUST BADGES — thin row above stat pills
 * ======================================================================= */
function TrustBadges({ content }: { content: IndigoGoldContent }) {
  return (
    <section className="bg-white py-5" style={{ borderBottom: `1px solid ${LAV.c100}` }}>
      <div className="max-w-4xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm" style={{ color: INK.c700 }}>
        {content.trustBadges.items.map((item, idx) => (
          <span key={`trust-${idx}`} className="flex items-center gap-2">
            <Icon
              id={TRUST_ICON[item.icon] ?? 'shield'}
              className="w-4 h-4"
              style={{ color: item.icon === 'star' ? SUN.c500 : LAV.c700 }}
            />
            {item.label}
          </span>
        ))}
      </div>
    </section>
  );
}

/* =======================================================================
 * FOOTER — lavender 50 bg, serif-italic brand wordmark, small nav
 * ======================================================================= */
function Footer({ content }: { content: IndigoGoldContent }) {
  const f = content.footer;
  return (
    <footer className="py-10" style={{ background: LAV.c50, borderTop: `1px solid ${LAV.c200}` }}>
      <div className="max-w-4xl mx-auto px-5 md:px-8 text-center">
        <p className="indigo-gold-display italic text-xl mb-4" style={{ color: LAV.c700 }}>
          {f.brandName}
        </p>
        <nav className="text-sm flex flex-wrap justify-center gap-6" style={{ color: INK.c700 }}>
          {f.links.map((link, idx) => (
            <a key={`foot-${idx}`} href={link.href} className="hover:underline">
              {link.label}
            </a>
          ))}
        </nav>
        <p className="text-xs mt-3" style={{ color: INK.c700 }}>
          {f.copyright}
        </p>
      </div>
    </footer>
  );
}

/* =======================================================================
 * MOBILE STICKY CTA
 * ======================================================================= */
function StickyMobileCTA({ content }: { content: IndigoGoldContent }) {
  return (
    <a href="#optin" className="indigo-gold-stick-mobile">
      <span className="indigo-gold-btn-cta" style={{ padding: '.7rem 1.25rem' }}>
        {content.mobileCta.ctaLabel}
        <span className="indigo-gold-btn-arrow">
          <Icon id="arrow-right" className="w-3.5 h-3.5" />
        </span>
      </span>
    </a>
  );
}

/* =======================================================================
 * ============  SALES-PAGE SECTIONS (ported from LavenderGold)  =========
 * -----------------------------------------------------------------------
 * All sales sections are optional in the schema; each component guards
 * with `if (!content.xxx) return null;` so optin pages (which omit these
 * fields) render cleanly. Visual styling mirrors the former lavender-gold
 * template so existing sales pages look identical after the family merge.
 * ======================================================================= */

const LAV_SALES = {
  LAV50: '#F4F0FB',
  LAV100: '#ECE6F7',
  LAV200: '#DDD2F0',
  LAV300: '#C5B5E4',
  LAV400: '#A891D1',
  LAV500: '#8C72BF',
  LAV700: '#5A4589',
  SUN400: '#FFD93D',
  SUN300: '#FFE066',
  INK900: '#1B132C',
  INK800: '#2A1F3F',
  INK700: '#3C2E54',
};

const salesIconLabels: Record<string, string> = {
  'infinity': 'Unlimited Access',
  'clipboard': 'Action Blueprints',
  'headphones': 'Audio Edition',
  'captions': 'Subtitles',
  'file-text': 'Transcripts',
  'book': 'Workbook',
};

function SalesBonusIcon({ icon }: { icon: string }) {
  const label = salesIconLabels[icon] ?? icon;
  const color = LAV_SALES.LAV700;
  if (icon === 'infinity') {
    return (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label={label}>
        <path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z" />
      </svg>
    );
  }
  if (icon === 'clipboard') {
    return (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label={label}>
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      </svg>
    );
  }
  if (icon === 'headphones') {
    return (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label={label}>
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      </svg>
    );
  }
  if (icon === 'captions') {
    return (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label={label}>
        <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
        <path d="M7 15h4" /><path d="M15 15h2" /><path d="M7 11h2" /><path d="M13 11h4" />
      </svg>
    );
  }
  if (icon === 'file-text') {
    return (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label={label}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    );
  }
  if (icon === 'book') {
    return (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label={label}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    );
  }
  return null;
}

function SalesCheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 3 }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function SalesXIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SalesArrowRight({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function SalesGiftIcon({ size = 20, color = '#8a6b00' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  );
}

/* Sales CTA button (yellow pill) — same visual as LavenderGold.btnCta. */
const salesBtnCta: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '1rem 2rem',
  background: LAV_SALES.SUN400,
  color: LAV_SALES.INK900,
  fontWeight: 700,
  fontSize: '1.05rem',
  borderRadius: '9999px',
  boxShadow: '0 6px 18px -4px rgba(233,182,12,.55), inset 0 -3px 0 rgba(0,0,0,.06)',
  letterSpacing: '.02em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  border: 'none',
  cursor: 'pointer',
};

const salesBtnCtaLg: CSSProperties = { ...salesBtnCta, padding: '1.15rem 2.4rem', fontSize: '1.15rem' };

/* SALES HERO — red live badge, gradient product mockup, pulsing gold CTA. */
function SalesHero({
  content,
  wpCheckoutRedirectUrl,
}: { content: IndigoGoldContent; wpCheckoutRedirectUrl?: string | null }) {
  if (!content.salesHero) return null;
  const h = content.salesHero;
  const topName = content.topBar.name;
  return (
    <section style={{ padding: '2.5rem 1.25rem 4rem', background: 'linear-gradient(180deg,#F4EFFA 0%,#FFFFFF 60%)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.18em', color: '#fff', background: '#dc2626', borderRadius: 9999, padding: '0.5rem 1rem', marginBottom: '1.5rem', textTransform: 'uppercase', boxShadow: '0 4px 14px rgba(220,38,38,.3)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
          {h.badge}
        </span>

        <h1 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', lineHeight: 1.2, letterSpacing: '-0.01em', color: LAV_SALES.INK900, marginBottom: '1rem' }}>
          {h.headline.split('40+').map((part, i, arr) =>
            i < arr.length - 1
              ? <span key={i}>{part}<span style={{ background: LAV_SALES.SUN300, padding: '0 0.3rem', borderRadius: 6 }}>40+</span></span>
              : <span key={i}>{part}</span>
          )}
        </h1>

        <p style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', fontStyle: 'italic', fontSize: 'clamp(1.1rem,2vw,1.4rem)', color: LAV_SALES.LAV700, maxWidth: 680, margin: '0 auto 2rem' }}>
          {h.subheadline}
        </p>

        {/* Product mockup */}
        <div style={{ maxWidth: 560, margin: '0 auto 2rem', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 48px rgba(90,69,137,.3)', aspectRatio: '16/9', background: `linear-gradient(135deg,${LAV_SALES.LAV700},${LAV_SALES.LAV500})`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.3, background: `radial-gradient(circle at 20% 50%,${LAV_SALES.LAV300},transparent 50%),radial-gradient(circle at 80% 50%,${LAV_SALES.SUN300},transparent 40%)` }} />
          <div style={{ position: 'relative', textAlign: 'center', color: '#fff', padding: '1.5rem' }}>
            <p style={{ fontSize: '0.6rem', letterSpacing: '0.4em', textTransform: 'uppercase', opacity: 0.7, marginBottom: '0.5rem' }}>Full Access</p>
            <p style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', fontSize: 'clamp(2rem,5vw,4rem)', fontStyle: 'italic', margin: 0 }}>{h.productLabel}</p>
            <p style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '0.5rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>{topName}</p>
          </div>
        </div>

        <p style={{ fontSize: '0.88rem', color: LAV_SALES.INK700, marginBottom: '0.5rem' }}>
          Total value: <span style={{ fontWeight: 700, color: LAV_SALES.LAV700, textDecoration: 'line-through' }}>{h.totalValue}</span>
        </p>
        <a href={resolveCheckoutHref(wpCheckoutRedirectUrl)} id="purchase" className="indigo-gold-sales-pulse" style={salesBtnCtaLg}>
          {h.ctaLabel} <SalesArrowRight size={20} />
        </a>
        <p style={{ marginTop: '1rem', fontSize: '0.88rem', color: LAV_SALES.LAV700 }}>
          <strong>{h.ctaNote}</strong>
        </p>
      </div>
    </section>
  );
}

/* INTRO — centered serif eyebrow + body paragraphs. */
function Intro({ content }: { content: IndigoGoldContent }) {
  if (!content.intro) return null;
  const i = content.intro;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: '#fff' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', fontStyle: 'italic', color: LAV_SALES.INK700, fontWeight: 500, fontSize: '1.35rem', marginBottom: '0.5rem' }}>{i.eyebrow}</p>
        <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: LAV_SALES.INK900, lineHeight: 1.15, marginBottom: '1.5rem' }}>{i.headline}</h2>
        {i.paragraphs.map((p, idx) => (
          <p key={idx} style={{ color: LAV_SALES.INK800, fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '1rem' }}>{p}</p>
        ))}
      </div>
    </section>
  );
}

/* VIP BONUSES — lavender card grid with icon tiles. */
function VipBonuses({ content }: { content: IndigoGoldContent }) {
  if (!content.vipBonuses) return null;
  const v = content.vipBonuses;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: LAV_SALES.LAV50 }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', fontStyle: 'italic', color: LAV_SALES.INK700, fontWeight: 500, fontSize: '1.35rem', marginBottom: '0.25rem' }}>{v.eyebrow}</p>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: LAV_SALES.INK900, lineHeight: 1.15 }}>{v.headline}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem' }}>
          {v.items.map((item, i) => (
            <div key={i} style={{ background: '#fff', border: `1px solid ${LAV_SALES.LAV200}`, borderRadius: 20, boxShadow: '0 10px 24px -14px rgba(90,69,137,.3)', overflow: 'hidden', position: 'relative' }}>
              <div style={{ background: `linear-gradient(135deg,${LAV_SALES.LAV50},${LAV_SALES.LAV200})`, aspectRatio: '16/10', display: 'grid', placeItems: 'center', color: LAV_SALES.LAV700, fontFamily: '"Cormorant Garamond",Georgia,serif', fontStyle: 'italic', fontSize: '1.2rem', textAlign: 'center', padding: '1.25rem', flexDirection: 'column' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <SalesBonusIcon icon={item.icon} />
                  <span>{salesIconLabels[item.icon]}</span>
                </div>
              </div>
              <div style={{ padding: '1.5rem 1.5rem 1rem' }}>
                <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: LAV_SALES.INK900, marginBottom: '0.4rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.88rem', color: LAV_SALES.INK700, lineHeight: 1.6, marginBottom: '0.75rem' }}>{item.description}</p>
                <span style={{ display: 'inline-block', background: '#fff', border: `1px solid ${LAV_SALES.LAV300}`, color: LAV_SALES.LAV700, fontWeight: 700, fontSize: '.7rem', letterSpacing: '.1em', padding: '.3rem .7rem', borderRadius: 9999 }}>{item.valueLabel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* FREE GIFTS — yellow/gold card grid with gift icon tiles. */
function FreeGifts({ content }: { content: IndigoGoldContent }) {
  if (!content.freeGifts) return null;
  const fg = content.freeGifts;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: '#fff' }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', fontStyle: 'italic', color: LAV_SALES.INK700, fontWeight: 500, fontSize: '1.35rem', marginBottom: '0.25rem' }}>{fg.eyebrow}</p>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: LAV_SALES.INK900, lineHeight: 1.15 }}>{fg.headline}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1.25rem' }}>
          {fg.items.map((gift, i) => (
            <div key={i} style={{ background: '#FFF8E6', border: '1px solid #F0E1A8', borderRadius: 20, boxShadow: '0 10px 24px -14px rgba(233,182,12,.3)', overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(135deg,#FFF6D6,#FFE07A)', aspectRatio: '16/10', display: 'grid', placeItems: 'center', color: '#8a6b00', fontFamily: '"Cormorant Garamond",Georgia,serif', fontStyle: 'italic', fontSize: '1.2rem', textAlign: 'center', padding: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <SalesGiftIcon size={40} color="#8a6b00" />
                  <span>Free Gift #{gift.giftNumber}</span>
                </div>
              </div>
              <div style={{ padding: '1.5rem 1.5rem 1rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '.15em', color: '#dc2626', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Free Gift #{gift.giftNumber}</p>
                <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: LAV_SALES.INK900, marginBottom: '0.4rem' }}>{gift.title}</h3>
                <p style={{ fontSize: '0.88rem', color: LAV_SALES.INK700, lineHeight: 1.6, marginBottom: '0.75rem' }}>{gift.description}</p>
                <span style={{ display: 'inline-block', background: '#fff', border: '1px solid #F0DD8A', color: '#8a6b00', fontWeight: 700, fontSize: '.7rem', letterSpacing: '.1em', padding: '.3rem .7rem', borderRadius: 9999 }}>{gift.valueLabel}</span>
              </div>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: LAV_SALES.INK700 }}>{fg.deliveryNote}</p>
      </div>
    </section>
  );
}

/* UPGRADE SECTION — centered eyebrow/headline + paragraphs preamble
 * (without the adjacent price card — PriceCard is now its own section). */
function UpgradeSection({ content }: { content: IndigoGoldContent }) {
  if (!content.upgradeSection) return null;
  const u = content.upgradeSection;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: LAV_SALES.LAV50 }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', fontStyle: 'italic', color: LAV_SALES.INK700, fontWeight: 500, fontSize: '1.35rem', marginBottom: '0.25rem' }}>{u.eyebrow}</p>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: LAV_SALES.INK900, lineHeight: 1.15, marginBottom: '1.5rem' }}>{u.headline}</h2>
          {u.paragraphs.map((p, i) => (
            <p key={i} style={{ color: LAV_SALES.INK800, fontSize: '1rem', lineHeight: 1.7, marginBottom: '0.75rem', maxWidth: 680, margin: '0 auto 0.75rem' }}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

/* PRICE CARD — white card with lavender border, bullet features, gift box,
 * strikethrough value, large green price, pulse CTA. */
function PriceCard({
  content,
  wpCheckoutRedirectUrl,
}: { content: IndigoGoldContent; wpCheckoutRedirectUrl?: string | null }) {
  if (!content.priceCard) return null;
  const p = content.priceCard;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: '#fff' }} id="purchase">
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{
          background: '#fff',
          border: `2px solid ${LAV_SALES.LAV400}`,
          borderRadius: 24,
          boxShadow: '0 24px 44px -24px rgba(90,69,137,.35)',
          padding: '1.75rem 1.5rem',
          position: 'relative',
          overflow: 'hidden',
          maxWidth: 480,
          width: '100%',
          margin: '0 auto',
        }}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 6, background: `linear-gradient(90deg,${LAV_SALES.LAV500},${LAV_SALES.LAV300},${LAV_SALES.LAV500})` }} />

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#dc2626', color: '#fff', padding: '.35rem .85rem', borderRadius: 9999, fontWeight: 700, fontSize: '.72rem', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            {p.badge}
          </div>

          <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '1.2rem', color: LAV_SALES.INK900, marginBottom: '0.5rem', lineHeight: 1.3 }}>{p.headline}</h3>
          <p style={{ fontSize: '0.88rem', color: LAV_SALES.INK700, marginBottom: '0.5rem' }}>{p.note}</p>

          <ul style={{ padding: 0, listStyle: 'none', margin: '1rem 0 1.25rem' }}>
            {p.features.map((f, i) => (
              <li key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', padding: '0.35rem 0', fontSize: '0.95rem', color: LAV_SALES.INK800, lineHeight: 1.45 }}>
                <SalesCheckIcon />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <div style={{ background: '#FFF8E6', border: '1px solid #F0E1A8', borderRadius: 12, padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
            <p style={{ fontWeight: 700, fontSize: '0.85rem', color: LAV_SALES.INK700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <SalesGiftIcon size={16} /> {p.giftsBoxTitle}
            </p>
            {p.giftItems.map((g, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.9rem', padding: '0.3rem 0', color: LAV_SALES.INK700 }}>
                <SalesCheckIcon />
                <span>{g}</span>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', borderTop: `1px solid ${LAV_SALES.LAV100}`, paddingTop: '1.25rem' }}>
            <p style={{ color: LAV_SALES.LAV700, textDecoration: 'line-through', fontWeight: 500, fontSize: '0.95rem', marginBottom: '0.25rem' }}>
              Total value: {p.totalValue} — Regular price: {p.regularPrice}
            </p>
            <p style={{ fontSize: '2.6rem', fontWeight: 800, color: '#16A34A', letterSpacing: '-0.02em', lineHeight: 1 }}>{p.currentPrice}</p>
            <p style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600, marginBottom: '1rem' }}>{p.savings}</p>
            <a href={resolveCheckoutHref(wpCheckoutRedirectUrl)} style={salesBtnCtaLg}>
              {p.ctaLabel} <SalesArrowRight size={20} />
            </a>
            <p style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: LAV_SALES.LAV700 }}>{p.guarantee}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* SALES SPEAKERS — grouped by day. Uses the same day-derivation logic as
 * the optin SpeakersGrid: distinct `speaker.dayNumber` values become day
 * sub-blocks under the section's operator-editable eyebrow/headline. New
 * day_number on a speaker = new sub-block, no funnel edit. */
function SalesSpeakers({ content, speakers }: { content: IndigoGoldContent; speakers: Record<string, Speaker> }) {
  if (!content.salesSpeakers) return null;
  const s = content.salesSpeakers;
  const dayBlocks = groupSpeakersByDay(speakers);
  if (dayBlocks.length === 0) return null;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: '#fff' }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', fontStyle: 'italic', color: LAV_SALES.INK700, fontWeight: 500, fontSize: '1.35rem', marginBottom: '0.25rem' }}>{s.eyebrow}</p>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: LAV_SALES.INK900, lineHeight: 1.15 }}>{s.headline}</h2>
        </div>
        {dayBlocks.map(({ dayNumber, speakers: daySpeakers }) => (
          <div key={`sales-day-${dayNumber}`} style={{ marginBottom: '2.5rem' }}>
            <p style={{ textAlign: 'center', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '.15em', textTransform: 'uppercase', color: LAV_SALES.LAV700, marginBottom: '1rem' }}>
              DAY {dayNumber}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1rem' }}>
              {daySpeakers.map((spk) => (
                <details key={spk.id} className="indigo-gold-sales-spk" style={{ background: '#fff', border: `1px solid ${LAV_SALES.LAV200}`, borderRadius: 16, boxShadow: '0 6px 18px -10px rgba(90,69,137,.25)', marginBottom: 0, overflow: 'hidden' }}>
                  <summary style={{ cursor: 'pointer', listStyle: 'none', padding: '1.5rem 1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem' }}>
                    {spk.photoUrl
                      ? /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={spk.photoUrl} alt={`${spk.firstName} ${spk.lastName}`} style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${LAV_SALES.LAV300}`, boxShadow: `0 0 0 4px #fff, 0 6px 14px -4px rgba(90,69,137,.35)` }} />
                      : <div style={{ width: 84, height: 84, borderRadius: '50%', background: `linear-gradient(135deg,${LAV_SALES.LAV200},${LAV_SALES.LAV400})`, border: `3px solid ${LAV_SALES.LAV300}`, display: 'grid', placeItems: 'center', color: LAV_SALES.LAV700, fontFamily: '"Cormorant Garamond",Georgia,serif', fontSize: '1.8rem', fontStyle: 'italic' }}>
                          {spk.firstName[0]}{spk.lastName[0]}
                        </div>
                    }
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <p style={{ fontWeight: 700, fontSize: '0.95rem', color: LAV_SALES.INK900, margin: 0 }}>{spk.firstName} {spk.lastName}</p>
                      <p style={{ fontSize: '0.78rem', color: LAV_SALES.LAV700, margin: 0 }}>{spk.title}</p>
                      <p style={{ fontSize: '0.78rem', color: LAV_SALES.INK700, margin: 0, fontStyle: 'italic' }}>{spk.masterclassTitle}</p>
                    </div>
                  </summary>
                  {spk.shortBio && (
                    <p style={{ padding: '0 1.5rem 1.5rem', color: LAV_SALES.INK700, fontSize: '0.88rem', lineHeight: 1.6, margin: 0, textAlign: 'center' }}>{spk.shortBio}</p>
                  )}
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* COMPARISON TABLE — Free Pass vs VIP Pass side-by-side. */
function ComparisonTable({ content }: { content: IndigoGoldContent }) {
  if (!content.comparisonTable) return null;
  const c = content.comparisonTable;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: LAV_SALES.LAV50 }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', fontStyle: 'italic', color: LAV_SALES.INK700, fontWeight: 500, fontSize: '1.35rem', marginBottom: '0.25rem' }}>{c.eyebrow}</p>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: LAV_SALES.INK900, lineHeight: 1.15 }}>{c.headline}</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, borderRadius: 16, overflow: 'hidden', border: `1px solid ${LAV_SALES.LAV200}`, background: '#fff' }}>
            <thead>
              <tr>
                <th style={{ background: LAV_SALES.LAV100, color: LAV_SALES.LAV700, fontWeight: 700, fontSize: '.8rem', letterSpacing: '.15em', textTransform: 'uppercase', padding: '1rem', textAlign: 'left' }}>Feature</th>
                <th style={{ background: LAV_SALES.LAV200, color: LAV_SALES.LAV700, fontWeight: 700, fontSize: '.8rem', letterSpacing: '.15em', textTransform: 'uppercase', padding: '1rem', textAlign: 'center' }}>Free Pass</th>
                <th style={{ background: LAV_SALES.LAV200, color: LAV_SALES.LAV700, fontWeight: 700, fontSize: '.8rem', letterSpacing: '.15em', textTransform: 'uppercase', padding: '1rem', textAlign: 'center' }}>VIP Pass</th>
              </tr>
            </thead>
            <tbody>
              {c.rows.map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '1rem', borderTop: `1px solid ${LAV_SALES.LAV100}`, fontWeight: 600, color: LAV_SALES.INK900, fontSize: '0.95rem', lineHeight: 1.4 }}>{row.label}</td>
                  <td style={{ padding: '1rem', borderTop: `1px solid ${LAV_SALES.LAV100}`, textAlign: 'center' }}>
                    {row.freePass
                      ? <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: '#DCFCE7', color: '#16A34A' }}><SalesCheckIcon /></span>
                      : <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: '#FEE2E2', color: '#DC2626' }}><SalesXIcon /></span>
                    }
                  </td>
                  <td style={{ padding: '1rem', borderTop: `1px solid ${LAV_SALES.LAV100}`, textAlign: 'center' }}>
                    {row.vipPass
                      ? <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: '#DCFCE7', color: '#16A34A' }}><SalesCheckIcon /></span>
                      : <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: '#FEE2E2', color: '#DC2626' }}><SalesXIcon /></span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* GUARANTEE — dashed-yellow shield card with heading + body. */
function Guarantee({ content }: { content: IndigoGoldContent }) {
  if (!content.guarantee) return null;
  const g = content.guarantee;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: LAV_SALES.LAV50 }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ background: '#FFF8E6', border: '2px dashed #F0DD8A', borderRadius: 20, padding: '1.75rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <div style={{ fontSize: '3rem', flexShrink: 0 }}>🛡️</div>
          <div>
            <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '1.1rem', color: LAV_SALES.INK900, marginBottom: '0.5rem' }}>{g.heading}</h3>
            <p style={{ fontSize: '0.95rem', color: LAV_SALES.INK700, lineHeight: 1.65, margin: 0 }}>{g.body}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* WHY SECTION — centered serif-subtitled body text. */
function WhySection({ content }: { content: IndigoGoldContent }) {
  if (!content.whySection) return null;
  const w = content.whySection;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: '#fff' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: LAV_SALES.INK900, lineHeight: 1.15, marginBottom: '0.5rem' }}>{w.headline}</h2>
        <p style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', fontStyle: 'italic', fontSize: '1.35rem', color: LAV_SALES.LAV700, marginBottom: '1.5rem' }}>{w.subheadline}</p>
        {w.paragraphs.map((p, i) => (
          <p key={i} style={{ color: LAV_SALES.INK800, fontSize: '1rem', lineHeight: 1.75, marginBottom: '1rem' }}>{p}</p>
        ))}
      </div>
    </section>
  );
}

/* =======================================================================
 * ROOT COMPONENT
 * ======================================================================= */
export function IndigoGold({
  content,
  speakers,
  funnelId,
  enabledSections,
  palette,
  wpCheckoutRedirectUrl,
}: RootProps) {
  const enabled = new Set(enabledSections ?? indigoGoldDefaultEnabledSections);
  return (
    <div className="indigo-gold-root indigo-gold-body" style={paletteStyle(palette)}>
      <a href="#main-content" className="indigo-gold-skip-nav">
        Skip to content
      </a>
      <IconSprite />
      {enabled.has('top-bar') && <TopBar content={content} speakers={speakers} />}

      <main id="main-content">
        {enabled.has('hero') && <Hero content={content} speakers={speakers} />}
        {enabled.has('press') && <Press content={content} />}
        {enabled.has('stats') && <StatPills content={content} />}
        {enabled.has('trust-badges') && <TrustBadges content={content} />}
        {enabled.has('overview') && <Overview content={content} />}
        {enabled.has('speakers') && <SpeakersGrid content={content} speakers={speakers} />}
        {enabled.has('outcomes') && <Outcomes content={content} />}
        {enabled.has('free-gift') && <FreeGift content={content} speakers={speakers} />}
        {enabled.has('founders') && <Founders content={content} />}
        {enabled.has('testimonials') && <Testimonials content={content} />}
        {enabled.has('bonuses') && <Bonuses content={content} />}
        {enabled.has('pull-quote') && <PullQuote content={content} />}
        {enabled.has('figures') && <Figures content={content} />}
        {enabled.has('shifts') && <Shifts content={content} />}
        {enabled.has('closing-cta') && <ClosingCTA content={content} />}
        {enabled.has('faq') && <FAQ content={content} />}

        {/* Sales-page sections — optional, only rendered when enabled. */}
        {enabled.has('sales-hero') && <SalesHero content={content} wpCheckoutRedirectUrl={wpCheckoutRedirectUrl} />}
        {enabled.has('intro') && <Intro content={content} />}
        {enabled.has('vip-bonuses') && <VipBonuses content={content} />}
        {enabled.has('free-gifts') && <FreeGifts content={content} />}
        {enabled.has('upgrade-section') && <UpgradeSection content={content} />}
        {enabled.has('price-card') && <PriceCard content={content} wpCheckoutRedirectUrl={wpCheckoutRedirectUrl} />}
        {enabled.has('sales-speakers') && <SalesSpeakers content={content} speakers={speakers} />}
        {enabled.has('comparison-table') && <ComparisonTable content={content} />}
        {enabled.has('guarantee') && <Guarantee content={content} />}
        {enabled.has('why-section') && <WhySection content={content} />}
      </main>

      {enabled.has('footer') && <Footer content={content} />}
      {enabled.has('sticky-mobile-cta') && <StickyMobileCTA content={content} />}

      {enabled.has('hero') && content.hero && (
        <OptinModal funnelId={funnelId} ctaLabel={content.hero.ctaLabel} />
      )}
    </div>
  );
}
