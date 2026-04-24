import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { CheckIcon } from './shared';

type Props = {
  content: SectionContentMap['bonuses'];
};

export function Bonuses({ content }: Props) {
  const b = content;
  return (
    <section
      className="py-16 md:py-24"
      style={{
        background: 'linear-gradient(135deg, #F0F7FF 0%, #DBEAFE 100%)'
      }}>

      <div className="max-w-5xl mx-auto px-6 text-center">
        <p
          className="blue-coral-heading font-bold text-sm uppercase tracking-wider mb-2"
          style={{ color: '#F87171' }}>

          <Node id="bonuses.eyebrow" role="label">{b.eyebrow}</Node>
        </p>
        <h2
          className="blue-coral-heading font-black text-3xl md:text-4xl mb-12"
          style={{ color: '#1E293B' }}>

          <Node id="bonuses.headline" role="heading">{b.headline}</Node>
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {b.items.map((bonus, idx) =>
          <article
            key={`bonus-${idx}`}
            className="rounded-xl p-6 text-left"
            style={{
              background: '#FFFFFF',
              border: '1px solid #BFDBFE',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}>

              {bonus.thumbnail?.url ?
            <img
              src={bonus.thumbnail.url}
              alt={bonus.thumbnail.alt ?? bonus.title}
              width={bonus.thumbnail.width ?? undefined}
              height={bonus.thumbnail.height ?? undefined}
              className="w-full aspect-video rounded-lg object-cover mb-4"
              data-testid={`blue-coral-bonus-thumbnail-${idx}`} /> :

            null}
              <span
              className="inline-block text-white blue-coral-heading font-bold text-xs px-4 py-1.5 rounded-full mb-4"
              style={{ background: '#F87171' }}>

                {bonus.valueLabel}
              </span>
              <h3
              className="blue-coral-heading font-bold text-xl mb-3"
              style={{ color: '#1E293B' }}>

                {bonus.title}
              </h3>
              <p className="mb-4" style={{ color: '#4B5563' }}>
                {bonus.description}
              </p>
              <ul className="space-y-2">
                {bonus.bullets.map((bullet, bIdx) =>
              <li
                key={`bonus-${idx}-b-${bIdx}`}
                className="flex items-center gap-2"
                style={{ color: '#374151' }}>

                    <span style={{ color: '#2563EB' }}>
                      <CheckIcon className="w-5 h-5 shrink-0" />
                    </span>
                    {bullet}
                  </li>
              )}
              </ul>
            </article>
          )}
        </div>
        <a
          href="#optin"
          className="inline-block mt-10 text-white blue-coral-heading font-bold px-10 py-4 rounded-full transition-colors text-lg"
          style={{ background: '#2563EB' }}>

          <Node id="bonuses.ctaLabel" role="button">{b.ctaLabel}</Node>
        </a>
      </div>
    </section>);

}
