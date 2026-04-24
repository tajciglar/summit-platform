import type { CreamSageContent } from '../../cream-sage.schema';
import { Node } from '../../shared/Node';
import { CS_SALES } from './shared';

type Props = { content: CreamSageContent };

export function Guarantee({ content }: Props) {
  if (!content.guarantee) return null;
  const g = content.guarantee;
  return (
    <section className="py-20 md:py-24" style={{ background: CS_SALES.CREAM }}>
      <div className="max-w-2xl mx-auto px-6">
        <div
          className="flex flex-col md:flex-row items-center gap-6 p-8"
          style={{
            background: CS_SALES.CREAM_DEEP,
            border: `2px dashed ${CS_SALES.SAGE}`,
            borderRadius: 24,
          }}
        >
          <div
            className="shrink-0 flex items-center justify-center"
            style={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              background: CS_SALES.SAGE_DEEP,
              color: CS_SALES.CREAM,
              fontFamily: "'Fraunces', serif",
            }}
          >
            <div className="text-center leading-none">
              <p
                className="font-black"
                style={{ fontSize: '2rem', color: CS_SALES.ROSE }}
              >
                {g.days}
              </p>
              <p
                className="uppercase"
                style={{
                  fontFamily: "'Nunito', 'DM Sans', sans-serif",
                  fontSize: '0.62rem',
                  letterSpacing: '0.22em',
                  marginTop: 4,
                }}
              >
                Days
              </p>
            </div>
          </div>
          <div className="text-center md:text-left">
            <h3
              className="font-bold text-2xl mb-2 leading-tight"
              style={{ fontFamily: "'Fraunces', serif", color: CS_SALES.INK }}
            >
              <Node id="guarantee.heading">{g.heading}</Node>
            </h3>
            <p
              className="text-base leading-relaxed"
              style={{ color: CS_SALES.INK_SOFT, margin: 0 }}
            >
              <Node id="guarantee.body">{g.body}</Node>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
