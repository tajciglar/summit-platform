import { Node } from '../../shared/Node';
import { resolveCheckoutHref } from '../../lib/checkout-href';
import { TrackedCheckoutLink } from '@/lib/analytics/TrackedCheckoutLink';
import type { SectionContentMap } from '../bridge';
import {
  BC_SALES,
  BcSalesArrowRight,
  bcSalesBtnCtaLg,
  type TemplateContext,
} from './shared';

type Props = {
  content: SectionContentMap['sales-hero'];
  context: TemplateContext;
};

export function SalesHero({ content, context }: Props) {
  if (!content) return null;
  const h = content;
  const topTitle = content.topBarTitle;
  const wpCheckoutRedirectUrl = context?.wpCheckoutRedirectUrl;
  return (
    <section style={{ padding: '2.5rem 1.25rem 4rem', background: `linear-gradient(180deg,${BC_SALES.SKY50} 0%,#FFFFFF 60%)` }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        {h.badge && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.16em', color: '#fff', background: BC_SALES.CORAL500, borderRadius: 9999, padding: '0.5rem 1rem', marginBottom: '1.5rem', textTransform: 'uppercase', boxShadow: '0 6px 18px rgba(239,68,68,.35)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
            <Node id="salesHero.badge" role="label">{h.badge}</Node>
          </span>
        )}

        <h1 className="blue-coral-heading" style={{ fontWeight: 700, fontSize: 'clamp(1.7rem,3.6vw,2.5rem)', lineHeight: 1.2, letterSpacing: '-0.01em', color: BC_SALES.NAVY900, marginBottom: '1rem' }}>
          {h.headline.split('40+').map((part, i, arr) =>
          i < arr.length - 1 ?
          <span key={i}>{part}<span style={{ background: BC_SALES.CORAL300, color: BC_SALES.NAVY900, padding: '0 0.35rem', borderRadius: 8 }}>40+</span></span> :
          <span key={i}>{part}</span>
          )}
        </h1>

        <p style={{ fontSize: 'clamp(1.05rem,1.9vw,1.25rem)', color: BC_SALES.INK700, maxWidth: 680, margin: '0 auto 2rem', lineHeight: 1.55 }}>
          <Node id="salesHero.subheadline" role="heading">{h.subheadline}</Node>
        </p>

        {/* Product mockup — blue gradient with coral glow */}
        <div style={{ maxWidth: 560, margin: '0 auto 2rem', borderRadius: 20, overflow: 'hidden', boxShadow: '0 28px 54px -20px rgba(15,23,42,.35)', aspectRatio: '16/9', background: `linear-gradient(135deg,${BC_SALES.NAVY700},${BC_SALES.BLUE500})`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.45, background: `radial-gradient(circle at 20% 50%,${BC_SALES.BLUE400},transparent 50%),radial-gradient(circle at 80% 60%,${BC_SALES.CORAL400},transparent 45%)` }} />
          <div style={{ position: 'relative', textAlign: 'center', color: '#fff', padding: '1.5rem' }}>
            <p style={{ fontSize: '0.6rem', letterSpacing: '0.4em', textTransform: 'uppercase', opacity: 0.75, marginBottom: '0.5rem' }}>Full Access</p>
            <p className="blue-coral-heading" style={{ fontSize: 'clamp(2rem,5vw,3.75rem)', margin: 0, fontWeight: 800, letterSpacing: '-0.02em' }}><Node id="salesHero.productLabel" role="body">{h.productLabel}</Node></p>
            <p style={{ fontSize: '0.7rem', opacity: 0.85, marginTop: '0.5rem', letterSpacing: '0.22em', textTransform: 'uppercase' }}>{topTitle}</p>
          </div>
        </div>

        <p style={{ fontSize: '0.9rem', color: BC_SALES.INK700, marginBottom: '0.6rem' }}>
          Total value: <span style={{ fontWeight: 700, color: BC_SALES.NAVY700, textDecoration: 'line-through' }}><Node id="salesHero.totalValue" role="body">{h.totalValue}</Node></span>
        </p>
        <TrackedCheckoutLink href={resolveCheckoutHref(wpCheckoutRedirectUrl)} id="purchase" className="blue-coral-sales-pulse" style={bcSalesBtnCtaLg}>
          <Node id="salesHero.ctaLabel" role="button">{h.ctaLabel}</Node> <BcSalesArrowRight size={20} />
        </TrackedCheckoutLink>
        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: BC_SALES.NAVY700 }}>
          <strong><Node id="salesHero.ctaNote" role="body">{h.ctaNote}</Node></strong>
        </p>
      </div>
    </section>);

}
