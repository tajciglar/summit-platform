import { Node } from '../../shared/Node';
import type { LimeInkContent } from '../../lime-ink.schema';

type Props = {
  content: LimeInkContent['bonuses'];
};

export function Bonuses({ content }: Props) {
  const b = content;
  return (
    <section className="bg-white py-20 md:py-28 lime-ink-hairline-b">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-4">
          <span
            className="lime-ink-mono text-xs"
            style={{ color: '#71717A' }}>

            <Node id="bonuses.sectionLabel" role="body">{b.sectionLabel}</Node>
          </span>
          <span
            className="h-[1px] w-12"
            style={{ background: '#E4E4E7' }}>
          </span>
        </div>
        <h2 className="font-black text-4xl md:text-6xl leading-[1.02] tracking-[-0.03em] mb-4">
          <Node id="bonuses.headlineLead" role="heading">{b.headlineLead}</Node>
          <span style={{ color: '#AEE02B' }}><Node id="bonuses.headlineAccent" role="heading">{b.headlineAccent}</Node></span>
          <Node id="bonuses.headlineTrail" role="heading">{b.headlineTrail}</Node>
        </h2>
        <p className="text-lg mb-14 max-w-2xl" style={{ color: '#52525B' }}>
          <Node id="bonuses.subhead" role="subheading">{b.subhead}</Node>
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {b.items.map((bonus, idx) =>
          <article
            key={`bonus-${idx}`}
            className="text-white rounded-2xl p-8"
            style={{
              background: '#0A0A0B',
              border: '1px solid #27272A'
            }}>

              <div className="flex items-center justify-between mb-6">
                <span
                className="lime-ink-mono text-xs"
                style={{ color: '#71717A' }}>

                  {bonus.filename}
                </span>
                <span
                className="lime-ink-mono px-2 py-1 rounded font-bold"
                style={{
                  fontSize: '0.65rem',
                  background: '#C4F245',
                  color: '#0A0A0B'
                }}>

                  {bonus.valueLabel}
                </span>
              </div>
              <h3 className="font-black text-2xl mb-3 tracking-tight">
                {bonus.title}
              </h3>
              <p
              className="mb-6 leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.6)' }}>

                {bonus.description}
              </p>
              <ul
              className="space-y-2 lime-ink-mono text-xs"
              style={{ color: 'rgba(255,255,255,0.7)' }}>

                {bonus.bullets.map((bullet, bIdx) =>
              <li
                key={`bonus-${idx}-b-${bIdx}`}
                className="flex gap-2">

                    <span style={{ color: '#C4F245' }}>→</span> {bullet}
                  </li>
              )}
              </ul>
            </article>
          )}
        </div>
        <div className="text-center mt-12">
          <a
            href="#optin"
            className="lime-ink-cta-primary inline-flex items-center gap-3 font-bold px-10 py-4 rounded-full text-lg">

            <Node id="bonuses.ctaLabel" role="button">{b.ctaLabel}</Node>
            <span className="lime-ink-mono text-sm">→</span>
          </a>
        </div>
      </div>
    </section>);

}
