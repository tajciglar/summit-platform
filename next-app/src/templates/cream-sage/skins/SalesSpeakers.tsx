import type { CreamSageContent } from '../../cream-sage.schema';
import type { Speaker } from '../../types';
import { Node } from '../../shared/Node';
import { CS_SALES, SPEAKER_GRADIENTS, displayName, initialsFromSpeaker } from './shared';

type Props = {
  content: CreamSageContent;
  speakers: Record<string, Speaker>;
};

export function SalesSpeakers({ content, speakers }: Props) {
  if (!content.salesSpeakers) return null;
  const s = content.salesSpeakers;
  const sortedSpeakers = Object.values(speakers).sort((a, b) => a.sortOrder - b.sortOrder);
  if (sortedSpeakers.length === 0) return null;
  return (
    <section className="py-20 md:py-24" style={{ background: CS_SALES.CREAM }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span
            className="cream-sage-eyebrow mb-3 inline-block"
            style={{ color: CS_SALES.CLAY }}
          >
            <Node id="salesSpeakers.eyebrow">{s.eyebrow}</Node>
          </span>
          <h2
            className="font-black text-4xl md:text-5xl leading-tight"
            style={{ fontFamily: "'Fraunces', serif", color: CS_SALES.INK }}
          >
            <Node id="salesSpeakers.headline">{s.headline}</Node>
          </h2>
        </div>
        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))' }}
        >
          {sortedSpeakers.map((spk, idx) => (
            <details
              key={spk.id}
              className="cream-sage-soft-card overflow-hidden"
            >
              <summary
                style={{
                  listStyle: 'none',
                  cursor: 'pointer',
                  padding: '1.75rem 1.25rem',
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
                      border: `3px solid ${CS_SALES.CREAM}`,
                      boxShadow: `0 0 0 4px ${CS_SALES.CREAM_DEEP}, 0 10px 24px -10px rgba(74,107,93,0.4)`,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 88,
                      height: 88,
                      borderRadius: '50%',
                      background: SPEAKER_GRADIENTS[idx % SPEAKER_GRADIENTS.length],
                      display: 'grid',
                      placeItems: 'center',
                      color: 'rgba(250,247,242,0.85)',
                      fontFamily: "'Fraunces', serif",
                      fontStyle: 'italic',
                      fontSize: '1.9rem',
                    }}
                  >
                    {initialsFromSpeaker(spk)}
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <p
                    className="font-bold text-base"
                    style={{ fontFamily: "'Fraunces', serif", color: CS_SALES.SAGE_DEEP, margin: 0 }}
                  >
                    {displayName(spk)}
                  </p>
                  {spk.title ? (
                    <p
                      className="text-sm"
                      style={{ color: CS_SALES.INK_MUTED, margin: 0 }}
                    >
                      {spk.title}
                    </p>
                  ) : null}
                  {spk.masterclassTitle ? (
                    <p
                      className="text-sm"
                      style={{
                        fontFamily: "'Fraunces', serif",
                        fontStyle: 'italic',
                        color: CS_SALES.INK_SOFT,
                        margin: 0,
                      }}
                    >
                      {spk.masterclassTitle}
                    </p>
                  ) : null}
                </div>
              </summary>
              {spk.shortBio ? (
                <p
                  className="px-6 pb-6 text-base leading-relaxed text-center"
                  style={{ color: CS_SALES.INK_SOFT, margin: 0 }}
                >
                  {spk.shortBio}
                </p>
              ) : null}
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
