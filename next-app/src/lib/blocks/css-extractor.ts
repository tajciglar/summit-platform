import { compile } from '@tailwindcss/node';
import path from 'path';

let compilerPromise: ReturnType<typeof compile> | null = null;

function getCompiler() {
  if (!compilerPromise) {
    const input =
      '@import "tailwindcss/theme" layer(theme);\n@import "tailwindcss/utilities" layer(utilities);';
    compilerPromise = compile(input, {
      base: path.resolve(process.cwd()),
      onDependency: () => {},
    });
  }
  return compilerPromise;
}

export async function extractCss(jsxSource: string): Promise<string> {
  const candidates = extractCandidates(jsxSource);
  if (candidates.length === 0) return '';
  const compiler = await getCompiler();
  return compiler.build(candidates);
}

function extractCandidates(jsx: string): string[] {
  const classes = new Set<string>();
  for (const m of jsx.matchAll(/className="([^"]+)"/g)) {
    for (const cls of splitClasses(m[1])) classes.add(cls);
  }
  for (const m of jsx.matchAll(/className=\{`([^`]+)`\}/g)) {
    for (const cls of splitClasses(m[1])) {
      if (!cls.startsWith('$')) classes.add(cls);
    }
  }
  for (const m of jsx.matchAll(/className=\{"([^"]+)"\}/g)) {
    for (const cls of splitClasses(m[1])) classes.add(cls);
  }
  for (const m of jsx.matchAll(/\bclass="([^"]+)"/g)) {
    for (const cls of splitClasses(m[1])) classes.add(cls);
  }
  return Array.from(classes);
}

function splitClasses(raw: string): string[] {
  return raw.split(/\s+/).map(c => c.trim()).filter(c => c.length > 0 && !c.startsWith('${'));
}
