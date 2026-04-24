import { Node } from '../../shared/Node';
import type { Speaker } from '../../types';
import type { SectionContentMap } from '../bridge';
import { SALES_TOKENS } from './shared';

type Props = {
  content: SectionContentMap['sales-speakers'];
  speakers: Record<string, Speaker>;
};

export function SalesSpeakers({ content: s, speakers }: Props) {
  const sortedSpeakers = Object.values(speakers).sort((a, b) => a.sortOrder - b.sortOrder);
  if (sortedSpeakers.length === 0) return null;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: SALES_TOKENS.CREAM50 }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ fontFamily: '"Playfair Display",Georgia,serif', fontStyle: 'italic', color: SALES_TOKENS.RUST400, fontWeight: 500, fontSize: '1.35rem', marginBottom: '0.25rem' }}><Node id="salesSpeakers.eyebrow" role="label">{s.eyebrow}</Node></p>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: SALES_TOKENS.INK900, lineHeight: 1.15 }}><Node id="salesSpeakers.headline" role="heading">{s.headline}</Node></h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1rem' }}>
          {sortedSpeakers.map((spk) =>
            <details key={spk.id} className="rust-cream-sales-spk" style={{ background: '#fff', border: `1px solid ${SALES_TOKENS.CREAM200}`, borderRadius: 16, boxShadow: `0 6px 18px -10px ${SALES_TOKENS.RUST700}40`, marginBottom: 0, overflow: 'hidden' }}>
              <summary style={{ cursor: 'pointer', listStyle: 'none', padding: '1.5rem 1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem' }}>
                {spk.photoUrl ?
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={spk.photoUrl} alt={`${spk.firstName} ${spk.lastName}`} style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${SALES_TOKENS.CREAM300}`, boxShadow: `0 0 0 4px #fff, 0 6px 14px -4px ${SALES_TOKENS.RUST700}55` }} /> :
                  <div style={{ width: 84, height: 84, borderRadius: '50%', background: `linear-gradient(135deg,${SALES_TOKENS.CREAM200},${SALES_TOKENS.RUST400})`, border: `3px solid ${SALES_TOKENS.CREAM300}`, display: 'grid', placeItems: 'center', color: '#fff', fontFamily: '"Playfair Display",Georgia,serif', fontSize: '1.8rem', fontStyle: 'italic' }}>
                    {spk.firstName[0]}{spk.lastName[0]}
                  </div>
                }
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '0.95rem', color: SALES_TOKENS.INK900, margin: 0 }}>{spk.firstName} {spk.lastName}</p>
                  <p style={{ fontSize: '0.78rem', color: SALES_TOKENS.RUST500, margin: 0 }}>{spk.title}</p>
                  <p style={{ fontSize: '0.78rem', color: SALES_TOKENS.INK700, margin: 0, fontStyle: 'italic' }}>{spk.masterclassTitle}</p>
                </div>
              </summary>
              {spk.shortBio &&
                <p style={{ padding: '0 1.5rem 1.5rem', color: SALES_TOKENS.INK700, fontSize: '0.88rem', lineHeight: 1.6, margin: 0, textAlign: 'center' }}>{spk.shortBio}</p>
              }
            </details>
          )}
        </div>
      </div>
    </section>
  );
}
