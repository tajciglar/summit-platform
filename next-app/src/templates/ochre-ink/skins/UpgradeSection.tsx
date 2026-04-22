import type { SectionContentMap } from '../bridge';

type Props = {
  content: NonNullable<SectionContentMap['upgrade-section']>;
};

export function UpgradeSection({ content }: Props) {
  if (!content) return null;

  return (
    <section className="bg-paper-100 py-20 md:py-28 border-b border-paper-300">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-10 pb-6 rule">
          <p className="eyebrow text-ochre-700 mb-3">{content.eyebrow}</p>
          <h2 className="font-display font-black text-4xl md:text-5xl text-ink-700 leading-tight">
            {content.headline}
          </h2>
        </div>
        <div className="max-w-2xl mx-auto">
          {content.paragraphs.map((para, idx) => (
            <p
              key={`upgrade-para-${idx}`}
              className="text-lg font-opus-serif text-taupe-700 leading-[1.75] mb-6"
            >
              {para}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
