import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { BC_SALES, BcSalesGiftIcon } from './shared';

type Props = {
  content: SectionContentMap['free-gifts'];
};

export function FreeGifts({ content }: Props) {
  if (!content) return null;
  const fg = content;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: '#fff' }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ color: BC_SALES.CORAL600, fontWeight: 700, fontSize: '0.8rem', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}><Node id="freeGifts.eyebrow" role="label">{fg.eyebrow}</Node></p>
          <h2 className="blue-coral-heading" style={{ fontWeight: 700, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: BC_SALES.NAVY900, lineHeight: 1.15 }}><Node id="freeGifts.headline" role="heading">{fg.headline}</Node></h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1.25rem' }}>
          {fg.items.map((gift, i) =>
          <div key={i} style={{ background: BC_SALES.CREAM, border: `1px solid ${BC_SALES.CREAM_LINE}`, borderRadius: 20, boxShadow: '0 12px 28px -16px rgba(239,68,68,.22)', overflow: 'hidden' }}>
              <div style={{ background: `linear-gradient(135deg,#FFE6DD,${BC_SALES.CORAL300})`, aspectRatio: '16/10', display: 'grid', placeItems: 'center', color: BC_SALES.CORAL600, padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <BcSalesGiftIcon size={40} color={BC_SALES.CORAL600} />
                  <span className="blue-coral-heading" style={{ fontWeight: 600, fontSize: '0.95rem' }}>Free Gift #{gift.giftNumber}</span>
                </div>
              </div>
              <div style={{ padding: '1.5rem 1.5rem 1.25rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '.15em', color: BC_SALES.CORAL600, textTransform: 'uppercase', marginBottom: '0.3rem' }}>Free Gift #{gift.giftNumber}</p>
                <h3 className="blue-coral-heading" style={{ fontWeight: 700, fontSize: '1.05rem', color: BC_SALES.NAVY900, marginBottom: '0.4rem' }}>{gift.title}</h3>
                <p style={{ fontSize: '0.9rem', color: BC_SALES.INK700, lineHeight: 1.6, marginBottom: '0.75rem' }}>{gift.description}</p>
                <span style={{ display: 'inline-block', background: '#fff', border: `1px solid ${BC_SALES.CREAM_LINE}`, color: BC_SALES.CORAL600, fontWeight: 700, fontSize: '.7rem', letterSpacing: '.1em', padding: '.3rem .7rem', borderRadius: 9999 }}>{gift.valueLabel}</span>
              </div>
            </div>
          )}
        </div>
        <p style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: BC_SALES.INK700 }}><Node id="freeGifts.deliveryNote" role="body">{fg.deliveryNote}</Node></p>
      </div>
    </section>);

}
