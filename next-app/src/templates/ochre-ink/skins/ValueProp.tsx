import type { ValuePropContent } from '../../../sections/value-prop.schema';

type Props = {
  content: ValuePropContent;
};

const ROMAN = ['I.', 'II.', 'III.', 'IV.', 'V.', 'VI.'];

export function ValueProp({ content }: Props) {
  return (
    <section className="bg-paper-50 py-20 md:py-28 border-b border-paper-300">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-3xl mb-14">
          <p className="roman mb-3">{content.roman}</p>
          <h2 className="font-display font-black text-4xl md:text-5xl text-ink-700 leading-tight">
            {content.headline}
          </h2>
          <p className="font-opus-serif italic text-taupe-600 text-lg mt-4">{content.subhead}</p>
        </div>
        <ol className="grid md:grid-cols-2 gap-x-12 gap-y-10">
          {content.items.map((item, idx) => (
            <li key={`transformation-${idx}`} className="flex gap-6">
              <span className="roman text-4xl leading-none pt-1">{ROMAN[idx] ?? `${idx + 1}.`}</span>
              <div>
                <h3 className="font-display font-bold text-xl text-ink-700 mb-2">{item.title}</h3>
                <p className="text-taupe-700 leading-relaxed">{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
