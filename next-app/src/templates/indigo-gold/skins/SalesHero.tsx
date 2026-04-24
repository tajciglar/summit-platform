import { Node } from '../../shared/Node';
import { resolveCheckoutHref } from '../../lib/checkout-href';
import { TrackedCheckoutLink } from '@/lib/analytics/TrackedCheckoutLink';
import type { SectionContentMap } from '../bridge';
import { LAV_SALES, SalesArrowRight, salesBtnCtaLg, type TemplateContext } from './shared';

type Props = {
  content: SectionContentMap['sales-hero'];
  context: TemplateContext;
};

export function SalesHero({ content, context }: Props) {
  const h = content;
  const topName = context.topBarName;
  return (
    <section style={{ padding: '2.5rem 1.25rem 4rem', background: 'linear-gradient(180deg,#F4EFFA 0%,#FFFFFF 60%)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        {h.badge && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.18em', color: '#fff', background: '#dc2626', borderRadius: 9999, padding: '0.5rem 1rem', marginBottom: '1.5rem', textTransform: 'uppercase', boxShadow: '0 4px 14px rgba(220,38,38,.3)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
            <Node id="salesHero.badge" role="label">{h.badge}</Node>
          </span>
        )}

        <h1 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', lineHeight: 1.2, letterSpacing: '-0.01em', color: LAV_SALES.INK900, marginBottom: '1rem' }}>
          {h.headline.split('40+').map((part, i, arr) =>
            i < arr.length - 1 ? (
              <span key={i}>{part}<span style={{ background: LAV_SALES.SUN300, padding: '0 0.3rem', borderRadius: 6 }}>40+</span></span>
            ) : (
              <span key={i}>{part}</span>
            ),
          )}
        </h1>

        <p style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', fontStyle: 'italic', fontSize: 'clamp(1.1rem,2vw,1.4rem)', color: LAV_SALES.LAV700, maxWidth: 680, margin: '0 auto 2rem' }}>
          <Node id="salesHero.subheadline" role="heading">{h.subheadline}</Node>
        </p>

        {/* Product mockup */}
        <div style={{ maxWidth: 560, margin: '0 auto 2rem', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 48px rgba(90,69,137,.3)', aspectRatio: '16/9', background: `linear-gradient(135deg,${LAV_SALES.LAV700},${LAV_SALES.LAV500})`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.3, background: `radial-gradient(circle at 20% 50%,${LAV_SALES.LAV300},transparent 50%),radial-gradient(circle at 80% 50%,${LAV_SALES.SUN300},transparent 40%)` }} />
          <div style={{ position: 'relative', textAlign: 'center', color: '#fff', padding: '1.5rem' }}>
            <p style={{ fontSize: '0.6rem', letterSpacing: '0.4em', textTransform: 'uppercase', opacity: 0.7, marginBottom: '0.5rem' }}>Full Access</p>
            <p style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', fontSize: 'clamp(2rem,5vw,4rem)', fontStyle: 'italic', margin: 0 }}><Node id="salesHero.productLabel" role="body">{h.productLabel}</Node></p>
            <p style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '0.5rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>{topName}</p>
          </div>
        </div>

        <p style={{ fontSize: '0.88rem', color: LAV_SALES.INK700, marginBottom: '0.5rem' }}>
          Total value: <span style={{ fontWeight: 700, color: LAV_SALES.LAV700, textDecoration: 'line-through' }}><Node id="salesHero.totalValue" role="body">{h.totalValue}</Node></span>
        </p>
        <TrackedCheckoutLink href={resolveCheckoutHref(context.wpCheckoutRedirectUrl)} id="purchase" className="indigo-gold-sales-pulse" style={salesBtnCtaLg}>
          <Node id="salesHero.ctaLabel" role="button">{h.ctaLabel}</Node> <SalesArrowRight size={20} />
        </TrackedCheckoutLink>
        <p style={{ marginTop: '1rem', fontSize: '0.88rem', color: LAV_SALES.LAV700 }}>
          <strong><Node id="salesHero.ctaNote" role="body">{h.ctaNote}</Node></strong>
        </p>
      </div>
    </section>
  );
}
