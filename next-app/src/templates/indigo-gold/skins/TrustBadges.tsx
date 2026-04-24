import type { SectionContentMap } from '../bridge';
import { Icon, INK, LAV, SUN, TRUST_ICON } from './shared';

type Props = { content: SectionContentMap['trust-badges'] };

export function TrustBadges({ content }: Props) {
  return (
    <section className="bg-white py-5" style={{ borderBottom: `1px solid ${LAV.c100}` }}>
      <div
        className="max-w-4xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm"
        style={{ color: INK.c700 }}
      >
        {content.items.map((item, idx) => (
          <span key={`trust-${idx}`} className="flex items-center gap-2">
            <Icon
              id={TRUST_ICON[item.icon] ?? 'shield'}
              className="w-4 h-4"
              style={{ color: item.icon === 'star' ? SUN.c500 : LAV.c700 }}
            />
            {item.label}
          </span>
        ))}
      </div>
    </section>
  );
}
