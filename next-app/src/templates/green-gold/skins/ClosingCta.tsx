import { Node } from '../../shared/Node';
import type { GreenGoldContent } from '../../green-gold.schema';

type Props = { content: GreenGoldContent };

export function ClosingCta({ content }: Props) {
  const c = content.closing;
  return (
    <section
      className="py-16 md:py-20 mx-4"
      style={{
        background:
        'linear-gradient(135deg, #14532D 0%, #16A34A 50%, #15803D 100%)',
        borderRadius: '24px'
      }}>

      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2
          className="green-gold-heading font-black text-3xl md:text-5xl mb-10"
          style={{ color: '#FFFFFF' }}>

          <Node id="closing.headline" role="heading">{c.headline}</Node>
        </h2>
        <div className="grid grid-cols-2 gap-3 mb-10 max-w-lg mx-auto">
          {c.features.map((feature, idx) =>
          <span
            key={`closing-feature-${idx}`}
            className="green-gold-heading text-white font-bold text-sm px-4 py-3 rounded-full flex items-center gap-2 justify-center"
            style={{ background: '#EAB308' }}>

              <svg
              className="w-4 h-4 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true">

                <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd" />

              </svg>
              {feature}
            </span>
          )}
        </div>
        <a
          href="#optin"
          className="green-gold-heading inline-block font-black text-lg px-12 py-5 rounded-full uppercase tracking-wider shadow-xl"
          style={{ background: '#EAB308', color: '#1A2E1A' }}>

          <Node id="closing.ctaLabel" role="button">{c.ctaLabel}</Node> &rarr;
        </a>
      </div>
    </section>);

}
