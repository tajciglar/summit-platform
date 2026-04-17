import { OptinModal } from '@/components/OptinModal';
import type { Speaker } from '../types';
import type { OpusV1Content } from '../opus-v1.schema';
import { opusV1ContentToSections, type SectionContentMap } from './bridge';
import {
  opusV1Sections,
  opusV1SectionOrder,
  opusV1DefaultEnabledSections,
} from './sections';
import type { TemplateContext } from './skins/shared';

export type OpusV1LayoutProps = {
  content: OpusV1Content;
  enabledSections?: string[];
  speakers: Record<string, Speaker>;
  funnelId: string;
};

export function OpusV1Layout({
  content,
  enabledSections,
  speakers,
  funnelId,
}: OpusV1LayoutProps) {
  const enabled = enabledSections ?? opusV1DefaultEnabledSections;
  const sections = opusV1ContentToSections(content);
  const ordered = opusV1SectionOrder.filter((k) => enabled.includes(k));

  const context: TemplateContext = {
    summitName: content.summit.name,
    heroCtaLabel: content.hero.ctaLabel,
  };

  return (
    <div className="opus-v1-root opus-v1-body antialiased">
      <a href="#main" className="skip-nav">Skip to content</a>

      <main id="main">
        {ordered.map((key) => {
          const Skin = opusV1Sections[key as keyof typeof opusV1Sections] as React.FC<{
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
        })}
      </main>

      <OptinModal funnelId={funnelId} ctaLabel={content.hero.ctaLabel} />
    </div>
  );
}
