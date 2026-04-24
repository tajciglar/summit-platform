import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';

type Props = {
  content: SectionContentMap['overview'];
};

export function Overview({ content }: Props) {
  const o = content;
  return (
    <section id="what-is-this" className="bg-white py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-7">
          <span
            className="violet-sun-eyebrow mb-3 inline-block"
            style={{ color: '#6F4EE6' }}
          >
            <Node id="overview.eyebrow" role="label">{o.eyebrow}</Node>
          </span>
          <h2
            className="violet-sun-display font-bold text-4xl md:text-6xl leading-[1.02] tracking-[-0.03em] mb-7"
            style={{ color: '#110833' }}
          >
            <Node id="overview.headlineLead" role="heading">{o.headlineLead}</Node>
            <span className="violet-sun-hl-sun"><Node id="overview.headlineHighlight" role="heading">{o.headlineHighlight}</Node></span>
            <Node id="overview.headlineMid" role="heading">{o.headlineMid}</Node>
            <span
              className="violet-sun-italic-serif"
              style={{ color: '#6F4EE6' }}
            >
              <Node id="overview.headlineAccent" role="heading">{o.headlineAccent}</Node>
            </span>
            <Node id="overview.headlineTrail" role="heading">{o.headlineTrail}</Node>
          </h2>
          {o.bodyParagraphs.map((para, idx) => {
            const isLast = idx === o.bodyParagraphs.length - 1;
            return (
              <p
                key={`overview-p-${idx}`}
                className={`text-lg md:text-xl leading-[1.65] ${isLast ? 'mb-9' : 'mb-5'}`}
                style={{ color: '#544B75' }}
              >
                {para}
              </p>
            );
          })}
          <a href="#optin" className="violet-sun-btn-sun">
            <Node id="overview.ctaLabel" role="button">{o.ctaLabel}</Node>
            <span aria-hidden="true">→</span>
          </a>
        </div>
        <div className="md:col-span-5">
          <div className="violet-sun-card-mist p-8">
            <p
              className="violet-sun-eyebrow mb-6"
              style={{ color: '#2A1869' }}
            >
              <Node id="overview.cardEyebrow" role="label">{o.cardEyebrow}</Node>
            </p>
            <div className="space-y-5">
              {o.components.map((comp, idx) => {
                const iconBg = idx % 2 === 0 ? '#2A1869' : '#FFC300';
                return (
                  <div key={`overview-comp-${idx}`} className="flex gap-4">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: iconBg }}
                    >
                      <span
                        className="violet-sun-display font-bold text-base"
                        style={{ color: idx % 2 === 0 ? '#FFC300' : '#110833' }}
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div>
                      <p
                        className="violet-sun-display font-bold text-lg"
                        style={{ color: '#110833' }}
                      >
                        {comp.title}
                      </p>
                      <p
                        className="text-sm mt-1"
                        style={{ color: '#544B75' }}
                      >
                        {comp.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
