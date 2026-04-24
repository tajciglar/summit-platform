import { Node } from '../../shared/Node';
import type { LimeInkContent } from '../../lime-ink.schema';
import { SALES_INK } from './shared';

type Props = {
  content: NonNullable<LimeInkContent['upgradeSection']>;
};

export function UpgradeSection({ content }: Props) {
  const u = content;
  return (
    <section
      className="py-20 md:py-24 lime-ink-hairline-b"
      style={{ background: SALES_INK.SURFACE }}>

      <div className="max-w-3xl mx-auto px-6 text-center">
        <p
          className="lime-ink-mono mb-4"
          style={{
            fontSize: '0.7rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: SALES_INK.LIME_DARK
          }}>

          <Node id="upgradeSection.eyebrow" role="label">{u.eyebrow}</Node>
        </p>
        <h2 className="font-black text-4xl md:text-5xl leading-[1.05] tracking-[-0.03em] mb-8">
          <Node id="upgradeSection.headline" role="heading">{u.headline}</Node>
        </h2>
        {u.paragraphs.map((p, idx) =>
        <p
          key={`upgrade-p-${idx}`}
          className="text-lg leading-relaxed mb-4"
          style={{ color: SALES_INK.INK500 }}>

            {p}
          </p>
        )}
      </div>
    </section>);

}
