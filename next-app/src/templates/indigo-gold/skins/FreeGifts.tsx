import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { LAV_SALES, SalesGiftIcon } from './shared';

type Props = { content: SectionContentMap['free-gifts'] };

export function FreeGifts({ content }: Props) {
  const fg = content;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: '#fff' }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', fontStyle: 'italic', color: LAV_SALES.INK700, fontWeight: 500, fontSize: '1.35rem', marginBottom: '0.25rem' }}><Node id="freeGifts.eyebrow" role="label">{fg.eyebrow}</Node></p>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: LAV_SALES.INK900, lineHeight: 1.15 }}><Node id="freeGifts.headline" role="heading">{fg.headline}</Node></h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1.25rem' }}>
          {fg.items.map((gift, i) => (
            <div key={i} style={{ background: '#FFF8E6', border: '1px solid #F0E1A8', borderRadius: 20, boxShadow: '0 10px 24px -14px rgba(233,182,12,.3)', overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(135deg,#FFF6D6,#FFE07A)', aspectRatio: '16/10', display: 'grid', placeItems: 'center', color: '#8a6b00', fontFamily: '"Cormorant Garamond",Georgia,serif', fontStyle: 'italic', fontSize: '1.2rem', textAlign: 'center', padding: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <SalesGiftIcon size={40} color="#8a6b00" />
                  <span>Free Gift #{gift.giftNumber}</span>
                </div>
              </div>
              <div style={{ padding: '1.5rem 1.5rem 1rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '.15em', color: '#dc2626', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Free Gift #{gift.giftNumber}</p>
                <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: LAV_SALES.INK900, marginBottom: '0.4rem' }}>{gift.title}</h3>
                <p style={{ fontSize: '0.88rem', color: LAV_SALES.INK700, lineHeight: 1.6, marginBottom: '0.75rem' }}>{gift.description}</p>
                <span style={{ display: 'inline-block', background: '#fff', border: '1px solid #F0DD8A', color: '#8a6b00', fontWeight: 700, fontSize: '.7rem', letterSpacing: '.1em', padding: '.3rem .7rem', borderRadius: 9999 }}>{gift.valueLabel}</span>
              </div>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: LAV_SALES.INK700 }}><Node id="freeGifts.deliveryNote" role="body">{fg.deliveryNote}</Node></p>
      </div>
    </section>
  );
}
