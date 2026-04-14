export { schema } from './schema'
export { meta } from './meta'
export { NumberedReasons as Component } from './Component'

import { globalRegistry } from '@/lib/block-registry'
import { schema } from './schema'
import { meta } from './meta'
import { NumberedReasons } from './Component'

globalRegistry.register({ meta, schema, Component: NumberedReasons as never })
