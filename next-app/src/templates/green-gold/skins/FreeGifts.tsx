import { Node } from '../../shared/Node';
import type { GreenGoldContent } from '../../green-gold.schema';
import { GG_SALES, salesEyebrow, salesHeadline } from './shared';
import { SalesGiftIcon } from './sales-icons';

type Props = { content: GreenGoldContent };

export function FreeGifts({ content }: Props) {
  if (!content.freeGifts) return null;
  const fg = content.freeGifts;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: '#fff' }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p className="green-gold-heading" style={salesEyebrow}><Node id="freeGifts.eyebrow" role="label">{fg.eyebrow}</Node></p>
          <h2 className="green-gold-heading" style={salesHeadline}><Node id="freeGifts.headline" role="heading">{fg.headline}</Node></h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1.25rem' }}>
          {fg.items.map((gift, i) =>
          <div key={i} style={{ background: GG_SALES.CREAM, border: `1px solid ${GG_SALES.CREAM_BORDER}`, borderRadius: 20, boxShadow: '0 10px 26px -14px rgba(234,179,8,.3)', overflow: 'hidden' }}>
              <div style={{ background: `linear-gradient(135deg,#FFF6D6,${GG_SALES.GOLD300})`, aspectRatio: '16/10', display: 'grid', placeItems: 'center', color: GG_SALES.GOLD700, padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <SalesGiftIcon size={40} color={GG_SALES.GOLD700} />
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.95rem' }}>Free Gift #{gift.giftNumber}</span>
                </div>
              </div>
              <div style={{ padding: '1.5rem 1.5rem 1.25rem' }}>
                <p className="green-gold-heading" style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '.18em', color: '#dc2626', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Free Gift #{gift.giftNumber}</p>
                <h3 className="green-gold-heading" style={{ fontWeight: 800, fontSize: '1.05rem', color: GG_SALES.INK900, marginBottom: '0.45rem' }}>{gift.title}</h3>
                <p style={{ fontSize: '0.92rem', color: GG_SALES.INK700, lineHeight: 1.6, marginBottom: '0.85rem' }}>{gift.description}</p>
                <span className="green-gold-heading" style={{ display: 'inline-block', background: '#fff', border: `1px solid ${GG_SALES.CREAM_BORDER}`, color: GG_SALES.GOLD700, fontWeight: 800, fontSize: '.7rem', letterSpacing: '.14em', padding: '.35rem .75rem', borderRadius: 9999 }}>{gift.valueLabel}</span>
              </div>
            </div>
          )}
        </div>
        <p style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.92rem', color: GG_SALES.INK600 }}><Node id="freeGifts.deliveryNote" role="body">{fg.deliveryNote}</Node></p>
      </div>
    </section>);

}
