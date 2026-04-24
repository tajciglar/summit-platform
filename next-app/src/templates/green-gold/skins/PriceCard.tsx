import { Node } from '../../shared/Node';
import type { GreenGoldContent } from '../../green-gold.schema';
import { resolveCheckoutHref } from '../../lib/checkout-href';
import { TrackedCheckoutLink } from '@/lib/analytics/TrackedCheckoutLink';
import { TrackedDeclineLink } from '@/lib/analytics/TrackedDeclineLink';
import { GG_SALES, salesBtnCtaLg, type TemplateContext } from './shared';
import { SalesArrowRight, SalesCheckIcon, SalesGiftIcon } from './sales-icons';

type Props = {
  content: GreenGoldContent;
  context: TemplateContext;
};

export function PriceCard({ content, context }: Props) {
  if (!content.priceCard) return null;
  const p = content.priceCard;
  const wpCheckoutRedirectUrl = context.wpCheckoutRedirectUrl;
  const wpThankyouRedirectUrl = context.wpThankyouRedirectUrl;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: '#fff' }} id="purchase">
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{
          background: '#fff',
          border: `2px solid ${GG_SALES.GREEN500}`,
          borderRadius: 24,
          boxShadow: '0 26px 48px -22px rgba(20,83,45,.4)',
          padding: '1.75rem 1.5rem',
          position: 'relative',
          overflow: 'hidden',
          maxWidth: 480,
          width: '100%',
          margin: '0 auto'
        }}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 6, background: `linear-gradient(90deg,${GG_SALES.GREEN600},${GG_SALES.GOLD400},${GG_SALES.GREEN600})` }} />

          <div className="green-gold-heading" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#dc2626', color: '#fff', padding: '.4rem .9rem', borderRadius: 9999, fontWeight: 800, fontSize: '.72rem', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            <Node id="priceCard.badge" role="label">{p.badge}</Node>
          </div>

          <h3 className="green-gold-heading" style={{ fontWeight: 800, fontSize: '1.25rem', color: GG_SALES.INK900, marginBottom: '0.5rem', lineHeight: 1.3 }}><Node id="priceCard.headline" role="heading">{p.headline}</Node></h3>
          <p style={{ fontSize: '0.92rem', color: GG_SALES.INK600, marginBottom: '0.75rem' }}><Node id="priceCard.note" role="body">{p.note}</Node></p>

          <ul style={{ padding: 0, listStyle: 'none', margin: '1rem 0 1.25rem' }}>
            {p.features.map((f, i) =>
            <li key={i} style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start', padding: '0.4rem 0', fontSize: '0.95rem', color: GG_SALES.INK700, lineHeight: 1.5 }}>
                <SalesCheckIcon />
                <span>{f}</span>
              </li>
            )}
          </ul>

          <div style={{ background: GG_SALES.CREAM, border: `1px solid ${GG_SALES.CREAM_BORDER}`, borderRadius: 14, padding: '0.95rem 1rem', marginBottom: '1.25rem' }}>
            <p className="green-gold-heading" style={{ fontWeight: 800, fontSize: '0.85rem', color: GG_SALES.GOLD700, marginBottom: '0.55rem', display: 'flex', alignItems: 'center', gap: '0.45rem', letterSpacing: '.06em', textTransform: 'uppercase' }}>
              <SalesGiftIcon size={16} /> <Node id="priceCard.giftsBoxTitle" role="body">{p.giftsBoxTitle}</Node>
            </p>
            {p.giftItems.map((g, i) =>
            <div key={i} style={{ display: 'flex', gap: '0.55rem', alignItems: 'flex-start', fontSize: '0.9rem', padding: '0.3rem 0', color: GG_SALES.INK700 }}>
                <SalesCheckIcon />
                <span>{g}</span>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', borderTop: `1px solid ${GG_SALES.GREEN100}`, paddingTop: '1.25rem' }}>
            <p style={{ color: GG_SALES.INK500, textDecoration: 'line-through', fontWeight: 500, fontSize: '0.9rem', marginBottom: '0.35rem' }}>
              Total value: <Node id="priceCard.totalValue" role="body">{p.totalValue}</Node> — Regular price: <Node id="priceCard.regularPrice" role="body">{p.regularPrice}</Node>
            </p>
            <p className="green-gold-heading" style={{ fontSize: '2.75rem', fontWeight: 900, color: GG_SALES.GREEN600, letterSpacing: '-0.025em', lineHeight: 1 }}><Node id="priceCard.currentPrice" role="body">{p.currentPrice}</Node></p>
            <p className="green-gold-heading" style={{ fontSize: '0.85rem', color: GG_SALES.GREEN700, fontWeight: 700, marginTop: '0.3rem', marginBottom: '1rem', letterSpacing: '.02em' }}><Node id="priceCard.savings" role="body">{p.savings}</Node></p>
            <TrackedCheckoutLink href={resolveCheckoutHref(wpCheckoutRedirectUrl)} className="green-gold-pulse-gold" style={salesBtnCtaLg}>
              <Node id="priceCard.ctaLabel" role="button">{p.ctaLabel}</Node> <SalesArrowRight size={20} />
            </TrackedCheckoutLink>
            <p style={{ marginTop: '0.85rem', fontSize: '0.78rem', color: GG_SALES.INK600 }}><Node id="priceCard.guarantee" role="body">{p.guarantee}</Node></p>
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
    </section>);

}
