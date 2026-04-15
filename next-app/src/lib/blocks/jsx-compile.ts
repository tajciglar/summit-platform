import { transformAsync } from '@babel/core';
import * as React from 'react';
import * as JsxRuntime from 'react/jsx-runtime';
import { buildModuleFactory } from './module-factory';

export interface CompileOptions {
  resolve: (id: string) => unknown | null;
}

export type CompiledComponent = React.ComponentType<Record<string, unknown>>;

export async function compileJsxModule(source: string, opts: CompileOptions): Promise<CompiledComponent> {
  const transformed = await transformAsync(source, {
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
