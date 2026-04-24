import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';

type Props = {
  content: SectionContentMap['figures'];
};

export function Figures({ content }: Props) {
  const f = content;
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-6">
        <p
          className="blue-coral-heading font-bold text-sm uppercase tracking-wider mb-2 text-center"
          style={{ color: '#2563EB' }}>

          <Node id="figures.eyebrow" role="label">{f.eyebrow}</Node>
        </p>
        <h2
          className="blue-coral-heading font-black text-3xl md:text-4xl text-center mb-12"
          style={{ color: '#1E293B' }}>

          <Node id="figures.headline" role="heading">{f.headline}</Node>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {f.items.map((item, idx) =>
          <div
            key={`figure-${idx}`}
            className="rounded-xl p-6 text-center"
            style={{
              background: '#F0F7FF',
              border: '1px solid #DBEAFE'
            }}>

              <p
              className="blue-coral-heading font-black text-4xl mb-2"
              style={{ color: '#2563EB' }}>

                {item.value}
              </p>
              <p className="text-sm" style={{ color: '#6B7280' }}>
                {item.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>);

}
