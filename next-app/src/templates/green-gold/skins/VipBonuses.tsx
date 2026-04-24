import { Node } from '../../shared/Node';
import type { GreenGoldContent } from '../../green-gold.schema';
import { GG_SALES, salesEyebrow, salesHeadline, salesIconLabels } from './shared';
import { SalesBonusIcon } from './sales-icons';

type Props = { content: GreenGoldContent };

export function VipBonuses({ content }: Props) {
  if (!content.vipBonuses) return null;
  const v = content.vipBonuses;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: GG_SALES.GREEN50 }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p className="green-gold-heading" style={salesEyebrow}><Node id="vipBonuses.eyebrow" role="label">{v.eyebrow}</Node></p>
          <h2 className="green-gold-heading" style={salesHeadline}><Node id="vipBonuses.headline" role="heading">{v.headline}</Node></h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem' }}>
          {v.items.map((item, i) =>
          <div key={i} style={{ background: '#fff', border: `1px solid ${GG_SALES.GREEN200}`, borderRadius: 20, boxShadow: '0 10px 26px -14px rgba(20,83,45,.3)', overflow: 'hidden', position: 'relative' }}>
              <div style={{ background: `linear-gradient(135deg,${GG_SALES.GREEN100},${GG_SALES.GREEN200})`, aspectRatio: '16/10', display: 'grid', placeItems: 'center', color: GG_SALES.GREEN700, padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <SalesBonusIcon icon={item.icon} />
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.02em' }}>{salesIconLabels[item.icon]}</span>
                </div>
              </div>
              <div style={{ padding: '1.5rem 1.5rem 1.25rem' }}>
                <h3 className="green-gold-heading" style={{ fontWeight: 800, fontSize: '1.05rem', color: GG_SALES.INK900, marginBottom: '0.45rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.92rem', color: GG_SALES.INK700, lineHeight: 1.6, marginBottom: '0.85rem' }}>{item.description}</p>
                <span className="green-gold-heading" style={{ display: 'inline-block', background: GG_SALES.CREAM, border: `1px solid ${GG_SALES.CREAM_BORDER}`, color: GG_SALES.GOLD700, fontWeight: 800, fontSize: '.7rem', letterSpacing: '.14em', padding: '.35rem .75rem', borderRadius: 9999 }}>{item.valueLabel}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

}
