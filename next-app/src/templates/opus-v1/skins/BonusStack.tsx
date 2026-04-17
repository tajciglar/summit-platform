import type { BonusStackContent } from '../../../sections/bonus-stack.schema';

type Props = {
  content: BonusStackContent;
};

const ROMAN = ['Sidebar I', 'Sidebar II', 'Sidebar III', 'Sidebar IV', 'Sidebar V'];

export function BonusStack({ content }: Props) {
  return (
    <section className="bg-paper-50 py-20 md:py-28 border-b border-paper-300">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="roman mb-2">{content.roman}</p>
          <h2 className="font-display font-black text-4xl md:text-5xl text-ink-700 leading-tight mb-4">
            {content.headline}
          </h2>
          <p className="font-opus-serif italic text-taupe-600 text-lg">{content.subhead}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {content.items.map((bonus, idx) => (
            <article key={`bonus-${idx}`} className="bg-paper-100 border border-paper-300 p-8">
              <div className="flex items-center justify-between mb-5">
                <span className="figure-label">{ROMAN[idx] ?? `Sidebar ${idx + 1}`}</span>
                <span className="bg-ochre-600 text-paper-50 font-display font-bold text-xs px-3 py-1">
                  {bonus.valueLabel}
                </span>
              </div>
              <h3 className="font-display font-black text-2xl text-ink-700 mb-3 leading-tight">
                {bonus.title}
              </h3>
              <p className="text-taupe-700 mb-5 leading-relaxed">{bonus.description}</p>
              {bonus.bullets && bonus.bullets.length > 0 ? (
                <ul className="space-y-2 text-sm font-opus-serif text-taupe-700">
                  {bonus.bullets.map((bullet, bIdx) => (
                    <li key={`bonus-${idx}-bullet-${bIdx}`} className="flex items-start gap-2">
                      <span className="text-ochre-600">§</span> {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
        <div className="text-center mt-12">
          <a
            href="#optin"
            className="inline-flex items-center gap-3 bg-ink-700 hover:bg-ink-900 text-paper-50 font-ui font-semibold px-10 py-4 rounded-full transition"
          >
            {content.ctaLabel}
            <span className="text-ochre-400">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
