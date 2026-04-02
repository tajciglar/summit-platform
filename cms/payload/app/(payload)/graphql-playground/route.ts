/**
 * Payload GraphQL Playground Route Handler
 *
 * Serves the interactive GraphQL Playground UI at `/graphql-playground`.
 * Useful for exploring the auto-generated GraphQL schema during development.
 *
 * The playground is accessible in development only; disable or restrict
 * access in production environments as appropriate.
 */
import { GRAPHQL_PLAYGROUND_GET } from '@payloadcms/next/routes'

export { GRAPHQL_PLAYGROUND_GET as GET }
