// Document chrome (html/head/body) is owned by the Next.js page/layout that
// renders this template. Fonts (Poppins / Source Sans 3 / Playfair Display)
// must be loaded by the page — see Task 19/20 (preview/public routes) for wiring.
import { OptinModal } from '@/components/OptinModal';
import type { Variant1Content } from './variant-1.schema';
import type { Speaker } from './types';

type Props = {
  content: Variant1Content;
  speakers: Record<string, Speaker>;
};

type RootProps = Props & {
  funnelId: string;
};

/* Visual gradients for speaker avatars — deterministic, cycled by index.
 * Drawn from the variant-1 HTML palette (warm brown/tan/sage/gold). */
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
function TopBar({ content }: { content: Variant1Content }) {
  return (
    <div className="sticky top-0 z-50 py-4 px-4 shadow-lg" style={{ backgroundColor: '#3D2B1F' }}>
      <div className="max-w-6xl mx-auto flex items-center justify-center">
        <span className="variant-1-heading font-bold text-lg md:text-xl tracking-tight text-white">
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
        <p className="variant-1-heading font-bold text-sm mb-3" style={{ color: '#C2703E' }}>
          {h.eyebrow}
        </p>
        <h1
          className="variant-1-heading font-black text-3xl md:text-4xl lg:text-[2.75rem] leading-[1.15] mb-5"
          style={{ color: '#3D2B1F' }}
        >
          {h.headline}
        </h1>
        <p className="text-lg mb-6 leading-relaxed" style={{ color: '#8B7355' }}>
          <strong style={{ color: '#3D2B1F' }}>{h.subheadlineLead}</strong> {h.subheadline}
        </p>
        <a
          href="#optin"
          className="variant-1-pulse-glow inline-block text-white variant-1-heading font-bold text-base px-10 py-4 rounded-full transition-all uppercase tracking-wide mb-4 hover:scale-105"
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
                className="variant-1-avatar-sm"
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
                className="w-16 h-16 rounded-full flex items-center justify-center text-white variant-1-heading font-bold text-sm"
                style={{
                  background: SPEAKER_GRADIENTS[idx % SPEAKER_GRADIENTS.length],
                  border: '3px solid #E8C4A8',
                }}
              >
                {initialsFromSpeaker(s)}
              </div>
              <p
                className="variant-1-heading font-bold text-xs mt-1.5"
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
function Press({ content }: { content: Variant1Content }) {
  const outlets = content.press.outlets;
  return (
    <section className="py-10" style={{ backgroundColor: '#FDF8F3' }}>
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p
          className="text-xs variant-1-heading font-bold tracking-[0.2em] uppercase mb-6"
          style={{ color: '#8B7355' }}
        >
          {content.press.eyebrow}
        </p>
        <div className="variant-1-marquee-wrap">
          <div className="variant-1-marquee-track">
            <div className="variant-1-marquee-set">
              {outlets.map((name, idx) => (
                <span className="variant-1-logo-item" key={`press-a-${idx}`}>
                  {name}
                </span>
              ))}
            </div>
            <div className="variant-1-marquee-set" aria-hidden="true">
              {outlets.map((name, idx) => (
                <span className="variant-1-logo-item" key={`press-b-${idx}`}>
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
function Trust({ content }: { content: Variant1Content }) {
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
function Stats({ content }: { content: Variant1Content }) {
  return (
    <section className="py-14" style={{ backgroundColor: '#FDF8F3' }}>
      <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {content.stats.items.map((item, idx) => (
          <div
            key={`stat-${idx}`}
            className="rounded-2xl shadow-lg p-8 text-center"
            style={{ background: STAT_CARD_GRADIENTS[idx % STAT_CARD_GRADIENTS.length] }}
          >
            <p className="variant-1-heading font-black text-4xl md:text-5xl text-white">
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
function Overview({ content }: { content: Variant1Content }) {
  const o = content.overview;
  return (
    <section id="what-is-this" className="py-16 md:py-24" style={{ backgroundColor: '#F5EDE4' }}>
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p
            className="variant-1-heading font-bold text-sm uppercase tracking-wider mb-2"
            style={{ color: '#C2703E' }}
          >
            {o.eyebrow}
          </p>
          <h2
            className="variant-1-heading font-black text-3xl md:text-4xl mb-6"
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
            className="inline-block text-white variant-1-heading font-bold px-8 py-4 rounded-full transition-colors text-base hover:opacity-90 mt-4"
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
              className="variant-1-heading font-bold text-xl mb-1"
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
            className="inline-block text-white variant-1-heading font-bold text-sm px-5 py-2 rounded-full mb-4"
            style={{ backgroundColor: '#C2703E' }}
          >
            {content.speakersDay.dayLabel}
          </span>
          <h2
            className="variant-1-heading font-black text-3xl md:text-4xl"
            style={{ color: '#3D2B1F' }}
          >
            {content.speakersDay.headline}
          </h2>
        </div>
        <div className="variant-1-speaker-scroll">
          {daySpeakers.map((s, idx) => (
            <div key={s.id} className="variant-1-speaker-card flex flex-col items-center">
              <div
                className="variant-1-avatar mb-3"
                style={{ background: SPEAKER_GRADIENTS[idx % SPEAKER_GRADIENTS.length] }}
              >
                {initialsFromSpeaker(s)}
              </div>
              <p className="variant-1-heading font-bold" style={{ color: '#3D2B1F' }}>
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
function Outcomes({ content }: { content: Variant1Content }) {
  const o = content.outcomes;
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: '#F5EDE4' }}>
      <div className="max-w-5xl mx-auto px-6">
        <p
          className="variant-1-heading font-bold text-sm uppercase tracking-wider mb-2 text-center"
          style={{ color: '#C2703E' }}
        >
          {o.eyebrow}
        </p>
        <h2
          className="variant-1-heading font-black text-3xl md:text-4xl mb-12 text-center"
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
                  <span className="variant-1-heading font-black text-lg text-white">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>
                <p className="variant-1-heading font-bold" style={{ color: '#3D2B1F' }}>
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
function FreeGift({ content }: { content: Variant1Content }) {
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
                className="variant-1-heading font-bold text-sm text-center leading-tight"
                style={{ color: '#3D2B1F' }}
              >
                {g.mockupTitle}
              </p>
              <p className="text-xs mt-2" style={{ color: '#8B7355' }}>
                {g.mockupSubtitle}
              </p>
            </div>
            <div
              className="absolute -top-3 -right-3 text-white variant-1-heading font-black text-xs px-3 py-1.5 rounded-full shadow-lg transform rotate-12"
              style={{ backgroundColor: '#D4A04A' }}
            >
              {g.badgeLabel}
            </div>
          </div>
        </div>
        <div>
          <p
            className="variant-1-heading font-bold text-sm uppercase tracking-wider mb-2"
            style={{ color: '#D4A04A' }}
          >
            {g.eyebrow}
          </p>
          <h2
            className="variant-1-heading font-black text-2xl md:text-3xl mb-4"
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
            className="variant-1-pulse-glow inline-block text-white variant-1-heading font-bold text-sm px-7 py-3.5 rounded-full transition-all uppercase tracking-wide hover:scale-105"
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
function Bonuses({ content }: { content: Variant1Content }) {
  const b = content.bonuses;
  return (
    <section
      className="py-16 md:py-24"
      style={{ background: 'linear-gradient(135deg, #F5EDE4 0%, #E8C4A8 100%)' }}
    >
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p
          className="variant-1-heading font-bold text-sm uppercase tracking-wider mb-2"
          style={{ color: '#D4A04A' }}
        >
          {b.eyebrow}
        </p>
        <h2
          className="variant-1-heading font-black text-3xl md:text-4xl mb-12"
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
                className="inline-block text-white variant-1-heading font-bold text-xs px-4 py-1.5 rounded-full mb-4"
                style={{ backgroundColor: '#D4A04A' }}
              >
                {bonus.valueLabel}
              </span>
              <h3
                className="variant-1-heading font-bold text-xl mb-3"
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
          className="inline-block mt-10 text-white variant-1-heading font-bold px-10 py-4 rounded-full transition-colors text-lg hover:opacity-90"
          style={{ backgroundColor: '#C2703E' }}
        >
          {b.ctaLabel}
        </a>
      </div>
    </section>
  );
}

/* ============== FOUNDERS ============== */
function Founders({ content }: { content: Variant1Content }) {
  const f = content.founders;
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: '#FDF8F3' }}>
      <div className="max-w-5xl mx-auto px-6">
        <h2
          className="variant-1-heading font-black text-3xl md:text-4xl text-center mb-12"
          style={{ color: '#3D2B1F' }}
        >
          {f.headline}
        </h2>
        <div className="grid md:grid-cols-2 gap-12">
          {f.items.map((founder, idx) => (
            <div key={`founder-${idx}`} className="flex flex-col items-center text-center">
              <div
                className="variant-1-avatar variant-1-avatar-lg mb-4"
                style={{ background: FOUNDER_GRADIENTS[idx % FOUNDER_GRADIENTS.length] }}
              >
                {founder.initials}
              </div>
              <h3
                className="variant-1-heading font-bold text-xl"
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
function Testimonials({ content }: { content: Variant1Content }) {
  const t = content.testimonials;
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: '#F5EDE4' }}>
      <div className="max-w-6xl mx-auto px-6">
        <p
          className="variant-1-heading font-bold text-sm uppercase tracking-wider mb-2 text-center"
          style={{ color: '#D4A04A' }}
        >
          {t.eyebrow}
        </p>
        <h2
          className="variant-1-heading font-black text-3xl md:text-4xl text-center mb-12"
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
                  className="variant-1-avatar-sm"
                  style={{
                    background:
                      TESTIMONIAL_AVATAR_GRADIENTS[idx % TESTIMONIAL_AVATAR_GRADIENTS.length],
                  }}
                >
                  {item.initials}
                </div>
                <div>
                  <p
                    className="variant-1-heading font-bold text-sm"
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
function PullQuote({ content }: { content: Variant1Content }) {
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
        <p className="variant-1-heading font-bold text-2xl md:text-3xl text-white leading-relaxed italic">
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
function Figures({ content }: { content: Variant1Content }) {
  const f = content.figures;
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: '#FDF8F3' }}>
      <div className="max-w-5xl mx-auto px-6">
        <p
          className="variant-1-heading font-bold text-sm uppercase tracking-wider mb-2 text-center"
          style={{ color: '#C2703E' }}
        >
          {f.eyebrow}
        </p>
        <h2
          className="variant-1-heading font-black text-3xl md:text-4xl text-center mb-12"
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
                className="variant-1-heading font-black text-4xl mb-2"
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
function Shifts({ content }: { content: Variant1Content }) {
  const s = content.shifts;
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: '#F5EDE4' }}>
      <div className="max-w-3xl mx-auto px-6">
        <p
          className="variant-1-heading font-bold text-sm uppercase tracking-wider mb-2"
          style={{ color: '#C2703E' }}
        >
          {s.eyebrow}
        </p>
        <h2
          className="variant-1-heading font-black text-3xl md:text-4xl mb-12"
          style={{ color: '#3D2B1F' }}
        >
          {s.headline}
        </h2>
        <div className="space-y-8">
          {s.items.map((item, idx) => (
            <div key={`shift-${idx}`} className="flex gap-6">
              <span
                className="variant-1-heading font-black text-5xl leading-none shrink-0"
                style={{ color: 'rgba(194,112,62,0.2)' }}
              >
                {String(idx + 1).padStart(2, '0')}
              </span>
              <div>
                <h3
                  className="variant-1-heading font-bold text-xl mb-2"
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
function Closing({ content }: { content: Variant1Content }) {
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
        <h2 className="variant-1-heading font-black text-3xl md:text-5xl text-white mb-10">
          {c.headline}
        </h2>
        <div className="grid grid-cols-2 gap-3 mb-10 max-w-lg mx-auto">
          {c.pills.map((pill, idx) => (
            <span
              key={`closing-pill-${idx}`}
              className="variant-1-heading font-bold text-sm px-4 py-3 rounded-full flex items-center gap-2 justify-center text-white"
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
          className="variant-1-pulse-gold inline-block variant-1-heading font-black text-lg px-12 py-5 rounded-full transition-colors uppercase tracking-wider shadow-xl hover:scale-105"
          style={{ backgroundColor: '#D4A04A', color: '#3D2B1F' }}
        >
          {c.ctaLabel}
        </a>
      </div>
    </section>
  );
}

/* ============== FAQ ============== */
function FAQ({ content }: { content: Variant1Content }) {
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: '#F5EDE4' }}>
      <div className="max-w-3xl mx-auto px-6">
        <p
          className="variant-1-heading font-bold text-sm uppercase tracking-wider mb-2 text-center"
          style={{ color: '#C2703E' }}
        >
          {content.faqSection.eyebrow}
        </p>
        <h2
          className="variant-1-heading font-black text-3xl md:text-4xl text-center mb-12"
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
                className="flex items-center justify-between px-7 py-4 variant-1-heading font-bold"
                style={{ color: '#3D2B1F' }}
              >
                {faq.question}
                <span className="variant-1-chevron text-xl" style={{ color: '#C2703E' }} aria-hidden="true">
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
function Footer({ content }: { content: Variant1Content }) {
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
              <span className="variant-1-heading font-black text-white text-lg">
                {f.brandInitial}
              </span>
            </div>
            <div>
              <p className="variant-1-heading font-bold text-white text-sm">
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

/* ============== ROOT COMPONENT ============== */
export function Variant1({ content, speakers, funnelId }: RootProps) {
  return (
    <div className="variant-1-root variant-1-body antialiased">
      <a href="#main-content" className="variant-1-skip-nav">
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
        <Closing content={content} />
        <FAQ content={content} />
      </main>

      <Footer content={content} />

      <OptinModal funnelId={funnelId} ctaLabel={content.hero.ctaLabel} />
    </div>
  );
}
