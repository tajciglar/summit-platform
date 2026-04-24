import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';

type Props = {
  content: SectionContentMap['shifts'];
};

export function Shifts({ content }: Props) {
  const s = content;
  return (
    <section className="py-16 md:py-24" style={{ background: '#F8FAFC' }}>
      <div className="max-w-3xl mx-auto px-6">
        <p
          className="blue-coral-heading font-bold text-sm uppercase tracking-wider mb-2"
          style={{ color: '#2563EB' }}>

          <Node id="shifts.eyebrow" role="label">{s.eyebrow}</Node>
        </p>
        <h2
          className="blue-coral-heading font-black text-3xl md:text-4xl mb-12"
          style={{ color: '#1E293B' }}>

          <Node id="shifts.headline" role="heading">{s.headline}</Node>
        </h2>
        <div className="space-y-8">
          {s.items.map((item, idx) =>
          <div key={`shift-${idx}`} className="flex gap-6">
              <span
              className="blue-coral-heading font-black text-5xl leading-none shrink-0"
              style={{ color: 'rgba(37,99,235,0.2)' }}>

                {String(idx + 1).padStart(2, '0')}
              </span>
              <div>
                <h3
                className="blue-coral-heading font-bold text-xl mb-2"
                style={{ color: '#1E293B' }}>

                  {item.title}
                </h3>
                <p style={{ color: '#4B5563' }}>{item.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

}
