import type { Speaker } from '../../types';
import { groupSpeakersByDay } from '../../shared/speakers-by-day';
import {
  SPEAKER_GRADIENTS,
  SPEAKER_INITIAL_COLORS,
  VioletSunPlaceholderDay,
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
    <section className="violet-sun-grad-mist py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-6">
          <div>
            <h2
              className="violet-sun-display font-bold text-4xl md:text-5xl tracking-[-0.03em] leading-tight"
              style={{ color: '#110833' }}
            >
              Understanding <span className="violet-sun-italic-serif" style={{ color: '#2A1869' }}>your child&apos;s</span> brain.
            </h2>
          </div>
          {totalSpeakers > 0 ? (
            <p className="font-medium" style={{ color: '#544B75' }}>
              {totalSpeakers} speakers →
            </p>
          ) : null}
        </div>

        {showPlaceholder ? (
          <VioletSunPlaceholderDay dayNumber={1} count={8} />
        ) : (
          dayBlocks.map(({ dayNumber, speakers: daySpeakers }) => (
            <div key={`day-${dayNumber}`} className="mb-12">
              <span
                className="inline-block violet-sun-eyebrow px-4 py-2 rounded-full mb-6"
                style={{ background: '#6F4EE6', color: '#FFFFFF' }}
              >
                DAY {String(dayNumber).padStart(2, '0')}
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
                {daySpeakers.map((sp, idx) => (
                  <figure key={sp.id} className="violet-sun-card-light p-6 text-center">
                    <div
                      className="w-28 h-28 rounded-full mx-auto mb-4 flex items-end justify-center pb-4"
                      style={{ background: SPEAKER_GRADIENTS[idx % SPEAKER_GRADIENTS.length] }}
                    >
                      <span
                        className="violet-sun-display font-bold text-3xl"
                        style={{ color: SPEAKER_INITIAL_COLORS[idx % SPEAKER_INITIAL_COLORS.length] }}
                      >
                        {initialsFromSpeaker(sp)}
                      </span>
                    </div>
                    <p className="violet-sun-display font-bold" style={{ color: '#110833' }}>
                      {displayName(sp)}
                    </p>
                    {sp.title ? (
                      <p className="text-sm mt-1" style={{ color: '#6B638A' }}>
                        {sp.title}
                      </p>
                    ) : null}
                  </figure>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
