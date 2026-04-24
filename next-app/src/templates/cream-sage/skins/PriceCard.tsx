import type { CreamSageContent } from '../../cream-sage.schema';
import { Node } from '../../shared/Node';
import { resolveCheckoutHref } from '../../lib/checkout-href';
import { TrackedCheckoutLink } from '@/lib/analytics/TrackedCheckoutLink';
import { TrackedDeclineLink } from '@/lib/analytics/TrackedDeclineLink';
import { CS_SALES, CsSalesCheckIcon, CsSalesGiftIcon, type TemplateContext } from './shared';

type Props = {
  content: CreamSageContent;
  context?: TemplateContext;
};

export function PriceCard({ content, context }: Props) {
  if (!content.priceCard) return null;
  const p = content.priceCard;
  const wpCheckoutRedirectUrl = context?.wpCheckoutRedirectUrl;
  const wpThankyouRedirectUrl = context?.wpThankyouRedirectUrl;
  return (
    <section
      className="py-20 md:py-24"
      style={{ background: CS_SALES.CREAM }}
      id="purchase"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div
          className="relative mx-auto overflow-hidden"
          style={{
            maxWidth: 520,
            width: '100%',
            background: CS_SALES.CREAM,
            border: `1px solid ${CS_SALES.SAGE_LINE}`,
            borderRadius: 28,
            boxShadow: '0 30px 70px -30px rgba(74,107,93,0.35)',
            padding: '2rem 1.75rem',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 8,
              background: `linear-gradient(180deg,${CS_SALES.ROSE},${CS_SALES.CLAY})`,
            }}
          />

          <div
            className="inline-flex items-center gap-2 mb-4"
            style={{
              background: CS_SALES.SAGE_DEEP,
              color: CS_SALES.CREAM,
              padding: '0.35rem 0.9rem',
              borderRadius: 999,
              fontFamily: "'Nunito', 'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: '0.72rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
            }}
          >
            <Node id="priceCard.badge">{p.badge}</Node>
          </div>

          <h3
            className="font-bold text-2xl mb-2 leading-tight"
            style={{ fontFamily: "'Fraunces', serif", color: CS_SALES.INK }}
          >
            <Node id="priceCard.headline">{p.headline}</Node>
          </h3>
          <p
            className="text-base mb-4"
            style={{
              fontFamily: "'Fraunces', serif",
              fontStyle: 'italic',
              color: CS_SALES.INK_MUTED,
            }}
          >
            <Node id="priceCard.note">{p.note}</Node>
          </p>

          <ul
            className="space-y-2 mb-6"
            style={{ listStyle: 'none', padding: 0 }}
          >
            {p.features.map((f, i) => (
              <li
                key={`pc-feat-${i}`}
                className="flex gap-3 items-start text-base"
                style={{ color: CS_SALES.INK_SOFT, lineHeight: 1.5 }}
              >
                <CsSalesCheckIcon />
                <span><Node id={`priceCard.features.${i}`}>{f}</Node></span>
              </li>
            ))}
          </ul>

          <div
            className="mb-6"
            style={{
              background: CS_SALES.CREAM_DEEP,
              border: `1px solid ${CS_SALES.SAGE_LINE}`,
              borderRadius: 16,
              padding: '1rem 1.1rem',
            }}
          >
            <p
              className="mb-3 flex items-center gap-2"
              style={{
                fontFamily: "'Nunito', 'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: '0.82rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: CS_SALES.SAGE_DEEP,
              }}
            >
              <CsSalesGiftIcon size={16} color={CS_SALES.SAGE_DEEP} /> <Node id="priceCard.giftsBoxTitle">{p.giftsBoxTitle}</Node>
            </p>
            {p.giftItems.map((g, i) => (
              <div
                key={`pc-gift-${i}`}
                className="flex gap-2 items-start py-1 text-base"
                style={{ color: CS_SALES.INK_SOFT }}
              >
                <CsSalesCheckIcon />
                <span><Node id={`priceCard.giftItems.${i}`}>{g}</Node></span>
              </div>
            ))}
          </div>

          <div
            className="text-center pt-6"
            style={{ borderTop: `1px solid ${CS_SALES.SAGE_LINE}` }}
          >
            <p
              className="text-base mb-1"
              style={{
                color: CS_SALES.INK_MUTED,
                textDecoration: 'line-through',
              }}
            >
              Total value: <Node id="priceCard.totalValue">{p.totalValue}</Node> — Regular price: <Node id="priceCard.regularPrice">{p.regularPrice}</Node>
            </p>
            <p
              className="font-black leading-none mb-1"
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: '2.8rem',
                color: CS_SALES.SAGE_DEEP,
                letterSpacing: '-0.02em',
              }}
            >
              <Node id="priceCard.currentPrice">{p.currentPrice}</Node>
            </p>
            <p
              className="font-semibold text-sm mb-5"
              style={{
                fontFamily: "'Nunito', 'DM Sans', sans-serif",
                color: CS_SALES.SAGE,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              <Node id="priceCard.savings">{p.savings}</Node>
            </p>
            <TrackedCheckoutLink
              href={resolveCheckoutHref(wpCheckoutRedirectUrl)}
              className="cream-sage-btn-primary"
              style={{ fontSize: '1.1rem' }}
            >
              <Node id="priceCard.ctaLabel">{p.ctaLabel}</Node>
              <span aria-hidden="true">→</span>
            </TrackedCheckoutLink>
            <p
              className="mt-3 text-sm"
              style={{
                fontFamily: "'Fraunces', serif",
                fontStyle: 'italic',
                color: CS_SALES.INK_MUTED,
              }}
            >
              <Node id="priceCard.guarantee">{p.guarantee}</Node>
            </p>
            {wpThankyouRedirectUrl && (
              <p style={{ marginTop: '1.25rem' }}>
                <TrackedDeclineLink href={wpThankyouRedirectUrl} style={{ color: '#64748b', fontSize: '0.85rem', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                  No thanks. Complete my free registration
                </TrackedDeclineLink>
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
