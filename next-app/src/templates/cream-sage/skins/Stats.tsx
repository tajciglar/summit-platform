import type { CreamSageContent } from '../../cream-sage.schema';
import { Node } from '../../shared/Node';

type Props = { content: CreamSageContent };

export function Stats({ content }: Props) {
  return (
    <section
      className="py-20 md:py-24 relative overflow-hidden"
      style={{ background: '#4A6B5D', color: '#FAF7F2' }}
    >
      <svg
        className="cream-sage-wave-top absolute top-0 left-0 right-0"
        viewBox="0 0 1200 40"
        preserveAspectRatio="none"
        fill="#FAF7F2"
        aria-hidden="true"
      >
        <path d="M0 40 Q 300 0, 600 20 T 1200 10 L 1200 0 L 0 0 Z" />
      </svg>
      <div className="max-w-6xl mx-auto px-6 relative">
        <p
          className="cream-sage-eyebrow text-center mb-14 mt-8"
          style={{ color: '#E8B9A0' }}
        >
          <Node id="stats.eyebrow">{content.stats.eyebrow}</Node>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {content.stats.items.map((item, idx) => {
            const isMiddle = idx === 1;
            const middleBorder = isMiddle
              ? { borderLeft: '1px solid rgba(250,247,242,0.2)', borderRight: '1px solid rgba(250,247,242,0.2)' }
              : {};
            const valueColor = isMiddle ? '#E8B9A0' : '#FAF7F2';
            return (
              <div key={`stat-${idx}`} style={middleBorder}>
                <p
                  className="font-black text-8xl md:text-9xl leading-none mb-4"
                  style={{ fontFamily: "'Fraunces', serif", color: valueColor }}
                >
                  <Node id={`stats.items.${idx}.value`}>{item.value}</Node>
                  {item.suffix ? (
                    <span
                      className="text-6xl align-top"
                      style={{ color: isMiddle ? '#FAF7F2' : '#FAF7F2' }}
                    >
                      <Node id={`stats.items.${idx}.suffix`}>{item.suffix}</Node>
                    </span>
                  ) : null}
                </p>
                <p
                  className="text-xl md:text-2xl font-semibold"
                  style={{
                    fontFamily: "'Nunito', 'DM Sans', sans-serif",
                    color: '#FAF7F2',
                  }}
                >
                  <Node id={`stats.items.${idx}.label`}>{item.label}</Node>
                </p>
              </div>
            );
          })}
        </div>
      </div>
      <svg
        className="cream-sage-wave-top absolute bottom-0 left-0 right-0"
        viewBox="0 0 1200 40"
        preserveAspectRatio="none"
        fill="#F4EDE2"
        aria-hidden="true"
        style={{ transform: 'rotate(180deg)' }}
      >
        <path d="M0 40 Q 300 0, 600 20 T 1200 10 L 1200 0 L 0 0 Z" />
      </svg>
    </section>
  );
}
