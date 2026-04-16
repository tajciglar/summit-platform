import type { SectionField } from './types';

export function applyFieldValues<T extends Record<string, unknown>>(
  context: T,
  fields: SectionField[],
): T {
  const clone = structuredClone(context);
  for (const f of fields) {
    // Gemini emits paths like "props.headline" — strip the leading "props."
    // so the value lands directly on the component's props object.
    const path = f.path.replace(/^props\./, '');
    const value = needsReconstruction(f.value) ? reconstructArray(f.value as unknown[]) : f.value;
    setByPath(clone as Record<string, unknown>, path, value);
  }
  return clone;
}

/**
 * Gemini sometimes wraps array-prop values in SectionField-like metadata.
 * Two formats observed:
 *
 * 1. Flat (FAQAccordion): [{kind, path: "props.faqs[0].question", value}, ...]
 * 2. Object (TestimonialCarousel): [{rating: {kind, path, value}, name: {kind, path, value}}, ...]
 *
 * Both must be unwrapped into plain data arrays.
 */
function needsReconstruction(value: unknown): boolean {
  if (!Array.isArray(value) || value.length === 0) return false;
  const first = value[0];
  if (typeof first !== 'object' || first === null) return false;
  // Flat format: item itself is a SectionField
  if ('path' in first && 'kind' in first && 'value' in first) return true;
  // Object format: item's values are SectionField-like objects
  const vals = Object.values(first as Record<string, unknown>);
  if (vals.length === 0) return false;
  const sample = vals[0];
  return typeof sample === 'object' && sample !== null && 'kind' in sample && 'value' in sample;
}

function reconstructArray(items: unknown[]): unknown[] {
  const first = items[0] as Record<string, unknown>;

  // Flat format: [{kind, path, value}, ...]
  if ('path' in first && 'kind' in first && 'value' in first) {
    const buckets = new Map<number, Record<string, unknown>>();
    for (const item of items as Array<{ path: string; value: unknown }>) {
      const m = item.path.match(/\[(\d+)]\.(\w+)$/);
      if (!m) continue;
      const idx = Number(m[1]);
      const key = m[2];
      if (!buckets.has(idx)) buckets.set(idx, {});
      buckets.get(idx)![key] = item.value;
    }
    return Array.from(buckets.entries())
      .sort(([a], [b]) => a - b)
      .map(([, obj]) => obj);
  }

  // Object format: [{fieldName: {kind, path, value}}, ...]
  return items.map((item) => {
    const obj: Record<string, unknown> = {};
    for (const [key, meta] of Object.entries(item as Record<string, unknown>)) {
      if (typeof meta === 'object' && meta !== null && 'value' in meta) {
        obj[key] = (meta as { value: unknown }).value;
      } else {
        obj[key] = meta;
      }
    }
    return obj;
  });
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
