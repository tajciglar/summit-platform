// Document chrome (html/head/body) is owned by the Next.js page/layout that
// renders this template. Fonts (Poppins / Source Sans 3 / Playfair Display)
// must be loaded by the page — see Task 19/20 (preview/public routes) for wiring.
import './rust-cream.styles.css';
import type { CSSProperties } from 'react';
import { OptinModal } from '@/components/OptinModal';
import type { RustCreamContent } from './rust-cream.schema';
import { rustCreamDefaultEnabledSections } from './rust-cream.sections';
import type { Speaker } from './types';

type Props = {
  content: RustCreamContent;
  speakers: Record<string, Speaker>;
};

type RootProps = Props & {
  funnelId: string;
  enabledSections?: string[];
  palette?: import('@/lib/palette').Palette | null;
};

/* Visual gradients for speaker avatars — deterministic, cycled by index.
 * Drawn from the rust-cream HTML palette (warm brown/tan/sage/gold). */
const SPEAKER_GRADIENTS = [
  'linear-gradient(135deg,#8B4513,#6B3410)',
  'linear-gradient(135deg,#5B8C5A,#3A5C3A)',
  'linear-gradient(135deg,#D4A04A,#B8872E)',
  'linear-gradient(135deg,#3D2B1F,#6B3410)',
  'linear-gradient(135deg,#C2703E,#A85C2F)',
  'linear-gradient(135deg,#8B4513,#A85C2F)',
  'linear-gradient(135deg,#B8872E,#D4A04A)',
  'linear-gradient(135deg,#5B8C5A,#4A7349)',
];

const AVATAR_SM_GRADIENTS = [
  'linear-gradient(135deg,#8B4513,#6B3410)',
  'linear-gradient(135deg,#D4A04A,#B8872E)',
  'linear-gradient(135deg,#C2703E,#A85C2F)',
  'linear-gradient(135deg,#5B8C5A,#4A7349)',
];

const FOUNDER_GRADIENTS = [
  'linear-gradient(135deg,#8B4513,#6B3410)',
  'linear-gradient(135deg,#D4A04A,#B8872E)',
];

const TESTIMONIAL_AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#8B4513,#6B3410)',
  'linear-gradient(135deg,#D4A04A,#B8872E)',
  'linear-gradient(135deg,#5B8C5A,#3A5C3A)',
];

const STAT_CARD_GRADIENTS = [
  'linear-gradient(135deg,#8B4513,#6B3410)',
  'linear-gradient(135deg,#C2703E,#A85C2F)',
  'linear-gradient(135deg,#5B8C5A,#3A5C3A)',
];

const STAT_CARD_LABEL_COLORS = ['#E8C4A8', '#E8C4A8', '#8BB889'];

function initialsFromSpeaker(s: Speaker): string {
  const a = s.firstName?.trim()?.[0] ?? '';
  const b = s.lastName?.trim()?.[0] ?? '';
  return (a + b).toUpperCase() || '??';
}

function displayName(s: Speaker): string {
  return `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() || '—';
}

/* Trust icon SVGs — keyed by enum in schema. */
function TrustIcon({ name }: { name: 'shield' | 'lock' | 'info' | 'star' }) {
  const color = name === 'star' ? '#D4A04A' : '#5B8C5A';
  if (name === 'shield') {
    return (
      <svg className="w-4 h-4" style={{ color }} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    );
  }
  if (name === 'lock') {
    return (
      <svg className="w-4 h-4" style={{ color }} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
      </svg>
    );
  }
  if (name === 'info') {
    return (
      <svg className="w-4 h-4" style={{ color }} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" style={{ color }} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#5B8C5A' }} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

/* ============== STICKY TOP BAR ============== */
function TopBar({ content }: { content: RustCreamContent }) {
  return (
    <div className="sticky top-0 z-50 py-4 px-4 shadow-lg" style={{ backgroundColor: '#3D2B1F' }}>
      <div className="max-w-6xl mx-auto flex items-center justify-center">
        <span className="rust-cream-heading font-bold text-lg md:text-xl tracking-tight text-white">
          {content.topBar.name}
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

  return (
    <section
      className="py-16 md:py-24"
      style={{ background: 'linear-gradient(135deg, #F5EDE4 0%, #E8C4A8 40%, #FDF8F3 100%)' }}
    >
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="rust-cream-heading font-bold text-sm mb-3" style={{ color: '#C2703E' }}>
          {h.eyebrow}
        </p>
        <h1
          className="rust-cream-heading font-black text-3xl md:text-4xl lg:text-[2.75rem] leading-[1.15] mb-5"
          style={{ color: '#3D2B1F' }}
        >
          {h.headline}
        </h1>
        <p className="text-lg mb-6 leading-relaxed" style={{ color: '#8B7355' }}>
          <strong style={{ color: '#3D2B1F' }}>{h.subheadlineLead}</strong> {h.subheadline}
        </p>
        <a
          href="#optin"
          className="rust-cream-pulse-glow inline-block text-white rust-cream-heading font-bold text-base px-10 py-4 rounded-full transition-all uppercase tracking-wide mb-4 hover:scale-105"
          style={{ backgroundColor: '#8B4513' }}
        >
          {h.ctaLabel}
        </a>
        <p className="text-sm mb-6" style={{ color: '#8B7355' }}>
          {h.freeGiftLine}{' '}
          <strong style={{ color: '#8B4513' }}>{h.freeGiftEmphasis}</strong>
          {h.freeGiftSuffix}
        </p>

        {/* Social proof: avatar stack + stars */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="flex -space-x-2">
            {heroSpeakers.slice(0, 4).map((s, idx) => (
              <div
                key={`hero-stack-${s.id}`}
                className="rust-cream-avatar-sm"
                style={{ background: AVATAR_SM_GRADIENTS[idx % AVATAR_SM_GRADIENTS.length] }}
              >
                {initialsFromSpeaker(s)}
              </div>
            ))}
          </div>
          <p className="text-sm" style={{ color: '#8B7355' }}>
            <span className="block text-xs mb-0.5" style={{ color: '#D4A04A' }} aria-hidden="true">
              ★★★★★
            </span>
            {h.readerCountPrefix}{' '}
            <strong style={{ color: '#3D2B1F' }}>{h.readerCount}</strong> {h.readerCountSuffix}
          </p>
        </div>

        {/* Speaker row below CTA */}
        <div className="flex items-center justify-center gap-5 flex-wrap">
          {heroSpeakers.slice(0, 6).map((s, idx) => (
            <div key={`hero-row-${s.id}`} className="flex flex-col items-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white rust-cream-heading font-bold text-sm"
                style={{
                  background: SPEAKER_GRADIENTS[idx % SPEAKER_GRADIENTS.length],
                  border: '3px solid #E8C4A8',
                }}
              >
                {initialsFromSpeaker(s)}
              </div>
              <p
                className="rust-cream-heading font-bold text-xs mt-1.5"
                style={{ color: '#3D2B1F' }}
              >
                {displayName(s)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============== PRESS MARQUEE ============== */
function Press({ content }: { content: RustCreamContent }) {
  const outlets = content.press.outlets;
  return (
    <section className="py-10" style={{ backgroundColor: '#FDF8F3' }}>
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p
          className="text-xs rust-cream-heading font-bold tracking-[0.2em] uppercase mb-6"
          style={{ color: '#8B7355' }}
        >
          {content.press.eyebrow}
        </p>
        <div className="rust-cream-marquee-wrap">
          <div className="rust-cream-marquee-track">
            <div className="rust-cream-marquee-set">
              {outlets.map((name, idx) => (
                <span className="rust-cream-logo-item" key={`press-a-${idx}`}>
                  {name}
                </span>
              ))}
            </div>
            <div className="rust-cream-marquee-set" aria-hidden="true">
              {outlets.map((name, idx) => (
                <span className="rust-cream-logo-item" key={`press-b-${idx}`}>
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============== TRUST BADGES ============== */
function Trust({ content }: { content: RustCreamContent }) {
  return (
    <section
      className="py-5"
      style={{ backgroundColor: '#FDF8F3', borderBottom: '1px solid #E8C4A8' }}
    >
      <div
        className="max-w-4xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm"
        style={{ color: '#8B7355' }}
      >
        {content.trust.items.map((item, idx) => (
          <span key={`trust-${idx}`} className="flex items-center gap-2">
            <TrustIcon name={item.icon} />
            {item.label}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ============== STATS ============== */
function Stats({ content }: { content: RustCreamContent }) {
  return (
    <section className="py-14" style={{ backgroundColor: '#FDF8F3' }}>
      <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {content.stats.items.map((item, idx) => (
          <div
            key={`stat-${idx}`}
            className="rounded-2xl shadow-lg p-8 text-center"
            style={{ background: STAT_CARD_GRADIENTS[idx % STAT_CARD_GRADIENTS.length] }}
          >
            <p className="rust-cream-heading font-black text-4xl md:text-5xl text-white">
              {item.value}
            </p>
            <p
              className="font-medium text-sm mt-1 uppercase tracking-wider"
              style={{ color: STAT_CARD_LABEL_COLORS[idx % STAT_CARD_LABEL_COLORS.length] }}
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
function Overview({ content }: { content: RustCreamContent }) {
  const o = content.overview;
  return (
    <section id="what-is-this" className="py-16 md:py-24" style={{ backgroundColor: '#F5EDE4' }}>
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p
            className="rust-cream-heading font-bold text-sm uppercase tracking-wider mb-2"
            style={{ color: '#C2703E' }}
          >
            {o.eyebrow}
          </p>
          <h2
            className="rust-cream-heading font-black text-3xl md:text-4xl mb-6"
            style={{ color: '#3D2B1F' }}
          >
            {o.headline}
          </h2>
          {o.bodyParagraphs.map((para, idx) => (
            <p
              key={`overview-p-${idx}`}
              className="text-lg leading-relaxed mb-4"
              style={{ color: '#8B7355' }}
            >
              {para}
            </p>
          ))}
          <a
            href="#optin"
            className="inline-block text-white rust-cream-heading font-bold px-8 py-4 rounded-full transition-colors text-base hover:opacity-90 mt-4"
            style={{ backgroundColor: '#C2703E' }}
          >
            {o.ctaLabel}
          </a>
        </div>
        <div
          className="rounded-2xl aspect-[4/3] flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg,#FDF8F3,#F5EDE4,#E8C4A8)',
            border: '1px solid #E8C4A8',
          }}
        >
          <div className="text-center p-8">
            <div className="flex justify-center gap-4 mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: '#C2703E' }}
                aria-hidden="true"
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: '#D4A04A' }}
                aria-hidden="true"
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: '#5B8C5A' }}
                aria-hidden="true"
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <p
              className="rust-cream-heading font-bold text-xl mb-1"
              style={{ color: '#3D2B1F' }}
            >
              {o.cardHeadline}
            </p>
            <p className="text-sm" style={{ color: '#8B7355' }}>
              {o.cardSubtext}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============== SPEAKERS — DAY 1 ============== */
function SpeakersDay({ content, speakers }: Props) {
  const daySpeakers = content.speakersDay.speakerIds
    .map((id) => speakers[id])
    .filter((s): s is Speaker => Boolean(s));

  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: '#FDF8F3' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <span
            className="inline-block text-white rust-cream-heading font-bold text-sm px-5 py-2 rounded-full mb-4"
            style={{ backgroundColor: '#C2703E' }}
          >
            {content.speakersDay.dayLabel}
          </span>
          <h2
            className="rust-cream-heading font-black text-3xl md:text-4xl"
            style={{ color: '#3D2B1F' }}
          >
            {content.speakersDay.headline}
          </h2>
        </div>
        <div className="rust-cream-speaker-scroll">
          {daySpeakers.map((s, idx) => (
            <div key={s.id} className="rust-cream-speaker-card flex flex-col items-center">
              <div
                className="rust-cream-avatar mb-3"
                style={{ background: SPEAKER_GRADIENTS[idx % SPEAKER_GRADIENTS.length] }}
              >
                {initialsFromSpeaker(s)}
              </div>
              <p className="rust-cream-heading font-bold" style={{ color: '#3D2B1F' }}>
                {displayName(s)}
              </p>
              {s.title ? (
                <p className="text-sm text-center" style={{ color: '#8B7355' }}>
                  {s.title}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============== OUTCOMES ============== */
function Outcomes({ content }: { content: RustCreamContent }) {
  const o = content.outcomes;
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: '#F5EDE4' }}>
      <div className="max-w-5xl mx-auto px-6">
        <p
          className="rust-cream-heading font-bold text-sm uppercase tracking-wider mb-2 text-center"
          style={{ color: '#C2703E' }}
        >
          {o.eyebrow}
        </p>
        <h2
          className="rust-cream-heading font-black text-3xl md:text-4xl mb-12 text-center"
          style={{ color: '#3D2B1F' }}
        >
          {o.headline}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {o.items.map((item, idx) => {
            const iconBg = item.accent === 'primary' ? '#C2703E' : '#5B8C5A';
            return (
              <div
                key={`outcome-${idx}`}
                className="text-center p-6 rounded-2xl"
                style={{ backgroundColor: '#FDF8F3' }}
              >
                <div
                  className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: iconBg }}
                  aria-hidden="true"
                >
                  <span className="rust-cream-heading font-black text-lg text-white">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>
                <p className="rust-cream-heading font-bold" style={{ color: '#3D2B1F' }}>
                  {item.title}
                </p>
                <p className="text-sm mt-1" style={{ color: '#8B7355' }}>
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

/* ============== FREE GIFT ============== */
function FreeGift({ content }: { content: RustCreamContent }) {
  const g = content.freeGift;
  return (
    <section
      className="py-14 md:py-20"
      style={{ background: 'linear-gradient(135deg, #FDF8F3 0%, #E8C4A840 100%)' }}
    >
      <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
        <div className="flex justify-center">
          <div className="relative">
            <div
              className="w-56 h-72 bg-white rounded-xl shadow-2xl flex flex-col items-center justify-center p-6 transform -rotate-3"
              style={{ border: '1px solid #E8C4A8' }}
            >
              <div
                className="w-full h-2 rounded-full mb-4"
                style={{ backgroundColor: '#C2703E' }}
              ></div>
              <div
                className="w-12 h-12 rounded-xl mb-3 flex items-center justify-center"
                style={{ backgroundColor: '#8B4513' }}
                aria-hidden="true"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p
                className="rust-cream-heading font-bold text-sm text-center leading-tight"
                style={{ color: '#3D2B1F' }}
              >
                {g.mockupTitle}
              </p>
              <p className="text-xs mt-2" style={{ color: '#8B7355' }}>
                {g.mockupSubtitle}
              </p>
            </div>
            <div
              className="absolute -top-3 -right-3 text-white rust-cream-heading font-black text-xs px-3 py-1.5 rounded-full shadow-lg transform rotate-12"
              style={{ backgroundColor: '#D4A04A' }}
            >
              {g.badgeLabel}
            </div>
          </div>
        </div>
        <div>
          <p
            className="rust-cream-heading font-bold text-sm uppercase tracking-wider mb-2"
            style={{ color: '#D4A04A' }}
          >
            {g.eyebrow}
          </p>
          <h2
            className="rust-cream-heading font-black text-2xl md:text-3xl mb-4"
            style={{ color: '#3D2B1F' }}
          >
            {g.headline}
          </h2>
          <p className="mb-5" style={{ color: '#8B7355' }}>
            {g.body}
          </p>
          <ul className="space-y-3 mb-6">
            {g.bullets.map((bullet, idx) => (
              <li
                key={`gift-bullet-${idx}`}
                className="flex items-start gap-2"
                style={{ color: '#3D2B1F' }}
              >
                <CheckIcon />
                {bullet}
              </li>
            ))}
          </ul>
          <a
            href="#optin"
            className="rust-cream-pulse-glow inline-block text-white rust-cream-heading font-bold text-sm px-7 py-3.5 rounded-full transition-all uppercase tracking-wide hover:scale-105"
            style={{ backgroundColor: '#8B4513' }}
          >
            {g.ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============== BONUSES ============== */
function Bonuses({ content }: { content: RustCreamContent }) {
  const b = content.bonuses;
  return (
    <section
      className="py-16 md:py-24"
      style={{ background: 'linear-gradient(135deg, #F5EDE4 0%, #E8C4A8 100%)' }}
    >
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p
          className="rust-cream-heading font-bold text-sm uppercase tracking-wider mb-2"
          style={{ color: '#D4A04A' }}
        >
          {b.eyebrow}
        </p>
        <h2
          className="rust-cream-heading font-black text-3xl md:text-4xl mb-12"
          style={{ color: '#3D2B1F' }}
        >
          {b.headline}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {b.items.map((bonus, idx) => (
            <div
              key={`bonus-${idx}`}
              className="bg-white rounded-xl p-6 shadow-md text-left"
              style={{ border: '1px solid #E8C4A8' }}
            >
              <span
                className="inline-block text-white rust-cream-heading font-bold text-xs px-4 py-1.5 rounded-full mb-4"
                style={{ backgroundColor: '#D4A04A' }}
              >
                {bonus.valueLabel}
              </span>
              <h3
                className="rust-cream-heading font-bold text-xl mb-3"
                style={{ color: '#3D2B1F' }}
              >
                {bonus.title}
              </h3>
              <p className="mb-4" style={{ color: '#8B7355' }}>
                {bonus.description}
              </p>
              <ul className="space-y-2">
                {bonus.bullets.map((bullet, bIdx) => (
                  <li
                    key={`bonus-${idx}-b-${bIdx}`}
                    className="flex items-center gap-2"
                    style={{ color: '#3D2B1F' }}
                  >
                    <CheckIcon />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <a
          href="#optin"
          className="inline-block mt-10 text-white rust-cream-heading font-bold px-10 py-4 rounded-full transition-colors text-lg hover:opacity-90"
          style={{ backgroundColor: '#C2703E' }}
        >
          {b.ctaLabel}
        </a>
      </div>
    </section>
  );
}

/* ============== FOUNDERS ============== */
function Founders({ content }: { content: RustCreamContent }) {
  const f = content.founders;
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: '#FDF8F3' }}>
      <div className="max-w-5xl mx-auto px-6">
        <h2
          className="rust-cream-heading font-black text-3xl md:text-4xl text-center mb-12"
          style={{ color: '#3D2B1F' }}
        >
          {f.headline}
        </h2>
        <div className="grid md:grid-cols-2 gap-12">
          {f.items.map((founder, idx) => (
            <div key={`founder-${idx}`} className="flex flex-col items-center text-center">
              <div
                className="rust-cream-avatar rust-cream-avatar-lg mb-4"
                style={{ background: FOUNDER_GRADIENTS[idx % FOUNDER_GRADIENTS.length] }}
              >
                {founder.initials}
              </div>
              <h3
                className="rust-cream-heading font-bold text-xl"
                style={{ color: '#3D2B1F' }}
              >
                {founder.name}
              </h3>
              <p className="text-sm mb-4" style={{ color: '#8B7355' }}>
                {founder.role}
              </p>
              <p
                className="text-sm leading-relaxed max-w-sm"
                style={{ color: '#8B7355' }}
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
function Testimonials({ content }: { content: RustCreamContent }) {
  const t = content.testimonials;
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: '#F5EDE4' }}>
      <div className="max-w-6xl mx-auto px-6">
        <p
          className="rust-cream-heading font-bold text-sm uppercase tracking-wider mb-2 text-center"
          style={{ color: '#D4A04A' }}
        >
          {t.eyebrow}
        </p>
        <h2
          className="rust-cream-heading font-black text-3xl md:text-4xl text-center mb-12"
          style={{ color: '#3D2B1F' }}
        >
          {t.headline}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {t.items.map((item, idx) => (
            <div
              key={`testimonial-${idx}`}
              className="bg-white rounded-xl p-6 shadow-sm"
              style={{ border: '1px solid #E8C4A8' }}
            >
              <div className="text-sm mb-3" style={{ color: '#D4A04A' }} aria-hidden="true">
                ★★★★★
              </div>
              <p className="italic mb-4" style={{ color: '#8B7355' }}>
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="rust-cream-avatar-sm"
                  style={{
                    background:
                      TESTIMONIAL_AVATAR_GRADIENTS[idx % TESTIMONIAL_AVATAR_GRADIENTS.length],
                  }}
                >
                  {item.initials}
                </div>
                <div>
                  <p
                    className="rust-cream-heading font-bold text-sm"
                    style={{ color: '#3D2B1F' }}
                  >
                    {item.name}
                  </p>
                  <p className="text-xs" style={{ color: '#8B7355' }}>
                    {item.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============== PULL QUOTE ============== */
function PullQuote({ content }: { content: RustCreamContent }) {
  const pq = content.pullQuote;
  return (
    <section className="py-14 md:py-20" style={{ backgroundColor: '#3D2B1F' }}>
      <div className="max-w-3xl mx-auto px-6 text-center">
        <svg
          className="w-10 h-10 mx-auto mb-4 opacity-50"
          style={{ color: '#C2703E' }}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
        </svg>
        <p className="rust-cream-heading font-bold text-2xl md:text-3xl text-white leading-relaxed italic">
          &ldquo;{pq.quote}&rdquo;
        </p>
        <p className="font-medium text-sm mt-4" style={{ color: '#E8C4A8' }}>
          {pq.attribution}
        </p>
      </div>
    </section>
  );
}

/* ============== FIGURES ============== */
function Figures({ content }: { content: RustCreamContent }) {
  const f = content.figures;
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: '#FDF8F3' }}>
      <div className="max-w-5xl mx-auto px-6">
        <p
          className="rust-cream-heading font-bold text-sm uppercase tracking-wider mb-2 text-center"
          style={{ color: '#C2703E' }}
        >
          {f.eyebrow}
        </p>
        <h2
          className="rust-cream-heading font-black text-3xl md:text-4xl text-center mb-12"
          style={{ color: '#3D2B1F' }}
        >
          {f.headline}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {f.items.map((item, idx) => (
            <div
              key={`figure-${idx}`}
              className="rounded-xl p-6 text-center"
              style={{ backgroundColor: '#F5EDE4', border: '1px solid #E8C4A8' }}
            >
              <p
                className="rust-cream-heading font-black text-4xl mb-2"
                style={{ color: '#C2703E' }}
              >
                {item.value}
              </p>
              <p className="text-sm" style={{ color: '#8B7355' }}>
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
function Shifts({ content }: { content: RustCreamContent }) {
  const s = content.shifts;
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: '#F5EDE4' }}>
      <div className="max-w-3xl mx-auto px-6">
        <p
          className="rust-cream-heading font-bold text-sm uppercase tracking-wider mb-2"
          style={{ color: '#C2703E' }}
        >
          {s.eyebrow}
        </p>
        <h2
          className="rust-cream-heading font-black text-3xl md:text-4xl mb-12"
          style={{ color: '#3D2B1F' }}
        >
          {s.headline}
        </h2>
        <div className="space-y-8">
          {s.items.map((item, idx) => (
            <div key={`shift-${idx}`} className="flex gap-6">
              <span
                className="rust-cream-heading font-black text-5xl leading-none shrink-0"
                style={{ color: 'rgba(194,112,62,0.2)' }}
              >
                {String(idx + 1).padStart(2, '0')}
              </span>
              <div>
                <h3
                  className="rust-cream-heading font-bold text-xl mb-2"
                  style={{ color: '#3D2B1F' }}
                >
                  {item.title}
                </h3>
                <p style={{ color: '#8B7355' }}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============== CLOSING CTA ============== */
function Closing({ content }: { content: RustCreamContent }) {
  const c = content.closing;
  return (
    <section
      className="py-16 md:py-20 mx-4"
      style={{
        background:
          'linear-gradient(135deg, #6B3410 0%, #8B4513 50%, #3D2B1F 100%)',
        borderRadius: 24,
      }}
    >
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="rust-cream-heading font-black text-3xl md:text-5xl text-white mb-10">
          {c.headline}
        </h2>
        <div className="grid grid-cols-2 gap-3 mb-10 max-w-lg mx-auto">
          {c.pills.map((pill, idx) => (
            <span
              key={`closing-pill-${idx}`}
              className="rust-cream-heading font-bold text-sm px-4 py-3 rounded-full flex items-center gap-2 justify-center text-white"
              style={{ backgroundColor: '#D4A04A' }}
            >
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {pill}
            </span>
          ))}
        </div>
        <a
          href="#optin"
          className="rust-cream-pulse-gold inline-block rust-cream-heading font-black text-lg px-12 py-5 rounded-full transition-colors uppercase tracking-wider shadow-xl hover:scale-105"
          style={{ backgroundColor: '#D4A04A', color: '#3D2B1F' }}
        >
          {c.ctaLabel}
        </a>
      </div>
    </section>
  );
}

/* ============== FAQ ============== */
function FAQ({ content }: { content: RustCreamContent }) {
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: '#F5EDE4' }}>
      <div className="max-w-3xl mx-auto px-6">
        <p
          className="rust-cream-heading font-bold text-sm uppercase tracking-wider mb-2 text-center"
          style={{ color: '#C2703E' }}
        >
          {content.faqSection.eyebrow}
        </p>
        <h2
          className="rust-cream-heading font-black text-3xl md:text-4xl text-center mb-12"
          style={{ color: '#3D2B1F' }}
        >
          {content.faqSection.headline}
        </h2>
        <div className="space-y-3">
          {content.faqs.map((faq, idx) => (
            <details
              key={`faq-${idx}`}
              className="rounded-3xl overflow-hidden"
              style={{ backgroundColor: '#FDF8F3', border: '1px solid #E8C4A8' }}
              open={idx === 0}
            >
              <summary
                className="flex items-center justify-between px-7 py-4 rust-cream-heading font-bold"
                style={{ color: '#3D2B1F' }}
              >
                {faq.question}
                <span className="rust-cream-chevron text-xl" style={{ color: '#C2703E' }} aria-hidden="true">
                  ▼
                </span>
              </summary>
              <div className="px-7 pb-5 -mt-1" style={{ color: '#8B7355' }}>
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
function Footer({ content }: { content: RustCreamContent }) {
  const f = content.footer;
  return (
    <footer className="py-10" style={{ backgroundColor: '#2A1D15', color: '#8B7355' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#C2703E' }}
            >
              <span className="rust-cream-heading font-black text-white text-lg">
                {f.brandInitial}
              </span>
            </div>
            <div>
              <p className="rust-cream-heading font-bold text-white text-sm">
                {f.brandName}
              </p>
              <p className="text-xs" style={{ color: '#8B7355' }}>
                {f.tagline}
              </p>
            </div>
          </div>
          <div className="flex gap-6 text-sm">
            {f.links.map((link, idx) => (
              <a
                key={`footer-link-${idx}`}
                href={link.href}
                className="hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <p className="text-xs" style={{ color: '#6B3410' }}>
            {f.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}

/* =======================================================================
 * ============  SALES-PAGE SECTIONS (rust-cream family)  ================
 * -----------------------------------------------------------------------
 * All sales sections are optional in the schema; each component guards
 * with `if (!content.xxx) return null;` so optin pages (which omit these
 * fields) render cleanly. Visual styling stays within rust-cream's warm
 * editorial palette — rust/terracotta accents, cream backgrounds, gold
 * highlights — matching the rest of the template family.
 * ======================================================================= */

const SALES_TOKENS = {
  CREAM50: '#FDF8F3',
  CREAM100: '#F5EDE4',
  CREAM200: '#E8C4A8',
  CREAM300: '#D9AC88',
  RUST400: '#C2703E',
  RUST500: '#A85C2F',
  RUST600: '#8B4513',
  RUST700: '#6B3410',
  INK900: '#2A1D15',
  INK800: '#3D2B1F',
  INK700: '#5C422F',
  MUTE: '#8B7355',
  GOLD400: '#D4A04A',
  GOLD500: '#B8872E',
  GOLD50: '#FBF3DF',
  GOLD100: '#F5E4B8',
  SAGE: '#5B8C5A',
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
  const color = SALES_TOKENS.RUST600;
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={SALES_TOKENS.SAGE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 3 }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function SalesXIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={SALES_TOKENS.RUST500} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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

function SalesGiftIcon({ size = 20, color = SALES_TOKENS.RUST600 }: { size?: number; color?: string }) {
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

/* Primary sales CTA button — warm rust pill. */
const salesBtnCta: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '1rem 2rem',
  background: SALES_TOKENS.RUST600,
  color: '#fff',
  fontFamily: 'Poppins, sans-serif',
  fontWeight: 700,
  fontSize: '1.05rem',
  borderRadius: '9999px',
  boxShadow: '0 10px 24px -8px rgba(139,69,19,.45), inset 0 -3px 0 rgba(0,0,0,.1)',
  letterSpacing: '.02em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  border: 'none',
  cursor: 'pointer',
};

const salesBtnCtaLg: CSSProperties = { ...salesBtnCta, padding: '1.15rem 2.4rem', fontSize: '1.15rem' };

/* SALES HERO — warm rust live badge, gradient product mockup, pulsing CTA. */
function SalesHero({ content }: { content: RustCreamContent }) {
  if (!content.salesHero) return null;
  const h = content.salesHero;
  const topName = content.topBar.name;
  return (
    <section style={{ padding: '2.5rem 1.25rem 4rem', background: `linear-gradient(180deg,${SALES_TOKENS.CREAM100} 0%,${SALES_TOKENS.CREAM50} 60%)` }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.18em', color: '#fff', background: SALES_TOKENS.RUST500, borderRadius: 9999, padding: '0.5rem 1rem', marginBottom: '1.5rem', textTransform: 'uppercase', boxShadow: `0 4px 14px ${SALES_TOKENS.RUST500}55` }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
          {h.badge}
        </span>

        <h1 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', lineHeight: 1.2, letterSpacing: '-0.01em', color: SALES_TOKENS.INK900, marginBottom: '1rem' }}>
          {h.headline.split('40+').map((part, i, arr) =>
            i < arr.length - 1
              ? <span key={i}>{part}<span style={{ background: SALES_TOKENS.GOLD100, padding: '0 0.3rem', borderRadius: 6 }}>40+</span></span>
              : <span key={i}>{part}</span>
          )}
        </h1>

        <p style={{ fontFamily: '"Playfair Display",Georgia,serif', fontStyle: 'italic', fontSize: 'clamp(1.1rem,2vw,1.4rem)', color: SALES_TOKENS.RUST400, maxWidth: 680, margin: '0 auto 2rem' }}>
          {h.subheadline}
        </p>

        {/* Product mockup */}
        <div style={{ maxWidth: 560, margin: '0 auto 2rem', borderRadius: 16, overflow: 'hidden', boxShadow: `0 24px 48px ${SALES_TOKENS.RUST700}45`, aspectRatio: '16/9', background: `linear-gradient(135deg,${SALES_TOKENS.RUST700},${SALES_TOKENS.RUST400})`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.35, background: `radial-gradient(circle at 20% 50%,${SALES_TOKENS.CREAM200},transparent 50%),radial-gradient(circle at 80% 50%,${SALES_TOKENS.GOLD400},transparent 40%)` }} />
          <div style={{ position: 'relative', textAlign: 'center', color: '#fff', padding: '1.5rem' }}>
            <p style={{ fontSize: '0.6rem', letterSpacing: '0.4em', textTransform: 'uppercase', opacity: 0.75, marginBottom: '0.5rem' }}>Full Access</p>
            <p style={{ fontFamily: '"Playfair Display",Georgia,serif', fontSize: 'clamp(2rem,5vw,4rem)', fontStyle: 'italic', margin: 0 }}>{h.productLabel}</p>
            <p style={{ fontSize: '0.7rem', opacity: 0.85, marginTop: '0.5rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>{topName}</p>
          </div>
        </div>

        <p style={{ fontSize: '0.88rem', color: SALES_TOKENS.INK700, marginBottom: '0.5rem' }}>
          Total value: <span style={{ fontWeight: 700, color: SALES_TOKENS.RUST500, textDecoration: 'line-through' }}>{h.totalValue}</span>
        </p>
        <a href="#purchase" id="purchase" className="rust-cream-sales-pulse" style={salesBtnCtaLg}>
          {h.ctaLabel} <SalesArrowRight size={20} />
        </a>
        <p style={{ marginTop: '1rem', fontSize: '0.88rem', color: SALES_TOKENS.RUST500 }}>
          <strong>{h.ctaNote}</strong>
        </p>
      </div>
    </section>
  );
}

/* INTRO — centered serif eyebrow + body paragraphs on cream. */
function Intro({ content }: { content: RustCreamContent }) {
  if (!content.intro) return null;
  const i = content.intro;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: SALES_TOKENS.CREAM50 }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontFamily: '"Playfair Display",Georgia,serif', fontStyle: 'italic', color: SALES_TOKENS.RUST400, fontWeight: 500, fontSize: '1.35rem', marginBottom: '0.5rem' }}>{i.eyebrow}</p>
        <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: SALES_TOKENS.INK900, lineHeight: 1.15, marginBottom: '1.5rem' }}>{i.headline}</h2>
        {i.paragraphs.map((p, idx) => (
          <p key={idx} style={{ color: SALES_TOKENS.INK800, fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '1rem' }}>{p}</p>
        ))}
      </div>
    </section>
  );
}

/* VIP BONUSES — warm tan card grid with icon tiles. */
function VipBonuses({ content }: { content: RustCreamContent }) {
  if (!content.vipBonuses) return null;
  const v = content.vipBonuses;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: SALES_TOKENS.CREAM100 }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ fontFamily: '"Playfair Display",Georgia,serif', fontStyle: 'italic', color: SALES_TOKENS.RUST400, fontWeight: 500, fontSize: '1.35rem', marginBottom: '0.25rem' }}>{v.eyebrow}</p>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: SALES_TOKENS.INK900, lineHeight: 1.15 }}>{v.headline}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem' }}>
          {v.items.map((item, i) => (
            <div key={i} style={{ background: '#fff', border: `1px solid ${SALES_TOKENS.CREAM200}`, borderRadius: 20, boxShadow: `0 10px 24px -14px ${SALES_TOKENS.RUST700}55`, overflow: 'hidden', position: 'relative' }}>
              <div style={{ background: `linear-gradient(135deg,${SALES_TOKENS.CREAM50},${SALES_TOKENS.CREAM200})`, aspectRatio: '16/10', display: 'grid', placeItems: 'center', color: SALES_TOKENS.RUST600, fontFamily: '"Playfair Display",Georgia,serif', fontStyle: 'italic', fontSize: '1.2rem', textAlign: 'center', padding: '1.25rem', flexDirection: 'column' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <SalesBonusIcon icon={item.icon} />
                  <span>{salesIconLabels[item.icon]}</span>
                </div>
              </div>
              <div style={{ padding: '1.5rem 1.5rem 1rem' }}>
                <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '1.05rem', color: SALES_TOKENS.INK900, marginBottom: '0.4rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.88rem', color: SALES_TOKENS.INK700, lineHeight: 1.6, marginBottom: '0.75rem' }}>{item.description}</p>
                <span style={{ display: 'inline-block', background: '#fff', border: `1px solid ${SALES_TOKENS.CREAM300}`, color: SALES_TOKENS.RUST500, fontWeight: 700, fontSize: '.7rem', letterSpacing: '.1em', padding: '.3rem .7rem', borderRadius: 9999 }}>{item.valueLabel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* FREE GIFTS — gold/cream card grid with gift icon tiles. */
function FreeGifts({ content }: { content: RustCreamContent }) {
  if (!content.freeGifts) return null;
  const fg = content.freeGifts;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: SALES_TOKENS.CREAM50 }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ fontFamily: '"Playfair Display",Georgia,serif', fontStyle: 'italic', color: SALES_TOKENS.RUST400, fontWeight: 500, fontSize: '1.35rem', marginBottom: '0.25rem' }}>{fg.eyebrow}</p>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: SALES_TOKENS.INK900, lineHeight: 1.15 }}>{fg.headline}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1.25rem' }}>
          {fg.items.map((gift, i) => (
            <div key={i} style={{ background: SALES_TOKENS.GOLD50, border: `1px solid ${SALES_TOKENS.GOLD100}`, borderRadius: 20, boxShadow: `0 10px 24px -14px ${SALES_TOKENS.GOLD500}55`, overflow: 'hidden' }}>
              <div style={{ background: `linear-gradient(135deg,${SALES_TOKENS.GOLD50},${SALES_TOKENS.GOLD400})`, aspectRatio: '16/10', display: 'grid', placeItems: 'center', color: SALES_TOKENS.RUST700, fontFamily: '"Playfair Display",Georgia,serif', fontStyle: 'italic', fontSize: '1.2rem', textAlign: 'center', padding: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <SalesGiftIcon size={40} color={SALES_TOKENS.RUST700} />
                  <span>Free Gift #{gift.giftNumber}</span>
                </div>
              </div>
              <div style={{ padding: '1.5rem 1.5rem 1rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '.15em', color: SALES_TOKENS.RUST500, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Free Gift #{gift.giftNumber}</p>
                <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '1.05rem', color: SALES_TOKENS.INK900, marginBottom: '0.4rem' }}>{gift.title}</h3>
                <p style={{ fontSize: '0.88rem', color: SALES_TOKENS.INK700, lineHeight: 1.6, marginBottom: '0.75rem' }}>{gift.description}</p>
                <span style={{ display: 'inline-block', background: '#fff', border: `1px solid ${SALES_TOKENS.GOLD100}`, color: SALES_TOKENS.RUST600, fontWeight: 700, fontSize: '.7rem', letterSpacing: '.1em', padding: '.3rem .7rem', borderRadius: 9999 }}>{gift.valueLabel}</span>
              </div>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: SALES_TOKENS.INK700 }}>{fg.deliveryNote}</p>
      </div>
    </section>
  );
}

/* UPGRADE SECTION — centered eyebrow/headline + paragraphs preamble. */
function UpgradeSection({ content }: { content: RustCreamContent }) {
  if (!content.upgradeSection) return null;
  const u = content.upgradeSection;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: SALES_TOKENS.CREAM100 }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: '"Playfair Display",Georgia,serif', fontStyle: 'italic', color: SALES_TOKENS.RUST400, fontWeight: 500, fontSize: '1.35rem', marginBottom: '0.25rem' }}>{u.eyebrow}</p>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: SALES_TOKENS.INK900, lineHeight: 1.15, marginBottom: '1.5rem' }}>{u.headline}</h2>
          {u.paragraphs.map((p, i) => (
            <p key={i} style={{ color: SALES_TOKENS.INK800, fontSize: '1rem', lineHeight: 1.7, marginBottom: '0.75rem', maxWidth: 680, margin: '0 auto 0.75rem' }}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

/* PRICE CARD — cream card with rust border, bullet features, gift box,
 * strikethrough value, large sage price, pulse CTA. */
function PriceCard({ content }: { content: RustCreamContent }) {
  if (!content.priceCard) return null;
  const p = content.priceCard;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: SALES_TOKENS.CREAM50 }} id="purchase">
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{
          background: '#fff',
          border: `2px solid ${SALES_TOKENS.RUST400}`,
          borderRadius: 24,
          boxShadow: `0 24px 44px -24px ${SALES_TOKENS.RUST700}55`,
          padding: '1.75rem 1.5rem',
          position: 'relative',
          overflow: 'hidden',
          maxWidth: 480,
          width: '100%',
          margin: '0 auto',
        }}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 6, background: `linear-gradient(90deg,${SALES_TOKENS.RUST600},${SALES_TOKENS.GOLD400},${SALES_TOKENS.RUST600})` }} />

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: SALES_TOKENS.RUST500, color: '#fff', padding: '.35rem .85rem', borderRadius: 9999, fontWeight: 700, fontSize: '.72rem', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            {p.badge}
          </div>

          <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '1.2rem', color: SALES_TOKENS.INK900, marginBottom: '0.5rem', lineHeight: 1.3 }}>{p.headline}</h3>
          <p style={{ fontSize: '0.88rem', color: SALES_TOKENS.INK700, marginBottom: '0.5rem' }}>{p.note}</p>

          <ul style={{ padding: 0, listStyle: 'none', margin: '1rem 0 1.25rem' }}>
            {p.features.map((f, i) => (
              <li key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', padding: '0.35rem 0', fontSize: '0.95rem', color: SALES_TOKENS.INK800, lineHeight: 1.45 }}>
                <SalesCheckIcon />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <div style={{ background: SALES_TOKENS.GOLD50, border: `1px solid ${SALES_TOKENS.GOLD100}`, borderRadius: 12, padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
            <p style={{ fontWeight: 700, fontSize: '0.85rem', color: SALES_TOKENS.RUST600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <SalesGiftIcon size={16} /> {p.giftsBoxTitle}
            </p>
            {p.giftItems.map((g, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.9rem', padding: '0.3rem 0', color: SALES_TOKENS.INK700 }}>
                <SalesCheckIcon />
                <span>{g}</span>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', borderTop: `1px solid ${SALES_TOKENS.CREAM200}`, paddingTop: '1.25rem' }}>
            <p style={{ color: SALES_TOKENS.RUST500, textDecoration: 'line-through', fontWeight: 500, fontSize: '0.95rem', marginBottom: '0.25rem' }}>
              Total value: {p.totalValue} — Regular price: {p.regularPrice}
            </p>
            <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '2.6rem', fontWeight: 800, color: SALES_TOKENS.SAGE, letterSpacing: '-0.02em', lineHeight: 1 }}>{p.currentPrice}</p>
            <p style={{ fontSize: '0.85rem', color: SALES_TOKENS.SAGE, fontWeight: 600, marginBottom: '1rem' }}>{p.savings}</p>
            <a href="#purchase" style={salesBtnCtaLg}>
              {p.ctaLabel} <SalesArrowRight size={20} />
            </a>
            <p style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: SALES_TOKENS.RUST500 }}>{p.guarantee}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* SALES SPEAKERS — <details> cards with photo/initials avatar + bio toggle. */
function SalesSpeakers({ content, speakers }: { content: RustCreamContent; speakers: Record<string, Speaker> }) {
  if (!content.salesSpeakers) return null;
  const s = content.salesSpeakers;
  const sortedSpeakers = Object.values(speakers).sort((a, b) => a.sortOrder - b.sortOrder);
  if (sortedSpeakers.length === 0) return null;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: SALES_TOKENS.CREAM50 }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ fontFamily: '"Playfair Display",Georgia,serif', fontStyle: 'italic', color: SALES_TOKENS.RUST400, fontWeight: 500, fontSize: '1.35rem', marginBottom: '0.25rem' }}>{s.eyebrow}</p>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: SALES_TOKENS.INK900, lineHeight: 1.15 }}>{s.headline}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1rem' }}>
          {sortedSpeakers.map((spk) => (
            <details key={spk.id} className="rust-cream-sales-spk" style={{ background: '#fff', border: `1px solid ${SALES_TOKENS.CREAM200}`, borderRadius: 16, boxShadow: `0 6px 18px -10px ${SALES_TOKENS.RUST700}40`, marginBottom: 0, overflow: 'hidden' }}>
              <summary style={{ cursor: 'pointer', listStyle: 'none', padding: '1.5rem 1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem' }}>
                {spk.photoUrl
                  ? /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={spk.photoUrl} alt={`${spk.firstName} ${spk.lastName}`} style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${SALES_TOKENS.CREAM300}`, boxShadow: `0 0 0 4px #fff, 0 6px 14px -4px ${SALES_TOKENS.RUST700}55` }} />
                  : <div style={{ width: 84, height: 84, borderRadius: '50%', background: `linear-gradient(135deg,${SALES_TOKENS.CREAM200},${SALES_TOKENS.RUST400})`, border: `3px solid ${SALES_TOKENS.CREAM300}`, display: 'grid', placeItems: 'center', color: '#fff', fontFamily: '"Playfair Display",Georgia,serif', fontSize: '1.8rem', fontStyle: 'italic' }}>
                      {spk.firstName[0]}{spk.lastName[0]}
                    </div>
                }
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '0.95rem', color: SALES_TOKENS.INK900, margin: 0 }}>{spk.firstName} {spk.lastName}</p>
                  <p style={{ fontSize: '0.78rem', color: SALES_TOKENS.RUST500, margin: 0 }}>{spk.title}</p>
                  <p style={{ fontSize: '0.78rem', color: SALES_TOKENS.INK700, margin: 0, fontStyle: 'italic' }}>{spk.masterclassTitle}</p>
                </div>
              </summary>
              {spk.shortBio && (
                <p style={{ padding: '0 1.5rem 1.5rem', color: SALES_TOKENS.INK700, fontSize: '0.88rem', lineHeight: 1.6, margin: 0, textAlign: 'center' }}>{spk.shortBio}</p>
              )}
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* COMPARISON TABLE — Free Pass vs VIP Pass side-by-side. */
function ComparisonTable({ content }: { content: RustCreamContent }) {
  if (!content.comparisonTable) return null;
  const c = content.comparisonTable;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: SALES_TOKENS.CREAM100 }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ fontFamily: '"Playfair Display",Georgia,serif', fontStyle: 'italic', color: SALES_TOKENS.RUST400, fontWeight: 500, fontSize: '1.35rem', marginBottom: '0.25rem' }}>{c.eyebrow}</p>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: SALES_TOKENS.INK900, lineHeight: 1.15 }}>{c.headline}</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, borderRadius: 16, overflow: 'hidden', border: `1px solid ${SALES_TOKENS.CREAM200}`, background: '#fff' }}>
            <thead>
              <tr>
                <th style={{ background: SALES_TOKENS.CREAM50, color: SALES_TOKENS.RUST500, fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.8rem', letterSpacing: '.15em', textTransform: 'uppercase', padding: '1rem', textAlign: 'left' }}>Feature</th>
                <th style={{ background: SALES_TOKENS.CREAM200, color: SALES_TOKENS.RUST600, fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.8rem', letterSpacing: '.15em', textTransform: 'uppercase', padding: '1rem', textAlign: 'center' }}>Free Pass</th>
                <th style={{ background: SALES_TOKENS.CREAM200, color: SALES_TOKENS.RUST600, fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.8rem', letterSpacing: '.15em', textTransform: 'uppercase', padding: '1rem', textAlign: 'center' }}>VIP Pass</th>
              </tr>
            </thead>
            <tbody>
              {c.rows.map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '1rem', borderTop: `1px solid ${SALES_TOKENS.CREAM200}`, fontWeight: 600, color: SALES_TOKENS.INK900, fontSize: '0.95rem', lineHeight: 1.4 }}>{row.label}</td>
                  <td style={{ padding: '1rem', borderTop: `1px solid ${SALES_TOKENS.CREAM200}`, textAlign: 'center' }}>
                    {row.freePass
                      ? <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: '#E6F3E3', color: SALES_TOKENS.SAGE }}><SalesCheckIcon /></span>
                      : <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: '#FDECE2', color: SALES_TOKENS.RUST500 }}><SalesXIcon /></span>
                    }
                  </td>
                  <td style={{ padding: '1rem', borderTop: `1px solid ${SALES_TOKENS.CREAM200}`, textAlign: 'center' }}>
                    {row.vipPass
                      ? <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: '#E6F3E3', color: SALES_TOKENS.SAGE }}><SalesCheckIcon /></span>
                      : <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: '#FDECE2', color: SALES_TOKENS.RUST500 }}><SalesXIcon /></span>
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

/* GUARANTEE — dashed-gold shield card with heading + body. */
function Guarantee({ content }: { content: RustCreamContent }) {
  if (!content.guarantee) return null;
  const g = content.guarantee;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: SALES_TOKENS.CREAM100 }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ background: SALES_TOKENS.GOLD50, border: `2px dashed ${SALES_TOKENS.GOLD400}`, borderRadius: 20, padding: '1.75rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <div style={{ fontSize: '3rem', flexShrink: 0 }} aria-hidden="true">🛡️</div>
          <div>
            <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '1.1rem', color: SALES_TOKENS.INK900, marginBottom: '0.5rem' }}>{g.heading}</h3>
            <p style={{ fontSize: '0.95rem', color: SALES_TOKENS.INK700, lineHeight: 1.65, margin: 0 }}>{g.body}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* WHY SECTION — centered serif-subtitled body text. */
function WhySection({ content }: { content: RustCreamContent }) {
  if (!content.whySection) return null;
  const w = content.whySection;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: SALES_TOKENS.CREAM50 }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: SALES_TOKENS.INK900, lineHeight: 1.15, marginBottom: '0.5rem' }}>{w.headline}</h2>
        <p style={{ fontFamily: '"Playfair Display",Georgia,serif', fontStyle: 'italic', fontSize: '1.35rem', color: SALES_TOKENS.RUST400, marginBottom: '1.5rem' }}>{w.subheadline}</p>
        {w.paragraphs.map((p, i) => (
          <p key={i} style={{ color: SALES_TOKENS.INK800, fontSize: '1rem', lineHeight: 1.75, marginBottom: '1rem' }}>{p}</p>
        ))}
      </div>
    </section>
  );
}

/* ============== ROOT COMPONENT ============== */
export function RustCream({ content, speakers, funnelId, enabledSections }: RootProps) {
  const enabled = new Set(enabledSections ?? rustCreamDefaultEnabledSections);
  return (
    <div className="rust-cream-root rust-cream-body antialiased">
      <a href="#main-content" className="rust-cream-skip-nav">
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
        {enabled.has('closing-cta') && <Closing content={content} />}
        {enabled.has('faq') && <FAQ content={content} />}

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
        <OptinModal funnelId={funnelId} ctaLabel={content.hero.ctaLabel} />
      )}
    </div>
  );
}
