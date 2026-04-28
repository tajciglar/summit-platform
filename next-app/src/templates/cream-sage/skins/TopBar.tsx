import type { CreamSageContent } from '../../cream-sage.schema';
import { Node } from '../../shared/Node';

type Props = { content: CreamSageContent };

export function TopBar({ content }: Props) {
  const t = content.topBar;
  return (
    <header
      className="sticky top-0 z-40"
      style={{
        background: 'rgba(250,247,242,0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(179,195,183,0.4)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg width="34" height="34" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <circle cx="16" cy="16" r="14" fill="#4A6B5D" />
            <path d="M9 16 Q 16 8, 23 16 Q 16 24, 9 16" fill="#E8B9A0" />
          </svg>
          <span
            className="font-bold text-xl tracking-tight"
            style={{ fontFamily: "'Fraunces', serif", color: '#2F4A40' }}
          >
            <Node id="topBar.brandName">{t.brandName}</Node>
          </span>
        </div>
        <div className="flex items-center gap-5">
          <span
            className="hidden md:inline text-base font-semibold"
            style={{ color: '#2F4A40' }}
          >
            <Node id="topBar.dateRangeLabel">{content.summit.eventStatusLabel ?? t.dateRangeLabel}</Node>
          </span>
          <a
            href="#optin"
            className="cream-sage-btn-primary"
            style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}
          >
            <Node id="topBar.ctaLabel">{t.ctaLabel}</Node>
          </a>
        </div>
      </div>
    </header>
  );
}
