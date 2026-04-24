import { Node } from '../../shared/Node';
import type { GreenGoldContent } from '../../green-gold.schema';

type Props = { content: GreenGoldContent };

export function Press({ content }: Props) {
  const items = [...content.press.outlets, ...content.press.outlets];
  return (
    <section className="bg-white py-10">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p
          className="green-gold-heading text-xs font-bold uppercase mb-6"
          style={{
            letterSpacing: '0.2em',
            color: 'rgba(26,46,26,0.3)'
          }}>

          <Node id="press.eyebrow" role="label">{content.press.eyebrow}</Node>
        </p>
        <div className="green-gold-marquee-wrap">
          <div className="green-gold-marquee-track">
            {items.map((name, idx) =>
            <span key={`press-${idx}`} className="green-gold-marquee-item">
                {name}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>);

}
