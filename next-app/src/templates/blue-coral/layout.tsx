import { OptinModal } from '@/components/OptinModal';
import type { Palette } from '@/lib/palette';
import type { Speaker } from '../types';
import type { BlueCoralRenderContent, SectionContentMap } from './bridge';
import { blueCoralContentToSections } from './bridge';
import { blueCoralSections } from './sections';
import {
  blueCoralDefaultEnabledSections,
  blueCoralSectionOrder,
} from '../blue-coral.sections';
import type { TemplateContext } from './skins/shared';

export type BlueCoralLayoutProps = {
  content: BlueCoralRenderContent;
  enabledSections?: string[];
  speakers: Record<string, Speaker>;
  funnelId: string;
  palette?: Palette | null;
  wpCheckoutRedirectUrl?: string | null;
  wpThankyouRedirectUrl?: string | null;
};

// Sections that render outside the <main> element to preserve the original
// monolith's DOM structure: top-bar above main, footer below main.
const OUTSIDE_MAIN = new Set(['top-bar', 'footer']);

export function BlueCoralLayout({
  content,
  enabledSections,
  speakers,
  funnelId,
  wpCheckoutRedirectUrl,
  wpThankyouRedirectUrl,
}: BlueCoralLayoutProps) {
  const enabled = new Set(enabledSections ?? blueCoralDefaultEnabledSections);
  const sections = blueCoralContentToSections(content);

  const context: TemplateContext = {
    summitName: content.summit?.name ?? '',
    heroCtaLabel: content.hero?.ctaLabel ?? 'Get Started',
    wpCheckoutRedirectUrl,
    wpThankyouRedirectUrl,
  };

  function renderSection(key: string) {
    if (!enabled.has(key)) return null;
    const Skin = blueCoralSections[key as keyof typeof blueCoralSections] as React.FC<{
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
  }

  // Mirror original ordering: top-bar / main(...rest) / footer.
  const innerKeys = blueCoralSectionOrder.filter((k) => !OUTSIDE_MAIN.has(k));

  return (
    <div className="blue-coral-root blue-coral-body">
      <a href="#main-content" className="blue-coral-skip-nav">
        Skip to content
      </a>

      {renderSection('top-bar')}

      <main id="main-content">
        {innerKeys.map((key) => renderSection(key))}
      </main>

      {renderSection('footer')}

      {enabled.has('hero') && content.hero && (
        <OptinModal funnelId={funnelId} ctaLabel={content.hero.ctaLabel} />
      )}
    </div>
  );
}
