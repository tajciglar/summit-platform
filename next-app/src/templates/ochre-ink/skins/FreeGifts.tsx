import type { SectionContentMap } from '../bridge';

type Props = {
  content: NonNullable<SectionContentMap['free-gifts']>;
};

function toRoman(n: number): string {
  const map: Array<[number, string]> = [
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let num = n;
  let out = '';
  for (const [val, sym] of map) {
    while (num >= val) { out += sym; num -= val; }
  }
  return out || String(n);
}

export function FreeGifts({ content }: Props) {
  if (!content) return null;

  return (
    <section className="bg-paper-50 py-20 md:py-28 border-b border-paper-300">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="eyebrow text-ochre-700 mb-3">{content.eyebrow}</p>
          <h2 className="font-display font-black text-4xl md:text-5xl text-ink-700 leading-tight">
            {content.headline}
          </h2>
          <p className="font-opus-serif italic text-taupe-600 text-lg mt-4">
            Inserts enclosed with this special edition
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.items.map((gift, idx) => (
            <article
              key={`gift-${idx}`}
              className="relative bg-paper-100 border border-paper-300 p-8 flex flex-col"
            >
              <div className="absolute -top-3 -right-3 bg-ochre-600 text-paper-50 font-display font-black text-xs px-3 py-1.5 rounded-sm transform rotate-3 shadow-lg">
                ENCLOSED FREE
              </div>
              <p className="roman text-5xl leading-none mb-4">{toRoman(gift.giftNumber)}.</p>
              <p className="figure-label text-taupe-600 mb-2">Insert No. {gift.giftNumber}</p>
              <h3 className="font-display font-black text-2xl text-ink-700 mb-3 leading-tight">
                {gift.title}
              </h3>
              <p className="font-opus-serif text-taupe-700 leading-relaxed mb-5 flex-1">
                {gift.description}
              </p>
              <span className="inline-block self-start bg-paper-50 border border-paper-300 text-ochre-700 font-display font-bold text-xs px-3 py-1 tracking-wider">
                {gift.valueLabel}
              </span>
            </article>
          ))}
        </div>

        <p className="figure-label text-center mt-14 text-taupe-600">{content.deliveryNote}</p>
      </div>
    </section>
  );
}
