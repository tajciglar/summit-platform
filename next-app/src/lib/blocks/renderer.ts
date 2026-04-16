// react-dom/server is loaded via createRequire to bypass Turbopack's static
// RSC module graph analysis, which rejects the import at compile time.
import { createRequire } from 'node:module';
import * as React from 'react';
import { compileJsxModule, type CompiledComponent } from './jsx-compile';
import { applyFieldValues } from './field-extractor';
import { extractCss } from './css-extractor';
import type { Section } from './types';
import { resolveUiPrimitive } from './primitive-resolver';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ReactDOMServer = createRequire(import.meta.url)(
  'react-dom/server',
) as typeof import('react-dom/server');

const componentCache = new Map<string, CompiledComponent>();

export async function renderSection<T extends Record<string, unknown>>(
  section: Section,
  defaultProps: T,
): Promise<string> {
  if (section.status === 'failed') throw new Error(`section ${section.id} is failed`);

  let Component = componentCache.get(section.id);
  if (!Component) {
    Component = await compileJsxModule(section.jsx, { resolve: resolveUiPrimitive });
    componentCache.set(section.id, Component);
  }

  const props = applyFieldValues(defaultProps, section.fields);
  const html = ReactDOMServer.renderToString(React.createElement(Component, props));

  const css = section.css || await extractCss(section.jsx);
  if (css) {
    return `<style>${css}</style>${html}`;
  }
  return html;
}

export function clearRendererCache(): void {
  componentCache.clear();
}
