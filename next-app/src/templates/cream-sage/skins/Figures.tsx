import type { CreamSageContent } from '../../cream-sage.schema';
import { Node } from '../../shared/Node';
import { FIGURE_COLORS } from './shared';

type Props = { content: CreamSageContent };

export function Figures({ content }: Props) {
  const f = content.figures;
  return (
    <section className="py-20 md:py-28" style={{ background: 'var(--cs-paper, #FAF7F2)' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span
            className="cream-sage-eyebrow mb-3 inline-block"
            style={{ color: '#A85430' }}
          >
            <Node id="figures.eyebrow">{f.eyebrow}</Node>
          </span>
          <h2
            className="font-black text-4xl md:text-5xl leading-tight"
            style={{ fontFamily: "'Fraunces', serif", color: '#2A2419' }}
          >
            <Node id="figures.headline">{f.headline}</Node>
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {f.items.map((item, idx) => (
            <div key={`figure-${idx}`} className="cream-sage-cream-card p-8 text-center">
              <p
                className="font-black text-6xl mb-3 leading-none"
                style={{
                  fontFamily: "'Fraunces', serif",
                  color: FIGURE_COLORS[idx % FIGURE_COLORS.length],
                }}
              >
                <Node id={`figures.items.${idx}.value`}>{item.value}</Node>
              </p>
              <p
                className="text-base leading-relaxed font-medium"
                style={{ color: '#3A3221' }}
              >
                <Node id={`figures.items.${idx}.description`}>{item.description}</Node>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
