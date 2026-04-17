import type { Speaker } from './types';
import type { OpusV1Content } from './opus-v1.schema';
import { OpusV1Layout } from './opus-v1/layout';

type Props = {
  content: OpusV1Content;
  speakers: Record<string, Speaker>;
  funnelId: string;
  enabledSections?: string[];
};

export function OpusV1({ content, speakers, funnelId, enabledSections }: Props) {
  return (
    <OpusV1Layout
      content={content}
      enabledSections={enabledSections}
      speakers={speakers}
      funnelId={funnelId}
    />
  );
}
