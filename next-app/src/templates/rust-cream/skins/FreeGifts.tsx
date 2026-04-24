import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { SALES_TOKENS, SalesGiftIcon } from './shared';

type Props = {
  content: SectionContentMap['free-gifts'];
};

export function FreeGifts({ content: fg }: Props) {
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: SALES_TOKENS.CREAM50 }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ fontFamily: '"Playfair Display",Georgia,serif', fontStyle: 'italic', color: SALES_TOKENS.RUST400, fontWeight: 500, fontSize: '1.35rem', marginBottom: '0.25rem' }}><Node id="freeGifts.eyebrow" role="label">{fg.eyebrow}</Node></p>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: SALES_TOKENS.INK900, lineHeight: 1.15 }}><Node id="freeGifts.headline" role="heading">{fg.headline}</Node></h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1.25rem' }}>
          {fg.items.map((gift, i) =>
            <div key={i} style={{ background: SALES_TOKENS.GOLD50, border: `1px solid ${SALES_TOKENS.GOLD100}`, borderRadius: 20, boxShadow: `0 10px 24px -14px ${SALES_TOKENS.GOLD500}55`, overflow: 'hidden' }}>
              <div style={{ background: `linear-gradient(135deg,${SALES_TOKENS.GOLD50},${SALES_TOKENS.GOLD400})`, aspectRatio: '16/10', display: 'grid', placeItems: 'center', color: SALES_TOKENS.RUST700, fontFamily: '"Playfair Display",Georgia,serif', fontStyle: 'italic', fontSize: '1.2rem', textAlign: 'center', padding: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <SalesGiftIcon size={40} color={SALES_TOKENS.RUST700} />
                  <span>Free Gift #{gift.giftNumber}</span>
                </div>
              </div>
              <div style={{ padding: '1.5rem 1.5rem 1rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '.15em', color: SALES_TOKENS.RUST500, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Free Gift #{gift.giftNumber}</p>
                <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '1.05rem', color: SALES_TOKENS.INK900, marginBottom: '0.4rem' }}>{gift.title}</h3>
                <p style={{ fontSize: '0.88rem', color: SALES_TOKENS.INK700, lineHeight: 1.6, marginBottom: '0.75rem' }}>{gift.description}</p>
                <span style={{ display: 'inline-block', background: '#fff', border: `1px solid ${SALES_TOKENS.GOLD100}`, color: SALES_TOKENS.RUST600, fontWeight: 700, fontSize: '.7rem', letterSpacing: '.1em', padding: '.3rem .7rem', borderRadius: 9999 }}>{gift.valueLabel}</span>
              </div>
            </div>
          )}
        </div>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: SALES_TOKENS.INK700 }}><Node id="freeGifts.deliveryNote" role="body">{fg.deliveryNote}</Node></p>
      </div>
    </section>
  );
}
