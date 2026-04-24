import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';

type Props = {
  content: SectionContentMap['closing-cta'];
};

export function ClosingCta({ content: c }: Props) {
  return (
    <section
      className="py-16 md:py-20 mx-4"
      style={{
        background:
          'linear-gradient(135deg, #6B3410 0%, #8B4513 50%, #3D2B1F 100%)',
        borderRadius: 24
      }}>

      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="rust-cream-heading font-black text-3xl md:text-5xl text-white mb-10">
          <Node id="closing.headline" role="heading">{c.headline}</Node>
        </h2>
        <div className="grid grid-cols-2 gap-3 mb-10 max-w-lg mx-auto">
          {c.pills.map((pill, idx) =>
            <span
              key={`closing-pill-${idx}`}
              className="rust-cream-heading font-bold text-sm px-4 py-3 rounded-full flex items-center gap-2 justify-center text-white"
              style={{ backgroundColor: '#D4A04A' }}>

              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {pill}
            </span>
          )}
        </div>
        <a
          href="#optin"
          className="rust-cream-pulse-gold inline-block rust-cream-heading font-black text-lg px-12 py-5 rounded-full transition-colors uppercase tracking-wider shadow-xl hover:scale-105"
          style={{ backgroundColor: '#D4A04A', color: '#3D2B1F' }}>

          <Node id="closing.ctaLabel" role="button">{c.ctaLabel}</Node>
        </a>
      </div>
    </section>
  );
}
