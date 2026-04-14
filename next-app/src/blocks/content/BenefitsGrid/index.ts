export { schema } from './schema'
export { meta } from './meta'
export { BenefitsGrid as Component } from './Component'

import { globalRegistry } from '@/lib/block-registry'
import { schema } from './schema'
import { meta } from './meta'
import { BenefitsGrid } from './Component'

globalRegistry.register({ meta, schema, Component: BenefitsGrid as never })
