import { Node } from '../../shared/Node';
import type { LimeInkContent } from '../../lime-ink.schema';
import { SALES_INK } from './shared';

type Props = {
  content: NonNullable<LimeInkContent['guarantee']>;
};

export function Guarantee({ content }: Props) {
  const g = content;
  return (
    <section className="bg-white py-20 md:py-24 lime-ink-hairline-b">
      <div className="max-w-3xl mx-auto px-6">
        <div
          className="rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-start gap-6"
          style={{
            background: SALES_INK.INK900,
            border: `2px dashed ${SALES_INK.LIME}`
          }}>

          <div
            className="flex items-center justify-center rounded-2xl shrink-0"
            style={{
              width: 72,
              height: 72,
              background: 'rgba(196,242,69,0.12)',
              border: '1px solid rgba(196,242,69,0.35)'
            }}>

            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke={SALES_INK.LIME}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">

              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <p
              className="lime-ink-mono mb-2"
              style={{
                fontSize: '0.7rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: SALES_INK.LIME,
                fontWeight: 700
              }}>

              <Node id="guarantee.days" role="body">{g.days}</Node>-DAY.GUARANTEE
            </p>
            <h3
              className="font-black text-xl md:text-2xl mb-3 tracking-tight"
              style={{ color: '#FFFFFF' }}>

              <Node id="guarantee.heading" role="heading">{g.heading}</Node>
            </h3>
            <p
              className="leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem' }}>

              <Node id="guarantee.body" role="body">{g.body}</Node>
            </p>
          </div>
        </div>
      </div>
    </section>);

}
