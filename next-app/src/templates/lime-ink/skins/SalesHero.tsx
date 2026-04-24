import { Node } from '../../shared/Node';
import { TrackedCheckoutLink } from '@/lib/analytics/TrackedCheckoutLink';
import { resolveCheckoutHref } from '../../lib/checkout-href';
import type { LimeInkContent } from '../../lime-ink.schema';
import {
  SALES_INK,
  SalesArrowRight,
  type TemplateContext,
} from './shared';

type Props = {
  content: NonNullable<LimeInkContent['salesHero']>;
  context: TemplateContext;
};

export function SalesHero({ content, context }: Props) {
  const h = content;
  const topName = context.topBarName;
  return (
    <section
      className="relative text-white overflow-hidden py-20 md:py-28"
      style={{ background: SALES_INK.INK900 }}>

      <div className="absolute inset-0 lime-ink-grid-bg"></div>
      <div className="absolute inset-0 lime-ink-noise"></div>
      <div className="relative max-w-5xl mx-auto px-6 text-center">
        {h.badge && (
          <span
            className="lime-ink-mono inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{
              fontSize: '0.7rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: SALES_INK.INK900,
              background: SALES_INK.LIME,
              fontWeight: 700
            }}>

            <span
              className="lime-ink-sales-live-dot"
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: SALES_INK.INK900,
                display: 'inline-block'
              }} />

            <Node id="salesHero.badge" role="label">{h.badge}</Node>
          </span>
        )}

        <h1 className="font-black text-4xl md:text-6xl lg:text-7xl leading-[0.98] tracking-[-0.04em] mb-6">
          <Node id="salesHero.headline" role="heading">{h.headline}</Node>
        </h1>

        <p
          className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-12"
          style={{ color: 'rgba(255,255,255,0.7)' }}>

          <Node id="salesHero.subheadline" role="heading">{h.subheadline}</Node>
        </p>

        <div
          className="max-w-xl mx-auto mb-10 rounded-2xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${SALES_INK.INK800}, ${SALES_INK.INK700})`,
            border: '1px solid rgba(196,242,69,0.25)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.4)'
          }}>

          <div
            className="flex items-center gap-2 px-5 py-3 lime-ink-mono"
            style={{
              fontSize: '0.7rem',
              color: SALES_INK.INK400,
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(0,0,0,0.25)'
            }}>

            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#EF4444'
              }} />

            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#F5CB47'
              }} />

            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: SALES_INK.LIME
              }} />

            <span className="ml-3">{topName.toLowerCase().replace(/\s+/g, '-')}.pkg</span>
          </div>
          <div className="p-10 text-center">
            <p
              className="lime-ink-mono mb-3"
              style={{
                fontSize: '0.65rem',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: SALES_INK.LIME_SOFT
              }}>

              FULL.ACCESS
            </p>
            <p
              className="font-black leading-none tracking-[-0.04em]"
              style={{ fontSize: 'clamp(2rem,5vw,3.5rem)' }}>

              <Node id="salesHero.productLabel" role="body">{h.productLabel}</Node>
            </p>
            <p
              className="lime-ink-mono mt-3"
              style={{
                fontSize: '0.7rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: SALES_INK.INK400
              }}>

              {topName}
            </p>
          </div>
        </div>

        <p
          className="lime-ink-mono mb-5"
          style={{ fontSize: '0.8rem', color: SALES_INK.INK400 }}>

          Total value:{' '}
          <span style={{ color: SALES_INK.INK300, textDecoration: 'line-through' }}>
            <Node id="salesHero.totalValue" role="body">{h.totalValue}</Node>
          </span>
        </p>

        <TrackedCheckoutLink
          href={resolveCheckoutHref(context.wpCheckoutRedirectUrl)}
          id="purchase"
          className="lime-ink-cta-primary lime-ink-sales-pulse inline-flex items-center gap-3 font-bold px-10 py-5 rounded-full text-lg">

          <Node id="salesHero.ctaLabel" role="button">{h.ctaLabel}</Node>
          <SalesArrowRight size={20} />
        </TrackedCheckoutLink>

        <p
          className="lime-ink-mono mt-6"
          style={{ fontSize: '0.8rem', color: SALES_INK.LIME_SOFT }}>

          <Node id="salesHero.ctaNote" role="body">{h.ctaNote}</Node>
        </p>
      </div>
    </section>);

}
