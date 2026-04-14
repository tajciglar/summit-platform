export { schema } from './schema'
export { meta } from './meta'
export { LogoStripCarousel as Component } from './Component'

import { globalRegistry } from '@/lib/block-registry'
import { schema } from './schema'
import { meta } from './meta'
import { LogoStripCarousel } from './Component'

globalRegistry.register({ meta, schema, Component: LogoStripCarousel as never })
