import { OptinModal } from '@/components/OptinModal';
import type { Speaker } from '../types';
import type { LimeInkContent } from '../lime-ink.schema';
import type { Palette } from '@/lib/palette';
import { limeInkContentToSections, type SectionContentMap } from './bridge';
import {
  limeInkSections,
  limeInkSectionOrder,
  limeInkDefaultEnabledSections,
} from './sections';
import type { TemplateContext } from './skins/shared';

export type LimeInkLayoutProps = {
  content: LimeInkContent;
  enabledSections?: string[];
  speakers: Record<string, Speaker>;
  funnelId: string;
  palette?: Palette | null;
  wpCheckoutRedirectUrl?: string | null;
  wpThankyouRedirectUrl?: string | null;
};

export function LimeInkLayout({
  content,
  enabledSections,
  speakers,
  funnelId,
  wpCheckoutRedirectUrl,
  wpThankyouRedirectUrl,
}: LimeInkLayoutProps) {
  const enabled = enabledSections ?? [...limeInkDefaultEnabledSections];
  const sections = limeInkContentToSections(content);
  const ordered = limeInkSectionOrder.filter((k) => enabled.includes(k));

  // Sales pages share this template family but only carry sales-section
  // content, so optin keys (topBar, hero) may be absent. Fall back to safe
  // defaults so the page still renders.
  const context: TemplateContext = {
    topBarName: content.topBar?.name ?? content.summit?.name ?? '',
    heroCtaLabel: content.hero?.primaryCtaLabel ?? 'Get Started',
    wpCheckoutRedirectUrl,
    wpThankyouRedirectUrl,
  };

  return (
    <div className="lime-ink-root lime-ink-body antialiased">
      <a href="#main" className="lime-ink-skip-nav">
        Skip to content
      </a>

      {ordered.includes('top-bar') && sections['top-bar'] && (() => {
        const Skin = limeInkSections['top-bar'] as React.FC<{
          content: SectionContentMap['top-bar'];
          speakers: Record<string, Speaker>;
          funnelId: string;
          context: TemplateContext;
        }>;
        return (
          <Skin
            content={sections['top-bar']!}
            speakers={speakers}
            funnelId={funnelId}
            context={context}
          />
        );
      })()}

      <main id="main">
        {ordered
          .filter((k) => k !== 'top-bar' && k !== 'footer')
          .map((key) => {
            const Skin = limeInkSections[key as keyof typeof limeInkSections] as React.FC<{
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
          })}
      </main>

      {ordered.includes('footer') && sections.footer && (() => {
        const Skin = limeInkSections.footer as React.FC<{
          content: SectionContentMap['footer'];
          speakers: Record<string, Speaker>;
          funnelId: string;
          context: TemplateContext;
        }>;
        return (
          <Skin
            content={sections.footer!}
            speakers={speakers}
            funnelId={funnelId}
            context={context}
          />
        );
      })()}

      {enabled.includes('hero') && content.hero && (
        <OptinModal funnelId={funnelId} ctaLabel={content.hero.primaryCtaLabel} />
      )}
    </div>
  );
}
