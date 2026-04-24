import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';

type Props = {
  content: SectionContentMap['press'];
};

export function Press({ content }: Props) {
  const outlets = content.outlets;
  return (
    <section className="bg-white py-10">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p
          className="text-xs blue-coral-heading font-bold tracking-[0.2em] uppercase mb-6"
          style={{ color: '#9CA3AF' }}>

          <Node id="press.eyebrow" role="label">{content.eyebrow}</Node>
        </p>
        <div className="blue-coral-marquee-wrap">
          <div className="blue-coral-marquee-track">
            <div className="blue-coral-marquee-set">
              {outlets.map((name, idx) =>
              <span className="blue-coral-logo-item" key={`press-a-${idx}`}>
                  {name}
                </span>
              )}
            </div>
            <div className="blue-coral-marquee-set" aria-hidden="true">
              {outlets.map((name, idx) =>
              <span className="blue-coral-logo-item" key={`press-b-${idx}`}>
                  {name}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>);

}
