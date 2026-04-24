import { Node } from '../../shared/Node';
import type { LimeInkContent } from '../../lime-ink.schema';

type Props = {
  content: LimeInkContent['overview'];
};

export function Overview({ content }: Props) {
  const o = content;
  return (
    <section
      id="what-is-this"
      className="py-20 md:py-28 lime-ink-hairline-b"
      style={{ background: '#F4F4F5' }}>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-12">
          <span
            className="lime-ink-mono text-xs"
            style={{ color: '#71717A' }}>

            <Node id="overview.sectionLabel" role="body">{o.sectionLabel}</Node>
          </span>
          <span
            className="h-[1px] w-16"
            style={{ background: '#E4E4E7' }}>
          </span>
        </div>
        <div className="grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7">
            <h2 className="font-black text-4xl md:text-6xl leading-[1.02] tracking-[-0.03em] mb-8">
              <Node id="overview.headlineLead" role="heading">{o.headlineLead}</Node>
              <span style={{ color: '#71717A' }}><Node id="overview.headlineAccent" role="heading">{o.headlineAccent}</Node></span>
              <Node id="overview.headlineTrail" role="heading">{o.headlineTrail}</Node>
            </h2>
            {o.bodyParagraphs.map((para, idx) =>
            <p
              key={`overview-p-${idx}`}
              className="text-lg md:text-xl leading-relaxed mb-5"
              style={{ color: '#52525B' }}>

                {para}
              </p>
            )}
            <a
              href="#optin"
              className="lime-ink-cta-primary inline-flex items-center gap-3 font-bold px-7 py-3.5 rounded-full mt-3">

              <Node id="overview.ctaLabel" role="button">{o.ctaLabel}</Node>
              <span className="lime-ink-mono text-sm">→</span>
            </a>
          </div>
          <div className="md:col-span-5">
            <div
              className="bg-white rounded-2xl p-8 shadow-sm"
              style={{ border: '1px solid #E4E4E7' }}>

              <p
                className="lime-ink-mono text-xs mb-6"
                style={{ color: '#71717A' }}>

                <Node id="overview.systemCardLabel" role="body">{o.systemCardLabel}</Node>
              </p>
              <div className="space-y-5">
                {o.components.map((comp, idx) =>
                <div key={`overview-comp-${idx}`} className="flex gap-4">
                    <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: '#0A0A0B' }}>

                      <span
                      className="lime-ink-mono font-bold"
                      style={{ color: '#C4F245', fontSize: '0.95rem' }}>

                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold">{comp.title}</p>
                      <p className="text-sm mt-1" style={{ color: '#52525B' }}>
                        {comp.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>);

}
