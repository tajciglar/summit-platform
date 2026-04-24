import { Node } from '../../shared/Node';
import type { LimeInkContent } from '../../lime-ink.schema';
import { TESTIMONIAL_GRADIENTS, TESTIMONIAL_TEXT_COLORS } from './shared';

type Props = {
  content: LimeInkContent['testimonials'];
};

export function Testimonials({ content }: Props) {
  const t = content;
  return (
    <section className="bg-white py-20 md:py-28 lime-ink-hairline-b">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-4">
          <span
            className="lime-ink-mono text-xs"
            style={{ color: '#71717A' }}>

            <Node id="testimonials.sectionLabel" role="body">{t.sectionLabel}</Node>
          </span>
          <span
            className="h-[1px] w-12"
            style={{ background: '#E4E4E7' }}>
          </span>
        </div>
        <h2 className="font-black text-4xl md:text-6xl leading-[1.02] tracking-[-0.03em] mb-4 max-w-3xl">
          <Node id="testimonials.headlineLead" role="heading">{t.headlineLead}</Node>
          {t.headlineAccent ?
          <>
              {' '}
              <span style={{ color: '#AEE02B' }}><Node id="testimonials.headlineAccent" role="heading">{t.headlineAccent}</Node></span>
              {' '}
            </> :
          null}
          <span style={{ color: '#71717A' }}><Node id="testimonials.headlineTrail" role="heading">{t.headlineTrail}</Node></span>
        </h2>
        <p className="text-lg mb-14" style={{ color: '#52525B' }}>
          <Node id="testimonials.subhead" role="subheading">{t.subhead}</Node>
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {t.items.map((item, idx) =>
          <article
            key={`testimonial-${idx}`}
            className="rounded-2xl p-8"
            style={{
              background: '#F4F4F5',
              border: '1px solid #E4E4E7'
            }}>

              <p
              className="text-xl font-bold mb-4 tracking-widest"
              style={{ color: '#AEE02B' }}>

                ★★★★★
              </p>
              <p
              className="text-lg leading-relaxed mb-6"
              style={{ color: '#18181B' }}>

                &ldquo;{item.quote}&rdquo;
              </p>
              <div
              className="flex items-center gap-3 pt-5"
              style={{ borderTop: '1px solid #E4E4E7' }}>

                <div
                className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm"
                style={{
                  background:
                  TESTIMONIAL_GRADIENTS[idx % TESTIMONIAL_GRADIENTS.length],
                  color:
                  TESTIMONIAL_TEXT_COLORS[
                  idx % TESTIMONIAL_TEXT_COLORS.length]

                }}>

                  {item.initials}
                </div>
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p
                  className="lime-ink-mono text-xs mt-0.5"
                  style={{ color: '#71717A' }}>

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
