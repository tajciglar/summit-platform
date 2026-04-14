export { schema } from './schema'
export { meta } from './meta'
export { HeroWithCountdown as Component } from './Component'

import { globalRegistry } from '@/lib/block-registry'
import { schema } from './schema'
import { meta } from './meta'
import { HeroWithCountdown } from './Component'

globalRegistry.register({ meta, schema, Component: HeroWithCountdown as never })
