import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';

type Props = {
  content: SectionContentMap['faq'];
};

export function Faq({ content }: Props) {
  const { section, items } = content;
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <span
            className="violet-sun-eyebrow mb-3 inline-block"
            style={{ color: '#6F4EE6' }}
          >
            <Node id="faqSection.eyebrow" role="label">{section.eyebrow}</Node>
          </span>
          <h2
            className="violet-sun-display font-bold text-4xl md:text-5xl tracking-[-0.03em] leading-tight"
            style={{ color: '#110833' }}
          >
            <Node id="faqSection.headlineLead" role="heading">{section.headlineLead}</Node>
            <span
              className="violet-sun-italic-serif"
              style={{ color: '#6F4EE6' }}
            >
              <Node id="faqSection.headlineAccent" role="heading">{section.headlineAccent}</Node>
            </span>
          </h2>
        </div>
        {items.map((faq, idx) => (
          <details key={`faq-${idx}`}>
            <summary>
              {faq.question}
              <span className="violet-sun-pm-icon">+</span>
            </summary>
            <p
              className="px-7 pb-6 leading-relaxed"
              style={{ color: '#544B75' }}
            >
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
