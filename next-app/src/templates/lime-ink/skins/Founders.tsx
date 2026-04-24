import { Node } from '../../shared/Node';
import type { LimeInkContent } from '../../lime-ink.schema';
import { FOUNDER_GRADIENTS, FOUNDER_TEXT_COLORS } from './shared';

type Props = {
  content: LimeInkContent['founders'];
};

export function Founders({ content }: Props) {
  const f = content;
  return (
    <section
      className="py-20 md:py-28 lime-ink-hairline-b"
      style={{ background: '#F4F4F5' }}>

      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-4">
          <span
            className="lime-ink-mono text-xs"
            style={{ color: '#71717A' }}>

            <Node id="founders.sectionLabel" role="body">{f.sectionLabel}</Node>
          </span>
          <span
            className="h-[1px] w-12"
            style={{ background: '#E4E4E7' }}>
          </span>
        </div>
        <h2 className="font-black text-4xl md:text-5xl tracking-[-0.03em] mb-14">
          <Node id="founders.headline" role="heading">{f.headline}</Node>
        </h2>
        <div className="grid md:grid-cols-2 gap-12">
          {f.items.map((founder, idx) =>
          <div
            key={`founder-${idx}`}
            className="bg-white rounded-2xl p-8"
            style={{ border: '1px solid #E4E4E7' }}>

              <div className="flex items-center gap-4 mb-6">
                <div
                className="w-14 h-14 rounded-full flex items-center justify-center font-black text-sm"
                style={{
                  background:
                  FOUNDER_GRADIENTS[idx % FOUNDER_GRADIENTS.length],
                  color:
                  FOUNDER_TEXT_COLORS[idx % FOUNDER_TEXT_COLORS.length]
                }}>

                  {founder.initials}
                </div>
                <div>
                  <p className="font-bold text-lg">{founder.name}</p>
                  <p
                  className="lime-ink-mono text-xs mt-0.5"
                  style={{ color: '#71717A' }}>

                    {founder.role}
                  </p>
                </div>
              </div>
              <blockquote
              className="text-lg leading-relaxed pl-5"
              style={{
                color: '#18181B',
                borderLeft: '4px solid #C4F245'
              }}>

                &ldquo;{founder.quote}&rdquo;
              </blockquote>
            </div>
          )}
        </div>
      </div>
    </section>);

}
