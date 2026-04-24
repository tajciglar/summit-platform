import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { LAV } from './shared';

type Props = { content: SectionContentMap['top-bar'] };

export function TopBar({ content }: Props) {
  return (
    <div
      className="w-full text-center text-white text-xs md:text-sm font-semibold py-2.5"
      style={{
        background: `linear-gradient(90deg,${LAV.c700},${LAV.c600},${LAV.c700})`,
        letterSpacing: '0.18em',
      }}
    >
      <Node id="topBar.name" role="body">{content.name}</Node>
    </div>
  );
}
