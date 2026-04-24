import type { Speaker } from '../../types';
import { groupSpeakersByDay } from '../../shared/speakers-by-day';
import { SPEAKER_GRADIENTS, displayName, initialsFromSpeaker } from './shared';

type Props = {
  speakers: Record<string, Speaker>;
};

function BlueCoralPlaceholderDay({ dayNumber, count }: { dayNumber: number; count: number }) {
  return (
    <div className="mb-12" style={{ opacity: 0.45 }} aria-hidden="true">
      <span
        className="inline-block text-white blue-coral-heading font-bold text-sm px-5 py-2 rounded-full mb-6"
        style={{ background: '#2563EB' }}>

        DAY {dayNumber}
      </span>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {Array.from({ length: count }).map((_, idx) =>
        <div key={`placeholder-${idx}`} className="flex flex-col items-center">
            <div className="blue-coral-avatar mb-3" style={{ background: '#E5E7EB' }} />
            <div className="h-4 rounded w-24 mb-2" style={{ background: '#E5E7EB' }} />
            <div className="h-3 rounded w-16" style={{ background: '#F3F4F6' }} />
          </div>
        )}
      </div>
      <p className="mt-6 text-sm" style={{ color: '#6B7280' }}>
        Speakers coming soon — assign them a day in the admin to see them here.
      </p>
    </div>);

}

export function SpeakersDay({ speakers }: Props) {
  const dayBlocks = groupSpeakersByDay(speakers);
  const showPlaceholder = dayBlocks.length === 0;

  return (
    <section className="py-16 md:py-24" style={{ background: '#F8FAFC' }}>
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2
          className="blue-coral-heading font-black text-3xl md:text-4xl mb-12"
          style={{ color: '#1E293B' }}>

          Meet Your Speakers
        </h2>

        {showPlaceholder ?
        <BlueCoralPlaceholderDay dayNumber={1} count={8} /> :

        dayBlocks.map(({ dayNumber, speakers: daySpeakers }) =>
        <div key={`day-${dayNumber}`} className="mb-12">
              <span
            className="inline-block text-white blue-coral-heading font-bold text-sm px-5 py-2 rounded-full mb-6"
            style={{ background: '#2563EB' }}>

                DAY {dayNumber}
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {daySpeakers.map((s, idx) =>
            <div key={`day-speaker-${s.id}`} className="flex flex-col items-center">
                    <div
                className="blue-coral-avatar mb-3"
                style={{
                  background: SPEAKER_GRADIENTS[idx % SPEAKER_GRADIENTS.length]
                }}>

                      {initialsFromSpeaker(s)}
                    </div>
                    <p
                className="blue-coral-heading font-bold"
                style={{ color: '#1E293B' }}>

                      {displayName(s)}
                    </p>
                    {s.title ?
              <p className="text-sm" style={{ color: '#6B7280' }}>
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
    </section>);

}
