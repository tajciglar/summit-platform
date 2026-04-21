import type { SpeakersByDayContent } from '../../../sections/speakers-by-day.schema';
import type { Speaker } from '../../types';
import {
  PORTRAIT_GRADIENTS,
  type TemplateContext,
  displayName,
  initialsFromSpeaker,
} from './shared';

type Props = {
  content: SpeakersByDayContent;
  speakers: Record<string, Speaker>;
  context: TemplateContext;
};

export function SpeakersByDay({ content, speakers, context }: Props) {
  return (
    <>
      {content.days.map((day, dayIdx) => {
        const daySpeakers = day.speakerIds
          .map((id) => speakers[id])
          .filter((s): s is Speaker => Boolean(s));

        return (
          <section
            key={`day-${dayIdx}`}
            className="bg-paper-100 py-20 md:py-28 border-b border-paper-300"
          >
            <div className="max-w-6xl mx-auto px-6">
              <div className="flex items-baseline justify-between mb-10 pb-4 rule">
                <div>
                  {day.roman ? <p className="roman mb-2">{day.roman}</p> : null}
                  <h2 className="font-display font-black text-4xl md:text-5xl text-ink-700">
                    {day.dayLabel}
                  </h2>
                </div>
                {day.dayTheme ? (
                  <p className="figure-label hidden md:block">{day.dayTheme}</p>
                ) : null}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
                {daySpeakers.map((s, idx) => (
                  <figure key={s.id}>
                    <div
                      className="portrait aspect-[4/5]"
                      style={{
                        background: PORTRAIT_GRADIENTS[idx % PORTRAIT_GRADIENTS.length],
                      }}
                    >
                      <div className="w-full h-full flex items-end justify-center pb-6">
                        <span className="font-display font-black text-paper-50/70 text-4xl">
                          {initialsFromSpeaker(s)}
                        </span>
                      </div>
                    </div>
                    <figcaption className="pt-3">
                      <p className="font-display font-bold text-ink-700">{displayName(s)}</p>
                      {s.title ? (
                        <p className="font-opus-serif italic text-sm text-taupe-600">{s.title}</p>
                      ) : null}
                    </figcaption>
                  </figure>
                ))}
              </div>

              <div className="mt-12 text-center">
                <a
                  href="#optin"
                  className="font-ui font-semibold text-ochre-700 hover:text-ochre-600 border-b border-ochre-700 pb-1 text-sm"
                >
                  {context.heroCtaLabel} &mdash; register free
                </a>
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
