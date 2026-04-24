import { Node } from '../../shared/Node';
import type { LimeInkContent } from '../../lime-ink.schema';
import { SALES_INK } from './shared';

type Props = {
  content: NonNullable<LimeInkContent['intro']>;
};

export function Intro({ content }: Props) {
  const i = content;
  return (
    <section className="bg-white py-20 md:py-24 lime-ink-hairline-b">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p
          className="lime-ink-mono mb-4"
          style={{
            fontSize: '0.7rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: SALES_INK.LIME_DARK
          }}>

          <Node id="intro.eyebrow" role="label">{i.eyebrow}</Node>
        </p>
        <h2 className="font-black text-4xl md:text-5xl leading-[1.05] tracking-[-0.03em] mb-8">
          <Node id="intro.headline" role="heading">{i.headline}</Node>
        </h2>
        {i.paragraphs.map((p, idx) =>
        <p
          key={`intro-p-${idx}`}
          className="text-lg leading-relaxed mb-5"
          style={{ color: SALES_INK.INK500 }}>

            {p}
          </p>
        )}
      </div>
    </section>);

}
