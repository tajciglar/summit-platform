import type { ReactNode } from 'react';

/**
 * Selectable / editable wrapper used by every visual-editor-aware template.
 *
 * In the live preview (`/preview/step/:id?inline=1`), the LivePreviewShell
 * finds every `[data-edit-path]` node and wires contentEditable + postMessage
 * round-trip to Filament. In public/prod renders it's an invisible span —
 * no extra markup, no style bloat.
 *
 * `role` is carried for the Phase 3+ property panel (it decides which
 * controls to show when the node is selected). Today it's purely
 * informational.
 */
export type NodeRole =
  | 'heading'
  | 'subheading'
  | 'body'
  | 'label'
  | 'button'
  | 'caption'
  | 'quote'
  | 'tagline';

export function Node({
  id,
  role,
  as: Tag = 'span',
  children,
}: {
  id: string;
  role?: NodeRole;
  as?: 'span' | 'div';
  children: ReactNode;
}) {
  return (
    <Tag data-edit-path={id} data-node-role={role}>
      {children}
    </Tag>
  );
}
