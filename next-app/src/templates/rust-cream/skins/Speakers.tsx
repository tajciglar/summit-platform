import type { Speaker } from '../../types';
import { groupSpeakersByDay } from '../../shared/speakers-by-day';
import {
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

  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: '#FDF8F3' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2
            className="rust-cream-heading font-black text-3xl md:text-4xl"
            style={{ color: '#3D2B1F' }}>

            Meet Your Speakers
          </h2>
        </div>

        {showPlaceholder ?
          <RustCreamPlaceholderDay dayNumber={1} count={8} /> :

          dayBlocks.map(({ dayNumber, speakers: daySpeakers }) =>
            <div key={`day-${dayNumber}`} className="mb-12">
              <div className="text-center mb-6">
                <span
                  className="inline-block text-white rust-cream-heading font-bold text-sm px-5 py-2 rounded-full"
                  style={{ backgroundColor: '#C2703E' }}>

                  DAY {dayNumber}
                </span>
              </div>
              <div className="rust-cream-speaker-scroll">
                {daySpeakers.map((s, idx) =>
                  <div key={s.id} className="rust-cream-speaker-card flex flex-col items-center">
                    <div
                      className="rust-cream-avatar mb-3"
                      style={{ background: SPEAKER_GRADIENTS[idx % SPEAKER_GRADIENTS.length] }}>

                      {initialsFromSpeaker(s)}
                    </div>
                    <p className="rust-cream-heading font-bold" style={{ color: '#3D2B1F' }}>
                      {displayName(s)}
                    </p>
                    {s.title ?
                      <p className="text-sm text-center" style={{ color: '#8B7355' }}>
                        {s.title}
                      </p> :
                      null}
                  </div>
                )}
              </div>
            </div>
          )
        }
      </div>
    </section>
  );
}

function RustCreamPlaceholderDay({ dayNumber, count }: { dayNumber: number; count: number }) {
  return (
    <div className="mb-12" style={{ opacity: 0.45 }} aria-hidden="true">
      <div className="text-center mb-6">
        <span
          className="inline-block text-white rust-cream-heading font-bold text-sm px-5 py-2 rounded-full"
          style={{ backgroundColor: '#C2703E' }}>

          DAY {dayNumber}
        </span>
      </div>
      <div className="rust-cream-speaker-scroll">
        {Array.from({ length: count }).map((_, idx) =>
          <div key={`placeholder-${idx}`} className="rust-cream-speaker-card flex flex-col items-center">
            <div className="rust-cream-avatar mb-3" style={{ background: '#EAD7C4' }} />
            <div className="h-4 rounded w-24 mb-2" style={{ background: '#EAD7C4' }} />
            <div className="h-3 rounded w-16" style={{ background: '#F3E6D7' }} />
          </div>
        )}
      </div>
      <p className="mt-6 text-center text-sm" style={{ color: '#8B7355' }}>
        Speakers coming soon — assign them a day in the admin to see them here.
      </p>
    </div>
  );
}
