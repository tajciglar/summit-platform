import type { z } from 'zod';

export type PageType = 'landing' | 'sales' | 'checkout' | 'thankyou';
export type SectionTier = 'core' | 'optional';

export type CatalogEntry = {
  key: string;
  label: string;
  description: string;
  pageTypes: PageType[];
  tier: SectionTier;
  schema: z.ZodObject<Record<string, z.ZodTypeAny>>;
  defaultOrder: number;
};

export type SectionSkin<Content> = React.FC<{
  content: Content;
  speakers: Record<string, import('../templates/types').Speaker>;
  funnelId: string;
}>;
