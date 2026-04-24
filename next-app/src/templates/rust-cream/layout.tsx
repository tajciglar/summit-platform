import { OptinModal } from '@/components/OptinModal';
import type { Speaker } from '../types';
import type { RustCreamContent } from '../rust-cream.schema';
import { rustCreamContentToSections, type SectionContentMap } from './bridge';
import {
  rustCreamSections,
  rustCreamSectionOrder,
  rustCreamDefaultEnabledSections,
} from './sections';
import type { TemplateContext } from './skins/shared';

export type RustCreamLayoutProps = {
  content: RustCreamContent;
  enabledSections?: string[];
  speakers: Record<string, Speaker>;
  funnelId: string;
  wpCheckoutRedirectUrl?: string | null;
  wpThankyouRedirectUrl?: string | null;
};

export function RustCreamLayout({
  content,
  enabledSections,
  speakers,
  funnelId,
  wpCheckoutRedirectUrl,
  wpThankyouRedirectUrl,
}: RustCreamLayoutProps) {
  const enabled = enabledSections ?? [...rustCreamDefaultEnabledSections];
  const sections = rustCreamContentToSections(content);
  const ordered = rustCreamSectionOrder.filter((k) => enabled.includes(k));

  const context: TemplateContext = {
    topBarName: content.topBar?.name ?? '',
    wpCheckoutRedirectUrl,
    wpThankyouRedirectUrl,
  };

  // Preserve original HTML structure: top-bar OUTSIDE <main>, footer OUTSIDE <main>.
  const renderSection = (key: string) => {
    const Skin = rustCreamSections[key as keyof typeof rustCreamSections] as React.FC<{
      content: SectionContentMap[keyof SectionContentMap];
      speakers: Record<string, Speaker>;
      funnelId: string;
      context: TemplateContext;
    }>;
    const sectionContent = sections[key as keyof SectionContentMap];
    if (!Skin || sectionContent === undefined) return null;
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

  const topBarKey = ordered.find((k) => k === 'top-bar');
  const footerKey = ordered.find((k) => k === 'footer');
  const mainKeys = ordered.filter((k) => k !== 'top-bar' && k !== 'footer');

  return (
    <div className="rust-cream-root rust-cream-body antialiased">
      <a href="#main-content" className="rust-cream-skip-nav">
        Skip to content
      </a>

      {topBarKey && renderSection(topBarKey)}

      <main id="main-content">
        {mainKeys.map(renderSection)}
      </main>

      {footerKey && renderSection(footerKey)}

      {enabled.includes('hero') && content.hero && (
        <OptinModal funnelId={funnelId} ctaLabel={content.hero.ctaLabel} />
      )}
    </div>
  );
}
