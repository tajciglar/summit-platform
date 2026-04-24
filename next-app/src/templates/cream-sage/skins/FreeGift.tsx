import type { CreamSageContent } from '../../cream-sage.schema';
import { Node } from '../../shared/Node';

type Props = { content: CreamSageContent };

export function FreeGift({ content }: Props) {
  const g = content.freeGift;
  return (
    <section
      className="relative py-20 md:py-28 overflow-hidden"
      style={{ background: 'var(--cs-paper, #FAF7F2)' }}
    >
      <div
        className="cream-sage-blob cream-sage-blob-sage"
        style={{ width: 500, height: 500, top: -150, right: -100 }}
      />
      <div className="relative max-w-6xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-5 flex justify-center">
          <div className="relative">
            <div
              className="absolute rounded-full"
              style={{
                inset: '-2rem',
                background: '#E8B9A0',
                opacity: 0.3,
                filter: 'blur(32px)',
              }}
            />
            <div
              className="relative w-60 h-80 overflow-hidden"
              style={{
                borderRadius: '2rem',
                background: 'linear-gradient(160deg,#FAF7F2,#F4EDE2)',
                border: '4px solid #F4EDE2',
                boxShadow: '0 30px 60px -20px rgba(74,107,93,0.35)',
                transform: 'rotate(-3deg)',
              }}
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-3"
                style={{ background: '#4A6B5D' }}
              />
              <div className="p-8 pl-10 h-full flex flex-col justify-between">
                <div>
                  <p
                    className="cream-sage-eyebrow mb-3"
                    style={{ color: '#4A6B5D' }}
                  >
                    <Node id="freeGift.cardEyebrow">{g.cardEyebrow}</Node>
                  </p>
                  <div
                    className="w-10 mb-5"
                    style={{ height: 2, background: '#DEA389' }}
                  />
                  <h3
                    className="font-black text-2xl leading-tight"
                    style={{ fontFamily: "'Fraunces', serif", color: '#2A2419' }}
                  >
                    <Node id="freeGift.cardTitle">{g.cardTitle}</Node>
                  </h3>
                </div>
                <div>
                  <p
                    className="text-sm"
                    style={{
                      fontFamily: "'Fraunces', serif",
                      fontStyle: 'italic',
                      color: '#8A7E6C',
                    }}
                  >
                    <Node id="freeGift.cardEnclosure">{g.cardEnclosure}</Node>
                  </p>
                  <p className="cream-sage-eyebrow mt-2" style={{ color: '#8A7E6C' }}>
                    <Node id="freeGift.cardVolume">{g.cardVolume}</Node>
                  </p>
                </div>
              </div>
            </div>
            <div
              className="absolute -top-3 -right-3 font-bold text-xs px-4 py-2 shadow-lg"
              style={{
                background: '#A85430',
                color: '#FAF7F2',
                fontFamily: "'Nunito', 'DM Sans', sans-serif",
                borderRadius: 999,
                transform: 'rotate(6deg)',
              }}
            >
              <Node id="freeGift.cardBadge">{g.cardBadge}</Node>
            </div>
          </div>
        </div>

        <div className="md:col-span-7">
          <span
            className="cream-sage-eyebrow mb-3 inline-block"
            style={{ color: '#A85430' }}
          >
            <Node id="freeGift.eyebrow">{g.eyebrow}</Node>
          </span>
          <h2
            className="font-black text-4xl md:text-5xl leading-tight mb-6"
            style={{ fontFamily: "'Fraunces', serif", color: '#2A2419' }}
          >
            <Node id="freeGift.headlineLead">{g.headlineLead}</Node>
            <span className="cream-sage-hand-under">
              <Node id="freeGift.headlineAccent">{g.headlineAccent}</Node>
            </span>
            <Node id="freeGift.headlineTrail">{g.headlineTrail}</Node>
          </h2>
          <p
            className="text-xl md:text-2xl leading-relaxed mb-8"
            style={{ color: '#3A3221' }}
          >
            <Node id="freeGift.body">{g.body}</Node>
          </p>
          <ul className="space-y-4 mb-10">
            {g.bullets.map((bullet, idx) => (
              <li
                key={`gift-bullet-${idx}`}
                className="flex items-start gap-3 text-lg"
                style={{ color: '#3A3221' }}
              >
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: '#E9EEEA' }}
                >
                  <span style={{ color: '#3D5A4E', fontWeight: 700 }}>✓</span>
                </span>
                <span>
                  <Node id={`freeGift.bullets.${idx}`}>{bullet}</Node>
                </span>
              </li>
            ))}
          </ul>
          <a href="#optin" className="cream-sage-btn-primary">
            <Node id="freeGift.ctaLabel">{g.ctaLabel}</Node>
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
