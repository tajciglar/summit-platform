import type { Speaker } from '../../types';
import { groupSpeakersByDay } from '../../shared/speakers-by-day';
import {
  SPEAKER_GRADIENTS,
  displayName,
  initialsFromSpeaker,
} from './shared';

type Props = { speakers: Record<string, Speaker> };

export function Speakers({ speakers }: Props) {
  const dayBlocks = groupSpeakersByDay(speakers);
  const showPlaceholder = dayBlocks.length === 0;

  return (
    <section
      className="py-20 md:py-28 relative overflow-hidden"
      style={{ background: 'var(--cs-paper, #FAF7F2)' }}
    >
      <div className="relative max-w-6xl mx-auto px-6 text-center">
        <span className="cream-sage-eyebrow mb-3 inline-block" style={{ color: '#A85430' }}>
          Meet the Speakers
        </span>
        <h2
          className="font-black text-4xl md:text-5xl mb-14 leading-tight"
          style={{ fontFamily: "'Fraunces', serif", color: '#2A2419' }}
        >
          Understanding <span style={{ fontStyle: 'italic', color: '#4A6B5D' }}>your child&apos;s</span> brain.
        </h2>

        {showPlaceholder ? (
          <CreamSagePlaceholderDay dayNumber={1} count={8} />
        ) : (
          dayBlocks.map(({ dayNumber, speakers: daySpeakers }) => (
            <div key={`day-${dayNumber}`} className="mb-12">
              <p
                className="cream-sage-eyebrow mb-6 inline-block"
                style={{ color: '#4A6B5D', letterSpacing: '0.2em' }}
              >
                DAY {dayNumber}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {daySpeakers.map((s, idx) => (
                  <figure key={s.id} className="flex flex-col items-center">
                    <div
                      className="w-32 h-32 rounded-full mb-4 flex items-end justify-center pb-5 transition-transform hover:scale-105"
                      style={{ background: SPEAKER_GRADIENTS[idx % SPEAKER_GRADIENTS.length] }}
                    >
                      <span
                        className="font-black text-3xl"
                        style={{ fontFamily: "'Fraunces', serif", color: 'rgba(250,247,242,0.8)' }}
                      >
                        {initialsFromSpeaker(s)}
                      </span>
                    </div>
                    <p
                      className="font-bold text-xl"
                      style={{ fontFamily: "'Fraunces', serif", color: '#2F4A40' }}
                    >
                      {displayName(s)}
                    </p>
                    {s.title ? (
                      <p className="text-base font-medium" style={{ color: '#6B5E4C' }}>
                        {s.title}
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

function CreamSagePlaceholderDay({ dayNumber, count }: { dayNumber: number; count: number }) {
  return (
    <div className="mb-12" style={{ opacity: 0.45 }} aria-hidden="true">
      <p
        className="cream-sage-eyebrow mb-6 inline-block"
        style={{ color: '#4A6B5D', letterSpacing: '0.2em' }}
      >
        DAY {dayNumber}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={`placeholder-${idx}`} className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full mb-4" style={{ background: '#E8E3D8' }} />
            <div className="h-4 rounded w-24 mb-2" style={{ background: '#E8E3D8' }} />
            <div className="h-3 rounded w-16" style={{ background: '#F0EBE0' }} />
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm" style={{ color: '#6B5E4C' }}>
        Speakers coming soon — assign them a day in the admin to see them here.
      </p>
    </div>
  );
}
