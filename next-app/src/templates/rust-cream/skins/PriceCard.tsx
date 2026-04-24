import { Node } from '../../shared/Node';
import { resolveCheckoutHref } from '../../lib/checkout-href';
import { TrackedCheckoutLink } from '@/lib/analytics/TrackedCheckoutLink';
import { TrackedDeclineLink } from '@/lib/analytics/TrackedDeclineLink';
import type { SectionContentMap } from '../bridge';
import { SALES_TOKENS, SalesArrowRight, SalesCheckIcon, SalesGiftIcon, salesBtnCtaLg, type TemplateContext } from './shared';

type Props = {
  content: SectionContentMap['price-card'];
  context: TemplateContext;
};

export function PriceCard({ content: p, context }: Props) {
  const { wpCheckoutRedirectUrl, wpThankyouRedirectUrl } = context;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: SALES_TOKENS.CREAM50 }} id="purchase">
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{
          background: '#fff',
          border: `2px solid ${SALES_TOKENS.RUST400}`,
          borderRadius: 24,
          boxShadow: `0 24px 44px -24px ${SALES_TOKENS.RUST700}55`,
          padding: '1.75rem 1.5rem',
          position: 'relative',
          overflow: 'hidden',
          maxWidth: 480,
          width: '100%',
          margin: '0 auto'
        }}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 6, background: `linear-gradient(90deg,${SALES_TOKENS.RUST600},${SALES_TOKENS.GOLD400},${SALES_TOKENS.RUST600})` }} />

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: SALES_TOKENS.RUST500, color: '#fff', padding: '.35rem .85rem', borderRadius: 9999, fontWeight: 700, fontSize: '.72rem', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            <Node id="priceCard.badge" role="label">{p.badge}</Node>
          </div>

          <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '1.2rem', color: SALES_TOKENS.INK900, marginBottom: '0.5rem', lineHeight: 1.3 }}><Node id="priceCard.headline" role="heading">{p.headline}</Node></h3>
          <p style={{ fontSize: '0.88rem', color: SALES_TOKENS.INK700, marginBottom: '0.5rem' }}><Node id="priceCard.note" role="body">{p.note}</Node></p>

          <ul style={{ padding: 0, listStyle: 'none', margin: '1rem 0 1.25rem' }}>
            {p.features.map((f, i) =>
              <li key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', padding: '0.35rem 0', fontSize: '0.95rem', color: SALES_TOKENS.INK800, lineHeight: 1.45 }}>
                <SalesCheckIcon />
                <span>{f}</span>
              </li>
            )}
          </ul>

          <div style={{ background: SALES_TOKENS.GOLD50, border: `1px solid ${SALES_TOKENS.GOLD100}`, borderRadius: 12, padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
            <p style={{ fontWeight: 700, fontSize: '0.85rem', color: SALES_TOKENS.RUST600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <SalesGiftIcon size={16} /> <Node id="priceCard.giftsBoxTitle" role="body">{p.giftsBoxTitle}</Node>
            </p>
            {p.giftItems.map((g, i) =>
              <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.9rem', padding: '0.3rem 0', color: SALES_TOKENS.INK700 }}>
                <SalesCheckIcon />
                <span>{g}</span>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', borderTop: `1px solid ${SALES_TOKENS.CREAM200}`, paddingTop: '1.25rem' }}>
            <p style={{ color: SALES_TOKENS.RUST500, textDecoration: 'line-through', fontWeight: 500, fontSize: '0.95rem', marginBottom: '0.25rem' }}>
              Total value: <Node id="priceCard.totalValue" role="body">{p.totalValue}</Node> — Regular price: <Node id="priceCard.regularPrice" role="body">{p.regularPrice}</Node>
            </p>
            <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '2.6rem', fontWeight: 800, color: SALES_TOKENS.SAGE, letterSpacing: '-0.02em', lineHeight: 1 }}><Node id="priceCard.currentPrice" role="body">{p.currentPrice}</Node></p>
            <p style={{ fontSize: '0.85rem', color: SALES_TOKENS.SAGE, fontWeight: 600, marginBottom: '1rem' }}><Node id="priceCard.savings" role="body">{p.savings}</Node></p>
            <TrackedCheckoutLink href={resolveCheckoutHref(wpCheckoutRedirectUrl)} style={salesBtnCtaLg}>
              <Node id="priceCard.ctaLabel" role="button">{p.ctaLabel}</Node> <SalesArrowRight size={20} />
            </TrackedCheckoutLink>
            <p style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: SALES_TOKENS.RUST500 }}><Node id="priceCard.guarantee" role="body">{p.guarantee}</Node></p>
            {wpThankyouRedirectUrl &&
              <p style={{ marginTop: '1.25rem' }}>
                <TrackedDeclineLink href={wpThankyouRedirectUrl} style={{ color: '#64748b', fontSize: '0.85rem', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                  No thanks. Complete my free registration
                </TrackedDeclineLink>
              </p>
            }
          </div>
        </div>
      </div>
    </section>
  );
}
