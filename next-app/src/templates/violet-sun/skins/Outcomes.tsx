import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { OUTCOME_ICON_BGS } from './shared';

type Props = {
  content: SectionContentMap['outcomes'];
};

export function Outcomes({ content }: Props) {
  const o = content;
  const total = o.items.length;
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span
            className="violet-sun-eyebrow mb-3 inline-block"
            style={{ color: '#6F4EE6' }}
          >
            <Node id="outcomes.eyebrow" role="label">{o.eyebrow}</Node>
          </span>
          <h2
            className="violet-sun-display font-bold text-4xl md:text-5xl tracking-[-0.03em] leading-tight"
            style={{ color: '#110833' }}
          >
            <Node id="outcomes.headlineLead" role="heading">{o.headlineLead}</Node>
            <span
              className="violet-sun-italic-serif"
              style={{ color: '#6F4EE6' }}
            >
              <Node id="outcomes.headlineAccent" role="heading">{o.headlineAccent}</Node>
            </span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {o.items.map((item, idx) => {
            const iconBg = OUTCOME_ICON_BGS[idx % OUTCOME_ICON_BGS.length];
            return (
              <article key={`outcome-${idx}`} className="violet-sun-card-mist p-7">
                <div className="flex items-center justify-between mb-5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: iconBg }}
                  >
                    <span
                      className="violet-sun-display font-bold text-lg"
                      style={{
                        color: iconBg === '#FFFFFF' ? '#2A1869' : '#23135F',
                      }}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <span
                    className="violet-sun-display font-bold text-sm"
                    style={{ color: '#2A1869' }}
                  >
                    {String(idx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                  </span>
                </div>
                <h3
                  className="violet-sun-display font-bold text-xl mb-2"
                  style={{ color: '#110833' }}
                >
                  {item.title}
                </h3>
                <p
                  className="leading-relaxed"
                  style={{ color: 'rgba(35,19,95,0.7)' }}
                >
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
