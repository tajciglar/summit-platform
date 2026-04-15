import * as Accordion from '@/components/ui/accordion';
import * as Button from '@/components/ui/button';
import * as Card from '@/components/ui/card';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import * as Separator from '@/components/ui/separator';
import * as Textarea from '@/components/ui/textarea';
import * as Lucide from 'lucide-react';

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
