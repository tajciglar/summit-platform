import { Node } from './shared/Node';
import './green-gold.styles.css';
import type { Speaker } from './types';
import type { GreenGoldContent } from './green-gold.schema';
import type { Palette } from '@/lib/palette';
import { GreenGoldLayout } from './green-gold/layout';

// Document chrome (html/head/body) is owned by the Next.js page/layout that
// renders this template. Fonts (Poppins / Source Sans 3) must be loaded by
// the page — see preview/public routes wiring.
void Node;

type Props = {
  content: GreenGoldContent;
  speakers: Record<string, Speaker>;
  funnelId: string;
  enabledSections?: string[];
  palette?: Palette | null;
  wpCheckoutRedirectUrl?: string | null;
  wpThankyouRedirectUrl?: string | null;
};

export function GreenGold({
  content,
  speakers,
  funnelId,
  enabledSections,
  wpCheckoutRedirectUrl,
  wpThankyouRedirectUrl,
}: Props) {
  return (
    <GreenGoldLayout
      content={content}
      enabledSections={enabledSections}
      speakers={speakers}
      funnelId={funnelId}
      wpCheckoutRedirectUrl={wpCheckoutRedirectUrl}
      wpThankyouRedirectUrl={wpThankyouRedirectUrl}
    />
  );
}
