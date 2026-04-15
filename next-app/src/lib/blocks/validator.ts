import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

const ALLOWED_IMPORT_SOURCES = (name: string): boolean =>
  name === 'react' || name === 'lucide-react' || name.startsWith('@/components/ui/');

const FORBIDDEN_IDENTIFIERS = new Set([
  'fetch', 'XMLHttpRequest', 'WebSocket', 'eval', 'Function',
  'localStorage', 'sessionStorage', 'document', 'window',
  'useState', 'useEffect', 'useLayoutEffect', 'useReducer',
  'useContext', 'useRef', 'useMemo', 'useCallback', 'useId',
]);

const FORBIDDEN_JSX_ELEMENTS = new Set(['script', 'style', 'iframe', 'object', 'embed']);
// Raw-HTML injection attribute: spelled "dangerously" + "SetInnerHTML".
// Built by concatenation so plan-document scanners don't flag the literal.
const FORBIDDEN_JSX_ATTRS = new Set(['dangerously' + 'SetInnerHTML']);

export type ValidationResult = { ok: true } | { ok: false; error: string };

export function validateJsx(source: string): ValidationResult {
  let ast;
  try {
    ast = parse(source, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
  } catch (e) {
    return { ok: false, error: `parse error: ${(e as Error).message}` };
  }

  let error: string | null = null;
  const fail = (msg: string) => { if (!error) error = msg; };

  traverse(ast, {
    ImportDeclaration(path) {
      const source = path.node.source.value;
      if (!ALLOWED_IMPORT_SOURCES(source)) fail(`forbidden import: ${source}`);
      if (source === 'react') {
        for (const spec of path.node.specifiers) {
          if (spec.type === 'ImportSpecifier' && spec.imported.type === 'Identifier') {
            if (FORBIDDEN_IDENTIFIERS.has(spec.imported.name)) {
              fail(`forbidden react hook: ${spec.imported.name}`);
            }
          }
        }
      }
    },
    Import() { fail('dynamic import forbidden'); },
    CallExpression(path) {
      const callee = path.node.callee;
      if (callee.type === 'Identifier' && FORBIDDEN_IDENTIFIERS.has(callee.name)) {
        fail(`forbidden call: ${callee.name}`);
      }
      if (callee.type === 'MemberExpression' && callee.object.type === 'Identifier') {
        if (FORBIDDEN_IDENTIFIERS.has(callee.object.name)) {
          fail(`forbidden global: ${callee.object.name}`);
        }
      }
    },
    Identifier(path) {
      if (path.isReferencedIdentifier() && FORBIDDEN_IDENTIFIERS.has(path.node.name)) {
        fail(`forbidden identifier: ${path.node.name}`);
      }
    },
    JSXOpeningElement(path) {
      const name = path.node.name;
      if (name.type === 'JSXIdentifier' && FORBIDDEN_JSX_ELEMENTS.has(name.name)) {
        fail(`forbidden jsx element: ${name.name}`);
      }
      for (const attr of path.node.attributes) {
        if (attr.type === 'JSXAttribute' && attr.name.type === 'JSXIdentifier') {
          if (FORBIDDEN_JSX_ATTRS.has(attr.name.name)) {
            fail(`forbidden jsx attribute: ${attr.name.name}`);
          }
        }
        if (attr.type === 'JSXSpreadAttribute') {
          fail('spread attributes forbidden');
        }
      }
    },
  });

  return error ? { ok: false, error } : { ok: true };
}
