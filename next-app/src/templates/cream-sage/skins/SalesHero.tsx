import type { CreamSageContent } from '../../cream-sage.schema';
import { Node } from '../../shared/Node';
import { resolveCheckoutHref } from '../../lib/checkout-href';
import { TrackedCheckoutLink } from '@/lib/analytics/TrackedCheckoutLink';
import { CS_SALES, type TemplateContext } from './shared';

type Props = {
  content: CreamSageContent;
  context?: TemplateContext;
};

export function SalesHero({ content, context }: Props) {
  if (!content.salesHero) return null;
  const h = content.salesHero;
  const brand = content.topBar.brandName;
  const wpCheckoutRedirectUrl = context?.wpCheckoutRedirectUrl;
  return (
    <section
      className="relative overflow-hidden py-20 md:py-24"
      style={{ background: CS_SALES.CREAM }}
    >
      <div
        className="cream-sage-blob cream-sage-blob-sage"
        style={{ width: 500, height: 500, top: -150, left: -120, opacity: 0.35 }}
      />
      <div
        className="cream-sage-blob cream-sage-blob-rose"
        style={{ width: 420, height: 420, bottom: -140, right: -100, opacity: 0.35 }}
      />
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        {h.badge && (
          <span
            className="inline-flex items-center gap-2 px-4 py-2 mb-8"
            style={{
              background: CS_SALES.SAGE_DEEP,
              color: CS_SALES.CREAM,
              borderRadius: 999,
              fontFamily: "'Nunito', 'DM Sans', sans-serif",
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: CS_SALES.ROSE,
                display: 'inline-block',
              }}
            />
            <Node id="salesHero.badge">{h.badge}</Node>
          </span>
        )}

        <h1
          className="font-black text-4xl md:text-5xl lg:text-6xl leading-[1.08] mb-6"
          style={{ fontFamily: "'Fraunces', serif", color: CS_SALES.INK }}
        >
          <Node id="salesHero.headline">{h.headline}</Node>
        </h1>

        <p
          className="text-xl md:text-2xl mb-10 max-w-xl mx-auto"
          style={{
            fontFamily: "'Fraunces', serif",
            fontStyle: 'italic',
            color: CS_SALES.SAGE,
            lineHeight: 1.55,
          }}
        >
          <Node id="salesHero.subheadline">{h.subheadline}</Node>
        </p>

        {/* Letterpress "book cover" mockup */}
        <div
          className="relative mx-auto mb-10 overflow-hidden"
          style={{
            width: '100%',
            maxWidth: 520,
            aspectRatio: '16/10',
            borderRadius: '2rem',
            background: `linear-gradient(160deg,${CS_SALES.SAGE},${CS_SALES.SAGE_DEEP})`,
            border: `6px solid ${CS_SALES.CREAM_DEEP}`,
            boxShadow: '0 30px 60px -25px rgba(74,107,93,0.45)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 10,
              background: CS_SALES.ROSE,
            }}
          />
          <div
            className="h-full w-full flex flex-col items-center justify-center px-8 text-center"
            style={{ color: CS_SALES.CREAM }}
          >
            <p
              className="mb-3"
              style={{
                fontFamily: "'Nunito', 'DM Sans', sans-serif",
                fontSize: '0.7rem',
                letterSpacing: '0.35em',
                textTransform: 'uppercase',
                opacity: 0.8,
              }}
            >
              Special Edition
            </p>
            <p
              style={{
                fontFamily: "'Fraunces', serif",
                fontStyle: 'italic',
                fontSize: 'clamp(2.2rem,5vw,3.6rem)',
                lineHeight: 1.05,
                margin: 0,
              }}
            >
              <Node id="salesHero.productLabel">{h.productLabel}</Node>
            </p>
            <p
              className="mt-4"
              style={{
                fontFamily: "'Nunito', 'DM Sans', sans-serif",
                fontSize: '0.75rem',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                opacity: 0.85,
              }}
            >
              {brand}
            </p>
          </div>
        </div>

        <p className="text-base mb-5" style={{ color: CS_SALES.INK_SOFT }}>
          Total value:{' '}
          <span
            style={{
              fontWeight: 700,
              color: CS_SALES.CLAY,
              textDecoration: 'line-through',
            }}
          >
            <Node id="salesHero.totalValue">{h.totalValue}</Node>
          </span>
        </p>

        <TrackedCheckoutLink
          href={resolveCheckoutHref(wpCheckoutRedirectUrl)}
          id="purchase"
          className="cream-sage-btn-primary"
          style={{ fontSize: '1.15rem' }}
        >
          <Node id="salesHero.ctaLabel">{h.ctaLabel}</Node>
          <span aria-hidden="true">→</span>
        </TrackedCheckoutLink>

        <p
          className="mt-5 text-sm md:text-base"
          style={{
            fontFamily: "'Fraunces', serif",
            fontStyle: 'italic',
            color: CS_SALES.SAGE_DEEP,
          }}
        >
          <strong><Node id="salesHero.ctaNote">{h.ctaNote}</Node></strong>
        </p>
      </div>
    </section>
  );
}
