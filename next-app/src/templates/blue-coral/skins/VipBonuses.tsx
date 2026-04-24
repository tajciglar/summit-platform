import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { BC_SALES, BcSalesBonusIcon, blueCoralSalesIconLabels } from './shared';

type Props = {
  content: SectionContentMap['vip-bonuses'];
};

export function VipBonuses({ content }: Props) {
  if (!content) return null;
  const v = content;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: BC_SALES.SKY50 }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ color: BC_SALES.BLUE600, fontWeight: 700, fontSize: '0.8rem', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}><Node id="vipBonuses.eyebrow" role="label">{v.eyebrow}</Node></p>
          <h2 className="blue-coral-heading" style={{ fontWeight: 700, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: BC_SALES.NAVY900, lineHeight: 1.15 }}><Node id="vipBonuses.headline" role="heading">{v.headline}</Node></h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem' }}>
          {v.items.map((item, i) =>
          <div key={i} style={{ background: '#fff', border: `1px solid ${BC_SALES.SKY200}`, borderRadius: 20, boxShadow: '0 12px 28px -16px rgba(29,78,216,.25)', overflow: 'hidden' }}>
              <div style={{ background: `linear-gradient(135deg,${BC_SALES.SKY50},${BC_SALES.SKY200})`, aspectRatio: '16/10', display: 'grid', placeItems: 'center', color: BC_SALES.BLUE700, padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <BcSalesBonusIcon icon={item.icon} />
                  <span className="blue-coral-heading" style={{ fontWeight: 600, fontSize: '0.95rem' }}>{blueCoralSalesIconLabels[item.icon]}</span>
                </div>
              </div>
              <div style={{ padding: '1.5rem 1.5rem 1.25rem' }}>
                <h3 className="blue-coral-heading" style={{ fontWeight: 700, fontSize: '1.05rem', color: BC_SALES.NAVY900, marginBottom: '0.4rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.9rem', color: BC_SALES.INK700, lineHeight: 1.6, marginBottom: '0.75rem' }}>{item.description}</p>
                <span style={{ display: 'inline-block', background: '#fff', border: `1px solid ${BC_SALES.SKY300}`, color: BC_SALES.BLUE700, fontWeight: 700, fontSize: '.7rem', letterSpacing: '.1em', padding: '.3rem .7rem', borderRadius: 9999 }}>{item.valueLabel}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

}
