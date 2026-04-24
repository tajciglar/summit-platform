import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { CheckIcon } from './shared';

type Props = {
  content: SectionContentMap['free-gift'];
};

export function FreeGift({ content }: Props) {
  const g = content;
  return (
    <section
      className="py-14 md:py-20"
      style={{
        background: 'linear-gradient(135deg, #F0F7FF 0%, rgba(219,234,254,0.25) 100%)'
      }}>

      <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
        <div className="flex justify-center">
          <div className="relative">
            <div
              className="w-56 h-72 rounded-xl flex flex-col items-center justify-center p-6 transform -rotate-3"
              style={{
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                boxShadow:
                '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0,0,0,0.1)'
              }}>

              <div
                className="w-full h-2 rounded-full mb-4"
                style={{ background: '#2563EB' }} />

              <div
                className="w-12 h-12 rounded-xl mb-3 flex items-center justify-center"
                style={{ background: '#2563EB' }}>

                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true">

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />

                </svg>
              </div>
              <p
                className="blue-coral-heading font-bold text-sm text-center leading-tight"
                style={{ color: '#1E293B' }}>

                <Node id="freeGift.cardTitle" role="body">{g.cardTitle}</Node>
              </p>
              <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>
                <Node id="freeGift.cardSubtitle" role="body">{g.cardSubtitle}</Node>
              </p>
            </div>
            <div
              className="absolute -top-3 -right-3 text-white blue-coral-heading font-black text-xs px-3 py-1.5 rounded-full shadow-lg"
              style={{ background: '#F87171', transform: 'rotate(12deg)' }}>

              <Node id="freeGift.badge" role="label">{g.badge}</Node>
            </div>
          </div>
        </div>
        <div>
          <p
            className="blue-coral-heading font-bold text-sm uppercase tracking-wider mb-2"
            style={{ color: '#F87171' }}>

            <Node id="freeGift.eyebrow" role="label">{g.eyebrow}</Node>
          </p>
          <h2
            className="blue-coral-heading font-black text-2xl md:text-3xl mb-4"
            style={{ color: '#1E293B' }}>

            <Node id="freeGift.headline" role="heading">{g.headline}</Node>
          </h2>
          <p className="mb-5" style={{ color: '#4B5563' }}>
            <Node id="freeGift.body" role="body">{g.body}</Node>
          </p>
          <ul className="space-y-3 mb-6">
            {g.bullets.map((bullet, idx) =>
            <li
              key={`gift-bullet-${idx}`}
              className="flex items-start gap-2"
              style={{ color: '#374151' }}>

                <CheckIcon className="w-5 h-5 shrink-0 mt-0.5" />
                <span style={{ color: '#2563EB', width: 0, overflow: 'hidden' }} />
                {bullet}
              </li>
            )}
          </ul>
          <a
            href="#optin"
            className="blue-coral-pulse-coral inline-block text-white blue-coral-heading font-bold text-sm px-7 py-3.5 rounded-full uppercase tracking-wide transition-transform hover:scale-105"
            style={{ background: '#F87171' }}>

            <Node id="freeGift.ctaLabel" role="button">{g.ctaLabel}</Node>
          </a>
        </div>
      </div>
    </section>);

}
