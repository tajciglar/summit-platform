import { describe, it, expect } from 'vitest';
import { compileJsxModule } from '../jsx-compile';

describe('compileJsxModule', () => {
  it('returns default export as a renderable component', async () => {
    const jsx = `export default function S(){ return <div>hello</div>; }`;
    const Component = await compileJsxModule(jsx, { resolve: () => null });
    expect(typeof Component).toBe('function');
  });
  it('resolves allowed imports via the resolver', async () => {
    const jsx = `import { Thing } from '@/components/ui/thing';
      export default function S(){ return <Thing/>; }`;
    const Thing = () => null;
    const Component = await compileJsxModule(jsx, {
      resolve: (id) => id === '@/components/ui/thing' ? { Thing } : null,
    });
    expect(typeof Component).toBe('function');
  });
});
