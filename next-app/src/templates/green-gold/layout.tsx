import { OptinModal } from '@/components/OptinModal';
import type { Speaker } from '../types';
import type { GreenGoldContent } from '../green-gold.schema';
import { greenGoldContentToSections, type SectionContentMap } from './bridge';
import {
  greenGoldSections,
  greenGoldSectionOrder,
  greenGoldDefaultEnabledSections,
} from './sections';
import type { TemplateContext } from './skins/shared';

export type GreenGoldLayoutProps = {
  content: GreenGoldContent;
  enabledSections?: string[];
  speakers: Record<string, Speaker>;
  funnelId: string;
  wpCheckoutRedirectUrl?: string | null;
  wpThankyouRedirectUrl?: string | null;
};

// Sections rendered OUTSIDE <main> to preserve the original chrome layout:
//   - `top-bar` is the sticky header above main
//   - `footer` is the page footer below main
const CHROME_BEFORE = new Set(['top-bar']);
const CHROME_AFTER = new Set(['footer']);

export function GreenGoldLayout({
  content,
  enabledSections,
  speakers,
  funnelId,
  wpCheckoutRedirectUrl,
  wpThankyouRedirectUrl,
}: GreenGoldLayoutProps) {
  const enabled = enabledSections ?? [...greenGoldDefaultEnabledSections];
  const enabledSet = new Set(enabled);
  const sections = greenGoldContentToSections(content);
  const ordered = greenGoldSectionOrder.filter((k) => enabledSet.has(k));

  const context: TemplateContext = {
    funnelId,
    wpCheckoutRedirectUrl,
    wpThankyouRedirectUrl,
  };

  const renderKey = (key: string) => {
    const Skin = greenGoldSections[key as keyof typeof greenGoldSections] as React.FC<{
      content: SectionContentMap[keyof SectionContentMap];
      speakers: Record<string, Speaker>;
      funnelId: string;
      context: TemplateContext;
    }>;
    const sectionContent = sections[key as keyof SectionContentMap];
    if (!Skin || !sectionContent) return null;
    return (
      <Skin
        key={key}
        content={sectionContent}
        speakers={speakers}
        funnelId={funnelId}
        context={context}
      />
    );
  };

  return (
    <div className="green-gold-root green-gold-body antialiased">
      <a href="#main-content" className="green-gold-skip-nav">
        Skip to content
      </a>

      {ordered.filter((k) => CHROME_BEFORE.has(k)).map(renderKey)}

      <main id="main-content">
        {ordered.filter((k) => !CHROME_BEFORE.has(k) && !CHROME_AFTER.has(k)).map(renderKey)}
      </main>

      {ordered.filter((k) => CHROME_AFTER.has(k)).map(renderKey)}

      {enabledSet.has('hero') && content.hero && (
        <OptinModal funnelId={funnelId} ctaLabel={content.hero.primaryCtaLabel} />
      )}
    </div>
  );
}
