export { schema } from './schema'
export { meta } from './meta'
export { StatsBar3Item as Component } from './Component'

import { globalRegistry } from '@/lib/block-registry'
import { schema } from './schema'
import { meta } from './meta'
import { StatsBar3Item } from './Component'

globalRegistry.register({ meta, schema, Component: StatsBar3Item as never })
