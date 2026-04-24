import { Node } from '../../shared/Node';
import type { LimeInkContent } from '../../lime-ink.schema';

type Props = {
  content: {
    section: LimeInkContent['faqSection'];
    items: LimeInkContent['faqs'];
  };
};

export function Faq({ content }: Props) {
  const { section, items } = content;
  return (
    <section className="bg-white py-20 md:py-28 lime-ink-hairline-b">
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-4">
          <span
            className="lime-ink-mono text-xs"
            style={{ color: '#71717A' }}>

            <Node id="faqSection.sectionLabel" role="body">{section.sectionLabel}</Node>
          </span>
          <span
            className="h-[1px] w-12"
            style={{ background: '#E4E4E7' }}>
          </span>
        </div>
        <h2 className="font-black text-4xl md:text-5xl tracking-[-0.03em] mb-12">
          <Node id="faqSection.headline" role="heading">{section.headline}</Node>
        </h2>
        <div>
          {items.map((faq, idx) =>
          <details key={`faq-${idx}`}>
              <summary>
                {faq.question}
                <span className="lime-ink-plus-icon">+</span>
              </summary>
              <p
              className="pb-6 leading-relaxed"
              style={{ color: '#52525B' }}>

                {faq.answer}
              </p>
            </details>
          )}
        </div>
      </div>
    </section>);

}
