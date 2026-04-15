import type { SectionField } from './types';

export function applyFieldValues<T extends Record<string, unknown>>(
  context: T,
  fields: SectionField[],
): T {
  const clone = structuredClone(context);
  for (const f of fields) {
    setByPath(clone as Record<string, unknown>, f.path, f.value);
  }
  return clone;
}

function setByPath(root: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.');
  let cur: unknown = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (!isIndexable(cur)) return;
    cur = (cur as Record<string, unknown>)[key];
  }
  if (!isIndexable(cur)) return;
  const last = parts[parts.length - 1];
  if (!(last in (cur as Record<string, unknown>))) return;
  (cur as Record<string, unknown>)[last] = value;
}

function isIndexable(v: unknown): v is Record<string, unknown> {
  return v !== null && (typeof v === 'object');
}
