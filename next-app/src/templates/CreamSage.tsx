// Document chrome (html/head/body) is owned by the Next.js page/layout that
// renders this template. Fonts (Fraunces / DM Sans / Nunito) must be loaded
// by the page — see Task 19/20 (preview/public routes) for wiring.
import { OptinModal } from '@/components/OptinModal';
import type { CreamSageContent } from './cream-sage.schema';
import type { Speaker } from './types';

type Props = {
  content: CreamSageContent;
  speakers: Record<string, Speaker>;
};

type RootProps = Props & {
  funnelId: string;
};

/* ============== PALETTE CONSTANTS ============== */
// Deterministic rotation of warm hero-collage gradients.
const HERO_COLLAGE_GRADIENTS = [
  'linear-gradient(160deg,#D89878,#C4835F)', // rose
  'linear-gradient(160deg,#7A9283,#4A6B5D)', // sage
  'linear-gradient(160deg,#E8B9A0,#D89878)', // rose-light
  'linear-gradient(160deg,#C4835F,#A85430)', // clay
  'linear-gradient(160deg,#4A6B5D,#2F4A40)', // sage-dark
  'linear-gradient(160deg,#B3C3B7,#7A9283)', // sage-soft
];

// Subtle vertical offset (px) per hero-collage item for the "scrapbook" feel.
const HERO_COLLAGE_OFFSETS = [0, -32, 16, -16, 0, -40];
// Slight rotation (deg) on even items.
const HERO_COLLAGE_ROTATIONS = [0, 2, 0, -1.5, 0, 1];

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#D89878,#C4835F)',
  'linear-gradient(135deg,#7A9283,#4A6B5D)',
  'linear-gradient(135deg,#E8B9A0,#D89878)',
  'linear-gradient(135deg,#4A6B5D,#3D5A4E)',
];

const SPEAKER_GRADIENTS = [
  'linear-gradient(135deg,#D89878,#C4835F)',
  'linear-gradient(135deg,#7A9283,#4A6B5D)',
  'linear-gradient(135deg,#E8B9A0,#D89878)',
  'linear-gradient(135deg,#4A6B5D,#2F4A40)',
  'linear-gradient(135deg,#D17B4E,#C4663D)',
  'linear-gradient(135deg,#B3C3B7,#7A9283)',
  'linear-gradient(135deg,#DEA389,#C4835F)',
  'linear-gradient(135deg,#3D5A4E,#2F4A40)',
];

const FOUNDER_GRADIENTS = [
  'linear-gradient(135deg,#D89878,#C4835F)',
  'linear-gradient(135deg,#7A9283,#4A6B5D)',
];

const TESTIMONIAL_GRADIENTS = [
  'linear-gradient(135deg,#D89878,#C4835F)',
  'linear-gradient(135deg,#7A9283,#4A6B5D)',
  'linear-gradient(135deg,#E8B9A0,#D89878)',
];

// Figures alternate sage / clay for visual rhythm.
const FIGURE_COLORS = ['#3D5A4E', '#A85430', '#3D5A4E', '#3D5A4E', '#A85430', '#3D5A4E'];

function initialsFromSpeaker(s: Speaker): string {
  const a = s.firstName?.trim()?.[0] ?? '';
  const b = s.lastName?.trim()?.[0] ?? '';
  return (a + b).toUpperCase() || '??';
}

function displayName(s: Speaker): string {
  return `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() || '—';
}

/* ============== STICKY TOP BAR ============== */
function TopBar({ content }: { content: CreamSageContent }) {
  const t = content.topBar;
  return (
    <header
      className="sticky top-0 z-40"
      style={{
        background: 'rgba(250,247,242,0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(179,195,183,0.4)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg width="34" height="34" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <circle cx="16" cy="16" r="14" fill="#4A6B5D" />
            <path d="M9 16 Q 16 8, 23 16 Q 16 24, 9 16" fill="#E8B9A0" />
          </svg>
          <span
            className="font-bold text-xl tracking-tight"
            style={{ fontFamily: "'Fraunces', serif", color: '#2F4A40' }}
          >
            {t.brandName}
          </span>
        </div>
        <div className="flex items-center gap-5">
          <span
            className="hidden md:inline text-base font-semibold"
            style={{ color: '#2F4A40' }}
          >
            {t.dateRangeLabel}
          </span>
          <a
            href="#optin"
            className="cream-sage-btn-primary"
            style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}
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
      className="relative overflow-hidden pt-14 md:pt-20 pb-20 md:pb-28"
      style={{ background: '#FAF7F2' }}
    >
      <div
        className="cream-sage-blob cream-sage-blob-rose"
        style={{ width: 500, height: 500, top: -100, left: -150 }}
      />
      <div
        className="cream-sage-blob cream-sage-blob-sage"
        style={{ width: 600, height: 600, bottom: -200, right: -200 }}
      />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-6">
            <div
              className="inline-flex items-center gap-3 pl-2 pr-5 py-2 mb-7"
              style={{
                background: '#FFFFFF',
                border: '1px solid #B3C3B7',
                borderRadius: 999,
                boxShadow: '0 10px 25px -10px rgba(74,107,93,0.25)',
              }}
            >
              <span
                className="cream-sage-eyebrow px-3 py-1.5"
                style={{
                  background: '#A85430',
                  color: '#FAF7F2',
                  borderRadius: 999,
                }}
              >
                {h.badgeLabel}
              </span>
              <span
                className="font-bold text-base md:text-lg"
                style={{ fontFamily: "'Fraunces', serif", color: '#2F4A40' }}
              >
                {h.dateRangeLabel}
              </span>
            </div>
            <h1
              className="font-black text-5xl md:text-6xl lg:text-7xl leading-[1.02] mb-8"
              style={{ fontFamily: "'Fraunces', serif", color: '#2A2419' }}
            >
              {h.headlineLead}
              <span style={{ fontStyle: 'italic', color: '#A85430' }}>
                {h.headlineAccent}
              </span>
              {h.headlineTrail}
            </h1>
            <p
              className="text-xl md:text-2xl leading-[1.55] mb-10 max-w-xl"
              style={{ color: '#3A3221' }}
            >
              {h.subheadline}
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-12">
              <a href="#optin" className="cream-sage-btn-primary" style={{ fontSize: '1.125rem' }}>
                {h.primaryCtaLabel}
                <span aria-hidden="true">→</span>
              </a>
              <a href="#what-is-this" className="cream-sage-btn-ghost">
                {h.secondaryCtaLabel}
              </a>
            </div>

            <div
              className="flex items-center gap-5 pt-7"
              style={{ borderTop: '2px solid rgba(179,195,183,0.6)' }}
            >
              <div className="flex -space-x-3">
                {heroSpeakers.slice(0, 4).map((s, idx) => (
                  <div
                    key={`hero-avatar-${s.id}`}
                    className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-base shadow-lg"
                    style={{
                      background: AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length],
                      color: '#FAF7F2',
                      border: '3px solid #FAF7F2',
                      fontFamily: "'Nunito', 'DM Sans', sans-serif",
                    }}
                  >
                    {initialsFromSpeaker(s)}
                  </div>
                ))}
              </div>
              <div>
                <p
                  className="font-bold tracking-widest mb-0.5 text-lg"
                  style={{ color: '#A85430' }}
                >
                  {h.ratingLabel}
                </p>
                <p className="text-base md:text-lg" style={{ color: '#3A3221' }}>
                  {h.readerLeadIn}{' '}
                  <span style={{ color: '#2F4A40', fontWeight: 700 }}>{h.readerCount}</span>{' '}
                  {h.readerCountSuffix}
                </p>
              </div>
            </div>
          </div>

          {/* Hero collage */}
          <div className="md:col-span-6">
            <div className="grid grid-cols-3 gap-4">
              {heroSpeakers.slice(0, 6).map((s, idx) => (
                <div
                  key={`hero-collage-${s.id}`}
                  className="flex flex-col items-center"
                  style={{
                    marginTop: `${HERO_COLLAGE_OFFSETS[idx % HERO_COLLAGE_OFFSETS.length]}px`,
                  }}
                >
                  <div
                    className="aspect-[3/4] w-full overflow-hidden flex items-end justify-center pb-6"
                    style={{
                      background: HERO_COLLAGE_GRADIENTS[idx % HERO_COLLAGE_GRADIENTS.length],
                      borderRadius: '2rem',
                      transform: `rotate(${
                        HERO_COLLAGE_ROTATIONS[idx % HERO_COLLAGE_ROTATIONS.length]
                      }deg)`,
                    }}
                  >
                    <span
                      className="font-black text-4xl"
                      style={{
                        fontFamily: "'Fraunces', serif",
                        color: 'rgba(250,247,242,0.8)',
                      }}
                    >
                      {initialsFromSpeaker(s)}
                    </span>
                  </div>
                  <p
                    className="text-sm font-bold mt-3 text-center"
                    style={{ color: '#2F4A40' }}
                  >
                    {displayName(s)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============== PRESS MARQUEE ============== */
function Press({ content }: { content: CreamSageContent }) {
  const items = [...content.press.outlets, ...content.press.outlets];
  return (
    <section className="py-10" style={{ background: '#FAF7F2' }}>
      <div className="max-w-7xl mx-auto px-6">
        <p
          className="cream-sage-eyebrow text-center mb-6"
          style={{ color: '#3D5A4E' }}
        >
          {content.press.eyebrow}
        </p>
        <div className="cream-sage-marquee-wrap">
          <div className="cream-sage-marquee-track">
            {items.map((name, idx) => (
              <span className="cream-sage-marquee-item" key={`press-${idx}`}>
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============== STATS — SAGE BAND ============== */
function Stats({ content }: { content: CreamSageContent }) {
  return (
    <section
      className="py-20 md:py-24 relative overflow-hidden"
      style={{ background: '#4A6B5D', color: '#FAF7F2' }}
    >
      <svg
        className="cream-sage-wave-top absolute top-0 left-0 right-0"
        viewBox="0 0 1200 40"
        preserveAspectRatio="none"
        fill="#FAF7F2"
        aria-hidden="true"
      >
        <path d="M0 40 Q 300 0, 600 20 T 1200 10 L 1200 0 L 0 0 Z" />
      </svg>
      <div className="max-w-6xl mx-auto px-6 relative">
        <p
          className="cream-sage-eyebrow text-center mb-14 mt-8"
          style={{ color: '#E8B9A0' }}
        >
          {content.stats.eyebrow}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {content.stats.items.map((item, idx) => {
            const isMiddle = idx === 1;
            const middleBorder = isMiddle
              ? { borderLeft: '1px solid rgba(250,247,242,0.2)', borderRight: '1px solid rgba(250,247,242,0.2)' }
              : {};
            const valueColor = isMiddle ? '#E8B9A0' : '#FAF7F2';
            return (
              <div key={`stat-${idx}`} style={middleBorder}>
                <p
                  className="font-black text-8xl md:text-9xl leading-none mb-4"
                  style={{ fontFamily: "'Fraunces', serif", color: valueColor }}
                >
                  {item.value}
                  {item.suffix ? (
                    <span
                      className="text-6xl align-top"
                      style={{ color: isMiddle ? '#FAF7F2' : '#FAF7F2' }}
                    >
                      {item.suffix}
                    </span>
                  ) : null}
                </p>
                <p
                  className="text-xl md:text-2xl font-semibold"
                  style={{
                    fontFamily: "'Nunito', 'DM Sans', sans-serif",
                    color: '#FAF7F2',
                  }}
                >
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      <svg
        className="cream-sage-wave-top absolute bottom-0 left-0 right-0"
        viewBox="0 0 1200 40"
        preserveAspectRatio="none"
        fill="#F4EDE2"
        aria-hidden="true"
        style={{ transform: 'rotate(180deg)' }}
      >
        <path d="M0 40 Q 300 0, 600 20 T 1200 10 L 1200 0 L 0 0 Z" />
      </svg>
    </section>
  );
}

/* ============== OVERVIEW ============== */
function Overview({ content }: { content: CreamSageContent }) {
  const o = content.overview;
  return (
    <section
      id="what-is-this"
      className="py-20 md:py-28 relative overflow-hidden"
      style={{ background: '#F4EDE2' }}
    >
      <div
        className="cream-sage-blob cream-sage-blob-rose"
        style={{ width: 400, height: 400, top: '10%', right: -150, opacity: 0.3 }}
      />
      <div className="relative max-w-6xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-7">
          <span
            className="cream-sage-eyebrow mb-4 inline-block"
            style={{ color: '#A85430' }}
          >
            {o.eyebrow}
          </span>
          <h2
            className="font-black text-4xl md:text-5xl leading-tight mb-8"
            style={{ fontFamily: "'Fraunces', serif", color: '#2A2419' }}
          >
            {o.headlineLead}
            <span className="cream-sage-hand-under" style={{ color: '#4A6B5D' }}>
              {o.headlineAccent}
            </span>
            {o.headlineTrail}
          </h2>
          {o.bodyParagraphs.map((para, idx) => (
            <p
              key={`overview-p-${idx}`}
              className={`text-xl md:text-2xl leading-[1.7] mb-6 ${
                idx === 0 ? 'cream-sage-dropcap' : ''
              }`}
              style={{ color: '#3A3221' }}
            >
              {para}
            </p>
          ))}
          <a href="#optin" className="cream-sage-btn-primary">
            {o.ctaLabel}
            <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="md:col-span-5">
          <div className="relative h-96 md:h-[26rem]">
            <div
              className="absolute top-0 left-8 w-32 h-32 rounded-full flex items-center justify-center shadow-xl"
              style={{ background: '#DEA389' }}
            >
              <svg
                className="w-14 h-14"
                style={{ color: '#FAF7F2' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <div
              className="absolute top-20 right-6 w-40 h-40 rounded-full flex items-center justify-center shadow-xl"
              style={{ background: '#4A6B5D' }}
            >
              <svg
                className="w-16 h-16"
                style={{ color: '#FAF7F2' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div
              className="absolute bottom-4 left-20 w-36 h-36 rounded-full flex items-center justify-center shadow-xl"
              style={{ background: '#A85430' }}
            >
              <svg
                className="w-14 h-14"
                style={{ color: '#FAF7F2' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <p
              className="absolute bottom-0 right-0 text-sm max-w-[10rem] text-right"
              style={{
                fontFamily: "'Fraunces', serif",
                fontStyle: 'italic',
                color: '#3D5A4E',
              }}
            >
              {o.imageCaption}
            </p>
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

  const sd = content.speakersDay;
  return (
    <section
      className="py-20 md:py-28 relative overflow-hidden"
      style={{ background: '#FAF7F2' }}
    >
      <div className="relative max-w-6xl mx-auto px-6 text-center">
        <span
          className="cream-sage-eyebrow mb-3 inline-block"
          style={{ color: '#A85430' }}
        >
          {sd.eyebrow}
        </span>
        <h2
          className="font-black text-4xl md:text-5xl mb-14 leading-tight"
          style={{ fontFamily: "'Fraunces', serif", color: '#2A2419' }}
        >
          {sd.headlineLead}
          <span style={{ fontStyle: 'italic', color: '#4A6B5D' }}>{sd.headlineAccent}</span>
          {sd.headlineTrail}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {daySpeakers.map((s, idx) => (
            <figure key={s.id} className="flex flex-col items-center">
              <div
                className="w-32 h-32 rounded-full mb-4 flex items-end justify-center pb-5 transition-transform hover:scale-105"
                style={{
                  background: SPEAKER_GRADIENTS[idx % SPEAKER_GRADIENTS.length],
                }}
              >
                <span
                  className="font-black text-3xl"
                  style={{
                    fontFamily: "'Fraunces', serif",
                    color: 'rgba(250,247,242,0.8)',
                  }}
                >
                  {initialsFromSpeaker(s)}
                </span>
              </div>
              <p
                className="font-bold text-xl"
                style={{ fontFamily: "'Fraunces', serif", color: '#2F4A40' }}
              >
                {displayName(s)}
              </p>
              {s.title ? (
                <p
                  className="text-base font-medium"
                  style={{ color: '#6B5E4C' }}
                >
                  {s.title}
                </p>
              ) : null}
            </figure>
          ))}
        </div>

        <div className="mt-14">
          <a
            href="#optin"
            className="inline-flex items-center gap-2 font-bold text-lg pb-1"
            style={{
              color: '#2F4A40',
              borderBottom: '2px solid #DEA389',
            }}
          >
            {sd.ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============== OUTCOMES ============== */
function Outcomes({ content }: { content: CreamSageContent }) {
  const o = content.outcomes;
  // Alternate sage / rose card accent swatches
  const ICON_BACKGROUNDS = ['#E9EEEA', 'rgba(232,185,160,0.35)'];
  const ICON_COLORS = ['#4A6B5D', '#A85430'];
  return (
    <section className="py-20 md:py-28" style={{ background: '#F4EDE2' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span
            className="cream-sage-eyebrow mb-3 inline-block"
            style={{ color: '#A85430' }}
          >
            {o.eyebrow}
          </span>
          <h2
            className="font-black text-4xl md:text-5xl leading-tight"
            style={{ fontFamily: "'Fraunces', serif", color: '#2A2419' }}
          >
            {o.headlineLead}
            <span style={{ fontStyle: 'italic', color: '#4A6B5D' }}>
              {o.headlineAccent}
            </span>
            {o.headlineTrail ?? ''}
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {o.items.map((item, idx) => (
            <article key={`outcome-${idx}`} className="cream-sage-soft-card p-8">
              <div
                className="w-16 h-16 rounded-3xl flex items-center justify-center mb-5"
                style={{ background: ICON_BACKGROUNDS[idx % 2] }}
              >
                <span
                  className="font-black text-2xl"
                  style={{
                    fontFamily: "'Fraunces', serif",
                    color: ICON_COLORS[idx % 2],
                  }}
                >
                  {String(idx + 1).padStart(2, '0')}
                </span>
              </div>
              <h3
                className="font-bold text-2xl mb-3"
                style={{ fontFamily: "'Fraunces', serif", color: '#2A2419' }}
              >
                {item.title}
              </h3>
              <p className="text-lg leading-relaxed" style={{ color: '#3A3221' }}>
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
function FreeGift({ content }: { content: CreamSageContent }) {
  const g = content.freeGift;
  return (
    <section
      className="relative py-20 md:py-28 overflow-hidden"
      style={{ background: '#FAF7F2' }}
    >
      <div
        className="cream-sage-blob cream-sage-blob-sage"
        style={{ width: 500, height: 500, top: -150, right: -100 }}
      />
      <div className="relative max-w-6xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-5 flex justify-center">
          <div className="relative">
            <div
              className="absolute rounded-full"
              style={{
                inset: '-2rem',
                background: '#E8B9A0',
                opacity: 0.3,
                filter: 'blur(32px)',
              }}
            />
            <div
              className="relative w-60 h-80 overflow-hidden"
              style={{
                borderRadius: '2rem',
                background: 'linear-gradient(160deg,#FAF7F2,#F4EDE2)',
                border: '4px solid #F4EDE2',
                boxShadow: '0 30px 60px -20px rgba(74,107,93,0.35)',
                transform: 'rotate(-3deg)',
              }}
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-3"
                style={{ background: '#4A6B5D' }}
              />
              <div className="p-8 pl-10 h-full flex flex-col justify-between">
                <div>
                  <p
                    className="cream-sage-eyebrow mb-3"
                    style={{ color: '#4A6B5D' }}
                  >
                    {g.cardEyebrow}
                  </p>
                  <div
                    className="w-10 mb-5"
                    style={{ height: 2, background: '#DEA389' }}
                  />
                  <h3
                    className="font-black text-2xl leading-tight"
                    style={{ fontFamily: "'Fraunces', serif", color: '#2A2419' }}
                  >
                    {g.cardTitle}
                  </h3>
                </div>
                <div>
                  <p
                    className="text-sm"
                    style={{
                      fontFamily: "'Fraunces', serif",
                      fontStyle: 'italic',
                      color: '#8A7E6C',
                    }}
                  >
                    {g.cardEnclosure}
                  </p>
                  <p className="cream-sage-eyebrow mt-2" style={{ color: '#8A7E6C' }}>
                    {g.cardVolume}
                  </p>
                </div>
              </div>
            </div>
            <div
              className="absolute -top-3 -right-3 font-bold text-xs px-4 py-2 shadow-lg"
              style={{
                background: '#A85430',
                color: '#FAF7F2',
                fontFamily: "'Nunito', 'DM Sans', sans-serif",
                borderRadius: 999,
                transform: 'rotate(6deg)',
              }}
            >
              {g.cardBadge}
            </div>
          </div>
        </div>

        <div className="md:col-span-7">
          <span
            className="cream-sage-eyebrow mb-3 inline-block"
            style={{ color: '#A85430' }}
          >
            {g.eyebrow}
          </span>
          <h2
            className="font-black text-4xl md:text-5xl leading-tight mb-6"
            style={{ fontFamily: "'Fraunces', serif", color: '#2A2419' }}
          >
            {g.headlineLead}
            <span className="cream-sage-hand-under">{g.headlineAccent}</span>
            {g.headlineTrail}
          </h2>
          <p
            className="text-xl md:text-2xl leading-relaxed mb-8"
            style={{ color: '#3A3221' }}
          >
            {g.body}
          </p>
          <ul className="space-y-4 mb-10">
            {g.bullets.map((bullet, idx) => (
              <li
                key={`gift-bullet-${idx}`}
                className="flex items-start gap-3 text-lg"
                style={{ color: '#3A3221' }}
              >
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: '#E9EEEA' }}
                >
                  <span style={{ color: '#3D5A4E', fontWeight: 700 }}>✓</span>
                </span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
          <a href="#optin" className="cream-sage-btn-primary">
            {g.ctaLabel}
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============== BONUS STACK ============== */
function Bonuses({ content }: { content: CreamSageContent }) {
  const b = content.bonuses;
  return (
    <section className="py-20 md:py-28" style={{ background: '#F4EDE2' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span
            className="cream-sage-eyebrow mb-3 inline-block"
            style={{ color: '#A85430' }}
          >
            {b.eyebrow}
          </span>
          <h2
            className="font-black text-4xl md:text-5xl leading-tight mb-4"
            style={{ fontFamily: "'Fraunces', serif", color: '#2A2419' }}
          >
            {b.headlineLead}
            <span className="cream-sage-hand-under">{b.headlineAccent}</span>
            {b.headlineTrail}
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {b.items.map((bonus, idx) => (
            <article key={`bonus-${idx}`} className="cream-sage-soft-card p-8">
              <span
                className="inline-block font-bold text-sm tracking-wider px-4 py-2 mb-5"
                style={{
                  background: '#D89878',
                  color: '#FAF7F2',
                  fontFamily: "'Nunito', 'DM Sans', sans-serif",
                  borderRadius: 999,
                }}
              >
                {bonus.valueLabel}
              </span>
              <h3
                className="font-bold text-2xl mb-3 leading-tight"
                style={{ fontFamily: "'Fraunces', serif", color: '#2A2419' }}
              >
                {bonus.title}
              </h3>
              <p
                className="text-lg mb-5 leading-relaxed"
                style={{ color: '#3A3221' }}
              >
                {bonus.description}
              </p>
              <ul className="space-y-2 text-base" style={{ color: '#3A3221' }}>
                {bonus.bullets.map((bullet, bIdx) => (
                  <li
                    key={`bonus-${idx}-b-${bIdx}`}
                    className="flex gap-2"
                  >
                    <span style={{ color: '#3D5A4E', fontWeight: 700 }}>✓</span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="text-center mt-12">
          <a href="#optin" className="cream-sage-btn-primary">
            {b.ctaLabel}
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============== FOUNDERS ============== */
function Founders({ content }: { content: CreamSageContent }) {
  const f = content.founders;
  return (
    <section className="py-20 md:py-28" style={{ background: '#FAF7F2' }}>
      <div className="max-w-5xl mx-auto px-6">
        <h2
          className="font-black text-4xl md:text-5xl text-center mb-14 leading-tight"
          style={{ fontFamily: "'Fraunces', serif", color: '#2A2419' }}
        >
          {f.headline}
        </h2>
        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          {f.items.map((founder, idx) => (
            <div
              key={`founder-${idx}`}
              className="text-center md:text-left"
            >
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center font-black text-3xl mx-auto md:mx-0 mb-5 shadow-xl"
                style={{
                  background: FOUNDER_GRADIENTS[idx % FOUNDER_GRADIENTS.length],
                  color: '#FAF7F2',
                  fontFamily: "'Fraunces', serif",
                }}
              >
                {founder.initials}
              </div>
              <h3
                className="font-bold text-2xl"
                style={{ fontFamily: "'Fraunces', serif", color: '#2A2419' }}
              >
                {founder.name}
              </h3>
              <p
                className="text-base mb-5 font-semibold"
                style={{ color: '#3D5A4E' }}
              >
                {founder.role}
              </p>
              <blockquote
                className="cream-sage-dropcap text-xl md:text-2xl leading-relaxed"
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontStyle: 'italic',
                  color: '#3A3221',
                }}
              >
                {founder.quote}
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============== TESTIMONIALS ============== */
function Testimonials({ content }: { content: CreamSageContent }) {
  const t = content.testimonials;
  return (
    <section className="py-20 md:py-28" style={{ background: '#F4EDE2' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span
            className="cream-sage-eyebrow mb-3 inline-block"
            style={{ color: '#A85430' }}
          >
            {t.eyebrow}
          </span>
          <h2
            className="font-black text-4xl md:text-5xl leading-tight"
            style={{ fontFamily: "'Fraunces', serif", color: '#2A2419' }}
          >
            {t.headlineLead}
            <span style={{ fontStyle: 'italic', color: '#4A6B5D' }}>
              {t.headlineAccent}
            </span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {t.items.map((item, idx) => (
            <article key={`testimonial-${idx}`} className="cream-sage-soft-card p-8">
              <p
                className="font-bold tracking-widest text-lg mb-3"
                style={{ color: '#A85430' }}
              >
                ★ ★ ★ ★ ★
              </p>
              <p
                className="text-xl md:text-2xl leading-relaxed mb-7"
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontStyle: 'italic',
                  color: '#2A2419',
                }}
              >
                &ldquo;{item.quote}&rdquo;
              </p>
              <div
                className="flex items-center gap-3 pt-5"
                style={{ borderTop: '1px solid rgba(179,195,183,0.4)' }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-base"
                  style={{
                    background:
                      TESTIMONIAL_GRADIENTS[idx % TESTIMONIAL_GRADIENTS.length],
                    color: '#FAF7F2',
                    fontFamily: "'Nunito', 'DM Sans', sans-serif",
                  }}
                >
                  {item.initials}
                </div>
                <div>
                  <p
                    className="font-bold text-lg"
                    style={{ fontFamily: "'Fraunces', serif", color: '#2F4A40' }}
                  >
                    {item.name}
                  </p>
                  <p className="text-base" style={{ color: '#6B5E4C' }}>
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
function PullQuote({ content }: { content: CreamSageContent }) {
  const pq = content.pullQuote;
  return (
    <section
      className="py-24 md:py-32 relative overflow-hidden"
      style={{ background: '#4A6B5D', color: '#FAF7F2' }}
    >
      <svg
        className="cream-sage-wave-top absolute top-0 left-0 right-0"
        viewBox="0 0 1200 40"
        preserveAspectRatio="none"
        fill="#F4EDE2"
        aria-hidden="true"
      >
        <path d="M0 40 Q 300 0, 600 20 T 1200 10 L 1200 0 L 0 0 Z" />
      </svg>
      <div className="max-w-4xl mx-auto px-6 text-center relative mt-6">
        <svg
          className="w-16 h-16 mx-auto mb-6"
          style={{ color: '#E8B9A0', opacity: 0.4 }}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
        </svg>
        <p
          className="font-black text-3xl md:text-5xl leading-[1.15] mb-8"
          style={{
            fontFamily: "'Fraunces', serif",
            fontStyle: 'italic',
          }}
        >
          {pq.quote}
        </p>
        <p
          className="font-bold text-base md:text-lg tracking-wide"
          style={{
            fontFamily: "'Nunito', 'DM Sans', sans-serif",
            color: '#E8B9A0',
          }}
        >
          {pq.attribution}
        </p>
      </div>
    </section>
  );
}

/* ============== WHY THIS MATTERS — FIGURES ============== */
function Figures({ content }: { content: CreamSageContent }) {
  const f = content.figures;
  return (
    <section className="py-20 md:py-28" style={{ background: '#FAF7F2' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span
            className="cream-sage-eyebrow mb-3 inline-block"
            style={{ color: '#A85430' }}
          >
            {f.eyebrow}
          </span>
          <h2
            className="font-black text-4xl md:text-5xl leading-tight"
            style={{ fontFamily: "'Fraunces', serif", color: '#2A2419' }}
          >
            {f.headline}
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {f.items.map((item, idx) => (
            <div key={`figure-${idx}`} className="cream-sage-cream-card p-8 text-center">
              <p
                className="font-black text-6xl mb-3 leading-none"
                style={{
                  fontFamily: "'Fraunces', serif",
                  color: FIGURE_COLORS[idx % FIGURE_COLORS.length],
                }}
              >
                {item.value}
              </p>
              <p
                className="text-base leading-relaxed font-medium"
                style={{ color: '#3A3221' }}
              >
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============== SHIFTS ============== */
function Shifts({ content }: { content: CreamSageContent }) {
  const s = content.shifts;
  return (
    <section className="py-20 md:py-28" style={{ background: '#F4EDE2' }}>
      <div className="max-w-3xl mx-auto px-6">
        <span
          className="cream-sage-eyebrow mb-3 inline-block"
          style={{ color: '#A85430' }}
        >
          {s.eyebrow}
        </span>
        <h2
          className="font-black text-4xl md:text-5xl leading-tight mb-14"
          style={{ fontFamily: "'Fraunces', serif", color: '#2A2419' }}
        >
          {s.headlineLead}
          <span style={{ fontStyle: 'italic', color: '#4A6B5D' }}>
            {s.headlineAccent}
          </span>
          {s.headlineTrail ?? ''}
        </h2>
        <div className="space-y-8">
          {s.items.map((item, idx) => (
            <article
              key={`shift-${idx}`}
              className="cream-sage-soft-card p-7 flex gap-6"
            >
              <span
                className="font-black text-4xl leading-none shrink-0"
                style={{ fontFamily: "'Fraunces', serif", color: '#D89878' }}
              >
                {String(idx + 1).padStart(2, '0')}
              </span>
              <div>
                <h3
                  className="font-bold text-2xl mb-3"
                  style={{ fontFamily: "'Fraunces', serif", color: '#2A2419' }}
                >
                  {item.title}
                </h3>
                <p className="text-lg leading-relaxed" style={{ color: '#3A3221' }}>
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============== FAQ ============== */
function FAQ({ content }: { content: CreamSageContent }) {
  return (
    <section className="py-20 md:py-28" style={{ background: '#FAF7F2' }}>
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <span
            className="cream-sage-eyebrow mb-3 inline-block"
            style={{ color: '#A85430' }}
          >
            {content.faqSection.eyebrow}
          </span>
          <h2
            className="font-black text-4xl md:text-5xl leading-tight"
            style={{ fontFamily: "'Fraunces', serif", color: '#2A2419' }}
          >
            {content.faqSection.headline}
          </h2>
        </div>
        <div>
          {content.faqs.map((faq, idx) => (
            <details key={`faq-${idx}`}>
              <summary>
                {faq.question}
                <span className="cream-sage-pm-icon">+</span>
              </summary>
              <p
                className="px-7 pb-7 text-lg leading-relaxed"
                style={{ color: '#3A3221' }}
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
function FinalCTA({ content }: { content: CreamSageContent }) {
  const c = content.closing;
  return (
    <section
      className="relative py-24 md:py-32 overflow-hidden"
      id="final-cta"
      style={{ background: 'linear-gradient(135deg,#D89878,#C4663D)' }}
    >
      <div
        className="cream-sage-blob"
        style={{
          width: 500,
          height: 500,
          top: -150,
          right: -100,
          background: 'radial-gradient(circle,#FAF7F2,transparent 70%)',
          opacity: 0.25,
        }}
      />
      <div className="max-w-4xl mx-auto px-6 text-center relative">
        <div
          className="inline-flex items-center gap-3 px-5 py-2 mb-8"
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 999,
            backdropFilter: 'blur(4px)',
          }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: '#E8B9A0' }}
          />
          <span
            className="font-bold text-base"
            style={{
              fontFamily: "'Nunito', 'DM Sans', sans-serif",
              color: '#FAF7F2',
            }}
          >
            {c.badgeLabel}
          </span>
        </div>
        <h2
          className="font-black text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-8 tracking-tight"
          style={{ fontFamily: "'Fraunces', serif", color: '#FAF7F2' }}
        >
          {c.headlineLead}
          <span style={{ fontStyle: 'italic' }}>{c.headlineAccent}</span>
          {c.headlineTrail}
        </h2>
        <p
          className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto leading-relaxed font-medium"
          style={{ color: '#FAF7F2' }}
        >
          {c.subheadline}
        </p>
        <a
          href="#optin"
          className="inline-flex items-center gap-3 font-bold text-xl px-12 py-5 shadow-2xl"
          style={{
            background: '#FAF7F2',
            color: '#A85430',
            borderRadius: 999,
            transition: 'background 0.2s ease',
          }}
        >
          {c.ctaLabel}
          <span aria-hidden="true">→</span>
        </a>
        {c.fineprint ? (
          <p
            className="font-semibold text-base mt-8 tracking-wide"
            style={{
              fontFamily: "'Nunito', 'DM Sans', sans-serif",
              color: '#FAF7F2',
            }}
          >
            {c.fineprint}
          </p>
        ) : null}
      </div>
    </section>
  );
}

/* ============== FOOTER ============== */
function Footer({ content }: { content: CreamSageContent }) {
  const f = content.footer;
  return (
    <footer className="py-14 relative overflow-hidden" style={{ background: '#F4EDE2' }}>
      <svg
        className="cream-sage-wave-top absolute top-0 left-0 right-0"
        viewBox="0 0 1200 40"
        preserveAspectRatio="none"
        fill="#C4663D"
        aria-hidden="true"
        style={{ opacity: 0.15 }}
      >
        <path d="M0 40 Q 300 0, 600 20 T 1200 10 L 1200 0 L 0 0 Z" />
      </svg>
      <div className="max-w-6xl mx-auto px-6 pt-4">
        <div
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-8"
          style={{ borderBottom: '1px solid rgba(179,195,183,0.5)' }}
        >
          <div className="flex items-center gap-3">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <circle cx="16" cy="16" r="14" fill="#4A6B5D" />
              <path d="M9 16 Q 16 8, 23 16 Q 16 24, 9 16" fill="#E8B9A0" />
            </svg>
            <div>
              <p
                className="font-bold text-2xl"
                style={{ fontFamily: "'Fraunces', serif", color: '#2F4A40' }}
              >
                {f.brandName}
              </p>
              <p
                className="text-base md:text-lg"
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontStyle: 'italic',
                  color: '#3A3221',
                }}
              >
                {f.tagline}
              </p>
            </div>
          </div>
          <div
            className="flex items-center gap-6 text-base font-semibold"
            style={{ color: '#3A3221' }}
          >
            {f.links.map((link, idx) => (
              <a
                key={`footer-link-${idx}`}
                href={link.href}
                className="hover:underline"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <p
          className="text-base mt-6 text-center md:text-left"
          style={{ color: '#3A3221' }}
        >
          {f.copyright}
        </p>
      </div>
    </footer>
  );
}

/* ============== ROOT COMPONENT ============== */
export function CreamSage({ content, speakers, funnelId }: RootProps) {
  return (
    <div className="cream-sage-root cream-sage-body antialiased">
      <a href="#main" className="cream-sage-skip-nav">
        Skip to content
      </a>

      <TopBar content={content} />

      <main id="main">
        <Hero content={content} speakers={speakers} />
        <Press content={content} />
        <Stats content={content} />
        <Overview content={content} />
        <SpeakersDay content={content} speakers={speakers} />
        <Outcomes content={content} />
        <FreeGift content={content} />
        <Bonuses content={content} />
        <Founders content={content} />
        <Testimonials content={content} />
        <PullQuote content={content} />
        <Figures content={content} />
        <Shifts content={content} />
        <FAQ content={content} />
        <FinalCTA content={content} />
      </main>

      <Footer content={content} />

      <OptinModal funnelId={funnelId} ctaLabel={content.hero.primaryCtaLabel} />
    </div>
  );
}
