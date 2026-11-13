/**
 * Version helpers and release discovery for this plugin's own updater.
 *
 * Host-only: the browser half never downloads anything. Everything here is
 * deterministic given a feed document, so it can be tested without network by
 * pointing the feed at a `file:` URL.
 */

import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { createGunzip } from 'node:zlib'

/** Official channel: the repository's latest published GitHub release. */
export const DEFAULT_FEED = 'https://api.github.com/repos/YaoGUanquan/ai-agent-engine-deepseek/releases/latest'

export interface ParsedVersion {
  readonly major: number
  readonly minor: number
  readonly patch: number
  readonly prerelease: readonly (string | number)[]
}

const VERSION = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/

export function parseVersion(input: string): ParsedVersion | undefined {
  const match = VERSION.exec(String(input ?? '').trim())
  if (!match) return undefined
  const prerelease = match[4] === undefined
    ? []
    : match[4].split('.').map(part => /^\d+$/.test(part) ? Number(part) : part)
  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]), prerelease }
}

function comparePrerelease(left: readonly (string | number)[], right: readonly (string | number)[]): number {
  if (left.length === 0 && right.length === 0) return 0
  // A release sorts above any prerelease of the same numbers.
  if (left.length === 0) return 1
  if (right.length === 0) return -1
  const length = Math.max(left.length, right.length)
  for (let index = 0; index < length; index += 1) {
    const a = left[index]
    const b = right[index]
    if (a === undefined) return -1
    if (b === undefined) return 1
    if (a === b) continue
    const aNumeric = typeof a === 'number'
    const bNumeric = typeof b === 'number'
    if (aNumeric && bNumeric) return a > b ? 1 : -1
    // Numeric identifiers always sort below alphanumeric ones.
    if (aNumeric) return -1
    if (bNumeric) return 1
    return String(a) > String(b) ? 1 : -1
  }
  return 0
}

/** Semver precedence, including prerelease ordering and a leading `v`. */
export function compareVersions(left: string, right: string): number {
  const a = parseVersion(left)
  const b = parseVersion(right)
  if (a === undefined || b === undefined) return 0
  if (a.major !== b.major) return a.major > b.major ? 1 : -1
  if (a.minor !== b.minor) return a.minor > b.minor ? 1 : -1
  if (a.patch !== b.patch) return a.patch > b.patch ? 1 : -1
  return comparePrerelease(a.prerelease, b.prerelease)
}

export function releaseVersionOf(tag: string): string {
  return String(tag ?? '').trim().replace(/^v/i, '')
}

export interface ReleaseView {
  readonly version: string
  readonly tag: string
  readonly notes?: string
  readonly pageUrl?: string
  readonly assetUrl?: string
  readonly assetName?: string
  readonly checksumUrl?: string
  readonly publishedAt?: string
}

export type SourceProblem = 'network' | 'invalid-feed' | 'no-release'

export class UpdateSourceError extends Error {
  constructor(readonly problem: SourceProblem, message: string) {
    super(message)
    this.name = 'UpdateSourceError'
  }
}

export interface FeedOptions {
  /** Feed URL; defaults to the official channel. `file:` URLs read a local document. */
  readonly feed?: string
  readonly timeoutMs?: number
  readonly userAgent?: string
  /** The package whose exact versioned release asset may be installed. */
  readonly pluginName?: string
  /** Injection seam for tests and proxies. */
  readonly fetchImpl?: typeof fetch
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value : undefined
}

function assetUrlOf(asset: Record<string, unknown>): string | undefined {
  return text(asset.browser_download_url) ?? text(asset.url)
}

/** npm pack's filename for an exact package identity (including scoped names). */
export function releaseAssetName(pluginName: string, version: string): string {
  return `${pluginName.replace(/^@/, '').replace(/\//g, '-')}-${version}.tgz`
}

/** Normalize a GitHub release document, or a hand-written `{ version, assets }` one. */
export function normalizeRelease(payload: unknown, pluginName = 'ai-agent-engine-deepseek'): ReleaseView {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new UpdateSourceError('invalid-feed', 'The update feed did not return a release object.')
  }
  const record = payload as Record<string, unknown>
  const tag = text(record.tag_name) ?? (text(record.version) === undefined ? undefined : `v${text(record.version)}`)
  if (tag === undefined) {
    throw new UpdateSourceError('invalid-feed', 'The update feed entry has no tag_name or version.')
  }
  const version = releaseVersionOf(tag)
  if (parseVersion(version) === undefined) {
    throw new UpdateSourceError('invalid-feed', `The update feed version "${version}" is not a semantic version.`)
  }
  const assets = Array.isArray(record.assets) ? record.assets.filter(asset => asset !== null && typeof asset === 'object') : []
  const expectedName = releaseAssetName(pluginName, version)
  const tarball = assets
    .map(asset => asset as Record<string, unknown>)
    .find(asset => text(asset.name) === expectedName && assetUrlOf(asset) !== undefined)
  const checksum = assets
    .map(asset => asset as Record<string, unknown>)
    .find(asset => text(asset.name) === 'SHA256SUMS.txt' && assetUrlOf(asset) !== undefined)
  const notes = text(record.body) ?? text(record.notes)
  return {
    version,
    tag,
    ...notes === undefined ? {} : { notes: notes.length > 4000 ? `${notes.slice(0, 4000)}…` : notes },
    ...text(record.html_url) === undefined ? {} : { pageUrl: text(record.html_url) },
    ...tarball === undefined ? {} : {
      assetUrl: assetUrlOf(tarball),
      assetName: text(tarball.name),
    },
    ...checksum === undefined ? {} : { checksumUrl: assetUrlOf(checksum) },
    ...text(record.published_at) === undefined ? {} : { publishedAt: text(record.published_at) },
  }
}

async function readFeed(feed: string, options: FeedOptions): Promise<string> {
  if (feed.startsWith('file:')) {
    try {
      return await readFile(new URL(feed), 'utf8')
    } catch (error) {
      throw new UpdateSourceError('network', `The update feed could not be read: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  const call = options.fetchImpl ?? fetch
  let response: Response
  try {
    response = await call(feed, {
      headers: { accept: 'application/vnd.github+json', 'user-agent': options.userAgent ?? 'ai-agent-engine-deepseek' },
      signal: AbortSignal.timeout(options.timeoutMs ?? 15000),
    })
  } catch (error) {
    throw new UpdateSourceError('network', `The update feed is unreachable: ${error instanceof Error ? error.message : String(error)}`)
  }
  if (!response.ok) {
    throw new UpdateSourceError('network', `The update feed answered HTTP ${response.status}.`)
  }
  return await response.text()
}

/** Read the latest published release from the configured feed. */
export async function fetchLatestRelease(options: FeedOptions = {}): Promise<ReleaseView> {
  const feed = options.feed?.trim() || DEFAULT_FEED
  const document = await readFeed(feed, options)
  let payload: unknown
  try {
    payload = JSON.parse(document)
  } catch {
    throw new UpdateSourceError('invalid-feed', 'The update feed did not return JSON.')
  }
  return normalizeRelease(payload, options.pluginName)
}

/** An exact, unambiguous named SHA256SUMS entry; unrelated/bare digests never authorize an asset. */
export function parseChecksum(document: string, fileName: string): string | undefined {
  const matches: string[] = []
  for (const line of String(document ?? '').split(/\r?\n/)) {
    const match = /^([a-fA-F0-9]{64})\s+\*?(.+?)\s*$/.exec(line.trim())
    if (match !== null && match[2] === fileName) matches.push(match[1].toLowerCase())
  }
  return matches.length === 1 ? matches[0] : undefined
}

/** Read the manifest without extracting files or executing package code. */
export async function readPackageIdentity(path: string): Promise<{ name: string; version: string }> {
  const input = createReadStream(path)
  const archive = input.pipe(createGunzip())
  input.on('error', error => archive.destroy(error))
  let buffer = Buffer.alloc(0)
  let remaining = 0
  let size = 0
  let entryPath = ''
  let kind = ''
  let pieces: Buffer[] = []
  let manifest: { name: string; version: string } | undefined
  let nextPath: string | undefined
  let nextSize: number | undefined
  let ended = false
  let total = 0
  const invalid = (): never => { throw new Error('The release tarball has an invalid or ambiguous package manifest.') }
  const field = (header: Buffer, start: number, length: number): string =>
    header.subarray(start, start + length).toString('utf8').replace(/\0.*$/s, '')
  const octal = (value: string): number => /^[0-7]+$/.test(value.trim()) ? Number.parseInt(value.trim(), 8) : invalid()
  try {
    for await (const chunk of archive) {
      total += (chunk as Buffer).length
      if (total > 256 * 1024 * 1024) invalid()
      buffer = Buffer.concat([buffer, chunk as Buffer])
      while (buffer.length > 0) {
        if (ended) {
          if (buffer.some(byte => byte !== 0)) invalid()
          buffer = Buffer.alloc(0)
          break
        }
        if (remaining === 0) {
          if (buffer.length < 512) break
          const header = buffer.subarray(0, 512)
          buffer = buffer.subarray(512)
          if (header.every(byte => byte === 0)) { ended = true; continue }
          const checksum = octal(field(header, 148, 8))
          let sum = 0
          for (let index = 0; index < 512; index += 1) sum += index >= 148 && index < 156 ? 32 : header[index]!
          if (sum !== checksum) invalid()
          kind = field(header, 156, 1)
          // Global PAX metadata can change later identities. Our npm release assets don't need it.
          if (kind === 'g' || kind === 'K') invalid()
          const name = field(header, 0, 100)
          const prefix = field(header, 345, 155)
          entryPath = nextPath ?? (prefix ? `${prefix}/${name}` : name)
          // Never let an extractor normalize another entry into the manifest (or follow an alias).
          const segments = entryPath.replace(/\/$/, '').split('/')
          if (entryPath.includes('\\') || segments.some(part => part === '' || part === '.' || part === '..'
            || part.endsWith('.') || part.trim() !== part || part.includes(':'))
            || kind === '1' || kind === '2'
            || ((kind !== 'x' && kind !== 'L') && segments[0] !== 'package')
            || ((kind === '' || kind === '0') && entryPath.endsWith('/'))
            || (entryPath.toLowerCase() === 'package/package.json' && entryPath !== 'package/package.json')) invalid()
          size = nextSize ?? octal(field(header, 124, 12))
          nextPath = undefined
          nextSize = undefined
          if (!Number.isSafeInteger(size) || size < 0) invalid()
          if ((entryPath === 'package/package.json' || kind === 'x' || kind === 'L') && size > 1024 * 1024) invalid()
          remaining = Math.ceil(size / 512) * 512
          pieces = []
          if (remaining === 0) continue
        }
        const take = Math.min(buffer.length, remaining)
        const consumed = Math.ceil(size / 512) * 512 - remaining
        if (entryPath === 'package/package.json' || kind === 'x' || kind === 'L') {
          const contentBytes = Math.min(take, Math.max(0, size - consumed))
          if (contentBytes > 0) pieces.push(Buffer.from(buffer.subarray(0, contentBytes)))
        }
        buffer = buffer.subarray(take)
        remaining -= take
        if (remaining !== 0) continue
        const content = Buffer.concat(pieces)
        if (kind === 'L') {
          nextPath = content.toString('utf8').replace(/\0.*$/s, '')
        } else if (kind === 'x') {
          // PAX record lengths count bytes, not characters.
          for (let offset = 0; offset < content.length;) {
            const space = content.indexOf(32, offset)
            if (space < 0) invalid()
            const lengthText = content.subarray(offset, space).toString('ascii')
            const length = /^\d+$/.test(lengthText) ? Number(lengthText) : 0
            if (length <= space - offset + 1 || offset + length > content.length || content[offset + length - 1] !== 10) invalid()
            const record = content.subarray(space + 1, offset + length - 1).toString('utf8')
            const equals = record.indexOf('=')
            const key = record.slice(0, equals)
            const value = record.slice(equals + 1)
            if (key === 'path') nextPath = value
            if (key === 'size') {
              if (!/^\d+$/.test(value)) invalid()
              nextSize = Number(value)
            }
            offset += length
          }
        } else if (entryPath === 'package/package.json') {
          if ((kind !== '' && kind !== '0') || manifest !== undefined) invalid()
          const value: unknown = JSON.parse(content.toString('utf8'))
          if (value === null || typeof value !== 'object' || Array.isArray(value)) invalid()
          const record = value as Record<string, unknown>
          if (typeof record.name !== 'string' || typeof record.version !== 'string') invalid()
          manifest = { name: record.name as string, version: record.version as string }
        }
      }
    }
    if (!ended || remaining !== 0 || manifest === undefined) return invalid()
    return manifest
  } finally {
    input.destroy()
    archive.destroy()
  }
}

export async function sha256File(path: string): Promise<string> {
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(path)) hash.update(chunk as Buffer)
  return hash.digest('hex')
}
