import type { SectionContentMap } from '../bridge';
import { STAT_CARD_GRADIENTS, STAT_CARD_LABEL_COLORS } from './shared';

type Props = {
  content: SectionContentMap['stats'];
};

export function Stats({ content }: Props) {
  return (
    <section className="py-14" style={{ backgroundColor: '#FDF8F3' }}>
      <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {content.items.map((item, idx) =>
          <div
            key={`stat-${idx}`}
            className="rounded-2xl shadow-lg p-8 text-center"
            style={{ background: STAT_CARD_GRADIENTS[idx % STAT_CARD_GRADIENTS.length] }}>

            <p className="rust-cream-heading font-black text-4xl md:text-5xl text-white">
              {item.value}
            </p>
            <p
              className="font-medium text-sm mt-1 uppercase tracking-wider"
              style={{ color: STAT_CARD_LABEL_COLORS[idx % STAT_CARD_LABEL_COLORS.length] }}>

              {item.label}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
