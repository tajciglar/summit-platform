import { Node } from '../../shared/Node';
import type { GreenGoldContent } from '../../green-gold.schema';
import { FOUNDER_GRADIENTS } from './shared';

type Props = { content: GreenGoldContent };

export function Founders({ content }: Props) {
  const f = content.founders;
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-6">
        <h2
          className="green-gold-heading font-black text-3xl md:text-4xl text-center mb-12"
          style={{ color: '#1A2E1A' }}>

          <Node id="founders.headline" role="heading">{f.headline}</Node>
        </h2>
        <div className="grid md:grid-cols-2 gap-12">
          {f.items.map((founder, idx) =>
          <div
            key={`founder-${idx}`}
            className="flex flex-col items-center text-center">

              <div
              className="green-gold-avatar mb-4"
              style={{
                width: '100px',
                height: '100px',
                fontSize: '1.5rem',
                background:
                FOUNDER_GRADIENTS[idx % FOUNDER_GRADIENTS.length]
              }}>

                {founder.initials}
              </div>
              <h3
              className="green-gold-heading font-bold text-xl"
              style={{ color: '#1A2E1A' }}>

                {founder.name}
              </h3>
              <p
              className="text-sm mb-4"
              style={{ color: 'rgba(26,46,26,0.4)' }}>

                {founder.role}
              </p>
              <p
              className="text-sm leading-relaxed max-w-sm"
              style={{ color: 'rgba(26,46,26,0.6)' }}>

                &ldquo;{founder.quote}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>
    </section>);

}
