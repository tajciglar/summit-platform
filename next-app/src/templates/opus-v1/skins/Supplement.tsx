import type { SupplementContent } from '../../../sections/supplement.schema';

type Props = {
  content: SupplementContent;
};

export function Supplement({ content }: Props) {
  return (
    <section className="bg-paper-100 py-20 md:py-28 border-b border-paper-300">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-5 flex justify-center">
          <div className="relative">
            <div className="w-64 h-80 bg-paper-50 deckle rounded-sm shadow-[0_30px_60px_-20px_rgba(42,15,23,0.3)] border border-paper-300 p-8 flex flex-col justify-between transform -rotate-2">
              <div>
                <p className="figure-label text-ochre-700 mb-3">{content.cardLabel}</p>
                <div className="w-12 h-[2px] bg-ochre-600 mb-5"></div>
                <h3 className="font-display font-black text-2xl text-ink-700 leading-tight">
                  {content.cardTitle}
                </h3>
              </div>
              <div>
                <p className="font-opus-serif italic text-taupe-600 text-sm">{content.cardFooter}</p>
                <p className="figure-label mt-3 text-taupe-500">{content.cardVolume}</p>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 bg-ochre-600 text-paper-50 font-display font-black text-xs px-4 py-2 rounded-sm transform rotate-3 shadow-lg">
              {content.badgeLabel}
            </div>
          </div>
        </div>
        <div className="md:col-span-7">
          <p className="eyebrow text-ochre-700 mb-3">{content.eyebrow}</p>
          <h2 className="font-display font-black text-4xl md:text-5xl text-ink-700 leading-tight mb-5">
            {content.headline}
          </h2>
          <p className="text-lg text-taupe-700 leading-relaxed mb-6">{content.body}</p>
          <ul className="space-y-3 mb-8">
            {content.bullets.map((bullet, idx) => (
              <li key={`supplement-bullet-${idx}`} className="flex items-start gap-3 text-taupe-700 font-opus-serif">
                <span className="text-ochre-600 font-display font-bold shrink-0">§</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
          <a
            href="#optin"
            className="inline-flex items-center gap-3 bg-ink-700 hover:bg-ink-900 text-paper-50 font-ui font-semibold px-7 py-3.5 rounded-full transition"
          >
            {content.ctaLabel}
            <span className="text-ochre-400">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
