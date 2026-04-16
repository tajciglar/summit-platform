import { randomUUID } from 'crypto';

export type SectionStatus = 'ready' | 'regenerating' | 'failed';
export type SectionFieldKind = 'text' | 'url' | 'image' | 'array' | 'json';

export interface SectionField {
  path: string;
  kind: SectionFieldKind;
  value: unknown;
}

export interface Section {
  id: string;
  type: string;
  jsx: string;
  fields: SectionField[];
  css?: string;
  status: SectionStatus;
  regeneration_note: string | null;
  source_section_id: string | null;
  raw_output?: string;
  error?: string;
}

export function makeSection(partial: Pick<Section, 'type' | 'jsx' | 'fields'> & Partial<Section>): Section {
  return {
    id: partial.id ?? randomUUID(),
    type: partial.type,
    jsx: partial.jsx,
    fields: partial.fields,
    status: partial.status ?? 'ready',
    regeneration_note: partial.regeneration_note ?? null,
    source_section_id: partial.source_section_id ?? null,
  };
}

export function isSectionReady(s: Section): boolean {
  return s.status === 'ready';
}

export interface SectionBrief {
  type: string;
  purpose: string;
  position: number;
  total: number;
}

export interface SummitContext {
  name: string;
  date: string;
  brandColors: Record<string, string>;
  mode: 'dark' | 'light';
  speakers: Array<{ name: string; photo?: string; title?: string }>;
  toneBrief: string;
  product: null | { name: string; price: number; description: string };
}

export interface BuildDesignPromptInput {
  section: SectionBrief;
  summit: SummitContext;
  previousSectionJsx: string | null;
  regenerationNote: string | null;
  currentJsx?: string;
  styleBrief?: Record<string, unknown>;
  // Stage-1 output — the visual target for Stage 2. When present, Gemini is
  // instructed to match it pixel-wise (colors, spacing, typography, layout).
  mockupImage?: { mime: string; data: string } | null;
  // Fallback anchor when Stage 1 failed — the summit's Phase-0 URL screenshot.
  referenceImage?: { mime: string; data: string } | null;
}

export interface DesignPrompt {
  text: string;
  image?: { mime: string; data: string };
}
