import type { FaqContent } from '../../../sections/faq.schema';

type Props = {
  content: FaqContent;
};

export function Faq({ content }: Props) {
  return (
    <section className="bg-paper-50 py-20 md:py-28 border-b border-paper-300">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="roman mb-2">X.</p>
          <h2 className="font-display font-black text-4xl md:text-5xl text-ink-700 leading-tight">
            Questions, Answered
          </h2>
        </div>
        <div className="border-t border-paper-300">
          {content.items.map((faq, idx) => (
            <details key={`faq-${idx}`}>
              <summary>{faq.question}</summary>
              <div className="pb-5 text-taupe-700 font-opus-serif leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
