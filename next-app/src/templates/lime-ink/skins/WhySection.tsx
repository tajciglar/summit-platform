import { Node } from '../../shared/Node';
import type { LimeInkContent } from '../../lime-ink.schema';
import { SALES_INK } from './shared';

type Props = {
  content: NonNullable<LimeInkContent['whySection']>;
};

export function WhySection({ content }: Props) {
  const w = content;
  return (
    <section
      className="py-20 md:py-24 lime-ink-hairline-b"
      style={{ background: SALES_INK.SURFACE }}>

      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="font-black text-4xl md:text-5xl leading-[1.05] tracking-[-0.03em] mb-4">
          <Node id="whySection.headline" role="heading">{w.headline}</Node>
        </h2>
        <p
          className="lime-ink-mono mb-8"
          style={{
            fontSize: '0.8rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: SALES_INK.LIME_DARK,
            fontWeight: 700
          }}>

          <Node id="whySection.subheadline" role="heading">{w.subheadline}</Node>
        </p>
        {w.paragraphs.map((p, i) =>
        <p
          key={`why-p-${i}`}
          className="text-lg leading-relaxed mb-5"
          style={{ color: SALES_INK.INK500 }}>

            {p}
          </p>
        )}
      </div>
    </section>);

}
