import { Node } from '../../shared/Node';
import type { Speaker } from '../../types';
import type { SectionContentMap } from '../bridge';
import { BC_SALES, SPEAKER_GRADIENTS, displayName, initialsFromSpeaker } from './shared';

type Props = {
  content: SectionContentMap['sales-speakers'];
  speakers: Record<string, Speaker>;
};

export function SalesSpeakers({ content, speakers }: Props) {
  if (!content) return null;
  const s = content;
  const sortedSpeakers = Object.values(speakers).sort((a, b) => a.sortOrder - b.sortOrder);
  if (sortedSpeakers.length === 0) return null;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: '#fff' }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ color: BC_SALES.BLUE600, fontWeight: 700, fontSize: '0.8rem', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}><Node id="salesSpeakers.eyebrow" role="label">{s.eyebrow}</Node></p>
          <h2 className="blue-coral-heading" style={{ fontWeight: 700, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: BC_SALES.NAVY900, lineHeight: 1.15 }}><Node id="salesSpeakers.headline" role="heading">{s.headline}</Node></h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1rem' }}>
          {sortedSpeakers.map((spk, idx) =>
          <details key={spk.id} className="blue-coral-sales-spk" style={{ background: '#fff', border: `1px solid ${BC_SALES.SKY200}`, borderRadius: 18, boxShadow: '0 8px 20px -12px rgba(15,23,42,.2)', marginBottom: 0, overflow: 'hidden' }}>
              <summary style={{ cursor: 'pointer', listStyle: 'none', padding: '1.5rem 1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem' }}>
                {spk.photoUrl ?
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={spk.photoUrl} alt={`${spk.firstName} ${spk.lastName}`} style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${BC_SALES.SKY300}`, boxShadow: `0 0 0 4px #fff, 0 6px 14px -4px rgba(15,23,42,.3)` }} /> :
              <div style={{ width: 84, height: 84, borderRadius: '50%', background: SPEAKER_GRADIENTS[idx % SPEAKER_GRADIENTS.length], border: `3px solid ${BC_SALES.SKY300}`, display: 'grid', placeItems: 'center', color: '#fff', fontFamily: 'Poppins,sans-serif', fontSize: '1.4rem', fontWeight: 700 }}>
                      {initialsFromSpeaker(spk)}
                    </div>
              }
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <p className="blue-coral-heading" style={{ fontWeight: 700, fontSize: '0.95rem', color: BC_SALES.NAVY900, margin: 0 }}>{displayName(spk)}</p>
                  <p style={{ fontSize: '0.78rem', color: BC_SALES.BLUE600, margin: 0 }}>{spk.title}</p>
                  <p style={{ fontSize: '0.78rem', color: BC_SALES.INK700, margin: 0 }}>{spk.masterclassTitle}</p>
                </div>
              </summary>
              {spk.shortBio &&
            <p style={{ padding: '0 1.5rem 1.5rem', color: BC_SALES.INK700, fontSize: '0.88rem', lineHeight: 1.6, margin: 0, textAlign: 'center' }}>{spk.shortBio}</p>
            }
            </details>
          )}
        </div>
      </div>
    </section>);

}
