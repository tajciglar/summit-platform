// Document chrome (html/head/body) is owned by the Next.js page/layout that
// renders this template. Fonts (Poppins / Source Sans 3) must be loaded by
// the page — see preview/public routes wiring.
import './green-gold.styles.css';
import type { CSSProperties } from 'react';
import { OptinModal } from '@/components/OptinModal';
import type { GreenGoldContent } from './green-gold.schema';
import { greenGoldDefaultEnabledSections } from './green-gold.sections';
import type { Speaker } from './types';

type Props = {
  content: GreenGoldContent;
  speakers: Record<string, Speaker>;
};

type RootProps = Props & {
  funnelId: string;
  enabledSections?: string[];
  palette?: import('@/lib/palette').Palette | null;
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

/* =======================================================================
 * SALES SECTIONS — heartland-green + warm gold editorial skin.
 *
 * These components render when sales-style sections are enabled. They share
 * the green-gold palette (brand-green + gold + cream) and typography
 * (Poppins headings, Source Sans 3 body) with the optin sections, so a
 * funnel that jumps optin → sales_page preserves the same brand voice.
 *
 * Each component short-circuits with `if (!content.xxx) return null;` so
 * optin pages (which omit these fields) render cleanly.
 * ======================================================================= */

const GG_SALES = {
  GREEN50: '#F0FDF4',
  GREEN100: '#DCFCE7',
  GREEN200: '#BBF7D0',
  GREEN300: '#86EFAC',
  GREEN400: '#4ADE80',
  GREEN500: '#22C55E',
  GREEN600: '#16A34A',
  GREEN700: '#15803D',
  GREEN800: '#166534',
  GREEN900: '#14532D',
  GOLD300: '#FDE68A',
  GOLD400: '#FACC15',
  GOLD500: '#EAB308',
  GOLD600: '#CA8A04',
  GOLD700: '#A16207',
  CREAM: '#FFF9E6',
  CREAM_BORDER: '#F0E1A8',
  INK900: '#1A2E1A',
  INK800: '#1F3520',
  INK700: '#2A3E2B',
  INK600: 'rgba(26,46,26,0.7)',
  INK500: 'rgba(26,46,26,0.55)',
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
  const color = GG_SALES.GREEN700;
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GG_SALES.GREEN600} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 3 }}>
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

function SalesGiftIcon({ size = 20, color = GG_SALES.GOLD700 }: { size?: number; color?: string }) {
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

/* Sales CTA button — warm-gold filled pill, matches the optin FreeGift CTA
 * so the visual rhyme between step types is preserved. */
const salesBtnCta: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '1rem 2rem',
  background: GG_SALES.GOLD500,
  color: GG_SALES.INK900,
  fontFamily: 'Poppins, sans-serif',
  fontWeight: 800,
  fontSize: '1.05rem',
  borderRadius: '9999px',
  boxShadow: '0 10px 24px -8px rgba(234,179,8,.6), inset 0 -3px 0 rgba(0,0,0,.08)',
  letterSpacing: '.04em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  border: 'none',
  cursor: 'pointer',
};

const salesBtnCtaLg: CSSProperties = { ...salesBtnCta, padding: '1.15rem 2.4rem', fontSize: '1.15rem' };

/* Shared section eyebrow style: bold, uppercase, letter-spaced green —
 * matches optin sections (Press / Outcomes) so the sales page reads like
 * the same publication. */
const salesEyebrow: CSSProperties = {
  fontFamily: 'Poppins, sans-serif',
  fontWeight: 700,
  fontSize: '0.8rem',
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: GG_SALES.GREEN600,
  marginBottom: '0.6rem',
};

const salesHeadline: CSSProperties = {
  fontFamily: 'Poppins, sans-serif',
  fontWeight: 900,
  fontSize: 'clamp(1.75rem,3vw,2.5rem)',
  color: GG_SALES.INK900,
  lineHeight: 1.15,
  letterSpacing: '-0.01em',
};

/* SALES HERO — soft green gradient wash, red live badge, warm-gold product
 * mockup, pulsing gold CTA. */
function SalesHero({ content }: { content: GreenGoldContent }) {
  if (!content.salesHero) return null;
  const h = content.salesHero;
  const topName = content.topBar.title;
  return (
    <section style={{ padding: '2.5rem 1.25rem 4rem', background: `linear-gradient(180deg,${GG_SALES.GREEN50} 0%,#FFFFFF 60%)` }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', fontFamily: 'Poppins, sans-serif', fontWeight: 800, letterSpacing: '0.22em', color: '#fff', background: '#dc2626', borderRadius: 9999, padding: '0.5rem 1rem', marginBottom: '1.5rem', textTransform: 'uppercase', boxShadow: '0 4px 14px rgba(220,38,38,.35)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
          {h.badge}
        </span>

        <h1 className="green-gold-heading" style={{ fontWeight: 900, fontSize: 'clamp(1.75rem,3.8vw,2.6rem)', lineHeight: 1.15, letterSpacing: '-0.01em', color: GG_SALES.INK900, marginBottom: '1rem' }}>
          {h.headline.split('40+').map((part, i, arr) =>
            i < arr.length - 1
              ? <span key={i}>{part}<span style={{ background: GG_SALES.GOLD300, padding: '0 0.35rem', borderRadius: 6 }}>40+</span></span>
              : <span key={i}>{part}</span>
          )}
        </h1>

        <p style={{ fontFamily: 'Source Sans 3, system-ui, sans-serif', fontSize: 'clamp(1.05rem,2vw,1.3rem)', color: GG_SALES.INK600, maxWidth: 680, margin: '0 auto 2rem', lineHeight: 1.55 }}>
          {h.subheadline}
        </p>

        {/* Product mockup — heartland green radial with warm-gold highlights */}
        <div style={{ maxWidth: 560, margin: '0 auto 2rem', borderRadius: 20, overflow: 'hidden', boxShadow: '0 28px 56px -18px rgba(20,83,45,.45)', aspectRatio: '16/9', background: `linear-gradient(135deg,${GG_SALES.GREEN900},${GG_SALES.GREEN700})`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.4, background: `radial-gradient(circle at 20% 50%,${GG_SALES.GREEN400},transparent 55%),radial-gradient(circle at 80% 55%,${GG_SALES.GOLD400},transparent 45%)` }} />
          <div style={{ position: 'relative', textAlign: 'center', color: '#fff', padding: '1.5rem' }}>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.42em', textTransform: 'uppercase', opacity: 0.8, marginBottom: '0.6rem' }}>Full Access</p>
            <p className="green-gold-heading" style={{ fontSize: 'clamp(2rem,5vw,3.6rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1, margin: 0 }}>{h.productLabel}</p>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.72rem', fontWeight: 600, opacity: 0.85, marginTop: '0.75rem', letterSpacing: '0.24em', textTransform: 'uppercase' }}>{topName}</p>
          </div>
        </div>

        <p style={{ fontSize: '0.88rem', color: GG_SALES.INK700, marginBottom: '0.75rem' }}>
          Total value: <span style={{ fontWeight: 800, color: GG_SALES.GREEN700, textDecoration: 'line-through' }}>{h.totalValue}</span>
        </p>
        <a href="#purchase" id="purchase" className="green-gold-pulse-gold" style={salesBtnCtaLg}>
          {h.ctaLabel} <SalesArrowRight size={20} />
        </a>
        <p style={{ marginTop: '1rem', fontSize: '0.88rem', color: GG_SALES.GREEN700, fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
          <strong>{h.ctaNote}</strong>
        </p>
      </div>
    </section>
  );
}

/* INTRO — bold green eyebrow + black headline + generous body paragraphs. */
function Intro({ content }: { content: GreenGoldContent }) {
  if (!content.intro) return null;
  const i = content.intro;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: '#fff' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <p className="green-gold-heading" style={salesEyebrow}>{i.eyebrow}</p>
        <h2 className="green-gold-heading" style={{ ...salesHeadline, marginBottom: '1.5rem' }}>{i.headline}</h2>
        {i.paragraphs.map((p, idx) => (
          <p key={idx} style={{ color: GG_SALES.INK700, fontSize: '1.1rem', lineHeight: 1.75, marginBottom: '1rem' }}>{p}</p>
        ))}
      </div>
    </section>
  );
}

/* VIP BONUSES — soft-green tinted background, white cards with gradient
 * green icon tiles and cream gold value pills. */
function VipBonuses({ content }: { content: GreenGoldContent }) {
  if (!content.vipBonuses) return null;
  const v = content.vipBonuses;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: GG_SALES.GREEN50 }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p className="green-gold-heading" style={salesEyebrow}>{v.eyebrow}</p>
          <h2 className="green-gold-heading" style={salesHeadline}>{v.headline}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem' }}>
          {v.items.map((item, i) => (
            <div key={i} style={{ background: '#fff', border: `1px solid ${GG_SALES.GREEN200}`, borderRadius: 20, boxShadow: '0 10px 26px -14px rgba(20,83,45,.3)', overflow: 'hidden', position: 'relative' }}>
              <div style={{ background: `linear-gradient(135deg,${GG_SALES.GREEN100},${GG_SALES.GREEN200})`, aspectRatio: '16/10', display: 'grid', placeItems: 'center', color: GG_SALES.GREEN700, padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <SalesBonusIcon icon={item.icon} />
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.02em' }}>{salesIconLabels[item.icon]}</span>
                </div>
              </div>
              <div style={{ padding: '1.5rem 1.5rem 1.25rem' }}>
                <h3 className="green-gold-heading" style={{ fontWeight: 800, fontSize: '1.05rem', color: GG_SALES.INK900, marginBottom: '0.45rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.92rem', color: GG_SALES.INK700, lineHeight: 1.6, marginBottom: '0.85rem' }}>{item.description}</p>
                <span className="green-gold-heading" style={{ display: 'inline-block', background: GG_SALES.CREAM, border: `1px solid ${GG_SALES.CREAM_BORDER}`, color: GG_SALES.GOLD700, fontWeight: 800, fontSize: '.7rem', letterSpacing: '.14em', padding: '.35rem .75rem', borderRadius: 9999 }}>{item.valueLabel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* FREE GIFTS — cream/gold card grid with gift icon tiles and red "Free Gift #n"
 * eyebrows. Feels like a boxed present. */
function FreeGifts({ content }: { content: GreenGoldContent }) {
  if (!content.freeGifts) return null;
  const fg = content.freeGifts;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: '#fff' }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p className="green-gold-heading" style={salesEyebrow}>{fg.eyebrow}</p>
          <h2 className="green-gold-heading" style={salesHeadline}>{fg.headline}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1.25rem' }}>
          {fg.items.map((gift, i) => (
            <div key={i} style={{ background: GG_SALES.CREAM, border: `1px solid ${GG_SALES.CREAM_BORDER}`, borderRadius: 20, boxShadow: '0 10px 26px -14px rgba(234,179,8,.3)', overflow: 'hidden' }}>
              <div style={{ background: `linear-gradient(135deg,#FFF6D6,${GG_SALES.GOLD300})`, aspectRatio: '16/10', display: 'grid', placeItems: 'center', color: GG_SALES.GOLD700, padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <SalesGiftIcon size={40} color={GG_SALES.GOLD700} />
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.95rem' }}>Free Gift #{gift.giftNumber}</span>
                </div>
              </div>
              <div style={{ padding: '1.5rem 1.5rem 1.25rem' }}>
                <p className="green-gold-heading" style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '.18em', color: '#dc2626', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Free Gift #{gift.giftNumber}</p>
                <h3 className="green-gold-heading" style={{ fontWeight: 800, fontSize: '1.05rem', color: GG_SALES.INK900, marginBottom: '0.45rem' }}>{gift.title}</h3>
                <p style={{ fontSize: '0.92rem', color: GG_SALES.INK700, lineHeight: 1.6, marginBottom: '0.85rem' }}>{gift.description}</p>
                <span className="green-gold-heading" style={{ display: 'inline-block', background: '#fff', border: `1px solid ${GG_SALES.CREAM_BORDER}`, color: GG_SALES.GOLD700, fontWeight: 800, fontSize: '.7rem', letterSpacing: '.14em', padding: '.35rem .75rem', borderRadius: 9999 }}>{gift.valueLabel}</span>
              </div>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.92rem', color: GG_SALES.INK600 }}>{fg.deliveryNote}</p>
      </div>
    </section>
  );
}

/* UPGRADE SECTION — green-tinted preamble before the PriceCard. */
function UpgradeSection({ content }: { content: GreenGoldContent }) {
  if (!content.upgradeSection) return null;
  const u = content.upgradeSection;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: GG_SALES.GREEN50 }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ textAlign: 'center' }}>
          <p className="green-gold-heading" style={salesEyebrow}>{u.eyebrow}</p>
          <h2 className="green-gold-heading" style={{ ...salesHeadline, marginBottom: '1.5rem' }}>{u.headline}</h2>
          {u.paragraphs.map((p, i) => (
            <p key={i} style={{ color: GG_SALES.INK700, fontSize: '1.05rem', lineHeight: 1.75, marginBottom: '0.85rem', maxWidth: 680, margin: '0 auto 0.85rem' }}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

/* PRICE CARD — white card with green border, top gradient bar, bullet
 * features, cream gift box, strikethrough value, large green price, gold
 * pulse CTA. Renders ONCE. */
function PriceCard({ content }: { content: GreenGoldContent }) {
  if (!content.priceCard) return null;
  const p = content.priceCard;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: '#fff' }} id="purchase">
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{
          background: '#fff',
          border: `2px solid ${GG_SALES.GREEN500}`,
          borderRadius: 24,
          boxShadow: '0 26px 48px -22px rgba(20,83,45,.4)',
          padding: '1.75rem 1.5rem',
          position: 'relative',
          overflow: 'hidden',
          maxWidth: 480,
          width: '100%',
          margin: '0 auto',
        }}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 6, background: `linear-gradient(90deg,${GG_SALES.GREEN600},${GG_SALES.GOLD400},${GG_SALES.GREEN600})` }} />

          <div className="green-gold-heading" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#dc2626', color: '#fff', padding: '.4rem .9rem', borderRadius: 9999, fontWeight: 800, fontSize: '.72rem', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            {p.badge}
          </div>

          <h3 className="green-gold-heading" style={{ fontWeight: 800, fontSize: '1.25rem', color: GG_SALES.INK900, marginBottom: '0.5rem', lineHeight: 1.3 }}>{p.headline}</h3>
          <p style={{ fontSize: '0.92rem', color: GG_SALES.INK600, marginBottom: '0.75rem' }}>{p.note}</p>

          <ul style={{ padding: 0, listStyle: 'none', margin: '1rem 0 1.25rem' }}>
            {p.features.map((f, i) => (
              <li key={i} style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start', padding: '0.4rem 0', fontSize: '0.95rem', color: GG_SALES.INK700, lineHeight: 1.5 }}>
                <SalesCheckIcon />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <div style={{ background: GG_SALES.CREAM, border: `1px solid ${GG_SALES.CREAM_BORDER}`, borderRadius: 14, padding: '0.95rem 1rem', marginBottom: '1.25rem' }}>
            <p className="green-gold-heading" style={{ fontWeight: 800, fontSize: '0.85rem', color: GG_SALES.GOLD700, marginBottom: '0.55rem', display: 'flex', alignItems: 'center', gap: '0.45rem', letterSpacing: '.06em', textTransform: 'uppercase' }}>
              <SalesGiftIcon size={16} /> {p.giftsBoxTitle}
            </p>
            {p.giftItems.map((g, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.55rem', alignItems: 'flex-start', fontSize: '0.9rem', padding: '0.3rem 0', color: GG_SALES.INK700 }}>
                <SalesCheckIcon />
                <span>{g}</span>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', borderTop: `1px solid ${GG_SALES.GREEN100}`, paddingTop: '1.25rem' }}>
            <p style={{ color: GG_SALES.INK500, textDecoration: 'line-through', fontWeight: 500, fontSize: '0.9rem', marginBottom: '0.35rem' }}>
              Total value: {p.totalValue} — Regular price: {p.regularPrice}
            </p>
            <p className="green-gold-heading" style={{ fontSize: '2.75rem', fontWeight: 900, color: GG_SALES.GREEN600, letterSpacing: '-0.025em', lineHeight: 1 }}>{p.currentPrice}</p>
            <p className="green-gold-heading" style={{ fontSize: '0.85rem', color: GG_SALES.GREEN700, fontWeight: 700, marginTop: '0.3rem', marginBottom: '1rem', letterSpacing: '.02em' }}>{p.savings}</p>
            <a href="#purchase" className="green-gold-pulse-gold" style={salesBtnCtaLg}>
              {p.ctaLabel} <SalesArrowRight size={20} />
            </a>
            <p style={{ marginTop: '0.85rem', fontSize: '0.78rem', color: GG_SALES.INK600 }}>{p.guarantee}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* SALES SPEAKERS — <details> cards with photo or gradient-initials avatar
 * and an expandable bio. Uses green-tinted shadows to feel on-brand. */
function SalesSpeakers({ content, speakers }: { content: GreenGoldContent; speakers: Record<string, Speaker> }) {
  if (!content.salesSpeakers) return null;
  const s = content.salesSpeakers;
  const sortedSpeakers = Object.values(speakers).sort((a, b) => a.sortOrder - b.sortOrder);
  if (sortedSpeakers.length === 0) return null;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: '#fff' }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p className="green-gold-heading" style={salesEyebrow}>{s.eyebrow}</p>
          <h2 className="green-gold-heading" style={salesHeadline}>{s.headline}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1rem' }}>
          {sortedSpeakers.map((spk, idx) => (
            <details key={spk.id} className="green-gold-sales-spk" style={{ background: '#fff', border: `1px solid ${GG_SALES.GREEN200}`, borderRadius: 16, boxShadow: '0 6px 18px -10px rgba(20,83,45,.28)', marginBottom: 0, overflow: 'hidden' }}>
              <summary style={{ cursor: 'pointer', listStyle: 'none', padding: '1.5rem 1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem' }}>
                {spk.photoUrl
                  ? /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={spk.photoUrl} alt={`${spk.firstName} ${spk.lastName}`} style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${GG_SALES.GREEN200}`, boxShadow: `0 0 0 4px #fff, 0 6px 14px -4px rgba(20,83,45,.35)` }} />
                  : <div className="green-gold-heading" style={{ width: 84, height: 84, borderRadius: '50%', background: SPEAKER_GRADIENTS[idx % SPEAKER_GRADIENTS.length], border: `3px solid ${GG_SALES.GREEN200}`, display: 'grid', placeItems: 'center', color: '#fff', fontSize: '1.6rem', fontWeight: 800, boxShadow: `0 0 0 4px #fff, 0 6px 14px -4px rgba(20,83,45,.35)` }}>
                      {(spk.firstName?.[0] ?? '') + (spk.lastName?.[0] ?? '')}
                    </div>
                }
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <p className="green-gold-heading" style={{ fontWeight: 800, fontSize: '0.98rem', color: GG_SALES.INK900, margin: 0 }}>{spk.firstName} {spk.lastName}</p>
                  <p style={{ fontSize: '0.78rem', color: GG_SALES.GREEN700, margin: 0, fontWeight: 600 }}>{spk.title}</p>
                  <p style={{ fontSize: '0.78rem', color: GG_SALES.INK600, margin: 0, fontStyle: 'italic' }}>{spk.masterclassTitle}</p>
                </div>
              </summary>
              {spk.shortBio && (
                <p style={{ padding: '0 1.5rem 1.5rem', color: GG_SALES.INK700, fontSize: '0.88rem', lineHeight: 1.65, margin: 0, textAlign: 'center' }}>{spk.shortBio}</p>
              )}
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* COMPARISON TABLE — Free Pass vs VIP Pass side-by-side. Green header bar,
 * cream-tinted VIP column to emphasize the upgrade. */
function ComparisonTable({ content }: { content: GreenGoldContent }) {
  if (!content.comparisonTable) return null;
  const c = content.comparisonTable;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: GG_SALES.GREEN50 }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p className="green-gold-heading" style={salesEyebrow}>{c.eyebrow}</p>
          <h2 className="green-gold-heading" style={salesHeadline}>{c.headline}</h2>
        </div>
        <div style={{ overflowX: 'auto', borderRadius: 16, boxShadow: '0 14px 32px -18px rgba(20,83,45,.35)' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, borderRadius: 16, overflow: 'hidden', border: `1px solid ${GG_SALES.GREEN200}`, background: '#fff' }}>
            <thead>
              <tr>
                <th className="green-gold-heading" style={{ background: GG_SALES.GREEN100, color: GG_SALES.GREEN800, fontWeight: 800, fontSize: '.78rem', letterSpacing: '.16em', textTransform: 'uppercase', padding: '1rem', textAlign: 'left' }}>Feature</th>
                <th className="green-gold-heading" style={{ background: GG_SALES.GREEN200, color: GG_SALES.GREEN800, fontWeight: 800, fontSize: '.78rem', letterSpacing: '.16em', textTransform: 'uppercase', padding: '1rem', textAlign: 'center' }}>Free Pass</th>
                <th className="green-gold-heading" style={{ background: GG_SALES.GOLD300, color: GG_SALES.GOLD700, fontWeight: 800, fontSize: '.78rem', letterSpacing: '.16em', textTransform: 'uppercase', padding: '1rem', textAlign: 'center' }}>VIP Pass</th>
              </tr>
            </thead>
            <tbody>
              {c.rows.map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '1rem', borderTop: `1px solid ${GG_SALES.GREEN100}`, fontWeight: 600, color: GG_SALES.INK900, fontSize: '0.95rem', lineHeight: 1.45 }}>{row.label}</td>
                  <td style={{ padding: '1rem', borderTop: `1px solid ${GG_SALES.GREEN100}`, textAlign: 'center' }}>
                    {row.freePass
                      ? <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: GG_SALES.GREEN100, color: GG_SALES.GREEN600 }}><SalesCheckIcon /></span>
                      : <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: '#FEE2E2', color: '#DC2626' }}><SalesXIcon /></span>
                    }
                  </td>
                  <td style={{ padding: '1rem', borderTop: `1px solid ${GG_SALES.GREEN100}`, background: 'rgba(253,230,138,0.22)', textAlign: 'center' }}>
                    {row.vipPass
                      ? <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: GG_SALES.GREEN100, color: GG_SALES.GREEN600 }}><SalesCheckIcon /></span>
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

/* GUARANTEE — dashed-gold cream card with shield + copy. */
function Guarantee({ content }: { content: GreenGoldContent }) {
  if (!content.guarantee) return null;
  const g = content.guarantee;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: GG_SALES.GREEN50 }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ background: GG_SALES.CREAM, border: `2px dashed ${GG_SALES.CREAM_BORDER}`, borderRadius: 22, padding: '1.85rem', display: 'flex', gap: '1.25rem', alignItems: 'center', boxShadow: '0 10px 26px -16px rgba(234,179,8,.35)' }}>
          <div style={{ fontSize: '3rem', flexShrink: 0 }}>🛡️</div>
          <div>
            <h3 className="green-gold-heading" style={{ fontWeight: 800, fontSize: '1.15rem', color: GG_SALES.INK900, marginBottom: '0.5rem' }}>{g.heading}</h3>
            <p style={{ fontSize: '0.95rem', color: GG_SALES.INK700, lineHeight: 1.65, margin: 0 }}>{g.body}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* WHY SECTION — centered headline + green subtitle + body paragraphs. */
function WhySection({ content }: { content: GreenGoldContent }) {
  if (!content.whySection) return null;
  const w = content.whySection;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: '#fff' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <h2 className="green-gold-heading" style={{ ...salesHeadline, marginBottom: '0.6rem' }}>{w.headline}</h2>
        <p className="green-gold-heading" style={{ fontSize: '1.2rem', fontWeight: 700, color: GG_SALES.GREEN700, marginBottom: '1.5rem', letterSpacing: '.01em' }}>{w.subheadline}</p>
        {w.paragraphs.map((p, i) => (
          <p key={i} style={{ color: GG_SALES.INK700, fontSize: '1.05rem', lineHeight: 1.75, marginBottom: '1rem' }}>{p}</p>
        ))}
      </div>
    </section>
  );
}

/* ============== ROOT COMPONENT ============== */
export function GreenGold({ content, speakers, funnelId, enabledSections }: RootProps) {
  const enabled = new Set(enabledSections ?? greenGoldDefaultEnabledSections);
  return (
    <div className="green-gold-root green-gold-body antialiased">
      <a href="#main-content" className="green-gold-skip-nav">
        Skip to content
      </a>

      {enabled.has('top-bar') && <TopBar content={content} />}

      <main id="main-content">
        {enabled.has('hero') && <Hero content={content} speakers={speakers} />}
        {enabled.has('press') && <Press content={content} />}
        {enabled.has('trust') && <Trust content={content} />}
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
        {enabled.has('closing-cta') && <ClosingCTA content={content} />}
        {enabled.has('faq') && <FAQ content={content} />}

        {/* Sales-page sections — optional, only rendered when enabled. */}
        {enabled.has('sales-hero') && <SalesHero content={content} />}
        {enabled.has('intro') && <Intro content={content} />}
        {enabled.has('vip-bonuses') && <VipBonuses content={content} />}
        {enabled.has('free-gifts') && <FreeGifts content={content} />}
        {enabled.has('upgrade-section') && <UpgradeSection content={content} />}
        {enabled.has('price-card') && <PriceCard content={content} />}
        {enabled.has('sales-speakers') && <SalesSpeakers content={content} speakers={speakers} />}
        {enabled.has('comparison-table') && <ComparisonTable content={content} />}
        {enabled.has('guarantee') && <Guarantee content={content} />}
        {enabled.has('why-section') && <WhySection content={content} />}
      </main>

      {enabled.has('footer') && <Footer content={content} />}

      {enabled.has('hero') && content.hero && (
        <OptinModal funnelId={funnelId} ctaLabel={content.hero.primaryCtaLabel} />
      )}
    </div>
  );
}
