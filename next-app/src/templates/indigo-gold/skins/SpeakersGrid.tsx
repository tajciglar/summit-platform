import type { Speaker } from '../../types';
import { groupSpeakersByDay } from '../../shared/speakers-by-day';
import { displayName, INK, LAV, speakerPhoto } from './shared';

type Props = { speakers: Record<string, Speaker> };

export function SpeakersGrid({ speakers }: Props) {
  const dayBlocks = groupSpeakersByDay(speakers);
  const showPlaceholder = dayBlocks.length === 0;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-5 md:px-8 text-center">
        <p className="indigo-gold-eyebrow-head mb-2">Learn From These</p>
        <h2 className="indigo-gold-h2-head mb-12">40+ World-Leading Experts and Authorities</h2>

        {showPlaceholder ? (
          <PlaceholderDayBlock dayNumber={1} count={6} />
        ) : (
          dayBlocks.map(({ dayNumber, speakers: daySpeakers }) => (
            <div key={`day-${dayNumber}`} className="mb-16">
              <p className="indigo-gold-eyebrow-head mb-1">DAY {dayNumber}</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
                {daySpeakers.map((s) => (
                  <SpeakerCard key={s.id} speaker={s} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function PlaceholderDayBlock({ dayNumber, count }: { dayNumber: number; count: number }) {
  return (
    <div className="mb-16">
      <p className="indigo-gold-eyebrow-head mb-1">DAY {dayNumber}</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={`placeholder-${idx}`} className="indigo-gold-spk" style={{ opacity: 0.45 }} aria-hidden="true">
            <div className="flex gap-4 items-start p-4">
              <div className="indigo-gold-spk-ava" style={{ background: '#E5E7EB', flexShrink: 0 }} />
              <div className="flex-1 space-y-2">
                <div className="h-4 rounded" style={{ background: '#E5E7EB', width: '70%' }} />
                <div className="h-3 rounded" style={{ background: '#F3F4F6', width: '50%' }} />
                <div className="h-3 rounded mt-3" style={{ background: '#F3F4F6', width: '85%' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm" style={{ color: INK.c700 }}>
        Speakers coming soon — assign them a day in the admin to see them here.
      </p>
    </div>
  );
}

function SpeakerCard({ speaker }: { speaker: Speaker }) {
  const quote = speaker.masterclassTitle;
  const credentials = speaker.title;
  const longBio = speaker.longBio ?? speaker.shortBio ?? '';

  return (
    <details className="indigo-gold-spk">
      <summary>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="indigo-gold-spk-ava" src={speakerPhoto(speaker, 200)} alt={displayName(speaker)} loading="lazy" />
        <div>
          <p className="font-bold" style={{ color: INK.c900 }}>
            {displayName(speaker)}
          </p>
          {credentials ? (
            <p className="text-xs mt-1" style={{ color: INK.c700 }}>
              {credentials}
            </p>
          ) : null}
          {quote ? (
            <p className="text-sm italic mt-2" style={{ color: LAV.c700 }}>
              &ldquo;{quote}&rdquo;
            </p>
          ) : null}
        </div>
      </summary>
      {longBio ? <div className="indigo-gold-spk-body">{longBio}</div> : null}
    </details>
  );
}
