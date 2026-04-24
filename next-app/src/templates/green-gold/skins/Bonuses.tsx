import { Node } from '../../shared/Node';
import type { GreenGoldContent } from '../../green-gold.schema';

type Props = { content: GreenGoldContent };

export function Bonuses({ content }: Props) {
  const b = content.bonuses;
  return (
    <section
      className="py-16 md:py-24"
      style={{
        background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)'
      }}>

      <div className="max-w-4xl mx-auto px-6">
        <p
          className="green-gold-heading font-bold text-sm uppercase tracking-wider mb-2 text-center"
          style={{ color: '#CA8A04' }}>

          <Node id="bonuses.eyebrow" role="label">{b.eyebrow}</Node>
        </p>
        <h2
          className="green-gold-heading font-black text-3xl md:text-4xl mb-14 text-center"
          style={{ color: '#1A2E1A' }}>

          <Node id="bonuses.headline" role="heading">{b.headline}</Node>
        </h2>
        <div className="space-y-8">
          {b.items.map((bonus, idx) =>
          <article
            key={`bonus-${idx}`}
            className="flex gap-6 md:gap-8 items-start bg-white rounded-2xl p-6 md:p-8 shadow-sm"
            style={{ border: '1px solid #DCFCE7' }}>

              <span
              className="green-gold-heading font-black text-6xl md:text-7xl leading-none shrink-0 select-none"
              style={{ color: 'rgba(22,163,74,0.15)' }}>

                {String(idx + 1).padStart(2, '0')}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <h3
                  className="green-gold-heading font-bold text-xl"
                  style={{ color: '#1A2E1A' }}>

                    {bonus.title}
                  </h3>
                  <span
                  className="green-gold-heading inline-block text-white font-bold text-xs px-3 py-1 rounded-full shrink-0"
                  style={{ background: '#EAB308' }}>

                    {bonus.valueLabel}
                  </span>
                </div>
                <p className="mb-4" style={{ color: 'rgba(26,46,26,0.6)' }}>
                  {bonus.description}
                </p>
                <ul className="space-y-2">
                  {bonus.bullets.map((bullet, bIdx) =>
                <li
                  key={`bonus-${idx}-b-${bIdx}`}
                  className="flex items-center gap-2"
                  style={{ color: 'rgba(26,46,26,0.7)' }}>

                      <svg
                    className="w-5 h-5 shrink-0"
                    style={{ color: '#16A34A' }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true">

                        <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd" />

                      </svg>
                      {bullet}
                    </li>
                )}
                </ul>
              </div>
            </article>
          )}
        </div>
        <div className="text-center mt-12">
          <a
            href="#optin"
            className="green-gold-heading inline-block text-white font-bold px-10 py-4 rounded-full text-lg"
            style={{ background: '#16A34A' }}>

            <Node id="bonuses.ctaLabel" role="button">{b.ctaLabel}</Node>
          </a>
        </div>
      </div>
    </section>);

}
