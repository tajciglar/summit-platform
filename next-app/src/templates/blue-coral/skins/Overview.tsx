import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';

type Props = {
  content: SectionContentMap['overview'];
};

export function Overview({ content }: Props) {
  const o = content;
  const feature = o.featureImage;
  return (
    <section id="what-is-this" className="bg-white py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        {feature?.url ?
        <img
          src={feature.url}
          alt={feature.alt ?? o.headline}
          width={feature.width ?? undefined}
          height={feature.height ?? undefined}
          className="rounded-2xl aspect-[4/3] object-cover shadow-lg w-full"
          data-testid="blue-coral-overview-feature" /> :


        <div
          className="rounded-2xl aspect-[4/3] flex items-center justify-center"
          style={{
            background:
            'linear-gradient(135deg, #F0F7FF 0%, #FFFFFF 50%, #DBEAFE 100%)',
            border: '1px solid #DBEAFE'
          }}>

          <div className="text-center p-8">
            <div className="flex justify-center gap-4 mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: '#2563EB' }}>

                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true">

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />

                </svg>
              </div>
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: '#F87171' }}>

                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true">

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />

                </svg>
              </div>
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: '#1D4ED8' }}>

                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true">

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />

                </svg>
              </div>
            </div>
            <p
              className="blue-coral-heading font-bold text-xl mb-1"
              style={{ color: '#1E293B' }}>

              <Node id="overview.illustrationCaption" role="label">{o.illustrationCaption}</Node>
            </p>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              <Node id="overview.illustrationSubcaption" role="label">{o.illustrationSubcaption}</Node>
            </p>
          </div>
        </div>
        }
        {/* Text on RIGHT */}
        <div>
          <p
            className="blue-coral-heading font-bold text-sm uppercase tracking-wider mb-2"
            style={{ color: '#2563EB' }}>

            <Node id="overview.eyebrow" role="label">{o.eyebrow}</Node>
          </p>
          <h2
            className="blue-coral-heading font-black text-3xl md:text-4xl mb-6"
            style={{ color: '#1E293B' }}>

            <Node id="overview.headline" role="heading">{o.headline}</Node>
          </h2>
          {o.bodyParagraphs.map((para, idx) =>
          <p
            key={`overview-p-${idx}`}
            className="text-lg leading-relaxed mb-4"
            style={{ color: '#4B5563' }}>

              {para}
            </p>
          )}
          <a
            href="#optin"
            className="inline-block text-white blue-coral-heading font-bold px-8 py-4 rounded-full transition-colors text-base mt-4"
            style={{ background: '#2563EB' }}>

            <Node id="overview.ctaLabel" role="button">{o.ctaLabel}</Node>
          </a>
        </div>
      </div>
    </section>);

}
