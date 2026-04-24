import { Node } from '../../shared/Node';
import type { LimeInkContent } from '../../lime-ink.schema';
import { SALES_INK, SalesBonusIcon } from './shared';

type Props = {
  content: NonNullable<LimeInkContent['vipBonuses']>;
};

export function VipBonuses({ content }: Props) {
  const v = content;
  return (
    <section
      className="py-20 md:py-28 lime-ink-hairline-b"
      style={{ background: SALES_INK.SURFACE }}>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-4">
          <span
            className="lime-ink-mono text-xs"
            style={{ color: SALES_INK.INK400 }}>

            <Node id="vipBonuses.eyebrow" role="label">{v.eyebrow}</Node>
          </span>
          <span
            className="h-[1px] w-12"
            style={{ background: SALES_INK.SURFACE_BORDER }}>
          </span>
        </div>
        <h2 className="font-black text-4xl md:text-5xl leading-[1.05] tracking-[-0.03em] mb-14 max-w-3xl">
          <Node id="vipBonuses.headline" role="heading">{v.headline}</Node>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {v.items.map((item, i) =>
          <article
            key={`vip-${i}`}
            className="text-white rounded-2xl p-7 flex flex-col gap-4"
            style={{
              background: SALES_INK.INK900,
              border: '1px solid rgba(196,242,69,0.18)'
            }}>

              <div className="flex items-start justify-between">
                <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{
                  background: 'rgba(196,242,69,0.08)',
                  border: '1px solid rgba(196,242,69,0.25)'
                }}>

                  <SalesBonusIcon icon={item.icon} />
                </div>
                <span
                className="lime-ink-mono px-2.5 py-1 rounded-full"
                style={{
                  fontSize: '0.65rem',
                  letterSpacing: '0.1em',
                  color: SALES_INK.INK900,
                  background: SALES_INK.LIME,
                  fontWeight: 700
                }}>

                  {item.valueLabel}
                </span>
              </div>
              <div>
                <p
                className="lime-ink-mono mb-2"
                style={{
                  fontSize: '0.65rem',
                  color: SALES_INK.INK400,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase'
                }}>

                  MOD.{String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="font-black text-xl mb-2 tracking-tight">
                  {item.title}
                </h3>
                <p
                className="text-sm leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.65)' }}>

                  {item.description}
                </p>
              </div>
            </article>
          )}
        </div>
      </div>
    </section>);

}
