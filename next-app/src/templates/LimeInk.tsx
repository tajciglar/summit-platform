import { Node } from "./shared/Node";
import './lime-ink.styles.css';
import type { Speaker } from './types';
import type { LimeInkContent } from './lime-ink.schema';
import type { Palette } from '@/lib/palette';
import { LimeInkLayout } from './lime-ink/layout';

// Keep `Node` import retained so editor instrumentation continues to resolve.
void Node;

type Props = {
  content: LimeInkContent;
  speakers: Record<string, Speaker>;
  funnelId: string;
  enabledSections?: string[];
  palette?: Palette | null;
  wpCheckoutRedirectUrl?: string | null;
  wpThankyouRedirectUrl?: string | null;
};

export function LimeInk({
  content,
  speakers,
  funnelId,
  enabledSections,
  palette,
  wpCheckoutRedirectUrl,
  wpThankyouRedirectUrl,
}: Props) {
  return (
    <LimeInkLayout
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
