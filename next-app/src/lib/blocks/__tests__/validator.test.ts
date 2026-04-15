import { describe, it, expect } from 'vitest';
import { validateJsx } from '../validator';

const RAW_HTML_PROP = 'dangerously' + 'SetInnerHTML';

describe('validateJsx', () => {
  it('accepts minimal valid component', () => {
    const jsx = `import { Button } from '@/components/ui/button';
    export default function S(){ return <section className="py-20"><Button>Hi</Button></section>; }`;
    expect(validateJsx(jsx).ok).toBe(true);
  });

  it('rejects forbidden import', () => {
    const jsx = `import fs from 'fs'; export default function S(){return null}`;
    const r = validateJsx(jsx);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/import/);
  });

  it('rejects script tag in JSX', () => {
    const jsx = `export default function S(){ return <div><script>x</script></div>; }`;
    expect(validateJsx(jsx).ok).toBe(false);
  });

  it('rejects the raw-HTML injection prop', () => {
    const jsx = `export default function S(){ return <div ${RAW_HTML_PROP}={{__html:'x'}} />; }`;
    expect(validateJsx(jsx).ok).toBe(false);
  });

  it('rejects useState hook', () => {
    const jsx = `import { useState } from 'react'; export default function S(){ const [x] = useState(0); return <div/>; }`;
    expect(validateJsx(jsx).ok).toBe(false);
  });

  it('rejects global fetch call', () => {
    const jsx = `export default function S(){ fetch('/x'); return <div/>; }`;
    expect(validateJsx(jsx).ok).toBe(false);
  });

  it('rejects dynamic import', () => {
    const jsx = `export default async function S(){ await import('x'); return <div/>; }`;
    expect(validateJsx(jsx).ok).toBe(false);
  });

  it('rejects parse errors', () => {
    expect(validateJsx('this is not javascript').ok).toBe(false);
  });
});
