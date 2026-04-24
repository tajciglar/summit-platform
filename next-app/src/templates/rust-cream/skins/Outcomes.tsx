import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';

type Props = {
  content: SectionContentMap['outcomes'];
};

export function Outcomes({ content: o }: Props) {
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: '#F5EDE4' }}>
      <div className="max-w-5xl mx-auto px-6">
        <p
          className="rust-cream-heading font-bold text-sm uppercase tracking-wider mb-2 text-center"
          style={{ color: '#C2703E' }}>

          <Node id="outcomes.eyebrow" role="label">{o.eyebrow}</Node>
        </p>
        <h2
          className="rust-cream-heading font-black text-3xl md:text-4xl mb-12 text-center"
          style={{ color: '#3D2B1F' }}>

          <Node id="outcomes.headline" role="heading">{o.headline}</Node>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {o.items.map((item, idx) => {
            const iconBg = item.accent === 'primary' ? '#C2703E' : '#5B8C5A';
            return (
              <div
                key={`outcome-${idx}`}
                className="text-center p-6 rounded-2xl"
                style={{ backgroundColor: '#FDF8F3' }}>

                <div
                  className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: iconBg }}
                  aria-hidden="true">

                  <span className="rust-cream-heading font-black text-lg text-white">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>
                <p className="rust-cream-heading font-bold" style={{ color: '#3D2B1F' }}>
                  {item.title}
                </p>
                <p className="text-sm mt-1" style={{ color: '#8B7355' }}>
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
