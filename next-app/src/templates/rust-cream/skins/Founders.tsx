import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { FOUNDER_GRADIENTS } from './shared';

type Props = {
  content: SectionContentMap['founders'];
};

export function Founders({ content: f }: Props) {
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: '#FDF8F3' }}>
      <div className="max-w-5xl mx-auto px-6">
        <h2
          className="rust-cream-heading font-black text-3xl md:text-4xl text-center mb-12"
          style={{ color: '#3D2B1F' }}>

          <Node id="founders.headline" role="heading">{f.headline}</Node>
        </h2>
        <div className="grid md:grid-cols-2 gap-12">
          {f.items.map((founder, idx) =>
            <div key={`founder-${idx}`} className="flex flex-col items-center text-center">
              <div
                className="rust-cream-avatar rust-cream-avatar-lg mb-4"
                style={{ background: FOUNDER_GRADIENTS[idx % FOUNDER_GRADIENTS.length] }}>

                {founder.initials}
              </div>
              <h3
                className="rust-cream-heading font-bold text-xl"
                style={{ color: '#3D2B1F' }}>

                {founder.name}
              </h3>
              <p className="text-sm mb-4" style={{ color: '#8B7355' }}>
                {founder.role}
              </p>
              <p
                className="text-sm leading-relaxed max-w-sm"
                style={{ color: '#8B7355' }}>

                &ldquo;{founder.quote}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
