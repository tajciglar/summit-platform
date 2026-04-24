import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { SALES_TOKENS, SalesBonusIcon, salesIconLabels } from './shared';

type Props = {
  content: SectionContentMap['vip-bonuses'];
};

export function VipBonuses({ content: v }: Props) {
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: SALES_TOKENS.CREAM100 }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ fontFamily: '"Playfair Display",Georgia,serif', fontStyle: 'italic', color: SALES_TOKENS.RUST400, fontWeight: 500, fontSize: '1.35rem', marginBottom: '0.25rem' }}><Node id="vipBonuses.eyebrow" role="label">{v.eyebrow}</Node></p>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: SALES_TOKENS.INK900, lineHeight: 1.15 }}><Node id="vipBonuses.headline" role="heading">{v.headline}</Node></h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem' }}>
          {v.items.map((item, i) =>
            <div key={i} style={{ background: '#fff', border: `1px solid ${SALES_TOKENS.CREAM200}`, borderRadius: 20, boxShadow: `0 10px 24px -14px ${SALES_TOKENS.RUST700}55`, overflow: 'hidden', position: 'relative' }}>
              <div style={{ background: `linear-gradient(135deg,${SALES_TOKENS.CREAM50},${SALES_TOKENS.CREAM200})`, aspectRatio: '16/10', display: 'grid', placeItems: 'center', color: SALES_TOKENS.RUST600, fontFamily: '"Playfair Display",Georgia,serif', fontStyle: 'italic', fontSize: '1.2rem', textAlign: 'center', padding: '1.25rem', flexDirection: 'column' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <SalesBonusIcon icon={item.icon} />
                  <span>{salesIconLabels[item.icon]}</span>
                </div>
              </div>
              <div style={{ padding: '1.5rem 1.5rem 1rem' }}>
                <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '1.05rem', color: SALES_TOKENS.INK900, marginBottom: '0.4rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.88rem', color: SALES_TOKENS.INK700, lineHeight: 1.6, marginBottom: '0.75rem' }}>{item.description}</p>
                <span style={{ display: 'inline-block', background: '#fff', border: `1px solid ${SALES_TOKENS.CREAM300}`, color: SALES_TOKENS.RUST500, fontWeight: 700, fontSize: '.7rem', letterSpacing: '.1em', padding: '.3rem .7rem', borderRadius: 9999 }}>{item.valueLabel}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
