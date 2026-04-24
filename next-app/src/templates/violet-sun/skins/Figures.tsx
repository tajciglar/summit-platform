import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { FIGURE_VALUE_COLORS, TREND_HEIGHTS } from './shared';

type Props = {
  content: SectionContentMap['figures'];
};

export function Figures({ content }: Props) {
  const f = content;
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mb-14">
          <span
            className="violet-sun-eyebrow mb-3 inline-block"
            style={{ color: '#6F4EE6' }}
          >
            <Node id="figures.eyebrow" role="label">{f.eyebrow}</Node>
          </span>
          <h2
            className="violet-sun-display font-bold text-4xl md:text-5xl tracking-[-0.03em] leading-tight"
            style={{ color: '#110833' }}
          >
            <Node id="figures.headlineLead" role="heading">{f.headlineLead}</Node>
            <span
              className="violet-sun-italic-serif"
              style={{ color: '#6F4EE6' }}
            >
              <Node id="figures.headlineAccent" role="heading">{f.headlineAccent}</Node>
            </span>
            <Node id="figures.headlineTrail" role="heading">{f.headlineTrail}</Node>
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {f.items.map((item, idx) => {
            const valueColor = FIGURE_VALUE_COLORS[idx] ?? '#2A1869';
            return (
              <div key={`figure-${idx}`} className="violet-sun-card-mist p-7">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="violet-sun-eyebrow"
                    style={{ color: '#2A1869' }}
                  >
                    {item.label}
                  </span>
                  <div className="violet-sun-spark" aria-hidden="true">
                    {TREND_HEIGHTS[item.trend].map((h, hIdx) => (
                      <span
                        key={`spark-${idx}-${hIdx}`}
                        style={{ height: `${h}%` }}
                      ></span>
                    ))}
                  </div>
                </div>
                <p
                  className="violet-sun-display font-bold text-5xl mb-2 leading-none tracking-tight"
                  style={{ color: valueColor }}
                >
                  {item.value}
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'rgba(35,19,95,0.7)' }}
                >
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
