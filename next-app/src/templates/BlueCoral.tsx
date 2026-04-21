// Document chrome (html/head/body) is owned by the Next.js page/layout that
// renders this template. Fonts (Poppins / Source Sans 3) must be loaded by
// the page — see Task 19/20 (preview/public routes) for wiring.
import './blue-coral.styles.css';
import { OptinModal } from '@/components/OptinModal';
import type { BlueCoralContent } from './blue-coral.schema';
import { blueCoralDefaultEnabledSections } from './blue-coral.sections';
import type { Speaker } from './types';

type Props = {
  content: BlueCoralContent;
  speakers: Record<string, Speaker>;
};

type RootProps = Props & {
  funnelId: string;
  enabledSections?: string[];
  palette?: import('@/lib/palette').Palette | null;
};

/* -------------------------- VISUAL TOKENS -------------------------- */
// Deterministic speaker gradient + initial color cycles, keyed by index.
const SPEAKER_GRADIENTS = [
  'linear-gradient(135deg,#2563EB,#1B3A5C)',
  'linear-gradient(135deg,#0D9488,#0F766E)',
  'linear-gradient(135deg,#F87171,#DC2626)',
  'linear-gradient(135deg,#1B3A5C,#0F172A)',
  'linear-gradient(135deg,#60A5FA,#2563EB)',
  'linear-gradient(135deg,#2563EB,#152E4A)',
  'linear-gradient(135deg,#F87171,#FCA5A5)',
  'linear-gradient(135deg,#1D4ED8,#2563EB)',
];

const HERO_AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#2563EB,#1B3A5C)',
  'linear-gradient(135deg,#1D4ED8,#152E4A)',
  'linear-gradient(135deg,#F87171,#DC2626)',
  'linear-gradient(135deg,#60A5FA,#2563EB)',
];

const SOCIAL_AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#2563EB,#1B3A5C)',
  'linear-gradient(135deg,#F87171,#DC2626)',
  'linear-gradient(135deg,#1D4ED8,#1B3A5C)',
  'linear-gradient(135deg,#60A5FA,#2563EB)',
];

const FOUNDER_GRADIENTS = [
  'linear-gradient(135deg,#2563EB,#1B3A5C)',
  'linear-gradient(135deg,#F87171,#DC2626)',
];

const TESTIMONIAL_SMALL_GRADIENTS = [
  'linear-gradient(135deg,#F87171,#DC2626)',
  'linear-gradient(135deg,#0F766E,#115E59)',
];

// Outcome bullet color cycles: first 3 are brand blue, last 3 are coral.
const OUTCOME_COLORS = ['#2563EB', '#2563EB', '#2563EB', '#F87171', '#F87171', '#F87171'];

/* -------------------------- HELPERS -------------------------- */
function initialsFromSpeaker(s: Speaker): string {
  const a = s.firstName?.trim()?.[0] ?? '';
  const b = s.lastName?.trim()?.[0] ?? '';
  return (a + b).toUpperCase() || '??';
}

function displayName(s: Speaker): string {
  return `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() || '—';
}

/* -------------------------- ICONS -------------------------- */
function CheckIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
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
  );
}

function BadgeIcon({ icon, className = 'w-4 h-4' }: { icon: 'shield' | 'lock' | 'info' | 'star'; className?: string }) {
  switch (icon) {
    case 'shield':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'lock':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'info':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'star':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
  }
}

/* ============== 01. STICKY TOP BAR ============== */
function TopBar({ content }: { content: BlueCoralContent }) {
  return (
    <div
      className="sticky top-0 z-50 text-white py-4 px-4 shadow-lg"
      style={{ background: '#1D4ED8' }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-center">
        <span className="blue-coral-heading font-bold text-lg md:text-xl tracking-tight">
          {content.topBar.title}
        </span>
      </div>
    </div>
  );
}

/* ============== 02. HERO ============== */
function Hero({ content, speakers }: Props) {
  const h = content.hero;
  const heroSpeakers = h.avatarSpeakerIds
    .map((id) => speakers[id])
    .filter((s): s is Speaker => Boolean(s))
    .slice(0, 4);

  return (
    <section
      className="py-16 md:py-24 relative overflow-hidden"
      style={{
        background:
          'linear-gradient(160deg, #F0F7FF 0%, #DBEAFE 35%, #E8F0FE 70%, #F0F7FF 100%)',
      }}
    >
      {/* Decorative blurred circles */}
      <div
        className="absolute top-10 left-10 w-72 h-72 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="absolute bottom-10 right-10 w-96 h-96 rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, #F87171 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <p
          className="blue-coral-heading font-bold text-sm mb-4 uppercase tracking-wider"
          style={{ color: '#2563EB' }}
        >
          {h.eyebrow}
        </p>
        <h1
          className="blue-coral-heading font-black text-3xl md:text-5xl lg:text-[3.25rem] leading-[1.12] mb-6"
          style={{ color: '#1E293B' }}
        >
          {h.headline}
        </h1>
        <p
          className="text-lg mb-8 leading-relaxed max-w-2xl mx-auto"
          style={{ color: '#4B5563' }}
        >
          <strong style={{ color: '#1E293B' }}>{h.subheadlineLead}</strong>
          {h.subheadlineTrail}
        </p>
        <a
          href="#optin"
          className="blue-coral-pulse-coral inline-block text-white blue-coral-heading font-bold text-base px-10 py-4 rounded-full uppercase tracking-wide mb-4 shadow-lg transition-transform hover:scale-105"
          style={{ background: '#F87171' }}
        >
          {h.ctaLabel}
        </a>
        <p className="text-sm mb-8" style={{ color: '#6B7280' }}>
          {h.giftNotePrefix}
          <strong style={{ color: '#2563EB' }}>{h.giftNoteHighlight}</strong>
          {h.giftNoteSuffix}
        </p>

        {/* Social proof row */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="flex -space-x-2">
            {heroSpeakers.map((s, idx) => (
              <div
                key={`social-${s.id}`}
                className="blue-coral-avatar-sm"
                style={{
                  background:
                    SOCIAL_AVATAR_GRADIENTS[idx % SOCIAL_AVATAR_GRADIENTS.length],
                }}
              >
                {initialsFromSpeaker(s)}
              </div>
            ))}
          </div>
          <p className="text-sm" style={{ color: '#4B5563' }}>
            <span
              className="inline-flex gap-0.5 text-xs align-middle"
              style={{ color: '#F87171' }}
              aria-hidden="true"
            >
              ★★★★★
            </span>{' '}
            {h.socialProofLead}
            <strong style={{ color: '#1E293B' }}>{h.socialProofCount}</strong>
            {h.socialProofSuffix}
          </p>
        </div>

        {/* Featured speaker row */}
        <div className="flex flex-wrap items-start justify-center gap-6 md:gap-10">
          {heroSpeakers.map((s, idx) => (
            <div key={`hero-speaker-${s.id}`} className="flex flex-col items-center">
              <div
                className="blue-coral-avatar-hero"
                style={{
                  background:
                    HERO_AVATAR_GRADIENTS[idx % HERO_AVATAR_GRADIENTS.length],
                }}
              >
                {initialsFromSpeaker(s)}
              </div>
              <p
                className="blue-coral-heading font-bold text-xs mt-2"
                style={{ color: '#1E293B' }}
              >
                {displayName(s)}
              </p>
              {s.title ? (
                <p className="text-[11px]" style={{ color: '#6B7280' }}>
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

/* ============== 03. LOGO MARQUEE ============== */
function Press({ content }: { content: BlueCoralContent }) {
  const outlets = content.press.outlets;
  return (
    <section className="bg-white py-10">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p
          className="text-xs blue-coral-heading font-bold tracking-[0.2em] uppercase mb-6"
          style={{ color: '#9CA3AF' }}
        >
          {content.press.eyebrow}
        </p>
        <div className="blue-coral-marquee-wrap">
          <div className="blue-coral-marquee-track">
            <div className="blue-coral-marquee-set">
              {outlets.map((name, idx) => (
                <span className="blue-coral-logo-item" key={`press-a-${idx}`}>
                  {name}
                </span>
              ))}
            </div>
            <div className="blue-coral-marquee-set" aria-hidden="true">
              {outlets.map((name, idx) => (
                <span className="blue-coral-logo-item" key={`press-b-${idx}`}>
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
function TrustBadges({ content }: { content: BlueCoralContent }) {
  return (
    <section
      className="bg-white py-5"
      style={{ borderBottom: '1px solid #F3F4F6' }}
    >
      <div className="max-w-4xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm" style={{ color: '#6B7280' }}>
        {content.trustBadges.items.map((item, idx) => (
          <span key={`badge-${idx}`} className="flex items-center gap-2">
            <BadgeIcon
              icon={item.icon}
              className={`w-4 h-4 ${item.icon === 'star' ? '' : ''}`}
            />
            <span style={{ color: item.icon === 'star' ? '#F87171' : undefined }} />
            <span>{item.label}</span>
          </span>
        ))}
      </div>
    </section>
  );
}

/* ============== 04. STATS BAR ============== */
function Stats({ content }: { content: BlueCoralContent }) {
  return (
    <section
      className="py-12"
      style={{
        background:
          'linear-gradient(135deg, #2563EB 0%, #1D4ED8 50%, #1B3A5C 100%)',
      }}
    >
      <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center text-white">
        {content.stats.items.map((item, idx) => {
          const isMiddle = idx === 1;
          return (
            <div
              key={`stat-${idx}`}
              className={isMiddle ? '' : ''}
              style={
                isMiddle
                  ? {
                      borderLeft: '1px solid rgba(96,165,250,0.3)',
                      borderRight: '1px solid rgba(96,165,250,0.3)',
                    }
                  : undefined
              }
            >
              <p className="blue-coral-heading font-black text-4xl md:text-5xl">
                {item.value}
              </p>
              <p
                className="font-medium text-sm mt-1 uppercase tracking-wider"
                style={{ color: '#BFDBFE' }}
              >
                {item.label}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ============== 05. WHAT IS THIS? ============== */
function Overview({ content }: { content: BlueCoralContent }) {
  const o = content.overview;
  return (
    <section id="what-is-this" className="bg-white py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        {/* Illustration on LEFT */}
        <div
          className="rounded-2xl aspect-[4/3] flex items-center justify-center"
          style={{
            background:
              'linear-gradient(135deg, #F0F7FF 0%, #FFFFFF 50%, #DBEAFE 100%)',
            border: '1px solid #DBEAFE',
          }}
        >
          <div className="text-center p-8">
            <div className="flex justify-center gap-4 mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: '#2563EB' }}
              >
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: '#F87171' }}
              >
                <svg
                  className="w-8 h-8 text-white"
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
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: '#1D4ED8' }}
              >
                <svg
                  className="w-8 h-8 text-white"
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
            </div>
            <p
              className="blue-coral-heading font-bold text-xl mb-1"
              style={{ color: '#1E293B' }}
            >
              {o.illustrationCaption}
            </p>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              {o.illustrationSubcaption}
            </p>
          </div>
        </div>
        {/* Text on RIGHT */}
        <div>
          <p
            className="blue-coral-heading font-bold text-sm uppercase tracking-wider mb-2"
            style={{ color: '#2563EB' }}
          >
            {o.eyebrow}
          </p>
          <h2
            className="blue-coral-heading font-black text-3xl md:text-4xl mb-6"
            style={{ color: '#1E293B' }}
          >
            {o.headline}
          </h2>
          {o.bodyParagraphs.map((para, idx) => (
            <p
              key={`overview-p-${idx}`}
              className="text-lg leading-relaxed mb-4"
              style={{ color: '#4B5563' }}
            >
              {para}
            </p>
          ))}
          <a
            href="#optin"
            className="inline-block text-white blue-coral-heading font-bold px-8 py-4 rounded-full transition-colors text-base mt-4"
            style={{ background: '#2563EB' }}
          >
            {o.ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============== 06. SPEAKER GRID — DAY 1 ============== */
function SpeakersDay({ content, speakers }: Props) {
  const daySpeakers = content.speakersDay.speakerIds
    .map((id) => speakers[id])
    .filter((s): s is Speaker => Boolean(s));

  return (
    <section className="py-16 md:py-24" style={{ background: '#F8FAFC' }}>
      <div className="max-w-6xl mx-auto px-6 text-center">
        <span
          className="inline-block text-white blue-coral-heading font-bold text-sm px-5 py-2 rounded-full mb-4"
          style={{ background: '#2563EB' }}
        >
          {content.speakersDay.dayLabel}
        </span>
        <h2
          className="blue-coral-heading font-black text-3xl md:text-4xl mb-12"
          style={{ color: '#1E293B' }}
        >
          {content.speakersDay.headline}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {daySpeakers.map((s, idx) => (
            <div key={`day-speaker-${s.id}`} className="flex flex-col items-center">
              <div
                className="blue-coral-avatar mb-3"
                style={{
                  background:
                    SPEAKER_GRADIENTS[idx % SPEAKER_GRADIENTS.length],
                }}
              >
                {initialsFromSpeaker(s)}
              </div>
              <p
                className="blue-coral-heading font-bold"
                style={{ color: '#1E293B' }}
              >
                {displayName(s)}
              </p>
              {s.title ? (
                <p className="text-sm" style={{ color: '#6B7280' }}>
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

/* ============== 07. WHAT YOU'LL LEARN ============== */
function Outcomes({ content }: { content: BlueCoralContent }) {
  const o = content.outcomes;
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6">
        <p
          className="blue-coral-heading font-bold text-sm uppercase tracking-wider mb-2 text-center"
          style={{ color: '#2563EB' }}
        >
          {o.eyebrow}
        </p>
        <h2
          className="blue-coral-heading font-black text-3xl md:text-4xl mb-12 text-center"
          style={{ color: '#1E293B' }}
        >
          {o.headline}
        </h2>
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
          {o.items.map((item, idx) => (
            <div key={`outcome-${idx}`} className="flex items-start gap-4">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: OUTCOME_COLORS[idx % OUTCOME_COLORS.length] }}
              >
                <CheckIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p
                  className="blue-coral-heading font-bold text-lg"
                  style={{ color: '#1E293B' }}
                >
                  {item.title}
                </p>
                <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
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

/* ============== FREE GIFT ============== */
function FreeGift({ content }: { content: BlueCoralContent }) {
  const g = content.freeGift;
  return (
    <section
      className="py-14 md:py-20"
      style={{
        background: 'linear-gradient(135deg, #F0F7FF 0%, rgba(219,234,254,0.25) 100%)',
      }}
    >
      <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
        <div className="flex justify-center">
          <div className="relative">
            <div
              className="w-56 h-72 rounded-xl flex flex-col items-center justify-center p-6 transform -rotate-3"
              style={{
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                boxShadow:
                  '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0,0,0,0.1)',
              }}
            >
              <div
                className="w-full h-2 rounded-full mb-4"
                style={{ background: '#2563EB' }}
              />
              <div
                className="w-12 h-12 rounded-xl mb-3 flex items-center justify-center"
                style={{ background: '#2563EB' }}
              >
                <svg
                  className="w-6 h-6 text-white"
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
              <p
                className="blue-coral-heading font-bold text-sm text-center leading-tight"
                style={{ color: '#1E293B' }}
              >
                {g.cardTitle}
              </p>
              <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>
                {g.cardSubtitle}
              </p>
            </div>
            <div
              className="absolute -top-3 -right-3 text-white blue-coral-heading font-black text-xs px-3 py-1.5 rounded-full shadow-lg"
              style={{ background: '#F87171', transform: 'rotate(12deg)' }}
            >
              {g.badge}
            </div>
          </div>
        </div>
        <div>
          <p
            className="blue-coral-heading font-bold text-sm uppercase tracking-wider mb-2"
            style={{ color: '#F87171' }}
          >
            {g.eyebrow}
          </p>
          <h2
            className="blue-coral-heading font-black text-2xl md:text-3xl mb-4"
            style={{ color: '#1E293B' }}
          >
            {g.headline}
          </h2>
          <p className="mb-5" style={{ color: '#4B5563' }}>
            {g.body}
          </p>
          <ul className="space-y-3 mb-6">
            {g.bullets.map((bullet, idx) => (
              <li
                key={`gift-bullet-${idx}`}
                className="flex items-start gap-2"
                style={{ color: '#374151' }}
              >
                <CheckIcon className="w-5 h-5 shrink-0 mt-0.5" />
                <span style={{ color: '#2563EB', width: 0, overflow: 'hidden' }} />
                {bullet}
              </li>
            ))}
          </ul>
          <a
            href="#optin"
            className="blue-coral-pulse-coral inline-block text-white blue-coral-heading font-bold text-sm px-7 py-3.5 rounded-full uppercase tracking-wide transition-transform hover:scale-105"
            style={{ background: '#F87171' }}
          >
            {g.ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============== 08. BONUS STACK ============== */
function Bonuses({ content }: { content: BlueCoralContent }) {
  const b = content.bonuses;
  return (
    <section
      className="py-16 md:py-24"
      style={{
        background: 'linear-gradient(135deg, #F0F7FF 0%, #DBEAFE 100%)',
      }}
    >
      <div className="max-w-5xl mx-auto px-6 text-center">
        <p
          className="blue-coral-heading font-bold text-sm uppercase tracking-wider mb-2"
          style={{ color: '#F87171' }}
        >
          {b.eyebrow}
        </p>
        <h2
          className="blue-coral-heading font-black text-3xl md:text-4xl mb-12"
          style={{ color: '#1E293B' }}
        >
          {b.headline}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {b.items.map((bonus, idx) => (
            <article
              key={`bonus-${idx}`}
              className="rounded-xl p-6 text-left"
              style={{
                background: '#FFFFFF',
                border: '1px solid #BFDBFE',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}
            >
              <span
                className="inline-block text-white blue-coral-heading font-bold text-xs px-4 py-1.5 rounded-full mb-4"
                style={{ background: '#F87171' }}
              >
                {bonus.valueLabel}
              </span>
              <h3
                className="blue-coral-heading font-bold text-xl mb-3"
                style={{ color: '#1E293B' }}
              >
                {bonus.title}
              </h3>
              <p className="mb-4" style={{ color: '#4B5563' }}>
                {bonus.description}
              </p>
              <ul className="space-y-2">
                {bonus.bullets.map((bullet, bIdx) => (
                  <li
                    key={`bonus-${idx}-b-${bIdx}`}
                    className="flex items-center gap-2"
                    style={{ color: '#374151' }}
                  >
                    <span style={{ color: '#2563EB' }}>
                      <CheckIcon className="w-5 h-5 shrink-0" />
                    </span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <a
          href="#optin"
          className="inline-block mt-10 text-white blue-coral-heading font-bold px-10 py-4 rounded-full transition-colors text-lg"
          style={{ background: '#2563EB' }}
        >
          {b.ctaLabel}
        </a>
      </div>
    </section>
  );
}

/* ============== 09. FOUNDERS ============== */
function Founders({ content }: { content: BlueCoralContent }) {
  const f = content.founders;
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-6">
        <h2
          className="blue-coral-heading font-black text-3xl md:text-4xl text-center mb-12"
          style={{ color: '#1E293B' }}
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
                className="blue-coral-avatar-md mb-4"
                style={{
                  background:
                    FOUNDER_GRADIENTS[idx % FOUNDER_GRADIENTS.length],
                }}
              >
                {founder.initials}
              </div>
              <h3
                className="blue-coral-heading font-bold text-xl"
                style={{ color: '#1E293B' }}
              >
                {founder.name}
              </h3>
              <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
                {founder.role}
              </p>
              <p
                className="text-sm leading-relaxed max-w-sm"
                style={{ color: '#4B5563' }}
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

/* ============== 10. TESTIMONIALS ============== */
function Testimonials({ content }: { content: BlueCoralContent }) {
  const t = content.testimonials;
  return (
    <section className="py-16 md:py-24" style={{ background: '#F8FAFC' }}>
      <div className="max-w-4xl mx-auto px-6">
        <p
          className="blue-coral-heading font-bold text-sm uppercase tracking-wider mb-2 text-center"
          style={{ color: '#F87171' }}
        >
          {t.eyebrow}
        </p>
        <h2
          className="blue-coral-heading font-black text-3xl md:text-4xl text-center mb-12"
          style={{ color: '#1E293B' }}
        >
          {t.headline}
        </h2>

        {/* Featured large testimonial */}
        <div
          className="rounded-2xl p-8 md:p-12 relative max-w-3xl mx-auto"
          style={{
            background: '#FFFFFF',
            border: '1px solid #F3F4F6',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          }}
        >
          <svg
            className="absolute top-6 left-6 w-16 h-16 opacity-60"
            style={{ color: '#DBEAFE' }}
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
          </svg>
          <div className="relative z-10">
            <div
              className="inline-flex gap-0.5 text-lg mb-5 justify-center w-full"
              style={{ color: '#F87171' }}
              aria-hidden="true"
            >
              ★★★★★
            </div>
            <p
              className="text-xl md:text-2xl italic leading-relaxed text-center mb-8"
              style={{ color: '#374151' }}
            >
              &ldquo;{t.featured.quote}&rdquo;
            </p>
            <div className="flex items-center justify-center gap-4">
              <div
                className="blue-coral-avatar-sm"
                style={{
                  background: 'linear-gradient(135deg,#2563EB,#1B3A5C)',
                }}
              >
                {t.featured.initials}
              </div>
              <div className="text-left">
                <p
                  className="blue-coral-heading font-bold"
                  style={{ color: '#1E293B' }}
                >
                  {t.featured.name}
                </p>
                <p className="text-sm" style={{ color: '#9CA3AF' }}>
                  {t.featured.location}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Small supporting quotes */}
        <div className="grid md:grid-cols-2 gap-4 mt-8 max-w-3xl mx-auto">
          {t.supporting.map((item, idx) => (
            <div
              key={`supporting-${idx}`}
              className="rounded-xl p-5"
              style={{
                background: '#FFFFFF',
                border: '1px solid #F3F4F6',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}
            >
              <p
                className="italic text-sm mb-3"
                style={{ color: '#4B5563' }}
              >
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="blue-coral-avatar-xs"
                  style={{
                    background:
                      TESTIMONIAL_SMALL_GRADIENTS[
                        idx % TESTIMONIAL_SMALL_GRADIENTS.length
                      ],
                  }}
                >
                  {item.initials}
                </div>
                <div>
                  <p
                    className="blue-coral-heading font-bold text-xs"
                    style={{ color: '#1E293B' }}
                  >
                    {item.name}
                  </p>
                  <p className="text-[11px]" style={{ color: '#9CA3AF' }}>
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
function PullQuote({ content }: { content: BlueCoralContent }) {
  const pq = content.pullQuote;
  return (
    <section
      className="py-14 md:py-20"
      style={{
        background: 'linear-gradient(135deg, #1B3A5C 0%, #2563EB 100%)',
      }}
    >
      <div className="max-w-3xl mx-auto px-6 text-center">
        <svg
          className="w-10 h-10 mx-auto mb-4 opacity-50"
          style={{ color: '#93C5FD' }}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
        </svg>
        <p
          className="blue-coral-heading font-bold text-2xl md:text-3xl leading-relaxed italic"
          style={{ color: '#FFFFFF' }}
        >
          &ldquo;{pq.quote}&rdquo;
        </p>
        <p
          className="font-medium text-sm mt-4"
          style={{ color: '#BFDBFE' }}
        >
          {pq.attribution}
        </p>
      </div>
    </section>
  );
}

/* ============== 11. FIGURES / WHY THIS MATTERS ============== */
function Figures({ content }: { content: BlueCoralContent }) {
  const f = content.figures;
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-6">
        <p
          className="blue-coral-heading font-bold text-sm uppercase tracking-wider mb-2 text-center"
          style={{ color: '#2563EB' }}
        >
          {f.eyebrow}
        </p>
        <h2
          className="blue-coral-heading font-black text-3xl md:text-4xl text-center mb-12"
          style={{ color: '#1E293B' }}
        >
          {f.headline}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {f.items.map((item, idx) => (
            <div
              key={`figure-${idx}`}
              className="rounded-xl p-6 text-center"
              style={{
                background: '#F0F7FF',
                border: '1px solid #DBEAFE',
              }}
            >
              <p
                className="blue-coral-heading font-black text-4xl mb-2"
                style={{ color: '#2563EB' }}
              >
                {item.value}
              </p>
              <p className="text-sm" style={{ color: '#6B7280' }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============== 12. FIVE BIG SHIFTS ============== */
function Shifts({ content }: { content: BlueCoralContent }) {
  const s = content.shifts;
  return (
    <section className="py-16 md:py-24" style={{ background: '#F8FAFC' }}>
      <div className="max-w-3xl mx-auto px-6">
        <p
          className="blue-coral-heading font-bold text-sm uppercase tracking-wider mb-2"
          style={{ color: '#2563EB' }}
        >
          {s.eyebrow}
        </p>
        <h2
          className="blue-coral-heading font-black text-3xl md:text-4xl mb-12"
          style={{ color: '#1E293B' }}
        >
          {s.headline}
        </h2>
        <div className="space-y-8">
          {s.items.map((item, idx) => (
            <div key={`shift-${idx}`} className="flex gap-6">
              <span
                className="blue-coral-heading font-black text-5xl leading-none shrink-0"
                style={{ color: 'rgba(37,99,235,0.2)' }}
              >
                {String(idx + 1).padStart(2, '0')}
              </span>
              <div>
                <h3
                  className="blue-coral-heading font-bold text-xl mb-2"
                  style={{ color: '#1E293B' }}
                >
                  {item.title}
                </h3>
                <p style={{ color: '#4B5563' }}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============== 13. CLOSING CTA ============== */
function FinalCTA({ content }: { content: BlueCoralContent }) {
  const c = content.closing;
  return (
    <section
      className="py-16 md:py-24"
      style={{
        background:
          'linear-gradient(160deg, #1B3A5C 0%, #2563EB 50%, #1D4ED8 100%)',
      }}
    >
      <div className="max-w-3xl mx-auto px-6">
        <div
          className="rounded-3xl p-10 md:p-14 text-center"
          style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <h2
            className="blue-coral-heading font-black text-3xl md:text-5xl mb-10"
            style={{ color: '#FFFFFF' }}
          >
            {c.headline}
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-10 max-w-lg mx-auto">
            {c.pills.map((pill, idx) => (
              <span
                key={`pill-${idx}`}
                className="blue-coral-heading font-bold text-sm px-4 py-3 rounded-full flex items-center gap-2 justify-center"
                style={{ background: '#F87171', color: '#FFFFFF' }}
              >
                <CheckIcon className="w-4 h-4 shrink-0" />
                {pill}
              </span>
            ))}
          </div>
          <a
            href="#optin"
            className="inline-block blue-coral-heading font-black text-lg px-12 py-5 rounded-full uppercase tracking-wider shadow-xl transition-colors"
            style={{ background: '#FFFFFF', color: '#1D4ED8' }}
          >
            {c.ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============== 14. FAQ ============== */
function FAQ({ content }: { content: BlueCoralContent }) {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-6">
        <p
          className="blue-coral-heading font-bold text-sm uppercase tracking-wider mb-2 text-center"
          style={{ color: '#2563EB' }}
        >
          {content.faqSection.eyebrow}
        </p>
        <h2
          className="blue-coral-heading font-black text-3xl md:text-4xl text-center mb-12"
          style={{ color: '#1E293B' }}
        >
          {content.faqSection.headline}
        </h2>
        <div className="space-y-3">
          {content.faqs.map((faq, idx) => (
            <details
              key={`faq-${idx}`}
              className="rounded-xl"
              style={{
                background: '#F0F7FF',
                border: '1px solid #DBEAFE',
              }}
              open={idx === 0}
            >
              <summary
                className="flex items-center justify-between p-5 blue-coral-heading font-bold"
                style={{ color: '#1E293B' }}
              >
                {faq.question}
                <span
                  className="blue-coral-chevron text-xl"
                  style={{ color: '#2563EB' }}
                  aria-hidden="true"
                >
                  ▼
                </span>
              </summary>
              <div className="px-5 pb-5" style={{ color: '#4B5563' }}>
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
function Footer({ content }: { content: BlueCoralContent }) {
  const f = content.footer;
  return (
    <footer className="py-10" style={{ background: '#0F172A', color: '#93C5FD' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: '#2563EB' }}
            >
              <span
                className="blue-coral-heading font-black text-lg"
                style={{ color: '#FFFFFF' }}
              >
                {f.brandInitial}
              </span>
            </div>
            <div>
              <p
                className="blue-coral-heading font-bold text-sm"
                style={{ color: '#FFFFFF' }}
              >
                {f.brandName}
              </p>
              <p className="text-xs" style={{ color: '#93C5FD' }}>
                {f.tagline}
              </p>
            </div>
          </div>
          <div className="flex gap-6 text-sm">
            {f.links.map((link, idx) => (
              <a
                key={`footer-link-${idx}`}
                href={link.href}
                className="transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
          <p className="text-xs" style={{ color: '#60A5FA' }}>
            {f.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ============== ROOT COMPONENT ============== */
export function BlueCoral({ content, speakers, funnelId, enabledSections }: RootProps) {
  const enabled = new Set(enabledSections ?? blueCoralDefaultEnabledSections);
  return (
    <div className="blue-coral-root blue-coral-body">
      <a href="#main-content" className="blue-coral-skip-nav">
        Skip to content
      </a>

      {enabled.has('top-bar') && <TopBar content={content} />}

      <main id="main-content">
        {enabled.has('hero') && <Hero content={content} speakers={speakers} />}
        {enabled.has('press') && <Press content={content} />}
        {enabled.has('trust') && <TrustBadges content={content} />}
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
        {enabled.has('closing-cta') && <FinalCTA content={content} />}
        {enabled.has('faq') && <FAQ content={content} />}
      </main>

      {enabled.has('footer') && <Footer content={content} />}

      <OptinModal funnelId={funnelId} ctaLabel={content.hero.ctaLabel} />
    </div>
  );
}
