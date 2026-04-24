import { Node } from '../../shared/Node';
import type { GreenGoldContent } from '../../green-gold.schema';

type Props = { content: GreenGoldContent };

export function Shifts({ content }: Props) {
  const s = content.shifts;
  return (
    <section
      className="py-16 md:py-24"
      style={{ background: '#F0FDF4' }}>

      <div className="max-w-3xl mx-auto px-6">
        <p
          className="green-gold-heading font-bold text-sm uppercase tracking-wider mb-2"
          style={{ color: '#16A34A' }}>

          <Node id="shifts.eyebrow" role="label">{s.eyebrow}</Node>
        </p>
        <h2
          className="green-gold-heading font-black text-3xl md:text-4xl mb-14"
          style={{ color: '#1A2E1A' }}>

          <Node id="shifts.headline" role="heading">{s.headline}</Node>
        </h2>
        <div className="green-gold-timeline space-y-10 pl-1">
          {s.items.map((item, idx) => {
            const isLast = idx === s.items.length - 1;
            return (
              <div key={`shift-${idx}`} className="flex gap-6 items-start">
                <div
                  className={
                  isLast ?
                  'green-gold-timeline-dot green-gold-timeline-dot-last' :
                  'green-gold-timeline-dot'
                  }>

                  <span className="green-gold-heading font-black text-sm text-white">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="pt-2">
                  <h3
                    className="green-gold-heading font-bold text-xl mb-2"
                    style={{ color: '#1A2E1A' }}>

                    {item.title}
                  </h3>
                  <p style={{ color: 'rgba(26,46,26,0.6)' }}>
                    {item.description}
                  </p>
                </div>
              </div>);

          })}
        </div>
      </div>
    </section>);

}
