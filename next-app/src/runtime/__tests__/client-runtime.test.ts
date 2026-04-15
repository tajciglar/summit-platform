/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from 'vitest';
import { hydrateAll } from '../client-runtime';

function setBody(html: string): void {
  const range = document.createRange();
  range.selectNodeContents(document.body);
  const fragment = range.createContextualFragment(html);
  document.body.replaceChildren(fragment);
}

describe('client-runtime', () => {
  beforeEach(() => { document.body.replaceChildren(); });

  it('countdown marker updates text', async () => {
    const future = new Date(Date.now() + 60_000).toISOString();
    setBody(`<div data-hydrate="countdown" data-target="${future}"><span data-cd-days>0</span><span data-cd-hours>0</span><span data-cd-minutes>0</span><span data-cd-seconds>0</span></div>`);
    hydrateAll();
    await new Promise(r => setTimeout(r, 50));
    expect(document.querySelector('[data-cd-seconds]')?.textContent).not.toBe('0');
  });

  it('accordion toggles open/closed', () => {
    setBody(`<div data-hydrate="accordion"><button data-acc-toggle="q1">Q</button><div data-acc-panel="q1" hidden>A</div></div>`);
    hydrateAll();
    const btn = document.querySelector<HTMLButtonElement>('[data-acc-toggle]')!;
    const panel = document.querySelector<HTMLElement>('[data-acc-panel]')!;
    btn.click();
    expect(panel.hidden).toBe(false);
    btn.click();
    expect(panel.hidden).toBe(true);
  });

  it('optin-form posts to data-endpoint', async () => {
    const calls: RequestInit[] = [];
    globalThis.fetch = (async (_url: RequestInfo, init?: RequestInit) => {
      calls.push(init!);
      return new Response('{}', { status: 200 });
    }) as typeof fetch;
    setBody(`<form data-hydrate="optin-form" data-endpoint="/api/optin"><input name="email" value="a@b.com"/><button type="submit">Go</button></form>`);
    hydrateAll();
    const form = document.querySelector('form')!;
    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    await new Promise(r => setTimeout(r, 10));
    expect(calls.length).toBe(1);
  });
});
