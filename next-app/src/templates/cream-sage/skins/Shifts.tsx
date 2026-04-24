import type { CreamSageContent } from '../../cream-sage.schema';
import { Node } from '../../shared/Node';

type Props = { content: CreamSageContent };

export function Shifts({ content }: Props) {
  const s = content.shifts;
  return (
    <section className="py-20 md:py-28" style={{ background: 'var(--cs-paper-alt, #F4EDE2)' }}>
      <div className="max-w-3xl mx-auto px-6">
        <span
          className="cream-sage-eyebrow mb-3 inline-block"
          style={{ color: '#A85430' }}
        >
          <Node id="shifts.eyebrow">{s.eyebrow}</Node>
        </span>
        <h2
          className="font-black text-4xl md:text-5xl leading-tight mb-14"
          style={{ fontFamily: "'Fraunces', serif", color: '#2A2419' }}
        >
          <Node id="shifts.headlineLead">{s.headlineLead}</Node>
          <span style={{ fontStyle: 'italic', color: '#4A6B5D' }}>
            <Node id="shifts.headlineAccent">{s.headlineAccent}</Node>
          </span>
          {s.headlineTrail ? (
            <Node id="shifts.headlineTrail">{s.headlineTrail}</Node>
          ) : ''}
        </h2>
        <div className="space-y-8">
          {s.items.map((item, idx) => (
            <article
              key={`shift-${idx}`}
              className="cream-sage-soft-card p-7 flex gap-6"
            >
              <span
                className="font-black text-4xl leading-none shrink-0"
                style={{ fontFamily: "'Fraunces', serif", color: '#D89878' }}
              >
                {String(idx + 1).padStart(2, '0')}
              </span>
              <div>
                <h3
                  className="font-bold text-2xl mb-3"
                  style={{ fontFamily: "'Fraunces', serif", color: '#2A2419' }}
                >
                  <Node id={`shifts.items.${idx}.title`}>{item.title}</Node>
                </h3>
                <p className="text-lg leading-relaxed" style={{ color: '#3A3221' }}>
                  <Node id={`shifts.items.${idx}.description`}>{item.description}</Node>
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
