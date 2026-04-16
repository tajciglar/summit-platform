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

function handleBrokenImages(): void {
  document.addEventListener(
    'error',
    (ev) => {
      if (!(ev.target instanceof HTMLImageElement)) return;
      const img = ev.target;
      if (img.dataset.placeholdered) return;
      img.dataset.placeholdered = '1';
      img.style.display = 'none';

      const placeholder = document.createElement('div');
      placeholder.style.width = '100%';
      placeholder.style.aspectRatio = '16/9';
      placeholder.style.borderRadius = '0.75rem';
      placeholder.style.background = 'linear-gradient(135deg,#e2e8f0 0%,#f1f5f9 100%)';
      placeholder.style.display = 'flex';
      placeholder.style.alignItems = 'center';
      placeholder.style.justifyContent = 'center';

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('width', '48');
      svg.setAttribute('height', '48');
      svg.setAttribute('stroke', '#94a3b8');
      svg.setAttribute('stroke-width', '1.5');
      svg.setAttribute('fill', 'none');

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', '3');
      rect.setAttribute('y', '3');
      rect.setAttribute('width', '18');
      rect.setAttribute('height', '18');
      rect.setAttribute('rx', '2');
      svg.appendChild(rect);

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', '8.5');
      circle.setAttribute('cy', '8.5');
      circle.setAttribute('r', '1.5');
      svg.appendChild(circle);

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'm21 15-5-5L5 21');
      svg.appendChild(path);

      placeholder.appendChild(svg);
      img.insertAdjacentElement('afterend', placeholder);
    },
    true
  );
}

if (typeof document !== 'undefined' && document.readyState !== 'loading') {
  handleBrokenImages();
  hydrateAll();
} else if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    handleBrokenImages();
    hydrateAll();
  });
}
