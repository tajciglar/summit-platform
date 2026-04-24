import type { CreamSageContent } from '../../cream-sage.schema';
import { Node } from '../../shared/Node';
import { TESTIMONIAL_GRADIENTS } from './shared';

type Props = { content: CreamSageContent };

export function Testimonials({ content }: Props) {
  const t = content.testimonials;
  return (
    <section className="py-20 md:py-28" style={{ background: 'var(--cs-paper-alt, #F4EDE2)' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span
            className="cream-sage-eyebrow mb-3 inline-block"
            style={{ color: '#A85430' }}
          >
            <Node id="testimonials.eyebrow">{t.eyebrow}</Node>
          </span>
          <h2
            className="font-black text-4xl md:text-5xl leading-tight"
            style={{ fontFamily: "'Fraunces', serif", color: '#2A2419' }}
          >
            <Node id="testimonials.headlineLead">{t.headlineLead}</Node>
            <span style={{ fontStyle: 'italic', color: '#4A6B5D' }}>
              <Node id="testimonials.headlineAccent">{t.headlineAccent}</Node>
            </span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {t.items.map((item, idx) => (
            <article key={`testimonial-${idx}`} className="cream-sage-soft-card p-8">
              <p
                className="font-bold tracking-widest text-lg mb-3"
                style={{ color: '#A85430' }}
              >
                ★ ★ ★ ★ ★
              </p>
              <p
                className="text-xl md:text-2xl leading-relaxed mb-7"
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontStyle: 'italic',
                  color: '#2A2419',
                }}
              >
                &ldquo;<Node id={`testimonials.items.${idx}.quote`}>{item.quote}</Node>&rdquo;
              </p>
              <div
                className="flex items-center gap-3 pt-5"
                style={{ borderTop: '1px solid rgba(179,195,183,0.4)' }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-base"
                  style={{
                    background:
                      TESTIMONIAL_GRADIENTS[idx % TESTIMONIAL_GRADIENTS.length],
                    color: '#FAF7F2',
                    fontFamily: "'Nunito', 'DM Sans', sans-serif",
                  }}
                >
                  <Node id={`testimonials.items.${idx}.initials`}>{item.initials}</Node>
                </div>
                <div>
                  <p
                    className="font-bold text-lg"
                    style={{ fontFamily: "'Fraunces', serif", color: '#2F4A40' }}
                  >
                    <Node id={`testimonials.items.${idx}.name`}>{item.name}</Node>
                  </p>
                  <p className="text-base" style={{ color: '#6B5E4C' }}>
                    <Node id={`testimonials.items.${idx}.location`}>{item.location}</Node>
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
