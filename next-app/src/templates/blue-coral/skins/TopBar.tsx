import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';

type Props = {
  content: SectionContentMap['top-bar'];
};

export function TopBar({ content }: Props) {
  return (
    <div
      className="sticky top-0 z-50 text-white py-4 px-4 shadow-lg"
      style={{ background: '#1D4ED8' }}>

      <div className="max-w-6xl mx-auto flex items-center justify-center">
        <span className="blue-coral-heading font-bold text-lg md:text-xl tracking-tight">
          <Node id="topBar.title" role="body">{content.title}</Node>
        </span>
      </div>
    </div>);

}
