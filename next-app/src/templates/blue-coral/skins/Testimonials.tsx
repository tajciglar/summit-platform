import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { TESTIMONIAL_SMALL_GRADIENTS } from './shared';

type Props = {
  content: SectionContentMap['testimonials'];
};

export function Testimonials({ content }: Props) {
  const t = content;
  return (
    <section className="py-16 md:py-24" style={{ background: '#F8FAFC' }}>
      <div className="max-w-4xl mx-auto px-6">
        <p
          className="blue-coral-heading font-bold text-sm uppercase tracking-wider mb-2 text-center"
          style={{ color: '#F87171' }}>

          <Node id="testimonials.eyebrow" role="label">{t.eyebrow}</Node>
        </p>
        <h2
          className="blue-coral-heading font-black text-3xl md:text-4xl text-center mb-12"
          style={{ color: '#1E293B' }}>

          <Node id="testimonials.headline" role="heading">{t.headline}</Node>
        </h2>

        {/* Featured large testimonial */}
        <div
          className="rounded-2xl p-8 md:p-12 relative max-w-3xl mx-auto"
          style={{
            background: '#FFFFFF',
            border: '1px solid #F3F4F6',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
          }}>

          <svg
            className="absolute top-6 left-6 w-16 h-16 opacity-60"
            style={{ color: '#DBEAFE' }}
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true">

            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
          </svg>
          <div className="relative z-10">
            <div
              className="inline-flex gap-0.5 text-lg mb-5 justify-center w-full"
              style={{ color: '#F87171' }}
              aria-hidden="true">

              ★★★★★
            </div>
            <p
              className="text-xl md:text-2xl italic leading-relaxed text-center mb-8"
              style={{ color: '#374151' }}>

              &ldquo;{t.featured.quote}&rdquo;
            </p>
            <div className="flex items-center justify-center gap-4">
              <div
                className="blue-coral-avatar-sm"
                style={{
                  background: 'linear-gradient(135deg,#2563EB,#1B3A5C)'
                }}>

                {t.featured.initials}
              </div>
              <div className="text-left">
                <p
                  className="blue-coral-heading font-bold"
                  style={{ color: '#1E293B' }}>

                  {t.featured.name}
                </p>
                <p className="text-sm" style={{ color: '#9CA3AF' }}>
                  {t.featured.location}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Small supporting quotes */}
        <div className="grid md:grid-cols-2 gap-4 mt-8 max-w-3xl mx-auto">
          {t.supporting.map((item, idx) =>
          <div
            key={`supporting-${idx}`}
            className="rounded-xl p-5"
            style={{
              background: '#FFFFFF',
              border: '1px solid #F3F4F6',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}>

              <p
              className="italic text-sm mb-3"
              style={{ color: '#4B5563' }}>

                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                className="blue-coral-avatar-xs"
                style={{
                  background:
                  TESTIMONIAL_SMALL_GRADIENTS[
                  idx % TESTIMONIAL_SMALL_GRADIENTS.length]

                }}>

                  {item.initials}
                </div>
                <div>
                  <p
                  className="blue-coral-heading font-bold text-xs"
                  style={{ color: '#1E293B' }}>

                    {item.name}
                  </p>
                  <p className="text-[11px]" style={{ color: '#9CA3AF' }}>
                    {item.location}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

}
