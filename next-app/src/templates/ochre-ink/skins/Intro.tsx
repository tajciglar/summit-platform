import type { SectionContentMap } from '../bridge';

type Props = {
  content: NonNullable<SectionContentMap['intro']>;
};

export function Intro({ content }: Props) {
  if (!content) return null;

  return (
    <section className="bg-paper-50 py-20 md:py-28 border-b border-paper-300">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="eyebrow text-ochre-700 mb-4">{content.eyebrow}</p>
        <h2 className="font-display font-black text-4xl md:text-5xl text-ink-700 leading-tight mb-10">
          {content.headline}
        </h2>
        <div className="mx-auto w-16 h-[2px] bg-ochre-600 mb-10" />
        {content.paragraphs.map((para, idx) => (
          <p
            key={`intro-para-${idx}`}
            className={
              idx === 0
                ? 'dropcap text-left text-lg leading-[1.75] text-taupe-700 mb-6'
                : 'text-left text-lg leading-[1.75] text-taupe-700 mb-6'
            }
          >
            {para}
          </p>
        ))}
      </div>
    </section>
  );
}
