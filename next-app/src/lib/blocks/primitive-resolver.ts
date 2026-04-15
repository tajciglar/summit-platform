// @base-ui packages are handled via serverExternalPackages in
// next.config.ts so their components reach renderToString as real
// invokable functions instead of RSC client references.
// lucide-react is NOT exposed here — Next 16 strips React in Server
// Components (no createContext), which means lucide's icon factories
// crash at first render. The design prompt instructs Gemini to inline
// SVGs instead, and the validator rejects lucide imports outright.
import * as Accordion from '@/components/ui/accordion';
import * as Button from '@/components/ui/button';
import * as Card from '@/components/ui/card';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import * as Separator from '@/components/ui/separator';
import * as Textarea from '@/components/ui/textarea';

const map: Record<string, unknown> = {
  '@/components/ui/accordion': Accordion,
  '@/components/ui/button': Button,
  '@/components/ui/card': Card,
  '@/components/ui/input': Input,
  '@/components/ui/label': Label,
  '@/components/ui/select': Select,
  '@/components/ui/separator': Separator,
  '@/components/ui/textarea': Textarea,
};

export function resolveUiPrimitive(id: string): unknown | null {
  return map[id] ?? null;
}
