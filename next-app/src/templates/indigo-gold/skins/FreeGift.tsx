import { Node } from '../../shared/Node';
import type { Speaker } from '../../types';
import type { SectionContentMap } from '../bridge';
import { Icon, INK, LAV, speakerPhoto } from './shared';

type Props = {
  content: SectionContentMap['free-gift'];
  speakers: Record<string, Speaker>;
};

export function FreeGift({ content, speakers }: Props) {
  const g = content;
  const heroCollage = g.collageSpeakerIds
    .map((id) => speakers[id])
    .filter((s): s is Speaker => Boolean(s))
    .slice(0, 3);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-5 md:px-8 grid md:grid-cols-2 gap-12 items-center">
        <div className="relative">
          <div
            className="rounded-2xl overflow-hidden shadow-2xl aspect-video grid place-items-center text-white relative"
            style={{ background: INK.c900 }}
          >
            <div className="absolute inset-x-0 top-4 flex justify-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.3)' }} />
              <span className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.3)' }} />
              <span className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.3)' }} />
            </div>
            <div className="flex gap-3 px-6">
              {(heroCollage.length > 0 ? heroCollage : [undefined, undefined, undefined]).map((s, idx) => (
                <div
                  key={`gift-mini-${idx}`}
                  className="w-20 h-24 rounded-lg bg-cover bg-center"
                  style={{
                    background: s
                      ? `#C5B5E4 url(${speakerPhoto(s, 200)}) center/cover`
                      : `linear-gradient(135deg,${LAV.c400},${LAV.c600})`,
                  }}
                />
              ))}
            </div>
            <div className="absolute bottom-5 left-5 right-5 text-center">
              <p className="text-[0.6rem]" style={{ letterSpacing: '0.4em', opacity: 0.7 }}>
                <Node id="freeGift.badgeLabel" role="label">{g.badgeLabel}</Node>
              </p>
              <p className="indigo-gold-display text-2xl italic"><Node id="freeGift.cardTitle" role="body">{g.cardTitle}</Node></p>
            </div>
          </div>
        </div>
        <div>
          <p className="indigo-gold-eyebrow-head mb-2"><Node id="freeGift.eyebrow" role="label">{g.eyebrow}</Node></p>
          <h2 className="indigo-gold-h2-head mb-5"><Node id="freeGift.headline" role="heading">{g.headline}</Node></h2>
          <p className="font-semibold mb-4" style={{ color: INK.c800 }}>
            <Node id="freeGift.body" role="body">{g.body}</Node>
          </p>
          <ul className="space-y-3 list-disc pl-5 mb-6" style={{ color: INK.c800 }}>
            {g.bullets.map((bullet, idx) => (
              <li key={`gift-b-${idx}`}>{bullet}</li>
            ))}
          </ul>
          <a href="#optin" className="indigo-gold-btn-cta">
            <Node id="freeGift.ctaLabel" role="button">{g.ctaLabel}</Node>
            <span className="indigo-gold-btn-arrow">
              <Icon id="arrow-right" className="w-3.5 h-3.5" />
            </span>
          </a>
          <p className="text-sm mt-3" style={{ color: LAV.c700 }}>
            <Node id="freeGift.cardNote" role="body">{g.cardNote}</Node>
          </p>
        </div>
      </div>
    </section>
  );
}
