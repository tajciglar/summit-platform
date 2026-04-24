import { Node } from '../../shared/Node';
import type { GreenGoldContent } from '../../green-gold.schema';

type Props = { content: GreenGoldContent };

export function FreeGift({ content }: Props) {
  const g = content.freeGift;
  return (
    <section
      className="py-14 md:py-20"
      style={{
        background: 'linear-gradient(135deg, #fefce8 0%, rgba(253,230,138,0.25) 100%)'
      }}>

      <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
        <div className="flex justify-center">
          <div className="relative">
            <div
              className="rounded-xl shadow-2xl flex flex-col items-center justify-center p-6"
              style={{
                width: '14rem',
                height: '18rem',
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                transform: 'rotate(-3deg)'
              }}>

              <div
                className="w-full h-2 rounded-full mb-4"
                style={{ background: '#16A34A' }}>
              </div>
              <div
                className="w-12 h-12 rounded-xl mb-3"
                style={{ background: '#16A34A' }}>
              </div>
              <p
                className="green-gold-heading font-bold text-sm text-center leading-tight"
                style={{ color: '#1A2E1A' }}>

                <Node id="freeGift.bookTitle" role="body">{g.bookTitle}</Node>
              </p>
              <p
                className="text-xs mt-2"
                style={{ color: 'rgba(26,46,26,0.4)' }}>

                <Node id="freeGift.bookSubLabel" role="body">{g.bookSubLabel}</Node>
              </p>
            </div>
            <div
              className="absolute -top-3 -right-3 green-gold-heading text-white font-black text-xs px-3 py-1.5 rounded-full shadow-lg"
              style={{
                background: '#EAB308',
                transform: 'rotate(12deg)'
              }}>

              <Node id="freeGift.badge" role="label">{g.badge}</Node>
            </div>
          </div>
        </div>
        <div>
          <p
            className="green-gold-heading font-bold text-sm uppercase tracking-wider mb-2"
            style={{ color: '#CA8A04' }}>

            <Node id="freeGift.eyebrow" role="label">{g.eyebrow}</Node>
          </p>
          <h2
            className="green-gold-heading font-black text-2xl md:text-3xl mb-4"
            style={{ color: '#1A2E1A' }}>

            <Node id="freeGift.headline" role="heading">{g.headline}</Node>
          </h2>
          <p className="mb-5" style={{ color: 'rgba(26,46,26,0.6)' }}>
            <Node id="freeGift.body" role="body">{g.body}</Node>
          </p>
          <ul className="space-y-3 mb-6">
            {g.bullets.map((bullet, idx) =>
            <li
              key={`gift-bullet-${idx}`}
              className="flex items-start gap-2"
              style={{ color: 'rgba(26,46,26,0.7)' }}>

                <svg
                className="w-5 h-5 shrink-0 mt-0.5"
                style={{ color: '#16A34A' }}
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true">

                  <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd" />

                </svg>
                {bullet}
              </li>
            )}
          </ul>
          <a
            href="#optin"
            className="green-gold-heading green-gold-pulse-glow inline-block text-white font-bold text-sm px-7 py-3.5 rounded-full uppercase tracking-wide"
            style={{ background: '#16A34A' }}>

            <Node id="freeGift.ctaLabel" role="button">{g.ctaLabel}</Node> &rarr;
          </a>
        </div>
      </div>
    </section>);

}
