import { describe, it, expect } from 'vitest'
import { parseEnvelope, type Envelope } from './envelope'

describe('parseEnvelope', () => {
  const valid: Envelope = {
    schema_ts: 'export const schema = {}',
    meta_ts: 'export const meta = {}',
    component_tsx: 'export function Block() { return null }',
    index_ts: 'export { }',
  }

  it('parses raw JSON', () => {
    expect(parseEnvelope(JSON.stringify(valid))).toEqual(valid)
  })

  it('strips leading ```json fence', () => {
    const wrapped = '```json\n' + JSON.stringify(valid) + '\n```'
    expect(parseEnvelope(wrapped)).toEqual(valid)
  })

  it('strips leading ``` fence without language tag', () => {
    const wrapped = '```\n' + JSON.stringify(valid) + '\n```'
    expect(parseEnvelope(wrapped)).toEqual(valid)
  })

  it('trims surrounding whitespace', () => {
    expect(parseEnvelope('   ' + JSON.stringify(valid) + '   ')).toEqual(valid)
  })

  it('throws on invalid JSON', () => {
    expect(() => parseEnvelope('not json')).toThrow(/invalid json/i)
  })

  it('throws when a required field is missing', () => {
    const { schema_ts, ...partial } = valid
    expect(() => parseEnvelope(JSON.stringify(partial))).toThrow(/missing.*schema_ts/i)
  })

  it('throws when a field is not a string', () => {
    expect(() => parseEnvelope(JSON.stringify({ ...valid, schema_ts: 42 }))).toThrow(/schema_ts.*string/i)
  })
})
