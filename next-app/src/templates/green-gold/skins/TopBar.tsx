import { Node } from '../../shared/Node';
import type { GreenGoldContent } from '../../green-gold.schema';

type Props = { content: GreenGoldContent };

export function TopBar({ content }: Props) {
  return (
    <div
      className="sticky top-0 z-50 text-white py-4 px-4 shadow-lg"
      style={{ background: '#15803D' }}>

      <div className="max-w-6xl mx-auto flex items-center justify-center">
        <span className="green-gold-heading font-bold text-lg md:text-xl tracking-tight">
          <Node id="topBar.title" role="body">{content.topBar.title}</Node>
        </span>
      </div>
    </div>);

}
