import { Node } from '../../shared/Node';
import type { LimeInkContent } from '../../lime-ink.schema';

type Props = {
  content: LimeInkContent['outcomes'];
};

export function Outcomes({ content }: Props) {
  const o = content;
  return (
    <section
      className="py-20 md:py-28 lime-ink-hairline-b"
      style={{ background: '#F4F4F5' }}>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-4">
          <span
            className="lime-ink-mono text-xs"
            style={{ color: '#71717A' }}>

            <Node id="outcomes.sectionLabel" role="body">{o.sectionLabel}</Node>
          </span>
          <span
            className="h-[1px] w-12"
            style={{ background: '#E4E4E7' }}>
          </span>
        </div>
        <h2 className="font-black text-4xl md:text-6xl leading-[1.02] tracking-[-0.03em] mb-14 max-w-3xl">
          <Node id="outcomes.headlineLead" role="heading">{o.headlineLead}</Node>
          {o.headlineAccent ?
          <>
              {' '}
              <span style={{ color: '#AEE02B' }}><Node id="outcomes.headlineAccent" role="heading">{o.headlineAccent}</Node></span>
              {' '}
            </> :
          null}
          <span style={{ color: '#71717A' }}><Node id="outcomes.headlineTrail" role="heading">{o.headlineTrail}</Node></span>
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {o.items.map((item, idx) =>
          <article
            key={`outcome-${idx}`}
            className="bg-white rounded-2xl p-8"
            style={{ border: '1px solid #E4E4E7' }}>

              <div className="flex items-center justify-between mb-8">
                <span
                className="lime-ink-mono text-xs"
                style={{ color: '#71717A' }}>

                  {String(idx + 1).padStart(2, '0')} /
                </span>
                <span
                className="lime-ink-mono text-xs"
                style={{ color: '#AEE02B' }}>

                  <Node id="outcomes.itemBadge" role="label">{o.itemBadge}</Node>
                </span>
              </div>
              <h3 className="font-black text-xl mb-2 tracking-tight">
                {item.title}
              </h3>
              <p className="leading-relaxed" style={{ color: '#52525B' }}>
                {item.description}
              </p>
            </article>
          )}
        </div>
      </div>
    </section>);

}
