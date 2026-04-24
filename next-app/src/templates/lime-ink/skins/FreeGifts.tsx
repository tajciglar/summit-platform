import { Node } from '../../shared/Node';
import type { LimeInkContent } from '../../lime-ink.schema';
import { SALES_INK, SalesGiftIcon } from './shared';

type Props = {
  content: NonNullable<LimeInkContent['freeGifts']>;
};

export function FreeGifts({ content }: Props) {
  const fg = content;
  return (
    <section className="bg-white py-20 md:py-28 lime-ink-hairline-b">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-4">
          <span
            className="lime-ink-mono text-xs"
            style={{ color: SALES_INK.INK400 }}>

            <Node id="freeGifts.eyebrow" role="label">{fg.eyebrow}</Node>
          </span>
          <span
            className="h-[1px] w-12"
            style={{ background: SALES_INK.SURFACE_BORDER }}>
          </span>
        </div>
        <h2 className="font-black text-4xl md:text-5xl leading-[1.05] tracking-[-0.03em] mb-14 max-w-3xl">
          <Node id="freeGifts.headline" role="heading">{fg.headline}</Node>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {fg.items.map((gift, i) =>
          <article
            key={`gift-${i}`}
            className="rounded-2xl p-7 flex flex-col gap-4"
            style={{
              background: SALES_INK.SURFACE,
              border: `1px solid ${SALES_INK.SURFACE_BORDER}`
            }}>

              <div className="flex items-start justify-between">
                <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{
                  background: SALES_INK.INK900
                }}>

                  <SalesGiftIcon size={26} color={SALES_INK.LIME} />
                </div>
                <span
                className="lime-ink-mono px-2.5 py-1 rounded-full"
                style={{
                  fontSize: '0.65rem',
                  letterSpacing: '0.1em',
                  color: SALES_INK.INK900,
                  background: SALES_INK.LIME,
                  fontWeight: 700
                }}>

                  {gift.valueLabel}
                </span>
              </div>
              <div>
                <p
                className="lime-ink-mono mb-2"
                style={{
                  fontSize: '0.65rem',
                  color: SALES_INK.LIME_DARK,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontWeight: 700
                }}>

                  GIFT.{String(gift.giftNumber).padStart(2, '0')}
                </p>
                <h3 className="font-black text-xl mb-2 tracking-tight">
                  {gift.title}
                </h3>
                <p
                className="text-sm leading-relaxed"
                style={{ color: SALES_INK.INK500 }}>

                  {gift.description}
                </p>
              </div>
            </article>
          )}
        </div>
        <p
          className="lime-ink-mono text-center mt-10"
          style={{ fontSize: '0.8rem', color: SALES_INK.INK400 }}>

          <Node id="freeGifts.deliveryNote" role="body">{fg.deliveryNote}</Node>
        </p>
      </div>
    </section>);

}
