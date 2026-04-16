import { describe, it, expect } from 'vitest';
import { extractCss } from '../css-extractor';

describe('extractCss', () => {
  it('generates CSS for arbitrary-value Tailwind classes in JSX', async () => {
    const jsx = `
      export default function S(props) {
        return (
          <section className="bg-[#8750F1] py-[7.5rem] text-[#FFFFFF]">
            <h1 className="text-4xl font-bold">{props.headline}</h1>
          </section>
        );
      }
    `;
    const css = await extractCss(jsx);
    expect(css).toContain('#8750F1');
    expect(css).toContain('7.5rem');
    expect(css).toContain('#FFFFFF');
    expect(css.length).toBeGreaterThan(100);
  });

  it('handles responsive and hover prefixes', async () => {
    const jsx = `
      export default function S(props) {
        return <div className="md:text-[3rem] hover:bg-[#333]/80">x</div>;
      }
    `;
    const css = await extractCss(jsx);
    expect(css).toContain('3rem');
    expect(css).toContain('#333');
  });

  it('returns empty string for JSX with no className attributes', async () => {
    const jsx = `export default function S() { return <div>hello</div>; }`;
    const css = await extractCss(jsx);
    expect(css.length).toBeLessThan(50);
  });
});
