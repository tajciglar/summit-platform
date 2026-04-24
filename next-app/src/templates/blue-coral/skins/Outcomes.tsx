import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { CheckIcon, OUTCOME_COLORS } from './shared';

type Props = {
  content: SectionContentMap['outcomes'];
};

export function Outcomes({ content }: Props) {
  const o = content;
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6">
        <p
          className="blue-coral-heading font-bold text-sm uppercase tracking-wider mb-2 text-center"
          style={{ color: '#2563EB' }}>

          <Node id="outcomes.eyebrow" role="label">{o.eyebrow}</Node>
        </p>
        <h2
          className="blue-coral-heading font-black text-3xl md:text-4xl mb-12 text-center"
          style={{ color: '#1E293B' }}>

          <Node id="outcomes.headline" role="heading">{o.headline}</Node>
        </h2>
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
          {o.items.map((item, idx) =>
          <div key={`outcome-${idx}`} className="flex items-start gap-4">
              <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: OUTCOME_COLORS[idx % OUTCOME_COLORS.length] }}>

                <CheckIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p
                className="blue-coral-heading font-bold text-lg"
                style={{ color: '#1E293B' }}>

                  {item.title}
                </p>
                <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
                  {item.description}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

}
