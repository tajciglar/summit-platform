import { resolveCheckoutHref } from '../../lib/checkout-href';
import type { SectionContentMap } from '../bridge';
import type { TemplateContext } from './shared';

type Props = {
  content: NonNullable<SectionContentMap['sales-hero']>;
  context?: TemplateContext;
};

export function SalesHero({ content, context }: Props) {
  if (!content) return null;

  const ctaHref = resolveCheckoutHref(context?.wpCheckoutRedirectUrl);

  return (
    <section className="bg-paper-100 pt-14 md:pt-20 pb-16 md:pb-24 border-b border-paper-300 ochre-ink-sales-hero">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10 pb-4 rule">
          <span className="figure-label">Special Edition</span>
          <span className="figure-label">Subscriber Upgrade</span>
        </div>

        <div className="text-center max-w-3xl mx-auto">
          <p className="eyebrow text-ochre-700 mb-6 tracking-[0.3em]">{content.badge}</p>

          <h1 className="font-display font-black text-4xl md:text-6xl lg:text-7xl text-ink-700 leading-[1.02] tracking-[-0.02em] mb-8">
            {content.headline}
          </h1>

          <p className="font-opus-serif italic text-taupe-700 text-xl md:text-2xl leading-[1.55] mb-10 max-w-2xl mx-auto">
            {content.subheadline}
          </p>

          <figure className="relative mx-auto mb-10 max-w-xl ochre-ink-sales-frame">
            <div
              className="aspect-[16/10] border border-paper-300 bg-paper-50 flex flex-col items-center justify-center p-8 deckle"
              style={{ background: 'linear-gradient(160deg, var(--paper) 0%, var(--paper-alt) 60%, var(--accent) 180%)' }}
            >
              <p className="figure-label mb-3">Full Volume · Unabridged</p>
              <p className="font-display italic font-black text-4xl md:text-6xl text-ink-700 leading-none">
                {content.productLabel}
              </p>
              <p className="figure-label mt-4 text-ochre-700">Premium Reader Edition</p>
            </div>
            <figcaption className="figure-label mt-3 text-right">
              Fig. — Enclosed with your upgraded subscription
            </figcaption>
          </figure>

          <div className="inline-block border border-paper-300 bg-paper-50 px-6 py-3 mb-6">
            <p className="figure-label text-taupe-600">
              List Price
              <span className="ml-2 font-opus-serif italic text-base normal-case tracking-normal text-ink-700 line-through">
                {content.totalValue}
              </span>
            </p>
          </div>

          <div>
            <a
              href={ctaHref}
              className="inline-flex items-center gap-3 bg-ink-700 hover:bg-ink-900 text-paper-50 font-ui font-semibold text-base md:text-lg px-10 py-4 rounded-full transition"
            >
              {content.ctaLabel}
              <span className="text-ochre-400 text-xl leading-none">→</span>
            </a>
            <p className="font-opus-serif italic text-taupe-700 mt-4">{content.ctaNote}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
