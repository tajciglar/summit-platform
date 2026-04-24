import type { CreamSageContent } from '../../cream-sage.schema';
import { Node } from '../../shared/Node';
import { CS_SALES } from './shared';

type Props = { content: CreamSageContent };

export function UpgradeSection({ content }: Props) {
  if (!content.upgradeSection) return null;
  const u = content.upgradeSection;
  return (
    <section className="py-20 md:py-24" style={{ background: CS_SALES.CREAM_DEEP }}>
      <div className="max-w-2xl mx-auto px-6 text-center">
        <span
          className="cream-sage-eyebrow mb-3 inline-block"
          style={{ color: CS_SALES.CLAY }}
        >
          <Node id="upgradeSection.eyebrow">{u.eyebrow}</Node>
        </span>
        <h2
          className="font-black text-4xl md:text-5xl leading-tight mb-8"
          style={{ fontFamily: "'Fraunces', serif", color: CS_SALES.INK }}
        >
          <Node id="upgradeSection.headline">{u.headline}</Node>
        </h2>
        {u.paragraphs.map((p, idx) => (
          <p
            key={`upgrade-p-${idx}`}
            className="text-xl leading-[1.7] mb-5"
            style={{ color: CS_SALES.INK_SOFT }}
          >
            <Node id={`upgradeSection.paragraphs.${idx}`}>{p}</Node>
          </p>
        ))}
      </div>
    </section>
  );
}
