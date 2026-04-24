import type { SectionContentMap } from '../bridge';

type Props = {
  content: SectionContentMap['stats'];
};

export function Stats({ content }: Props) {
  return (
    <section
      className="py-12"
      style={{
        background:
        'linear-gradient(135deg, #2563EB 0%, #1D4ED8 50%, #1B3A5C 100%)'
      }}>

      <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center text-white">
        {content.items.map((item, idx) => {
          const isMiddle = idx === 1;
          return (
            <div
              key={`stat-${idx}`}
              className={isMiddle ? '' : ''}
              style={
              isMiddle ?
              {
                borderLeft: '1px solid rgba(96,165,250,0.3)',
                borderRight: '1px solid rgba(96,165,250,0.3)'
              } :
              undefined
              }>

              <p className="blue-coral-heading font-black text-4xl md:text-5xl">
                {item.value}
              </p>
              <p
                className="font-medium text-sm mt-1 uppercase tracking-wider"
                style={{ color: '#BFDBFE' }}>

                {item.label}
              </p>
            </div>);

        })}
      </div>
    </section>);

}
