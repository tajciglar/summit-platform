import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { Icon, LAV } from './shared';

type Props = { content: SectionContentMap['faq'] };

export function Faq({ content }: Props) {
  return (
    <section className="py-16" style={{ background: '#F4EFFA' }}>
      <div className="max-w-3xl mx-auto px-5 md:px-8">
        <div className="text-center mb-10">
          <p className="indigo-gold-eyebrow-head mb-2"><Node id="faqSection.eyebrow" role="label">{content.section.eyebrow}</Node></p>
          <h2 className="indigo-gold-h2-head"><Node id="faqSection.headline" role="heading">{content.section.headline}</Node></h2>
        </div>
        {content.items.map((faq, idx) => (
          <details className="indigo-gold-qa" key={`faq-${idx}`}>
            <summary>
              <span>{faq.question}</span>
              <Icon id="chevron-down" className="w-5 h-5" style={{ color: LAV.c700 }} />
            </summary>
            <div className="indigo-gold-qa-body">{faq.answer}</div>
          </details>
        ))}
        <div className="text-center mt-8">
          <a href="#optin" className="indigo-gold-btn-cta">
            Get Instant Access
            <span className="indigo-gold-btn-arrow">
              <Icon id="arrow-right" className="w-3.5 h-3.5" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
