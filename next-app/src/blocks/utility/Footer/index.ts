export { schema } from './schema'
export { meta } from './meta'
export { Footer as Component } from './Component'

import { globalRegistry } from '@/lib/block-registry'
import { schema } from './schema'
import { meta } from './meta'
import { Footer } from './Component'

globalRegistry.register({ meta, schema, Component: Footer as never })
