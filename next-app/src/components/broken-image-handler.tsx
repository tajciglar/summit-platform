'use client';

import { useEffect } from 'react';

export function BrokenImageHandler() {
  useEffect(() => {
    function handleError(e: Event) {
      const el = e.target;
      if (!(el instanceof HTMLImageElement)) return;
      if (el.dataset.placeholdered) return;
      el.dataset.placeholdered = '1';
      el.style.display = 'none';

      const placeholder = document.createElement('div');
      placeholder.style.cssText =
        'width:100%;aspect-ratio:16/9;border-radius:0.75rem;' +
        'background:linear-gradient(135deg,#e2e8f0 0%,#f1f5f9 100%);' +
        'display:flex;align-items:center;justify-content:center;';

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '48');
      svg.setAttribute('height', '48');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', '#94a3b8');
      svg.setAttribute('stroke-width', '1.5');

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', '3');
      rect.setAttribute('y', '3');
      rect.setAttribute('width', '18');
      rect.setAttribute('height', '18');
      rect.setAttribute('rx', '2');

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', '8.5');
      circle.setAttribute('cy', '8.5');
      circle.setAttribute('r', '1.5');

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'm21 15-5-5L5 21');

      svg.appendChild(rect);
      svg.appendChild(circle);
      svg.appendChild(path);
      placeholder.appendChild(svg);

      el.parentNode?.insertBefore(placeholder, el.nextSibling);
    }

    document.addEventListener('error', handleError, true);
    return () => document.removeEventListener('error', handleError, true);
  }, []);

  return null;
}
