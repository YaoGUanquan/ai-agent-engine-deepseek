import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import {
  UpdateSourceError,
  compareVersions,
  normalizeRelease,
  parseChecksum,
  parseVersion,
  readPackageIdentity,
  releaseVersionOf,
} from '../src/update-sources.ts'

describe('version precedence', () => {
  it('orders numeric parts, prereleases and release builds like semver', () => {
    expect(compareVersions('0.2.2-rc.1', '0.2.1-rc.5')).toBe(1)
    expect(compareVersions('1.0.0', '0.9.9')).toBe(1)
    expect(compareVersions('0.2.1', '0.2.1-rc.5')).toBe(1)
    expect(compareVersions('0.2.1-rc.5', '0.2.1')).toBe(-1)
    expect(compareVersions('v0.2.1-rc.5', '0.2.1-rc.5')).toBe(0)
    expect(compareVersions('0.2.1-rc.10', '0.2.1-rc.9')).toBe(1)
    expect(compareVersions('0.2.1-rc.5', '0.2.1-rc.5.1')).toBe(-1)
  })

  it('treats an unparsable side as equal instead of inventing an order', () => {
    expect(compareVersions('next', '0.2.1')).toBe(0)
    expect(parseVersion('0.2.1-rc.5+build.7')).toMatchObject({ major: 0, minor: 2, patch: 1 })
    expect(parseVersion('release')).toBeUndefined()
  })

  it('strips the release tag prefix', () => {
    expect(releaseVersionOf('v0.2.4')).toBe('0.2.4')
    expect(releaseVersionOf('0.2.4')).toBe('0.2.4')
  })
})

describe('release documents', () => {
  it('picks the tarball and checksum assets from a GitHub release', () => {
    const release = normalizeRelease({
      tag_name: 'v0.2.5',
      html_url: 'https://github.com/YaoGUanquan/ai-agent-engine-deepseek/releases/tag/v0.2.5',
      body: 'Update button',
      published_at: '2026-11-06T00:00:00Z',
      assets: [
        { name: 'registry.tgz', browser_download_url: 'https://example.invalid/registry.tgz' },
        { name: 'ai-agent-engine-deepseek-0.2.5.tgz', browser_download_url: 'https://example.invalid/pkg.tgz' },
        { name: 'SHA256SUMS.txt', browser_download_url: 'https://example.invalid/SHA256SUMS.txt' },
      ],
    })
    expect(release.version).toBe('0.2.5')
    expect(release.assetUrl).toBe('https://example.invalid/pkg.tgz')
    expect(release.assetName).toBe('ai-agent-engine-deepseek-0.2.5.tgz')
    expect(release.checksumUrl).toBe('https://example.invalid/SHA256SUMS.txt')
    expect(release.notes).toBe('Update button')
  })

  it('never selects another package or another version as a fallback', () => {
    const release = normalizeRelease({
      tag_name: 'v0.2.5',
      assets: [
        { name: 'other-plugin-0.2.5.tgz', browser_download_url: 'https://example.invalid/other.tgz' },
        { name: 'ai-agent-engine-deepseek-0.2.4.tgz', browser_download_url: 'https://example.invalid/old.tgz' },
        { name: 'SHA256SUMS.txt', browser_download_url: 'https://example.invalid/sums' },
      ],
    })
    expect(release.assetUrl).toBeUndefined()
    expect(release.assetName).toBeUndefined()
  })

  it('binds a configured plugin name to the exact release asset', () => {
    const release = normalizeRelease({ version: '1.2.3', assets: [
      { name: 'ai-agent-engine-deepseek-1.2.3.tgz', browser_download_url: 'https://example.invalid/wrong' },
      { name: 'scope-plugin-1.2.3.tgz', browser_download_url: 'https://example.invalid/right' },
    ] }, '@scope/plugin')
    expect(release.assetUrl).toBe('https://example.invalid/right')
  })

  it('accepts a hand-written version field and rejects a document without one', () => {
    expect(normalizeRelease({ version: '1.0.0', assets: [] }).version).toBe('1.0.0')
    expect(() => normalizeRelease({ name: 'no version' })).toThrow(UpdateSourceError)
    expect(() => normalizeRelease({ tag_name: 'nightly' })).toThrow(UpdateSourceError)
    expect(() => normalizeRelease([])).toThrow(UpdateSourceError)
  })
})

function tarEntry(name: string, content: string, kind = '0'): Buffer {
  const bytes = Buffer.from(content)
  const header = Buffer.alloc(512)
  header.write(name, 0)
  header.write('0000644\0', 100)
  header.write('0000000\0', 108)
  header.write('0000000\0', 116)
  header.write(`${bytes.length.toString(8).padStart(11, '0')}\0`, 124)
  header.write('00000000000\0', 136)
  header.fill(32, 148, 156)
  header.write(kind, 156)
  header.write('ustar\0', 257)
  header.write('00', 263)
  header.write(`${header.reduce((sum, byte) => sum + byte, 0).toString(8).padStart(6, '0')}\0 `, 148)
  return Buffer.concat([header, bytes, Buffer.alloc((512 - bytes.length % 512) % 512)])
}

async function withArchive(entries: Buffer[], run: (path: string) => Promise<void>): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), 'ae-package-identity-'))
  try {
    const file = join(directory, 'package.tgz')
    await writeFile(file, gzipSync(Buffer.concat([...entries, Buffer.alloc(1024)])))
    await run(file)
  } finally { await rm(directory, { recursive: true, force: true }) }
}

describe('package manifest identity', () => {
  const manifest = JSON.stringify({ name: 'ai-agent-engine-deepseek', version: '1.2.3' })

  it('reads a regular npm manifest without extracting any files', async () => {
    await withArchive([tarEntry('package/package.json', manifest)], async file => {
      expect(await readPackageIdentity(file)).toEqual({ name: 'ai-agent-engine-deepseek', version: '1.2.3' })
    })
  })

  it.each(['package/x/../package.json', './package/package.json', 'package\\package.json', 'package//package.json',
    'other/package.json', 'package/Package.json', 'package/package.json.', 'package/package.json/'])('rejects a later normalized manifest alias: %s', async name => {
    await withArchive([tarEntry('package/package.json', manifest), tarEntry(name, JSON.stringify({ name: 'other-plugin', version: '9.9.9' }))], async file => {
      await expect(readPackageIdentity(file)).rejects.toThrow()
    })
  })

  it('rejects duplicate manifests and link entries', async () => {
    await withArchive([tarEntry('package/package.json', manifest), tarEntry('package/package.json', manifest)], async file => {
      await expect(readPackageIdentity(file)).rejects.toThrow()
    })
    await withArchive([tarEntry('package/package.json', manifest), tarEntry('package/alias', '', '2')], async file => {
      await expect(readPackageIdentity(file)).rejects.toThrow()
    })
  })

  it('rejects a PAX path that aliases the manifest through a parent directory', async () => {
    const record = 'path=package/x/../package.json\n'
    let length = Buffer.byteLength(record) + 2
    while (Buffer.byteLength(`${length} ${record}`) !== length) length = Buffer.byteLength(`${length} ${record}`)
    await withArchive([
      tarEntry('package/package.json', manifest), tarEntry('package/pax', `${length} ${record}`, 'x'), tarEntry('package/other', manifest),
    ], async file => { await expect(readPackageIdentity(file)).rejects.toThrow() })
  })

  it('fails closed on archives without a manifest', async () => {
    await withArchive([tarEntry('package/readme.txt', 'no manifest')], async file => {
      await expect(readPackageIdentity(file)).rejects.toThrow()
    })
  })
})

describe('checksum documents', () => {
  const digest = 'a'.repeat(64)
  const other = 'b'.repeat(64)

  it('matches the requested file name', () => {
    const document = `${other}  other.tgz\n${digest}  ai-agent-engine-deepseek-0.2.5.tgz\n`
    expect(parseChecksum(document, 'ai-agent-engine-deepseek-0.2.5.tgz')).toBe(digest)
    expect(parseChecksum(document, 'missing.tgz')).toBeUndefined()
  })

  it('rejects bare, malformed and ambiguous digests instead of authorizing another asset', () => {
    expect(parseChecksum(`${digest}\n`, 'anything.tgz')).toBeUndefined()
    expect(parseChecksum('not a digest', 'anything.tgz')).toBeUndefined()
    expect(parseChecksum(`${digest}  pkg.tgz\n${other}  pkg.tgz`, 'pkg.tgz')).toBeUndefined()
    expect(parseChecksum(`${digest}  pkg.tgz\n${digest}  pkg.tgz`, 'pkg.tgz')).toBeUndefined()
    expect(parseChecksum(`${digest.toUpperCase()} *pkg.tgz\r\n`, 'pkg.tgz')).toBe(digest)
  })
})
