import type { SectionContentMap } from '../bridge';

type Props = {
  content: NonNullable<SectionContentMap['guarantee']>;
};

export function Guarantee({ content }: Props) {
  if (!content) return null;

  return (
    <section className="bg-paper-100 py-20 md:py-28 border-b border-paper-300">
      <div className="max-w-3xl mx-auto px-6">
        <div className="relative bg-paper-50 border-2 border-dashed border-ochre-600 p-10 md:p-12 text-center">
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-paper-50 px-4">
            <p className="figure-label text-ochre-700">Publisher&rsquo;s Pledge</p>
          </div>

          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border border-paper-300 bg-paper-100 mb-6">
            <span className="font-display font-black text-ochre-700 text-3xl leading-none">
              {content.days}
            </span>
          </div>
          <p className="figure-label mb-5 text-taupe-600">{content.days}-Day Full Refund</p>

          <h3 className="font-display font-black text-3xl md:text-4xl text-ink-700 leading-tight mb-5">
            {content.heading}
          </h3>
          <p className="font-opus-serif italic text-lg text-taupe-700 leading-relaxed max-w-xl mx-auto">
            {content.body}
          </p>

          <div className="mx-auto mt-8 w-16 h-[2px] bg-ochre-600" />
          <p className="figure-label mt-4 text-taupe-600">Signed · The Editors</p>
        </div>
      </div>
    </section>
  );
}
