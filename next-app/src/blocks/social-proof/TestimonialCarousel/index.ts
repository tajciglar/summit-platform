export { schema } from './schema'
export { meta } from './meta'
export { TestimonialCarousel as Component } from './Component'

import { globalRegistry } from '@/lib/block-registry'
import { schema } from './schema'
import { meta } from './meta'
import { TestimonialCarousel } from './Component'

globalRegistry.register({ meta, schema, Component: TestimonialCarousel as never })
