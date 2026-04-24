import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { TESTIMONIAL_AVATAR_GRADIENTS } from './shared';

type Props = {
  content: SectionContentMap['testimonials'];
};

export function Testimonials({ content: t }: Props) {
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: '#F5EDE4' }}>
      <div className="max-w-6xl mx-auto px-6">
        <p
          className="rust-cream-heading font-bold text-sm uppercase tracking-wider mb-2 text-center"
          style={{ color: '#D4A04A' }}>

          <Node id="testimonials.eyebrow" role="label">{t.eyebrow}</Node>
        </p>
        <h2
          className="rust-cream-heading font-black text-3xl md:text-4xl text-center mb-12"
          style={{ color: '#3D2B1F' }}>

          <Node id="testimonials.headline" role="heading">{t.headline}</Node>
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {t.items.map((item, idx) =>
            <div
              key={`testimonial-${idx}`}
              className="bg-white rounded-xl p-6 shadow-sm"
              style={{ border: '1px solid #E8C4A8' }}>

              <div className="text-sm mb-3" style={{ color: '#D4A04A' }} aria-hidden="true">
                ★★★★★
              </div>
              <p className="italic mb-4" style={{ color: '#8B7355' }}>
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="rust-cream-avatar-sm"
                  style={{
                    background:
                      TESTIMONIAL_AVATAR_GRADIENTS[idx % TESTIMONIAL_AVATAR_GRADIENTS.length]
                  }}>

                  {item.initials}
                </div>
                <div>
                  <p
                    className="rust-cream-heading font-bold text-sm"
                    style={{ color: '#3D2B1F' }}>

                    {item.name}
                  </p>
                  <p className="text-xs" style={{ color: '#8B7355' }}>
                    {item.location}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
