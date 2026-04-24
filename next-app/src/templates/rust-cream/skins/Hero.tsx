import { Node } from '../../shared/Node';
import type { Speaker } from '../../types';
import type { SectionContentMap } from '../bridge';
import {
  AVATAR_SM_GRADIENTS,
  SPEAKER_GRADIENTS,
  displayName,
  initialsFromSpeaker,
} from './shared';

type Props = {
  content: SectionContentMap['hero'];
  speakers: Record<string, Speaker>;
};

export function Hero({ content: h, speakers }: Props) {
  const heroSpeakers = h.heroSpeakerIds
    .map((id) => speakers[id])
    .filter((s): s is Speaker => Boolean(s));

  return (
    <section
      className="py-16 md:py-24"
      style={{ background: 'linear-gradient(135deg, #F5EDE4 0%, #E8C4A8 40%, #FDF8F3 100%)' }}>

      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="rust-cream-heading font-bold text-sm mb-3" style={{ color: '#C2703E' }}>
          <Node id="hero.eyebrow" role="label">{h.eyebrow}</Node>
        </p>
        <h1
          className="rust-cream-heading font-black text-3xl md:text-4xl lg:text-[2.75rem] leading-[1.15] mb-5"
          style={{ color: '#3D2B1F' }}>

          <Node id="hero.headline" role="heading">{h.headline}</Node>
        </h1>
        <p className="text-lg mb-6 leading-relaxed" style={{ color: '#8B7355' }}>
          <strong style={{ color: '#3D2B1F' }}><Node id="hero.subheadlineLead" role="heading">{h.subheadlineLead}</Node></strong> <Node id="hero.subheadline" role="heading">{h.subheadline}</Node>
        </p>
        <a
          href="#optin"
          className="rust-cream-pulse-glow inline-block text-white rust-cream-heading font-bold text-base px-10 py-4 rounded-full transition-all uppercase tracking-wide mb-4 hover:scale-105"
          style={{ backgroundColor: '#8B4513' }}>

          <Node id="hero.ctaLabel" role="button">{h.ctaLabel}</Node>
        </a>
        <p className="text-sm mb-6" style={{ color: '#8B7355' }}>
          <Node id="hero.freeGiftLine" role="body">{h.freeGiftLine}</Node>{' '}
          <strong style={{ color: '#8B4513' }}><Node id="hero.freeGiftEmphasis" role="body">{h.freeGiftEmphasis}</Node></strong>
          <Node id="hero.freeGiftSuffix" role="body">{h.freeGiftSuffix}</Node>
        </p>

        {/* Social proof: avatar stack + stars */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="flex -space-x-2">
            {heroSpeakers.slice(0, 4).map((s, idx) =>
              <div
                key={`hero-stack-${s.id}`}
                className="rust-cream-avatar-sm"
                style={{ background: AVATAR_SM_GRADIENTS[idx % AVATAR_SM_GRADIENTS.length] }}>

                {initialsFromSpeaker(s)}
              </div>
            )}
          </div>
          <p className="text-sm" style={{ color: '#8B7355' }}>
            <span className="block text-xs mb-0.5" style={{ color: '#D4A04A' }} aria-hidden="true">
              ★★★★★
            </span>
            <Node id="hero.readerCountPrefix" role="body">{h.readerCountPrefix}</Node>{' '}
            <strong style={{ color: '#3D2B1F' }}><Node id="hero.readerCount" role="body">{h.readerCount}</Node></strong> <Node id="hero.readerCountSuffix" role="body">{h.readerCountSuffix}</Node>
          </p>
        </div>

        {/* Speaker row below CTA */}
        <div className="flex items-center justify-center gap-5 flex-wrap">
          {heroSpeakers.slice(0, 6).map((s, idx) =>
            <div key={`hero-row-${s.id}`} className="flex flex-col items-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white rust-cream-heading font-bold text-sm"
                style={{
                  background: SPEAKER_GRADIENTS[idx % SPEAKER_GRADIENTS.length],
                  border: '3px solid #E8C4A8'
                }}>

                {initialsFromSpeaker(s)}
              </div>
              <p
                className="rust-cream-heading font-bold text-xs mt-1.5"
                style={{ color: '#3D2B1F' }}>

                {displayName(s)}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
