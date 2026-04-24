import { Node } from './shared/Node';
import './indigo-gold.styles.css';
import type { Speaker } from './types';
import type { Palette } from '@/lib/palette';
import { IndigoGoldLayout } from './indigo-gold/layout';
import type { IndigoGoldRenderContent } from './indigo-gold/bridge';

void Node;

type Props = {
  content: IndigoGoldRenderContent;
  speakers: Record<string, Speaker>;
  funnelId: string;
  enabledSections?: string[];
  palette?: Palette | null;
  wpCheckoutRedirectUrl?: string | null;
  wpThankyouRedirectUrl?: string | null;
};

export function IndigoGold({
  content,
  speakers,
  funnelId,
  enabledSections,
  palette,
  wpCheckoutRedirectUrl,
  wpThankyouRedirectUrl,
}: Props) {
  return (
    <IndigoGoldLayout
      content={content}
      enabledSections={enabledSections}
      speakers={speakers}
      funnelId={funnelId}
      palette={palette}
      wpCheckoutRedirectUrl={wpCheckoutRedirectUrl}
      wpThankyouRedirectUrl={wpThankyouRedirectUrl}
    />
  );
}
