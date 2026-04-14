export { schema } from './schema'
export { meta } from './meta'
export { BonusStack as Component } from './Component'

import { globalRegistry } from '@/lib/block-registry'
import { schema } from './schema'
import { meta } from './meta'
import { BonusStack } from './Component'

globalRegistry.register({ meta, schema, Component: BonusStack as never })
