import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';

type Props = {
  content: SectionContentMap['top-bar'];
};

export function TopBar({ content }: Props) {
  return (
    <div className="sticky top-0 z-50 py-4 px-4 shadow-lg" style={{ backgroundColor: '#3D2B1F' }}>
      <div className="max-w-6xl mx-auto flex items-center justify-center">
        <span className="rust-cream-heading font-bold text-lg md:text-xl tracking-tight text-white">
          <Node id="topBar.name" role="body">{content.name}</Node>
        </span>
      </div>
    </div>
  );
}
