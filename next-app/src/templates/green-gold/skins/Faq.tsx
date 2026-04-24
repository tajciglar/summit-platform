import { Node } from '../../shared/Node';
import type { GreenGoldContent } from '../../green-gold.schema';

type Props = { content: GreenGoldContent };

export function Faq({ content }: Props) {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-6">
        <p
          className="green-gold-heading font-bold text-sm uppercase tracking-wider mb-2 text-center"
          style={{ color: '#16A34A' }}>

          <Node id="faqSection.eyebrow" role="label">{content.faqSection.eyebrow}</Node>
        </p>
        <h2
          className="green-gold-heading font-black text-3xl md:text-4xl text-center mb-12"
          style={{ color: '#1A2E1A' }}>

          <Node id="faqSection.headline" role="heading">{content.faqSection.headline}</Node>
        </h2>
        <div className="space-y-4">
          {content.faqs.map((faq, idx) =>
          <details
            key={`faq-${idx}`}
            className="bg-white rounded-xl shadow-sm"
            style={{
              border: '1px solid #DCFCE7',
              borderLeft: '4px solid #16A34A'
            }}>

              <summary
              className="flex items-center justify-between p-5 green-gold-heading font-bold"
              style={{ color: '#1A2E1A' }}>

                {faq.question}
                <span
                className="green-gold-chevron text-xl"
                style={{ color: '#16A34A' }}
                aria-hidden="true">

                  ▼
                </span>
              </summary>
              <div
              className="px-5 pb-5"
              style={{ color: 'rgba(26,46,26,0.6)' }}>

                {faq.answer}
              </div>
            </details>
          )}
        </div>
      </div>
    </section>);

}
