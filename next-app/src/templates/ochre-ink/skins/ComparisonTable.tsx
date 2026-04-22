import type { SectionContentMap } from '../bridge';

type Props = {
  content: NonNullable<SectionContentMap['comparison-table']>;
};

function YesMark() {
  return (
    <span
      aria-label="Included"
      className="inline-grid place-items-center w-8 h-8 rounded-full bg-ochre-600 text-paper-50 font-display font-black text-sm"
    >
      ✓
    </span>
  );
}

function NoMark() {
  return (
    <span
      aria-label="Not included"
      className="inline-grid place-items-center w-8 h-8 rounded-full border border-paper-300 text-taupe-500 font-display text-sm"
    >
      —
    </span>
  );
}

export function ComparisonTable({ content }: Props) {
  if (!content) return null;

  return (
    <section className="bg-paper-50 py-20 md:py-28 border-b border-paper-300">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="eyebrow text-ochre-700 mb-3">{content.eyebrow}</p>
          <h2 className="font-display font-black text-4xl md:text-5xl text-ink-700 leading-tight">
            {content.headline}
          </h2>
        </div>

        <div className="border border-paper-300 bg-paper-100 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="px-6 py-5 text-left figure-label border-b border-paper-300">
                  Feature
                </th>
                <th className="px-6 py-5 text-center figure-label border-b border-l border-paper-300">
                  Reader Edition
                </th>
                <th className="px-6 py-5 text-center figure-label border-b border-l border-paper-300 bg-paper-50">
                  <span className="text-ochre-700">Subscriber Edition</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {content.rows.map((row, idx) => (
                <tr
                  key={`cmp-${idx}`}
                  className={idx % 2 === 0 ? 'bg-paper-100' : 'bg-paper-50'}
                >
                  <td className="px-6 py-5 border-t border-paper-300 font-display font-bold text-ink-700 text-sm md:text-base leading-snug">
                    {row.label}
                  </td>
                  <td className="px-6 py-5 border-t border-l border-paper-300 text-center">
                    {row.freePass ? <YesMark /> : <NoMark />}
                  </td>
                  <td className="px-6 py-5 border-t border-l border-paper-300 text-center">
                    {row.vipPass ? <YesMark /> : <NoMark />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
