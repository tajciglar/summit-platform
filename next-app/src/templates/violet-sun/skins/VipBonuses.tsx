import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { VS_SALES, VsSalesBonusIcon, vsSalesIconLabels } from './shared';

type Props = {
  content: SectionContentMap['vip-bonuses'];
};

export function VipBonuses({ content }: Props) {
  const v = content;
  return (
    <section style={{ padding: '4rem 1.25rem', background: VS_SALES.MIST_50 }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
          <p
            className="violet-sun-italic-serif"
            style={{ color: VS_SALES.VIO_700, fontSize: '1.35rem', marginBottom: '0.35rem' }}
          >
            <Node id="vipBonuses.eyebrow" role="label">{v.eyebrow}</Node>
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
            <Node id="vipBonuses.headline" role="heading">{v.headline}</Node>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.35rem' }}>
          {v.items.map((item, i) => (
            <div
              key={i}
              className="violet-sun-card-light"
              style={{
                overflow: 'hidden',
                position: 'relative',
                background: '#FFFFFF',
                borderRadius: 20,
                border: `1px solid ${VS_SALES.MIST_100}`,
              }}
            >
              <div
                style={{
                  background: `linear-gradient(135deg, ${VS_SALES.MIST_50}, ${VS_SALES.MIST_300})`,
                  aspectRatio: '16/10',
                  display: 'grid',
                  placeItems: 'center',
                  color: VS_SALES.VIO_700,
                  padding: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.55rem' }}>
                  <VsSalesBonusIcon icon={item.icon} />
                  <span
                    className="violet-sun-italic-serif"
                    style={{ fontSize: '1.15rem', textAlign: 'center' }}
                  >
                    {vsSalesIconLabels[item.icon]}
                  </span>
                </div>
              </div>
              <div style={{ padding: '1.5rem 1.5rem 1.25rem' }}>
                <h3
                  className="violet-sun-display"
                  style={{ fontWeight: 700, fontSize: '1.05rem', color: VS_SALES.INK_900, marginBottom: '0.45rem' }}
                >
                  {item.title}
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
                  {item.description}
                </p>
                <span
                  style={{
                    display: 'inline-block',
                    background: VS_SALES.VIO_50,
                    border: `1px solid ${VS_SALES.VIO_200}`,
                    color: VS_SALES.VIO_700,
                    fontWeight: 700,
                    fontSize: '.7rem',
                    letterSpacing: '.12em',
                    padding: '.35rem .75rem',
                    borderRadius: 9999,
                    fontFamily: "'Inter', sans-serif",
                    textTransform: 'uppercase',
                  }}
                >
                  {item.valueLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
