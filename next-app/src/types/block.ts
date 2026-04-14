import type { z } from 'zod'

export type StepType = 'optin' | 'sales_page' | 'checkout' | 'upsell' | 'downsell' | 'thank_you'

export interface BlockRow {
  id: string
  type: string
  version: number
  props: Record<string, unknown>
}

export interface BlockMeta {
  type: string
  category: 'hero' | 'form-cta' | 'speakers' | 'social-proof' | 'content' | 'checkout' | 'upsell' | 'thank_you' | 'utility'
  version: number
  validOn: StepType[]
  purpose: string
  exampleProps: Record<string, unknown>
}

export interface BlockDefinition<T extends z.ZodType = z.ZodType> {
  meta: BlockMeta
  schema: T
  Component: React.ComponentType<z.infer<T>>
}

export interface CatalogEntry {
  type: string
  category: BlockMeta['category']
  version: number
  validOn: StepType[]
  purpose: string
  schema: Record<string, unknown>
  exampleProps: Record<string, unknown>
  previewUrl?: string
}

export interface BlockCatalog {
  version: string
  generatedAt: string
  blocks: CatalogEntry[]
}
