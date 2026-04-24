import { Node } from './shared/Node';
import './rust-cream.styles.css';
import type { Speaker } from './types';
import type { RustCreamContent } from './rust-cream.schema';
import type { Palette } from '@/lib/palette';
import { RustCreamLayout } from './rust-cream/layout';

void Node;

type Props = {
  content: RustCreamContent;
  speakers: Record<string, Speaker>;
  funnelId: string;
  enabledSections?: string[];
  palette?: Palette | null;
  wpCheckoutRedirectUrl?: string | null;
  wpThankyouRedirectUrl?: string | null;
};

export function RustCream({
  content,
  speakers,
  funnelId,
  enabledSections,
  wpCheckoutRedirectUrl,
  wpThankyouRedirectUrl,
}: Props) {
  return (
    <RustCreamLayout
      content={content}
      enabledSections={enabledSections}
      speakers={speakers}
      funnelId={funnelId}
      wpCheckoutRedirectUrl={wpCheckoutRedirectUrl}
      wpThankyouRedirectUrl={wpThankyouRedirectUrl}
    />
  );
}
