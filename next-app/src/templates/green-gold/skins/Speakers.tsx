import type { GreenGoldContent } from '../../green-gold.schema';
import { groupSpeakersByDay } from '../../shared/speakers-by-day';
import type { Speaker } from '../../types';
import { SPEAKER_GRADIENTS, displayName, initialsFromSpeaker } from './shared';

type Props = {
  content: GreenGoldContent;
  speakers: Record<string, Speaker>;
};

export function Speakers({ speakers }: Props) {
  const dayBlocks = groupSpeakersByDay(speakers);
  const showPlaceholder = dayBlocks.length === 0;

  return (
    <section className="py-16 md:py-24" style={{ background: '#F0FDF4' }}>
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2
          className="green-gold-heading font-black text-3xl md:text-4xl mb-14"
          style={{ color: '#1A2E1A' }}>

          Meet Your Speakers
        </h2>

        {showPlaceholder ?
        <GreenGoldPlaceholderDay dayNumber={1} count={6} /> :

        dayBlocks.map(({ dayNumber, speakers: daySpeakers }) =>
        <div key={`day-${dayNumber}`} className="mb-14">
              <span
            className="green-gold-heading inline-block text-white font-bold text-sm px-5 py-2 rounded-full mb-6"
            style={{ background: '#16A34A' }}>

                DAY {dayNumber}
              </span>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-10 md:gap-12">
                {daySpeakers.map((s, idx) =>
            <figure key={s.id} className="flex flex-col items-center">
                    <div
                className="green-gold-avatar mb-4"
                style={{
                  width: '140px',
                  height: '140px',
                  fontSize: '1.5rem',
                  background: SPEAKER_GRADIENTS[idx % SPEAKER_GRADIENTS.length]
                }}>

                      {initialsFromSpeaker(s)}
                    </div>
                    <p
                className="green-gold-heading font-bold text-lg"
                style={{ color: '#1A2E1A' }}>

                      {displayName(s)}
                    </p>
                    {s.title ?
              <p className="text-sm" style={{ color: 'rgba(26,46,26,0.5)' }}>
                        {s.title}
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

function GreenGoldPlaceholderDay({ dayNumber, count }: { dayNumber: number; count: number }) {
  return (
    <div className="mb-14" style={{ opacity: 0.45 }} aria-hidden="true">
      <span
        className="green-gold-heading inline-block text-white font-bold text-sm px-5 py-2 rounded-full mb-6"
        style={{ background: '#16A34A' }}>

        DAY {dayNumber}
      </span>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-10 md:gap-12">
        {Array.from({ length: count }).map((_, idx) =>
        <div key={`placeholder-${idx}`} className="flex flex-col items-center">
            <div
            className="green-gold-avatar mb-4"
            style={{ width: '140px', height: '140px', background: '#D1FAE5' }} />

            <div className="h-4 rounded w-28 mb-2" style={{ background: '#D1FAE5' }} />
            <div className="h-3 rounded w-20" style={{ background: '#E8F5EC' }} />
          </div>
        )}
      </div>
      <p className="mt-6 text-sm" style={{ color: 'rgba(26,46,26,0.5)' }}>
        Speakers coming soon — assign them a day in the admin to see them here.
      </p>
    </div>);

}
