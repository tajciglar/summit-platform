// Document chrome (html/head/body) is owned by the Next.js page/layout that
// renders this template. Fonts (Space Grotesk / Inter / DM Serif Display)
// must be loaded by the page — see Task 19/20 (preview/public routes).
import './violet-sun.styles.css';
import { OptinModal } from '@/components/OptinModal';
import type { VioletSunContent } from './violet-sun.schema';
import { violetSunDefaultEnabledSections } from './violet-sun.sections';
import type { Speaker } from './types';

type Props = {
  content: VioletSunContent;
  speakers: Record<string, Speaker>;
};

type RootProps = Props & {
  funnelId: string;
  enabledSections?: string[];
  palette?: import('@/lib/palette').Palette | null;
};

// Deterministic sparkline heights keyed by trend label.
const TREND_HEIGHTS: Record<'rising' | 'plateau' | 'falling' | 'volatile', number[]> = {
  rising:   [40, 55, 72, 88, 100],
  plateau:  [88, 90, 92, 94, 96],
  falling:  [100, 85, 68, 50, 35],
  volatile: [55, 92, 40, 78, 62],
};

// Hero portrait card gradients — violet/sun/mist rotation per v4 HTML.
const HERO_CARD_GRADIENTS = [
  'linear-gradient(160deg,#4A2FB8,#23135F)',
  'linear-gradient(160deg,#FFC300,#B88C00)',
  'linear-gradient(160deg,#C6C1DB,#7E7399)',
  'linear-gradient(160deg,#8A6EEB,#5C3BDF)',
];
const HERO_CARD_NAME_COLORS = ['#FFFFFF', '#23135F', '#23135F', '#FFFFFF'];
const HERO_CARD_TITLE_COLORS = ['#C5B8F7', '#381F8E', '#381F8E', '#C5B8F7'];

// Hero bottom avatar strip gradients (mini 4-up).
const HERO_AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#FFC300,#FFD347)',
  'linear-gradient(135deg,#8A6EEB,#4A2FB8)',
  'linear-gradient(135deg,#C6C1DB,#A59DC2)',
  'linear-gradient(135deg,#FFD347,#FFC300)',
];
const HERO_AVATAR_TEXT_COLORS = ['#4A2FB8', '#FFFFFF', '#4A2FB8', '#4A2FB8'];

// Speaker-day grid avatar gradients (8-up cycle).
const SPEAKER_GRADIENTS = [
  'linear-gradient(135deg,#6F4EE6,#4A2FB8)',
  'linear-gradient(135deg,#FFC300,#B88C00)',
  'linear-gradient(135deg,#8A6EEB,#5C3BDF)',
  'linear-gradient(135deg,#23135F,#4A2FB8)',
  'linear-gradient(135deg,#C6C1DB,#7E7399)',
  'linear-gradient(135deg,#4A2FB8,#23135F)',
  'linear-gradient(135deg,#FFD347,#FFC300)',
  'linear-gradient(135deg,#6F4EE6,#8A6EEB)',
];
const SPEAKER_INITIAL_COLORS = [
  '#FFFFFF',
  '#23135F',
  '#FFFFFF',
  '#FFC300',
  '#23135F',
  '#FFFFFF',
  '#23135F',
  '#FFFFFF',
];

// Founders avatars.
const FOUNDER_GRADIENTS = [
  'linear-gradient(135deg,#6F4EE6,#4A2FB8)',
  'linear-gradient(135deg,#FFC300,#FFD347)',
];
const FOUNDER_TEXT_COLORS = ['#FFFFFF', '#23135F'];

// Testimonial avatars.
const TESTIMONIAL_GRADIENTS = [
  'linear-gradient(135deg,#6F4EE6,#4A2FB8)',
  'linear-gradient(135deg,#FFC300,#FFD347)',
  'linear-gradient(135deg,#8A6EEB,#5C3BDF)',
];
const TESTIMONIAL_TEXT_COLORS = ['#FFFFFF', '#23135F', '#FFFFFF'];

// Outcome card icon bg toggle (white vs sun-400).
const OUTCOME_ICON_BGS = ['#FFFFFF', '#FFC300'];

// Figure value color (violet default; accent indexes get warm tones per HTML).
const FIGURE_VALUE_COLORS: Record<number, string> = {
  1: '#C4663D',
  4: '#B88C00',
};

function initialsFromSpeaker(s: Speaker): string {
  const a = s.firstName?.trim()?.[0] ?? '';
  const b = s.lastName?.trim()?.[0] ?? '';
  return (a + b).toUpperCase() || '??';
}

function displayName(s: Speaker): string {
  return `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() || '—';
}

/* ============== BRAND MARK ============== */
function BrandMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="28" height="28" rx="10" fill="#FFC300" />
      <path
        d="M10 21 L 14 13 L 18 19 L 22 11"
        stroke="#110833"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/* ============== STICKY TOP BAR ============== */
function TopBar({ content }: { content: VioletSunContent }) {
  const t = content.topBar;
  return (
    <header
      className="sticky top-0 z-40 text-white"
      style={{ background: '#6F4EE6' }}
    >
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrandMark />
          <span className="violet-sun-display font-bold text-lg tracking-tight">
            {t.brandName}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span
            className="hidden md:inline-flex items-center gap-2 text-sm font-medium"
            style={{ color: '#E6E0FD' }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#FFC300' }}
            ></span>
            {t.dateLabel}
          </span>
          <a
            href="#optin"
            className="violet-sun-btn-sun text-sm"
            style={{ padding: '0.5rem 1.25rem', boxShadow: 'none' }}
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
    <section className="relative violet-sun-grad-hero text-white overflow-hidden">
      <div className="absolute inset-0 violet-sun-dots-bg"></div>
      <div
        className="absolute -top-24 -right-24 w-[32rem] h-[32rem] rounded-full opacity-40"
        style={{
          background: 'radial-gradient(circle,#FFC300,transparent 65%)',
          filter: 'blur(40px)',
        }}
      ></div>
      <div
        className="absolute -bottom-32 -left-24 w-[28rem] h-[28rem] rounded-full opacity-50"
        style={{
          background: 'radial-gradient(circle,#C6C1DB,transparent 65%)',
          filter: 'blur(40px)',
        }}
      ></div>

      <div className="relative max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-20 md:pb-28">
        <div className="grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: '#FFC300' }}
              ></span>
              <span className="text-sm font-medium" style={{ color: '#E6E0FD' }}>
                {h.pillLabel}
              </span>
            </div>

            <h1 className="violet-sun-display font-bold text-5xl md:text-6xl lg:text-7xl leading-[1.02] tracking-[-0.03em] mb-7">
              <span className="violet-sun-italic-serif" style={{ color: '#FFD347' }}>
                {h.headlineAccent}
              </span>
              {h.headlineTrail}
            </h1>

            <p
              className="text-lg md:text-xl leading-[1.6] mb-9 max-w-xl"
              style={{ color: '#E6E0FD' }}
            >
              {h.subheadline}
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10">
              <a
                href="#optin"
                className="violet-sun-btn-sun violet-sun-btn-sun-pulse"
              >
                {h.primaryCtaLabel}
                <span aria-hidden="true">→</span>
              </a>
              <a href="#what-is-this" className="violet-sun-btn-violet">
                {h.secondaryCtaLabel}
              </a>
            </div>

            <div
              className="flex items-center gap-4 pt-8"
              style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}
            >
              <div className="flex -space-x-3">
                {heroSpeakers.slice(0, 4).map((s, idx) => (
                  <div
                    key={`hero-avatar-${s.id}`}
                    className="w-11 h-11 rounded-full flex items-center justify-center violet-sun-display font-bold text-sm"
                    style={{
                      background:
                        HERO_AVATAR_GRADIENTS[idx % HERO_AVATAR_GRADIENTS.length],
                      color:
                        HERO_AVATAR_TEXT_COLORS[idx % HERO_AVATAR_TEXT_COLORS.length],
                      border: '2px solid #6F4EE6',
                    }}
                  >
                    {initialsFromSpeaker(s)}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <p className="violet-sun-stars mb-0.5">
                  ★★★★★{' '}
                  <span
                    className="ml-1 font-medium"
                    style={{ color: 'rgba(255,255,255,0.9)', letterSpacing: 'normal' }}
                  >
                    {h.ratingLabel}
                  </span>
                </p>
                <p style={{ color: '#E6E0FD' }}>
                  {h.readerCountLead}{' '}
                  <span className="font-semibold text-white">{h.readerCount}</span>{' '}
                  {h.readerCountSuffix}
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="grid grid-cols-2 gap-4 relative">
              <span
                className="absolute -top-5 -right-5 w-20 h-20 rounded-full violet-sun-grad-button shadow-2xl flex items-center justify-center violet-sun-display font-bold text-center p-2"
                style={{
                  color: '#4A2FB8',
                  fontSize: '0.65rem',
                  lineHeight: '1.1',
                  transform: 'rotate(8deg)',
                }}
              >
                {h.freeBadge}
              </span>

              {heroSpeakers.slice(0, 4).map((s, idx) => {
                const marginTopClass =
                  idx === 1 ? 'mt-8' : idx === 2 ? '-mt-4' : idx === 3 ? 'mt-4' : '';
                return (
                  <div
                    key={`hero-card-${s.id}`}
                    className={`aspect-[3/4] rounded-3xl flex items-end justify-start p-5 shadow-2xl ${marginTopClass}`}
                    style={{
                      background:
                        HERO_CARD_GRADIENTS[idx % HERO_CARD_GRADIENTS.length],
                    }}
                  >
                    <div>
                      <p
                        className="violet-sun-display font-bold text-lg"
                        style={{
                          color:
                            HERO_CARD_NAME_COLORS[idx % HERO_CARD_NAME_COLORS.length],
                        }}
                      >
                        {displayName(s)}
                      </p>
                      {s.title ? (
                        <p
                          className="text-xs mt-1"
                          style={{
                            color:
                              HERO_CARD_TITLE_COLORS[
                                idx % HERO_CARD_TITLE_COLORS.length
                              ],
                          }}
                        >
                          {s.title}
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
            <p
              className="text-center text-xs mt-5 font-medium"
              style={{ color: 'rgba(230,224,253,0.8)' }}
            >
              {h.moreLabel}
            </p>
          </div>
        </div>
      </div>

      {/* Wave divider to white */}
      <svg
        className="block absolute -bottom-px left-0 right-0 w-full h-8 md:h-12"
        viewBox="0 0 1200 40"
        preserveAspectRatio="none"
        fill="#FFFFFF"
        aria-hidden="true"
      >
        <path d="M0 40 Q 300 0, 600 20 T 1200 10 L 1200 40 L 0 40 Z" />
      </svg>
    </section>
  );
}

/* ============== PRESS MARQUEE ============== */
function Press({ content }: { content: VioletSunContent }) {
  const items = [...content.press.outlets, ...content.press.outlets];
  return (
    <section className="bg-white py-10">
      <div className="max-w-7xl mx-auto px-6">
        <p
          className="violet-sun-eyebrow text-center mb-6"
          style={{ color: '#7E7399' }}
        >
          {content.press.eyebrow}
        </p>
        <div className="violet-sun-marquee-wrap">
          <div className="violet-sun-marquee-track">
            {items.map((name, idx) => (
              <span className="violet-sun-marquee-item" key={`press-${idx}`}>
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============== STATS ============== */
function Stats({ content }: { content: VioletSunContent }) {
  return (
    <section className="violet-sun-grad-mist py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6">
        <p
          className="violet-sun-eyebrow text-center mb-10"
          style={{ color: '#2A1869' }}
        >
          {content.stats.eyebrow}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-4 text-center">
          {content.stats.items.map((item, idx) => {
            const isLast = idx === content.stats.items.length - 1;
            const borderClass = isLast ? '' : 'md:border-r md:pr-4';
            return (
              <div
                key={`stat-${idx}`}
                className={borderClass}
                style={{
                  borderColor: isLast ? undefined : 'rgba(138,110,235,0.3)',
                }}
              >
                <p
                  className="violet-sun-display font-bold text-7xl md:text-8xl leading-none mb-3 tracking-[-0.04em]"
                  style={{ color: '#2A1869' }}
                >
                  {item.value}
                  {item.suffix ? (
                    <span style={{ color: '#FFC300' }}>{item.suffix}</span>
                  ) : null}
                </p>
                <p
                  className="text-lg font-medium"
                  style={{ color: '#544B75' }}
                >
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
function Overview({ content }: { content: VioletSunContent }) {
  const o = content.overview;
  return (
    <section id="what-is-this" className="bg-white py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-7">
          <span
            className="violet-sun-eyebrow mb-3 inline-block"
            style={{ color: '#6F4EE6' }}
          >
            {o.eyebrow}
          </span>
          <h2
            className="violet-sun-display font-bold text-4xl md:text-6xl leading-[1.02] tracking-[-0.03em] mb-7"
            style={{ color: '#110833' }}
          >
            {o.headlineLead}
            <span className="violet-sun-hl-sun">{o.headlineHighlight}</span>
            {o.headlineMid}
            <span
              className="violet-sun-italic-serif"
              style={{ color: '#6F4EE6' }}
            >
              {o.headlineAccent}
            </span>
            {o.headlineTrail}
          </h2>
          {o.bodyParagraphs.map((para, idx) => {
            const isLast = idx === o.bodyParagraphs.length - 1;
            return (
              <p
                key={`overview-p-${idx}`}
                className={`text-lg md:text-xl leading-[1.65] ${isLast ? 'mb-9' : 'mb-5'}`}
                style={{ color: '#544B75' }}
              >
                {para}
              </p>
            );
          })}
          <a href="#optin" className="violet-sun-btn-sun">
            {o.ctaLabel}
            <span aria-hidden="true">→</span>
          </a>
        </div>
        <div className="md:col-span-5">
          <div className="violet-sun-card-mist p-8">
            <p
              className="violet-sun-eyebrow mb-6"
              style={{ color: '#2A1869' }}
            >
              {o.cardEyebrow}
            </p>
            <div className="space-y-5">
              {o.components.map((comp, idx) => {
                const iconBg = idx % 2 === 0 ? '#2A1869' : '#FFC300';
                return (
                  <div key={`overview-comp-${idx}`} className="flex gap-4">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: iconBg }}
                    >
                      <span
                        className="violet-sun-display font-bold text-base"
                        style={{ color: idx % 2 === 0 ? '#FFC300' : '#110833' }}
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div>
                      <p
                        className="violet-sun-display font-bold text-lg"
                        style={{ color: '#110833' }}
                      >
                        {comp.title}
                      </p>
                      <p
                        className="text-sm mt-1"
                        style={{ color: '#544B75' }}
                      >
                        {comp.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============== SPEAKER GRID — DAY 1 ============== */
function SpeakersDay({ content, speakers }: Props) {
  const s = content.speakersDay;
  const daySpeakers = s.speakerIds
    .map((id) => speakers[id])
    .filter((sp): sp is Speaker => Boolean(sp));

  return (
    <section className="violet-sun-grad-mist py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-6">
          <div>
            <span
              className="inline-block violet-sun-eyebrow px-4 py-2 rounded-full mb-5"
              style={{ background: '#6F4EE6', color: '#FFFFFF' }}
            >
              {s.dayLabel}
            </span>
            <h2
              className="violet-sun-display font-bold text-4xl md:text-5xl tracking-[-0.03em] leading-tight"
              style={{ color: '#110833' }}
            >
              {s.headlineLead}
              <span
                className="violet-sun-italic-serif"
                style={{ color: '#2A1869' }}
              >
                {s.headlineAccent}
              </span>
              {s.headlineTrail}
            </h2>
          </div>
          <p className="font-medium" style={{ color: '#544B75' }}>
            {s.countLabel}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
          {daySpeakers.map((sp, idx) => (
            <figure key={sp.id} className="violet-sun-card-light p-6 text-center">
              <div
                className="w-28 h-28 rounded-full mx-auto mb-4 flex items-end justify-center pb-4"
                style={{
                  background:
                    SPEAKER_GRADIENTS[idx % SPEAKER_GRADIENTS.length],
                }}
              >
                <span
                  className="violet-sun-display font-bold text-3xl"
                  style={{
                    color:
                      SPEAKER_INITIAL_COLORS[idx % SPEAKER_INITIAL_COLORS.length],
                  }}
                >
                  {initialsFromSpeaker(sp)}
                </span>
              </div>
              <p
                className="violet-sun-display font-bold"
                style={{ color: '#110833' }}
              >
                {displayName(sp)}
              </p>
              {sp.title ? (
                <p className="text-sm mt-1" style={{ color: '#6B638A' }}>
                  {sp.title}
                </p>
              ) : null}
            </figure>
          ))}
        </div>

        <div className="text-center mt-12">
          <a href="#optin" className="violet-sun-btn-outline">
            {s.ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============== OUTCOMES ============== */
function Outcomes({ content }: { content: VioletSunContent }) {
  const o = content.outcomes;
  const total = o.items.length;
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span
            className="violet-sun-eyebrow mb-3 inline-block"
            style={{ color: '#6F4EE6' }}
          >
            {o.eyebrow}
          </span>
          <h2
            className="violet-sun-display font-bold text-4xl md:text-5xl tracking-[-0.03em] leading-tight"
            style={{ color: '#110833' }}
          >
            {o.headlineLead}
            <span
              className="violet-sun-italic-serif"
              style={{ color: '#6F4EE6' }}
            >
              {o.headlineAccent}
            </span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {o.items.map((item, idx) => {
            const iconBg = OUTCOME_ICON_BGS[idx % OUTCOME_ICON_BGS.length];
            return (
              <article key={`outcome-${idx}`} className="violet-sun-card-mist p-7">
                <div className="flex items-center justify-between mb-5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: iconBg }}
                  >
                    <span
                      className="violet-sun-display font-bold text-lg"
                      style={{
                        color: iconBg === '#FFFFFF' ? '#2A1869' : '#23135F',
                      }}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <span
                    className="violet-sun-display font-bold text-sm"
                    style={{ color: '#2A1869' }}
                  >
                    {String(idx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                  </span>
                </div>
                <h3
                  className="violet-sun-display font-bold text-xl mb-2"
                  style={{ color: '#110833' }}
                >
                  {item.title}
                </h3>
                <p
                  className="leading-relaxed"
                  style={{ color: 'rgba(35,19,95,0.7)' }}
                >
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============== FREE GIFT ============== */
function FreeGift({ content }: { content: VioletSunContent }) {
  const g = content.freeGift;
  return (
    <section className="violet-sun-grad-violet-dark text-white py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 violet-sun-dots-bg opacity-40"></div>
      <div
        className="absolute -top-16 -right-16 w-96 h-96 rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle,#FFC300,transparent 65%)',
          filter: 'blur(40px)',
        }}
      ></div>

      <div className="relative max-w-6xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-5 flex justify-center">
          <div className="relative">
            <div
              className="w-64 h-80 rounded-3xl shadow-2xl p-7 flex flex-col justify-between"
              style={{
                background: '#FFFFFF',
                transform: 'rotate(-3deg)',
              }}
            >
              <div>
                <div className="w-full h-2 rounded-full violet-sun-grad-button mb-4"></div>
                <div className="w-12 h-12 rounded-2xl violet-sun-grad-button mb-4 flex items-center justify-center">
                  <svg
                    className="w-6 h-6"
                    style={{ color: '#23135F' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <p
                  className="violet-sun-display font-bold text-lg leading-tight"
                  style={{ color: '#23135F' }}
                >
                  {g.cardTitle}
                </p>
              </div>
              <div>
                <p className="text-xs" style={{ color: '#7E7399' }}>
                  {g.cardSubtitle}
                </p>
              </div>
            </div>
            <div
              className="absolute -top-4 -right-4 violet-sun-display font-bold text-xs px-4 py-2 rounded-full shadow-2xl"
              style={{
                background: '#FFC300',
                color: '#23135F',
                transform: 'rotate(6deg)',
              }}
            >
              {g.cardBadge}
            </div>
          </div>
        </div>
        <div className="md:col-span-7">
          <span
            className="violet-sun-eyebrow mb-4 inline-block"
            style={{ color: '#FFC300' }}
          >
            {g.eyebrow}
          </span>
          <h2
            className="violet-sun-display font-bold text-4xl md:text-5xl leading-tight mb-6 tracking-[-0.03em]"
          >
            {g.headlineLead}
            <span
              className="violet-sun-italic-serif"
              style={{ color: '#FFD347' }}
            >
              {g.headlineAccent}
            </span>
            {g.headlineTrail}
          </h2>
          <p
            className="text-lg leading-relaxed mb-7"
            style={{ color: '#E6E0FD' }}
          >
            {g.body}
          </p>
          <ul className="space-y-3 mb-8">
            {g.bullets.map((bullet, idx) => (
              <li
                key={`gift-bullet-${idx}`}
                className="flex items-start gap-3"
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: '#FFC300' }}
                >
                  <span
                    className="font-bold"
                    style={{ color: '#23135F' }}
                  >
                    ✓
                  </span>
                </span>
                <span style={{ color: '#E6E0FD' }}>{bullet}</span>
              </li>
            ))}
          </ul>
          <a href="#optin" className="violet-sun-btn-sun">
            {g.ctaLabel}
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============== BONUSES ============== */
function Bonuses({ content }: { content: VioletSunContent }) {
  const b = content.bonuses;
  return (
    <section className="violet-sun-grad-mist py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span
            className="violet-sun-eyebrow mb-3 inline-block"
            style={{ color: '#2A1869' }}
          >
            {b.eyebrow}
          </span>
          <h2
            className="violet-sun-display font-bold text-4xl md:text-5xl tracking-[-0.03em] leading-tight"
            style={{ color: '#110833' }}
          >
            <span className="violet-sun-hl-sun">{b.headlineHighlight}</span>
            {b.headlineTrail}
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {b.items.map((bonus, idx) => (
            <article key={`bonus-${idx}`} className="violet-sun-card-light p-8">
              <div className="flex items-center justify-between mb-5">
                <span
                  className="violet-sun-eyebrow"
                  style={{ color: '#6F4EE6' }}
                >
                  {bonus.label}
                </span>
                <span
                  className="violet-sun-eyebrow px-3 py-1.5 rounded-full"
                  style={{ background: '#FFC300', color: '#23135F' }}
                >
                  {bonus.valueLabel}
                </span>
              </div>
              <h3
                className="violet-sun-display font-bold text-2xl mb-3 leading-tight"
                style={{ color: '#110833' }}
              >
                {bonus.title}
              </h3>
              <p
                className="mb-5 leading-relaxed"
                style={{ color: '#544B75' }}
              >
                {bonus.description}
              </p>
              <ul className="space-y-2 text-sm" style={{ color: '#2A1869' }}>
                {bonus.bullets.map((bullet, bIdx) => (
                  <li
                    key={`bonus-${idx}-b-${bIdx}`}
                    className="flex gap-2"
                  >
                    <span
                      className="font-bold"
                      style={{ color: '#6F4EE6' }}
                    >
                      ✓
                    </span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="text-center mt-12">
          <a
            href="#optin"
            className="violet-sun-btn-sun violet-sun-btn-sun-pulse"
          >
            {b.ctaLabel}
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============== FOUNDERS ============== */
function Founders({ content }: { content: VioletSunContent }) {
  const f = content.founders;
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6">
        <h2
          className="violet-sun-display font-bold text-4xl md:text-5xl text-center mb-14 tracking-[-0.03em] leading-tight"
          style={{ color: '#110833' }}
        >
          {f.headlineLead}
          <span
            className="violet-sun-italic-serif"
            style={{ color: '#6F4EE6' }}
          >
            {f.headlineAccent}
          </span>
        </h2>
        <div className="grid md:grid-cols-2 gap-12">
          {f.items.map((founder, idx) => (
            <div
              key={`founder-${idx}`}
              className="violet-sun-card-mist p-8 md:p-10"
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center violet-sun-display font-bold text-xl shadow-lg"
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
                  <p
                    className="violet-sun-display font-bold text-lg"
                    style={{ color: '#110833' }}
                  >
                    {founder.name}
                  </p>
                  <p className="text-sm" style={{ color: '#6B638A' }}>
                    {founder.role}
                  </p>
                </div>
              </div>
              <blockquote
                className="violet-sun-italic-serif text-xl leading-relaxed pl-6"
                style={{
                  color: 'rgba(35,19,95,0.9)',
                  borderLeft: '4px solid #FFC300',
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
function Testimonials({ content }: { content: VioletSunContent }) {
  const t = content.testimonials;
  return (
    <section className="violet-sun-grad-mist py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span
            className="violet-sun-eyebrow mb-3 inline-block"
            style={{ color: '#2A1869' }}
          >
            {t.eyebrow}
          </span>
          <h2
            className="violet-sun-display font-bold text-4xl md:text-5xl tracking-[-0.03em] leading-tight"
            style={{ color: '#110833' }}
          >
            {t.headlineLead}
            <span
              className="violet-sun-italic-serif"
              style={{ color: '#2A1869' }}
            >
              {t.headlineAccent}
            </span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {t.items.map((item, idx) => (
            <article key={`testimonial-${idx}`} className="violet-sun-card-light p-8">
              <p className="violet-sun-stars mb-4">★★★★★</p>
              <p
                className="text-lg leading-relaxed mb-6"
                style={{ color: '#1E0F52' }}
              >
                &ldquo;{item.quote}&rdquo;
              </p>
              <div
                className="flex items-center gap-3 pt-5"
                style={{ borderTop: '1px solid #DCD7E6' }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center violet-sun-display font-bold text-sm"
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
                  <p
                    className="violet-sun-display font-bold"
                    style={{ color: '#110833' }}
                  >
                    {item.name}
                  </p>
                  <p className="text-xs" style={{ color: '#6B638A' }}>
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
function PullQuote({ content }: { content: VioletSunContent }) {
  const pq = content.pullQuote;
  return (
    <section className="violet-sun-grad-violet-dark text-white py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 violet-sun-dots-bg opacity-30"></div>
      <div
        className="absolute top-10 right-10 w-32 h-32 rounded-full blur-3xl"
        style={{ background: 'rgba(255,195,0,0.2)' }}
      ></div>
      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <svg
          className="w-16 h-16 mx-auto mb-6"
          style={{ color: '#FFC300' }}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
        </svg>
        <p className="violet-sun-display font-bold text-3xl md:text-5xl leading-[1.15] mb-8 tracking-[-0.02em]">
          &ldquo;{pq.quote}&rdquo;
        </p>
        <div className="inline-flex items-center gap-4">
          <span
            className="w-12 h-[1px]"
            style={{ background: '#FFC300' }}
          ></span>
          <p className="violet-sun-eyebrow" style={{ color: '#FFC300' }}>
            {pq.attribution}
          </p>
          <span
            className="w-12 h-[1px]"
            style={{ background: '#FFC300' }}
          ></span>
        </div>
      </div>
    </section>
  );
}

/* ============== FIGURES / WHY THIS MATTERS ============== */
function Figures({ content }: { content: VioletSunContent }) {
  const f = content.figures;
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mb-14">
          <span
            className="violet-sun-eyebrow mb-3 inline-block"
            style={{ color: '#6F4EE6' }}
          >
            {f.eyebrow}
          </span>
          <h2
            className="violet-sun-display font-bold text-4xl md:text-5xl tracking-[-0.03em] leading-tight"
            style={{ color: '#110833' }}
          >
            {f.headlineLead}
            <span
              className="violet-sun-italic-serif"
              style={{ color: '#6F4EE6' }}
            >
              {f.headlineAccent}
            </span>
            {f.headlineTrail}
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {f.items.map((item, idx) => {
            const valueColor = FIGURE_VALUE_COLORS[idx] ?? '#2A1869';
            return (
              <div key={`figure-${idx}`} className="violet-sun-card-mist p-7">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="violet-sun-eyebrow"
                    style={{ color: '#2A1869' }}
                  >
                    {item.label}
                  </span>
                  <div className="violet-sun-spark" aria-hidden="true">
                    {TREND_HEIGHTS[item.trend].map((h, hIdx) => (
                      <span
                        key={`spark-${idx}-${hIdx}`}
                        style={{ height: `${h}%` }}
                      ></span>
                    ))}
                  </div>
                </div>
                <p
                  className="violet-sun-display font-bold text-5xl mb-2 leading-none tracking-tight"
                  style={{ color: valueColor }}
                >
                  {item.value}
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'rgba(35,19,95,0.7)' }}
                >
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

/* ============== SHIFTS ============== */
function Shifts({ content }: { content: VioletSunContent }) {
  const s = content.shifts;
  return (
    <section className="violet-sun-grad-mist py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-6">
        <span
          className="violet-sun-eyebrow mb-3 inline-block"
          style={{ color: '#2A1869' }}
        >
          {s.eyebrow}
        </span>
        <h2
          className="violet-sun-display font-bold text-4xl md:text-5xl tracking-[-0.03em] leading-tight mb-14"
          style={{ color: '#110833' }}
        >
          {s.headlineLead}
          <span
            className="violet-sun-italic-serif"
            style={{ color: '#2A1869' }}
          >
            {s.headlineAccent}
          </span>
        </h2>
        <div className="space-y-5">
          {s.items.map((item, idx) => (
            <article
              key={`shift-${idx}`}
              className="violet-sun-card-light p-7 flex gap-6 items-start"
            >
              <span
                className="w-14 h-14 rounded-2xl violet-sun-grad-button flex items-center justify-center violet-sun-display font-bold text-xl shrink-0"
                style={{ color: '#23135F' }}
              >
                {String(idx + 1).padStart(2, '0')}
              </span>
              <div>
                <h3
                  className="violet-sun-display font-bold text-xl mb-2"
                  style={{ color: '#110833' }}
                >
                  {item.title}
                </h3>
                <p
                  className="leading-relaxed"
                  style={{ color: '#544B75' }}
                >
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
function FAQ({ content }: { content: VioletSunContent }) {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <span
            className="violet-sun-eyebrow mb-3 inline-block"
            style={{ color: '#6F4EE6' }}
          >
            {content.faqSection.eyebrow}
          </span>
          <h2
            className="violet-sun-display font-bold text-4xl md:text-5xl tracking-[-0.03em] leading-tight"
            style={{ color: '#110833' }}
          >
            {content.faqSection.headlineLead}
            <span
              className="violet-sun-italic-serif"
              style={{ color: '#6F4EE6' }}
            >
              {content.faqSection.headlineAccent}
            </span>
          </h2>
        </div>
        {content.faqs.map((faq, idx) => (
          <details key={`faq-${idx}`}>
            <summary>
              {faq.question}
              <span className="violet-sun-pm-icon">+</span>
            </summary>
            <p
              className="px-7 pb-6 leading-relaxed"
              style={{ color: '#544B75' }}
            >
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

/* ============== FINAL CTA ============== */
function FinalCTA({ content }: { content: VioletSunContent }) {
  const c = content.closing;
  return (
    <section
      id="final-cta"
      className="relative violet-sun-grad-hero text-white py-24 md:py-32 overflow-hidden"
    >
      <div className="absolute inset-0 violet-sun-dots-bg"></div>
      <div
        className="absolute -top-20 -left-20 w-[32rem] h-[32rem] rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle,#FFC300,transparent 65%)',
          filter: 'blur(40px)',
        }}
      ></div>
      <div
        className="absolute -bottom-20 -right-20 w-[30rem] h-[30rem] rounded-full opacity-40"
        style={{
          background: 'radial-gradient(circle,#C6C1DB,transparent 65%)',
          filter: 'blur(40px)',
        }}
      ></div>

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <span
          className="violet-sun-eyebrow mb-6 inline-block"
          style={{ color: '#FFC300' }}
        >
          {c.eyebrow}
        </span>
        <h2 className="violet-sun-display font-bold text-5xl md:text-6xl lg:text-7xl leading-[1.03] tracking-[-0.035em] mb-8">
          {c.headlineLead}
          <span
            className="violet-sun-italic-serif"
            style={{ color: '#FFD347' }}
          >
            {c.headlineAccent}
          </span>
          {c.headlineTrail}
        </h2>
        <p
          className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
          style={{ color: '#E6E0FD' }}
        >
          {c.subheadline}
        </p>
        <a
          href="#optin"
          className="violet-sun-btn-sun violet-sun-btn-sun-pulse"
          style={{ fontSize: '1.125rem', padding: '1.25rem 2.5rem' }}
        >
          {c.ctaLabel}
          <span aria-hidden="true">→</span>
        </a>
        {c.fineprint ? (
          <p
            className="violet-sun-eyebrow mt-8"
            style={{ color: 'rgba(230,224,253,0.7)' }}
          >
            {c.fineprint}
          </p>
        ) : null}
      </div>
    </section>
  );
}

/* ============== FOOTER ============== */
function Footer({ content }: { content: VioletSunContent }) {
  const f = content.footer;
  return (
    <footer
      className="text-white py-14"
      style={{ background: '#110833' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div
          className="grid md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 pb-10"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <BrandMark />
              <p className="violet-sun-display font-bold text-xl">
                {f.brandName}
              </p>
            </div>
            <p
              className="text-sm max-w-xs"
              style={{ color: '#C5B8F7' }}
            >
              {f.tagline}
            </p>
          </div>
          <div>
            <p
              className="violet-sun-eyebrow mb-4"
              style={{ color: '#A08CEF' }}
            >
              {f.summitLinksLabel}
            </p>
            <ul
              className="space-y-2 text-sm"
              style={{ color: 'rgba(230,224,253,0.8)' }}
            >
              {f.summitLinks.map((link, idx) => (
                <li key={`summit-link-${idx}`}>
                  <a href={link.href} className="hover:text-[#FFC300]">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p
              className="violet-sun-eyebrow mb-4"
              style={{ color: '#A08CEF' }}
            >
              {f.legalLinksLabel}
            </p>
            <ul
              className="space-y-2 text-sm"
              style={{ color: 'rgba(230,224,253,0.8)' }}
            >
              {f.legalLinks.map((link, idx) => (
                <li key={`legal-link-${idx}`}>
                  <a href={link.href} className="hover:text-[#FFC300]">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p
              className="violet-sun-eyebrow mb-4"
              style={{ color: '#A08CEF' }}
            >
              {f.contactLabel}
            </p>
            <ul
              className="space-y-2 text-sm"
              style={{ color: 'rgba(230,224,253,0.8)' }}
            >
              <li>{f.contactEmail}</li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>
                {f.copyright}
              </li>
            </ul>
          </div>
        </div>
        <p
          className="text-xs text-center mt-6"
          style={{ color: 'rgba(197,184,247,0.6)' }}
        >
          {f.signoff}
        </p>
      </div>
    </footer>
  );
}

/* =======================================================================
 * ============  SALES-PAGE SECTIONS  ====================================
 * -----------------------------------------------------------------------
 * All sales sections are optional in the schema; each component guards
 * with `if (!content.xxx) return null;` so optin pages (which omit these
 * fields) render cleanly. Visual styling uses violet-sun's editorial
 * palette — violet gradients, sun-yellow accents, DM Serif Display italic
 * highlights, Space Grotesk display, Inter body.
 * ======================================================================= */

const VS_SALES = {
  VIO_DARK: '#23135F',
  VIO_900: '#110833',
  VIO_700: '#4A2FB8',
  VIO_600: '#5C3BDF',
  VIO_500: '#6F4EE6',
  VIO_400: '#8A6EEB',
  VIO_300: '#A08CEF',
  VIO_200: '#C5B8F7',
  VIO_100: '#E6E0FD',
  VIO_50: '#F3F0FE',
  MIST_300: '#C6C1DB',
  MIST_200: '#DCD7E6',
  MIST_100: '#EBE8F0',
  MIST_50: '#F5F3F8',
  SUN_500: '#FFC300',
  SUN_400: '#FFD347',
  SUN_300: '#FFE07A',
  SUN_100: '#FFF6D6',
  INK_900: '#110833',
  INK_700: '#3C2E54',
  INK_600: '#544B75',
};

const vsSalesIconLabels: Record<string, string> = {
  'infinity': 'Unlimited Access',
  'clipboard': 'Action Blueprints',
  'headphones': 'Audio Edition',
  'captions': 'Subtitles',
  'file-text': 'Transcripts',
  'book': 'Workbook',
};

function VsSalesBonusIcon({ icon }: { icon: string }) {
  const label = vsSalesIconLabels[icon] ?? icon;
  const color = VS_SALES.VIO_700;
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

function VsCheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 3 }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function VsXIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function VsArrowRight({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function VsGiftIcon({ size = 20, color = VS_SALES.VIO_700 }: { size?: number; color?: string }) {
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

/* SALES HERO — violet-on-violet editorial hero with sun CTA + mist product card. */
function SalesHero({ content }: { content: VioletSunContent }) {
  if (!content.salesHero) return null;
  const h = content.salesHero;
  const topName = content.topBar.brandName;
  return (
    <section
      style={{
        padding: '3rem 1.25rem 4.5rem',
        background: `linear-gradient(180deg, ${VS_SALES.MIST_50} 0%, #FFFFFF 70%)`,
      }}
    >
      <div style={{ maxWidth: 920, margin: '0 auto', textAlign: 'center' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: '#FFFFFF',
            background: '#DC2626',
            borderRadius: 9999,
            padding: '0.5rem 1.1rem',
            marginBottom: '1.75rem',
            textTransform: 'uppercase',
            fontFamily: "'Inter', sans-serif",
            boxShadow: '0 6px 18px -6px rgba(220,38,38,.45)',
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFFFFF' }} />
          {h.badge}
        </span>

        <h1
          className="violet-sun-display"
          style={{
            fontWeight: 700,
            fontSize: 'clamp(1.9rem, 4vw, 2.8rem)',
            lineHeight: 1.12,
            color: VS_SALES.INK_900,
            marginBottom: '1.1rem',
          }}
        >
          {h.headline}
        </h1>

        <p
          className="violet-sun-italic-serif"
          style={{
            fontSize: 'clamp(1.15rem, 2.2vw, 1.55rem)',
            color: VS_SALES.VIO_700,
            maxWidth: 700,
            margin: '0 auto 2.25rem',
            lineHeight: 1.4,
          }}
        >
          {h.subheadline}
        </p>

        {/* Product mockup card — violet gradient with sun dot accents */}
        <div
          style={{
            maxWidth: 580,
            margin: '0 auto 2.25rem',
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: '0 30px 60px -24px rgba(74,47,184,.45)',
            aspectRatio: '16/9',
            background: `linear-gradient(135deg, ${VS_SALES.VIO_DARK} 0%, ${VS_SALES.VIO_700} 55%, ${VS_SALES.VIO_500} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.35,
              background: `radial-gradient(circle at 18% 30%, ${VS_SALES.SUN_400}, transparent 45%), radial-gradient(circle at 82% 70%, ${VS_SALES.VIO_200}, transparent 45%)`,
            }}
          />
          <div style={{ position: 'relative', textAlign: 'center', color: '#FFFFFF', padding: '1.5rem' }}>
            <p
              className="violet-sun-eyebrow"
              style={{ color: VS_SALES.SUN_400, marginBottom: '0.5rem' }}
            >
              Full Access
            </p>
            <p
              className="violet-sun-italic-serif"
              style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4.2rem)', margin: 0, lineHeight: 1.1 }}
            >
              {h.productLabel}
            </p>
            <p
              className="violet-sun-eyebrow"
              style={{ marginTop: '0.75rem', color: VS_SALES.VIO_200 }}
            >
              {topName}
            </p>
          </div>
        </div>

        <p style={{ fontSize: '0.9rem', color: VS_SALES.INK_700, marginBottom: '0.75rem', fontFamily: "'Inter', sans-serif" }}>
          Total value:{' '}
          <span style={{ fontWeight: 700, color: VS_SALES.VIO_700, textDecoration: 'line-through' }}>
            {h.totalValue}
          </span>
        </p>
        <a
          href="#purchase"
          className="violet-sun-btn-sun violet-sun-btn-sun-pulse"
          style={{ fontSize: '1.05rem', padding: '1.1rem 2.25rem' }}
        >
          {h.ctaLabel} <VsArrowRight size={20} />
        </a>
        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: VS_SALES.VIO_700, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
          {h.ctaNote}
        </p>
      </div>
    </section>
  );
}

/* INTRO — serif italic eyebrow + display headline + body paragraphs. */
function Intro({ content }: { content: VioletSunContent }) {
  if (!content.intro) return null;
  const i = content.intro;
  return (
    <section style={{ padding: '4rem 1.25rem', background: '#FFFFFF' }}>
      <div style={{ maxWidth: 740, margin: '0 auto', textAlign: 'center' }}>
        <p
          className="violet-sun-italic-serif"
          style={{ color: VS_SALES.VIO_700, fontSize: '1.4rem', marginBottom: '0.6rem' }}
        >
          {i.eyebrow}
        </p>
        <h2
          className="violet-sun-display"
          style={{
            fontWeight: 700,
            fontSize: 'clamp(1.85rem, 3.2vw, 2.6rem)',
            color: VS_SALES.INK_900,
            lineHeight: 1.14,
            marginBottom: '1.75rem',
          }}
        >
          {i.headline}
        </h2>
        {i.paragraphs.map((p, idx) => (
          <p
            key={idx}
            style={{
              color: VS_SALES.INK_700,
              fontSize: '1.1rem',
              lineHeight: 1.72,
              marginBottom: '1rem',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}

/* VIP BONUSES — mist-50 background, mist-gradient icon tiles, white cards. */
function VipBonuses({ content }: { content: VioletSunContent }) {
  if (!content.vipBonuses) return null;
  const v = content.vipBonuses;
  return (
    <section style={{ padding: '4rem 1.25rem', background: VS_SALES.MIST_50 }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
          <p
            className="violet-sun-italic-serif"
            style={{ color: VS_SALES.VIO_700, fontSize: '1.35rem', marginBottom: '0.35rem' }}
          >
            {v.eyebrow}
          </p>
          <h2
            className="violet-sun-display"
            style={{
              fontWeight: 700,
              fontSize: 'clamp(1.85rem, 3.2vw, 2.6rem)',
              color: VS_SALES.INK_900,
              lineHeight: 1.14,
            }}
          >
            {v.headline}
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.35rem' }}>
          {v.items.map((item, i) => (
            <div
              key={i}
              className="violet-sun-card-light"
              style={{
                overflow: 'hidden',
                position: 'relative',
                background: '#FFFFFF',
                borderRadius: 20,
                border: `1px solid ${VS_SALES.MIST_100}`,
              }}
            >
              <div
                style={{
                  background: `linear-gradient(135deg, ${VS_SALES.MIST_50}, ${VS_SALES.MIST_300})`,
                  aspectRatio: '16/10',
                  display: 'grid',
                  placeItems: 'center',
                  color: VS_SALES.VIO_700,
                  padding: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.55rem' }}>
                  <VsSalesBonusIcon icon={item.icon} />
                  <span
                    className="violet-sun-italic-serif"
                    style={{ fontSize: '1.15rem', textAlign: 'center' }}
                  >
                    {vsSalesIconLabels[item.icon]}
                  </span>
                </div>
              </div>
              <div style={{ padding: '1.5rem 1.5rem 1.25rem' }}>
                <h3
                  className="violet-sun-display"
                  style={{ fontWeight: 700, fontSize: '1.05rem', color: VS_SALES.INK_900, marginBottom: '0.45rem' }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: VS_SALES.INK_600,
                    lineHeight: 1.6,
                    marginBottom: '0.85rem',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {item.description}
                </p>
                <span
                  style={{
                    display: 'inline-block',
                    background: VS_SALES.VIO_50,
                    border: `1px solid ${VS_SALES.VIO_200}`,
                    color: VS_SALES.VIO_700,
                    fontWeight: 700,
                    fontSize: '.7rem',
                    letterSpacing: '.12em',
                    padding: '.35rem .75rem',
                    borderRadius: 9999,
                    fontFamily: "'Inter', sans-serif",
                    textTransform: 'uppercase',
                  }}
                >
                  {item.valueLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* FREE GIFTS — sun-100 background tiles, deep-red gift-number label. */
function FreeGifts({ content }: { content: VioletSunContent }) {
  if (!content.freeGifts) return null;
  const fg = content.freeGifts;
  return (
    <section style={{ padding: '4rem 1.25rem', background: '#FFFFFF' }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
          <p
            className="violet-sun-italic-serif"
            style={{ color: VS_SALES.VIO_700, fontSize: '1.35rem', marginBottom: '0.35rem' }}
          >
            {fg.eyebrow}
          </p>
          <h2
            className="violet-sun-display"
            style={{
              fontWeight: 700,
              fontSize: 'clamp(1.85rem, 3.2vw, 2.6rem)',
              color: VS_SALES.INK_900,
              lineHeight: 1.14,
            }}
          >
            {fg.headline}
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '1.35rem' }}>
          {fg.items.map((gift, i) => (
            <div
              key={i}
              style={{
                background: VS_SALES.SUN_100,
                border: `1px solid ${VS_SALES.SUN_300}`,
                borderRadius: 20,
                boxShadow: '0 12px 28px -16px rgba(255,195,0,.4)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  background: `linear-gradient(135deg, ${VS_SALES.SUN_100}, ${VS_SALES.SUN_400})`,
                  aspectRatio: '16/10',
                  display: 'grid',
                  placeItems: 'center',
                  color: VS_SALES.INK_900,
                  padding: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.55rem' }}>
                  <VsGiftIcon size={40} color={VS_SALES.INK_900} />
                  <span className="violet-sun-italic-serif" style={{ fontSize: '1.15rem' }}>
                    Free Gift #{gift.giftNumber}
                  </span>
                </div>
              </div>
              <div style={{ padding: '1.5rem 1.5rem 1.25rem' }}>
                <p
                  className="violet-sun-eyebrow"
                  style={{ color: '#DC2626', marginBottom: '0.35rem' }}
                >
                  Free Gift #{gift.giftNumber}
                </p>
                <h3
                  className="violet-sun-display"
                  style={{ fontWeight: 700, fontSize: '1.05rem', color: VS_SALES.INK_900, marginBottom: '0.45rem' }}
                >
                  {gift.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: VS_SALES.INK_600,
                    lineHeight: 1.6,
                    marginBottom: '0.85rem',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {gift.description}
                </p>
                <span
                  style={{
                    display: 'inline-block',
                    background: '#FFFFFF',
                    border: `1px solid ${VS_SALES.SUN_300}`,
                    color: VS_SALES.INK_900,
                    fontWeight: 700,
                    fontSize: '.7rem',
                    letterSpacing: '.12em',
                    padding: '.35rem .75rem',
                    borderRadius: 9999,
                    fontFamily: "'Inter', sans-serif",
                    textTransform: 'uppercase',
                  }}
                >
                  {gift.valueLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p
          style={{
            textAlign: 'center',
            marginTop: '1.75rem',
            fontSize: '0.9rem',
            color: VS_SALES.INK_700,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {fg.deliveryNote}
        </p>
      </div>
    </section>
  );
}

/* UPGRADE SECTION — centered preamble on mist background. */
function UpgradeSection({ content }: { content: VioletSunContent }) {
  if (!content.upgradeSection) return null;
  const u = content.upgradeSection;
  return (
    <section style={{ padding: '4rem 1.25rem', background: VS_SALES.MIST_50 }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ textAlign: 'center' }}>
          <p
            className="violet-sun-italic-serif"
            style={{ color: VS_SALES.VIO_700, fontSize: '1.35rem', marginBottom: '0.35rem' }}
          >
            {u.eyebrow}
          </p>
          <h2
            className="violet-sun-display"
            style={{
              fontWeight: 700,
              fontSize: 'clamp(1.85rem, 3.2vw, 2.6rem)',
              color: VS_SALES.INK_900,
              lineHeight: 1.14,
              marginBottom: '1.75rem',
            }}
          >
            {u.headline}
          </h2>
          {u.paragraphs.map((p, i) => (
            <p
              key={i}
              style={{
                color: VS_SALES.INK_700,
                fontSize: '1rem',
                lineHeight: 1.72,
                maxWidth: 700,
                margin: '0 auto 0.85rem',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

/* PRICE CARD — white card with violet border, sun-accent stripe, green price. */
function PriceCard({ content }: { content: VioletSunContent }) {
  if (!content.priceCard) return null;
  const p = content.priceCard;
  return (
    <section style={{ padding: '4rem 1.25rem', background: '#FFFFFF' }} id="purchase">
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div
          style={{
            background: '#FFFFFF',
            border: `2px solid ${VS_SALES.VIO_200}`,
            borderRadius: 28,
            boxShadow: '0 32px 60px -30px rgba(74,47,184,.4)',
            padding: '2rem 1.75rem',
            position: 'relative',
            overflow: 'hidden',
            maxWidth: 500,
            width: '100%',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: 6,
              background: `linear-gradient(90deg, ${VS_SALES.VIO_500}, ${VS_SALES.SUN_500}, ${VS_SALES.VIO_500})`,
            }}
          />

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#DC2626',
              color: '#FFFFFF',
              padding: '.4rem .9rem',
              borderRadius: 9999,
              fontWeight: 700,
              fontSize: '.72rem',
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              marginBottom: '0.85rem',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {p.badge}
          </div>

          <h3
            className="violet-sun-display"
            style={{ fontWeight: 700, fontSize: '1.25rem', color: VS_SALES.INK_900, marginBottom: '0.55rem', lineHeight: 1.28 }}
          >
            {p.headline}
          </h3>
          <p
            style={{
              fontSize: '0.9rem',
              color: VS_SALES.INK_600,
              marginBottom: '0.6rem',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {p.note}
          </p>

          <ul style={{ padding: 0, listStyle: 'none', margin: '1.1rem 0 1.4rem' }}>
            {p.features.map((f, i) => (
              <li
                key={i}
                style={{
                  display: 'flex',
                  gap: '0.65rem',
                  alignItems: 'flex-start',
                  padding: '0.4rem 0',
                  fontSize: '0.95rem',
                  color: VS_SALES.INK_700,
                  lineHeight: 1.48,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <VsCheckIcon />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <div
            style={{
              background: VS_SALES.SUN_100,
              border: `1px solid ${VS_SALES.SUN_300}`,
              borderRadius: 14,
              padding: '0.9rem 1.1rem',
              marginBottom: '1.4rem',
            }}
          >
            <p
              style={{
                fontWeight: 700,
                fontSize: '0.85rem',
                color: VS_SALES.INK_900,
                marginBottom: '0.55rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <VsGiftIcon size={16} color={VS_SALES.INK_900} /> {p.giftsBoxTitle}
            </p>
            {p.giftItems.map((g, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: '0.55rem',
                  alignItems: 'flex-start',
                  fontSize: '0.9rem',
                  padding: '0.3rem 0',
                  color: VS_SALES.INK_700,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <VsCheckIcon />
                <span>{g}</span>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', borderTop: `1px solid ${VS_SALES.MIST_100}`, paddingTop: '1.4rem' }}>
            <p
              style={{
                color: VS_SALES.VIO_700,
                textDecoration: 'line-through',
                fontWeight: 500,
                fontSize: '0.95rem',
                marginBottom: '0.3rem',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Total value: {p.totalValue} — Regular price: {p.regularPrice}
            </p>
            <p
              className="violet-sun-display"
              style={{
                fontSize: '2.8rem',
                fontWeight: 800,
                color: '#16A34A',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}
            >
              {p.currentPrice}
            </p>
            <p
              style={{
                fontSize: '0.88rem',
                color: '#16A34A',
                fontWeight: 600,
                marginBottom: '1.1rem',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {p.savings}
            </p>
            <a
              href="#purchase"
              className="violet-sun-btn-sun violet-sun-btn-sun-pulse"
              style={{ fontSize: '1.05rem', padding: '1.1rem 2.25rem' }}
            >
              {p.ctaLabel} <VsArrowRight size={20} />
            </a>
            <p
              style={{
                marginTop: '0.85rem',
                fontSize: '0.78rem',
                color: VS_SALES.VIO_700,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {p.guarantee}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* SALES SPEAKERS — <details> cards with photo/initials avatar + bio toggle. */
function SalesSpeakers({ content, speakers }: { content: VioletSunContent; speakers: Record<string, Speaker> }) {
  if (!content.salesSpeakers) return null;
  const s = content.salesSpeakers;
  const sortedSpeakers = Object.values(speakers).sort((a, b) => a.sortOrder - b.sortOrder);
  if (sortedSpeakers.length === 0) return null;
  return (
    <section style={{ padding: '4rem 1.25rem', background: '#FFFFFF' }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
          <p
            className="violet-sun-italic-serif"
            style={{ color: VS_SALES.VIO_700, fontSize: '1.35rem', marginBottom: '0.35rem' }}
          >
            {s.eyebrow}
          </p>
          <h2
            className="violet-sun-display"
            style={{
              fontWeight: 700,
              fontSize: 'clamp(1.85rem, 3.2vw, 2.6rem)',
              color: VS_SALES.INK_900,
              lineHeight: 1.14,
            }}
          >
            {s.headline}
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1.1rem' }}>
          {sortedSpeakers.map((spk, idx) => (
            <details
              key={spk.id}
              style={{
                background: '#FFFFFF',
                border: `1px solid ${VS_SALES.MIST_100}`,
                borderRadius: 18,
                boxShadow: '0 8px 22px -12px rgba(74,47,184,.22)',
                marginBottom: 0,
                overflow: 'hidden',
              }}
            >
              <summary
                style={{
                  cursor: 'pointer',
                  listStyle: 'none',
                  padding: '1.5rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '0.85rem',
                }}
              >
                {spk.photoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={spk.photoUrl}
                    alt={displayName(spk)}
                    style={{
                      width: 88,
                      height: 88,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: `3px solid ${VS_SALES.VIO_200}`,
                      boxShadow: `0 0 0 4px #FFFFFF, 0 8px 18px -6px rgba(74,47,184,.35)`,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 88,
                      height: 88,
                      borderRadius: '50%',
                      background: SPEAKER_GRADIENTS[idx % SPEAKER_GRADIENTS.length],
                      border: `3px solid ${VS_SALES.VIO_200}`,
                      display: 'grid',
                      placeItems: 'center',
                      color: SPEAKER_INITIAL_COLORS[idx % SPEAKER_INITIAL_COLORS.length],
                      fontFamily: "'DM Serif Display', serif",
                      fontSize: '1.9rem',
                      fontStyle: 'italic',
                    }}
                  >
                    {initialsFromSpeaker(spk)}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <p
                    className="violet-sun-display"
                    style={{ fontWeight: 700, fontSize: '0.98rem', color: VS_SALES.INK_900, margin: 0 }}
                  >
                    {displayName(spk)}
                  </p>
                  <p style={{ fontSize: '0.78rem', color: VS_SALES.VIO_700, margin: 0, fontFamily: "'Inter', sans-serif" }}>
                    {spk.title}
                  </p>
                  <p
                    className="violet-sun-italic-serif"
                    style={{ fontSize: '0.85rem', color: VS_SALES.INK_700, margin: 0 }}
                  >
                    {spk.masterclassTitle}
                  </p>
                </div>
              </summary>
              {spk.shortBio && (
                <p
                  style={{
                    padding: '0 1.5rem 1.5rem',
                    color: VS_SALES.INK_600,
                    fontSize: '0.88rem',
                    lineHeight: 1.65,
                    margin: 0,
                    textAlign: 'center',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {spk.shortBio}
                </p>
              )}
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* COMPARISON TABLE — Free Pass vs VIP Pass with mist header row. */
function ComparisonTable({ content }: { content: VioletSunContent }) {
  if (!content.comparisonTable) return null;
  const c = content.comparisonTable;
  return (
    <section style={{ padding: '4rem 1.25rem', background: VS_SALES.MIST_50 }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
          <p
            className="violet-sun-italic-serif"
            style={{ color: VS_SALES.VIO_700, fontSize: '1.35rem', marginBottom: '0.35rem' }}
          >
            {c.eyebrow}
          </p>
          <h2
            className="violet-sun-display"
            style={{
              fontWeight: 700,
              fontSize: 'clamp(1.85rem, 3.2vw, 2.6rem)',
              color: VS_SALES.INK_900,
              lineHeight: 1.14,
            }}
          >
            {c.headline}
          </h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: 0,
              borderRadius: 20,
              overflow: 'hidden',
              border: `1px solid ${VS_SALES.MIST_100}`,
              background: '#FFFFFF',
            }}
          >
            <thead>
              <tr>
                <th
                  className="violet-sun-eyebrow"
                  style={{
                    background: VS_SALES.MIST_100,
                    color: VS_SALES.VIO_700,
                    padding: '1.1rem',
                    textAlign: 'left',
                  }}
                >
                  Feature
                </th>
                <th
                  className="violet-sun-eyebrow"
                  style={{
                    background: VS_SALES.MIST_200,
                    color: VS_SALES.VIO_700,
                    padding: '1.1rem',
                    textAlign: 'center',
                  }}
                >
                  Free Pass
                </th>
                <th
                  className="violet-sun-eyebrow"
                  style={{
                    background: VS_SALES.MIST_200,
                    color: VS_SALES.VIO_700,
                    padding: '1.1rem',
                    textAlign: 'center',
                  }}
                >
                  VIP Pass
                </th>
              </tr>
            </thead>
            <tbody>
              {c.rows.map((row, i) => (
                <tr key={i}>
                  <td
                    style={{
                      padding: '1rem',
                      borderTop: `1px solid ${VS_SALES.MIST_100}`,
                      fontWeight: 600,
                      color: VS_SALES.INK_900,
                      fontSize: '0.95rem',
                      lineHeight: 1.4,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {row.label}
                  </td>
                  <td
                    style={{
                      padding: '1rem',
                      borderTop: `1px solid ${VS_SALES.MIST_100}`,
                      textAlign: 'center',
                    }}
                  >
                    {row.freePass ? (
                      <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: '#DCFCE7', color: '#16A34A' }}>
                        <VsCheckIcon />
                      </span>
                    ) : (
                      <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: '#FEE2E2', color: '#DC2626' }}>
                        <VsXIcon />
                      </span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: '1rem',
                      borderTop: `1px solid ${VS_SALES.MIST_100}`,
                      textAlign: 'center',
                    }}
                  >
                    {row.vipPass ? (
                      <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: '#DCFCE7', color: '#16A34A' }}>
                        <VsCheckIcon />
                      </span>
                    ) : (
                      <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: '#FEE2E2', color: '#DC2626' }}>
                        <VsXIcon />
                      </span>
                    )}
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

/* GUARANTEE — dashed sun-yellow shield card with heading + body. */
function Guarantee({ content }: { content: VioletSunContent }) {
  if (!content.guarantee) return null;
  const g = content.guarantee;
  return (
    <section style={{ padding: '4rem 1.25rem', background: VS_SALES.MIST_50 }}>
      <div style={{ maxWidth: 740, margin: '0 auto' }}>
        <div
          style={{
            background: VS_SALES.SUN_100,
            border: `2px dashed ${VS_SALES.SUN_500}`,
            borderRadius: 22,
            padding: '1.9rem',
            display: 'flex',
            gap: '1.35rem',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '3rem', flexShrink: 0 }}>🛡️</div>
          <div>
            <h3
              className="violet-sun-display"
              style={{ fontWeight: 700, fontSize: '1.15rem', color: VS_SALES.INK_900, marginBottom: '0.5rem' }}
            >
              {g.heading}
            </h3>
            <p
              style={{
                fontSize: '0.95rem',
                color: VS_SALES.INK_700,
                lineHeight: 1.65,
                margin: 0,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {g.body}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* WHY SECTION — centered editorial body with italic-serif subhead. */
function WhySection({ content }: { content: VioletSunContent }) {
  if (!content.whySection) return null;
  const w = content.whySection;
  return (
    <section style={{ padding: '4rem 1.25rem', background: '#FFFFFF' }}>
      <div style={{ maxWidth: 740, margin: '0 auto', textAlign: 'center' }}>
        <h2
          className="violet-sun-display"
          style={{
            fontWeight: 700,
            fontSize: 'clamp(1.85rem, 3.2vw, 2.6rem)',
            color: VS_SALES.INK_900,
            lineHeight: 1.14,
            marginBottom: '0.6rem',
          }}
        >
          {w.headline}
        </h2>
        <p
          className="violet-sun-italic-serif"
          style={{ fontSize: '1.4rem', color: VS_SALES.VIO_700, marginBottom: '1.75rem' }}
        >
          {w.subheadline}
        </p>
        {w.paragraphs.map((p, i) => (
          <p
            key={i}
            style={{
              color: VS_SALES.INK_700,
              fontSize: '1rem',
              lineHeight: 1.78,
              marginBottom: '1rem',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}

/* ============== ROOT COMPONENT ============== */
export function VioletSun({ content, speakers, funnelId, enabledSections }: RootProps) {
  const enabled = new Set(enabledSections ?? violetSunDefaultEnabledSections);
  return (
    <div className="violet-sun-root violet-sun-body antialiased">
      <a href="#main" className="violet-sun-skip-nav">
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
