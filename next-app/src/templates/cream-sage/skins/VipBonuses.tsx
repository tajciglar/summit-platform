import type { CreamSageContent } from '../../cream-sage.schema';
import { Node } from '../../shared/Node';
import { CS_SALES, CsSalesBonusIcon, csSalesIconLabels } from './shared';

type Props = { content: CreamSageContent };

export function VipBonuses({ content }: Props) {
  if (!content.vipBonuses) return null;
  const v = content.vipBonuses;
  return (
    <section className="py-20 md:py-24" style={{ background: CS_SALES.CREAM_DEEP }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span
            className="cream-sage-eyebrow mb-3 inline-block"
            style={{ color: CS_SALES.CLAY }}
          >
            <Node id="vipBonuses.eyebrow">{v.eyebrow}</Node>
          </span>
          <h2
            className="font-black text-4xl md:text-5xl leading-tight"
            style={{ fontFamily: "'Fraunces', serif", color: CS_SALES.INK }}
          >
            <Node id="vipBonuses.headline">{v.headline}</Node>
          </h2>
        </div>
        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}
        >
          {v.items.map((item, idx) => (
            <article
              key={`vip-bonus-${idx}`}
              className="cream-sage-soft-card overflow-hidden"
            >
              <div
                className="flex flex-col items-center justify-center gap-3 py-10 px-5"
                style={{
                  background: CS_SALES.SAGE_SOFT,
                  borderBottom: `1px solid ${CS_SALES.SAGE_LINE}`,
                }}
              >
                <CsSalesBonusIcon icon={item.icon} />
                <span
                  style={{
                    fontFamily: "'Fraunces', serif",
                    fontStyle: 'italic',
                    color: CS_SALES.SAGE_DEEP,
                    fontSize: '1.05rem',
                  }}
                >
                  {csSalesIconLabels[item.icon] ?? item.icon}
                </span>
              </div>
              <div className="px-7 py-6">
                <h3
                  className="font-bold text-xl mb-2"
                  style={{ fontFamily: "'Fraunces', serif", color: CS_SALES.INK }}
                >
                  <Node id={`vipBonuses.items.${idx}.title`}>{item.title}</Node>
                </h3>
                <p
                  className="text-base mb-4 leading-relaxed"
                  style={{ color: CS_SALES.INK_SOFT }}
                >
                  <Node id={`vipBonuses.items.${idx}.description`}>{item.description}</Node>
                </p>
                <span
                  className="inline-block"
                  style={{
                    background: CS_SALES.CREAM,
                    border: `1px solid ${CS_SALES.SAGE_LINE}`,
                    color: CS_SALES.SAGE_DEEP,
                    fontFamily: "'Nunito', 'DM Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    padding: '0.35rem 0.85rem',
                    borderRadius: 999,
                  }}
                >
                  <Node id={`vipBonuses.items.${idx}.valueLabel`}>{item.valueLabel}</Node>
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
