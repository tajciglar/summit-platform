#!/usr/bin/env node
/**
 * Codemod: wrap plain-text JSX expressions with
 * `<Node id="section.field" role="...">` so the live preview inline editor
 * can find them.
 *
 *   node scripts/wrap-nodes.mjs <template.tsx>
 *
 * Auto-discovers section aliases by walking the scope for each `{alias.field}`
 * JSX expression. When `alias` was declared via
 *    const alias = content.SECTION
 * the codemod uses SECTION as the path prefix. Also handles the direct form
 * `{content.SECTION.field}`. Skips attribute-value expressions, already-wrapped
 * nodes, and non-member expressions.
 *
 * Injects `import { Node } from './shared/Node';` if not already imported.
 */

import parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import { readFileSync, writeFileSync } from 'node:fs';
import { argv, exit } from 'node:process';

const [, , filePath] = argv;
if (!filePath) {
  console.error('Usage: wrap-nodes.mjs <template.tsx>');
  exit(1);
}

const source = readFileSync(filePath, 'utf8');
const ast = parser.parse(source, {
  sourceType: 'module',
  plugins: ['typescript', 'jsx'],
});

// Role heuristics — drives the future per-element property panel.
const ROLE_FOR = (field) => {
  const f = field.toLowerCase();
  if (f.includes('headline') || f.includes('heading')) return 'heading';
  if (f.includes('subhead')) return 'subheading';
  if (f.includes('cta') && f.includes('label')) return 'button';
  if (f.includes('quote')) return 'quote';
  if (f.includes('caption') || f.includes('badge') || f.includes('eyebrow')) return 'label';
  if (f.includes('tagline')) return 'tagline';
  return 'body';
};

/**
 * For alias `x` at a given NodePath, resolve it to a content-section path
 * prefix by looking at its declaration.
 *   const x = content.SECTION        → "SECTION"
 *   const x = props.content.SECTION  → "SECTION"
 * Returns null if alias doesn't resolve to a content section.
 */
function resolveAliasPrefix(path, aliasName) {
  const binding = path.scope.getBinding(aliasName);
  if (!binding) return null;
  const decl = binding.path.node;
  if (!t.isVariableDeclarator(decl) || !decl.init) return null;
  const init = decl.init;
  // content.SECTION
  if (t.isMemberExpression(init) && t.isIdentifier(init.object, { name: 'content' }) && t.isIdentifier(init.property)) {
    return init.property.name;
  }
  // props.content.SECTION
  if (
    t.isMemberExpression(init) &&
    t.isMemberExpression(init.object) &&
    t.isIdentifier(init.object.property, { name: 'content' }) &&
    t.isIdentifier(init.property)
  ) {
    return init.property.name;
  }
  return null;
}

let wraps = 0;
let hasNodeImport = false;

traverse.default(ast, {
  ImportDeclaration(path) {
    if (path.node.source.value === './shared/Node') hasNodeImport = true;
  },
  JSXExpressionContainer(path) {
    // Skip attribute-value expressions — not rendered text.
    if (t.isJSXAttribute(path.parent)) return;

    const expr = path.node.expression;
    let prefix = null;
    let field = null;

    // Case 1: {alias.field}
    if (
      t.isMemberExpression(expr) &&
      !expr.computed &&
      t.isIdentifier(expr.object) &&
      t.isIdentifier(expr.property)
    ) {
      const resolved = resolveAliasPrefix(path, expr.object.name);
      if (resolved) {
        prefix = resolved;
        field = expr.property.name;
      }
    }

    // Case 2: {content.SECTION.field}
    if (
      !prefix &&
      t.isMemberExpression(expr) &&
      !expr.computed &&
      t.isMemberExpression(expr.object) &&
      !expr.object.computed &&
      t.isIdentifier(expr.object.object, { name: 'content' }) &&
      t.isIdentifier(expr.object.property) &&
      t.isIdentifier(expr.property)
    ) {
      prefix = expr.object.property.name;
      field = expr.property.name;
    }

    if (!prefix || !field) return;

    // Skip already-wrapped (inside a <Node ...> element).
    let ancestor = path;
    while ((ancestor = ancestor.parentPath)) {
      if (
        t.isJSXElement(ancestor.node) &&
        t.isJSXIdentifier(ancestor.node.openingElement.name) &&
        ancestor.node.openingElement.name.name === 'Node'
      ) {
        return;
      }
    }

    const id = `${prefix}.${field}`;
    const role = ROLE_FOR(field);
    const opening = t.jsxOpeningElement(
      t.jsxIdentifier('Node'),
      [
        t.jsxAttribute(t.jsxIdentifier('id'), t.stringLiteral(id)),
        t.jsxAttribute(t.jsxIdentifier('role'), t.stringLiteral(role)),
      ],
      false,
    );
    const closing = t.jsxClosingElement(t.jsxIdentifier('Node'));
    const wrapped = t.jsxElement(opening, closing, [t.jsxExpressionContainer(expr)], false);

    path.replaceWith(wrapped);
    path.skip();
    wraps++;
  },
});

if (!hasNodeImport) {
  const importDecl = t.importDeclaration(
    [t.importSpecifier(t.identifier('Node'), t.identifier('Node'))],
    t.stringLiteral('./shared/Node'),
  );
  ast.program.body.unshift(importDecl);
}

const out = generate.default(ast, { retainLines: true, jsescOption: { minimal: true } }, source).code;
writeFileSync(filePath, out);
console.log(`${filePath}: ${wraps} wraps, import=${hasNodeImport ? 'exists' : 'added'}`);
