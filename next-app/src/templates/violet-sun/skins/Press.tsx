import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';

type Props = {
  content: SectionContentMap['press'];
};

export function Press({ content }: Props) {
  const items = [...content.outlets, ...content.outlets];
  return (
    <section className="bg-white py-10">
      <div className="max-w-7xl mx-auto px-6">
        <p
          className="violet-sun-eyebrow text-center mb-6"
          style={{ color: '#7E7399' }}
        >
          <Node id="press.eyebrow" role="label">{content.eyebrow}</Node>
        </p>
        <div className="violet-sun-marquee-wrap">
          <div className="violet-sun-marquee-track">
            {items.map((name, idx) => (
              <span className="violet-sun-marquee-item" key={`press-${idx}`}>
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
