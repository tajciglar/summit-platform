import type { FactsStatsContent } from '../../../sections/facts-stats.schema';

type Props = {
  content: FactsStatsContent;
};

export function FactsStats({ content }: Props) {
  return (
    <section className="bg-paper-50 py-20 md:py-28 border-b border-paper-300">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mb-14">
          <p className="roman mb-2">{content.roman}</p>
          <h2 className="font-display font-black text-4xl md:text-5xl text-ink-700 leading-tight mb-4">
            {content.headline}
          </h2>
          <p className="font-opus-serif italic text-taupe-600 text-lg">{content.subhead}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-12">
          {content.items.map((item, idx) => {
            // Alternate ink/ochre colors roughly matching source (idx 1 and 4 are ochre).
            const valueColor =
              idx === 1 || idx === 4 ? 'text-ochre-600' : 'text-ink-700';
            return (
              <div key={`figure-${idx}`}>
                <p className="figure-label mb-2">{item.label}</p>
                <p
                  className={`font-display font-black text-5xl ${valueColor} mb-2 leading-none`}
                >
                  {item.value}
                </p>
                <p className="text-taupe-700 font-opus-serif leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
