import { Node } from '../../shared/Node';
import { TrackedCheckoutLink } from '@/lib/analytics/TrackedCheckoutLink';
import { resolveCheckoutHref } from '../../lib/checkout-href';
import type { SectionContentMap } from '../bridge';
import { VS_SALES, VsArrowRight, type TemplateContext } from './shared';

type Props = {
  content: SectionContentMap['sales-hero'];
  context: TemplateContext;
};

export function SalesHero({ content, context }: Props) {
  const h = content;
  const topName = context.brandName;
  return (
    <section
      style={{
        padding: '3rem 1.25rem 4.5rem',
        background: `linear-gradient(180deg, ${VS_SALES.MIST_50} 0%, #FFFFFF 70%)`,
      }}
    >
      <div style={{ maxWidth: 920, margin: '0 auto', textAlign: 'center' }}>
        {h.badge && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.2em',
              color: '#FFFFFF',
              background: '#DC2626',
              borderRadius: 9999,
              padding: '0.5rem 1.1rem',
              marginBottom: '1.75rem',
              textTransform: 'uppercase',
              fontFamily: "'Inter', sans-serif",
              boxShadow: '0 6px 18px -6px rgba(220,38,38,.45)',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFFFFF' }} />
            <Node id="salesHero.badge" role="label">{h.badge}</Node>
          </span>
        )}

        <h1
          className="violet-sun-display"
          style={{
            fontWeight: 700,
            fontSize: 'clamp(1.9rem, 4vw, 2.8rem)',
            lineHeight: 1.12,
            color: VS_SALES.INK_900,
            marginBottom: '1.1rem',
          }}
        >
          <Node id="salesHero.headline" role="heading">{h.headline}</Node>
        </h1>

        <p
          className="violet-sun-italic-serif"
          style={{
            fontSize: 'clamp(1.15rem, 2.2vw, 1.55rem)',
            color: VS_SALES.VIO_700,
            maxWidth: 700,
            margin: '0 auto 2.25rem',
            lineHeight: 1.4,
          }}
        >
          <Node id="salesHero.subheadline" role="heading">{h.subheadline}</Node>
        </p>

        {/* Product mockup card — violet gradient with sun dot accents */}
        <div
          style={{
            maxWidth: 580,
            margin: '0 auto 2.25rem',
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: '0 30px 60px -24px rgba(74,47,184,.45)',
            aspectRatio: '16/9',
            background: `linear-gradient(135deg, ${VS_SALES.VIO_DARK} 0%, ${VS_SALES.VIO_700} 55%, ${VS_SALES.VIO_500} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.35,
              background: `radial-gradient(circle at 18% 30%, ${VS_SALES.SUN_400}, transparent 45%), radial-gradient(circle at 82% 70%, ${VS_SALES.VIO_200}, transparent 45%)`,
            }}
          />

          <div style={{ position: 'relative', textAlign: 'center', color: '#FFFFFF', padding: '1.5rem' }}>
            <p
              className="violet-sun-eyebrow"
              style={{ color: VS_SALES.SUN_400, marginBottom: '0.5rem' }}
            >
              Full Access
            </p>
            <p
              className="violet-sun-italic-serif"
              style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4.2rem)', margin: 0, lineHeight: 1.1 }}
            >
              <Node id="salesHero.productLabel" role="body">{h.productLabel}</Node>
            </p>
            <p
              className="violet-sun-eyebrow"
              style={{ marginTop: '0.75rem', color: VS_SALES.VIO_200 }}
            >
              {topName}
            </p>
          </div>
        </div>

        <p style={{ fontSize: '0.9rem', color: VS_SALES.INK_700, marginBottom: '0.75rem', fontFamily: "'Inter', sans-serif" }}>
          Total value:{' '}
          <span style={{ fontWeight: 700, color: VS_SALES.VIO_700, textDecoration: 'line-through' }}>
            <Node id="salesHero.totalValue" role="body">{h.totalValue}</Node>
          </span>
        </p>
        <TrackedCheckoutLink
          href={resolveCheckoutHref(context.wpCheckoutRedirectUrl)}
          className="violet-sun-btn-sun violet-sun-btn-sun-pulse"
          style={{ fontSize: '1.05rem', padding: '1.1rem 2.25rem' }}
        >
          <Node id="salesHero.ctaLabel" role="button">{h.ctaLabel}</Node> <VsArrowRight size={20} />
        </TrackedCheckoutLink>
        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: VS_SALES.VIO_700, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
          <Node id="salesHero.ctaNote" role="body">{h.ctaNote}</Node>
        </p>
      </div>
    </section>
  );
}
