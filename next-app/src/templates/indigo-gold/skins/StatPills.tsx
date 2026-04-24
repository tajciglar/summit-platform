import type { SectionContentMap } from '../bridge';
import { Icon, LAV, type IconId } from './shared';

type Props = { content: SectionContentMap['stats'] };

export function StatPills({ content }: Props) {
  const icons: IconId[] = ['clock', 'trending', 'users'];
  const items = content.items;
  return (
    <section className="py-10 bg-white">
      <div className="max-w-5xl mx-auto px-5 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {items.map((item, idx) => (
          <div
            key={`stat-${idx}`}
            className="flex items-center justify-center gap-3 rounded-2xl px-5 py-4 text-white shadow-lg"
            style={{
              background: `linear-gradient(135deg,${LAV.c700},${LAV.c500})`,
              boxShadow: '0 10px 24px -10px rgba(140,114,191,0.45)',
            }}
          >
            <span
              className="w-10 h-10 rounded-full grid place-items-center"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              <Icon id={icons[idx] ?? 'clock'} className="w-5 h-5" />
            </span>
            <div>
              <p className="text-[0.65rem] uppercase" style={{ letterSpacing: '0.2em', opacity: 0.8 }}>
                {item.label}
              </p>
              <p className="font-bold text-lg leading-tight">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
