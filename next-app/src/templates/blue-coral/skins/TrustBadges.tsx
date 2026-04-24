import type { SectionContentMap } from '../bridge';
import { BadgeIcon } from './shared';

type Props = {
  content: SectionContentMap['trust'];
};

export function TrustBadges({ content }: Props) {
  return (
    <section
      className="bg-white py-5"
      style={{ borderBottom: '1px solid #F3F4F6' }}>

      <div className="max-w-4xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm" style={{ color: '#6B7280' }}>
        {content.items.map((item, idx) =>
        <span key={`badge-${idx}`} className="flex items-center gap-2">
            <BadgeIcon
            icon={item.icon}
            className={`w-4 h-4 ${item.icon === 'star' ? '' : ''}`} />

            <span style={{ color: item.icon === 'star' ? '#F87171' : undefined }} />
            <span>{item.label}</span>
          </span>
        )}
      </div>
    </section>);

}
