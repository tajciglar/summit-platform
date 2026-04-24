import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { BrandMark } from './shared';

type Props = {
  content: SectionContentMap['footer'];
};

export function Footer({ content }: Props) {
  const f = content;
  return (
    <footer
      className="text-white py-14"
      style={{ background: '#110833' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div
          className="grid md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 pb-10"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <BrandMark />
              <p className="violet-sun-display font-bold text-xl">
                <Node id="footer.brandName" role="body">{f.brandName}</Node>
              </p>
            </div>
            <p
              className="text-sm max-w-xs"
              style={{ color: '#C5B8F7' }}
            >
              <Node id="footer.tagline" role="tagline">{f.tagline}</Node>
            </p>
          </div>
          <div>
            <p
              className="violet-sun-eyebrow mb-4"
              style={{ color: '#A08CEF' }}
            >
              <Node id="footer.summitLinksLabel" role="body">{f.summitLinksLabel}</Node>
            </p>
            <ul
              className="space-y-2 text-sm"
              style={{ color: 'rgba(230,224,253,0.8)' }}
            >
              {f.summitLinks.map((link, idx) => (
                <li key={`summit-link-${idx}`}>
                  <a href={link.href} className="hover:text-[#FFC300]">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p
              className="violet-sun-eyebrow mb-4"
              style={{ color: '#A08CEF' }}
            >
              <Node id="footer.legalLinksLabel" role="body">{f.legalLinksLabel}</Node>
            </p>
            <ul
              className="space-y-2 text-sm"
              style={{ color: 'rgba(230,224,253,0.8)' }}
            >
              {f.legalLinks.map((link, idx) => (
                <li key={`legal-link-${idx}`}>
                  <a href={link.href} className="hover:text-[#FFC300]">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p
              className="violet-sun-eyebrow mb-4"
              style={{ color: '#A08CEF' }}
            >
              <Node id="footer.contactLabel" role="body">{f.contactLabel}</Node>
            </p>
            <ul
              className="space-y-2 text-sm"
              style={{ color: 'rgba(230,224,253,0.8)' }}
            >
              <li><Node id="footer.contactEmail" role="body">{f.contactEmail}</Node></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>
                <Node id="footer.copyright" role="body">{f.copyright}</Node>
              </li>
            </ul>
          </div>
        </div>
        <p
          className="text-xs text-center mt-6"
          style={{ color: 'rgba(197,184,247,0.6)' }}
        >
          <Node id="footer.signoff" role="body">{f.signoff}</Node>
        </p>
      </div>
    </footer>
  );
}
