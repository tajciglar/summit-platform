import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { Icon, INK, LAV } from './shared';

type Props = { content: SectionContentMap['bonuses'] };

export function Bonuses({ content }: Props) {
  const b = content;
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-5 md:px-8 text-center">
        <p className="indigo-gold-eyebrow-head mb-2"><Node id="bonuses.eyebrow" role="label">{b.eyebrow}</Node></p>
        <h2 className="indigo-gold-h2-head mb-12"><Node id="bonuses.headline" role="heading">{b.headline}</Node></h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {b.items.map((bonus, idx) => (
            <article
              key={`bonus-${idx}`}
              className="rounded-2xl p-6 flex flex-col gap-3"
              style={{ background: LAV.c50, border: `1px solid ${LAV.c200}` }}
            >
              <span
                className="self-start text-xs font-bold rounded-full px-3 py-1"
                style={{ background: '#fff', color: LAV.c700, border: `1px solid ${LAV.c200}` }}
              >
                {bonus.valueLabel}
              </span>
              <h3 className="font-bold text-lg" style={{ color: INK.c900 }}>
                {bonus.title}
              </h3>
              <p className="text-sm" style={{ color: INK.c700 }}>
                {bonus.description}
              </p>
              <ul className="space-y-2 text-sm" style={{ color: INK.c800 }}>
                {bonus.bullets.map((bullet, bIdx) => (
                  <li key={`bonus-${idx}-b-${bIdx}`} className="flex items-start gap-2">
                    <span
                      className="w-5 h-5 rounded-full grid place-items-center flex-shrink-0 mt-0.5"
                      style={{ background: '#DCFCE7', color: '#16A34A' }}
                    >
                      <Icon id="check" className="w-3 h-3" />
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <a href="#optin" className="indigo-gold-btn-cta mt-12">
          <Node id="bonuses.ctaLabel" role="button">{b.ctaLabel}</Node>
          <span className="indigo-gold-btn-arrow">
            <Icon id="arrow-right" className="w-3.5 h-3.5" />
          </span>
        </a>
      </div>
    </section>
  );
}
