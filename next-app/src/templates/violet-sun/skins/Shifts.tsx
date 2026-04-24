import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';

type Props = {
  content: SectionContentMap['shifts'];
};

export function Shifts({ content }: Props) {
  const s = content;
  return (
    <section className="violet-sun-grad-mist py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-6">
        <span
          className="violet-sun-eyebrow mb-3 inline-block"
          style={{ color: '#2A1869' }}
        >
          <Node id="shifts.eyebrow" role="label">{s.eyebrow}</Node>
        </span>
        <h2
          className="violet-sun-display font-bold text-4xl md:text-5xl tracking-[-0.03em] leading-tight mb-14"
          style={{ color: '#110833' }}
        >
          <Node id="shifts.headlineLead" role="heading">{s.headlineLead}</Node>
          <span
            className="violet-sun-italic-serif"
            style={{ color: '#2A1869' }}
          >
            <Node id="shifts.headlineAccent" role="heading">{s.headlineAccent}</Node>
          </span>
        </h2>
        <div className="space-y-5">
          {s.items.map((item, idx) => (
            <article
              key={`shift-${idx}`}
              className="violet-sun-card-light p-7 flex gap-6 items-start"
            >
              <span
                className="w-14 h-14 rounded-2xl violet-sun-grad-button flex items-center justify-center violet-sun-display font-bold text-xl shrink-0"
                style={{ color: '#23135F' }}
              >
                {String(idx + 1).padStart(2, '0')}
              </span>
              <div>
                <h3
                  className="violet-sun-display font-bold text-xl mb-2"
                  style={{ color: '#110833' }}
                >
                  {item.title}
                </h3>
                <p
                  className="leading-relaxed"
                  style={{ color: '#544B75' }}
                >
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
