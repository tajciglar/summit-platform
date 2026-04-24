import type { CreamSageContent } from '../../cream-sage.schema';
import { Node } from '../../shared/Node';

type Props = { content: CreamSageContent };

export function Outcomes({ content }: Props) {
  const o = content.outcomes;
  const ICON_BACKGROUNDS = ['#E9EEEA', 'rgba(232,185,160,0.35)'];
  const ICON_COLORS = ['#4A6B5D', '#A85430'];
  return (
    <section className="py-20 md:py-28" style={{ background: 'var(--cs-paper-alt, #F4EDE2)' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span
            className="cream-sage-eyebrow mb-3 inline-block"
            style={{ color: '#A85430' }}
          >
            <Node id="outcomes.eyebrow">{o.eyebrow}</Node>
          </span>
          <h2
            className="font-black text-4xl md:text-5xl leading-tight"
            style={{ fontFamily: "'Fraunces', serif", color: '#2A2419' }}
          >
            <Node id="outcomes.headlineLead">{o.headlineLead}</Node>
            <span style={{ fontStyle: 'italic', color: '#4A6B5D' }}>
              <Node id="outcomes.headlineAccent">{o.headlineAccent}</Node>
            </span>
            {o.headlineTrail ? (
              <Node id="outcomes.headlineTrail">{o.headlineTrail}</Node>
            ) : ''}
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {o.items.map((item, idx) => (
            <article key={`outcome-${idx}`} className="cream-sage-soft-card p-8">
              <div
                className="w-16 h-16 rounded-3xl flex items-center justify-center mb-5"
                style={{ background: ICON_BACKGROUNDS[idx % 2] }}
              >
                <span
                  className="font-black text-2xl"
                  style={{
                    fontFamily: "'Fraunces', serif",
                    color: ICON_COLORS[idx % 2],
                  }}
                >
                  {String(idx + 1).padStart(2, '0')}
                </span>
              </div>
              <h3
                className="font-bold text-2xl mb-3"
                style={{ fontFamily: "'Fraunces', serif", color: '#2A2419' }}
              >
                <Node id={`outcomes.items.${idx}.title`}>{item.title}</Node>
              </h3>
              <p className="text-lg leading-relaxed" style={{ color: '#3A3221' }}>
                <Node id={`outcomes.items.${idx}.description`}>{item.description}</Node>
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
