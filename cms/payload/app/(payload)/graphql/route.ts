/**
 * Payload GraphQL API Route Handler
 *
 * Mounts the Payload GraphQL endpoint at `/graphql`.
 * Handles POST requests containing GraphQL queries/mutations.
 *
 * For the interactive GraphQL Playground UI, see the `/graphql-playground`
 * route handler.
 */
import { GRAPHQL_PLAYGROUND_GET } from '@payloadcms/next/routes'

export { GRAPHQL_PLAYGROUND_GET as GET }
