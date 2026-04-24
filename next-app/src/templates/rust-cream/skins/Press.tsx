import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';

type Props = {
  content: SectionContentMap['press'];
};

export function Press({ content }: Props) {
  const outlets = content.outlets;
  return (
    <section className="py-10" style={{ backgroundColor: '#FDF8F3' }}>
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p
          className="text-xs rust-cream-heading font-bold tracking-[0.2em] uppercase mb-6"
          style={{ color: '#8B7355' }}>

          <Node id="press.eyebrow" role="label">{content.eyebrow}</Node>
        </p>
        <div className="rust-cream-marquee-wrap">
          <div className="rust-cream-marquee-track">
            <div className="rust-cream-marquee-set">
              {outlets.map((name, idx) =>
                <span className="rust-cream-logo-item" key={`press-a-${idx}`}>
                  {name}
                </span>
              )}
            </div>
            <div className="rust-cream-marquee-set" aria-hidden="true">
              {outlets.map((name, idx) =>
                <span className="rust-cream-logo-item" key={`press-b-${idx}`}>
                  {name}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
