import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { FOUNDER_GRADIENTS } from './shared';

type Props = {
  content: SectionContentMap['founders'];
};

export function Founders({ content }: Props) {
  const f = content;
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-6">
        <h2
          className="blue-coral-heading font-black text-3xl md:text-4xl text-center mb-12"
          style={{ color: '#1E293B' }}>

          <Node id="founders.headline" role="heading">{f.headline}</Node>
        </h2>
        <div className="grid md:grid-cols-2 gap-12">
          {f.items.map((founder, idx) =>
          <div
            key={`founder-${idx}`}
            className="flex flex-col items-center text-center">

              {founder.photo?.url ?
            <img
              src={founder.photo.url}
              alt={founder.photo.alt ?? founder.name}
              width={founder.photo.width ?? undefined}
              height={founder.photo.height ?? undefined}
              className="blue-coral-avatar-md mb-4 object-cover"
              data-testid={`blue-coral-founder-photo-${idx}`} /> :


            <div
              className="blue-coral-avatar-md mb-4"
              style={{
                background:
                FOUNDER_GRADIENTS[idx % FOUNDER_GRADIENTS.length]
              }}>

                  {founder.initials}
                </div>
            }
              <h3
              className="blue-coral-heading font-bold text-xl"
              style={{ color: '#1E293B' }}>

                {founder.name}
              </h3>
              <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
                {founder.role}
              </p>
              <p
              className="text-sm leading-relaxed max-w-sm"
              style={{ color: '#4B5563' }}>

                &ldquo;{founder.quote}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>
    </section>);

}
