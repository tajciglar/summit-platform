import type { GreenGoldContent } from '../../green-gold.schema';

type Props = { content: GreenGoldContent };

export function Stats({ content }: Props) {
  return (
    <section className="bg-white py-12">
      <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-6 text-center">
        {content.stats.items.map((item, idx) =>
        <div
          key={`stat-${idx}`}
          className="bg-white rounded-xl p-6 shadow-sm"
          style={{
            border: '1px solid #DCFCE7',
            borderBottom: '4px solid #16A34A'
          }}>

            <p
            className="green-gold-heading font-black text-4xl md:text-5xl"
            style={{ color: '#15803D' }}>

              {item.value}
            </p>
            <p
            className="font-medium text-sm mt-1 uppercase tracking-wider"
            style={{ color: 'rgba(26,46,26,0.55)' }}>

              {item.label}
            </p>
          </div>
        )}
      </div>
    </section>);

}
