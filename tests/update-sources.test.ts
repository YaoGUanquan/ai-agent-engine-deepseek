import { describe, expect, it } from 'vitest'
import {
  UpdateSourceError,
  compareVersions,
  normalizeRelease,
  parseChecksum,
  parseVersion,
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

  it('accepts a hand-written version field and rejects a document without one', () => {
    expect(normalizeRelease({ version: '1.0.0', assets: [] }).version).toBe('1.0.0')
    expect(() => normalizeRelease({ name: 'no version' })).toThrow(UpdateSourceError)
    expect(() => normalizeRelease({ tag_name: 'nightly' })).toThrow(UpdateSourceError)
    expect(() => normalizeRelease([])).toThrow(UpdateSourceError)
  })
})

describe('checksum documents', () => {
  const digest = 'a'.repeat(64)
  const other = 'b'.repeat(64)

  it('matches the requested file name', () => {
    const document = `${other}  other.tgz\n${digest}  ai-agent-engine-deepseek-0.2.5.tgz\n`
    expect(parseChecksum(document, 'ai-agent-engine-deepseek-0.2.5.tgz')).toBe(digest)
    expect(parseChecksum(document, 'missing.tgz')).toBe(other)
  })

  it('falls back to the first digest of a single-line document', () => {
    expect(parseChecksum(`${digest}\n`, 'anything.tgz')).toBe(digest)
    expect(parseChecksum('not a digest', 'anything.tgz')).toBeUndefined()
  })
})
