import type { SectionContentMap } from '../bridge';

type Props = {
  content: NonNullable<SectionContentMap['vip-bonuses']>;
};

const ICON_LABELS: Record<string, string> = {
  'infinity': 'Unlimited Access',
  'clipboard': 'Action Blueprints',
  'headphones': 'Audio Edition',
  'captions': 'Subtitles',
  'file-text': 'Transcripts',
  'book': 'Workbook',
};

function BonusIcon({ icon }: { icon: string }) {
  const label = ICON_LABELS[icon] ?? icon;
  const common = {
    width: 36,
    height: 36,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-label': label,
  };
  if (icon === 'infinity') {
    return (
      <svg {...common}>
        <path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z" />
      </svg>
    );
  }
  if (icon === 'clipboard') {
    return (
      <svg {...common}>
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      </svg>
    );
  }
  if (icon === 'headphones') {
    return (
      <svg {...common}>
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      </svg>
    );
  }
  if (icon === 'captions') {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
        <path d="M7 15h4" /><path d="M15 15h2" /><path d="M7 11h2" /><path d="M13 11h4" />
      </svg>
    );
  }
  if (icon === 'file-text') {
    return (
      <svg {...common}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    );
  }
  if (icon === 'book') {
    return (
      <svg {...common}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    );
  }
  return null;
}

const ROMAN = ['I.', 'II.', 'III.', 'IV.', 'V.', 'VI.', 'VII.', 'VIII.'];

export function VipBonuses({ content }: Props) {
  if (!content) return null;

  return (
    <section className="bg-paper-100 py-20 md:py-28 border-b border-paper-300">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="eyebrow text-ochre-700 mb-3">{content.eyebrow}</p>
          <h2 className="font-display font-black text-4xl md:text-5xl text-ink-700 leading-tight">
            {content.headline}
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.items.map((item, idx) => (
            <article
              key={`vip-bonus-${idx}`}
              className="bg-paper-50 border border-paper-300 p-8 flex flex-col"
            >
              <div className="flex items-center justify-between mb-6 pb-4 rule">
                <span className="figure-label">{ROMAN[idx] ?? `${idx + 1}.`} Enclosure</span>
                <span className="bg-ink-700 text-paper-50 font-display font-bold text-xs px-3 py-1">
                  {item.valueLabel}
                </span>
              </div>
              <div className="text-ochre-700 mb-5">
                <BonusIcon icon={item.icon} />
              </div>
              <p className="figure-label text-taupe-600 mb-2">{ICON_LABELS[item.icon] ?? item.icon}</p>
              <h3 className="font-display font-black text-xl text-ink-700 mb-3 leading-tight">
                {item.title}
              </h3>
              <p className="font-opus-serif text-taupe-700 leading-relaxed">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
