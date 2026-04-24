import { Node } from './shared/Node';
import './cream-sage.styles.css';
import type { Speaker } from './types';
import type { CreamSageContent } from './cream-sage.schema';
import type { Palette } from '@/lib/palette';
import type { DesignTokens } from './shared/design-tokens';
import { CreamSageLayout } from './cream-sage/layout';

void Node;

type Props = {
  content: CreamSageContent;
  speakers: Record<string, Speaker>;
  funnelId: string;
  enabledSections?: string[];
  palette?: Palette | null;
  tokens?: DesignTokens;
  sections?: Record<string, DesignTokens>;
  wpCheckoutRedirectUrl?: string | null;
  wpThankyouRedirectUrl?: string | null;
};

export function CreamSage({
  content,
  speakers,
  funnelId,
  enabledSections,
  palette,
  tokens,
  sections,
  wpCheckoutRedirectUrl,
  wpThankyouRedirectUrl,
}: Props) {
  return (
    <CreamSageLayout
      content={content}
      enabledSections={enabledSections}
      speakers={speakers}
      funnelId={funnelId}
      palette={palette}
      tokens={tokens}
      sections={sections}
      wpCheckoutRedirectUrl={wpCheckoutRedirectUrl}
      wpThankyouRedirectUrl={wpThankyouRedirectUrl}
    />
  );
}
