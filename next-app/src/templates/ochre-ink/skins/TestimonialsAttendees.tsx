import type { TestimonialsAttendeesContent } from '../../../sections/testimonials-attendees.schema';
import { TESTIMONIAL_GRADIENTS } from './shared';

type Props = {
  content: TestimonialsAttendeesContent;
};

export function TestimonialsAttendees({ content }: Props) {
  return (
    <section className="bg-paper-50 py-20 md:py-28 border-b border-paper-300">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="roman mb-2">{content.roman}</p>
          <h2 className="font-display font-black text-4xl md:text-5xl text-ink-700 leading-tight mb-4">
            {content.headline}
          </h2>
          <p className="font-opus-serif italic text-taupe-600 text-lg">{content.subhead}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {content.items.map((item, idx) => (
            <article key={`testimonial-${idx}`} className="bg-paper-100 border border-paper-300 p-8">
              <div className="text-ochre-600 font-display text-4xl leading-none mb-3">&ldquo;</div>
              <p className="font-opus-serif italic text-ink-700 text-lg leading-relaxed mb-6">
                {item.quote}
              </p>
              <div className="flex items-center gap-3 pt-5 border-t border-paper-300">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-xs text-paper-50"
                  style={{ background: TESTIMONIAL_GRADIENTS[idx % TESTIMONIAL_GRADIENTS.length] }}
                >
                  {item.initials}
                </div>
                <div>
                  <p className="font-display font-bold text-sm text-ink-700">{item.name}</p>
                  <p className="figure-label">{item.location}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
