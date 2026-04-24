import { Node } from '../../shared/Node';
import type { LimeInkContent } from '../../lime-ink.schema';
import { TREND_HEIGHTS } from './shared';

type Props = {
  content: LimeInkContent['figures'];
};

export function Figures({ content }: Props) {
  const f = content;
  return (
    <section className="bg-white py-20 md:py-28 lime-ink-hairline-b">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-4">
          <span
            className="lime-ink-mono text-xs"
            style={{ color: '#71717A' }}>

            <Node id="figures.sectionLabel" role="body">{f.sectionLabel}</Node>
          </span>
          <span
            className="h-[1px] w-12"
            style={{ background: '#E4E4E7' }}>
          </span>
        </div>
        <h2 className="font-black text-4xl md:text-5xl leading-tight tracking-[-0.03em] mb-14 max-w-3xl">
          <Node id="figures.headline" role="heading">{f.headline}</Node>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-12">
          {f.items.map((item, idx) => {
            // idx 1 and 4 are highlighted in lime in the reference HTML
            const valueColor =
            idx === 1 || idx === 4 ? '#AEE02B' : '#0A0A0B';
            return (
              <div
                key={`figure-${idx}`}
                className="flex items-start justify-between gap-4 pb-6 lime-ink-hairline-b">

                <div>
                  <p
                    className="lime-ink-mono text-xs mb-3"
                    style={{ color: '#71717A' }}>

                    {item.label}
                  </p>
                  <p
                    className="font-black text-5xl tracking-[-0.03em] mb-2"
                    style={{ color: valueColor }}>

                    {item.value}
                  </p>
                  <p style={{ color: '#52525B' }}>{item.description}</p>
                </div>
                <div className="lime-ink-spark" aria-hidden="true">
                  {TREND_HEIGHTS[item.trend].map((h, hIdx) =>
                  <span
                    key={`spark-${idx}-${hIdx}`}
                    style={{ height: `${h}%` }}>
                  </span>
                  )}
                </div>
              </div>);

          })}
        </div>
      </div>
    </section>);

}
