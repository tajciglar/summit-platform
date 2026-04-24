import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';

type Props = {
  content: SectionContentMap['shifts'];
};

export function Shifts({ content: s }: Props) {
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: '#F5EDE4' }}>
      <div className="max-w-3xl mx-auto px-6">
        <p
          className="rust-cream-heading font-bold text-sm uppercase tracking-wider mb-2"
          style={{ color: '#C2703E' }}>

          <Node id="shifts.eyebrow" role="label">{s.eyebrow}</Node>
        </p>
        <h2
          className="rust-cream-heading font-black text-3xl md:text-4xl mb-12"
          style={{ color: '#3D2B1F' }}>

          <Node id="shifts.headline" role="heading">{s.headline}</Node>
        </h2>
        <div className="space-y-8">
          {s.items.map((item, idx) =>
            <div key={`shift-${idx}`} className="flex gap-6">
              <span
                className="rust-cream-heading font-black text-5xl leading-none shrink-0"
                style={{ color: 'rgba(194,112,62,0.2)' }}>

                {String(idx + 1).padStart(2, '0')}
              </span>
              <div>
                <h3
                  className="rust-cream-heading font-bold text-xl mb-2"
                  style={{ color: '#3D2B1F' }}>

                  {item.title}
                </h3>
                <p style={{ color: '#8B7355' }}>{item.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
