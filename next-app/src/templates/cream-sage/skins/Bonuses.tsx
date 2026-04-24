import type { CreamSageContent } from '../../cream-sage.schema';
import { Node } from '../../shared/Node';

type Props = { content: CreamSageContent };

export function Bonuses({ content }: Props) {
  const b = content.bonuses;
  return (
    <section className="py-20 md:py-28" style={{ background: 'var(--cs-paper-alt, #F4EDE2)' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span
            className="cream-sage-eyebrow mb-3 inline-block"
            style={{ color: '#A85430' }}
          >
            <Node id="bonuses.eyebrow">{b.eyebrow}</Node>
          </span>
          <h2
            className="font-black text-4xl md:text-5xl leading-tight mb-4"
            style={{ fontFamily: "'Fraunces', serif", color: '#2A2419' }}
          >
            <Node id="bonuses.headlineLead">{b.headlineLead}</Node>
            <span className="cream-sage-hand-under">
              <Node id="bonuses.headlineAccent">{b.headlineAccent}</Node>
            </span>
            <Node id="bonuses.headlineTrail">{b.headlineTrail}</Node>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {b.items.map((bonus, idx) => (
            <article key={`bonus-${idx}`} className="cream-sage-soft-card p-8">
              <span
                className="inline-block font-bold text-sm tracking-wider px-4 py-2 mb-5"
                style={{
                  background: '#D89878',
                  color: '#FAF7F2',
                  fontFamily: "'Nunito', 'DM Sans', sans-serif",
                  borderRadius: 999,
                }}
              >
                <Node id={`bonuses.items.${idx}.valueLabel`}>{bonus.valueLabel}</Node>
              </span>
              <h3
                className="font-bold text-2xl mb-3 leading-tight"
                style={{ fontFamily: "'Fraunces', serif", color: '#2A2419' }}
              >
                <Node id={`bonuses.items.${idx}.title`}>{bonus.title}</Node>
              </h3>
              <p
                className="text-lg mb-5 leading-relaxed"
                style={{ color: '#3A3221' }}
              >
                <Node id={`bonuses.items.${idx}.description`}>{bonus.description}</Node>
              </p>
              <ul className="space-y-2 text-base" style={{ color: '#3A3221' }}>
                {bonus.bullets.map((bullet, bIdx) => (
                  <li
                    key={`bonus-${idx}-b-${bIdx}`}
                    className="flex gap-2"
                  >
                    <span style={{ color: '#3D5A4E', fontWeight: 700 }}>✓</span>
                    <Node id={`bonuses.items.${idx}.bullets.${bIdx}`}>{bullet}</Node>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="text-center mt-12">
          <a href="#optin" className="cream-sage-btn-primary">
            <Node id="bonuses.ctaLabel">{b.ctaLabel}</Node>
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
