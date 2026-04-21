import type { FooterContent } from '../../../sections/footer.schema';
import type { TemplateContext } from './shared';

type Props = {
  content: FooterContent;
  context: TemplateContext;
};

export function Footer({ content, context }: Props) {
  return (
    <footer className="bg-paper-100 py-14">
      <div className="max-w-6xl mx-auto px-6">
        <div className="rule pt-6 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="font-display font-black text-2xl text-ink-700 mb-2">
              {context.summitName}
            </p>
            <p className="font-opus-serif italic text-taupe-600">{content.tagline}</p>
          </div>
          <div className="flex flex-col md:items-end gap-2">
            <p className="figure-label">{content.volume}</p>
            <p className="text-sm text-taupe-600 font-opus-serif">{content.copyright}</p>
            <p className="text-sm text-taupe-600 font-opus-serif">
              <a href="#" className="hover:text-ink-700 border-b border-paper-300">
                Privacy
              </a>
              &nbsp;·&nbsp;
              <a href="#" className="hover:text-ink-700 border-b border-paper-300">
                Terms
              </a>
              &nbsp;·&nbsp;
              <a href="#" className="hover:text-ink-700 border-b border-paper-300">
                Contact
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
