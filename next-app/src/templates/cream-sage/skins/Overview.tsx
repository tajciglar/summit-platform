import type { CreamSageContent } from '../../cream-sage.schema';
import { Node } from '../../shared/Node';

type Props = { content: CreamSageContent };

export function Overview({ content }: Props) {
  const o = content.overview;
  return (
    <section
      id="what-is-this"
      className="py-20 md:py-28 relative overflow-hidden"
      style={{ background: 'var(--cs-paper-alt, #F4EDE2)' }}
    >
      <div
        className="cream-sage-blob cream-sage-blob-rose"
        style={{ width: 400, height: 400, top: '10%', right: -150, opacity: 0.3 }}
      />
      <div className="relative max-w-6xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-7">
          <span
            className="cream-sage-eyebrow mb-4 inline-block"
            style={{ color: '#A85430' }}
          >
            <Node id="overview.eyebrow">{o.eyebrow}</Node>
          </span>
          <h2
            className="font-black text-4xl md:text-5xl leading-tight mb-8"
            style={{ fontFamily: "'Fraunces', serif", color: '#2A2419' }}
          >
            <Node id="overview.headlineLead">{o.headlineLead}</Node>
            <span className="cream-sage-hand-under" style={{ color: '#4A6B5D' }}>
              <Node id="overview.headlineAccent">{o.headlineAccent}</Node>
            </span>
            <Node id="overview.headlineTrail">{o.headlineTrail}</Node>
          </h2>
          {o.bodyParagraphs.map((para, idx) => (
            <p
              key={`overview-p-${idx}`}
              className={`text-xl md:text-2xl leading-[1.7] mb-6 ${
                idx === 0 ? 'cream-sage-dropcap' : ''
              }`}
              style={{ color: '#3A3221' }}
            >
              <Node id={`overview.bodyParagraphs.${idx}`}>{para}</Node>
            </p>
          ))}
          <a href="#optin" className="cream-sage-btn-primary">
            <Node id="overview.ctaLabel">{o.ctaLabel}</Node>
            <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="md:col-span-5">
          <div className="relative h-96 md:h-[26rem]">
            <div
              className="absolute top-0 left-8 w-32 h-32 rounded-full flex items-center justify-center shadow-xl"
              style={{ background: '#DEA389' }}
            >
              <svg
                className="w-14 h-14"
                style={{ color: '#FAF7F2' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <div
              className="absolute top-20 right-6 w-40 h-40 rounded-full flex items-center justify-center shadow-xl"
              style={{ background: '#4A6B5D' }}
            >
              <svg
                className="w-16 h-16"
                style={{ color: '#FAF7F2' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div
              className="absolute bottom-4 left-20 w-36 h-36 rounded-full flex items-center justify-center shadow-xl"
              style={{ background: '#A85430' }}
            >
              <svg
                className="w-14 h-14"
                style={{ color: '#FAF7F2' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <p
              className="absolute bottom-0 right-0 text-sm max-w-[10rem] text-right"
              style={{
                fontFamily: "'Fraunces', serif",
                fontStyle: 'italic',
                color: '#3D5A4E',
              }}
            >
              <Node id="overview.imageCaption">{o.imageCaption}</Node>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
