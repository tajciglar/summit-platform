import { describe, it, expect } from 'vitest';
import { buildComponentRegistry } from '../component-registry';

describe('buildComponentRegistry', () => {
  it('includes all 8 UI component module paths', () => {
    const registry = buildComponentRegistry({});
    expect(registry).toContain('@/components/ui/button');
    expect(registry).toContain('@/components/ui/card');
    expect(registry).toContain('@/components/ui/accordion');
    expect(registry).toContain('@/components/ui/input');
    expect(registry).toContain('@/components/ui/label');
    expect(registry).toContain('@/components/ui/select');
    expect(registry).toContain('@/components/ui/separator');
    expect(registry).toContain('@/components/ui/textarea');
  });

  it('includes hex colors from style brief palette', () => {
    const registry = buildComponentRegistry({
      palette: {
        primary: '#abc123',
        background: '#f0f0f0',
        accent: '#ff5500',
      },
    });
    expect(registry).toContain('#abc123');
    expect(registry).toContain('#f0f0f0');
    expect(registry).toContain('#ff5500');
  });

  it('includes font names from style brief typography', () => {
    const registry = buildComponentRegistry({
      typography: {
        heading_font: 'Playfair Display',
        body_font: 'Lato',
        heading_weight: '800',
      },
    });
    expect(registry).toContain('Playfair Display');
    expect(registry).toContain('Lato');
    expect(registry).toContain('800');
  });

  it('includes max-width and padding from layout rules', () => {
    const registry = buildComponentRegistry({
      rhythm: {
        section_padding: '80px',
        max_width: '1200px',
      },
    });
    expect(registry).toContain('80px');
    expect(registry).toContain('1200px');
  });

  it('includes anti-patterns (lucide-react, useState)', () => {
    const registry = buildComponentRegistry({});
    expect(registry).toContain('lucide-react');
    expect(registry).toContain('useState');
  });

  it('works with empty style brief (uses defaults, still valid output)', () => {
    const registry = buildComponentRegistry({});
    // Should produce a non-empty string without throwing
    expect(typeof registry).toBe('string');
    expect(registry.length).toBeGreaterThan(200);
    // Default values should be present
    expect(registry).toContain('#6366f1');
    expect(registry).toContain('Poppins');
    expect(registry).toContain('Inter');
    expect(registry).toContain('1120px');
    expect(registry).toContain('75px');
  });

  it('includes button shape (rounded-full for pill)', () => {
    const pillRegistry = buildComponentRegistry({
      components: { button_shape: 'pill' },
    });
    expect(pillRegistry).toContain('rounded-full');

    const squareRegistry = buildComponentRegistry({
      components: { button_shape: 'square' },
    });
    expect(squareRegistry).toContain('rounded-lg');
  });

  it('includes both background and surface colors for alternation', () => {
    const registry = buildComponentRegistry({
      palette: {
        background: '#ffffff',
        surface: '#f5f5f5',
      },
    });
    expect(registry).toContain('#ffffff');
    expect(registry).toContain('#f5f5f5');
  });
});
