import type { CreamSageContent } from '../../cream-sage.schema';
import { Node } from '../../shared/Node';
import { CS_SALES } from './shared';

type Props = { content: CreamSageContent };

export function Intro({ content }: Props) {
  if (!content.intro) return null;
  const i = content.intro;
  return (
    <section className="py-20 md:py-24" style={{ background: CS_SALES.CREAM }}>
      <div className="max-w-2xl mx-auto px-6 text-center">
        <span
          className="cream-sage-eyebrow mb-3 inline-block"
          style={{ color: CS_SALES.CLAY }}
        >
          <Node id="intro.eyebrow">{i.eyebrow}</Node>
        </span>
        <h2
          className="font-black text-4xl md:text-5xl leading-tight mb-8"
          style={{ fontFamily: "'Fraunces', serif", color: CS_SALES.INK }}
        >
          <Node id="intro.headline">{i.headline}</Node>
        </h2>
        {i.paragraphs.map((p, idx) => (
          <p
            key={`intro-p-${idx}`}
            className={`text-xl md:text-2xl leading-[1.7] mb-6 ${idx === 0 ? 'cream-sage-dropcap' : ''}`}
            style={{ color: CS_SALES.INK_SOFT }}
          >
            <Node id={`intro.paragraphs.${idx}`}>{p}</Node>
          </p>
        ))}
      </div>
    </section>
  );
}
