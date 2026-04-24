import type { CSSProperties } from 'react';
import { Node } from '../../shared/Node';
import { EventStatusBadge } from '@/components/EventStatusBadge';
import type { LimeInkContent } from '../../lime-ink.schema';
import type { Speaker } from '../../types';
import {
  AVATAR_GRADIENTS,
  AVATAR_TEXT_COLORS,
  HERO_CARD_ACCENTS,
  HERO_CARD_BORDERS,
  HERO_CARD_GRADIENTS,
  initialsFromSpeaker,
} from './shared';

type Props = {
  content: LimeInkContent['hero'];
  speakers: Record<string, Speaker>;
};

export function Hero({ content, speakers }: Props) {
  const h = content;
  const heroSpeakers = h.heroSpeakerIds.
  map((id) => speakers[id]).
  filter((s): s is Speaker => Boolean(s));

  return (
    <section
      className="relative text-white overflow-hidden"
      style={{ background: '#0A0A0B' }}>

      <div className="absolute inset-0 lime-ink-grid-bg"></div>
      <div className="absolute inset-0 lime-ink-noise"></div>
      <div className="relative max-w-7xl mx-auto px-6 pt-20 md:pt-28 pb-20 md:pb-28">
        <div className="flex items-center gap-4 mb-10">
          <span className="lime-ink-mono text-xs" style={{ color: '#DCFF6B' }}>
            <Node id="hero.sectionLabel" role="body">{h.sectionLabel}</Node>
          </span>
          <span
            className="h-[1px] w-16"
            style={{ background: 'rgba(255,255,255,0.2)' }}>
          </span>
          <EventStatusBadge
            status={h.eventStatus}
            dateLabel={h.dateRangeLabel}
            liveLabel={h.liveLabel}
            endedLabel={h.endedLabel}
            style={{ '--esb-primary': '#DCFF6B', '--esb-fg': '#0A0A0B' } as CSSProperties} />

        </div>

        <div className="grid md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-8">
            <p
              className="lime-ink-mono text-sm mb-6 tracking-wide"
              style={{ color: '#DCFF6B' }}>

              <Node id="hero.eyebrow" role="label">{h.eyebrow}</Node>
            </p>
            <h1 className="font-black text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-[-0.04em] mb-8">
              <Node id="hero.heroLine1" role="body">{h.heroLine1}</Node>
              <br />
              <Node id="hero.headlineLead" role="heading">{h.headlineLead}</Node>{' '}
              <span style={{ color: '#C4F245' }}><Node id="hero.headlineAccent" role="heading">{h.headlineAccent}</Node></span>{' '}
              <Node id="hero.headlineTrail" role="heading">{h.headlineTrail}</Node>
            </h1>
            <p
              className="text-lg md:text-xl leading-[1.55] max-w-2xl mb-10"
              style={{ color: 'rgba(255,255,255,0.7)' }}>

              <Node id="hero.subheadline" role="heading">{h.subheadline}</Node>
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-12">
              <a
                href="#optin"
                className="lime-ink-cta-primary inline-flex items-center gap-3 font-bold px-8 py-4 rounded-full text-base">

                <Node id="hero.primaryCtaLabel" role="button">{h.primaryCtaLabel}</Node>
                <span className="lime-ink-mono text-sm">→</span>
              </a>
              <a
                href="#what-is-this"
                className="lime-ink-cta-ghost inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-medium">

                <Node id="hero.secondaryCtaLabel" role="button">{h.secondaryCtaLabel}</Node>
              </a>
            </div>

            <div className="flex items-center gap-4 pt-8 lime-ink-hairline-dark">
              <div className="flex -space-x-2">
                {heroSpeakers.slice(0, 4).map((s, idx) =>
                <div
                  key={`hero-avatar-${s.id}`}
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs"
                  style={{
                    background: AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length],
                    color: AVATAR_TEXT_COLORS[idx % AVATAR_TEXT_COLORS.length],
                    border: '2px solid #0A0A0B'
                  }}>

                    {initialsFromSpeaker(s)}
                  </div>
                )}
              </div>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                <span className="text-white font-semibold"><Node id="hero.readerCount" role="body">{h.readerCount}</Node></span>{' '}
                <Node id="hero.readerCountSuffix" role="body">{h.readerCountSuffix}</Node> ·{' '}
                <span style={{ color: '#DCFF6B' }}>★★★★★</span> <Node id="hero.ratingLabel" role="body">{h.ratingLabel}</Node>
              </p>
            </div>
          </div>

          <aside className="md:col-span-4">
            <p
              className="lime-ink-mono text-xs mb-4"
              style={{ color: '#71717A' }}>

              <Node id="hero.featuredLabel" role="body">{h.featuredLabel}</Node>
            </p>
            <div className="grid grid-cols-2 gap-3">
              {heroSpeakers.slice(0, 4).map((s, idx) =>
              <div
                key={`hero-card-${s.id}`}
                className="aspect-square rounded-2xl flex items-end p-3"
                style={{
                  background: HERO_CARD_GRADIENTS[idx % HERO_CARD_GRADIENTS.length],
                  border: HERO_CARD_BORDERS[idx % HERO_CARD_BORDERS.length]
                }}>

                  <div>
                    <p
                    className="font-bold text-xl leading-none"
                    style={{
                      color: HERO_CARD_ACCENTS[idx % HERO_CARD_ACCENTS.length]
                    }}>

                      {initialsFromSpeaker(s)}
                    </p>
                    <p
                    className="lime-ink-mono mt-1"
                    style={{ fontSize: '0.6rem', color: '#71717A' }}>

                      {(s.title ?? '').toUpperCase()}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <p
              className="lime-ink-mono mt-4 text-right"
              style={{ fontSize: '0.65rem', color: '#71717A' }}>

              <Node id="hero.moreLabel" role="body">{h.moreLabel}</Node>
            </p>
          </aside>
        </div>
      </div>
    </section>);

}
