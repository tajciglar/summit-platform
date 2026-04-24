import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { CheckIcon } from './shared';

type Props = {
  content: SectionContentMap['bonuses'];
};

export function Bonuses({ content: b }: Props) {
  return (
    <section
      className="py-16 md:py-24"
      style={{ background: 'linear-gradient(135deg, #F5EDE4 0%, #E8C4A8 100%)' }}>

      <div className="max-w-6xl mx-auto px-6 text-center">
        <p
          className="rust-cream-heading font-bold text-sm uppercase tracking-wider mb-2"
          style={{ color: '#D4A04A' }}>

          <Node id="bonuses.eyebrow" role="label">{b.eyebrow}</Node>
        </p>
        <h2
          className="rust-cream-heading font-black text-3xl md:text-4xl mb-12"
          style={{ color: '#3D2B1F' }}>

          <Node id="bonuses.headline" role="heading">{b.headline}</Node>
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {b.items.map((bonus, idx) =>
            <div
              key={`bonus-${idx}`}
              className="bg-white rounded-xl p-6 shadow-md text-left"
              style={{ border: '1px solid #E8C4A8' }}>

              <span
                className="inline-block text-white rust-cream-heading font-bold text-xs px-4 py-1.5 rounded-full mb-4"
                style={{ backgroundColor: '#D4A04A' }}>

                {bonus.valueLabel}
              </span>
              <h3
                className="rust-cream-heading font-bold text-xl mb-3"
                style={{ color: '#3D2B1F' }}>

                {bonus.title}
              </h3>
              <p className="mb-4" style={{ color: '#8B7355' }}>
                {bonus.description}
              </p>
              <ul className="space-y-2">
                {bonus.bullets.map((bullet, bIdx) =>
                  <li
                    key={`bonus-${idx}-b-${bIdx}`}
                    className="flex items-center gap-2"
                    style={{ color: '#3D2B1F' }}>

                    <CheckIcon />
                    {bullet}
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
        <a
          href="#optin"
          className="inline-block mt-10 text-white rust-cream-heading font-bold px-10 py-4 rounded-full transition-colors text-lg hover:opacity-90"
          style={{ backgroundColor: '#C2703E' }}>

          <Node id="bonuses.ctaLabel" role="button">{b.ctaLabel}</Node>
        </a>
      </div>
    </section>
  );
}
