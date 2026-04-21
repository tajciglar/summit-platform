import { OptinModal } from '@/components/OptinModal';
import { paletteStyle, type Palette } from '@/lib/palette';
import type { Speaker } from '../types';
import type { OchreInkContent } from '../ochre-ink.schema';
import { opusV1ContentToSections, type SectionContentMap } from './bridge';
import {
  opusV1Sections,
  opusV1SectionOrder,
  opusV1DefaultEnabledSections,
} from './sections';
import type { TemplateContext } from './skins/shared';

export type OchreInkLayoutProps = {
  content: OchreInkContent;
  enabledSections?: string[];
  speakers: Record<string, Speaker>;
  funnelId: string;
  palette?: Palette | null;
};

export function OchreInkLayout({
  content,
  enabledSections,
  speakers,
  funnelId,
  palette,
}: OchreInkLayoutProps) {
  const enabled = enabledSections ?? opusV1DefaultEnabledSections;
  const sections = opusV1ContentToSections(content);
  const ordered = opusV1SectionOrder.filter((k) => enabled.includes(k));

  const context: TemplateContext = {
    summitName: content.summit.name,
    heroCtaLabel: content.hero.ctaLabel,
  };

  return (
    <div
      className="ochre-ink-root ochre-ink-body antialiased"
      style={paletteStyle(palette)}
    >
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
