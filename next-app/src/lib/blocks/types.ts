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
