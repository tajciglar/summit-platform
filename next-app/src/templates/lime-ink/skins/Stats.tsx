import { Node } from '../../shared/Node';
import type { LimeInkContent } from '../../lime-ink.schema';

type Props = {
  content: LimeInkContent['stats'];
};

export function Stats({ content }: Props) {
  return (
    <section className="bg-white py-16 md:py-20 lime-ink-hairline-b">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-12">
          <span
            className="lime-ink-mono text-xs"
            style={{ color: '#71717A' }}>

            <Node id="stats.sectionLabel" role="body">{content.sectionLabel}</Node>
          </span>
          <span
            className="h-[1px] w-16"
            style={{ background: '#E4E4E7' }}>
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3">
          {content.items.map((item, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === content.items.length - 1;
            const boundaryClass = isFirst ?
            'py-4 md:py-0 md:pr-10 md:border-r' :
            isLast ?
            'py-4 md:py-0 md:pl-10' :
            'py-4 md:py-0 md:px-10 md:border-r';
            return (
              <div
                key={`stat-${idx}`}
                className={boundaryClass}
                style={{
                  borderColor:
                  !isLast && idx !== content.items.length - 1 ?
                  '#E4E4E7' :
                  undefined
                }}>

                <p
                  className="lime-ink-mono text-xs mb-3"
                  style={{ color: '#71717A' }}>

                  {item.label}
                </p>
                <p className="font-black text-8xl md:text-9xl leading-none tracking-[-0.05em]">
                  {item.value}
                  {item.suffix ?
                  <span
                    className="text-7xl"
                    style={{
                      color: idx === 1 ? '#AEE02B' : '#71717A'
                    }}>

                      {item.suffix}
                    </span> :
                  null}
                </p>
                <p className="mt-3 text-lg" style={{ color: '#52525B' }}>
                  {item.description}
                </p>
              </div>);

          })}
        </div>
      </div>
    </section>);

}
