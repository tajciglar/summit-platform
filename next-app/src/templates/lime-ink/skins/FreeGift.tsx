import { Node } from '../../shared/Node';
import type { LimeInkContent } from '../../lime-ink.schema';

type Props = {
  content: LimeInkContent['freeGift'];
};

export function FreeGift({ content }: Props) {
  const g = content;
  return (
    <section
      className="text-white py-20 md:py-28"
      style={{ background: '#0A0A0B' }}>

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-5">
          <div
            className="relative aspect-[3/4] max-w-xs mx-auto rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(180deg,#18181B,#0A0A0B)',
              border: '1px solid rgba(196,242,69,0.3)'
            }}>

            <div className="absolute top-0 left-0 right-0 p-6">
              <p
                className="lime-ink-mono text-xs mb-3"
                style={{ color: '#C4F245' }}>

                <Node id="freeGift.cardFilename" role="body">{g.cardFilename}</Node>
              </p>
              <h3 className="font-black text-2xl leading-tight"><Node id="freeGift.cardTitle" role="body">{g.cardTitle}</Node></h3>
            </div>
            <div
              className="absolute inset-x-6 bottom-6 flex flex-col gap-2 lime-ink-mono"
              style={{ fontSize: '0.75rem', color: '#71717A' }}>

              {g.cardFiles.map((file, idx) =>
              <span key={`gift-file-${idx}`}>{file}</span>
              )}
              <div
                className="pt-3 mt-2"
                style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>

                <span style={{ color: '#DCFF6B' }}><Node id="freeGift.cardCommand" role="body">{g.cardCommand}</Node></span>
              </div>
            </div>
            <span
              className="absolute top-4 right-4 lime-ink-mono px-2 py-1 rounded"
              style={{
                fontSize: '0.6rem',
                color: '#0A0A0B',
                background: '#C4F245'
              }}>

              <Node id="freeGift.cardBadge" role="label">{g.cardBadge}</Node>
            </span>
          </div>
        </div>
        <div className="md:col-span-7">
          <p
            className="lime-ink-mono text-xs mb-4"
            style={{ color: '#C4F245' }}>

            <Node id="freeGift.codeEyebrow" role="label">{g.codeEyebrow}</Node>
          </p>
          <h2 className="font-black text-4xl md:text-6xl leading-[1.02] tracking-[-0.03em] mb-6">
            <Node id="freeGift.headline" role="heading">{g.headline}</Node>
          </h2>
          <p
            className="text-lg md:text-xl leading-relaxed mb-8"
            style={{ color: 'rgba(255,255,255,0.7)' }}>

            <Node id="freeGift.body" role="body">{g.body}</Node>
          </p>
          <ul className="space-y-3 mb-8 lime-ink-mono text-sm">
            {g.bullets.map((bullet, idx) =>
            <li key={`gift-bullet-${idx}`} className="flex items-start gap-3">
                <span style={{ color: '#C4F245' }}>✓</span>
                <span style={{ color: 'rgba(255,255,255,0.8)' }}>{bullet}</span>
              </li>
            )}
          </ul>
          <a
            href="#optin"
            className="lime-ink-cta-primary inline-flex items-center gap-3 font-bold px-8 py-4 rounded-full">

            <Node id="freeGift.ctaLabel" role="button">{g.ctaLabel}</Node>
            <span className="lime-ink-mono text-sm">→</span>
          </a>
        </div>
      </div>
    </section>);

}
