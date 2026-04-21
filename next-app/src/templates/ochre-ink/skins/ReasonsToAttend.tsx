import type { ReasonsToAttendContent } from '../../../sections/reasons-to-attend.schema';

type Props = {
  content: ReasonsToAttendContent;
};

export function ReasonsToAttend({ content }: Props) {
  return (
    <section className="bg-paper-100 py-20 md:py-28 border-b border-paper-300">
      <div className="max-w-4xl mx-auto px-6">
        <p className="roman mb-2">{content.roman}</p>
        <h2 className="font-display font-black text-4xl md:text-5xl text-ink-700 leading-tight mb-14">
          {content.headline}
        </h2>
        <div className="space-y-12">
          {content.items.map((item, idx) => (
            <article key={`shift-${idx}`} className="flex gap-8 items-start">
              <span className="roman text-5xl leading-none shrink-0 pt-1">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="font-display font-bold text-2xl text-ink-700 mb-3">{item.title}</h3>
                <p className="text-taupe-700 text-lg leading-relaxed">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
