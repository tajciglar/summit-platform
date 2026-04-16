import { transformAsync } from '@babel/core';
import * as React from 'react';
import * as JsxRuntime from 'react/jsx-runtime';
import { buildModuleFactory } from './module-factory';

export interface CompileOptions {
  resolve: (id: string) => unknown | null;
}

export type CompiledComponent = React.ComponentType<Record<string, unknown>>;

// Map PascalCase JSX element names → their @/components/ui/* module path.
// Used to auto-inject missing imports when Gemini forgets them.
const PRIMITIVE_MAP: Record<string, string> = {
  Accordion: '@/components/ui/accordion',
  AccordionItem: '@/components/ui/accordion',
  AccordionTrigger: '@/components/ui/accordion',
  AccordionContent: '@/components/ui/accordion',
  Button: '@/components/ui/button',
  Card: '@/components/ui/card',
  CardHeader: '@/components/ui/card',
  CardFooter: '@/components/ui/card',
  CardTitle: '@/components/ui/card',
  CardAction: '@/components/ui/card',
  CardDescription: '@/components/ui/card',
  CardContent: '@/components/ui/card',
  Input: '@/components/ui/input',
  Label: '@/components/ui/label',
  Select: '@/components/ui/select',
  SelectContent: '@/components/ui/select',
  SelectGroup: '@/components/ui/select',
  SelectItem: '@/components/ui/select',
  SelectLabel: '@/components/ui/select',
  SelectTrigger: '@/components/ui/select',
  SelectValue: '@/components/ui/select',
  Separator: '@/components/ui/separator',
  Textarea: '@/components/ui/textarea',
};

/**
 * Scan JSX source for PascalCase element names that reference known UI
 * primitives but lack an import statement.  Inject the missing imports so
 * the component compiles without "X is not defined" runtime errors.
 */
function patchMissingImports(source: string): string {
  // Collect names already imported.
  const imported = new Set<string>();
  for (const m of source.matchAll(/import\s+\{([^}]+)\}\s+from\s+['"][^'"]+['"]/g)) {
    for (const name of m[1].split(',')) {
      imported.add(name.trim());
    }
  }

  // Find PascalCase JSX usages: <Button, <Card, etc.
  const used = new Set<string>();
  for (const m of source.matchAll(/<([A-Z]\w+)/g)) {
    const name = m[1];
    if (PRIMITIVE_MAP[name] && !imported.has(name)) {
      used.add(name);
    }
  }

  if (used.size === 0) return source;

  // Group by module path.
  const byModule = new Map<string, string[]>();
  for (const name of used) {
    const mod = PRIMITIVE_MAP[name];
    if (!byModule.has(mod)) byModule.set(mod, []);
    byModule.get(mod)!.push(name);
  }

  const imports = Array.from(byModule.entries())
    .map(([mod, names]) => `import { ${names.sort().join(', ')} } from "${mod}";`)
    .join('\n');

  return imports + '\n' + source;
}

export async function compileJsxModule(source: string, opts: CompileOptions): Promise<CompiledComponent> {
  const patched = patchMissingImports(source);
  const transformed = await transformAsync(patched, {
    presets: [
      ['@babel/preset-typescript', { allExtensions: true, isTSX: true }],
      ['@babel/preset-react', { runtime: 'automatic' }],
    ],
    plugins: ['@babel/plugin-transform-modules-commonjs'],
    babelrc: false,
    configFile: false,
    sourceType: 'module',
    caller: { name: 'summit-runtime-renderer', supportsStaticESM: false },
  });

  if (!transformed?.code) throw new Error('transpile failed');

  const exports: Record<string, unknown> = {};
  const module = { exports };

  const requireFn = (id: string): unknown => {
    if (id === 'react') return React;
    if (id === 'react/jsx-runtime') return JsxRuntime;
    const resolved = opts.resolve(id);
    if (resolved == null) throw new Error(`unresolved module: ${id}`);
    return resolved;
  };

  const factory = buildModuleFactory(transformed.code);
  factory(requireFn, module, exports);

  const Component = (module.exports as { default?: CompiledComponent }).default
    ?? (exports as { default?: CompiledComponent }).default;
  if (typeof Component !== 'function') throw new Error('no default export component');
  return Component;
}
