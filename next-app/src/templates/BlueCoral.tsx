import { Node } from './shared/Node';
import './blue-coral.styles.css';
import type { Speaker } from './types';
import type { BlueCoralRenderContent } from './blue-coral/bridge';
import type { Palette } from '@/lib/palette';
import { BlueCoralLayout } from './blue-coral/layout';

void Node;

type Props = {
  content: BlueCoralRenderContent;
  speakers: Record<string, Speaker>;
  funnelId: string;
  enabledSections?: string[];
  palette?: Palette | null;
  wpCheckoutRedirectUrl?: string | null;
  wpThankyouRedirectUrl?: string | null;
};

export function BlueCoral({
  content,
  speakers,
  funnelId,
  enabledSections,
  palette,
  wpCheckoutRedirectUrl,
  wpThankyouRedirectUrl,
}: Props) {
  return (
    <BlueCoralLayout
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
