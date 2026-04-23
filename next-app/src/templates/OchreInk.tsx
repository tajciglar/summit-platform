import { Node } from "./shared/Node";import './ochre-ink.styles.css';
import type { Speaker } from './types';
import type { OchreInkContent } from './ochre-ink.schema';
import type { Palette } from '@/lib/palette';
import { OchreInkLayout } from './ochre-ink/layout';

type Props = {
  content: OchreInkContent;
  speakers: Record<string, Speaker>;
  funnelId: string;
  enabledSections?: string[];
  palette?: Palette | null;
  wpCheckoutRedirectUrl?: string | null;
  wpThankyouRedirectUrl?: string | null;
};

export function OchreInk({
  content,
  speakers,
  funnelId,
  enabledSections,
  palette,
  wpCheckoutRedirectUrl,
  wpThankyouRedirectUrl
}: Props) {
  return (
    <OchreInkLayout
      content={content}
      enabledSections={enabledSections}
      speakers={speakers}
      funnelId={funnelId}
      palette={palette}
      wpCheckoutRedirectUrl={wpCheckoutRedirectUrl}
      wpThankyouRedirectUrl={wpThankyouRedirectUrl} />);


}