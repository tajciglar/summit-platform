import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';

type Props = {
  content: SectionContentMap['stats'];
};

export function Stats({ content }: Props) {
  return (
    <section className="violet-sun-grad-mist py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6">
        <p
          className="violet-sun-eyebrow text-center mb-10"
          style={{ color: '#2A1869' }}
        >
          <Node id="stats.eyebrow" role="label">{content.eyebrow}</Node>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-4 text-center">
          {content.items.map((item, idx) => {
            const isLast = idx === content.items.length - 1;
            const borderClass = isLast ? '' : 'md:border-r md:pr-4';
            return (
              <div
                key={`stat-${idx}`}
                className={borderClass}
                style={{
                  borderColor: isLast ? undefined : 'rgba(138,110,235,0.3)',
                }}
              >
                <p
                  className="violet-sun-display font-bold text-7xl md:text-8xl leading-none mb-3 tracking-[-0.04em]"
                  style={{ color: '#2A1869' }}
                >
                  {item.value}
                  {item.suffix ? (
                    <span style={{ color: '#FFC300' }}>{item.suffix}</span>
                  ) : null}
                </p>
                <p
                  className="text-lg font-medium"
                  style={{ color: '#544B75' }}
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
