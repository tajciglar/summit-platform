export { schema } from './schema'
export { meta } from './meta'
export { FAQAccordion as Component } from './Component'

import { globalRegistry } from '@/lib/block-registry'
import { schema } from './schema'
import { meta } from './meta'
import { FAQAccordion } from './Component'

globalRegistry.register({ meta, schema, Component: FAQAccordion as never })
