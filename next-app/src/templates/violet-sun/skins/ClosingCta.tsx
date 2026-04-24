import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';

type Props = {
  content: SectionContentMap['closing-cta'];
};

export function ClosingCta({ content }: Props) {
  const c = content;
  return (
    <section
      id="final-cta"
      className="relative violet-sun-grad-hero text-white py-24 md:py-32 overflow-hidden"
    >
      <div className="absolute inset-0 violet-sun-dots-bg"></div>
      <div
        className="absolute -top-20 -left-20 w-[32rem] h-[32rem] rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle,#FFC300,transparent 65%)',
          filter: 'blur(40px)',
        }}
      ></div>
      <div
        className="absolute -bottom-20 -right-20 w-[30rem] h-[30rem] rounded-full opacity-40"
        style={{
          background: 'radial-gradient(circle,#C6C1DB,transparent 65%)',
          filter: 'blur(40px)',
        }}
      ></div>

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <span
          className="violet-sun-eyebrow mb-6 inline-block"
          style={{ color: '#FFC300' }}
        >
          <Node id="closing.eyebrow" role="label">{c.eyebrow}</Node>
        </span>
        <h2 className="violet-sun-display font-bold text-5xl md:text-6xl lg:text-7xl leading-[1.03] tracking-[-0.035em] mb-8">
          <Node id="closing.headlineLead" role="heading">{c.headlineLead}</Node>
          <span
            className="violet-sun-italic-serif"
            style={{ color: '#FFD347' }}
          >
            <Node id="closing.headlineAccent" role="heading">{c.headlineAccent}</Node>
          </span>
          <Node id="closing.headlineTrail" role="heading">{c.headlineTrail}</Node>
        </h2>
        <p
          className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
          style={{ color: '#E6E0FD' }}
        >
          <Node id="closing.subheadline" role="heading">{c.subheadline}</Node>
        </p>
        <a
          href="#optin"
          className="violet-sun-btn-sun violet-sun-btn-sun-pulse"
          style={{ fontSize: '1.125rem', padding: '1.25rem 2.5rem' }}
        >
          <Node id="closing.ctaLabel" role="button">{c.ctaLabel}</Node>
          <span aria-hidden="true">→</span>
        </a>
        {c.fineprint ? (
          <p
            className="violet-sun-eyebrow mt-8"
            style={{ color: 'rgba(230,224,253,0.7)' }}
          >
            <Node id="closing.fineprint" role="body">{c.fineprint}</Node>
          </p>
        ) : null}
      </div>
    </section>
  );
}
