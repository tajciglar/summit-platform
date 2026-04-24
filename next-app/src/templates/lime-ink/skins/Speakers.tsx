import type { Speaker } from '../../types';
import { groupSpeakersByDay } from '../../shared/speakers-by-day';
import {
  SPEAKER_ACCENTS,
  SPEAKER_GRADIENTS,
  displayName,
  initialsFromSpeaker,
} from './shared';

type Props = {
  speakers: Record<string, Speaker>;
};

export function Speakers({ speakers }: Props) {
  const dayBlocks = groupSpeakersByDay(speakers);
  const showPlaceholder = dayBlocks.length === 0;
  const totalSpeakers = dayBlocks.reduce((sum, b) => sum + b.speakers.length, 0);

  return (
    <section className="bg-white py-20 md:py-28 lime-ink-hairline-b">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12 pb-4 lime-ink-hairline-b">
          <div>
            <div className="flex items-center gap-4 mb-5">
              <span className="lime-ink-mono text-xs" style={{ color: '#71717A' }}>
                04 → SPEAKERS
              </span>
              <span className="h-[1px] w-12" style={{ background: '#E4E4E7' }}></span>
            </div>
            <h2 className="font-black text-4xl md:text-5xl leading-tight tracking-[-0.03em]">
              Meet Your Speakers
            </h2>
          </div>
          {totalSpeakers > 0 ?
          <p className="lime-ink-mono text-xs hidden md:block" style={{ color: '#71717A' }}>
              {totalSpeakers} SPEAKERS →
            </p> :
          null}
        </div>

        {showPlaceholder ?
        <LimeInkPlaceholderDay dayNumber={1} count={8} /> :

        dayBlocks.map(({ dayNumber, speakers: daySpeakers }) =>
        <div key={`day-${dayNumber}`} className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <span className="lime-ink-mono text-xs" style={{ color: '#0A0A0B' }}>
                  DAY {String(dayNumber).padStart(2, '0')}
                </span>
                <span className="h-[1px] flex-1" style={{ background: '#E4E4E7' }}></span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
                {daySpeakers.map((s, idx) =>
            <figure key={s.id}>
                    <div
                className="lime-ink-spk-avatar aspect-square rounded-2xl mb-3 flex items-end justify-center pb-5"
                style={{ background: SPEAKER_GRADIENTS[idx % SPEAKER_GRADIENTS.length] }}>

                      <span
                  className="font-black text-4xl"
                  style={{ color: SPEAKER_ACCENTS[idx % SPEAKER_ACCENTS.length] }}>

                        {initialsFromSpeaker(s)}
                      </span>
                    </div>
                    <p className="font-bold">{displayName(s)}</p>
                    {s.title ?
              <p
                className="lime-ink-mono mt-1"
                style={{ fontSize: '0.65rem', color: '#71717A' }}>

                        {s.title.toUpperCase()}
                      </p> :
              null}
                  </figure>
            )}
              </div>
            </div>
        )
        }
      </div>
    </section>);

}

function LimeInkPlaceholderDay({ dayNumber, count }: { dayNumber: number; count: number }) {
  return (
    <div className="mb-12" style={{ opacity: 0.45 }} aria-hidden="true">
      <div className="flex items-center gap-4 mb-6">
        <span className="lime-ink-mono text-xs" style={{ color: '#0A0A0B' }}>
          DAY {String(dayNumber).padStart(2, '0')}
        </span>
        <span className="h-[1px] flex-1" style={{ background: '#E4E4E7' }}></span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        {Array.from({ length: count }).map((_, idx) =>
        <figure key={`placeholder-${idx}`}>
            <div
            className="lime-ink-spk-avatar aspect-square rounded-2xl mb-3"
            style={{ background: '#F4F4F5' }} />

            <div className="h-4 rounded w-20 mb-1" style={{ background: '#F4F4F5' }} />
            <div className="h-3 rounded w-14" style={{ background: '#FAFAFA' }} />
          </figure>
        )}
      </div>
      <p className="lime-ink-mono mt-8 text-xs text-center" style={{ color: '#71717A' }}>
        SPEAKERS COMING SOON — ASSIGN A DAY IN THE ADMIN TO SEE THEM HERE
      </p>
    </div>);

}
