import { Node } from '../../shared/Node';
import type { GreenGoldContent } from '../../green-gold.schema';
import { OUTCOME_ICON_BG } from './shared';

type Props = { content: GreenGoldContent };

export function Outcomes({ content }: Props) {
  const o = content.outcomes;
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-6">
        <p
          className="green-gold-heading font-bold text-sm uppercase tracking-wider mb-2 text-center"
          style={{ color: '#16A34A' }}>

          <Node id="outcomes.eyebrow" role="label">{o.eyebrow}</Node>
        </p>
        <h2
          className="green-gold-heading font-black text-3xl md:text-4xl mb-12 text-center"
          style={{ color: '#1A2E1A' }}>

          <Node id="outcomes.headline" role="heading">{o.headline}</Node>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {o.items.map((item, idx) =>
          <article
            key={`outcome-${idx}`}
            className="text-center p-6 rounded-2xl"
            style={{ background: '#F0FDF4' }}>

              <div
              className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center green-gold-heading font-black text-white text-lg"
              style={{
                background: OUTCOME_ICON_BG[idx % OUTCOME_ICON_BG.length]
              }}>

                {String(idx + 1).padStart(2, '0')}
              </div>
              <p
              className="green-gold-heading font-bold"
              style={{ color: '#1A2E1A' }}>

                {item.title}
              </p>
              <p
              className="text-sm mt-1"
              style={{ color: 'rgba(26,46,26,0.5)' }}>

                {item.description}
              </p>
            </article>
          )}
        </div>
      </div>
    </section>);

}
