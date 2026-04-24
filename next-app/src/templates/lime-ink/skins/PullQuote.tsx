import { Node } from '../../shared/Node';
import type { LimeInkContent } from '../../lime-ink.schema';

type Props = {
  content: LimeInkContent['pullQuote'];
};

export function PullQuote({ content }: Props) {
  const pq = content;
  return (
    <section
      className="text-white py-24 md:py-32"
      style={{ background: '#0A0A0B' }}>

      <div className="max-w-4xl mx-auto px-6">
        <span
          className="lime-ink-mono text-xs block mb-6"
          style={{ color: '#C4F245' }}>

          <Node id="pullQuote.eyebrow" role="label">{pq.eyebrow}</Node>
        </span>
        <p className="font-black text-4xl md:text-6xl leading-[1.08] tracking-[-0.03em] mb-8">
          &ldquo;<Node id="pullQuote.quote" role="quote">{pq.quote}</Node>&rdquo;
        </p>
        <div className="flex items-center gap-4">
          <span
            className="w-12 h-[1px]"
            style={{ background: '#C4F245' }}>
          </span>
          <p
            className="lime-ink-mono text-xs"
            style={{ color: '#71717A' }}>

            <Node id="pullQuote.attribution" role="body">{pq.attribution}</Node>
          </p>
        </div>
      </div>
    </section>);

}
