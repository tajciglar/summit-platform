import { Node } from '../../shared/Node';
import type { LimeInkContent } from '../../lime-ink.schema';

type Props = {
  content: LimeInkContent['closing'];
};

export function ClosingCta({ content }: Props) {
  const c = content;
  return (
    <section
      className="relative text-white py-24 md:py-32 overflow-hidden"
      id="final-cta"
      style={{ background: '#0A0A0B' }}>

      <div className="absolute inset-0 lime-ink-grid-bg"></div>
      <div className="absolute inset-0 lime-ink-noise"></div>
      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <p
          className="lime-ink-mono text-xs mb-6"
          style={{ color: '#C4F245' }}>

          <Node id="closing.eyebrow" role="label">{c.eyebrow}</Node>
        </p>
        <h2 className="font-black text-5xl md:text-7xl lg:text-8xl leading-[0.98] tracking-[-0.04em] mb-8">
          <Node id="closing.headline" role="heading">{c.headline}</Node>
        </h2>
        <p
          className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.7)' }}>

          <Node id="closing.subheadline" role="heading">{c.subheadline}</Node>
        </p>
        <a
          href="#optin"
          className="lime-ink-cta-primary inline-flex items-center gap-3 font-bold px-10 py-5 rounded-full text-lg">

          <Node id="closing.ctaLabel" role="button">{c.ctaLabel}</Node>
          <span className="lime-ink-mono">→</span>
        </a>
        {c.fineprint ?
        <p
          className="lime-ink-mono text-xs mt-8"
          style={{ color: '#71717A' }}>

            <Node id="closing.fineprint" role="body">{c.fineprint}</Node>
          </p> :
        null}
      </div>
    </section>);

}
