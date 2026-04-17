import { describe, it, expect } from 'vitest';
import { paletteStyle, type Palette } from './palette';

describe('paletteStyle', () => {
  const fullPalette: Palette = {
    primary: '#111111',
    'primary-contrast': '#FFFFFF',
    ink: '#000000',
    paper: '#EEEEEE',
    'paper-alt': '#DDDDDD',
    muted: '#AAAAAA',
    accent: '#FF5555',
    border: '#CCCCCC',
  };

  it('returns CSS vars for a full palette', () => {
    const style = paletteStyle(fullPalette) as Record<string, string>;
    expect(style['--primary']).toBe('#111111');
    expect(style['--primary-contrast']).toBe('#FFFFFF');
    expect(style['--ink']).toBe('#000000');
    expect(style['--paper']).toBe('#EEEEEE');
    expect(style['--paper-alt']).toBe('#DDDDDD');
    expect(style['--muted']).toBe('#AAAAAA');
    expect(style['--accent']).toBe('#FF5555');
    expect(style['--border']).toBe('#CCCCCC');
  });

  it('returns undefined for null', () => {
    expect(paletteStyle(null)).toBeUndefined();
  });

  it('returns undefined for undefined', () => {
    expect(paletteStyle(undefined)).toBeUndefined();
  });
});
