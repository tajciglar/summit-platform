import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { INK, LAV } from './shared';

type Props = { content: SectionContentMap['testimonials'] };

export function Testimonials({ content }: Props) {
  const t = content;
  return (
    <section className="py-16" style={{ background: '#F4EFFA' }}>
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="text-center mb-10">
          <p className="indigo-gold-eyebrow-head mb-2"><Node id="testimonials.eyebrow" role="label">{t.eyebrow}</Node></p>
          <h2 className="indigo-gold-h2-head"><Node id="testimonials.headline" role="heading">{t.headline}</Node></h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {t.items.map((item, idx) => (
            <div key={`testi-${idx}`} className="indigo-gold-testi">
              <span className="indigo-gold-testi-qmark indigo-gold-testi-qmark-l">&ldquo;</span>
              <span className="indigo-gold-testi-qmark indigo-gold-testi-qmark-r">&rdquo;</span>
              <div
                className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center indigo-gold-display font-bold"
                style={{
                  background: `linear-gradient(135deg,${LAV.c400},${LAV.c600})`,
                  color: '#fff',
                }}
              >
                {item.initials}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: INK.c800 }}>
                &ldquo;{item.quote}&rdquo;
              </p>
              <p className="text-xs mt-3 font-semibold text-center" style={{ color: LAV.c700 }}>
                — {item.name}, {item.location}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
