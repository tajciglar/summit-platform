import { Node } from '../../shared/Node';
import type { GreenGoldContent } from '../../green-gold.schema';
import type { Speaker } from '../../types';
import {
  HERO_AVATAR_GRADIENTS,
  HERO_SOCIAL_AVATAR_GRADIENTS,
  initialsFromSpeaker,
} from './shared';

type Props = {
  content: GreenGoldContent;
  speakers: Record<string, Speaker>;
};

export function Hero({ content, speakers }: Props) {
  const h = content.hero;
  const heroSpeakers = h.heroSpeakerIds.
  map((id) => speakers[id]).
  filter((s): s is Speaker => Boolean(s));
  const socialSpeakers = h.socialProofAvatarIds.
  map((id) => speakers[id]).
  filter((s): s is Speaker => Boolean(s));

  return (
    <section
      className="py-14 md:py-20 relative overflow-hidden"
      style={{
        background:
        'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 40%, #E8F5E9 100%)'
      }}>

      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-5 gap-10 items-center relative z-10">
        <div className="md:col-span-3">
          <p
            className="green-gold-heading font-bold text-sm mb-3"
            style={{ color: '#16A34A' }}>

            <Node id="hero.eyebrow" role="label">{h.eyebrow}</Node>
          </p>
          <h1
            className="green-gold-heading font-black text-3xl md:text-4xl lg:text-[2.75rem] leading-[1.15] mb-5"
            style={{ color: '#1A2E1A' }}>

            <Node id="hero.headline" role="heading">{h.headline}</Node>
          </h1>
          <p
            className="text-base mb-6 leading-relaxed"
            style={{ color: 'rgba(26,46,26,0.7)' }}>

            <Node id="hero.subheadline" role="heading">{h.subheadline}</Node>
          </p>
          <a
            href="#optin"
            className="green-gold-heading green-gold-pulse-glow inline-block text-white font-bold text-base px-8 py-4 rounded-full uppercase tracking-wide mb-4"
            style={{ background: '#16A34A' }}>

            <Node id="hero.primaryCtaLabel" role="button">{h.primaryCtaLabel}</Node> &rarr;
          </a>
          <p
            className="text-sm mb-6"
            style={{ color: 'rgba(26,46,26,0.55)' }}>

            <Node id="hero.giftLine" role="body">{h.giftLine}</Node>
          </p>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {socialSpeakers.slice(0, 4).map((s, idx) =>
              <div
                key={`hero-social-${s.id}`}
                className="green-gold-avatar-sm"
                style={{
                  background:
                  HERO_SOCIAL_AVATAR_GRADIENTS[
                  idx % HERO_SOCIAL_AVATAR_GRADIENTS.length]

                }}>

                  {initialsFromSpeaker(s)}
                </div>
              )}
            </div>
            <p
              className="text-sm"
              style={{ color: 'rgba(26,46,26,0.6)' }}>

              <span
                className="flex gap-0.5 text-xs mb-0.5"
                style={{ color: '#EAB308' }}>

                ★★★★★
              </span>
              Loved by{' '}
              <strong style={{ color: '#1A2E1A' }}><Node id="hero.readerCount" role="body">{h.readerCount}</Node></strong>{' '}
              <Node id="hero.readerCountSuffix" role="body">{h.readerCountSuffix}</Node>
            </p>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex -space-x-3">
              {heroSpeakers.slice(0, 6).map((s, idx) =>
              <div
                key={`hero-avatar-${s.id}`}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{
                  background:
                  HERO_AVATAR_GRADIENTS[idx % HERO_AVATAR_GRADIENTS.length],
                  border: '2px solid #FFFFFF'
                }}>

                  {initialsFromSpeaker(s)}
                </div>
              )}
            </div>
            <p
              className="green-gold-heading font-bold text-xs"
              style={{ color: 'rgba(26,46,26,0.55)' }}>

              <Node id="hero.speakerCountLabel" role="body">{h.speakerCountLabel}</Node>
            </p>
          </div>
        </div>

        <div
          className="md:col-span-2 hidden md:flex items-center justify-center relative"
          style={{ minHeight: '420px' }}>

          <div className="absolute inset-0">
            <svg
              viewBox="0 0 400 420"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
              aria-hidden="true">

              <defs>
                <linearGradient id="green-gold-blob1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#16A34A" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#14532D" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#EAB308" stopOpacity="0.3" />
                </linearGradient>
                <linearGradient id="green-gold-blob2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#EAB308" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#16A34A" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="green-gold-blob3" x1="50%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" stopColor="#DCFCE7" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#16A34A" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <ellipse cx="200" cy="180" rx="180" ry="160" fill="url(#green-gold-blob1)" />
              <ellipse cx="260" cy="250" rx="130" ry="140" fill="url(#green-gold-blob2)" />
              <ellipse cx="160" cy="280" rx="100" ry="110" fill="url(#green-gold-blob3)" />
              <circle cx="300" cy="120" r="60" fill="#EAB308" fillOpacity="0.15" />
              <circle cx="120" cy="140" r="40" fill="#14532D" fillOpacity="0.1" />
            </svg>
          </div>
          <div className="relative z-10 text-center p-6">
            <div
              className="rounded-2xl p-8 shadow-lg"
              style={{
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(6px)',
                border: '1px solid rgba(187,247,208,0.5)'
              }}>

              <div className="flex justify-center gap-3 mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md"
                  style={{ background: '#16A34A' }}>
                </div>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md"
                  style={{ background: '#EAB308' }}>
                </div>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md"
                  style={{ background: '#15803D' }}>
                </div>
              </div>
              <p
                className="green-gold-heading font-bold text-lg mb-1"
                style={{ color: '#1A2E1A' }}>

                {h.blobCard.daysLabel}
              </p>
              <p
                className="green-gold-heading font-extrabold text-2xl"
                style={{ color: '#16A34A' }}>

                {h.blobCard.freeLabel}
              </p>
              <p
                className="text-sm mt-2"
                style={{ color: 'rgba(26,46,26,0.5)' }}>

                {h.blobCard.subLabel}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>);

}
