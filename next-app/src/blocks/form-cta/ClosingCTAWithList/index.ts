export { schema } from './schema'
export { meta } from './meta'
export { ClosingCTAWithList as Component } from './Component'

import { globalRegistry } from '@/lib/block-registry'
import { schema } from './schema'
import { meta } from './meta'
import { ClosingCTAWithList } from './Component'

globalRegistry.register({ meta, schema, Component: ClosingCTAWithList as never })
