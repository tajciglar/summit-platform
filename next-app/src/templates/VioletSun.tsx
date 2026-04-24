import { Node } from './shared/Node';
import './violet-sun.styles.css';
import type { Speaker } from './types';
import type { VioletSunContent } from './violet-sun.schema';
import type { Palette } from '@/lib/palette';
import { VioletSunLayout } from './violet-sun/layout';

void Node;

type Props = {
  content: VioletSunContent;
  speakers: Record<string, Speaker>;
  funnelId: string;
  enabledSections?: string[];
  palette?: Palette | null;
  wpCheckoutRedirectUrl?: string | null;
  wpThankyouRedirectUrl?: string | null;
};

export function VioletSun({
  content,
  speakers,
  funnelId,
  enabledSections,
  palette,
  wpCheckoutRedirectUrl,
  wpThankyouRedirectUrl,
}: Props) {
  return (
    <VioletSunLayout
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
