import { Node } from '../../shared/Node';
import type { LimeInkContent } from '../../lime-ink.schema';

type Props = {
  content: LimeInkContent['shifts'];
};

export function Shifts({ content }: Props) {
  const s = content;
  return (
    <section
      className="py-20 md:py-28 lime-ink-hairline-b"
      style={{ background: '#F4F4F5' }}>

      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-4">
          <span
            className="lime-ink-mono text-xs"
            style={{ color: '#71717A' }}>

            <Node id="shifts.sectionLabel" role="body">{s.sectionLabel}</Node>
          </span>
          <span
            className="h-[1px] w-12"
            style={{ background: '#E4E4E7' }}>
          </span>
        </div>
        <h2 className="font-black text-4xl md:text-5xl tracking-[-0.03em] mb-14">
          <Node id="shifts.headline" role="heading">{s.headline}</Node>
        </h2>
        <div className="space-y-10">
          {s.items.map((item, idx) => {
            const isLast = idx === s.items.length - 1;
            return (
              <article
                key={`shift-${idx}`}
                className={`grid grid-cols-[auto_1fr] gap-8 items-start ${
                isLast ? '' : 'pb-8 lime-ink-hairline-b'}`
                }>

                <span
                  className="lime-ink-mono font-black text-5xl leading-none"
                  style={{ color: '#AEE02B' }}>

                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-black text-2xl mb-3 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-lg leading-relaxed" style={{ color: '#52525B' }}>
                    {item.description}
                  </p>
                </div>
              </article>);

          })}
        </div>
      </div>
    </section>);

}
