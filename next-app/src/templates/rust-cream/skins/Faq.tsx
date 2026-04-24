import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';

type Props = {
  content: SectionContentMap['faq'];
};

export function Faq({ content }: Props) {
  const { section, items } = content;
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: '#F5EDE4' }}>
      <div className="max-w-3xl mx-auto px-6">
        <p
          className="rust-cream-heading font-bold text-sm uppercase tracking-wider mb-2 text-center"
          style={{ color: '#C2703E' }}>

          <Node id="faqSection.eyebrow" role="label">{section.eyebrow}</Node>
        </p>
        <h2
          className="rust-cream-heading font-black text-3xl md:text-4xl text-center mb-12"
          style={{ color: '#3D2B1F' }}>

          <Node id="faqSection.headline" role="heading">{section.headline}</Node>
        </h2>
        <div className="space-y-3">
          {items.map((faq, idx) =>
            <details
              key={`faq-${idx}`}
              className="rounded-3xl overflow-hidden"
              style={{ backgroundColor: '#FDF8F3', border: '1px solid #E8C4A8' }}
              open={idx === 0}>

              <summary
                className="flex items-center justify-between px-7 py-4 rust-cream-heading font-bold"
                style={{ color: '#3D2B1F' }}>

                {faq.question}
                <span className="rust-cream-chevron text-xl" style={{ color: '#C2703E' }} aria-hidden="true">
                  ▼
                </span>
              </summary>
              <div className="px-7 pb-5 -mt-1" style={{ color: '#8B7355' }}>
                {faq.answer}
              </div>
            </details>
          )}
        </div>
      </div>
    </section>
  );
}
