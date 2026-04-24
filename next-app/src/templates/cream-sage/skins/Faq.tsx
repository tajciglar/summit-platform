import type { CreamSageContent } from '../../cream-sage.schema';
import { Node } from '../../shared/Node';

type Props = { content: CreamSageContent };

export function Faq({ content }: Props) {
  return (
    <section className="py-20 md:py-28" style={{ background: 'var(--cs-paper, #FAF7F2)' }}>
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <span
            className="cream-sage-eyebrow mb-3 inline-block"
            style={{ color: '#A85430' }}
          >
            <Node id="faqSection.eyebrow">{content.faqSection.eyebrow}</Node>
          </span>
          <h2
            className="font-black text-4xl md:text-5xl leading-tight"
            style={{ fontFamily: "'Fraunces', serif", color: '#2A2419' }}
          >
            <Node id="faqSection.headline">{content.faqSection.headline}</Node>
          </h2>
        </div>
        <div>
          {content.faqs.map((faq, idx) => (
            <details key={`faq-${idx}`}>
              <summary>
                <Node id={`faqs.${idx}.question`}>{faq.question}</Node>
                <span className="cream-sage-pm-icon">+</span>
              </summary>
              <p
                className="px-7 pb-7 text-lg leading-relaxed"
                style={{ color: '#3A3221' }}
              >
                <Node id={`faqs.${idx}.answer`}>{faq.answer}</Node>
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
