import { Node } from '../../shared/Node';
import type { GreenGoldContent } from '../../green-gold.schema';
import { resolveCheckoutHref } from '../../lib/checkout-href';
import { TrackedCheckoutLink } from '@/lib/analytics/TrackedCheckoutLink';
import { GG_SALES, salesBtnCtaLg, type TemplateContext } from './shared';
import { SalesArrowRight } from './sales-icons';

type Props = {
  content: GreenGoldContent;
  context: TemplateContext;
};

export function SalesHero({ content, context }: Props) {
  if (!content.salesHero) return null;
  const h = content.salesHero;
  const topName = content.topBar.title;
  const wpCheckoutRedirectUrl = context.wpCheckoutRedirectUrl;
  return (
    <section style={{ padding: '2.5rem 1.25rem 4rem', background: `linear-gradient(180deg,${GG_SALES.GREEN50} 0%,#FFFFFF 60%)` }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        {h.badge && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', fontFamily: 'Poppins, sans-serif', fontWeight: 800, letterSpacing: '0.22em', color: '#fff', background: '#dc2626', borderRadius: 9999, padding: '0.5rem 1rem', marginBottom: '1.5rem', textTransform: 'uppercase', boxShadow: '0 4px 14px rgba(220,38,38,.35)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
            <Node id="salesHero.badge" role="label">{h.badge}</Node>
          </span>
        )}

        <h1 className="green-gold-heading" style={{ fontWeight: 900, fontSize: 'clamp(1.75rem,3.8vw,2.6rem)', lineHeight: 1.15, letterSpacing: '-0.01em', color: GG_SALES.INK900, marginBottom: '1rem' }}>
          {h.headline.split('40+').map((part, i, arr) =>
          i < arr.length - 1 ?
          <span key={i}>{part}<span style={{ background: GG_SALES.GOLD300, padding: '0 0.35rem', borderRadius: 6 }}>40+</span></span> :
          <span key={i}>{part}</span>
          )}
        </h1>

        <p style={{ fontFamily: 'Source Sans 3, system-ui, sans-serif', fontSize: 'clamp(1.05rem,2vw,1.3rem)', color: GG_SALES.INK600, maxWidth: 680, margin: '0 auto 2rem', lineHeight: 1.55 }}>
          <Node id="salesHero.subheadline" role="heading">{h.subheadline}</Node>
        </p>

        {/* Product mockup — heartland green radial with warm-gold highlights */}
        <div style={{ maxWidth: 560, margin: '0 auto 2rem', borderRadius: 20, overflow: 'hidden', boxShadow: '0 28px 56px -18px rgba(20,83,45,.45)', aspectRatio: '16/9', background: `linear-gradient(135deg,${GG_SALES.GREEN900},${GG_SALES.GREEN700})`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.4, background: `radial-gradient(circle at 20% 50%,${GG_SALES.GREEN400},transparent 55%),radial-gradient(circle at 80% 55%,${GG_SALES.GOLD400},transparent 45%)` }} />
          <div style={{ position: 'relative', textAlign: 'center', color: '#fff', padding: '1.5rem' }}>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.42em', textTransform: 'uppercase', opacity: 0.8, marginBottom: '0.6rem' }}>Full Access</p>
            <p className="green-gold-heading" style={{ fontSize: 'clamp(2rem,5vw,3.6rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1, margin: 0 }}><Node id="salesHero.productLabel" role="body">{h.productLabel}</Node></p>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.72rem', fontWeight: 600, opacity: 0.85, marginTop: '0.75rem', letterSpacing: '0.24em', textTransform: 'uppercase' }}>{topName}</p>
          </div>
        </div>

        <p style={{ fontSize: '0.88rem', color: GG_SALES.INK700, marginBottom: '0.75rem' }}>
          Total value: <span style={{ fontWeight: 800, color: GG_SALES.GREEN700, textDecoration: 'line-through' }}><Node id="salesHero.totalValue" role="body">{h.totalValue}</Node></span>
        </p>
        <TrackedCheckoutLink href={resolveCheckoutHref(wpCheckoutRedirectUrl)} id="purchase" className="green-gold-pulse-gold" style={salesBtnCtaLg}>
          <Node id="salesHero.ctaLabel" role="button">{h.ctaLabel}</Node> <SalesArrowRight size={20} />
        </TrackedCheckoutLink>
        <p style={{ marginTop: '1rem', fontSize: '0.88rem', color: GG_SALES.GREEN700, fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
          <strong><Node id="salesHero.ctaNote" role="body">{h.ctaNote}</Node></strong>
        </p>
      </div>
    </section>);

}
