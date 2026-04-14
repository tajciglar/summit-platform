export { schema } from './schema'
export { meta } from './meta'
export { SpeakerGridDay as Component } from './Component'

import { globalRegistry } from '@/lib/block-registry'
import { schema } from './schema'
import { meta } from './meta'
import { SpeakerGridDay } from './Component'

globalRegistry.register({ meta, schema, Component: SpeakerGridDay as never })
