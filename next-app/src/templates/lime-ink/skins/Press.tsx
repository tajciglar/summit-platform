import { Node } from '../../shared/Node';
import type { LimeInkContent } from '../../lime-ink.schema';

type Props = {
  content: LimeInkContent['press'];
};

export function Press({ content }: Props) {
  // Duplicate items so the marquee loops seamlessly.
  const items = [...content.outlets, ...content.outlets];
  return (
    <section className="bg-white py-10 lime-ink-hairline-b">
      <div className="max-w-7xl mx-auto px-6">
        <p
          className="lime-ink-mono text-xs mb-6 text-center"
          style={{ color: '#71717A' }}>

          <Node id="press.eyebrow" role="label">{content.eyebrow}</Node>
        </p>
        <div className="lime-ink-marquee-wrap">
          <div className="lime-ink-marquee-track">
            {items.map((name, idx) =>
            <span className="lime-ink-marquee-item" key={`press-${idx}`}>
                {name}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>);

}
