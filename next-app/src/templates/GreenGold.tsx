// Document chrome (html/head/body) is owned by the Next.js page/layout that
// renders this template. Fonts (Poppins / Source Sans 3) must be loaded by
// the page — see preview/public routes wiring.
import './green-gold.styles.css';
import { OptinModal } from '@/components/OptinModal';
import type { GreenGoldContent } from './green-gold.schema';
import type { Speaker } from './types';

type Props = {
  content: GreenGoldContent;
  speakers: Record<string, Speaker>;
};

type RootProps = Props & {
  funnelId: string;
};

// Deterministic gradient + accent cycles, drawn from the green-gold HTML palette
// (brand-green + gold + teal tints). Cycled by index to keep the AI-fillable
// schema simple while preserving visual intent.
const SPEAKER_GRADIENTS = [
  'linear-gradient(135deg,#16A34A,#14532D)',
  'linear-gradient(135deg,#0D9488,#0F766E)',
  'linear-gradient(135deg,#EAB308,#CA8A04)',
  'linear-gradient(135deg,#14532D,#1A2E1A)',
  'linear-gradient(135deg,#4ADE80,#16A34A)',
  'linear-gradient(135deg,#15803D,#14532D)',
  'linear-gradient(135deg,#CA8A04,#EAB308)',
  'linear-gradient(135deg,#16A34A,#4ADE80)',
  'linear-gradient(135deg,#14532D,#16A34A)',
];

const HERO_AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#16A34A,#14532D)',
  'linear-gradient(135deg,#14532D,#1A2E1A)',
  'linear-gradient(135deg,#4ADE80,#16A34A)',
  'linear-gradient(135deg,#EAB308,#CA8A04)',
  'linear-gradient(135deg,#15803D,#14532D)',
  'linear-gradient(135deg,#16A34A,#4ADE80)',
];

const HERO_SOCIAL_AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#16A34A,#14532D)',
  'linear-gradient(135deg,#EAB308,#CA8A04)',
  'linear-gradient(135deg,#15803D,#14532D)',
  'linear-gradient(135deg,#4ADE80,#16A34A)',
];

const FOUNDER_GRADIENTS = [
  'linear-gradient(135deg,#16A34A,#14532D)',
  'linear-gradient(135deg,#EAB308,#CA8A04)',
];

const TESTIMONIAL_GRADIENTS = [
  'linear-gradient(135deg,#16A34A,#14532D)',
  'linear-gradient(135deg,#EAB308,#CA8A04)',
  'linear-gradient(135deg,#0F766E,#115E59)',
];

const OUTCOME_ICON_BG = [
  '#16A34A',
  '#16A34A',
  '#16A34A',
  '#EAB308',
  '#EAB308',
  '#EAB308',
];

function initialsFromSpeaker(s: Speaker): string {
  const a = s.firstName?.trim()?.[0] ?? '';
  const b = s.lastName?.trim()?.[0] ?? '';
  return (a + b).toUpperCase() || '??';
}

function displayName(s: Speaker): string {
  return `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() || '—';
}

/* ============== STICKY TOP BAR ============== */
function TopBar({ content }: { content: GreenGoldContent }) {
  return (
    <div
      className="sticky top-0 z-50 text-white py-4 px-4 shadow-lg"
      style={{ background: '#15803D' }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-center">
        <span className="green-gold-heading font-bold text-lg md:text-xl tracking-tight">
          {content.topBar.title}
        </span>
      </div>
    </div>
  );
}

/* ============== HERO ============== */
function Hero({ content, speakers }: Props) {
  const h = content.hero;
  const heroSpeakers = h.heroSpeakerIds
    .map((id) => speakers[id])
    .filter((s): s is Speaker => Boolean(s));
  const socialSpeakers = h.socialProofAvatarIds
    .map((id) => speakers[id])
    .filter((s): s is Speaker => Boolean(s));

  return (
    <section
      className="py-14 md:py-20 relative overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 40%, #E8F5E9 100%)',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-5 gap-10 items-center relative z-10">
        <div className="md:col-span-3">
          <p
            className="green-gold-heading font-bold text-sm mb-3"
            style={{ color: '#16A34A' }}
          >
            {h.eyebrow}
          </p>
          <h1
            className="green-gold-heading font-black text-3xl md:text-4xl lg:text-[2.75rem] leading-[1.15] mb-5"
            style={{ color: '#1A2E1A' }}
          >
            {h.headline}
          </h1>
          <p
            className="text-base mb-6 leading-relaxed"
            style={{ color: 'rgba(26,46,26,0.7)' }}
          >
            {h.subheadline}
          </p>
          <a
            href="#optin"
            className="green-gold-heading green-gold-pulse-glow inline-block text-white font-bold text-base px-8 py-4 rounded-full uppercase tracking-wide mb-4"
            style={{ background: '#16A34A' }}
          >
            {h.primaryCtaLabel} &rarr;
          </a>
          <p
            className="text-sm mb-6"
            style={{ color: 'rgba(26,46,26,0.55)' }}
          >
            {h.giftLine}
          </p>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {socialSpeakers.slice(0, 4).map((s, idx) => (
                <div
                  key={`hero-social-${s.id}`}
                  className="green-gold-avatar-sm"
                  style={{
                    background:
                      HERO_SOCIAL_AVATAR_GRADIENTS[
                        idx % HERO_SOCIAL_AVATAR_GRADIENTS.length
                      ],
                  }}
                >
                  {initialsFromSpeaker(s)}
                </div>
              ))}
            </div>
            <p
              className="text-sm"
              style={{ color: 'rgba(26,46,26,0.6)' }}
            >
              <span
                className="flex gap-0.5 text-xs mb-0.5"
                style={{ color: '#EAB308' }}
              >
                ★★★★★
              </span>
              Loved by{' '}
              <strong style={{ color: '#1A2E1A' }}>{h.readerCount}</strong>{' '}
              {h.readerCountSuffix}
            </p>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex -space-x-3">
              {heroSpeakers.slice(0, 6).map((s, idx) => (
                <div
                  key={`hero-avatar-${s.id}`}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{
                    background:
                      HERO_AVATAR_GRADIENTS[idx % HERO_AVATAR_GRADIENTS.length],
                    border: '2px solid #FFFFFF',
                  }}
                >
                  {initialsFromSpeaker(s)}
                </div>
              ))}
            </div>
            <p
              className="green-gold-heading font-bold text-xs"
              style={{ color: 'rgba(26,46,26,0.55)' }}
            >
              {h.speakerCountLabel}
            </p>
          </div>
        </div>

        <div
          className="md:col-span-2 hidden md:flex items-center justify-center relative"
          style={{ minHeight: '420px' }}
        >
          <div className="absolute inset-0">
            <svg
              viewBox="0 0 400 420"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="green-gold-blob1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#16A34A" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#14532D" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#EAB308" stopOpacity="0.3" />
                </linearGradient>
                <linearGradient id="green-gold-blob2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#EAB308" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#16A34A" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="green-gold-blob3" x1="50%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" stopColor="#DCFCE7" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#16A34A" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <ellipse cx="200" cy="180" rx="180" ry="160" fill="url(#green-gold-blob1)" />
              <ellipse cx="260" cy="250" rx="130" ry="140" fill="url(#green-gold-blob2)" />
              <ellipse cx="160" cy="280" rx="100" ry="110" fill="url(#green-gold-blob3)" />
              <circle cx="300" cy="120" r="60" fill="#EAB308" fillOpacity="0.15" />
              <circle cx="120" cy="140" r="40" fill="#14532D" fillOpacity="0.1" />
            </svg>
          </div>
          <div className="relative z-10 text-center p-6">
            <div
              className="rounded-2xl p-8 shadow-lg"
              style={{
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(6px)',
                border: '1px solid rgba(187,247,208,0.5)',
              }}
            >
              <div className="flex justify-center gap-3 mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md"
                  style={{ background: '#16A34A' }}
                ></div>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md"
                  style={{ background: '#EAB308' }}
                ></div>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md"
                  style={{ background: '#15803D' }}
                ></div>
              </div>
              <p
                className="green-gold-heading font-bold text-lg mb-1"
                style={{ color: '#1A2E1A' }}
              >
                {h.blobCard.daysLabel}
              </p>
              <p
                className="green-gold-heading font-extrabold text-2xl"
                style={{ color: '#16A34A' }}
              >
                {h.blobCard.freeLabel}
              </p>
              <p
                className="text-sm mt-2"
                style={{ color: 'rgba(26,46,26,0.5)' }}
              >
                {h.blobCard.subLabel}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============== PRESS MARQUEE ============== */
function Press({ content }: { content: GreenGoldContent }) {
  const items = [...content.press.outlets, ...content.press.outlets];
  return (
    <section className="bg-white py-10">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p
          className="green-gold-heading text-xs font-bold uppercase mb-6"
          style={{
            letterSpacing: '0.2em',
            color: 'rgba(26,46,26,0.3)',
          }}
        >
          {content.press.eyebrow}
        </p>
        <div className="green-gold-marquee-wrap">
          <div className="green-gold-marquee-track">
            {items.map((name, idx) => (
              <span key={`press-${idx}`} className="green-gold-marquee-item">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============== TRUST BADGES ============== */
function Trust({ content }: { content: GreenGoldContent }) {
  return (
    <section
      className="bg-white py-5"
      style={{ borderBottom: '1px solid #DCFCE7' }}
    >
      <div
        className="max-w-4xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm"
        style={{ color: 'rgba(26,46,26,0.6)' }}
      >
        {content.trust.items.map((item, idx) => (
          <span key={`trust-${idx}`} className="flex items-center gap-2">
            <svg
              className="w-4 h-4"
              style={{ color: idx === 3 ? '#EAB308' : '#16A34A' }}
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ============== STATS STRIP ============== */
function Stats({ content }: { content: GreenGoldContent }) {
  return (
    <section className="bg-white py-12">
      <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-6 text-center">
        {content.stats.items.map((item, idx) => (
          <div
            key={`stat-${idx}`}
            className="bg-white rounded-xl p-6 shadow-sm"
            style={{
              border: '1px solid #DCFCE7',
              borderBottom: '4px solid #16A34A',
            }}
          >
            <p
              className="green-gold-heading font-black text-4xl md:text-5xl"
              style={{ color: '#15803D' }}
            >
              {item.value}
            </p>
            <p
              className="font-medium text-sm mt-1 uppercase tracking-wider"
              style={{ color: 'rgba(26,46,26,0.55)' }}
            >
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============== OVERVIEW ============== */
function Overview({ content }: { content: GreenGoldContent }) {
  const o = content.overview;
  return (
    <section
      id="what-is-this"
      className="bg-white py-16 md:py-24"
    >
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p
            className="green-gold-heading font-bold text-sm uppercase tracking-wider mb-2"
            style={{ color: '#16A34A' }}
          >
            {o.eyebrow}
          </p>
          <h2
            className="green-gold-heading font-black text-3xl md:text-4xl mb-6"
            style={{ color: '#1A2E1A' }}
          >
            {o.headline}
          </h2>
          {o.bodyParagraphs.map((para, idx) => (
            <p
              key={`overview-p-${idx}`}
              className="text-lg leading-relaxed mb-4"
              style={{ color: 'rgba(26,46,26,0.6)' }}
            >
              {para}
            </p>
          ))}
          <a
            href="#optin"
            className="green-gold-heading inline-block text-white font-bold px-8 py-4 rounded-full text-base mt-4"
            style={{ background: '#16A34A' }}
          >
            {o.ctaLabel}
          </a>
        </div>
        <div
          className="rounded-2xl flex items-center justify-center"
          style={{
            background:
              'linear-gradient(to bottom right, #F0FDF4, #FFFFFF, #DCFCE7)',
            border: '1px solid #DCFCE7',
            aspectRatio: '4 / 3',
          }}
        >
          <div className="text-center p-8">
            <div className="flex justify-center gap-4 mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: '#16A34A' }}
              ></div>
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: '#EAB308' }}
              ></div>
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: '#15803D' }}
              ></div>
            </div>
            <p
              className="green-gold-heading font-bold text-xl mb-1"
              style={{ color: '#1A2E1A' }}
            >
              {o.cardDaysLabel}
            </p>
            <p
              className="text-sm"
              style={{ color: 'rgba(26,46,26,0.4)' }}
            >
              {o.cardSubLabel}
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

  return (
    <section
      className="py-16 md:py-24"
      style={{ background: '#F0FDF4' }}
    >
      <div className="max-w-6xl mx-auto px-6 text-center">
        <span
          className="green-gold-heading inline-block text-white font-bold text-sm px-5 py-2 rounded-full mb-4"
          style={{ background: '#16A34A' }}
        >
          {content.speakersDay.dayLabel}
        </span>
        <h2
          className="green-gold-heading font-black text-3xl md:text-4xl mb-14"
          style={{ color: '#1A2E1A' }}
        >
          {content.speakersDay.headline}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 md:gap-12">
          {daySpeakers.map((s, idx) => (
            <figure key={s.id} className="flex flex-col items-center">
              <div
                className="green-gold-avatar mb-4"
                style={{
                  width: '140px',
                  height: '140px',
                  fontSize: '1.5rem',
                  background:
                    SPEAKER_GRADIENTS[idx % SPEAKER_GRADIENTS.length],
                }}
              >
                {initialsFromSpeaker(s)}
              </div>
              <p
                className="green-gold-heading font-bold text-lg"
                style={{ color: '#1A2E1A' }}
              >
                {displayName(s)}
              </p>
              {s.title ? (
                <p
                  className="text-sm"
                  style={{ color: 'rgba(26,46,26,0.5)' }}
                >
                  {s.title}
                </p>
              ) : null}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============== OUTCOMES ============== */
function Outcomes({ content }: { content: GreenGoldContent }) {
  const o = content.outcomes;
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-6">
        <p
          className="green-gold-heading font-bold text-sm uppercase tracking-wider mb-2 text-center"
          style={{ color: '#16A34A' }}
        >
          {o.eyebrow}
        </p>
        <h2
          className="green-gold-heading font-black text-3xl md:text-4xl mb-12 text-center"
          style={{ color: '#1A2E1A' }}
        >
          {o.headline}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {o.items.map((item, idx) => (
            <article
              key={`outcome-${idx}`}
              className="text-center p-6 rounded-2xl"
              style={{ background: '#F0FDF4' }}
            >
              <div
                className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center green-gold-heading font-black text-white text-lg"
                style={{
                  background: OUTCOME_ICON_BG[idx % OUTCOME_ICON_BG.length],
                }}
              >
                {String(idx + 1).padStart(2, '0')}
              </div>
              <p
                className="green-gold-heading font-bold"
                style={{ color: '#1A2E1A' }}
              >
                {item.title}
              </p>
              <p
                className="text-sm mt-1"
                style={{ color: 'rgba(26,46,26,0.5)' }}
              >
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
function FreeGift({ content }: { content: GreenGoldContent }) {
  const g = content.freeGift;
  return (
    <section
      className="py-14 md:py-20"
      style={{
        background: 'linear-gradient(135deg, #fefce8 0%, rgba(253,230,138,0.25) 100%)',
      }}
    >
      <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
        <div className="flex justify-center">
          <div className="relative">
            <div
              className="rounded-xl shadow-2xl flex flex-col items-center justify-center p-6"
              style={{
                width: '14rem',
                height: '18rem',
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                transform: 'rotate(-3deg)',
              }}
            >
              <div
                className="w-full h-2 rounded-full mb-4"
                style={{ background: '#16A34A' }}
              ></div>
              <div
                className="w-12 h-12 rounded-xl mb-3"
                style={{ background: '#16A34A' }}
              ></div>
              <p
                className="green-gold-heading font-bold text-sm text-center leading-tight"
                style={{ color: '#1A2E1A' }}
              >
                {g.bookTitle}
              </p>
              <p
                className="text-xs mt-2"
                style={{ color: 'rgba(26,46,26,0.4)' }}
              >
                {g.bookSubLabel}
              </p>
            </div>
            <div
              className="absolute -top-3 -right-3 green-gold-heading text-white font-black text-xs px-3 py-1.5 rounded-full shadow-lg"
              style={{
                background: '#EAB308',
                transform: 'rotate(12deg)',
              }}
            >
              {g.badge}
            </div>
          </div>
        </div>
        <div>
          <p
            className="green-gold-heading font-bold text-sm uppercase tracking-wider mb-2"
            style={{ color: '#CA8A04' }}
          >
            {g.eyebrow}
          </p>
          <h2
            className="green-gold-heading font-black text-2xl md:text-3xl mb-4"
            style={{ color: '#1A2E1A' }}
          >
            {g.headline}
          </h2>
          <p className="mb-5" style={{ color: 'rgba(26,46,26,0.6)' }}>
            {g.body}
          </p>
          <ul className="space-y-3 mb-6">
            {g.bullets.map((bullet, idx) => (
              <li
                key={`gift-bullet-${idx}`}
                className="flex items-start gap-2"
                style={{ color: 'rgba(26,46,26,0.7)' }}
              >
                <svg
                  className="w-5 h-5 shrink-0 mt-0.5"
                  style={{ color: '#16A34A' }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {bullet}
              </li>
            ))}
          </ul>
          <a
            href="#optin"
            className="green-gold-heading green-gold-pulse-glow inline-block text-white font-bold text-sm px-7 py-3.5 rounded-full uppercase tracking-wide"
            style={{ background: '#16A34A' }}
          >
            {g.ctaLabel} &rarr;
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============== BONUS STACK ============== */
function Bonuses({ content }: { content: GreenGoldContent }) {
  const b = content.bonuses;
  return (
    <section
      className="py-16 md:py-24"
      style={{
        background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
      }}
    >
      <div className="max-w-4xl mx-auto px-6">
        <p
          className="green-gold-heading font-bold text-sm uppercase tracking-wider mb-2 text-center"
          style={{ color: '#CA8A04' }}
        >
          {b.eyebrow}
        </p>
        <h2
          className="green-gold-heading font-black text-3xl md:text-4xl mb-14 text-center"
          style={{ color: '#1A2E1A' }}
        >
          {b.headline}
        </h2>
        <div className="space-y-8">
          {b.items.map((bonus, idx) => (
            <article
              key={`bonus-${idx}`}
              className="flex gap-6 md:gap-8 items-start bg-white rounded-2xl p-6 md:p-8 shadow-sm"
              style={{ border: '1px solid #DCFCE7' }}
            >
              <span
                className="green-gold-heading font-black text-6xl md:text-7xl leading-none shrink-0 select-none"
                style={{ color: 'rgba(22,163,74,0.15)' }}
              >
                {String(idx + 1).padStart(2, '0')}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <h3
                    className="green-gold-heading font-bold text-xl"
                    style={{ color: '#1A2E1A' }}
                  >
                    {bonus.title}
                  </h3>
                  <span
                    className="green-gold-heading inline-block text-white font-bold text-xs px-3 py-1 rounded-full shrink-0"
                    style={{ background: '#EAB308' }}
                  >
                    {bonus.valueLabel}
                  </span>
                </div>
                <p className="mb-4" style={{ color: 'rgba(26,46,26,0.6)' }}>
                  {bonus.description}
                </p>
                <ul className="space-y-2">
                  {bonus.bullets.map((bullet, bIdx) => (
                    <li
                      key={`bonus-${idx}-b-${bIdx}`}
                      className="flex items-center gap-2"
                      style={{ color: 'rgba(26,46,26,0.7)' }}
                    >
                      <svg
                        className="w-5 h-5 shrink-0"
                        style={{ color: '#16A34A' }}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
        <div className="text-center mt-12">
          <a
            href="#optin"
            className="green-gold-heading inline-block text-white font-bold px-10 py-4 rounded-full text-lg"
            style={{ background: '#16A34A' }}
          >
            {b.ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============== FOUNDERS ============== */
function Founders({ content }: { content: GreenGoldContent }) {
  const f = content.founders;
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-6">
        <h2
          className="green-gold-heading font-black text-3xl md:text-4xl text-center mb-12"
          style={{ color: '#1A2E1A' }}
        >
          {f.headline}
        </h2>
        <div className="grid md:grid-cols-2 gap-12">
          {f.items.map((founder, idx) => (
            <div
              key={`founder-${idx}`}
              className="flex flex-col items-center text-center"
            >
              <div
                className="green-gold-avatar mb-4"
                style={{
                  width: '100px',
                  height: '100px',
                  fontSize: '1.5rem',
                  background:
                    FOUNDER_GRADIENTS[idx % FOUNDER_GRADIENTS.length],
                }}
              >
                {founder.initials}
              </div>
              <h3
                className="green-gold-heading font-bold text-xl"
                style={{ color: '#1A2E1A' }}
              >
                {founder.name}
              </h3>
              <p
                className="text-sm mb-4"
                style={{ color: 'rgba(26,46,26,0.4)' }}
              >
                {founder.role}
              </p>
              <p
                className="text-sm leading-relaxed max-w-sm"
                style={{ color: 'rgba(26,46,26,0.6)' }}
              >
                &ldquo;{founder.quote}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============== TESTIMONIALS ============== */
function Testimonials({ content }: { content: GreenGoldContent }) {
  const t = content.testimonials;
  return (
    <section
      className="py-16 md:py-24"
      style={{ background: '#F0FDF4' }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <p
          className="green-gold-heading font-bold text-sm uppercase tracking-wider mb-2 text-center"
          style={{ color: '#CA8A04' }}
        >
          {t.eyebrow}
        </p>
        <h2
          className="green-gold-heading font-black text-3xl md:text-4xl text-center mb-12"
          style={{ color: '#1A2E1A' }}
        >
          {t.headline}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {t.items.map((item, idx) => (
            <article
              key={`testimonial-${idx}`}
              className="bg-white rounded-xl p-6 shadow-sm"
              style={{ border: '1px solid #DCFCE7' }}
            >
              <div
                className="flex gap-0.5 text-sm mb-3"
                style={{ color: '#EAB308' }}
              >
                ★★★★★
              </div>
              <p
                className="italic mb-4"
                style={{ color: 'rgba(26,46,26,0.6)' }}
              >
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="green-gold-avatar-sm"
                  style={{
                    background:
                      TESTIMONIAL_GRADIENTS[idx % TESTIMONIAL_GRADIENTS.length],
                  }}
                >
                  {item.initials}
                </div>
                <div>
                  <p
                    className="green-gold-heading font-bold text-sm"
                    style={{ color: '#1A2E1A' }}
                  >
                    {item.name}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: 'rgba(26,46,26,0.3)' }}
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
function PullQuote({ content }: { content: GreenGoldContent }) {
  const pq = content.pullQuote;
  return (
    <section
      className="py-14 md:py-20"
      style={{ background: '#15803D' }}
    >
      <div className="max-w-3xl mx-auto px-6 text-center">
        <svg
          className="w-10 h-10 mx-auto mb-4 opacity-50"
          style={{ color: '#4ADE80' }}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
        </svg>
        <p
          className="green-gold-heading font-bold text-2xl md:text-3xl leading-relaxed italic"
          style={{ color: '#FFFFFF' }}
        >
          &ldquo;{pq.quote}&rdquo;
        </p>
        <p
          className="font-medium text-sm mt-4"
          style={{ color: '#BBF7D0' }}
        >
          — {pq.attribution}
        </p>
      </div>
    </section>
  );
}

/* ============== FIGURES / WHY THIS MATTERS ============== */
function Figures({ content }: { content: GreenGoldContent }) {
  const f = content.figures;
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-6">
        <p
          className="green-gold-heading font-bold text-sm uppercase tracking-wider mb-2 text-center"
          style={{ color: '#16A34A' }}
        >
          {f.eyebrow}
        </p>
        <h2
          className="green-gold-heading font-black text-3xl md:text-4xl text-center mb-12"
          style={{ color: '#1A2E1A' }}
        >
          {f.headline}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {f.items.map((item, idx) => (
            <div
              key={`figure-${idx}`}
              className="rounded-xl p-6 text-center"
              style={{
                background: '#F0FDF4',
                border: '1px solid #DCFCE7',
              }}
            >
              <p
                className="green-gold-heading font-black text-4xl mb-2"
                style={{ color: '#16A34A' }}
              >
                {item.value}
              </p>
              <p
                className="text-sm"
                style={{ color: 'rgba(26,46,26,0.55)' }}
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

/* ============== SHIFTS (TIMELINE) ============== */
function Shifts({ content }: { content: GreenGoldContent }) {
  const s = content.shifts;
  return (
    <section
      className="py-16 md:py-24"
      style={{ background: '#F0FDF4' }}
    >
      <div className="max-w-3xl mx-auto px-6">
        <p
          className="green-gold-heading font-bold text-sm uppercase tracking-wider mb-2"
          style={{ color: '#16A34A' }}
        >
          {s.eyebrow}
        </p>
        <h2
          className="green-gold-heading font-black text-3xl md:text-4xl mb-14"
          style={{ color: '#1A2E1A' }}
        >
          {s.headline}
        </h2>
        <div className="green-gold-timeline space-y-10 pl-1">
          {s.items.map((item, idx) => {
            const isLast = idx === s.items.length - 1;
            return (
              <div key={`shift-${idx}`} className="flex gap-6 items-start">
                <div
                  className={
                    isLast
                      ? 'green-gold-timeline-dot green-gold-timeline-dot-last'
                      : 'green-gold-timeline-dot'
                  }
                >
                  <span className="green-gold-heading font-black text-sm text-white">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="pt-2">
                  <h3
                    className="green-gold-heading font-bold text-xl mb-2"
                    style={{ color: '#1A2E1A' }}
                  >
                    {item.title}
                  </h3>
                  <p style={{ color: 'rgba(26,46,26,0.6)' }}>
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============== CLOSING CTA ============== */
function ClosingCTA({ content }: { content: GreenGoldContent }) {
  const c = content.closing;
  return (
    <section
      className="py-16 md:py-20 mx-4"
      style={{
        background:
          'linear-gradient(135deg, #14532D 0%, #16A34A 50%, #15803D 100%)',
        borderRadius: '24px',
      }}
    >
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2
          className="green-gold-heading font-black text-3xl md:text-5xl mb-10"
          style={{ color: '#FFFFFF' }}
        >
          {c.headline}
        </h2>
        <div className="grid grid-cols-2 gap-3 mb-10 max-w-lg mx-auto">
          {c.features.map((feature, idx) => (
            <span
              key={`closing-feature-${idx}`}
              className="green-gold-heading text-white font-bold text-sm px-4 py-3 rounded-full flex items-center gap-2 justify-center"
              style={{ background: '#EAB308' }}
            >
              <svg
                className="w-4 h-4 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {feature}
            </span>
          ))}
        </div>
        <a
          href="#optin"
          className="green-gold-heading inline-block font-black text-lg px-12 py-5 rounded-full uppercase tracking-wider shadow-xl"
          style={{ background: '#EAB308', color: '#1A2E1A' }}
        >
          {c.ctaLabel} &rarr;
        </a>
      </div>
    </section>
  );
}

/* ============== FAQ ============== */
function FAQ({ content }: { content: GreenGoldContent }) {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-6">
        <p
          className="green-gold-heading font-bold text-sm uppercase tracking-wider mb-2 text-center"
          style={{ color: '#16A34A' }}
        >
          {content.faqSection.eyebrow}
        </p>
        <h2
          className="green-gold-heading font-black text-3xl md:text-4xl text-center mb-12"
          style={{ color: '#1A2E1A' }}
        >
          {content.faqSection.headline}
        </h2>
        <div className="space-y-4">
          {content.faqs.map((faq, idx) => (
            <details
              key={`faq-${idx}`}
              className="bg-white rounded-xl shadow-sm"
              style={{
                border: '1px solid #DCFCE7',
                borderLeft: '4px solid #16A34A',
              }}
            >
              <summary
                className="flex items-center justify-between p-5 green-gold-heading font-bold"
                style={{ color: '#1A2E1A' }}
              >
                {faq.question}
                <span
                  className="green-gold-chevron text-xl"
                  style={{ color: '#16A34A' }}
                  aria-hidden="true"
                >
                  ▼
                </span>
              </summary>
              <div
                className="px-5 pb-5"
                style={{ color: 'rgba(26,46,26,0.6)' }}
              >
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============== FOOTER ============== */
function Footer({ content }: { content: GreenGoldContent }) {
  const f = content.footer;
  return (
    <footer
      className="py-10"
      style={{ background: '#0F1F0F', color: '#BBF7D0' }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: '#16A34A' }}
            >
              <span className="green-gold-heading font-black text-white text-lg">
                {f.brandInitial}
              </span>
            </div>
            <div>
              <p
                className="green-gold-heading font-bold text-sm"
                style={{ color: '#FFFFFF' }}
              >
                {f.brandName}
              </p>
              <p
                className="text-xs"
                style={{ color: '#86EFAC' }}
              >
                {f.tagline}
              </p>
            </div>
          </div>
          <div className="flex gap-6 text-sm">
            {f.links.map((link, idx) => (
              <a
                key={`footer-link-${idx}`}
                href={link.href}
                style={{ color: 'inherit' }}
              >
                {link.label}
              </a>
            ))}
          </div>
          <p
            className="text-xs"
            style={{ color: '#4ADE80' }}
          >
            {f.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ============== ROOT COMPONENT ============== */
export function GreenGold({ content, speakers, funnelId }: RootProps) {
  return (
    <div className="green-gold-root green-gold-body antialiased">
      <a href="#main-content" className="green-gold-skip-nav">
        Skip to content
      </a>

      <TopBar content={content} />

      <main id="main-content">
        <Hero content={content} speakers={speakers} />
        <Press content={content} />
        <Trust content={content} />
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
        <ClosingCTA content={content} />
        <FAQ content={content} />
      </main>

      <Footer content={content} />

      <OptinModal funnelId={funnelId} ctaLabel={content.hero.primaryCtaLabel} />
    </div>
  );
}
