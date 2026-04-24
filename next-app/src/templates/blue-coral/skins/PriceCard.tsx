import { Node } from '../../shared/Node';
import { resolveCheckoutHref } from '../../lib/checkout-href';
import { TrackedCheckoutLink } from '@/lib/analytics/TrackedCheckoutLink';
import { TrackedDeclineLink } from '@/lib/analytics/TrackedDeclineLink';
import type { SectionContentMap } from '../bridge';
import {
  BC_SALES,
  BcSalesArrowRight,
  BcSalesCheckIcon,
  BcSalesGiftIcon,
  bcSalesBtnCtaLg,
  type TemplateContext,
} from './shared';

type Props = {
  content: SectionContentMap['price-card'];
  context: TemplateContext;
};

export function PriceCard({ content, context }: Props) {
  if (!content) return null;
  const p = content;
  const wpCheckoutRedirectUrl = context?.wpCheckoutRedirectUrl;
  const wpThankyouRedirectUrl = context?.wpThankyouRedirectUrl;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: '#fff' }} id="purchase">
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{
          background: '#fff',
          border: `2px solid ${BC_SALES.SKY200}`,
          borderRadius: 28,
          boxShadow: '0 32px 56px -24px rgba(15,23,42,.25)',
          padding: '1.9rem 1.65rem',
          position: 'relative',
          overflow: 'hidden',
          maxWidth: 480,
          width: '100%',
          margin: '0 auto'
        }}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 6, background: `linear-gradient(90deg,${BC_SALES.BLUE500},${BC_SALES.CORAL400},${BC_SALES.BLUE500})` }} />

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: BC_SALES.CORAL500, color: '#fff', padding: '.4rem .9rem', borderRadius: 9999, fontWeight: 700, fontSize: '.72rem', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: '0.85rem' }}>
            <Node id="priceCard.badge" role="label">{p.badge}</Node>
          </div>

          <h3 className="blue-coral-heading" style={{ fontWeight: 700, fontSize: '1.25rem', color: BC_SALES.NAVY900, marginBottom: '0.5rem', lineHeight: 1.3 }}><Node id="priceCard.headline" role="heading">{p.headline}</Node></h3>
          <p style={{ fontSize: '0.9rem', color: BC_SALES.INK700, marginBottom: '0.5rem' }}><Node id="priceCard.note" role="body">{p.note}</Node></p>

          <ul style={{ padding: 0, listStyle: 'none', margin: '1rem 0 1.25rem' }}>
            {p.features.map((f, i) =>
            <li key={i} style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start', padding: '0.4rem 0', fontSize: '0.95rem', color: BC_SALES.INK800, lineHeight: 1.5 }}>
                <BcSalesCheckIcon />
                <span>{f}</span>
              </li>
            )}
          </ul>

          <div style={{ background: BC_SALES.CREAM, border: `1px solid ${BC_SALES.CREAM_LINE}`, borderRadius: 14, padding: '0.95rem 1.05rem', marginBottom: '1.25rem' }}>
            <p style={{ fontWeight: 700, fontSize: '0.85rem', color: BC_SALES.CORAL600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <BcSalesGiftIcon size={16} /> <Node id="priceCard.giftsBoxTitle" role="body">{p.giftsBoxTitle}</Node>
            </p>
            {p.giftItems.map((g, i) =>
            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.9rem', padding: '0.3rem 0', color: BC_SALES.INK700 }}>
                <BcSalesCheckIcon />
                <span>{g}</span>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', borderTop: `1px solid ${BC_SALES.SKY100}`, paddingTop: '1.25rem' }}>
            <p style={{ color: BC_SALES.NAVY700, textDecoration: 'line-through', fontWeight: 500, fontSize: '0.95rem', marginBottom: '0.25rem' }}>
              Total value: <Node id="priceCard.totalValue" role="body">{p.totalValue}</Node> — Regular price: <Node id="priceCard.regularPrice" role="body">{p.regularPrice}</Node>
            </p>
            <p className="blue-coral-heading" style={{ fontSize: '2.75rem', fontWeight: 800, color: '#16A34A', letterSpacing: '-0.02em', lineHeight: 1 }}><Node id="priceCard.currentPrice" role="body">{p.currentPrice}</Node></p>
            <p style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600, marginBottom: '1rem' }}><Node id="priceCard.savings" role="body">{p.savings}</Node></p>
            <TrackedCheckoutLink href={resolveCheckoutHref(wpCheckoutRedirectUrl)} style={bcSalesBtnCtaLg}>
              <Node id="priceCard.ctaLabel" role="button">{p.ctaLabel}</Node> <BcSalesArrowRight size={20} />
            </TrackedCheckoutLink>
            <p style={{ marginTop: '0.85rem', fontSize: '0.8rem', color: BC_SALES.NAVY700 }}><Node id="priceCard.guarantee" role="body">{p.guarantee}</Node></p>
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
