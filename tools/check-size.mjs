import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { gzipSync } from 'node:zlib'

const directory = process.env.AE_BUILD_OUTDIR || 'lib'
const client = await readFile(resolve(directory, 'client.js'))
const gzipBytes = gzipSync(client).length
assert.ok(client.length <= 320_000, `Client bundle exceeds 320000 bytes: ${client.length}`)
assert.ok(gzipBytes <= 60_000, `Gzipped client bundle exceeds 60000 bytes: ${gzipBytes}`)
console.log(`Client size budget: ${client.length} bytes; gzip ${gzipBytes} bytes.`)
