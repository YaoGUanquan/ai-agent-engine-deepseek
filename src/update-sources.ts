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
  /** Injection seam for tests and proxies. */
  readonly fetchImpl?: typeof fetch
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value : undefined
}

function assetUrlOf(asset: Record<string, unknown>): string | undefined {
  return text(asset.browser_download_url) ?? text(asset.url)
}

const TARBALL = /^ai-agent-engine-deepseek-.*\.tgz$/i

/** Normalize a GitHub release document, or a hand-written `{ version, assets }` one. */
export function normalizeRelease(payload: unknown): ReleaseView {
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
  const tarball = assets
    .map(asset => asset as Record<string, unknown>)
    .filter(asset => (text(asset.name) ?? '').endsWith('.tgz'))
    .sort((left, right) => Number(TARBALL.test(text(right.name) ?? '')) - Number(TARBALL.test(text(left.name) ?? '')))[0]
  const checksum = assets
    .map(asset => asset as Record<string, unknown>)
    .find(asset => /sha256/i.test(text(asset.name) ?? ''))
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
  return normalizeRelease(payload)
}

/** Extract the checksum line for one asset from a `SHA256SUMS` document. */
export function parseChecksum(document: string, fileName: string): string | undefined {
  for (const line of String(document ?? '').split(/\r?\n/)) {
    const match = /^([a-fA-F0-9]{64})\s+\*?(.+?)\s*$/.exec(line.trim())
    if (match !== null && match[2] === fileName) return match[1].toLowerCase()
  }
  const single = /^([a-fA-F0-9]{64})\b/.exec(String(document ?? '').trim())
  return single?.[1].toLowerCase()
}

export async function sha256File(path: string): Promise<string> {
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(path)) hash.update(chunk as Buffer)
  return hash.digest('hex')
}
