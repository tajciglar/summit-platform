import type { CSSProperties } from 'react';
import { Node } from '../../shared/Node';
import { OptinModal as _OptinModal } from '@/components/OptinModal'; // intentionally unused — modal lives in layout
import { EventStatusBadge } from '@/components/EventStatusBadge';
import type { Speaker } from '../../types';
import type { SectionContentMap } from '../bridge';
import { FALLBACK_AVATAR_SLOTS, INK, LAV, SUN, Icon, displayName, speakerPhoto } from './shared';

void _OptinModal;

type Props = {
  content: SectionContentMap['hero'];
  speakers: Record<string, Speaker>;
};

export function Hero({ content, speakers }: Props) {
  const h = content;
  const bg = h.backgroundImage;
  const collage = h.collageSpeakerIds.map((id) => speakers[id]).filter((s): s is Speaker => Boolean(s));

  const resolvePhoto = (idx: number, s?: Speaker) => {
    const override = h.collagePhotoUrls?.[idx];
    if (override) return override;
    if (s?.photoUrl) return s.photoUrl;
    if (s) return speakerPhoto(s);
    const slot = FALLBACK_AVATAR_SLOTS[idx % FALLBACK_AVATAR_SLOTS.length];
    return `https://i.pravatar.cc/500?img=${slot}`;
  };

  const photoSlots = Array.from({ length: 6 }, (_, i) => ({
    s: collage[i],
    url: resolvePhoto(i, collage[i]),
    alt: collage[i] ? displayName(collage[i]) : '',
  }));

  return (
    <section className="indigo-gold-hero-bg relative">
      {bg?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={bg.url}
          alt={bg.alt ?? ''}
          width={bg.width ?? undefined}
          height={bg.height ?? undefined}
          className="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none"
          loading="eager"
          data-testid="indigo-gold-hero-background"
        />
      ) : null}
      <div className="max-w-7xl mx-auto px-5 md:px-8 pt-10 pb-16 md:pt-20 md:pb-24 grid md:grid-cols-2 gap-10 md:gap-14 items-center relative">
        <div>
          <div className="mb-6">
            <EventStatusBadge
              status={h.eventStatus ?? (h.eventStatusLabel ? 'ended' : 'before')}
              dateLabel={h.eventStatusLabel ?? h.dateRangeLabel ?? ''}
              liveLabel={h.liveLabel ?? undefined}
              endedLabel={h.endedLabel ?? h.eventStatusLabel ?? undefined}
              style={{ '--esb-primary': LAV.c700, '--esb-fg': '#ffffff' } as CSSProperties}
            />
          </div>

          <p className="font-bold text-2xl md:text-3xl mb-3 leading-tight" style={{ color: INK.c900 }}>
            <Node id="hero.eyebrow" role="label">{h.eyebrow}</Node>
          </p>
          <h1
            className="indigo-gold-display font-bold mb-6"
            style={{
              color: INK.c900,
              fontSize: 'clamp(2.2rem, 4.5vw, 4rem)',
              lineHeight: 1.02,
            }}
          >
            <Node id="hero.headline" role="heading">{h.headline}</Node>
            {h.headlineItalicTail ? (
              <>
                {' '}
                <span className="italic"><Node id="hero.headlineItalicTail" role="heading">{h.headlineItalicTail}</Node></span>
              </>
            ) : null}
          </h1>
          <p className="text-base md:text-lg mb-8 max-w-xl" style={{ color: INK.c800 }}>
            <strong><Node id="hero.subheadlineLead" role="heading">{h.subheadlineLead}</Node></strong>
            <Node id="hero.subheadlineTrail" role="heading">{h.subheadlineTrail}</Node>
          </p>

          <a href="#optin" className="indigo-gold-btn-cta indigo-gold-btn-pulse">
            <Node id="hero.ctaLabel" role="button">{h.ctaLabel}</Node>
            <span className="indigo-gold-btn-arrow">
              <Icon id="arrow-right" className="w-3.5 h-3.5" />
            </span>
          </a>
          {h.ctaNote ? (
            <p className="mt-3 text-sm" style={{ color: LAV.c700 }}>
              <Node id="hero.ctaNote" role="body">{h.ctaNote}</Node>
            </p>
          ) : null}

          <div className="mt-6 flex items-center gap-3">
            <div className="flex" style={{ color: SUN.c500 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Icon key={`hstar-${i}`} id="star" className="w-5 h-5" />
              ))}
            </div>
            <p className="text-sm" style={{ color: INK.c800 }}>
              <Node id="hero.ratingLead" role="body">{h.ratingLead}</Node>
              <strong><Node id="hero.ratingCount" role="body">{h.ratingCount}</Node></strong>
              <Node id="hero.ratingTrail" role="body">{h.ratingTrail}</Node>
            </p>
          </div>

          <p className="mt-5">
            <span
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm"
              style={{ background: 'rgba(255,255,255,0.85)', color: LAV.c700 }}
            >
              <Icon id="gift" className="w-4 h-4" />
              <Node id="hero.giftNoteLead" role="body">{h.giftNoteLead}</Node>
              <strong style={{ color: LAV.c700 }}><Node id="hero.giftNoteAccent" role="body">{h.giftNoteAccent}</Node></strong>
              <Node id="hero.giftNoteTrail" role="body">{h.giftNoteTrail}</Node>
            </span>
          </p>
        </div>

        {/* Organic photo cluster: 1 large + 5 smaller */}
        <div className="relative">
          <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-md mx-auto">
            <div className="col-start-1 col-span-2 row-span-2">
              <PhotoCircle url={photoSlots[0].url} alt={photoSlots[0].alt} />
            </div>
            <PhotoCircle url={photoSlots[1].url} alt={photoSlots[1].alt} />
            <PhotoCircle url={photoSlots[2].url} alt={photoSlots[2].alt} />
            <PhotoCircle url={photoSlots[3].url} alt={photoSlots[3].alt} />
            <PhotoCircle url={photoSlots[4].url} alt={photoSlots[4].alt} />
            <PhotoCircle url={photoSlots[5].url} alt={photoSlots[5].alt} />
          </div>
          <div
            className="absolute -bottom-4 right-4 bg-white rounded-full shadow-lg px-4 py-2 text-xs font-semibold flex items-center gap-2"
            style={{ color: INK.c800 }}
          >
            <span className="flex" style={{ color: SUN.c500 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Icon key={`hrat-${i}`} id="star" className="w-3.5 h-3.5" />
              ))}
            </span>
            <Node id="hero.ratingCount" role="body">{h.ratingCount}</Node> parents
          </div>
        </div>
      </div>
    </section>
  );
}

function PhotoCircle({ url, alt }: { url: string; alt: string }) {
  return (
    <div className="w-full aspect-square rounded-full overflow-hidden shadow-lg">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={alt} className="w-full h-full object-cover" loading="lazy" />
    </div>
  );
}
