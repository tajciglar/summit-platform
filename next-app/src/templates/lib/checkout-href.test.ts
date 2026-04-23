import { describe, expect, it } from 'vitest';
import { resolveCheckoutHref } from './checkout-href';

describe('resolveCheckoutHref', () => {
  it('falls back to #purchase for empty / null input', () => {
    expect(resolveCheckoutHref('')).toBe('#purchase');
    expect(resolveCheckoutHref(null)).toBe('#purchase');
    expect(resolveCheckoutHref(undefined)).toBe('#purchase');
    expect(resolveCheckoutHref('   ')).toBe('#purchase');
  });

  it('passes through valid https URLs', () => {
    expect(resolveCheckoutHref('https://althea-academy.com/checkout/vip'))
      .toBe('https://althea-academy.com/checkout/vip');
  });

  it('passes through valid http URLs', () => {
    expect(resolveCheckoutHref('http://example.com/cart'))
      .toBe('http://example.com/cart');
  });

  it('refuses javascript: URLs (XSS vector)', () => {
    expect(resolveCheckoutHref('javascript:alert(1)')).toBe('#purchase');
    expect(resolveCheckoutHref('JAVASCRIPT:alert(1)')).toBe('#purchase');
  });

  it('refuses data: URLs', () => {
    expect(resolveCheckoutHref('data:text/html,<script>alert(1)</script>'))
      .toBe('#purchase');
  });

  it('refuses file:, ftp:, and other non-http schemes', () => {
    expect(resolveCheckoutHref('file:///etc/passwd')).toBe('#purchase');
    expect(resolveCheckoutHref('ftp://example.com')).toBe('#purchase');
  });

  it('refuses malformed strings', () => {
    expect(resolveCheckoutHref('not a url at all')).toBe('#purchase');
    expect(resolveCheckoutHref('///no-scheme')).toBe('#purchase');
  });
});
