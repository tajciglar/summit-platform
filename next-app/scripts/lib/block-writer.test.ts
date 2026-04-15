import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, rmSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { writeBlock } from './block-writer'

describe('writeBlock', () => {
  let tmp: string

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), 'block-writer-test-'))
  })

  afterEach(() => {
    rmSync(tmp, { recursive: true, force: true })
  })

  const envelope = {
    schema_ts: 'schema',
    meta_ts: 'meta',
    component_tsx: 'component',
    index_ts: 'index',
  }

  it('writes all 4 files into a new directory', () => {
    writeBlock({ dir: join(tmp, 'FAQ'), envelope, force: false })
    expect(readFileSync(join(tmp, 'FAQ/schema.ts'), 'utf-8')).toBe('schema')
    expect(readFileSync(join(tmp, 'FAQ/meta.ts'), 'utf-8')).toBe('meta')
    expect(readFileSync(join(tmp, 'FAQ/Component.tsx'), 'utf-8')).toBe('component')
    expect(readFileSync(join(tmp, 'FAQ/index.ts'), 'utf-8')).toBe('index')
  })

  it('refuses to overwrite an existing non-empty block directory', () => {
    const dir = join(tmp, 'FAQ')
    mkdirSync(dir)
    writeFileSync(join(dir, 'schema.ts'), 'existing')
    expect(() => writeBlock({ dir, envelope, force: false })).toThrow(/already exists/i)
    expect(readFileSync(join(dir, 'schema.ts'), 'utf-8')).toBe('existing')
  })

  it('overwrites when force is true', () => {
    const dir = join(tmp, 'FAQ')
    mkdirSync(dir)
    writeFileSync(join(dir, 'schema.ts'), 'existing')
    writeBlock({ dir, envelope, force: true })
    expect(readFileSync(join(dir, 'schema.ts'), 'utf-8')).toBe('schema')
  })

  it('creates the parent directory if it does not exist', () => {
    const dir = join(tmp, 'nested/deep/FAQ')
    writeBlock({ dir, envelope, force: false })
    expect(existsSync(join(dir, 'schema.ts'))).toBe(true)
  })
})
