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
  let cur: Record<string, unknown> = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    // Auto-vivify missing intermediate nodes so runtime-generated sections
    // (which reference props the defaults map doesn't declare) still render.
    if (!isIndexable(cur[key])) {
      cur[key] = {};
    }
    cur = cur[key] as Record<string, unknown>;
  }
  const last = parts[parts.length - 1];
  cur[last] = value;
}

function isIndexable(v: unknown): v is Record<string, unknown> {
  return v !== null && (typeof v === 'object');
}
