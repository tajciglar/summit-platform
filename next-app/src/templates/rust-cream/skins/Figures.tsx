import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';

type Props = {
  content: SectionContentMap['figures'];
};

export function Figures({ content: f }: Props) {
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: '#FDF8F3' }}>
      <div className="max-w-5xl mx-auto px-6">
        <p
          className="rust-cream-heading font-bold text-sm uppercase tracking-wider mb-2 text-center"
          style={{ color: '#C2703E' }}>

          <Node id="figures.eyebrow" role="label">{f.eyebrow}</Node>
        </p>
        <h2
          className="rust-cream-heading font-black text-3xl md:text-4xl text-center mb-12"
          style={{ color: '#3D2B1F' }}>

          <Node id="figures.headline" role="heading">{f.headline}</Node>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {f.items.map((item, idx) =>
            <div
              key={`figure-${idx}`}
              className="rounded-xl p-6 text-center"
              style={{ backgroundColor: '#F5EDE4', border: '1px solid #E8C4A8' }}>

              <p
                className="rust-cream-heading font-black text-4xl mb-2"
                style={{ color: '#C2703E' }}>

                {item.value}
              </p>
              <p className="text-sm" style={{ color: '#8B7355' }}>
                {item.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
