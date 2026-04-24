import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { CheckIcon } from './shared';

type Props = {
  content: SectionContentMap['free-gift'];
};

export function FreeGift({ content: g }: Props) {
  return (
    <section
      className="py-14 md:py-20"
      style={{ background: 'linear-gradient(135deg, #FDF8F3 0%, #E8C4A840 100%)' }}>

      <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
        <div className="flex justify-center">
          <div className="relative">
            <div
              className="w-56 h-72 bg-white rounded-xl shadow-2xl flex flex-col items-center justify-center p-6 transform -rotate-3"
              style={{ border: '1px solid #E8C4A8' }}>

              <div
                className="w-full h-2 rounded-full mb-4"
                style={{ backgroundColor: '#C2703E' }}>
              </div>
              <div
                className="w-12 h-12 rounded-xl mb-3 flex items-center justify-center"
                style={{ backgroundColor: '#8B4513' }}
                aria-hidden="true">

                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p
                className="rust-cream-heading font-bold text-sm text-center leading-tight"
                style={{ color: '#3D2B1F' }}>

                <Node id="freeGift.mockupTitle" role="body">{g.mockupTitle}</Node>
              </p>
              <p className="text-xs mt-2" style={{ color: '#8B7355' }}>
                <Node id="freeGift.mockupSubtitle" role="body">{g.mockupSubtitle}</Node>
              </p>
            </div>
            <div
              className="absolute -top-3 -right-3 text-white rust-cream-heading font-black text-xs px-3 py-1.5 rounded-full shadow-lg transform rotate-12"
              style={{ backgroundColor: '#D4A04A' }}>

              <Node id="freeGift.badgeLabel" role="label">{g.badgeLabel}</Node>
            </div>
          </div>
        </div>
        <div>
          <p
            className="rust-cream-heading font-bold text-sm uppercase tracking-wider mb-2"
            style={{ color: '#D4A04A' }}>

            <Node id="freeGift.eyebrow" role="label">{g.eyebrow}</Node>
          </p>
          <h2
            className="rust-cream-heading font-black text-2xl md:text-3xl mb-4"
            style={{ color: '#3D2B1F' }}>

            <Node id="freeGift.headline" role="heading">{g.headline}</Node>
          </h2>
          <p className="mb-5" style={{ color: '#8B7355' }}>
            <Node id="freeGift.body" role="body">{g.body}</Node>
          </p>
          <ul className="space-y-3 mb-6">
            {g.bullets.map((bullet, idx) =>
              <li
                key={`gift-bullet-${idx}`}
                className="flex items-start gap-2"
                style={{ color: '#3D2B1F' }}>

                <CheckIcon />
                {bullet}
              </li>
            )}
          </ul>
          <a
            href="#optin"
            className="rust-cream-pulse-glow inline-block text-white rust-cream-heading font-bold text-sm px-7 py-3.5 rounded-full transition-all uppercase tracking-wide hover:scale-105"
            style={{ backgroundColor: '#8B4513' }}>

            <Node id="freeGift.ctaLabel" role="button">{g.ctaLabel}</Node>
          </a>
        </div>
      </div>
    </section>
  );
}
