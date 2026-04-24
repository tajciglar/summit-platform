import { Node } from '../../shared/Node';
import type { LimeInkContent } from '../../lime-ink.schema';

type Props = {
  content: LimeInkContent['footer'];
};

export function Footer({ content }: Props) {
  const f = content;
  return (
    <footer
      className="text-white py-14"
      style={{ background: '#050506' }}>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-[2fr_1fr_1fr_1fr] gap-10">
          <div>
            <p
              className="lime-ink-mono text-xs mb-3"
              style={{ color: '#C4F245' }}>

              <Node id="footer.codeTag" role="body">{f.codeTag}</Node>
            </p>
            <p className="font-black text-xl mb-3 tracking-tight">
              <Node id="footer.brandName" role="body">{f.brandName}</Node>
            </p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <Node id="footer.tagline" role="tagline">{f.tagline}</Node>
            </p>
          </div>
          <div>
            <p
              className="lime-ink-mono text-xs mb-4"
              style={{ color: '#71717A' }}>

              <Node id="footer.summitLinksLabel" role="body">{f.summitLinksLabel}</Node>
            </p>
            <ul
              className="space-y-2 text-sm"
              style={{ color: 'rgba(255,255,255,0.7)' }}>

              {f.summitLinks.map((link, idx) =>
              <li key={`summit-link-${idx}`}>
                  <a href={link.href} className="hover:text-[#DCFF6B]">
                    {link.label}
                  </a>
                </li>
              )}
            </ul>
          </div>
          <div>
            <p
              className="lime-ink-mono text-xs mb-4"
              style={{ color: '#71717A' }}>

              <Node id="footer.legalLinksLabel" role="body">{f.legalLinksLabel}</Node>
            </p>
            <ul
              className="space-y-2 text-sm"
              style={{ color: 'rgba(255,255,255,0.7)' }}>

              {f.legalLinks.map((link, idx) =>
              <li key={`legal-link-${idx}`}>
                  <a href={link.href} className="hover:text-[#DCFF6B]">
                    {link.label}
                  </a>
                </li>
              )}
            </ul>
          </div>
          <div>
            <p
              className="lime-ink-mono text-xs mb-4"
              style={{ color: '#71717A' }}>

              <Node id="footer.contactLabel" role="body">{f.contactLabel}</Node>
            </p>
            <ul
              className="space-y-2 text-sm"
              style={{ color: 'rgba(255,255,255,0.7)' }}>

              <li><Node id="footer.contactEmail" role="body">{f.contactEmail}</Node></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}><Node id="footer.copyright" role="body">{f.copyright}</Node></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>);

}
