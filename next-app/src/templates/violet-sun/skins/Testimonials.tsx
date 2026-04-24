import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { TESTIMONIAL_GRADIENTS, TESTIMONIAL_TEXT_COLORS } from './shared';

type Props = {
  content: SectionContentMap['testimonials'];
};

export function Testimonials({ content }: Props) {
  const t = content;
  return (
    <section className="violet-sun-grad-mist py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span
            className="violet-sun-eyebrow mb-3 inline-block"
            style={{ color: '#2A1869' }}
          >
            <Node id="testimonials.eyebrow" role="label">{t.eyebrow}</Node>
          </span>
          <h2
            className="violet-sun-display font-bold text-4xl md:text-5xl tracking-[-0.03em] leading-tight"
            style={{ color: '#110833' }}
          >
            <Node id="testimonials.headlineLead" role="heading">{t.headlineLead}</Node>
            <span
              className="violet-sun-italic-serif"
              style={{ color: '#2A1869' }}
            >
              <Node id="testimonials.headlineAccent" role="heading">{t.headlineAccent}</Node>
            </span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {t.items.map((item, idx) => (
            <article key={`testimonial-${idx}`} className="violet-sun-card-light p-8">
              <p className="violet-sun-stars mb-4">★★★★★</p>
              <p
                className="text-lg leading-relaxed mb-6"
                style={{ color: '#1E0F52' }}
              >
                &ldquo;{item.quote}&rdquo;
              </p>
              <div
                className="flex items-center gap-3 pt-5"
                style={{ borderTop: '1px solid #DCD7E6' }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center violet-sun-display font-bold text-sm"
                  style={{
                    background: TESTIMONIAL_GRADIENTS[idx % TESTIMONIAL_GRADIENTS.length],
                    color: TESTIMONIAL_TEXT_COLORS[idx % TESTIMONIAL_TEXT_COLORS.length],
                  }}
                >
                  {item.initials}
                </div>
                <div>
                  <p
                    className="violet-sun-display font-bold"
                    style={{ color: '#110833' }}
                  >
                    {item.name}
                  </p>
                  <p className="text-xs" style={{ color: '#6B638A' }}>
                    {item.location}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
