import type { HeroContent } from '../../../sections/hero.schema';
import type { Speaker } from '../../types';
import {
  AVATAR_GRADIENTS,
  PORTRAIT_GRADIENTS,
  displayName,
  initialsFromSpeaker,
} from './shared';

type Props = {
  content: HeroContent;
  speakers: Record<string, Speaker>;
};

type HeroPortrait = {
  initials: string;
  name: string;
  specialty: string;
  gradient: string;
};

export function Hero({ content, speakers }: Props) {
  const heroSpeakers: HeroPortrait[] = content.heroSpeakerIds
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
            <span className="figure-label">{content.issueLabel}</span>
            <span className="figure-label">{content.dateRangeLabel}</span>
            <span className="figure-label hidden md:inline">{content.metaLabel}</span>
          </div>
          <span className="figure-label">{content.readerCount}</span>
        </div>

        <div className="grid md:grid-cols-12 gap-10 md:gap-14 items-start">
          <div className="md:col-span-7">
            <p className="eyebrow text-ochre-700 mb-5">{content.eyebrow}</p>
            <h1 className="font-display font-black text-[2.5rem] md:text-6xl lg:text-7xl text-ink-700 leading-[1.02] tracking-[-0.02em] mb-8">
              {content.headline}
            </h1>
            <p className="text-taupe-700 text-lg md:text-xl leading-[1.55] mb-8 max-w-xl">
              {content.subheadline}
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-10">
              <a
                href="#optin"
                className="inline-flex items-center gap-3 bg-ink-700 hover:bg-ink-900 text-paper-50 font-ui font-semibold px-8 py-4 rounded-full transition"
              >
                {content.ctaLabel}
                <span className="text-ochre-400 text-xl leading-none">→</span>
              </a>
              {content.ctaSubtext ? (
                <p className="text-taupe-600 text-sm font-opus-serif italic max-w-xs">
                  {content.ctaSubtext}
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
                <p className="text-taupe-700 font-opus-serif italic">{content.ratingText}</p>
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
            <p className="figure-label mt-5 text-right">{content.figCaption}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
