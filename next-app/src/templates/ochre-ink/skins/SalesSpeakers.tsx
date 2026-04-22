import type { SectionContentMap } from '../bridge';
import type { Speaker } from '../../types';
import {
  PORTRAIT_GRADIENTS,
  displayName,
  initialsFromSpeaker,
} from './shared';

type Props = {
  content: NonNullable<SectionContentMap['sales-speakers']>;
  speakers: Record<string, Speaker>;
};

export function SalesSpeakers({ content, speakers }: Props) {
  if (!content) return null;
  const sortedSpeakers = Object.values(speakers).sort((a, b) => a.sortOrder - b.sortOrder);
  if (sortedSpeakers.length === 0) return null;

  return (
    <section className="bg-paper-100 py-20 md:py-28 border-b border-paper-300">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="eyebrow text-ochre-700 mb-3">{content.eyebrow}</p>
          <h2 className="font-display font-black text-4xl md:text-5xl text-ink-700 leading-tight">
            {content.headline}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
          {sortedSpeakers.map((spk, idx) => (
            <details key={spk.id} className="group">
              <summary className="cursor-pointer list-none">
                <figure>
                  {spk.photoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={spk.photoUrl}
                      alt={`${spk.firstName} ${spk.lastName}`}
                      className="portrait aspect-[4/5] w-full object-cover"
                    />
                  ) : (
                    <div
                      className="portrait aspect-[4/5]"
                      style={{ background: PORTRAIT_GRADIENTS[idx % PORTRAIT_GRADIENTS.length] }}
                    >
                      <div className="w-full h-full flex items-end justify-center pb-6">
                        <span className="font-display font-black text-paper-50/70 text-4xl">
                          {initialsFromSpeaker(spk)}
                        </span>
                      </div>
                    </div>
                  )}
                  <figcaption className="pt-3">
                    <p className="font-display font-bold text-ink-700">{displayName(spk)}</p>
                    {spk.title ? (
                      <p className="font-opus-serif italic text-sm text-taupe-600">{spk.title}</p>
                    ) : null}
                    {spk.masterclassTitle ? (
                      <p className="figure-label mt-2 text-ochre-700">{spk.masterclassTitle}</p>
                    ) : null}
                    <p className="figure-label mt-3 text-taupe-500 group-open:hidden">
                      Read Bio +
                    </p>
                    <p className="figure-label mt-3 text-taupe-500 hidden group-open:block">
                      Close —
                    </p>
                  </figcaption>
                </figure>
              </summary>
              {spk.shortBio ? (
                <p className="mt-3 font-opus-serif text-sm text-taupe-700 leading-relaxed border-t border-paper-300 pt-3">
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
