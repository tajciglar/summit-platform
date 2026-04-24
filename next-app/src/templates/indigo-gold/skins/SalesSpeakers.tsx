import { Node } from '../../shared/Node';
import type { Speaker } from '../../types';
import { groupSpeakersByDay } from '../../shared/speakers-by-day';
import type { SectionContentMap } from '../bridge';
import { LAV_SALES } from './shared';

type Props = {
  content: SectionContentMap['sales-speakers'];
  speakers: Record<string, Speaker>;
};

export function SalesSpeakers({ content, speakers }: Props) {
  const s = content;
  const dayBlocks = groupSpeakersByDay(speakers);
  if (dayBlocks.length === 0) return null;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: '#fff' }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', fontStyle: 'italic', color: LAV_SALES.INK700, fontWeight: 500, fontSize: '1.35rem', marginBottom: '0.25rem' }}><Node id="salesSpeakers.eyebrow" role="label">{s.eyebrow}</Node></p>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: LAV_SALES.INK900, lineHeight: 1.15 }}><Node id="salesSpeakers.headline" role="heading">{s.headline}</Node></h2>
        </div>
        {dayBlocks.map(({ dayNumber, speakers: daySpeakers }) => (
          <div key={`sales-day-${dayNumber}`} style={{ marginBottom: '2.5rem' }}>
            <p style={{ textAlign: 'center', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '.15em', textTransform: 'uppercase', color: LAV_SALES.LAV700, marginBottom: '1rem' }}>
              DAY {dayNumber}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1rem' }}>
              {daySpeakers.map((spk) => (
                <details key={spk.id} className="indigo-gold-sales-spk" style={{ background: '#fff', border: `1px solid ${LAV_SALES.LAV200}`, borderRadius: 16, boxShadow: '0 6px 18px -10px rgba(90,69,137,.25)', marginBottom: 0, overflow: 'hidden' }}>
                  <summary style={{ cursor: 'pointer', listStyle: 'none', padding: '1.5rem 1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem' }}>
                    {spk.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={spk.photoUrl} alt={`${spk.firstName} ${spk.lastName}`} style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${LAV_SALES.LAV300}`, boxShadow: `0 0 0 4px #fff, 0 6px 14px -4px rgba(90,69,137,.35)` }} />
                    ) : (
                      <div style={{ width: 84, height: 84, borderRadius: '50%', background: `linear-gradient(135deg,${LAV_SALES.LAV200},${LAV_SALES.LAV400})`, border: `3px solid ${LAV_SALES.LAV300}`, display: 'grid', placeItems: 'center', color: LAV_SALES.LAV700, fontFamily: '"Cormorant Garamond",Georgia,serif', fontSize: '1.8rem', fontStyle: 'italic' }}>
                        {spk.firstName[0]}{spk.lastName[0]}
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <p style={{ fontWeight: 700, fontSize: '0.95rem', color: LAV_SALES.INK900, margin: 0 }}>{spk.firstName} {spk.lastName}</p>
                      <p style={{ fontSize: '0.78rem', color: LAV_SALES.LAV700, margin: 0 }}>{spk.title}</p>
                      <p style={{ fontSize: '0.78rem', color: LAV_SALES.INK700, margin: 0, fontStyle: 'italic' }}>{spk.masterclassTitle}</p>
                    </div>
                  </summary>
                  {spk.shortBio && (
                    <p style={{ padding: '0 1.5rem 1.5rem', color: LAV_SALES.INK700, fontSize: '0.88rem', lineHeight: 1.6, margin: 0, textAlign: 'center' }}>{spk.shortBio}</p>
                  )}
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
