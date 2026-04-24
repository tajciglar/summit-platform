import { Node } from '../../shared/Node';
import type { GreenGoldContent } from '../../green-gold.schema';

type Props = { content: GreenGoldContent };

export function Figures({ content }: Props) {
  const f = content.figures;
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-6">
        <p
          className="green-gold-heading font-bold text-sm uppercase tracking-wider mb-2 text-center"
          style={{ color: '#16A34A' }}>

          <Node id="figures.eyebrow" role="label">{f.eyebrow}</Node>
        </p>
        <h2
          className="green-gold-heading font-black text-3xl md:text-4xl text-center mb-12"
          style={{ color: '#1A2E1A' }}>

          <Node id="figures.headline" role="heading">{f.headline}</Node>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {f.items.map((item, idx) =>
          <div
            key={`figure-${idx}`}
            className="rounded-xl p-6 text-center"
            style={{
              background: '#F0FDF4',
              border: '1px solid #DCFCE7'
            }}>

              <p
              className="green-gold-heading font-black text-4xl mb-2"
              style={{ color: '#16A34A' }}>

                {item.value}
              </p>
              <p
              className="text-sm"
              style={{ color: 'rgba(26,46,26,0.55)' }}>

                {item.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>);

}
