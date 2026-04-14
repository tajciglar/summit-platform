export { schema } from './schema'
export { meta } from './meta'
export { WhyThisMattersStats as Component } from './Component'

import { globalRegistry } from '@/lib/block-registry'
import { schema } from './schema'
import { meta } from './meta'
import { WhyThisMattersStats } from './Component'

globalRegistry.register({ meta, schema, Component: WhyThisMattersStats as never })
