import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { templates, templateKeys, getTemplate } from './registry';

describe('template registry', () => {
  it('has at least two templates', () => {
    expect(templateKeys.length).toBeGreaterThanOrEqual(2);
  });

  it.each(templateKeys)('template "%s" has all required properties', (key) => {
    const t = templates[key];
    expect(t.key).toBe(key);
    expect(t.label).toBeTruthy();
    expect(t.thumbnail).toMatch(/^\/template-thumbs\/.+\.(jpg|png|webp)$/);
    expect(t.schema).toBeDefined();
    expect(t.Component).toBeTruthy();
    expect(Array.isArray(t.tags)).toBe(true);
  });

  it.each(templateKeys)('template "%s" thumbnail file exists on disk', (key) => {
    const t = templates[key];
    const publicPath = resolve(process.cwd(), 'public', t.thumbnail.replace(/^\//, ''));
    expect(existsSync(publicPath)).toBe(true);
  });

  it.each(templateKeys)('template "%s" schema accepts its fixture', async (key) => {
    const t = templates[key];
    // Load fixture dynamically — conventionally at __fixtures__/<key>.fixture.ts
    const fixturePath = `./__fixtures__/${key}.fixture.ts`;
    const fixtureModule: Record<string, unknown> = await import(fixturePath);
    // Fixture exports follow the convention <key-camel>Fixture, e.g. ochreInkFixture
    const camelKey = key.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
    const fixtureName = `${camelKey}Fixture`;
    const fixture = fixtureModule[fixtureName];
    expect(fixture, `expected fixture export "${fixtureName}" in ${fixturePath}`).toBeDefined();
    expect(() => t.schema.parse(fixture)).not.toThrow();
  });

  it('getTemplate returns null for an unknown key', () => {
    expect(getTemplate('does-not-exist')).toBeNull();
  });

  it('getTemplate returns the matching template for a known key', () => {
    const t = getTemplate('ochre-ink');
    expect(t).not.toBeNull();
    expect(t?.key).toBe('ochre-ink');
    expect(t?.label).toBeTruthy();
  });
});
