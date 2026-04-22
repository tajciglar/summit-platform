import { resolveCheckoutHref } from '../../lib/checkout-href';
import { TrackedCheckoutLink } from '@/lib/analytics/TrackedCheckoutLink';
import type { SectionContentMap } from '../bridge';
import type { TemplateContext } from './shared';

type Props = {
  content: NonNullable<SectionContentMap['price-card']>;
  context?: TemplateContext;
};

function CheckMark() {
  return (
    <span
      aria-hidden
      className="inline-block font-display font-black text-ochre-600 text-lg leading-none shrink-0 pt-1"
    >
      ✓
    </span>
  );
}

export function PriceCard({ content, context }: Props) {
  if (!content) return null;

  const ctaHref = resolveCheckoutHref(context?.wpCheckoutRedirectUrl);

  return (
    <section id="purchase" className="bg-paper-50 py-20 md:py-28 border-b border-paper-300">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-10">
          <p className="figure-label text-taupe-600 mb-3">Subscription Order · No. I</p>
          <h2 className="font-display font-black text-4xl md:text-5xl text-ink-700 leading-tight">
            Reserve Your Premium Edition
          </h2>
        </div>

        <article className="relative bg-paper-100 border border-paper-300 shadow-[0_30px_60px_-30px_rgba(42,15,23,0.35)]">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-ochre-600" />

          <div className="p-8 md:p-10">
            <div className="flex items-center justify-between pb-6 mb-8 rule">
              <span className="inline-flex items-center gap-2 bg-ink-700 text-paper-50 font-display font-bold text-xs px-4 py-1.5 tracking-[0.2em] uppercase">
                {content.badge}
              </span>
              <span className="figure-label">Vol. VII · Premium</span>
            </div>

            <h3 className="font-display font-black text-3xl md:text-4xl text-ink-700 leading-tight mb-3">
              {content.headline}
            </h3>
            <p className="font-opus-serif italic text-taupe-700 text-lg mb-8">{content.note}</p>

            <div className="mb-8">
              <p className="figure-label mb-4">What the Subscription Includes</p>
              <ul className="space-y-3">
                {content.features.map((feature, idx) => (
                  <li
                    key={`feature-${idx}`}
                    className="flex items-start gap-3 font-opus-serif text-taupe-700 leading-relaxed"
                  >
                    <CheckMark />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-10 bg-paper-50 border border-paper-300 p-6 deckle">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-paper-300">
                <p className="figure-label text-ochre-700">{content.giftsBoxTitle}</p>
                <span className="font-display font-black text-xs text-ink-700 tracking-wider">
                  GRATIS
                </span>
              </div>
              <ul className="space-y-2">
                {content.giftItems.map((gift, idx) => (
                  <li
                    key={`gift-item-${idx}`}
                    className="flex items-start gap-3 font-opus-serif text-taupe-700 text-sm leading-relaxed"
                  >
                    <span className="text-ochre-600 font-display font-bold shrink-0">§</span>
                    <span>{gift}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center pt-6 border-t border-paper-300">
              <p className="figure-label text-taupe-600 mb-3">
                Total Value · <span className="line-through font-opus-serif normal-case tracking-normal italic text-base">{content.totalValue}</span>
                <span className="mx-2">·</span>
                Regular Price · <span className="line-through font-opus-serif normal-case tracking-normal italic text-base">{content.regularPrice}</span>
              </p>
              <p className="font-display font-black text-6xl md:text-7xl text-ink-700 leading-none mb-2 tracking-[-0.02em]">
                {content.currentPrice}
              </p>
              <p className="font-opus-serif italic text-ochre-700 text-lg mb-8">{content.savings}</p>

              <TrackedCheckoutLink
                href={ctaHref}
                className="inline-flex items-center gap-3 bg-ink-700 hover:bg-ink-900 text-paper-50 font-ui font-semibold text-base md:text-lg px-10 py-4 rounded-full transition"
              >
                {content.ctaLabel}
                <span className="text-ochre-400 text-xl leading-none">→</span>
              </TrackedCheckoutLink>

              <p className="figure-label mt-6 text-taupe-600">{content.guarantee}</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
