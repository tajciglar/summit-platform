// Document chrome (html/head/body) is owned by the Next.js page/layout that
// renders this template. Fonts (Poppins / Source Sans 3) must be loaded by
// the page — see Task 19/20 (preview/public routes) for wiring.
import './indigo-gold.styles.css';
import { OptinModal } from '@/components/OptinModal';
import type { IndigoGoldContent } from './indigo-gold.schema';
import type { Speaker } from './types';

type Props = {
  content: IndigoGoldContent;
  speakers: Record<string, Speaker>;
};

type RootProps = Props & {
  funnelId: string;
};

/* ============== PALETTE TOKENS ============== */
const BRAND = {
  c50: '#f3eefb',
  c100: '#e8ddf7',
  c200: '#dad0ec',
  c300: '#b9a4d9',
  c400: '#9b7cc6',
  c500: '#5e4d9b',
  c600: '#4721fb',
  c700: '#302070',
  c800: '#330968',
  c900: '#020381',
  c950: '#010250',
};
const GOLD = {
  c300: '#fdd79a',
  c400: '#fdd279',
  c500: '#fcb900',
  c600: '#e0a600',
};

/* Deterministic avatar gradients, cycled by speaker index. */
const AVATAR_GRADIENTS = [
  `linear-gradient(135deg,${BRAND.c600},${BRAND.c700})`,
  `linear-gradient(135deg,${GOLD.c500},${GOLD.c600})`,
  `linear-gradient(135deg,${BRAND.c400},${BRAND.c500})`,
  `linear-gradient(135deg,${BRAND.c800},${BRAND.c900})`,
  `linear-gradient(135deg,${BRAND.c500},${BRAND.c300})`,
  `linear-gradient(135deg,${BRAND.c700},${BRAND.c800})`,
  `linear-gradient(135deg,${BRAND.c300},${BRAND.c500})`,
  `linear-gradient(135deg,${GOLD.c600},${GOLD.c500})`,
];

const COLLAGE_GRADIENTS = [
  `linear-gradient(160deg,${BRAND.c300},${BRAND.c500})`,
  `linear-gradient(160deg,${BRAND.c700},${BRAND.c900})`,
  `linear-gradient(160deg,${BRAND.c400},${BRAND.c600})`,
  `linear-gradient(160deg,${GOLD.c500},${GOLD.c600})`,
  `linear-gradient(160deg,${BRAND.c800},${BRAND.c700})`,
  `linear-gradient(160deg,${BRAND.c500},${BRAND.c400})`,
];

const COLLAGE_OFFSETS = ['mt-0', '-mt-6', 'mt-2', '-mt-4', 'mt-0', '-mt-8'];

function initialsFromSpeaker(s: Speaker): string {
  const a = s.firstName?.trim()?.[0] ?? '';
  const b = s.lastName?.trim()?.[0] ?? '';
  return (a + b).toUpperCase() || '—';
}

function displayName(s: Speaker): string {
  return `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() || '—';
}

/* ============== ICONS ============== */
type OutcomeIconKey = 'brain' | 'chat' | 'clock' | 'heart' | 'school' | 'users';
type TrustIconKey = 'shield' | 'lock' | 'info' | 'star';

function OutcomeIcon({ icon }: { icon: OutcomeIconKey }) {
  const common = 'w-7 h-7 text-white';
  switch (icon) {
    case 'brain':
      return (
        <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    case 'chat':
      return (
        <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    case 'clock':
      return (
        <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'heart':
      return (
        <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      );
    case 'school':
      return (
        <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    case 'users':
      return (
        <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
  }
}

function TrustIcon({ icon }: { icon: TrustIconKey }) {
  const common = 'w-4 h-4';
  const tint = icon === 'star' ? GOLD.c500 : BRAND.c500;
  switch (icon) {
    case 'shield':
      return (
        <svg className={common} style={{ color: tint }} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    case 'lock':
      return (
        <svg className={common} style={{ color: tint }} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
      );
    case 'info':
      return (
        <svg className={common} style={{ color: tint }} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      );
    case 'star':
      return (
        <svg className={common} style={{ color: tint }} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
  }
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5 shrink-0 mt-0.5" style={{ color: BRAND.c500 }} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function ChipCheckIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

/* ============== TOP BAR ============== */
function TopBar({ content }: { content: IndigoGoldContent }) {
  return (
    <div className="sticky top-0 z-40 text-white py-4 px-4 shadow-lg" style={{ background: BRAND.c900 }}>
      <div className="max-w-6xl mx-auto flex items-center justify-center">
        <span className="indigo-gold-heading font-bold text-lg md:text-xl tracking-tight">
          {content.topBar.name}
        </span>
      </div>
    </div>
  );
}

/* ============== HERO ============== */
function Hero({ content, speakers }: Props) {
  const h = content.hero;
  const collage = h.collageSpeakerIds
    .map((id) => speakers[id])
    .filter((s): s is Speaker => Boolean(s));

  return (
    <section
      className="py-14 md:py-20"
      style={{ background: 'linear-gradient(135deg, #ede7f6 0%, #e8ddf7 40%, #f3eefb 100%)' }}
    >
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="indigo-gold-heading font-bold text-sm mb-3" style={{ color: BRAND.c500 }}>
            {h.eyebrow}
          </p>
          <h1
            className="indigo-gold-heading font-black text-3xl md:text-4xl lg:text-[2.75rem] leading-[1.15] mb-5"
            style={{ color: BRAND.c900 }}
          >
            {h.headline}
          </h1>
          <p className="text-base mb-6 leading-relaxed" style={{ color: '#4b5563' }}>
            <strong style={{ color: BRAND.c900 }}>{h.subheadlineLead}</strong>
            {h.subheadlineTrail}
          </p>
          <a
            href="#optin"
            className="indigo-gold-pulse-glow inline-block indigo-gold-heading font-bold text-base px-8 py-4 rounded-full mb-4 uppercase tracking-wide text-white"
            style={{ background: BRAND.c700 }}
          >
            {h.ctaLabel}
          </a>
          <p className="text-sm mb-6" style={{ color: '#6b7280' }}>
            {h.giftNoteLead}
            <strong style={{ color: BRAND.c700 }}>{h.giftNoteAccent}</strong>
            {h.giftNoteTrail}
          </p>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {collage.slice(0, 4).map((s, idx) => (
                <div
                  key={`hero-avatar-${s.id}`}
                  className="indigo-gold-avatar-sm"
                  style={{ background: AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length] }}
                >
                  {initialsFromSpeaker(s)}
                </div>
              ))}
            </div>
            <p className="text-sm" style={{ color: '#4b5563' }}>
              <span className="flex gap-0.5 text-xs mb-0.5" style={{ color: GOLD.c500 }}>
                ★★★★★
              </span>
              {h.ratingLead}
              <strong style={{ color: BRAND.c900 }}>{h.ratingCount}</strong>
              {h.ratingTrail}
            </p>
          </div>
        </div>
        <div className="relative hidden md:block">
          <div className="grid grid-cols-3 gap-3">
            {collage.slice(0, 6).map((s, idx) => (
              <div key={`collage-${s.id}`} className={`flex flex-col items-center ${COLLAGE_OFFSETS[idx] ?? ''}`}>
                <div
                  className="w-full aspect-[3/4] rounded-2xl flex items-end justify-center overflow-hidden"
                  style={{ background: COLLAGE_GRADIENTS[idx % COLLAGE_GRADIENTS.length] }}
                >
                  <span className="indigo-gold-heading font-bold text-4xl mb-6" style={{ color: 'rgba(255,255,255,0.82)' }}>
                    {initialsFromSpeaker(s)}
                  </span>
                </div>
                <p className="indigo-gold-heading font-bold text-xs mt-2 text-center" style={{ color: BRAND.c900 }}>
                  {displayName(s)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============== PRESS MARQUEE ============== */
function Press({ content }: { content: IndigoGoldContent }) {
  const outlets = content.press.outlets;
  const renderSet = (hidden: boolean) => (
    <div className="indigo-gold-marquee-set" aria-hidden={hidden ? true : undefined}>
      {outlets.map((name, idx) => (
        <span className="indigo-gold-logo-item" key={`press-${hidden ? 'b' : 'a'}-${idx}`}>
          {name}
        </span>
      ))}
    </div>
  );

  return (
    <section className="bg-white py-10">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p
          className="indigo-gold-heading font-bold text-xs mb-6 uppercase"
          style={{ color: '#9ca3af', letterSpacing: '0.2em' }}
        >
          {content.press.eyebrow}
        </p>
        <div className="indigo-gold-marquee-container">
          <div className="indigo-gold-marquee-track">
            {renderSet(false)}
            {renderSet(true)}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============== TRUST BADGES ============== */
function TrustBadges({ content }: { content: IndigoGoldContent }) {
  return (
    <section className="bg-white py-5" style={{ borderBottom: '1px solid #f3f4f6' }}>
      <div className="max-w-4xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm" style={{ color: '#6b7280' }}>
        {content.trustBadges.items.map((item, idx) => (
          <span key={`trust-${idx}`} className="flex items-center gap-2">
            <TrustIcon icon={item.icon} />
            {item.label}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ============== STATS BAR ============== */
function Stats({ content }: { content: IndigoGoldContent }) {
  return (
    <section className="py-12" style={{ background: BRAND.c500 }}>
      <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center text-white">
        {content.stats.items.map((item, idx) => (
          <div
            key={`stat-${idx}`}
            className={idx === 1 ? 'border-x' : ''}
            style={idx === 1 ? { borderColor: BRAND.c400 } : undefined}
          >
            <p className="indigo-gold-heading font-black text-4xl md:text-5xl">{item.value}</p>
            <p
              className="font-medium text-sm mt-1 uppercase tracking-wider"
              style={{ color: BRAND.c200 }}
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
function Overview({ content }: { content: IndigoGoldContent }) {
  const o = content.overview;
  return (
    <section id="what-is-this" className="bg-white py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p
            className="indigo-gold-heading font-bold text-sm uppercase tracking-wider mb-2"
            style={{ color: BRAND.c500 }}
          >
            {o.eyebrow}
          </p>
          <h2
            className="indigo-gold-heading font-black text-3xl md:text-4xl mb-6"
            style={{ color: BRAND.c900 }}
          >
            {o.headline}
          </h2>
          {o.bodyParagraphs.map((para, idx) => (
            <p
              key={`overview-p-${idx}`}
              className="text-lg leading-relaxed mb-4"
              style={{ color: '#4b5563' }}
            >
              {para}
            </p>
          ))}
          <a
            href="#optin"
            className="inline-block indigo-gold-heading font-bold text-white px-8 py-4 rounded-full text-base mt-4"
            style={{ background: BRAND.c500 }}
          >
            {o.ctaLabel}
          </a>
        </div>
        <div
          className="rounded-2xl aspect-[4/3] flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${BRAND.c50}, #FFFFFF, ${BRAND.c100})`,
            border: `1px solid ${BRAND.c100}`,
          }}
        >
          <div className="text-center p-8">
            <div className="flex justify-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: BRAND.c500 }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: GOLD.c500 }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: BRAND.c700 }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <p className="indigo-gold-heading font-bold text-xl mb-1" style={{ color: BRAND.c900 }}>
              {o.cardHeadline}
            </p>
            <p className="text-sm" style={{ color: '#6b7280' }}>
              {o.cardSubhead}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============== SPEAKER GRID ============== */
function SpeakersDay({ content, speakers }: Props) {
  const daySpeakers = content.speakersDay.speakerIds
    .map((id) => speakers[id])
    .filter((s): s is Speaker => Boolean(s));

  return (
    <section className="py-16 md:py-24" style={{ background: '#f9fafb' }}>
      <div className="max-w-6xl mx-auto px-6 text-center">
        <span
          className="inline-block indigo-gold-heading font-bold text-white text-sm px-5 py-2 rounded-full mb-4"
          style={{ background: BRAND.c500 }}
        >
          {content.speakersDay.dayBadge}
        </span>
        <h2
          className="indigo-gold-heading font-black text-3xl md:text-4xl mb-12"
          style={{ color: BRAND.c900 }}
        >
          {content.speakersDay.headline}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {daySpeakers.map((s, idx) => (
            <figure key={s.id} className="flex flex-col items-center">
              <div
                className="indigo-gold-avatar mb-3"
                style={{ background: AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length] }}
              >
                {initialsFromSpeaker(s)}
              </div>
              <p className="indigo-gold-heading font-bold" style={{ color: BRAND.c900 }}>
                {displayName(s)}
              </p>
              {s.title ? (
                <p className="text-sm" style={{ color: '#6b7280' }}>
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
function Outcomes({ content }: { content: IndigoGoldContent }) {
  const o = content.outcomes;
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-6">
        <p
          className="indigo-gold-heading font-bold text-sm uppercase tracking-wider mb-2 text-center"
          style={{ color: BRAND.c500 }}
        >
          {o.eyebrow}
        </p>
        <h2
          className="indigo-gold-heading font-black text-3xl md:text-4xl mb-12 text-center"
          style={{ color: BRAND.c900 }}
        >
          {o.headline}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {o.items.map((item, idx) => (
            <div
              key={`outcome-${idx}`}
              className="text-center p-6 rounded-2xl"
              style={{ background: '#f9fafb' }}
            >
              <div
                className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: item.tone === 'gold' ? GOLD.c500 : BRAND.c500 }}
              >
                <OutcomeIcon icon={item.icon} />
              </div>
              <p className="indigo-gold-heading font-bold" style={{ color: BRAND.c900 }}>
                {item.title}
              </p>
              <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============== FREE GIFT ============== */
function FreeGift({ content }: { content: IndigoGoldContent }) {
  const g = content.freeGift;
  return (
    <section
      className="py-14 md:py-20"
      style={{ background: `linear-gradient(135deg, #fef9e9 0%, ${GOLD.c300}40 100%)` }}
    >
      <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
        <div className="flex justify-center">
          <div className="relative">
            <div
              className="w-56 h-72 bg-white rounded-xl shadow-2xl flex flex-col items-center justify-center p-6 transform -rotate-3"
              style={{ border: '1px solid #e5e7eb' }}
            >
              <div
                className="w-full h-2 rounded-full mb-4"
                style={{ background: BRAND.c500 }}
              ></div>
              <div
                className="w-12 h-12 rounded-xl mb-3 flex items-center justify-center"
                style={{ background: BRAND.c500 }}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p
                className="indigo-gold-heading font-bold text-sm text-center leading-tight"
                style={{ color: BRAND.c900 }}
              >
                {g.cardTitle}
              </p>
              <p className="text-xs mt-2" style={{ color: '#9ca3af' }}>
                {g.cardNote}
              </p>
            </div>
            <div
              className="absolute -top-3 -right-3 text-white indigo-gold-heading font-black text-xs px-3 py-1.5 rounded-full shadow-lg transform rotate-12"
              style={{ background: GOLD.c500 }}
            >
              {g.badgeLabel}
            </div>
          </div>
        </div>
        <div>
          <p
            className="indigo-gold-heading font-bold text-sm uppercase tracking-wider mb-2"
            style={{ color: GOLD.c600 }}
          >
            {g.eyebrow}
          </p>
          <h2
            className="indigo-gold-heading font-black text-2xl md:text-3xl mb-4"
            style={{ color: BRAND.c900 }}
          >
            {g.headline}
          </h2>
          <p className="mb-5" style={{ color: '#4b5563' }}>
            {g.body}
          </p>
          <ul className="space-y-3 mb-6">
            {g.bullets.map((bullet, idx) => (
              <li key={`gift-bullet-${idx}`} className="flex items-start gap-2" style={{ color: '#374151' }}>
                <CheckIcon />
                {bullet}
              </li>
            ))}
          </ul>
          <a
            href="#optin"
            className="indigo-gold-pulse-glow inline-block indigo-gold-heading font-bold text-white text-sm px-7 py-3.5 rounded-full uppercase tracking-wide"
            style={{ background: BRAND.c700 }}
          >
            {g.ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============== BONUSES ============== */
function Bonuses({ content }: { content: IndigoGoldContent }) {
  const b = content.bonuses;
  return (
    <section
      className="py-16 md:py-24"
      style={{ background: `linear-gradient(135deg, ${BRAND.c50} 0%, ${BRAND.c100} 100%)` }}
    >
      <div className="max-w-5xl mx-auto px-6 text-center">
        <p
          className="indigo-gold-heading font-bold text-sm uppercase tracking-wider mb-2"
          style={{ color: GOLD.c600 }}
        >
          {b.eyebrow}
        </p>
        <h2
          className="indigo-gold-heading font-black text-3xl md:text-4xl mb-12"
          style={{ color: BRAND.c900 }}
        >
          {b.headline}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {b.items.map((bonus, idx) => (
            <article
              key={`bonus-${idx}`}
              className="bg-white rounded-xl p-6 shadow-sm text-left"
              style={{ border: `1px solid ${BRAND.c200}` }}
            >
              <span
                className="inline-block indigo-gold-heading font-bold text-white text-xs px-4 py-1.5 rounded-full mb-4"
                style={{ background: GOLD.c500 }}
              >
                {bonus.valueLabel}
              </span>
              <h3
                className="indigo-gold-heading font-bold text-xl mb-3"
                style={{ color: BRAND.c900 }}
              >
                {bonus.title}
              </h3>
              <p className="mb-4" style={{ color: '#4b5563' }}>
                {bonus.description}
              </p>
              <ul className="space-y-2">
                {bonus.bullets.map((bullet, bIdx) => (
                  <li
                    key={`bonus-${idx}-b-${bIdx}`}
                    className="flex items-center gap-2"
                    style={{ color: '#374151' }}
                  >
                    <CheckIcon />
                    {bullet}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <a
          href="#optin"
          className="inline-block mt-10 indigo-gold-heading font-bold text-white px-10 py-4 rounded-full text-lg"
          style={{ background: BRAND.c500 }}
        >
          {b.ctaLabel}
        </a>
      </div>
    </section>
  );
}

/* ============== FOUNDERS ============== */
function Founders({ content }: { content: IndigoGoldContent }) {
  const f = content.founders;
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-6">
        <h2
          className="indigo-gold-heading font-black text-3xl md:text-4xl text-center mb-12"
          style={{ color: BRAND.c900 }}
        >
          {f.headline}
        </h2>
        <div className="grid md:grid-cols-2 gap-12">
          {f.items.map((founder, idx) => (
            <div key={`founder-${idx}`} className="flex flex-col items-center text-center">
              <div
                className="indigo-gold-avatar indigo-gold-avatar-lg mb-4"
                style={{ background: AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length] }}
              >
                {founder.initials}
              </div>
              <h3 className="indigo-gold-heading font-bold text-xl" style={{ color: BRAND.c900 }}>
                {founder.name}
              </h3>
              <p className="text-sm mb-4" style={{ color: '#6b7280' }}>
                {founder.role}
              </p>
              <p className="text-sm leading-relaxed max-w-sm" style={{ color: '#4b5563' }}>
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
function Testimonials({ content }: { content: IndigoGoldContent }) {
  const t = content.testimonials;
  return (
    <section className="py-16 md:py-24" style={{ background: '#f9fafb' }}>
      <div className="max-w-6xl mx-auto px-6">
        <p
          className="indigo-gold-heading font-bold text-sm uppercase tracking-wider mb-2 text-center"
          style={{ color: GOLD.c600 }}
        >
          {t.eyebrow}
        </p>
        <h2
          className="indigo-gold-heading font-black text-3xl md:text-4xl text-center mb-12"
          style={{ color: BRAND.c900 }}
        >
          {t.headline}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {t.items.map((item, idx) => (
            <article
              key={`testimonial-${idx}`}
              className="bg-white rounded-xl p-6 shadow-sm"
              style={{ border: '1px solid #f3f4f6' }}
            >
              <div className="flex gap-0.5 text-sm mb-3" style={{ color: GOLD.c500 }}>
                ★★★★★
              </div>
              <p className="italic mb-4" style={{ color: '#4b5563' }}>
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="indigo-gold-avatar-sm"
                  style={{ background: AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length] }}
                >
                  {item.initials}
                </div>
                <div>
                  <p className="indigo-gold-heading font-bold text-sm" style={{ color: BRAND.c900 }}>
                    {item.name}
                  </p>
                  <p className="text-xs" style={{ color: '#9ca3af' }}>
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
function PullQuote({ content }: { content: IndigoGoldContent }) {
  const pq = content.pullQuote;
  return (
    <section className="py-14 md:py-20" style={{ background: BRAND.c900 }}>
      <div className="max-w-3xl mx-auto px-6 text-center">
        <svg
          className="w-10 h-10 mx-auto mb-4 opacity-60"
          fill="currentColor"
          viewBox="0 0 24 24"
          style={{ color: BRAND.c400 }}
          aria-hidden="true"
        >
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
        </svg>
        <p className="indigo-gold-heading font-bold text-2xl md:text-3xl text-white leading-relaxed italic">
          &ldquo;{pq.quote}&rdquo;
        </p>
        <p className="font-medium text-sm mt-4" style={{ color: BRAND.c300 }}>
          {pq.attribution}
        </p>
      </div>
    </section>
  );
}

/* ============== FIGURES ============== */
function Figures({ content }: { content: IndigoGoldContent }) {
  const f = content.figures;
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-6">
        <p
          className="indigo-gold-heading font-bold text-sm uppercase tracking-wider mb-2 text-center"
          style={{ color: BRAND.c500 }}
        >
          {f.eyebrow}
        </p>
        <h2
          className="indigo-gold-heading font-black text-3xl md:text-4xl text-center mb-12"
          style={{ color: BRAND.c900 }}
        >
          {f.headline}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {f.items.map((item, idx) => (
            <div
              key={`figure-${idx}`}
              className="rounded-xl p-6 text-center"
              style={{ background: '#f9fafb', border: '1px solid #f3f4f6' }}
            >
              <p
                className="indigo-gold-heading font-black text-4xl mb-2"
                style={{ color: BRAND.c500 }}
              >
                {item.value}
              </p>
              <p className="text-sm" style={{ color: '#6b7280' }}>
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
function Shifts({ content }: { content: IndigoGoldContent }) {
  const s = content.shifts;
  return (
    <section className="py-16 md:py-24" style={{ background: '#f9fafb' }}>
      <div className="max-w-3xl mx-auto px-6">
        <p
          className="indigo-gold-heading font-bold text-sm uppercase tracking-wider mb-2"
          style={{ color: BRAND.c500 }}
        >
          {s.eyebrow}
        </p>
        <h2
          className="indigo-gold-heading font-black text-3xl md:text-4xl mb-12"
          style={{ color: BRAND.c900 }}
        >
          {s.headline}
        </h2>
        <div className="space-y-8">
          {s.items.map((item, idx) => (
            <div key={`shift-${idx}`} className="flex gap-6">
              <span
                className="indigo-gold-heading font-black text-5xl leading-none shrink-0"
                style={{ color: `${BRAND.c500}33` }}
              >
                {String(idx + 1).padStart(2, '0')}
              </span>
              <div>
                <h3
                  className="indigo-gold-heading font-bold text-xl mb-2"
                  style={{ color: BRAND.c900 }}
                >
                  {item.title}
                </h3>
                <p style={{ color: '#4b5563' }}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============== CLOSING CTA ============== */
function FinalCTA({ content }: { content: IndigoGoldContent }) {
  const c = content.closing;
  return (
    <section
      className="py-16 md:py-20 mx-4"
      style={{
        background: `linear-gradient(135deg, ${BRAND.c700} 0%, ${BRAND.c500} 50%, ${BRAND.c800} 100%)`,
        borderRadius: '24px',
      }}
    >
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="indigo-gold-heading font-black text-3xl md:text-5xl text-white mb-10">
          {c.headline}
        </h2>
        <div className="grid grid-cols-2 gap-3 mb-10 max-w-lg mx-auto">
          {c.chips.map((chip, idx) => (
            <span
              key={`chip-${idx}`}
              className="indigo-gold-heading text-white font-bold text-sm px-4 py-3 rounded-full flex items-center gap-2 justify-center"
              style={{ background: GOLD.c500 }}
            >
              <ChipCheckIcon />
              {chip}
            </span>
          ))}
        </div>
        <a
          href="#optin"
          className="inline-block indigo-gold-heading font-black text-lg px-12 py-5 rounded-full uppercase tracking-wider shadow-xl"
          style={{ background: GOLD.c500, color: BRAND.c900 }}
        >
          {c.ctaLabel}
        </a>
      </div>
    </section>
  );
}

/* ============== FAQ ============== */
function FAQ({ content }: { content: IndigoGoldContent }) {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-6">
        <p
          className="indigo-gold-heading font-bold text-sm uppercase tracking-wider mb-2 text-center"
          style={{ color: BRAND.c500 }}
        >
          {content.faqSection.eyebrow}
        </p>
        <h2
          className="indigo-gold-heading font-black text-3xl md:text-4xl text-center mb-12"
          style={{ color: BRAND.c900 }}
        >
          {content.faqSection.headline}
        </h2>
        <div className="space-y-3">
          {content.faqs.map((faq, idx) => (
            <details
              key={`faq-${idx}`}
              className="rounded-xl"
              style={{ background: '#f9fafb', border: '1px solid #f3f4f6' }}
              open={idx === 0}
            >
              <summary
                className="flex items-center justify-between p-5 indigo-gold-heading font-bold"
                style={{ color: BRAND.c900 }}
              >
                {faq.question}
                <span className="indigo-gold-chevron text-xl" style={{ color: BRAND.c500 }}>
                  ▼
                </span>
              </summary>
              <div className="px-5 pb-5" style={{ color: '#4b5563' }}>
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
function Footer({ content }: { content: IndigoGoldContent }) {
  const f = content.footer;
  return (
    <footer className="py-10" style={{ background: BRAND.c950, color: BRAND.c300 }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: BRAND.c500 }}
            >
              <span className="indigo-gold-heading font-black text-white text-lg">
                {f.brandInitial}
              </span>
            </div>
            <div>
              <p className="indigo-gold-heading font-bold text-white text-sm">{f.brandName}</p>
              <p className="text-xs" style={{ color: BRAND.c300 }}>
                {f.tagline}
              </p>
            </div>
          </div>
          <div className="flex gap-6 text-sm">
            {f.links.map((link, idx) => (
              <a key={`foot-${idx}`} href={link.href} className="hover:text-white transition-colors">
                {link.label}
              </a>
            ))}
          </div>
          <p className="text-xs" style={{ color: BRAND.c400 }}>
            {f.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ============== ROOT COMPONENT ============== */
export function IndigoGold({ content, speakers, funnelId }: RootProps) {
  return (
    <div className="indigo-gold-root indigo-gold-body">
      <a href="#main-content" className="indigo-gold-skip-nav">
        Skip to content
      </a>

      <TopBar content={content} />

      <main id="main-content">
        <Hero content={content} speakers={speakers} />
        <Press content={content} />
        <TrustBadges content={content} />
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
        <FinalCTA content={content} />
        <FAQ content={content} />
      </main>

      <Footer content={content} />

      <OptinModal funnelId={funnelId} ctaLabel={content.hero.ctaLabel} />
    </div>
  );
}
