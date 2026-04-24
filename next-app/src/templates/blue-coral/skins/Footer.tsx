import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';

type Props = {
  content: SectionContentMap['footer'];
};

export function Footer({ content }: Props) {
  const f = content;
  const logo = f.logo;
  return (
    <footer className="py-10" style={{ background: '#0F172A', color: '#93C5FD' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {logo?.url ?
            <img
              src={logo.url}
              alt={logo.alt ?? f.brandName}
              width={logo.width ?? undefined}
              height={logo.height ?? undefined}
              className="w-10 h-10 rounded-lg object-cover"
              data-testid="blue-coral-footer-logo" /> :


            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: '#2563EB' }}>

              <span
                className="blue-coral-heading font-black text-lg"
                style={{ color: '#FFFFFF' }}>

                <Node id="footer.brandInitial" role="body">{f.brandInitial}</Node>
              </span>
            </div>
            }
            <div>
              <p
                className="blue-coral-heading font-bold text-sm"
                style={{ color: '#FFFFFF' }}>

                <Node id="footer.brandName" role="body">{f.brandName}</Node>
              </p>
              <p className="text-xs" style={{ color: '#93C5FD' }}>
                <Node id="footer.tagline" role="tagline">{f.tagline}</Node>
              </p>
            </div>
          </div>
          <div className="flex gap-6 text-sm">
            {f.links.map((link, idx) =>
            <a
              key={`footer-link-${idx}`}
              href={link.href}
              className="transition-colors hover:text-white">

                {link.label}
              </a>
            )}
          </div>
          <p className="text-xs" style={{ color: '#60A5FA' }}>
            <Node id="footer.copyright" role="body">{f.copyright}</Node>
          </p>
        </div>
      </div>
    </footer>);

}
