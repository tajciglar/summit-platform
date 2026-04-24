import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { Icon } from './shared';

type Props = { content: SectionContentMap['closing-cta'] };

export function ClosingCta({ content }: Props) {
  const c = content;
  return (
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-5 md:px-8 text-center">
        <p className="indigo-gold-eyebrow-head mb-2">Whatever Your Situation, We Believe Every Child Is Capable Of More</p>
        <h2 className="indigo-gold-h2-head mb-8"><Node id="closing.headline" role="heading">{c.headline}</Node></h2>
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {c.chips.map((chip, idx) => (
            <span key={`chip-${idx}`} className="indigo-gold-plus-pill">
              <span className="indigo-gold-plus-pill-plus">+</span>
              {chip}
            </span>
          ))}
        </div>
        <a href="#optin" className="indigo-gold-btn-cta">
          <Node id="closing.ctaLabel" role="button">{c.ctaLabel}</Node>
          <span className="indigo-gold-btn-arrow">
            <Icon id="arrow-right" className="w-3.5 h-3.5" />
          </span>
        </a>
      </div>
    </section>
  );
}
