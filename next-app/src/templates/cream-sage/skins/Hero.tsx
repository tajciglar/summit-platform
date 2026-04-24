import type { CSSProperties } from 'react';
import type { CreamSageContent } from '../../cream-sage.schema';
import type { Speaker } from '../../types';
import { Node } from '../../shared/Node';
import { EventStatusBadge } from '@/components/EventStatusBadge';
import {
  AVATAR_GRADIENTS,
  HERO_COLLAGE_GRADIENTS,
  HERO_COLLAGE_OFFSETS,
  HERO_COLLAGE_ROTATIONS,
  displayName,
  initialsFromSpeaker,
} from './shared';

type Props = {
  content: CreamSageContent;
  speakers: Record<string, Speaker>;
};

export function Hero({ content, speakers }: Props) {
  const h = content.hero;
  const heroSpeakers = h.heroSpeakerIds
    .map((id) => speakers[id])
    .filter((s): s is Speaker => Boolean(s));

  return (
    <section
      className="relative overflow-hidden pt-14 md:pt-20 pb-20 md:pb-28"
      style={{ background: 'var(--cs-paper, #FAF7F2)' }}
    >
      <div
        className="cream-sage-blob cream-sage-blob-rose"
        style={{ width: 500, height: 500, top: -100, left: -150 }}
      />
      <div
        className="cream-sage-blob cream-sage-blob-sage"
        style={{ width: 600, height: 600, bottom: -200, right: -200 }}
      />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-6">
            <div className="inline-flex items-center gap-3 mb-7">
              <span
                className="cream-sage-eyebrow px-3 py-1.5"
                style={{
                  background: '#A85430',
                  color: '#FAF7F2',
                  borderRadius: 999,
                }}
              >
                <Node id="hero.badgeLabel">{h.badgeLabel}</Node>
              </span>
              <EventStatusBadge
                status={h.eventStatus}
                dateLabel={h.dateRangeLabel}
                liveLabel={h.liveLabel}
                endedLabel={h.endedLabel}
                style={{ '--esb-primary': '#2F4A40', '--esb-fg': '#FAF7F2' } as CSSProperties}
              />
            </div>
            <h1
              className="font-black text-5xl md:text-6xl lg:text-7xl leading-[1.02] mb-8"
              style={{ fontFamily: "'Fraunces', serif", color: '#2A2419' }}
            >
              <Node id="hero.headlineLead">{h.headlineLead}</Node>
              <span style={{ fontStyle: 'italic', color: '#A85430' }}>
                <Node id="hero.headlineAccent">{h.headlineAccent}</Node>
              </span>
              <Node id="hero.headlineTrail">{h.headlineTrail}</Node>
            </h1>
            <p
              className="text-xl md:text-2xl leading-[1.55] mb-10 max-w-xl"
              style={{ color: '#3A3221' }}
            >
              <Node id="hero.subheadline">{h.subheadline}</Node>
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-12">
              <a href="#optin" className="cream-sage-btn-primary" style={{ fontSize: '1.125rem' }}>
                <Node id="hero.primaryCtaLabel">{h.primaryCtaLabel}</Node>
                <span aria-hidden="true">→</span>
              </a>
              <a href="#what-is-this" className="cream-sage-btn-ghost">
                <Node id="hero.secondaryCtaLabel">{h.secondaryCtaLabel}</Node>
              </a>
            </div>

            <div
              className="flex items-center gap-5 pt-7"
              style={{ borderTop: '2px solid rgba(179,195,183,0.6)' }}
            >
              <div className="flex -space-x-3">
                {heroSpeakers.slice(0, 4).map((s, idx) => (
                  <div
                    key={`hero-avatar-${s.id}`}
                    className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-base shadow-lg"
                    style={{
                      background: AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length],
                      color: '#FAF7F2',
                      border: '3px solid #FAF7F2',
                      fontFamily: "'Nunito', 'DM Sans', sans-serif",
                    }}
                  >
                    {initialsFromSpeaker(s)}
                  </div>
                ))}
              </div>
              <div>
                <p
                  className="font-bold tracking-widest mb-0.5 text-lg"
                  style={{ color: '#A85430' }}
                >
                  <Node id="hero.ratingLabel">{h.ratingLabel}</Node>
                </p>
                <p className="text-base md:text-lg" style={{ color: '#3A3221' }}>
                  <Node id="hero.readerLeadIn">{h.readerLeadIn}</Node>{' '}
                  <span style={{ color: '#2F4A40', fontWeight: 700 }}>
                    <Node id="hero.readerCount">{h.readerCount}</Node>
                  </span>{' '}
                  <Node id="hero.readerCountSuffix">{h.readerCountSuffix}</Node>
                </p>
              </div>
            </div>
          </div>

          {/* Hero collage */}
          <div className="md:col-span-6">
            <div className="grid grid-cols-3 gap-4">
              {heroSpeakers.slice(0, 6).map((s, idx) => (
                <div
                  key={`hero-collage-${s.id}`}
                  className="flex flex-col items-center"
                  style={{
                    marginTop: `${HERO_COLLAGE_OFFSETS[idx % HERO_COLLAGE_OFFSETS.length]}px`,
                  }}
                >
                  <div
                    className="aspect-[3/4] w-full overflow-hidden flex items-end justify-center pb-6"
                    style={{
                      background: HERO_COLLAGE_GRADIENTS[idx % HERO_COLLAGE_GRADIENTS.length],
                      borderRadius: '2rem',
                      transform: `rotate(${
                        HERO_COLLAGE_ROTATIONS[idx % HERO_COLLAGE_ROTATIONS.length]
                      }deg)`,
                    }}
                  >
                    <span
                      className="font-black text-4xl"
                      style={{
                        fontFamily: "'Fraunces', serif",
                        color: 'rgba(250,247,242,0.8)',
                      }}
                    >
                      {initialsFromSpeaker(s)}
                    </span>
                  </div>
                  <p
                    className="text-sm font-bold mt-3 text-center"
                    style={{ color: '#2F4A40' }}
                  >
                    {displayName(s)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
