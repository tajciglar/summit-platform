import type { CreamSageContent } from '../../cream-sage.schema';
import { Node } from '../../shared/Node';

type Props = { content: CreamSageContent };

export function Press({ content }: Props) {
  const items = [...content.press.outlets, ...content.press.outlets];
  return (
    <section className="py-10" style={{ background: 'var(--cs-paper, #FAF7F2)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <p
          className="cream-sage-eyebrow text-center mb-6"
          style={{ color: '#3D5A4E' }}
        >
          <Node id="press.eyebrow">{content.press.eyebrow}</Node>
        </p>
        <div className="cream-sage-marquee-wrap">
          <div className="cream-sage-marquee-track">
            {items.map((name, idx) => {
              const origIdx = idx % content.press.outlets.length;
              return (
                <span className="cream-sage-marquee-item" key={`press-${idx}`}>
                  {idx < content.press.outlets.length ? (
                    <Node id={`press.outlets.${origIdx}`}>{name}</Node>
                  ) : (
                    name
                  )}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
