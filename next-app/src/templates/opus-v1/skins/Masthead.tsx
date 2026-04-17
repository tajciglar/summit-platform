import type { MastheadContent } from '../../../sections/masthead.schema';
import type { TemplateContext } from './shared';

type Props = {
  content: MastheadContent;
  context: TemplateContext;
};

export function Masthead({ content, context }: Props) {
  return (
    <header className="sticky top-0 z-40 bg-paper-100/95 backdrop-blur border-b border-paper-300">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-baseline gap-4">
          <span className="font-display font-black text-xl text-ink-700 tracking-tight">
            {context.summitName}
          </span>
          <span className="hidden md:inline text-taupe-600 font-opus-serif italic text-sm">
            {content.volume}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="eyebrow text-taupe-600 hidden md:inline">
            {content.eyebrow}
          </span>
          <a
            href="#optin"
            className="bg-ink-700 hover:bg-ink-900 text-paper-50 font-ui font-semibold text-sm px-5 py-2.5 rounded-full transition"
          >
            {context.heroCtaLabel}
          </a>
        </div>
      </div>
    </header>
  );
}
