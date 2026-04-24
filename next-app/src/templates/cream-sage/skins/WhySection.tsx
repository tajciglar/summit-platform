import type { CreamSageContent } from '../../cream-sage.schema';
import { Node } from '../../shared/Node';
import { CS_SALES } from './shared';

type Props = { content: CreamSageContent };

export function WhySection({ content }: Props) {
  if (!content.whySection) return null;
  const w = content.whySection;
  return (
    <section className="py-20 md:py-24" style={{ background: CS_SALES.CREAM_DEEP }}>
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h2
          className="font-black text-4xl md:text-5xl leading-tight mb-4"
          style={{ fontFamily: "'Fraunces', serif", color: CS_SALES.INK }}
        >
          <Node id="whySection.headline">{w.headline}</Node>
        </h2>
        <p
          className="text-xl md:text-2xl mb-8 max-w-xl mx-auto"
          style={{
            fontFamily: "'Fraunces', serif",
            fontStyle: 'italic',
            color: CS_SALES.SAGE,
            lineHeight: 1.5,
          }}
        >
          <Node id="whySection.subheadline">{w.subheadline}</Node>
        </p>
        {w.paragraphs.map((p, idx) => (
          <p
            key={`why-p-${idx}`}
            className="text-lg md:text-xl leading-[1.7] mb-5"
            style={{ color: CS_SALES.INK_SOFT }}
          >
            <Node id={`whySection.paragraphs.${idx}`}>{p}</Node>
          </p>
        ))}
      </div>
    </section>
  );
}
