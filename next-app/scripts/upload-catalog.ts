#!/usr/bin/env -S tsx
/**
 * Uploads public/block-catalog.json to Bunny storage, purges the edge cache,
 * then pings Laravel's /api/admin/catalog/refresh webhook so the server-side
 * cache invalidates immediately instead of waiting for TTL.
 *
 * Required env (fails fast if missing):
 *   BUNNY_STORAGE_ZONE        — storage zone name
 *   BUNNY_STORAGE_ACCESS_KEY  — storage-scoped password
 *   BUNNY_HOSTNAME            — pull-zone hostname (e.g. summit-catalog.b-cdn.net)
 *   LARAVEL_API_URL           — base URL of the Laravel backend
 *   CATALOG_REFRESH_TOKEN     — bearer token matching CATALOG_REFRESH_TOKEN on Laravel
 *
 * Optional:
 *   BUNNY_API_KEY             — account-level API key for purge (skipped if absent)
 *   CATALOG_REMOTE_PATH       — override remote path (defaults to block-catalog/current.json)
 */
import { readFileSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const catalogPath = join(here, '..', 'public', 'block-catalog.json')

function required(name: string): string {
  const v = process.env[name]
  if (!v || v.trim() === '') {
    console.error(`✗ Missing required env: ${name}`)
    process.exit(1)
  }
  return v
}

const storageZone = required('BUNNY_STORAGE_ZONE')
const accessKey = required('BUNNY_STORAGE_ACCESS_KEY')
const hostname = required('BUNNY_HOSTNAME')
const laravelUrl = required('LARAVEL_API_URL').replace(/\/$/, '')
const refreshToken = required('CATALOG_REFRESH_TOKEN')

const remotePath = process.env.CATALOG_REMOTE_PATH ?? 'block-catalog/current.json'
const bunnyApiKey = process.env.BUNNY_API_KEY

async function uploadToBunny(): Promise<void> {
  const body = readFileSync(catalogPath)
  const size = statSync(catalogPath).size
  const url = `https://storage.bunnycdn.com/${storageZone}/${remotePath}`

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      AccessKey: accessKey,
      'Content-Type': 'application/json',
    },
    body,
  })

  if (!res.ok) {
    console.error(`✗ Bunny upload failed: ${res.status} ${res.statusText}\n${await res.text()}`)
    process.exit(1)
  }
  console.log(`✓ Uploaded ${size} bytes → ${remotePath}`)
}

async function purgeBunnyEdge(): Promise<void> {
  if (!bunnyApiKey) {
    console.log('— Skipping edge purge (BUNNY_API_KEY not set)')
    return
  }
  const cdnUrl = `https://${hostname}/${remotePath}`
  const res = await fetch(
    `https://api.bunny.net/pullzone/purge?url=${encodeURIComponent(cdnUrl)}`,
    {
      method: 'POST',
      headers: { AccessKey: bunnyApiKey },
    },
  )
  if (!res.ok) {
    console.warn(`! Edge purge returned ${res.status} — continuing (Laravel refresh will still work)`)
    return
  }
  console.log(`✓ Edge cache purged for ${cdnUrl}`)
}

async function pingLaravel(): Promise<void> {
  const res = await fetch(`${laravelUrl}/api/admin/catalog/refresh`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${refreshToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })
  if (!res.ok) {
    console.error(`✗ Laravel refresh failed: ${res.status} ${res.statusText}\n${await res.text()}`)
    process.exit(1)
  }
  console.log('✓ Laravel catalog cache invalidated')
}

async function main(): Promise<void> {
  await uploadToBunny()
  await purgeBunnyEdge()
  await pingLaravel()
}

main().catch((err) => {
  console.error('✗ Unexpected error:', err)
  process.exit(1)
})
