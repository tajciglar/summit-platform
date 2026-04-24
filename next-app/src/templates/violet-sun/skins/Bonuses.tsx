import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';

type Props = {
  content: SectionContentMap['bonuses'];
};

export function Bonuses({ content }: Props) {
  const b = content;
  return (
    <section className="violet-sun-grad-mist py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span
            className="violet-sun-eyebrow mb-3 inline-block"
            style={{ color: '#2A1869' }}
          >
            <Node id="bonuses.eyebrow" role="label">{b.eyebrow}</Node>
          </span>
          <h2
            className="violet-sun-display font-bold text-4xl md:text-5xl tracking-[-0.03em] leading-tight"
            style={{ color: '#110833' }}
          >
            <span className="violet-sun-hl-sun"><Node id="bonuses.headlineHighlight" role="heading">{b.headlineHighlight}</Node></span>
            <Node id="bonuses.headlineTrail" role="heading">{b.headlineTrail}</Node>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {b.items.map((bonus, idx) => (
            <article key={`bonus-${idx}`} className="violet-sun-card-light p-8">
              <div className="flex items-center justify-between mb-5">
                <span
                  className="violet-sun-eyebrow"
                  style={{ color: '#6F4EE6' }}
                >
                  {bonus.label}
                </span>
                <span
                  className="violet-sun-eyebrow px-3 py-1.5 rounded-full"
                  style={{ background: '#FFC300', color: '#23135F' }}
                >
                  {bonus.valueLabel}
                </span>
              </div>
              <h3
                className="violet-sun-display font-bold text-2xl mb-3 leading-tight"
                style={{ color: '#110833' }}
              >
                {bonus.title}
              </h3>
              <p
                className="mb-5 leading-relaxed"
                style={{ color: '#544B75' }}
              >
                {bonus.description}
              </p>
              <ul className="space-y-2 text-sm" style={{ color: '#2A1869' }}>
                {bonus.bullets.map((bullet, bIdx) => (
                  <li
                    key={`bonus-${idx}-b-${bIdx}`}
                    className="flex gap-2"
                  >
                    <span
                      className="font-bold"
                      style={{ color: '#6F4EE6' }}
                    >
                      ✓
                    </span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="text-center mt-12">
          <a
            href="#optin"
            className="violet-sun-btn-sun violet-sun-btn-sun-pulse"
          >
            <Node id="bonuses.ctaLabel" role="button">{b.ctaLabel}</Node>
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
