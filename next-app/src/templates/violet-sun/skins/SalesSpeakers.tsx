import { Node } from '../../shared/Node';
import type { Speaker } from '../../types';
import type { SectionContentMap } from '../bridge';
import {
  SPEAKER_GRADIENTS,
  SPEAKER_INITIAL_COLORS,
  VS_SALES,
  displayName,
  initialsFromSpeaker,
} from './shared';

type Props = {
  content: SectionContentMap['sales-speakers'];
  speakers: Record<string, Speaker>;
};

export function SalesSpeakers({ content, speakers }: Props) {
  const s = content;
  const sortedSpeakers = Object.values(speakers).sort((a, b) => a.sortOrder - b.sortOrder);
  if (sortedSpeakers.length === 0) return null;
  return (
    <section style={{ padding: '4rem 1.25rem', background: '#FFFFFF' }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
          <p
            className="violet-sun-italic-serif"
            style={{ color: VS_SALES.VIO_700, fontSize: '1.35rem', marginBottom: '0.35rem' }}
          >
            <Node id="salesSpeakers.eyebrow" role="label">{s.eyebrow}</Node>
          </p>
          <h2
            className="violet-sun-display"
            style={{
              fontWeight: 700,
              fontSize: 'clamp(1.85rem, 3.2vw, 2.6rem)',
              color: VS_SALES.INK_900,
              lineHeight: 1.14,
            }}
          >
            <Node id="salesSpeakers.headline" role="heading">{s.headline}</Node>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1.1rem' }}>
          {sortedSpeakers.map((spk, idx) => (
            <details
              key={spk.id}
              style={{
                background: '#FFFFFF',
                border: `1px solid ${VS_SALES.MIST_100}`,
                borderRadius: 18,
                boxShadow: '0 8px 22px -12px rgba(74,47,184,.22)',
                marginBottom: 0,
                overflow: 'hidden',
              }}
            >
              <summary
                style={{
                  cursor: 'pointer',
                  listStyle: 'none',
                  padding: '1.5rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '0.85rem',
                }}
              >
                {spk.photoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={spk.photoUrl}
                    alt={displayName(spk)}
                    style={{
                      width: 88,
                      height: 88,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: `3px solid ${VS_SALES.VIO_200}`,
                      boxShadow: `0 0 0 4px #FFFFFF, 0 8px 18px -6px rgba(74,47,184,.35)`,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 88,
                      height: 88,
                      borderRadius: '50%',
                      background: SPEAKER_GRADIENTS[idx % SPEAKER_GRADIENTS.length],
                      border: `3px solid ${VS_SALES.VIO_200}`,
                      display: 'grid',
                      placeItems: 'center',
                      color: SPEAKER_INITIAL_COLORS[idx % SPEAKER_INITIAL_COLORS.length],
                      fontFamily: "'DM Serif Display', serif",
                      fontSize: '1.9rem',
                      fontStyle: 'italic',
                    }}
                  >
                    {initialsFromSpeaker(spk)}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <p
                    className="violet-sun-display"
                    style={{ fontWeight: 700, fontSize: '0.98rem', color: VS_SALES.INK_900, margin: 0 }}
                  >
                    {displayName(spk)}
                  </p>
                  <p style={{ fontSize: '0.78rem', color: VS_SALES.VIO_700, margin: 0, fontFamily: "'Inter', sans-serif" }}>
                    {spk.title}
                  </p>
                  <p
                    className="violet-sun-italic-serif"
                    style={{ fontSize: '0.85rem', color: VS_SALES.INK_700, margin: 0 }}
                  >
                    {spk.masterclassTitle}
                  </p>
                </div>
              </summary>
              {spk.shortBio && (
                <p
                  style={{
                    padding: '0 1.5rem 1.5rem',
                    color: VS_SALES.INK_600,
                    fontSize: '0.88rem',
                    lineHeight: 1.65,
                    margin: 0,
                    textAlign: 'center',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {spk.shortBio}
                </p>
              )}
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
