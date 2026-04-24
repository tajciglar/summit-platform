import { Node } from '../../shared/Node';
import type { Speaker } from '../../types';
import type { SectionContentMap } from '../bridge';
import {
  HERO_AVATAR_GRADIENTS,
  SOCIAL_AVATAR_GRADIENTS,
  displayName,
  initialsFromSpeaker,
} from './shared';

type Props = {
  content: SectionContentMap['hero'];
  speakers: Record<string, Speaker>;
};

export function Hero({ content, speakers }: Props) {
  const h = content;
  const lifestyle = h.lifestyleImage;
  const heroSpeakers = h.avatarSpeakerIds.
  map((id) => speakers[id]).
  filter((s): s is Speaker => Boolean(s)).
  slice(0, 4);

  return (
    <section
      className="py-16 md:py-24 relative overflow-hidden"
      style={{
        background:
        'linear-gradient(160deg, #F0F7FF 0%, #DBEAFE 35%, #E8F0FE 70%, #F0F7FF 100%)'
      }}>

      {/* Decorative blurred circles */}
      <div
        className="absolute top-10 left-10 w-72 h-72 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)',
          filter: 'blur(60px)'
        }} />

      <div
        className="absolute bottom-10 right-10 w-96 h-96 rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, #F87171 0%, transparent 70%)',
          filter: 'blur(80px)'
        }} />


      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        {lifestyle?.url ?
        <img
          src={lifestyle.url}
          alt={lifestyle.alt ?? ''}
          width={lifestyle.width ?? undefined}
          height={lifestyle.height ?? undefined}
          className="w-full max-w-2xl mx-auto mb-8 rounded-2xl shadow-xl object-cover aspect-[16/9]"
          loading="eager"
          data-testid="blue-coral-hero-lifestyle" /> :

        null}
        <p
          className="blue-coral-heading font-bold text-sm mb-4 uppercase tracking-wider"
          style={{ color: '#2563EB' }}>

          <Node id="hero.eyebrow" role="label">{h.eyebrow}</Node>
        </p>
        <h1
          className="blue-coral-heading font-black text-3xl md:text-5xl lg:text-[3.25rem] leading-[1.12] mb-6"
          style={{ color: '#1E293B' }}>

          <Node id="hero.headline" role="heading">{h.headline}</Node>
        </h1>
        <p
          className="text-lg mb-8 leading-relaxed max-w-2xl mx-auto"
          style={{ color: '#4B5563' }}>

          <strong style={{ color: '#1E293B' }}><Node id="hero.subheadlineLead" role="heading">{h.subheadlineLead}</Node></strong>
          <Node id="hero.subheadlineTrail" role="heading">{h.subheadlineTrail}</Node>
        </p>
        <a
          href="#optin"
          className="blue-coral-pulse-coral inline-block text-white blue-coral-heading font-bold text-base px-10 py-4 rounded-full uppercase tracking-wide mb-4 shadow-lg transition-transform hover:scale-105"
          style={{ background: '#F87171' }}>

          <Node id="hero.ctaLabel" role="button">{h.ctaLabel}</Node>
        </a>
        <p className="text-sm mb-8" style={{ color: '#6B7280' }}>
          <Node id="hero.giftNotePrefix" role="body">{h.giftNotePrefix}</Node>
          <strong style={{ color: '#2563EB' }}><Node id="hero.giftNoteHighlight" role="body">{h.giftNoteHighlight}</Node></strong>
          <Node id="hero.giftNoteSuffix" role="body">{h.giftNoteSuffix}</Node>
        </p>

        {/* Social proof row */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="flex -space-x-2">
            {heroSpeakers.map((s, idx) =>
            <div
              key={`social-${s.id}`}
              className="blue-coral-avatar-sm"
              style={{
                background:
                SOCIAL_AVATAR_GRADIENTS[idx % SOCIAL_AVATAR_GRADIENTS.length]
              }}>

                {initialsFromSpeaker(s)}
              </div>
            )}
          </div>
          <p className="text-sm" style={{ color: '#4B5563' }}>
            <span
              className="inline-flex gap-0.5 text-xs align-middle"
              style={{ color: '#F87171' }}
              aria-hidden="true">

              ★★★★★
            </span>{' '}
            <Node id="hero.socialProofLead" role="body">{h.socialProofLead}</Node>
            <strong style={{ color: '#1E293B' }}><Node id="hero.socialProofCount" role="body">{h.socialProofCount}</Node></strong>
            <Node id="hero.socialProofSuffix" role="body">{h.socialProofSuffix}</Node>
          </p>
        </div>

        {/* Featured speaker row */}
        <div className="flex flex-wrap items-start justify-center gap-6 md:gap-10">
          {heroSpeakers.map((s, idx) =>
          <div key={`hero-speaker-${s.id}`} className="flex flex-col items-center">
              <div
              className="blue-coral-avatar-hero"
              style={{
                background:
                HERO_AVATAR_GRADIENTS[idx % HERO_AVATAR_GRADIENTS.length]
              }}>

                {initialsFromSpeaker(s)}
              </div>
              <p
              className="blue-coral-heading font-bold text-xs mt-2"
              style={{ color: '#1E293B' }}>

                {displayName(s)}
              </p>
              {s.title ?
            <p className="text-[11px]" style={{ color: '#6B7280' }}>
                  {s.title}
                </p> :
            null}
            </div>
          )}
        </div>
      </div>
    </section>);

}
