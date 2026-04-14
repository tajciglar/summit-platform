export { schema } from './schema'
export { meta } from './meta'
export { SocialProofBadge as Component } from './Component'

import { globalRegistry } from '@/lib/block-registry'
import { schema } from './schema'
import { meta } from './meta'
import { SocialProofBadge } from './Component'

globalRegistry.register({ meta, schema, Component: SocialProofBadge as never })
