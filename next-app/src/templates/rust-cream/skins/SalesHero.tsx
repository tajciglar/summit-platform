import { Node } from '../../shared/Node';
import { resolveCheckoutHref } from '../../lib/checkout-href';
import { TrackedCheckoutLink } from '@/lib/analytics/TrackedCheckoutLink';
import type { SectionContentMap } from '../bridge';
import { SALES_TOKENS, SalesArrowRight, salesBtnCtaLg, type TemplateContext } from './shared';

type Props = {
  content: SectionContentMap['sales-hero'];
  context: TemplateContext;
};

export function SalesHero({ content: h, context }: Props) {
  const topName = context.topBarName;
  return (
    <section style={{ padding: '2.5rem 1.25rem 4rem', background: `linear-gradient(180deg,${SALES_TOKENS.CREAM100} 0%,${SALES_TOKENS.CREAM50} 60%)` }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        {h.badge && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.18em', color: '#fff', background: SALES_TOKENS.RUST500, borderRadius: 9999, padding: '0.5rem 1rem', marginBottom: '1.5rem', textTransform: 'uppercase', boxShadow: `0 4px 14px ${SALES_TOKENS.RUST500}55` }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
            <Node id="salesHero.badge" role="label">{h.badge}</Node>
          </span>
        )}

        <h1 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', lineHeight: 1.2, letterSpacing: '-0.01em', color: SALES_TOKENS.INK900, marginBottom: '1rem' }}>
          {h.headline.split('40+').map((part, i, arr) =>
            i < arr.length - 1 ?
              <span key={i}>{part}<span style={{ background: SALES_TOKENS.GOLD100, padding: '0 0.3rem', borderRadius: 6 }}>40+</span></span> :
              <span key={i}>{part}</span>
          )}
        </h1>

        <p style={{ fontFamily: '"Playfair Display",Georgia,serif', fontStyle: 'italic', fontSize: 'clamp(1.1rem,2vw,1.4rem)', color: SALES_TOKENS.RUST400, maxWidth: 680, margin: '0 auto 2rem' }}>
          <Node id="salesHero.subheadline" role="heading">{h.subheadline}</Node>
        </p>

        {/* Product mockup */}
        <div style={{ maxWidth: 560, margin: '0 auto 2rem', borderRadius: 16, overflow: 'hidden', boxShadow: `0 24px 48px ${SALES_TOKENS.RUST700}45`, aspectRatio: '16/9', background: `linear-gradient(135deg,${SALES_TOKENS.RUST700},${SALES_TOKENS.RUST400})`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.35, background: `radial-gradient(circle at 20% 50%,${SALES_TOKENS.CREAM200},transparent 50%),radial-gradient(circle at 80% 50%,${SALES_TOKENS.GOLD400},transparent 40%)` }} />
          <div style={{ position: 'relative', textAlign: 'center', color: '#fff', padding: '1.5rem' }}>
            <p style={{ fontSize: '0.6rem', letterSpacing: '0.4em', textTransform: 'uppercase', opacity: 0.75, marginBottom: '0.5rem' }}>Full Access</p>
            <p style={{ fontFamily: '"Playfair Display",Georgia,serif', fontSize: 'clamp(2rem,5vw,4rem)', fontStyle: 'italic', margin: 0 }}><Node id="salesHero.productLabel" role="body">{h.productLabel}</Node></p>
            <p style={{ fontSize: '0.7rem', opacity: 0.85, marginTop: '0.5rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>{topName}</p>
          </div>
        </div>

        <p style={{ fontSize: '0.88rem', color: SALES_TOKENS.INK700, marginBottom: '0.5rem' }}>
          Total value: <span style={{ fontWeight: 700, color: SALES_TOKENS.RUST500, textDecoration: 'line-through' }}><Node id="salesHero.totalValue" role="body">{h.totalValue}</Node></span>
        </p>
        <TrackedCheckoutLink href={resolveCheckoutHref(context.wpCheckoutRedirectUrl)} id="purchase" className="rust-cream-sales-pulse" style={salesBtnCtaLg}>
          <Node id="salesHero.ctaLabel" role="button">{h.ctaLabel}</Node> <SalesArrowRight size={20} />
        </TrackedCheckoutLink>
        <p style={{ marginTop: '1rem', fontSize: '0.88rem', color: SALES_TOKENS.RUST500 }}>
          <strong><Node id="salesHero.ctaNote" role="body">{h.ctaNote}</Node></strong>
        </p>
      </div>
    </section>
  );
}
