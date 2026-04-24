import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { VS_SALES, VsGiftIcon } from './shared';

type Props = {
  content: SectionContentMap['free-gifts'];
};

export function FreeGifts({ content }: Props) {
  const fg = content;
  return (
    <section style={{ padding: '4rem 1.25rem', background: '#FFFFFF' }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
          <p
            className="violet-sun-italic-serif"
            style={{ color: VS_SALES.VIO_700, fontSize: '1.35rem', marginBottom: '0.35rem' }}
          >
            <Node id="freeGifts.eyebrow" role="label">{fg.eyebrow}</Node>
          </p>
          <h2
            className="violet-sun-display"
            style={{
              fontWeight: 700,
              fontSize: 'clamp(1.85rem, 3.2vw, 2.6rem)',
              color: VS_SALES.INK_900,
              lineHeight: 1.14,
            }}
          >
            <Node id="freeGifts.headline" role="heading">{fg.headline}</Node>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '1.35rem' }}>
          {fg.items.map((gift, i) => (
            <div
              key={i}
              style={{
                background: VS_SALES.SUN_100,
                border: `1px solid ${VS_SALES.SUN_300}`,
                borderRadius: 20,
                boxShadow: '0 12px 28px -16px rgba(255,195,0,.4)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  background: `linear-gradient(135deg, ${VS_SALES.SUN_100}, ${VS_SALES.SUN_400})`,
                  aspectRatio: '16/10',
                  display: 'grid',
                  placeItems: 'center',
                  color: VS_SALES.INK_900,
                  padding: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.55rem' }}>
                  <VsGiftIcon size={40} color={VS_SALES.INK_900} />
                  <span className="violet-sun-italic-serif" style={{ fontSize: '1.15rem' }}>
                    Free Gift #{gift.giftNumber}
                  </span>
                </div>
              </div>
              <div style={{ padding: '1.5rem 1.5rem 1.25rem' }}>
                <p
                  className="violet-sun-eyebrow"
                  style={{ color: '#DC2626', marginBottom: '0.35rem' }}
                >
                  Free Gift #{gift.giftNumber}
                </p>
                <h3
                  className="violet-sun-display"
                  style={{ fontWeight: 700, fontSize: '1.05rem', color: VS_SALES.INK_900, marginBottom: '0.45rem' }}
                >
                  {gift.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: VS_SALES.INK_600,
                    lineHeight: 1.6,
                    marginBottom: '0.85rem',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {gift.description}
                </p>
                <span
                  style={{
                    display: 'inline-block',
                    background: '#FFFFFF',
                    border: `1px solid ${VS_SALES.SUN_300}`,
                    color: VS_SALES.INK_900,
                    fontWeight: 700,
                    fontSize: '.7rem',
                    letterSpacing: '.12em',
                    padding: '.35rem .75rem',
                    borderRadius: 9999,
                    fontFamily: "'Inter', sans-serif",
                    textTransform: 'uppercase',
                  }}
                >
                  {gift.valueLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p
          style={{
            textAlign: 'center',
            marginTop: '1.75rem',
            fontSize: '0.9rem',
            color: VS_SALES.INK_700,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <Node id="freeGifts.deliveryNote" role="body">{fg.deliveryNote}</Node>
        </p>
      </div>
    </section>
  );
}
