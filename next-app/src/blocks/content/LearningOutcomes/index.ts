export { schema } from './schema'
export { meta } from './meta'
export { LearningOutcomes as Component } from './Component'

import { globalRegistry } from '@/lib/block-registry'
import { schema } from './schema'
import { meta } from './meta'
import { LearningOutcomes } from './Component'

globalRegistry.register({ meta, schema, Component: LearningOutcomes as never })
