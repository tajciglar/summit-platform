import { Node } from '../../shared/Node';
import { TrackedCheckoutLink } from '@/lib/analytics/TrackedCheckoutLink';
import { TrackedDeclineLink } from '@/lib/analytics/TrackedDeclineLink';
import { resolveCheckoutHref } from '../../lib/checkout-href';
import type { SectionContentMap } from '../bridge';
import { VS_SALES, VsArrowRight, VsCheckIcon, VsGiftIcon, type TemplateContext } from './shared';

type Props = {
  content: SectionContentMap['price-card'];
  context: TemplateContext;
};

export function PriceCard({ content, context }: Props) {
  const p = content;
  const { wpCheckoutRedirectUrl, wpThankyouRedirectUrl } = context;
  return (
    <section style={{ padding: '4rem 1.25rem', background: '#FFFFFF' }} id="purchase">
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div
          style={{
            background: '#FFFFFF',
            border: `2px solid ${VS_SALES.VIO_200}`,
            borderRadius: 28,
            boxShadow: '0 32px 60px -30px rgba(74,47,184,.4)',
            padding: '2rem 1.75rem',
            position: 'relative',
            overflow: 'hidden',
            maxWidth: 500,
            width: '100%',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: 6,
              background: `linear-gradient(90deg, ${VS_SALES.VIO_500}, ${VS_SALES.SUN_500}, ${VS_SALES.VIO_500})`,
            }}
          />

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#DC2626',
              color: '#FFFFFF',
              padding: '.4rem .9rem',
              borderRadius: 9999,
              fontWeight: 700,
              fontSize: '.72rem',
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              marginBottom: '0.85rem',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <Node id="priceCard.badge" role="label">{p.badge}</Node>
          </div>

          <h3
            className="violet-sun-display"
            style={{ fontWeight: 700, fontSize: '1.25rem', color: VS_SALES.INK_900, marginBottom: '0.55rem', lineHeight: 1.28 }}
          >
            <Node id="priceCard.headline" role="heading">{p.headline}</Node>
          </h3>
          <p
            style={{
              fontSize: '0.9rem',
              color: VS_SALES.INK_600,
              marginBottom: '0.6rem',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <Node id="priceCard.note" role="body">{p.note}</Node>
          </p>

          <ul style={{ padding: 0, listStyle: 'none', margin: '1.1rem 0 1.4rem' }}>
            {p.features.map((f, i) => (
              <li
                key={i}
                style={{
                  display: 'flex',
                  gap: '0.65rem',
                  alignItems: 'flex-start',
                  padding: '0.4rem 0',
                  fontSize: '0.95rem',
                  color: VS_SALES.INK_700,
                  lineHeight: 1.48,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <VsCheckIcon />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <div
            style={{
              background: VS_SALES.SUN_100,
              border: `1px solid ${VS_SALES.SUN_300}`,
              borderRadius: 14,
              padding: '0.9rem 1.1rem',
              marginBottom: '1.4rem',
            }}
          >
            <p
              style={{
                fontWeight: 700,
                fontSize: '0.85rem',
                color: VS_SALES.INK_900,
                marginBottom: '0.55rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <VsGiftIcon size={16} color={VS_SALES.INK_900} /> <Node id="priceCard.giftsBoxTitle" role="body">{p.giftsBoxTitle}</Node>
            </p>
            {p.giftItems.map((g, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: '0.55rem',
                  alignItems: 'flex-start',
                  fontSize: '0.9rem',
                  padding: '0.3rem 0',
                  color: VS_SALES.INK_700,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <VsCheckIcon />
                <span>{g}</span>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', borderTop: `1px solid ${VS_SALES.MIST_100}`, paddingTop: '1.4rem' }}>
            <p
              style={{
                color: VS_SALES.VIO_700,
                textDecoration: 'line-through',
                fontWeight: 500,
                fontSize: '0.95rem',
                marginBottom: '0.3rem',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Total value: <Node id="priceCard.totalValue" role="body">{p.totalValue}</Node> — Regular price: <Node id="priceCard.regularPrice" role="body">{p.regularPrice}</Node>
            </p>
            <p
              className="violet-sun-display"
              style={{
                fontSize: '2.8rem',
                fontWeight: 800,
                color: '#16A34A',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}
            >
              <Node id="priceCard.currentPrice" role="body">{p.currentPrice}</Node>
            </p>
            <p
              style={{
                fontSize: '0.88rem',
                color: '#16A34A',
                fontWeight: 600,
                marginBottom: '1.1rem',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <Node id="priceCard.savings" role="body">{p.savings}</Node>
            </p>
            <TrackedCheckoutLink
              href={resolveCheckoutHref(wpCheckoutRedirectUrl)}
              className="violet-sun-btn-sun violet-sun-btn-sun-pulse"
              style={{ fontSize: '1.05rem', padding: '1.1rem 2.25rem' }}
            >
              <Node id="priceCard.ctaLabel" role="button">{p.ctaLabel}</Node> <VsArrowRight size={20} />
            </TrackedCheckoutLink>
            <p
              style={{
                marginTop: '0.85rem',
                fontSize: '0.78rem',
                color: VS_SALES.VIO_700,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <Node id="priceCard.guarantee" role="body">{p.guarantee}</Node>
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
