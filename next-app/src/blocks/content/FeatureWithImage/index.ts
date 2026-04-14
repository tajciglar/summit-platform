export { schema } from './schema'
export { meta } from './meta'
export { FeatureWithImage as Component } from './Component'

import { globalRegistry } from '@/lib/block-registry'
import { schema } from './schema'
import { meta } from './meta'
import { FeatureWithImage } from './Component'

globalRegistry.register({ meta, schema, Component: FeatureWithImage as never })
