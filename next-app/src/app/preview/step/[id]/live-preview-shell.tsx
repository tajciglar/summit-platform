'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Speaker } from '@/templates/types';
import type { Palette } from '@/lib/palette';
import type { DesignTokens } from '@/templates/shared/design-tokens';
import { getTemplate } from '@/templates/registry';
import { SalesCountdownBar } from '@/components/SalesCountdownBar';
import { resolveCheckoutHref } from '@/templates/lib/checkout-href';

interface LivePreviewShellProps {
  templateKey: string;
  initialContent: unknown;
  speakers: Record<string, Speaker>;
  funnelId: string;
  enabledSections?: string[];
  palette?: Palette | null;
  initialTokens?: DesignTokens | null;
  initialSections?: Record<string, DesignTokens> | null;
  wpCheckoutRedirectUrl?: string | null;
  wpThankyouRedirectUrl?: string | null;
}

function setByPath(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const parts = path.split('.');
  const next = { ...obj };
  let cursor: Record<string, unknown> = next;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    const prev = cursor[k];
    const clone = prev && typeof prev === 'object' ? { ...(prev as Record<string, unknown>) } : {};
    cursor[k] = clone;
    cursor = clone;
  }
  cursor[parts[parts.length - 1]] = value;
  return next;
}

export default function LivePreviewShell({
  templateKey,
  initialContent,
  speakers,
  funnelId,
  enabledSections,
  palette,
  initialTokens,
  initialSections,
  wpCheckoutRedirectUrl,
  wpThankyouRedirectUrl,
}: LivePreviewShellProps) {
  const [content, setContent] = useState(initialContent);
  const [liveEnabledSections, setLiveEnabledSections] = useState(enabledSections);
  const [tokens, setTokens] = useState<DesignTokens | null | undefined>(initialTokens);
  const [sections, setSections] = useState<Record<string, DesignTokens> | null | undefined>(initialSections);
  const search = useSearchParams();
  const inlineEdit = search?.get('inline') === '1';

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type !== 'step-preview-update') return;
      if (event.data.content) setContent(event.data.content);
      if (event.data.enabled_sections) setLiveEnabledSections(event.data.enabled_sections);
      if ('tokens' in event.data) setTokens(event.data.tokens ?? null);
      if ('sections' in event.data) setSections(event.data.sections ?? null);
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (!inlineEdit) return;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-edit-path]'));
    const handlers: Array<() => void> = [];

    nodes.forEach((node) => {
      const path = node.getAttribute('data-edit-path');
      if (!path) return;

      node.setAttribute('contenteditable', 'plaintext-only');
      node.style.outline = 'none';
      node.style.cursor = 'text';
      node.spellcheck = false;

      const onFocus = () => {
        node.dataset.editBaseline = node.textContent ?? '';
      };

      const finish = (commit: boolean) => {
        const baseline = node.dataset.editBaseline;
        if (baseline === undefined) return;
        const value = node.textContent ?? '';
        delete node.dataset.editBaseline;

        if (!commit) {
          node.textContent = baseline;
          return;
        }
        if (value === baseline) return;

        window.parent?.postMessage({ type: 'inline-edit', path, value }, '*');
        setContent((prev: unknown) =>
          prev && typeof prev === 'object'
            ? setByPath(prev as Record<string, unknown>, path, value)
            : prev,
        );
      };

      const onBlur = () => finish(true);
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          node.blur();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          finish(false);
          node.blur();
        }
      };

      // Links wrapping editable content would navigate on click — suppress
      // that so a click lands a cursor instead of following the link.
      const onClick = (e: MouseEvent) => {
        const anchor = node.closest('a');
        if (anchor) e.preventDefault();
      };

      node.addEventListener('focus', onFocus);
      node.addEventListener('blur', onBlur);
      node.addEventListener('keydown', onKeyDown);
      node.addEventListener('click', onClick);

      handlers.push(() => {
        node.removeEventListener('focus', onFocus);
        node.removeEventListener('blur', onBlur);
        node.removeEventListener('keydown', onKeyDown);
        node.removeEventListener('click', onClick);
        node.removeAttribute('contenteditable');
      });
    });

    return () => {
      handlers.forEach((off) => off());
    };
  }, [content, inlineEdit]);

  const template = getTemplate(templateKey);
  if (!template) return null;

  const Component = template.Component;
  const isSales = !!wpCheckoutRedirectUrl;

  return (
    <>
    {isSales && <SalesCountdownBar checkoutHref={resolveCheckoutHref(wpCheckoutRedirectUrl)} />}
    <Component
      content={content}
      speakers={speakers}
      funnelId={funnelId}
      enabledSections={liveEnabledSections}
      palette={palette}
      tokens={tokens ?? undefined}
      sections={sections ?? undefined}
      wpCheckoutRedirectUrl={wpCheckoutRedirectUrl}
      wpThankyouRedirectUrl={wpThankyouRedirectUrl}
    />
    </>
  );
}
