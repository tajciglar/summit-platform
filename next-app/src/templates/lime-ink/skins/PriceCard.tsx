import { Node } from '../../shared/Node';
import { TrackedCheckoutLink } from '@/lib/analytics/TrackedCheckoutLink';
import { TrackedDeclineLink } from '@/lib/analytics/TrackedDeclineLink';
import { resolveCheckoutHref } from '../../lib/checkout-href';
import type { LimeInkContent } from '../../lime-ink.schema';
import {
  SALES_INK,
  SalesArrowRight,
  SalesCheckIcon,
  SalesGiftIcon,
  type TemplateContext,
} from './shared';

type Props = {
  content: NonNullable<LimeInkContent['priceCard']>;
  context: TemplateContext;
};

export function PriceCard({ content, context }: Props) {
  const p = content;
  const wpCheckoutRedirectUrl = context.wpCheckoutRedirectUrl;
  const wpThankyouRedirectUrl = context.wpThankyouRedirectUrl;
  return (
    <section
      id="purchase"
      className="py-20 md:py-28 lime-ink-hairline-b"
      style={{ background: SALES_INK.INK900 }}>

      <div className="max-w-2xl mx-auto px-6">
        <div
          className="relative text-white rounded-2xl overflow-hidden"
          style={{
            background: `linear-gradient(180deg, ${SALES_INK.INK800}, ${SALES_INK.INK900})`,
            border: '1px solid rgba(196,242,69,0.3)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.4)'
          }}>

          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: 4,
              background: `linear-gradient(90deg, ${SALES_INK.LIME}, ${SALES_INK.LIME_SOFT}, ${SALES_INK.LIME})`
            }} />


          <div className="p-8 md:p-10">
            <span
              className="lime-ink-mono inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5"
              style={{
                fontSize: '0.65rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: SALES_INK.INK900,
                background: SALES_INK.LIME,
                fontWeight: 700
              }}>

              <Node id="priceCard.badge" role="label">{p.badge}</Node>
            </span>

            <h3 className="font-black text-2xl md:text-3xl leading-tight tracking-[-0.02em] mb-2">
              <Node id="priceCard.headline" role="heading">{p.headline}</Node>
            </h3>
            <p
              className="lime-ink-mono mb-6"
              style={{ fontSize: '0.8rem', color: SALES_INK.INK400 }}>

              <Node id="priceCard.note" role="body">{p.note}</Node>
            </p>

            <ul className="space-y-2.5 mb-6">
              {p.features.map((f, i) =>
              <li
                key={`pc-feat-${i}`}
                className="flex gap-3 items-start text-sm leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.85)' }}>

                  <SalesCheckIcon color={SALES_INK.LIME} />
                  <span>{f}</span>
                </li>
              )}
            </ul>

            <div
              className="rounded-xl p-5 mb-6"
              style={{
                background: 'rgba(196,242,69,0.06)',
                border: '1px solid rgba(196,242,69,0.18)'
              }}>

              <p
                className="lime-ink-mono flex items-center gap-2 mb-3"
                style={{
                  fontSize: '0.72rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: SALES_INK.LIME_SOFT,
                  fontWeight: 700
                }}>

                <SalesGiftIcon size={14} color={SALES_INK.LIME_SOFT} />
                <Node id="priceCard.giftsBoxTitle" role="body">{p.giftsBoxTitle}</Node>
              </p>
              {p.giftItems.map((g, i) =>
              <div
                key={`pc-gift-${i}`}
                className="flex gap-2.5 items-start text-sm py-1"
                style={{ color: 'rgba(255,255,255,0.75)' }}>

                  <SalesCheckIcon color={SALES_INK.LIME} />
                  <span>{g}</span>
                </div>
              )}
            </div>

            <div
              className="text-center pt-6"
              style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>

              <p
                className="lime-ink-mono mb-2"
                style={{
                  fontSize: '0.78rem',
                  color: SALES_INK.INK400,
                  textDecoration: 'line-through'
                }}>

                Total value: <Node id="priceCard.totalValue" role="body">{p.totalValue}</Node> · Regular: <Node id="priceCard.regularPrice" role="body">{p.regularPrice}</Node>
              </p>
              <p
                className="font-black leading-none tracking-[-0.04em] mb-1"
                style={{
                  fontSize: 'clamp(3rem,8vw,4.5rem)',
                  color: SALES_INK.LIME
                }}>

                <Node id="priceCard.currentPrice" role="body">{p.currentPrice}</Node>
              </p>
              <p
                className="lime-ink-mono mb-6"
                style={{
                  fontSize: '0.78rem',
                  color: SALES_INK.LIME_SOFT,
                  fontWeight: 700
                }}>

                <Node id="priceCard.savings" role="body">{p.savings}</Node>
              </p>
              <TrackedCheckoutLink
                href={resolveCheckoutHref(wpCheckoutRedirectUrl)}
                className="lime-ink-cta-primary lime-ink-sales-pulse inline-flex items-center gap-3 font-bold px-10 py-4 rounded-full text-base">

                <Node id="priceCard.ctaLabel" role="button">{p.ctaLabel}</Node>
                <SalesArrowRight size={18} />
              </TrackedCheckoutLink>
              <p
                className="lime-ink-mono mt-4"
                style={{ fontSize: '0.72rem', color: SALES_INK.INK400 }}>

                <Node id="priceCard.guarantee" role="body">{p.guarantee}</Node>
              </p>
              {wpThankyouRedirectUrl &&
              <p style={{ marginTop: '1.25rem' }}>
                  <TrackedDeclineLink href={wpThankyouRedirectUrl} style={{ color: '#64748b', fontSize: '0.85rem', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                    No thanks. Complete my free registration
                  </TrackedDeclineLink>
                </p>
              }
            </div>
          </div>
        </div>
      </div>
    </section>);

}
