// lucide-react is loaded via createRequire from a pre-built CJS bundle
// (see scripts/lucide-bundle-entry.ts + `pnpm build:lucide`). This bypasses
// Turbopack's RSC analysis — direct `import * as Lucide from 'lucide-react'`
// would otherwise be replaced with client references and crash renderToString.
// @base-ui packages are handled via serverExternalPackages in next.config.ts,
// which works for them because Next 16 doesn't auto-transpile them; lucide
// IS auto-transpiled, so it can't go in serverExternalPackages and needs the
// runtime require dance instead.
import { createRequire } from 'node:module';
import path from 'node:path';
import * as Accordion from '@/components/ui/accordion';
import * as Button from '@/components/ui/button';
import * as Card from '@/components/ui/card';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import * as Separator from '@/components/ui/separator';
import * as Textarea from '@/components/ui/textarea';

// Resolve from cwd (project root) so the require path stays correct whether
// this module is loaded from the source tree or from a compiled .next chunk.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Lucide = createRequire(import.meta.url)(
  path.join(process.cwd(), 'dist/lucide-bundle.js'),
) as Record<string, unknown>;

const map: Record<string, unknown> = {
  '@/components/ui/accordion': Accordion,
  '@/components/ui/button': Button,
  '@/components/ui/card': Card,
  '@/components/ui/input': Input,
  '@/components/ui/label': Label,
  '@/components/ui/select': Select,
  '@/components/ui/separator': Separator,
  '@/components/ui/textarea': Textarea,
  'lucide-react': Lucide,
};

export function resolveUiPrimitive(id: string): unknown | null {
  return map[id] ?? null;
}
