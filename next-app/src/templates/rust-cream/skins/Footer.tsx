import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';

type Props = {
  content: SectionContentMap['footer'];
};

export function Footer({ content: f }: Props) {
  return (
    <footer className="py-10" style={{ backgroundColor: '#2A1D15', color: '#8B7355' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#C2703E' }}>

              <span className="rust-cream-heading font-black text-white text-lg">
                <Node id="footer.brandInitial" role="body">{f.brandInitial}</Node>
              </span>
            </div>
            <div>
              <p className="rust-cream-heading font-bold text-white text-sm">
                <Node id="footer.brandName" role="body">{f.brandName}</Node>
              </p>
              <p className="text-xs" style={{ color: '#8B7355' }}>
                <Node id="footer.tagline" role="tagline">{f.tagline}</Node>
              </p>
            </div>
          </div>
          <div className="flex gap-6 text-sm">
            {f.links.map((link, idx) =>
              <a
                key={`footer-link-${idx}`}
                href={link.href}
                className="hover:text-white transition-colors">

                {link.label}
              </a>
            )}
          </div>
          <p className="text-xs" style={{ color: '#6B3410' }}>
            <Node id="footer.copyright" role="body">{f.copyright}</Node>
          </p>
        </div>
      </div>
    </footer>
  );
}
