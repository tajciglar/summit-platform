import { Node } from '../../shared/Node';
import type { LimeInkContent } from '../../lime-ink.schema';
import { SALES_INK, SalesCheckIcon, SalesXIcon } from './shared';

type Props = {
  content: NonNullable<LimeInkContent['comparisonTable']>;
};

export function ComparisonTable({ content }: Props) {
  const c = content;
  return (
    <section
      className="py-20 md:py-28 lime-ink-hairline-b"
      style={{ background: SALES_INK.SURFACE }}>

      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-4">
          <span
            className="lime-ink-mono text-xs"
            style={{ color: SALES_INK.INK400 }}>

            <Node id="comparisonTable.eyebrow" role="label">{c.eyebrow}</Node>
          </span>
          <span
            className="h-[1px] w-12"
            style={{ background: SALES_INK.SURFACE_BORDER }}>
          </span>
        </div>
        <h2 className="font-black text-4xl md:text-5xl leading-[1.05] tracking-[-0.03em] mb-12">
          <Node id="comparisonTable.headline" role="heading">{c.headline}</Node>
        </h2>

        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: SALES_INK.INK900,
            border: '1px solid rgba(196,242,69,0.2)'
          }}>

          <div
            className="grid grid-cols-[1.5fr_1fr_1fr] text-white"
            style={{
              background: 'rgba(0,0,0,0.3)',
              borderBottom: '1px solid rgba(255,255,255,0.08)'
            }}>

            <div
              className="lime-ink-mono px-5 py-4"
              style={{
                fontSize: '0.7rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: SALES_INK.INK400
              }}>

              Feature
            </div>
            <div
              className="lime-ink-mono px-5 py-4 text-center"
              style={{
                fontSize: '0.7rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: SALES_INK.INK400
              }}>

              Free
            </div>
            <div
              className="lime-ink-mono px-5 py-4 text-center"
              style={{
                fontSize: '0.7rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: SALES_INK.LIME,
                fontWeight: 700
              }}>

              VIP
            </div>
          </div>
          {c.rows.map((row, i) =>
          <div
            key={`cmp-${i}`}
            className="lime-ink-sales-cmp-row grid grid-cols-[1.5fr_1fr_1fr] text-white"
            style={{
              borderBottom:
              i === c.rows.length - 1 ?
              'none' :
              '1px solid rgba(255,255,255,0.06)'
            }}>

              <div
              className="px-5 py-4 text-sm leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>

                {row.label}
              </div>
              <div className="px-5 py-4 flex items-center justify-center">
                {row.freePass ?
              <span
                className="inline-grid place-items-center w-8 h-8 rounded-full"
                style={{ background: 'rgba(196,242,69,0.12)' }}>

                    <SalesCheckIcon color={SALES_INK.LIME} />
                  </span> :

              <span
                className="inline-grid place-items-center w-8 h-8 rounded-full"
                style={{ background: 'rgba(239,68,68,0.12)' }}>

                    <SalesXIcon />
                  </span>
              }
              </div>
              <div className="px-5 py-4 flex items-center justify-center">
                {row.vipPass ?
              <span
                className="inline-grid place-items-center w-8 h-8 rounded-full"
                style={{ background: 'rgba(196,242,69,0.12)' }}>

                    <SalesCheckIcon color={SALES_INK.LIME} />
                  </span> :

              <span
                className="inline-grid place-items-center w-8 h-8 rounded-full"
                style={{ background: 'rgba(239,68,68,0.12)' }}>

                    <SalesXIcon />
                  </span>
              }
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

}
