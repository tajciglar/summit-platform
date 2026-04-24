import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { BrandMark } from './shared';

type Props = {
  content: SectionContentMap['top-bar'];
};

export function TopBar({ content }: Props) {
  const t = content;
  return (
    <header
      className="sticky top-0 z-40 text-white"
      style={{ background: '#6F4EE6' }}
    >
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrandMark />
          <span className="violet-sun-display font-bold text-lg tracking-tight">
            <Node id="topBar.brandName" role="body">{t.brandName}</Node>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span
            className="hidden md:inline-flex items-center gap-2 text-sm font-medium"
            style={{ color: '#E6E0FD' }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#FFC300' }}
            ></span>
            <Node id="topBar.dateLabel" role="body">{t.dateLabel}</Node>
          </span>
          <a
            href="#optin"
            className="violet-sun-btn-sun text-sm"
            style={{ padding: '0.5rem 1.25rem', boxShadow: 'none' }}
          >
            <Node id="topBar.ctaLabel" role="button">{t.ctaLabel}</Node>
          </a>
        </div>
      </div>
    </header>
  );
}
