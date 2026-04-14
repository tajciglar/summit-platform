export { schema } from './schema'
export { meta } from './meta'
export { VideoTestimonialSection as Component } from './Component'

import { globalRegistry } from '@/lib/block-registry'
import { schema } from './schema'
import { meta } from './meta'
import { VideoTestimonialSection } from './Component'

globalRegistry.register({ meta, schema, Component: VideoTestimonialSection as never })
