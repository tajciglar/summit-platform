export { schema } from './schema';
export { meta } from './meta';
export { StickyCountdownBar as Component } from './Component';

import { globalRegistry } from '@/lib/block-registry';
import { schema } from './schema';
import { meta } from './meta';
import { StickyCountdownBar } from './Component';

globalRegistry.register({ meta, schema, Component: StickyCountdownBar as never });
