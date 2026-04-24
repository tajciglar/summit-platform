import type { SectionContentMap } from '../bridge';
import { TrustIcon } from './shared';

type Props = {
  content: SectionContentMap['trust'];
};

export function Trust({ content }: Props) {
  return (
    <section
      className="py-5"
      style={{ backgroundColor: '#FDF8F3', borderBottom: '1px solid #E8C4A8' }}>

      <div
        className="max-w-4xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm"
        style={{ color: '#8B7355' }}>

        {content.items.map((item, idx) =>
          <span key={`trust-${idx}`} className="flex items-center gap-2">
            <TrustIcon name={item.icon} />
            {item.label}
          </span>
        )}
      </div>
    </section>
  );
}
