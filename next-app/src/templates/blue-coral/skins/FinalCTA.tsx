import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { CheckIcon } from './shared';

type Props = {
  content: SectionContentMap['closing-cta'];
};

export function FinalCTA({ content }: Props) {
  const c = content;
  return (
    <section
      className="py-16 md:py-24"
      style={{
        background:
        'linear-gradient(160deg, #1B3A5C 0%, #2563EB 50%, #1D4ED8 100%)'
      }}>

      <div className="max-w-3xl mx-auto px-6">
        <div
          className="rounded-3xl p-10 md:p-14 text-center"
          style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.15)'
          }}>

          <h2
            className="blue-coral-heading font-black text-3xl md:text-5xl mb-10"
            style={{ color: '#FFFFFF' }}>

            <Node id="closing.headline" role="heading">{c.headline}</Node>
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-10 max-w-lg mx-auto">
            {c.pills.map((pill, idx) =>
            <span
              key={`pill-${idx}`}
              className="blue-coral-heading font-bold text-sm px-4 py-3 rounded-full flex items-center gap-2 justify-center"
              style={{ background: '#F87171', color: '#FFFFFF' }}>

                <CheckIcon className="w-4 h-4 shrink-0" />
                {pill}
              </span>
            )}
          </div>
          <a
            href="#optin"
            className="inline-block blue-coral-heading font-black text-lg px-12 py-5 rounded-full uppercase tracking-wider shadow-xl transition-colors"
            style={{ background: '#FFFFFF', color: '#1D4ED8' }}>

            <Node id="closing.ctaLabel" role="button">{c.ctaLabel}</Node>
          </a>
        </div>
      </div>
    </section>);

}
