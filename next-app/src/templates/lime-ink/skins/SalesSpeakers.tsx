import { Node } from '../../shared/Node';
import type { LimeInkContent } from '../../lime-ink.schema';
import type { Speaker } from '../../types';
import {
  SALES_INK,
  SPEAKER_GRADIENTS,
  initialsFromSpeaker,
} from './shared';

type Props = {
  content: NonNullable<LimeInkContent['salesSpeakers']>;
  speakers: Record<string, Speaker>;
};

export function SalesSpeakers({ content, speakers }: Props) {
  const s = content;
  const sortedSpeakers = Object.values(speakers).sort((a, b) => a.sortOrder - b.sortOrder);
  if (sortedSpeakers.length === 0) return null;
  return (
    <section className="bg-white py-20 md:py-28 lime-ink-hairline-b">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-4">
          <span
            className="lime-ink-mono text-xs"
            style={{ color: SALES_INK.INK400 }}>

            <Node id="salesSpeakers.eyebrow" role="label">{s.eyebrow}</Node>
          </span>
          <span
            className="h-[1px] w-12"
            style={{ background: SALES_INK.SURFACE_BORDER }}>
          </span>
        </div>
        <h2 className="font-black text-4xl md:text-5xl leading-[1.05] tracking-[-0.03em] mb-14 max-w-3xl">
          <Node id="salesSpeakers.headline" role="heading">{s.headline}</Node>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedSpeakers.map((spk, idx) =>
          <details
            key={spk.id}
            className="lime-ink-sales-spk rounded-2xl overflow-hidden"
            style={{
              background: SALES_INK.SURFACE,
              border: `1px solid ${SALES_INK.SURFACE_BORDER}`
            }}>

              <summary
              style={{
                cursor: 'pointer',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '0.75rem'
              }}>

                {spk.photoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={spk.photoUrl}
                alt={`${spk.firstName} ${spk.lastName}`}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `2px solid ${SALES_INK.LIME}`
                }} />) :


              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background:
                  SPEAKER_GRADIENTS[idx % SPEAKER_GRADIENTS.length],
                  border: `2px solid ${SALES_INK.LIME}`,
                  display: 'grid',
                  placeItems: 'center',
                  color: SALES_INK.LIME,
                  fontWeight: 900,
                  fontSize: '1.3rem'
                }}>

                    {initialsFromSpeaker(spk)}
                  </div>
              }
                <div>
                  <p
                  className="font-bold text-sm"
                  style={{ color: SALES_INK.INK900 }}>

                    {spk.firstName} {spk.lastName}
                  </p>
                  {spk.title ?
                <p
                  className="lime-ink-mono mt-1"
                  style={{
                    fontSize: '0.62rem',
                    color: SALES_INK.INK400,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em'
                  }}>

                      {spk.title}
                    </p> :
                null}
                  {spk.masterclassTitle ?
                <p
                  className="text-xs mt-1.5"
                  style={{ color: SALES_INK.INK500, fontStyle: 'italic' }}>

                      {spk.masterclassTitle}
                    </p> :
                null}
                </div>
              </summary>
              {spk.shortBio ?
            <p
              style={{
                padding: '0 1.25rem 1.25rem',
                color: SALES_INK.INK500,
                fontSize: '0.82rem',
                lineHeight: 1.6,
                margin: 0
              }}>

                  {spk.shortBio}
                </p> :
            null}
            </details>
          )}
        </div>
      </div>
    </section>);

}
