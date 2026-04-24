import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { LAV_SALES, SalesBonusIcon, salesIconLabels } from './shared';

type Props = { content: SectionContentMap['vip-bonuses'] };

export function VipBonuses({ content }: Props) {
  const v = content;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: LAV_SALES.LAV50 }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', fontStyle: 'italic', color: LAV_SALES.INK700, fontWeight: 500, fontSize: '1.35rem', marginBottom: '0.25rem' }}><Node id="vipBonuses.eyebrow" role="label">{v.eyebrow}</Node></p>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: LAV_SALES.INK900, lineHeight: 1.15 }}><Node id="vipBonuses.headline" role="heading">{v.headline}</Node></h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem' }}>
          {v.items.map((item, i) => (
            <div key={i} style={{ background: '#fff', border: `1px solid ${LAV_SALES.LAV200}`, borderRadius: 20, boxShadow: '0 10px 24px -14px rgba(90,69,137,.3)', overflow: 'hidden', position: 'relative' }}>
              <div style={{ background: `linear-gradient(135deg,${LAV_SALES.LAV50},${LAV_SALES.LAV200})`, aspectRatio: '16/10', display: 'grid', placeItems: 'center', color: LAV_SALES.LAV700, fontFamily: '"Cormorant Garamond",Georgia,serif', fontStyle: 'italic', fontSize: '1.2rem', textAlign: 'center', padding: '1.25rem', flexDirection: 'column' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <SalesBonusIcon icon={item.icon} />
                  <span>{salesIconLabels[item.icon]}</span>
                </div>
              </div>
              <div style={{ padding: '1.5rem 1.5rem 1rem' }}>
                <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: LAV_SALES.INK900, marginBottom: '0.4rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.88rem', color: LAV_SALES.INK700, lineHeight: 1.6, marginBottom: '0.75rem' }}>{item.description}</p>
                <span style={{ display: 'inline-block', background: '#fff', border: `1px solid ${LAV_SALES.LAV300}`, color: LAV_SALES.LAV700, fontWeight: 700, fontSize: '.7rem', letterSpacing: '.1em', padding: '.3rem .7rem', borderRadius: 9999 }}>{item.valueLabel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
