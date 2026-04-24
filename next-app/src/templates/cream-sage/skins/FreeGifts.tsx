import type { CreamSageContent } from '../../cream-sage.schema';
import { Node } from '../../shared/Node';
import { CS_SALES, CsSalesGiftIcon } from './shared';

type Props = { content: CreamSageContent };

export function FreeGifts({ content }: Props) {
  if (!content.freeGifts) return null;
  const fg = content.freeGifts;
  return (
    <section className="py-20 md:py-24" style={{ background: CS_SALES.CREAM }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span
            className="cream-sage-eyebrow mb-3 inline-block"
            style={{ color: CS_SALES.CLAY }}
          >
            <Node id="freeGifts.eyebrow">{fg.eyebrow}</Node>
          </span>
          <h2
            className="font-black text-4xl md:text-5xl leading-tight"
            style={{ fontFamily: "'Fraunces', serif", color: CS_SALES.INK }}
          >
            <Node id="freeGifts.headline">{fg.headline}</Node>
          </h2>
        </div>
        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))' }}
        >
          {fg.items.map((gift, idx) => (
            <article
              key={`free-gift-${idx}`}
              className="cream-sage-soft-card overflow-hidden"
              style={{ background: CS_SALES.CREAM }}
            >
              <div
                className="flex flex-col items-center justify-center gap-3 py-10 px-5"
                style={{
                  background: `linear-gradient(160deg,${CS_SALES.ROSE},${CS_SALES.ROSE_DEEP})`,
                  color: CS_SALES.CREAM,
                }}
              >
                <CsSalesGiftIcon size={40} color={CS_SALES.CREAM} />
                <span
                  style={{
                    fontFamily: "'Fraunces', serif",
                    fontStyle: 'italic',
                    fontSize: '1.05rem',
                  }}
                >
                  Free Gift №{gift.giftNumber}
                </span>
              </div>
              <div className="px-7 py-6">
                <p
                  className="mb-1"
                  style={{
                    fontFamily: "'Nunito', 'DM Sans', sans-serif",
                    color: CS_SALES.CLAY,
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                  }}
                >
                  Free Gift №{gift.giftNumber}
                </p>
                <h3
                  className="font-bold text-xl mb-2"
                  style={{ fontFamily: "'Fraunces', serif", color: CS_SALES.INK }}
                >
                  <Node id={`freeGifts.items.${idx}.title`}>{gift.title}</Node>
                </h3>
                <p
                  className="text-base mb-4 leading-relaxed"
                  style={{ color: CS_SALES.INK_SOFT }}
                >
                  <Node id={`freeGifts.items.${idx}.description`}>{gift.description}</Node>
                </p>
                <span
                  className="inline-block"
                  style={{
                    background: CS_SALES.CREAM_DEEP,
                    border: `1px solid ${CS_SALES.SAGE_LINE}`,
                    color: CS_SALES.CLAY,
                    fontFamily: "'Nunito', 'DM Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    padding: '0.35rem 0.85rem',
                    borderRadius: 999,
                  }}
                >
                  <Node id={`freeGifts.items.${idx}.valueLabel`}>{gift.valueLabel}</Node>
                </span>
              </div>
            </article>
          ))}
        </div>
        <p
          className="text-center mt-10 text-base"
          style={{
            fontFamily: "'Fraunces', serif",
            fontStyle: 'italic',
            color: CS_SALES.SAGE_DEEP,
          }}
        >
          <Node id="freeGifts.deliveryNote">{fg.deliveryNote}</Node>
        </p>
      </div>
    </section>
  );
}
