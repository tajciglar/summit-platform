import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';

type Props = {
  content: SectionContentMap['faq'];
};

export function FAQ({ content }: Props) {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-6">
        <p
          className="blue-coral-heading font-bold text-sm uppercase tracking-wider mb-2 text-center"
          style={{ color: '#2563EB' }}>

          <Node id="faqSection.eyebrow" role="label">{content.faqSection.eyebrow}</Node>
        </p>
        <h2
          className="blue-coral-heading font-black text-3xl md:text-4xl text-center mb-12"
          style={{ color: '#1E293B' }}>

          <Node id="faqSection.headline" role="heading">{content.faqSection.headline}</Node>
        </h2>
        <div className="space-y-3">
          {content.items.map((faq, idx) =>
          <details
            key={`faq-${idx}`}
            className="rounded-xl"
            style={{
              background: '#F0F7FF',
              border: '1px solid #DBEAFE'
            }}
            open={idx === 0}>

              <summary
              className="flex items-center justify-between p-5 blue-coral-heading font-bold"
              style={{ color: '#1E293B' }}>

                {faq.question}
                <span
                className="blue-coral-chevron text-xl"
                style={{ color: '#2563EB' }}
                aria-hidden="true">

                  ▼
                </span>
              </summary>
              <div className="px-5 pb-5" style={{ color: '#4B5563' }}>
                {faq.answer}
              </div>
            </details>
          )}
        </div>
      </div>
    </section>);

}
