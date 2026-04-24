import { Node } from '../../shared/Node';
import type { GreenGoldContent } from '../../green-gold.schema';

type Props = { content: GreenGoldContent };

export function Overview({ content }: Props) {
  const o = content.overview;
  return (
    <section
      id="what-is-this"
      className="bg-white py-16 md:py-24">

      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p
            className="green-gold-heading font-bold text-sm uppercase tracking-wider mb-2"
            style={{ color: '#16A34A' }}>

            <Node id="overview.eyebrow" role="label">{o.eyebrow}</Node>
          </p>
          <h2
            className="green-gold-heading font-black text-3xl md:text-4xl mb-6"
            style={{ color: '#1A2E1A' }}>

            <Node id="overview.headline" role="heading">{o.headline}</Node>
          </h2>
          {o.bodyParagraphs.map((para, idx) =>
          <p
            key={`overview-p-${idx}`}
            className="text-lg leading-relaxed mb-4"
            style={{ color: 'rgba(26,46,26,0.6)' }}>

              {para}
            </p>
          )}
          <a
            href="#optin"
            className="green-gold-heading inline-block text-white font-bold px-8 py-4 rounded-full text-base mt-4"
            style={{ background: '#16A34A' }}>

            <Node id="overview.ctaLabel" role="button">{o.ctaLabel}</Node>
          </a>
        </div>
        <div
          className="rounded-2xl flex items-center justify-center"
          style={{
            background:
            'linear-gradient(to bottom right, #F0FDF4, #FFFFFF, #DCFCE7)',
            border: '1px solid #DCFCE7',
            aspectRatio: '4 / 3'
          }}>

          <div className="text-center p-8">
            <div className="flex justify-center gap-4 mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: '#16A34A' }}>
              </div>
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: '#EAB308' }}>
              </div>
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: '#15803D' }}>
              </div>
            </div>
            <p
              className="green-gold-heading font-bold text-xl mb-1"
              style={{ color: '#1A2E1A' }}>

              <Node id="overview.cardDaysLabel" role="body">{o.cardDaysLabel}</Node>
            </p>
            <p
              className="text-sm"
              style={{ color: 'rgba(26,46,26,0.4)' }}>

              <Node id="overview.cardSubLabel" role="body">{o.cardSubLabel}</Node>
            </p>
          </div>
        </div>
      </div>
    </section>);

}
