// Trust boundary: only pass source that has passed validateJsx() and been
// transpiled by Babel. The factory runs in a constructed scope whose only
// outer bindings are the three arguments passed in (require, module, exports).
export type ModuleFactory = (
  require: (id: string) => unknown,
  module: { exports: Record<string, unknown> },
  exports: Record<string, unknown>,
) => void;

const FactoryCtor = Function as unknown as new (...args: string[]) => ModuleFactory;

export function buildModuleFactory(code: string): ModuleFactory {
  return new FactoryCtor('require', 'module', 'exports', code);
}
