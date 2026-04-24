import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';

type Props = {
  content: SectionContentMap['free-gift'];
};

export function FreeGift({ content }: Props) {
  const g = content;
  return (
    <section className="violet-sun-grad-violet-dark text-white py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 violet-sun-dots-bg opacity-40"></div>
      <div
        className="absolute -top-16 -right-16 w-96 h-96 rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle,#FFC300,transparent 65%)',
          filter: 'blur(40px)',
        }}
      ></div>

      <div className="relative max-w-6xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-5 flex justify-center">
          <div className="relative">
            <div
              className="w-64 h-80 rounded-3xl shadow-2xl p-7 flex flex-col justify-between"
              style={{
                background: '#FFFFFF',
                transform: 'rotate(-3deg)',
              }}
            >
              <div>
                <div className="w-full h-2 rounded-full violet-sun-grad-button mb-4"></div>
                <div className="w-12 h-12 rounded-2xl violet-sun-grad-button mb-4 flex items-center justify-center">
                  <svg
                    className="w-6 h-6"
                    style={{ color: '#23135F' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <p
                  className="violet-sun-display font-bold text-lg leading-tight"
                  style={{ color: '#23135F' }}
                >
                  <Node id="freeGift.cardTitle" role="body">{g.cardTitle}</Node>
                </p>
              </div>
              <div>
                <p className="text-xs" style={{ color: '#7E7399' }}>
                  <Node id="freeGift.cardSubtitle" role="body">{g.cardSubtitle}</Node>
                </p>
              </div>
            </div>
            <div
              className="absolute -top-4 -right-4 violet-sun-display font-bold text-xs px-4 py-2 rounded-full shadow-2xl"
              style={{
                background: '#FFC300',
                color: '#23135F',
                transform: 'rotate(6deg)',
              }}
            >
              <Node id="freeGift.cardBadge" role="label">{g.cardBadge}</Node>
            </div>
          </div>
        </div>
        <div className="md:col-span-7">
          <span
            className="violet-sun-eyebrow mb-4 inline-block"
            style={{ color: '#FFC300' }}
          >
            <Node id="freeGift.eyebrow" role="label">{g.eyebrow}</Node>
          </span>
          <h2
            className="violet-sun-display font-bold text-4xl md:text-5xl leading-tight mb-6 tracking-[-0.03em]"
          >
            <Node id="freeGift.headlineLead" role="heading">{g.headlineLead}</Node>
            <span
              className="violet-sun-italic-serif"
              style={{ color: '#FFD347' }}
            >
              <Node id="freeGift.headlineAccent" role="heading">{g.headlineAccent}</Node>
            </span>
            <Node id="freeGift.headlineTrail" role="heading">{g.headlineTrail}</Node>
          </h2>
          <p
            className="text-lg leading-relaxed mb-7"
            style={{ color: '#E6E0FD' }}
          >
            <Node id="freeGift.body" role="body">{g.body}</Node>
          </p>
          <ul className="space-y-3 mb-8">
            {g.bullets.map((bullet, idx) => (
              <li
                key={`gift-bullet-${idx}`}
                className="flex items-start gap-3"
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: '#FFC300' }}
                >
                  <span
                    className="font-bold"
                    style={{ color: '#23135F' }}
                  >
                    ✓
                  </span>
                </span>
                <span style={{ color: '#E6E0FD' }}>{bullet}</span>
              </li>
            ))}
          </ul>
          <a href="#optin" className="violet-sun-btn-sun">
            <Node id="freeGift.ctaLabel" role="button">{g.ctaLabel}</Node>
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
