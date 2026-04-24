import type { CreamSageContent } from '../../cream-sage.schema';
import { Node } from '../../shared/Node';

type Props = { content: CreamSageContent };

export function ClosingCta({ content }: Props) {
  const c = content.closing;
  return (
    <section
      className="relative py-24 md:py-32 overflow-hidden"
      id="final-cta"
      style={{ background: 'linear-gradient(135deg,#D89878,#C4663D)' }}
    >
      <div
        className="cream-sage-blob"
        style={{
          width: 500,
          height: 500,
          top: -150,
          right: -100,
          background: 'radial-gradient(circle,#FAF7F2,transparent 70%)',
          opacity: 0.25,
        }}
      />
      <div className="max-w-4xl mx-auto px-6 text-center relative">
        <div
          className="inline-flex items-center gap-3 px-5 py-2 mb-8"
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 999,
            backdropFilter: 'blur(4px)',
          }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: '#E8B9A0' }}
          />
          <span
            className="font-bold text-base"
            style={{
              fontFamily: "'Nunito', 'DM Sans', sans-serif",
              color: '#FAF7F2',
            }}
          >
            <Node id="closing.badgeLabel">{c.badgeLabel}</Node>
          </span>
        </div>
        <h2
          className="font-black text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-8 tracking-tight"
          style={{ fontFamily: "'Fraunces', serif", color: '#FAF7F2' }}
        >
          <Node id="closing.headlineLead">{c.headlineLead}</Node>
          <span style={{ fontStyle: 'italic' }}>
            <Node id="closing.headlineAccent">{c.headlineAccent}</Node>
          </span>
          <Node id="closing.headlineTrail">{c.headlineTrail}</Node>
        </h2>
        <p
          className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto leading-relaxed font-medium"
          style={{ color: '#FAF7F2' }}
        >
          <Node id="closing.subheadline">{c.subheadline}</Node>
        </p>
        <a
          href="#optin"
          className="inline-flex items-center gap-3 font-bold text-xl px-12 py-5 shadow-2xl"
          style={{
            background: 'var(--cs-paper, #FAF7F2)',
            color: '#A85430',
            borderRadius: 999,
            transition: 'background 0.2s ease',
          }}
        >
          <Node id="closing.ctaLabel">{c.ctaLabel}</Node>
          <span aria-hidden="true">→</span>
        </a>
        {c.fineprint ? (
          <p
            className="font-semibold text-base mt-8 tracking-wide"
            style={{
              fontFamily: "'Nunito', 'DM Sans', sans-serif",
              color: '#FAF7F2',
            }}
          >
            <Node id="closing.fineprint">{c.fineprint}</Node>
          </p>
        ) : null}
      </div>
    </section>
  );
}
