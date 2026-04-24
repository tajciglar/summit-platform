import { Node } from '../../shared/Node';
import type { LimeInkContent } from '../../lime-ink.schema';

type Props = {
  content: LimeInkContent['topBar'];
};

export function TopBar({ content }: Props) {
  const t = content;
  return (
    <header
      className="sticky top-0 z-40 text-white"
      style={{ background: '#0A0A0B' }}>

      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="lime-ink-mono text-xs" style={{ color: '#C4F245' }}>
            <Node id="topBar.codeTag" role="body">{t.codeTag}</Node>
          </span>
          <span className="font-bold tracking-tight text-sm md:text-base"><Node id="topBar.name" role="body">{t.name}</Node></span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="lime-ink-mono px-2.5 py-1 rounded-full"
            style={{
              fontSize: '0.65rem',
              color: '#DCFF6B',
              border: '1px solid rgba(196,242,69,0.4)'
            }}>

            <Node id="topBar.statusPill" role="body">{t.statusPill}</Node>
          </span>
          <a
            href="#optin"
            className="lime-ink-cta-primary text-xs md:text-sm font-bold px-5 py-2 rounded-full">

            <Node id="topBar.ctaLabel" role="button">{t.ctaLabel}</Node>
          </a>
        </div>
      </div>
    </header>);

}
