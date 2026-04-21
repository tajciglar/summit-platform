import type { PullQuoteContent } from '../../../sections/pull-quote.schema';

type Props = {
  content: PullQuoteContent;
};

export function PullQuote({ content }: Props) {
  return (
    <section className="bg-ink-700 py-24 md:py-32 border-b-8 border-ochre-600">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <span className="pullmark block -mb-4">&ldquo;</span>
        <p className="font-display font-black text-3xl md:text-5xl text-paper-50 leading-[1.15] mb-8 italic">
          {content.quote}
        </p>
        <div className="inline-flex items-center gap-4">
          <span className="w-12 h-[1px] bg-ochre-500"></span>
          <p className="figure-label text-ochre-400">{content.attribution}</p>
          <span className="w-12 h-[1px] bg-ochre-500"></span>
        </div>
      </div>
    </section>
  );
}
