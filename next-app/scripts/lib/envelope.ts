export type Envelope = {
  schema_ts: string
  meta_ts: string
  component_tsx: string
  index_ts: string
}

const REQUIRED_FIELDS = ['schema_ts', 'meta_ts', 'component_tsx', 'index_ts'] as const

export function parseEnvelope(raw: string): Envelope {
  const cleaned = raw
    .replace(/^\s*```json\s*/i, '')
    .replace(/^\s*```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()

  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch (err) {
    throw new Error(`invalid JSON envelope: ${err instanceof Error ? err.message : err}`)
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('envelope must be a JSON object')
  }

  const obj = parsed as Record<string, unknown>
  for (const field of REQUIRED_FIELDS) {
    if (!(field in obj)) {
      throw new Error(`envelope missing required field: ${field}`)
    }
    if (typeof obj[field] !== 'string') {
      throw new Error(`envelope field ${field} must be a string`)
    }
  }

  return {
    schema_ts: obj.schema_ts as string,
    meta_ts: obj.meta_ts as string,
    component_tsx: obj.component_tsx as string,
    index_ts: obj.index_ts as string,
  }
}
