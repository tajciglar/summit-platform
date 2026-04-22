import type { SectionContentMap } from '../bridge';

type Props = {
  content: NonNullable<SectionContentMap['why-section']>;
};

export function WhySection({ content }: Props) {
  if (!content) return null;

  return (
    <section className="bg-paper-50 py-20 md:py-28 border-b border-paper-300">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="pullmark mb-[-1rem] opacity-70">&ldquo;</p>
        <h2 className="font-display font-black text-4xl md:text-5xl text-ink-700 leading-tight mb-4">
          {content.headline}
        </h2>
        <p className="font-opus-serif italic text-ochre-700 text-xl md:text-2xl mb-10 leading-snug">
          {content.subheadline}
        </p>
        <div className="mx-auto w-16 h-[2px] bg-ochre-600 mb-10" />
        <div className="text-left max-w-2xl mx-auto">
          {content.paragraphs.map((para, idx) => (
            <p
              key={`why-para-${idx}`}
              className="text-lg font-opus-serif text-taupe-700 leading-[1.8] mb-6"
            >
              {para}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
