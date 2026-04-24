import { Node } from '../../shared/Node';
import type { GreenGoldContent } from '../../green-gold.schema';
import { TESTIMONIAL_GRADIENTS } from './shared';

type Props = { content: GreenGoldContent };

export function Testimonials({ content }: Props) {
  const t = content.testimonials;
  return (
    <section
      className="py-16 md:py-24"
      style={{ background: '#F0FDF4' }}>

      <div className="max-w-6xl mx-auto px-6">
        <p
          className="green-gold-heading font-bold text-sm uppercase tracking-wider mb-2 text-center"
          style={{ color: '#CA8A04' }}>

          <Node id="testimonials.eyebrow" role="label">{t.eyebrow}</Node>
        </p>
        <h2
          className="green-gold-heading font-black text-3xl md:text-4xl text-center mb-12"
          style={{ color: '#1A2E1A' }}>

          <Node id="testimonials.headline" role="heading">{t.headline}</Node>
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {t.items.map((item, idx) =>
          <article
            key={`testimonial-${idx}`}
            className="bg-white rounded-xl p-6 shadow-sm"
            style={{ border: '1px solid #DCFCE7' }}>

              <div
              className="flex gap-0.5 text-sm mb-3"
              style={{ color: '#EAB308' }}>

                ★★★★★
              </div>
              <p
              className="italic mb-4"
              style={{ color: 'rgba(26,46,26,0.6)' }}>

                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                className="green-gold-avatar-sm"
                style={{
                  background:
                  TESTIMONIAL_GRADIENTS[idx % TESTIMONIAL_GRADIENTS.length]
                }}>

                  {item.initials}
                </div>
                <div>
                  <p
                  className="green-gold-heading font-bold text-sm"
                  style={{ color: '#1A2E1A' }}>

                    {item.name}
                  </p>
                  <p
                  className="text-xs"
                  style={{ color: 'rgba(26,46,26,0.3)' }}>

                    {item.location}
                  </p>
                </div>
              </div>
            </article>
          )}
        </div>
      </div>
    </section>);

}
