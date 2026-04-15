type Hydrator = (el: HTMLElement) => void;

const hydrators: Record<string, Hydrator> = {
  countdown: hydrateCountdown,
  accordion: hydrateAccordion,
  'optin-form': hydrateOptinForm,
};

export function hydrateAll(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-hydrate]').forEach(el => {
    const name = el.getAttribute('data-hydrate');
    if (name && hydrators[name]) hydrators[name](el);
  });
}

function hydrateCountdown(el: HTMLElement): void {
  const target = new Date(el.dataset.target ?? '').getTime();
  if (isNaN(target)) return;
  const days = el.querySelector('[data-cd-days]');
  const hours = el.querySelector('[data-cd-hours]');
  const minutes = el.querySelector('[data-cd-minutes]');
  const seconds = el.querySelector('[data-cd-seconds]');
  const tick = () => {
    const d = Math.max(0, target - Date.now());
    const dd = Math.floor(d / 86400000);
    const hh = Math.floor((d % 86400000) / 3600000);
    const mm = Math.floor((d % 3600000) / 60000);
    const ss = Math.floor((d % 60000) / 1000);
    if (days) days.textContent = String(dd);
    if (hours) hours.textContent = String(hh);
    if (minutes) minutes.textContent = String(mm);
    if (seconds) seconds.textContent = String(ss);
  };
  tick();
  setInterval(tick, 1000);
}

function hydrateAccordion(el: HTMLElement): void {
  el.querySelectorAll<HTMLButtonElement>('[data-acc-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.accToggle!;
      const panel = el.querySelector<HTMLElement>(`[data-acc-panel="${id}"]`);
      if (panel) panel.hidden = !panel.hidden;
    });
  });
}

function hydrateOptinForm(el: HTMLElement): void {
  const form = el as HTMLFormElement;
  const endpoint = form.dataset.endpoint;
  if (!endpoint) return;
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    form.dispatchEvent(new CustomEvent('optin:submitted'));
  });
}

if (typeof document !== 'undefined' && document.readyState !== 'loading') {
  hydrateAll();
} else if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => hydrateAll());
}
