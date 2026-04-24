import { Node } from '../../shared/Node';
import type { GreenGoldContent } from '../../green-gold.schema';
import type { Speaker } from '../../types';
import { GG_SALES, SPEAKER_GRADIENTS, salesEyebrow, salesHeadline } from './shared';

type Props = {
  content: GreenGoldContent;
  speakers: Record<string, Speaker>;
};

export function SalesSpeakers({ content, speakers }: Props) {
  if (!content.salesSpeakers) return null;
  const s = content.salesSpeakers;
  const sortedSpeakers = Object.values(speakers).sort((a, b) => a.sortOrder - b.sortOrder);
  if (sortedSpeakers.length === 0) return null;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: '#fff' }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p className="green-gold-heading" style={salesEyebrow}><Node id="salesSpeakers.eyebrow" role="label">{s.eyebrow}</Node></p>
          <h2 className="green-gold-heading" style={salesHeadline}><Node id="salesSpeakers.headline" role="heading">{s.headline}</Node></h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1rem' }}>
          {sortedSpeakers.map((spk, idx) =>
          <details key={spk.id} className="green-gold-sales-spk" style={{ background: '#fff', border: `1px solid ${GG_SALES.GREEN200}`, borderRadius: 16, boxShadow: '0 6px 18px -10px rgba(20,83,45,.28)', marginBottom: 0, overflow: 'hidden' }}>
              <summary style={{ cursor: 'pointer', listStyle: 'none', padding: '1.5rem 1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem' }}>
                {spk.photoUrl ?
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={spk.photoUrl} alt={`${spk.firstName} ${spk.lastName}`} style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${GG_SALES.GREEN200}`, boxShadow: `0 0 0 4px #fff, 0 6px 14px -4px rgba(20,83,45,.35)` }} /> :
              <div className="green-gold-heading" style={{ width: 84, height: 84, borderRadius: '50%', background: SPEAKER_GRADIENTS[idx % SPEAKER_GRADIENTS.length], border: `3px solid ${GG_SALES.GREEN200}`, display: 'grid', placeItems: 'center', color: '#fff', fontSize: '1.6rem', fontWeight: 800, boxShadow: `0 0 0 4px #fff, 0 6px 14px -4px rgba(20,83,45,.35)` }}>
                      {(spk.firstName?.[0] ?? '') + (spk.lastName?.[0] ?? '')}
                    </div>
              }
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <p className="green-gold-heading" style={{ fontWeight: 800, fontSize: '0.98rem', color: GG_SALES.INK900, margin: 0 }}>{spk.firstName} {spk.lastName}</p>
                  <p style={{ fontSize: '0.78rem', color: GG_SALES.GREEN700, margin: 0, fontWeight: 600 }}>{spk.title}</p>
                  <p style={{ fontSize: '0.78rem', color: GG_SALES.INK600, margin: 0, fontStyle: 'italic' }}>{spk.masterclassTitle}</p>
                </div>
              </summary>
              {spk.shortBio &&
            <p style={{ padding: '0 1.5rem 1.5rem', color: GG_SALES.INK700, fontSize: '0.88rem', lineHeight: 1.65, margin: 0, textAlign: 'center' }}>{spk.shortBio}</p>
            }
            </details>
          )}
        </div>
      </div>
    </section>);

}
