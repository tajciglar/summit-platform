import type { SummitOverviewContent } from '../../../sections/summit-overview.schema';

type Props = {
  content: SummitOverviewContent;
};

export function SummitOverview({ content }: Props) {
  return (
    <section id="what-is-this" className="bg-paper-50 py-20 md:py-28 border-b border-paper-300">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-start">
        <div className="md:col-span-7">
          <p className="roman mb-4">{content.roman}</p>
          <h2 className="font-display font-black text-4xl md:text-5xl text-ink-700 leading-tight mb-8">
            {content.headline}
          </h2>
          {content.bodyParagraphs.map((para, idx) => (
            <p
              key={`essay-${idx}`}
              className={
                idx === 0
                  ? 'dropcap text-lg leading-[1.75] text-taupe-700 mb-6'
                  : 'text-lg leading-[1.75] text-taupe-700 mb-8'
              }
            >
              {para}
            </p>
          ))}
          <a
            href="#optin"
            className="inline-flex items-center gap-2 font-ui font-semibold text-ink-700 border-b-2 border-ochre-600 pb-1 hover:text-ochre-700 transition"
          >
            {content.ctaLabel}
            <span className="text-ochre-600">→</span>
          </a>
        </div>

        <aside className="md:col-span-5 md:pl-8 md:border-l md:border-paper-300">
          <p className="figure-label mb-6">{content.featureBand.eyebrow}</p>
          <div className="space-y-5 font-opus-serif text-taupe-700">
            {content.featureBand.bullets.map((bullet, idx) => (
              <div key={`editor-note-${idx}`} className="flex items-start gap-4">
                <span className="font-display font-black text-ochre-600 text-3xl leading-none pt-1">
                  {idx + 1}.
                </span>
                <p>{bullet}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
