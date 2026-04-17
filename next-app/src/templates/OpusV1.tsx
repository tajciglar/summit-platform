// Document chrome (html/head/body) is owned by the Next.js page/layout that
// renders this template. Fonts (Fraunces / Source Serif 4 / Inter) must be
// loaded by the page — see Task 19/20 (preview/public routes) for wiring.
import { OptinModal } from '@/components/OptinModal';
import type { OpusV1Content } from './opus-v1.schema';
import type { Speaker } from './types';

type Props = {
  content: OpusV1Content;
  speakers: Record<string, Speaker>;
};

type RootProps = Props & {
  funnelId: string;
};

type HeroPortrait = {
  initials: string;
  name: string;
  specialty: string;
  gradient: string;
};

// Visual gradients for portrait placeholders — deterministic, cycled by index.
const PORTRAIT_GRADIENTS = [
  'linear-gradient(160deg,#8A4E5D,#4A1F2D)',
  'linear-gradient(160deg,#C9812A,#A6691F)',
  'linear-gradient(160deg,#6B3340,#8A4E5D)',
  'linear-gradient(160deg,#4F4238,#6B5B4E)',
  'linear-gradient(160deg,#4A1F2D,#2A0F17)',
  'linear-gradient(160deg,#8A4E5D,#6B3340)',
  'linear-gradient(160deg,#D9963F,#C9812A)',
  'linear-gradient(160deg,#A6691F,#6B5B4E)',
];

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#4A1F2D,#8A4E5D)',
  'linear-gradient(135deg,#C9812A,#A6691F)',
  'linear-gradient(135deg,#6B3340,#4A1F2D)',
  'linear-gradient(135deg,#4F4238,#6B5B4E)',
];

const FOUNDER_GRADIENTS = [
  'linear-gradient(135deg,#4A1F2D,#2A0F17)',
  'linear-gradient(135deg,#C9812A,#A6691F)',
];

const TESTIMONIAL_GRADIENTS = [
  'linear-gradient(135deg,#4A1F2D,#8A4E5D)',
  'linear-gradient(135deg,#C9812A,#A6691F)',
  'linear-gradient(135deg,#6B3340,#4F4238)',
];

function initialsFromSpeaker(s: Speaker): string {
  const a = s.firstName?.trim()?.[0] ?? '';
  const b = s.lastName?.trim()?.[0] ?? '';
  return (a + b).toUpperCase() || '??';
}

function displayName(s: Speaker): string {
  return `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() || '—';
}

/* ============== MASTHEAD ============== */
function Masthead({ content }: { content: OpusV1Content }) {
  return (
    <header className="sticky top-0 z-40 bg-paper-100/95 backdrop-blur border-b border-paper-300">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-baseline gap-4">
          <span className="font-display font-black text-xl text-ink-700 tracking-tight">
            {content.summit.name}
          </span>
          <span className="hidden md:inline text-taupe-600 font-opus-serif italic text-sm">
            {content.masthead.volume}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="eyebrow text-taupe-600 hidden md:inline">
            {content.masthead.eyebrow}
          </span>
          <a
            href="#optin"
            className="bg-ink-700 hover:bg-ink-900 text-paper-50 font-ui font-semibold text-sm px-5 py-2.5 rounded-full transition"
          >
            {content.hero.ctaLabel}
          </a>
        </div>
      </div>
    </header>
  );
}

/* ============== HERO ============== */
function Hero({ content, speakers }: Props) {
  const heroSpeakers: HeroPortrait[] = content.hero.heroSpeakerIds
    .map((id, idx) => {
      const s = speakers[id];
      if (!s) return null;
      return {
        initials: initialsFromSpeaker(s),
        name: displayName(s),
        specialty: s.title ?? '',
        gradient: PORTRAIT_GRADIENTS[idx % PORTRAIT_GRADIENTS.length],
      };
    })
    .filter((p): p is HeroPortrait => Boolean(p));

  return (
    <section className="bg-paper-100 pt-14 md:pt-20 pb-16 md:pb-24 border-b border-paper-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10 pb-4 rule">
          <div className="flex items-center gap-6">
            <span className="figure-label">{content.hero.issueLabel}</span>
            <span className="figure-label">{content.hero.dateRangeLabel}</span>
            <span className="figure-label hidden md:inline">{content.hero.metaLabel}</span>
          </div>
          <span className="figure-label">{content.hero.readerCount}</span>
        </div>

        <div className="grid md:grid-cols-12 gap-10 md:gap-14 items-start">
          <div className="md:col-span-7">
            <p className="eyebrow text-ochre-700 mb-5">{content.hero.eyebrow}</p>
            <h1 className="font-display font-black text-[2.5rem] md:text-6xl lg:text-7xl text-ink-700 leading-[1.02] tracking-[-0.02em] mb-8">
              {content.hero.headline}
            </h1>
            <p className="text-taupe-700 text-lg md:text-xl leading-[1.55] mb-8 max-w-xl">
              {content.hero.subheadline}
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-10">
              <a
                href="#optin"
                className="inline-flex items-center gap-3 bg-ink-700 hover:bg-ink-900 text-paper-50 font-ui font-semibold px-8 py-4 rounded-full transition"
              >
                {content.hero.ctaLabel}
                <span className="text-ochre-400 text-xl leading-none">→</span>
              </a>
              {content.hero.ctaSubtext ? (
                <p className="text-taupe-600 text-sm font-opus-serif italic max-w-xs">
                  {content.hero.ctaSubtext}
                </p>
              ) : null}
            </div>

            <div className="flex items-center gap-4 pt-6 border-t border-paper-300">
              <div className="flex -space-x-3">
                {heroSpeakers.slice(0, 4).map((p, idx) => (
                  <div
                    key={`${p.initials}-${idx}`}
                    className="w-10 h-10 rounded-full border-2 border-paper-100 flex items-center justify-center font-display font-bold text-xs text-paper-50"
                    style={{ background: AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length] }}
                  >
                    {p.initials}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <p className="text-ochre-600 text-xs tracking-wide">★ ★ ★ ★ ★</p>
                <p className="text-taupe-700 font-opus-serif italic">{content.hero.ratingText}</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {heroSpeakers.map((p, idx) => {
                const offset = ['', 'mt-8', '-mt-4', 'mt-4'][idx] ?? '';
                return (
                  <figure key={`hero-portrait-${idx}`} className={`portrait ${offset}`.trim()}>
                    <div className="aspect-[3/4]" style={{ background: p.gradient }}>
                      <div className="w-full h-full flex items-end justify-start p-4">
                        <span className="font-display font-black text-paper-50/70 text-5xl">
                          {p.initials}
                        </span>
                      </div>
                    </div>
                    <figcaption className="pt-2 pb-1">
                      <p className="font-display font-bold text-sm text-ink-700">{p.name}</p>
                      {p.specialty ? <p className="figure-label">{p.specialty}</p> : null}
                    </figcaption>
                  </figure>
                );
              })}
            </div>
            <p className="figure-label mt-5 text-right">{content.hero.figCaption}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============== FEATURED IN MARQUEE ============== */
function FeaturedIn({ content }: { content: OpusV1Content }) {
  // Duplicate items to make the marquee loop seamlessly.
  const items = [...content.featuredIn, ...content.featuredIn];
  return (
    <section className="bg-paper-50 py-10 border-b border-paper-300">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center figure-label mb-6">As Featured In</p>
        <div className="marquee-wrap">
          <div className="marquee-track">
            {items.map((name, idx) => (
              <span className="marquee-item" key={`featured-${idx}`}>
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============== STATS — BY THE NUMBERS ============== */
function Stats({ content }: { content: OpusV1Content }) {
  const sp = content.socialProof;
  return (
    <section className="bg-paper-100 py-16 md:py-24 border-b border-paper-300">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center figure-label mb-10">By the Numbers</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-4 text-center">
          <div className="md:border-r md:border-paper-300 md:pr-4">
            <p className="font-display font-black text-7xl md:text-8xl text-ink-700 leading-none mb-3">
              {sp.statValue1}
            </p>
            <p className="font-opus-serif italic text-taupe-700 text-lg">{sp.statLabel1}</p>
          </div>
          <div className="md:border-r md:border-paper-300 md:pr-4">
            <p className="font-display font-black text-7xl md:text-8xl text-ochre-600 leading-none mb-3">
              {sp.statValue2}
            </p>
            <p className="font-opus-serif italic text-taupe-700 text-lg">{sp.statLabel2}</p>
          </div>
          <div>
            <p className="font-display font-black text-7xl md:text-8xl text-ink-700 leading-none mb-3">
              {sp.statValue3}
            </p>
            <p className="font-opus-serif italic text-taupe-700 text-lg">{sp.statLabel3}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============== WHAT IS THIS (II) ============== */
function WhatIsThis({ content }: { content: OpusV1Content }) {
  const essay = content.whatIsThis;
  return (
    <section id="what-is-this" className="bg-paper-50 py-20 md:py-28 border-b border-paper-300">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-start">
        <div className="md:col-span-7">
          <p className="roman mb-4">{essay.roman}</p>
          <h2 className="font-display font-black text-4xl md:text-5xl text-ink-700 leading-tight mb-8">
            {essay.headline}
          </h2>
          {essay.bodyParagraphs.map((para, idx) => (
            <p
              key={`essay-${idx}`}
              className={
                idx === 0
                  ? 'dropcap text-lg leading-[1.75] text-taupe-700 mb-6'
                  : 'text-lg leading-[1.75] text-taupe-700 mb-8'
              }
            >
              {para}
            </p>
          ))}
          <a
            href="#optin"
            className="inline-flex items-center gap-2 font-ui font-semibold text-ink-700 border-b-2 border-ochre-600 pb-1 hover:text-ochre-700 transition"
          >
            {essay.ctaLabel}
            <span className="text-ochre-600">→</span>
          </a>
        </div>

        <aside className="md:col-span-5 md:pl-8 md:border-l md:border-paper-300">
          <p className="figure-label mb-6">{content.featureBand.eyebrow}</p>
          <div className="space-y-5 font-opus-serif text-taupe-700">
            {content.featureBand.bullets.map((bullet, idx) => (
              <div key={`editor-note-${idx}`} className="flex items-start gap-4">
                <span className="font-display font-black text-ochre-600 text-3xl leading-none pt-1">
                  {idx + 1}.
                </span>
                <p>{bullet}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

/* ============== CONTRIBUTORS BY DAY (III) ============== */
function ContributorsByDay({ content, speakers }: Props) {
  return (
    <>
      {content.speakersByDay.map((day, dayIdx) => {
        const daySpeakers = day.speakerIds
          .map((id) => speakers[id])
          .filter((s): s is Speaker => Boolean(s));

        return (
          <section
            key={`day-${dayIdx}`}
            className="bg-paper-100 py-20 md:py-28 border-b border-paper-300"
          >
            <div className="max-w-6xl mx-auto px-6">
              <div className="flex items-baseline justify-between mb-10 pb-4 rule">
                <div>
                  {day.roman ? <p className="roman mb-2">{day.roman}</p> : null}
                  <h2 className="font-display font-black text-4xl md:text-5xl text-ink-700">
                    {day.dayLabel}
                  </h2>
                </div>
                {day.dayTheme ? (
                  <p className="figure-label hidden md:block">{day.dayTheme}</p>
                ) : null}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
                {daySpeakers.map((s, idx) => (
                  <figure key={s.id}>
                    <div
                      className="portrait aspect-[4/5]"
                      style={{
                        background: PORTRAIT_GRADIENTS[idx % PORTRAIT_GRADIENTS.length],
                      }}
                    >
                      <div className="w-full h-full flex items-end justify-center pb-6">
                        <span className="font-display font-black text-paper-50/70 text-4xl">
                          {initialsFromSpeaker(s)}
                        </span>
                      </div>
                    </div>
                    <figcaption className="pt-3">
                      <p className="font-display font-bold text-ink-700">{displayName(s)}</p>
                      {s.title ? (
                        <p className="font-opus-serif italic text-sm text-taupe-600">{s.title}</p>
                      ) : null}
                    </figcaption>
                  </figure>
                ))}
              </div>

              <div className="mt-12 text-center">
                <a
                  href="#optin"
                  className="font-ui font-semibold text-ochre-700 hover:text-ochre-600 border-b border-ochre-700 pb-1 text-sm"
                >
                  {content.hero.ctaLabel} &mdash; register free
                </a>
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}

/* ============== TRANSFORMATIONS (IV) ============== */
function Transformations({ content }: { content: OpusV1Content }) {
  const t = content.transformations;
  const ROMAN = ['I.', 'II.', 'III.', 'IV.', 'V.', 'VI.'];
  return (
    <section className="bg-paper-50 py-20 md:py-28 border-b border-paper-300">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-3xl mb-14">
          <p className="roman mb-3">{t.roman}</p>
          <h2 className="font-display font-black text-4xl md:text-5xl text-ink-700 leading-tight">
            {t.headline}
          </h2>
          <p className="font-opus-serif italic text-taupe-600 text-lg mt-4">{t.subhead}</p>
        </div>
        <ol className="grid md:grid-cols-2 gap-x-12 gap-y-10">
          {t.items.map((item, idx) => (
            <li key={`transformation-${idx}`} className="flex gap-6">
              <span className="roman text-4xl leading-none pt-1">{ROMAN[idx] ?? `${idx + 1}.`}</span>
              <div>
                <h3 className="font-display font-bold text-xl text-ink-700 mb-2">{item.title}</h3>
                <p className="text-taupe-700 leading-relaxed">{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ============== SUPPLEMENT / FREE GIFT ============== */
function Supplement({ content }: { content: OpusV1Content }) {
  const s = content.supplement;
  return (
    <section className="bg-paper-100 py-20 md:py-28 border-b border-paper-300">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-5 flex justify-center">
          <div className="relative">
            <div className="w-64 h-80 bg-paper-50 deckle rounded-sm shadow-[0_30px_60px_-20px_rgba(42,15,23,0.3)] border border-paper-300 p-8 flex flex-col justify-between transform -rotate-2">
              <div>
                <p className="figure-label text-ochre-700 mb-3">{s.cardLabel}</p>
                <div className="w-12 h-[2px] bg-ochre-600 mb-5"></div>
                <h3 className="font-display font-black text-2xl text-ink-700 leading-tight">
                  {s.cardTitle}
                </h3>
              </div>
              <div>
                <p className="font-opus-serif italic text-taupe-600 text-sm">{s.cardFooter}</p>
                <p className="figure-label mt-3 text-taupe-500">{s.cardVolume}</p>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 bg-ochre-600 text-paper-50 font-display font-black text-xs px-4 py-2 rounded-sm transform rotate-3 shadow-lg">
              {s.badgeLabel}
            </div>
          </div>
        </div>
        <div className="md:col-span-7">
          <p className="eyebrow text-ochre-700 mb-3">{s.eyebrow}</p>
          <h2 className="font-display font-black text-4xl md:text-5xl text-ink-700 leading-tight mb-5">
            {s.headline}
          </h2>
          <p className="text-lg text-taupe-700 leading-relaxed mb-6">{s.body}</p>
          <ul className="space-y-3 mb-8">
            {s.bullets.map((bullet, idx) => (
              <li key={`supplement-bullet-${idx}`} className="flex items-start gap-3 text-taupe-700 font-opus-serif">
                <span className="text-ochre-600 font-display font-bold shrink-0">§</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
          <a
            href="#optin"
            className="inline-flex items-center gap-3 bg-ink-700 hover:bg-ink-900 text-paper-50 font-ui font-semibold px-7 py-3.5 rounded-full transition"
          >
            {s.ctaLabel}
            <span className="text-ochre-400">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============== BONUS SIDEBARS (V) ============== */
function BonusSidebars({ content }: { content: OpusV1Content }) {
  const section = content.bonusStackSection;
  const ROMAN = ['Sidebar I', 'Sidebar II', 'Sidebar III', 'Sidebar IV', 'Sidebar V'];
  return (
    <section className="bg-paper-50 py-20 md:py-28 border-b border-paper-300">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="roman mb-2">{section.roman}</p>
          <h2 className="font-display font-black text-4xl md:text-5xl text-ink-700 leading-tight mb-4">
            {section.headline}
          </h2>
          <p className="font-opus-serif italic text-taupe-600 text-lg">{section.subhead}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {content.bonusStack.map((bonus, idx) => (
            <article key={`bonus-${idx}`} className="bg-paper-100 border border-paper-300 p-8">
              <div className="flex items-center justify-between mb-5">
                <span className="figure-label">{ROMAN[idx] ?? `Sidebar ${idx + 1}`}</span>
                <span className="bg-ochre-600 text-paper-50 font-display font-bold text-xs px-3 py-1">
                  {bonus.valueLabel}
                </span>
              </div>
              <h3 className="font-display font-black text-2xl text-ink-700 mb-3 leading-tight">
                {bonus.title}
              </h3>
              <p className="text-taupe-700 mb-5 leading-relaxed">{bonus.description}</p>
              {bonus.bullets && bonus.bullets.length > 0 ? (
                <ul className="space-y-2 text-sm font-opus-serif text-taupe-700">
                  {bonus.bullets.map((bullet, bIdx) => (
                    <li key={`bonus-${idx}-bullet-${bIdx}`} className="flex items-start gap-2">
                      <span className="text-ochre-600">§</span> {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
        <div className="text-center mt-12">
          <a
            href="#optin"
            className="inline-flex items-center gap-3 bg-ink-700 hover:bg-ink-900 text-paper-50 font-ui font-semibold px-10 py-4 rounded-full transition"
          >
            {section.ctaLabel}
            <span className="text-ochre-400">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============== FOUNDERS (VI) ============== */
function Founders({ content }: { content: OpusV1Content }) {
  const f = content.founders;
  return (
    <section className="bg-paper-100 py-20 md:py-28 border-b border-paper-300">
      <div className="max-w-5xl mx-auto px-6">
        <p className="roman text-center mb-2">{f.roman}</p>
        <h2 className="font-display font-black text-4xl md:text-5xl text-ink-700 text-center mb-14 leading-tight">
          {f.headline}
        </h2>
        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          {f.items.map((founder, idx) => (
            <div key={`founder-${idx}`} className="text-center md:text-left">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center font-display font-black text-2xl text-paper-50 mx-auto md:mx-0 mb-5"
                style={{ background: FOUNDER_GRADIENTS[idx % FOUNDER_GRADIENTS.length] }}
              >
                {founder.initials}
              </div>
              <h3 className="font-display font-bold text-xl text-ink-700 mb-1">{founder.name}</h3>
              <p className="figure-label mb-5">{founder.role}</p>
              <blockquote className="font-opus-serif italic text-taupe-700 text-lg leading-relaxed border-l-2 border-ochre-600 pl-5">
                {`\u201C${founder.quote}\u201D`}
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============== TESTIMONIALS (VII) ============== */
function Testimonials({ content }: { content: OpusV1Content }) {
  const t = content.testimonials;
  return (
    <section className="bg-paper-50 py-20 md:py-28 border-b border-paper-300">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="roman mb-2">{t.roman}</p>
          <h2 className="font-display font-black text-4xl md:text-5xl text-ink-700 leading-tight mb-4">
            {t.headline}
          </h2>
          <p className="font-opus-serif italic text-taupe-600 text-lg">{t.subhead}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {t.items.map((item, idx) => (
            <article key={`testimonial-${idx}`} className="bg-paper-100 border border-paper-300 p-8">
              <div className="text-ochre-600 font-display text-4xl leading-none mb-3">&ldquo;</div>
              <p className="font-opus-serif italic text-ink-700 text-lg leading-relaxed mb-6">
                {item.quote}
              </p>
              <div className="flex items-center gap-3 pt-5 border-t border-paper-300">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-xs text-paper-50"
                  style={{ background: TESTIMONIAL_GRADIENTS[idx % TESTIMONIAL_GRADIENTS.length] }}
                >
                  {item.initials}
                </div>
                <div>
                  <p className="font-display font-bold text-sm text-ink-700">{item.name}</p>
                  <p className="figure-label">{item.location}</p>
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
function PullQuote({ content }: { content: OpusV1Content }) {
  const pq = content.pullQuote;
  return (
    <section className="bg-ink-700 py-24 md:py-32 border-b-8 border-ochre-600">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <span className="pullmark block -mb-4">&ldquo;</span>
        <p className="font-display font-black text-3xl md:text-5xl text-paper-50 leading-[1.15] mb-8 italic">
          {pq.quote}
        </p>
        <div className="inline-flex items-center gap-4">
          <span className="w-12 h-[1px] bg-ochre-500"></span>
          <p className="figure-label text-ochre-400">{pq.attribution}</p>
          <span className="w-12 h-[1px] bg-ochre-500"></span>
        </div>
      </div>
    </section>
  );
}

/* ============== FIGURES (VIII) ============== */
function Figures({ content }: { content: OpusV1Content }) {
  const f = content.figures;
  return (
    <section className="bg-paper-50 py-20 md:py-28 border-b border-paper-300">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mb-14">
          <p className="roman mb-2">{f.roman}</p>
          <h2 className="font-display font-black text-4xl md:text-5xl text-ink-700 leading-tight mb-4">
            {f.headline}
          </h2>
          <p className="font-opus-serif italic text-taupe-600 text-lg">{f.subhead}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-12">
          {f.items.map((item, idx) => {
            // Alternate ink/ochre colors roughly matching source (idx 1 and 4 are ochre).
            const valueColor =
              idx === 1 || idx === 4 ? 'text-ochre-600' : 'text-ink-700';
            return (
              <div key={`figure-${idx}`}>
                <p className="figure-label mb-2">{item.label}</p>
                <p
                  className={`font-display font-black text-5xl ${valueColor} mb-2 leading-none`}
                >
                  {item.value}
                </p>
                <p className="text-taupe-700 font-opus-serif leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============== SHIFTS (IX) ============== */
function Shifts({ content }: { content: OpusV1Content }) {
  const s = content.shifts;
  return (
    <section className="bg-paper-100 py-20 md:py-28 border-b border-paper-300">
      <div className="max-w-4xl mx-auto px-6">
        <p className="roman mb-2">{s.roman}</p>
        <h2 className="font-display font-black text-4xl md:text-5xl text-ink-700 leading-tight mb-14">
          {s.headline}
        </h2>
        <div className="space-y-12">
          {s.items.map((item, idx) => (
            <article key={`shift-${idx}`} className="flex gap-8 items-start">
              <span className="roman text-5xl leading-none shrink-0 pt-1">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="font-display font-bold text-2xl text-ink-700 mb-3">{item.title}</h3>
                <p className="text-taupe-700 text-lg leading-relaxed">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============== FAQ (X) ============== */
function FAQ({ content }: { content: OpusV1Content }) {
  return (
    <section className="bg-paper-50 py-20 md:py-28 border-b border-paper-300">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="roman mb-2">X.</p>
          <h2 className="font-display font-black text-4xl md:text-5xl text-ink-700 leading-tight">
            Questions, Answered
          </h2>
        </div>
        <div className="border-t border-paper-300">
          {content.faqs.map((faq, idx) => (
            <details key={`faq-${idx}`}>
              <summary>{faq.question}</summary>
              <div className="pb-5 text-taupe-700 font-opus-serif leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============== FINAL CTA ============== */
function FinalCTA({ content }: { content: OpusV1Content }) {
  const c = content.closing;
  return (
    <section className="bg-ink-700 py-24 md:py-32 border-b-8 border-ochre-600" id="final-cta">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {c.eyebrow ? <p className="eyebrow text-ochre-400 mb-6">{c.eyebrow}</p> : null}
        <h2 className="font-display font-black text-5xl md:text-6xl lg:text-7xl text-paper-50 leading-[1.05] mb-8 tracking-tight">
          {c.headline}
        </h2>
        <p className="font-opus-serif italic text-paper-200 text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
          {c.subheadline}
        </p>
        <a
          href="#optin"
          className="inline-flex items-center gap-3 bg-ochre-600 hover:bg-ochre-500 text-ink-700 font-ui font-bold text-lg px-10 py-5 rounded-full transition"
        >
          {c.ctaLabel}
          <span className="text-xl">→</span>
        </a>
        {c.fineprint ? <p className="figure-label mt-8 text-paper-400">{c.fineprint}</p> : null}
      </div>
    </section>
  );
}

/* ============== FOOTER ============== */
function Footer({ content }: { content: OpusV1Content }) {
  const f = content.footer;
  return (
    <footer className="bg-paper-100 py-14">
      <div className="max-w-6xl mx-auto px-6">
        <div className="rule pt-6 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="font-display font-black text-2xl text-ink-700 mb-2">
              {content.summit.name}
            </p>
            <p className="font-opus-serif italic text-taupe-600">{f.tagline}</p>
          </div>
          <div className="flex flex-col md:items-end gap-2">
            <p className="figure-label">{f.volume}</p>
            <p className="text-sm text-taupe-600 font-opus-serif">{f.copyright}</p>
            <p className="text-sm text-taupe-600 font-opus-serif">
              <a href="#" className="hover:text-ink-700 border-b border-paper-300">
                Privacy
              </a>
              &nbsp;·&nbsp;
              <a href="#" className="hover:text-ink-700 border-b border-paper-300">
                Terms
              </a>
              &nbsp;·&nbsp;
              <a href="#" className="hover:text-ink-700 border-b border-paper-300">
                Contact
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ============== ROOT COMPONENT ============== */
export function OpusV1({ content, speakers, funnelId }: RootProps) {
  return (
    <div className="opus-v1-root opus-v1-body antialiased">
      <a href="#main" className="skip-nav">
        Skip to content
      </a>

      <Masthead content={content} />

      <main id="main">
        <Hero content={content} speakers={speakers} />
        <FeaturedIn content={content} />
        <Stats content={content} />
        <WhatIsThis content={content} />
        <ContributorsByDay content={content} speakers={speakers} />
        <Transformations content={content} />
        <Supplement content={content} />
        <BonusSidebars content={content} />
        <Founders content={content} />
        <Testimonials content={content} />
        <PullQuote content={content} />
        <Figures content={content} />
        <Shifts content={content} />
        <FAQ content={content} />
        <FinalCTA content={content} />
      </main>

      <Footer content={content} />

      <OptinModal funnelId={funnelId} ctaLabel={content.hero.ctaLabel} />
    </div>
  );
}
