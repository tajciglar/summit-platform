import { Node } from '../../shared/Node';
import type { Speaker } from '../../types';
import type { SectionContentMap } from '../bridge';
import {
  HERO_AVATAR_GRADIENTS,
  HERO_AVATAR_TEXT_COLORS,
  HERO_CARD_GRADIENTS,
  HERO_CARD_NAME_COLORS,
  HERO_CARD_TITLE_COLORS,
  displayName,
  initialsFromSpeaker,
} from './shared';

type Props = {
  content: SectionContentMap['hero'];
  speakers: Record<string, Speaker>;
};

export function Hero({ content, speakers }: Props) {
  const h = content;
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
                <Node id="hero.pillLabel" role="body">{h.pillLabel}</Node>
              </span>
            </div>

            <h1 className="violet-sun-display font-bold text-5xl md:text-6xl lg:text-7xl leading-[1.02] tracking-[-0.03em] mb-7">
              <span className="violet-sun-italic-serif" style={{ color: '#FFD347' }}>
                <Node id="hero.headlineAccent" role="heading">{h.headlineAccent}</Node>
              </span>
              <Node id="hero.headlineTrail" role="heading">{h.headlineTrail}</Node>
            </h1>

            <p
              className="text-lg md:text-xl leading-[1.6] mb-9 max-w-xl"
              style={{ color: '#E6E0FD' }}
            >
              <Node id="hero.subheadline" role="heading">{h.subheadline}</Node>
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10">
              <a
                href="#optin"
                className="violet-sun-btn-sun violet-sun-btn-sun-pulse"
              >
                <Node id="hero.primaryCtaLabel" role="button">{h.primaryCtaLabel}</Node>
                <span aria-hidden="true">→</span>
              </a>
              <a href="#what-is-this" className="violet-sun-btn-violet">
                <Node id="hero.secondaryCtaLabel" role="button">{h.secondaryCtaLabel}</Node>
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
                      background: HERO_AVATAR_GRADIENTS[idx % HERO_AVATAR_GRADIENTS.length],
                      color: HERO_AVATAR_TEXT_COLORS[idx % HERO_AVATAR_TEXT_COLORS.length],
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
                    <Node id="hero.ratingLabel" role="body">{h.ratingLabel}</Node>
                  </span>
                </p>
                <p style={{ color: '#E6E0FD' }}>
                  <Node id="hero.readerCountLead" role="body">{h.readerCountLead}</Node>{' '}
                  <span className="font-semibold text-white"><Node id="hero.readerCount" role="body">{h.readerCount}</Node></span>{' '}
                  <Node id="hero.readerCountSuffix" role="body">{h.readerCountSuffix}</Node>
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
                <Node id="hero.freeBadge" role="label">{h.freeBadge}</Node>
              </span>

              {heroSpeakers.slice(0, 4).map((s, idx) => {
                const marginTopClass =
                  idx === 1 ? 'mt-8' : idx === 2 ? '-mt-4' : idx === 3 ? 'mt-4' : '';
                return (
                  <div
                    key={`hero-card-${s.id}`}
                    className={`aspect-[3/4] rounded-3xl flex items-end justify-start p-5 shadow-2xl ${marginTopClass}`}
                    style={{
                      background: HERO_CARD_GRADIENTS[idx % HERO_CARD_GRADIENTS.length],
                    }}
                  >
                    <div>
                      <p
                        className="violet-sun-display font-bold text-lg"
                        style={{
                          color: HERO_CARD_NAME_COLORS[idx % HERO_CARD_NAME_COLORS.length],
                        }}
                      >
                        {displayName(s)}
                      </p>
                      {s.title ? (
                        <p
                          className="text-xs mt-1"
                          style={{
                            color: HERO_CARD_TITLE_COLORS[idx % HERO_CARD_TITLE_COLORS.length],
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
              <Node id="hero.moreLabel" role="body">{h.moreLabel}</Node>
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
