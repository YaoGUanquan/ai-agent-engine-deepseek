import type { Context } from '@deepseek-ai/cordis'
import { Remote, RemoteError, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { execFile } from 'node:child_process'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { mkdir, readFile, realpath, rename, rm, unlink, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type {
  CheckoutUpdateStage,
  RuntimeSupport,
  UpdateInstallResult,
  UpdateBlocked,
  UpdateChannel,
  UpdatePhase,
  UpdateStateView,
} from './update-contract.ts'
import {
  UpdateSourceError,
  compareVersions,
  fetchLatestRelease,
  parseChecksum,
  parseVersion,
  readPackageIdentity,
  releaseAssetName,
  sha256File,
  type ReleaseView,
} from './update-sources.ts'

declare module '@deepseek-ai/cordis' {
  interface Context { aeUpdate: UpdateService }
}

declare module '@deepseek-ai/dsh-typert-protocol' {
  interface RemoteErrorDetailsMap {
    'ae-update/rejected': {}
    'ae-update/unavailable': {}
  }
}

interface PluginManifest {
  name?: string
  version?: string
  engines?: Record<string, string>
  dsh?: { compatibility?: { verifiedThrough?: string; verifiedRuntimes?: readonly string[] } }
}

interface ProfileContextLike {
  dir?: string
  home?: string
  installAnchor?: string
}

interface PluginPackageLike {
  name: string
  version?: string
  dir: string
}

interface PluginPackagesLike {
  packageOf(specifier: string, parentURL: string): PluginPackageLike | undefined
}

interface PluginManagerLike {
  installBundle(spec: string, options?: { saveExact?: boolean; enabled?: boolean }): Promise<unknown>
}

type Artifact = 'node_modules' | 'lib'

interface PendingCheckout {
  schemaVersion: 1
  root: string
  base: string
  branch: string
  target: string
  stage: CheckoutUpdateStage
  activated: Artifact[]
  promoting?: Artifact
}

/** Project only known wire-safe diagnostics, rather than serializing a Host object. */
function installResultOf(value: unknown): UpdateInstallResult {
  if (value === null || typeof value !== 'object') throw new Blocked('install-failed', 'The Host returned no installation outcome.')
  const record = value as Record<string, unknown>
  if (typeof record.changed !== 'boolean' || typeof record.application !== 'string'
    || !['applied', 'restart-required', 'overridden', 'failed', 'cancelled'].includes(record.application)) {
    throw new Blocked('install-failed', 'The Host returned an invalid installation outcome.')
  }
  const error = record.error as Record<string, unknown> | undefined
  const result = record.packageResult as Record<string, unknown> | undefined
  const strings = (items: unknown): string[] | undefined => Array.isArray(items) ? items.filter((item): item is string => typeof item === 'string') : undefined
  return {
    changed: record.changed,
    application: record.application as UpdateInstallResult['application'],
    ...error !== null && typeof error === 'object' && typeof error.code === 'string' ? {
      error: { code: error.code, ...typeof error.diagnostic === 'string' ? { diagnostic: error.diagnostic } : {} },
    } : {},
    ...result !== null && typeof result === 'object' && typeof result.exitCode === 'number'
      && typeof result.output === 'string' && typeof result.truncated === 'boolean' && typeof result.logPath === 'string' ? {
        packageResult: {
          exitCode: result.exitCode, output: result.output, truncated: result.truncated, logPath: result.logPath,
          ...typeof result.kind === 'string' ? { kind: result.kind } : {},
          ...typeof result.timedOut === 'boolean' ? { timedOut: result.timedOut } : {},
        },
      } : {},
    ...strings(record.warnings) === undefined ? {} : { warnings: strings(record.warnings) },
    ...strings(record.pendingBuilds) === undefined ? {} : { pendingBuilds: strings(record.pendingBuilds) },
  }
}

class Blocked extends Error {
  constructor(readonly blocked: UpdateBlocked, message: string) {
    super(message)
    this.name = 'Blocked'
  }
}

const DOWNLOAD_TIMEOUT_MS = 120_000
const GIT_TIMEOUT_MS = 180_000
const PACKAGE_TIMEOUT_MS = 600_000

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function readJson<T>(path: string): T | undefined {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as T
  } catch {
    return undefined
  }
}

function isDirectory(target: string): boolean {
  try {
    return existsSync(target) && statSync(target).isDirectory()
  } catch {
    return false
  }
}

function executable(command: string): string {
  return process.platform === 'win32' ? `${command}.cmd` : command
}

/**
 * Host-owned updater for this plugin.
 *
 * It never edits Harness or another plugin. Two channels are supported: a
 * package install (download the release tarball, then let the Host plugin
 * manager install it) and a git checkout (build an isolated pinned target,
 * fast-forward, then activate whole output/dependency trees). Package installs
 * follow the Host lifecycle; checkout updates require a restart.
 */
export class UpdateService extends TypertRemoteService {
  static inject = ['typert']

  private readonly root: string
  private phase: UpdatePhase = 'idle'
  private message: string | undefined
  private error: string | undefined
  private latest: ReleaseView | undefined
  private checkedAt: number | undefined
  private pendingCommits = 0
  private restartRequired = false
  private blocked: UpdateBlocked | undefined
  private busy = false
  private installResult: UpdateInstallResult | undefined
  private pendingCheckout: PendingCheckout | undefined
  private pendingDirectory: string | undefined
  private pendingLoaded = false
  private pendingLoad: Promise<void> | undefined

  constructor(
    ctx: Context,
    private readonly config: { pluginName: string; feed: string; repository: string; root?: string },
  ) {
    super(ctx, 'aeUpdate')
    this.root = config.root ?? dirname(dirname(fileURLToPath(import.meta.url)))
  }

  private authorize(): void {
    if (this.ctx.invocation?.peer.principal.kind !== 'owner') {
      throw new RemoteError('ae-update/rejected', 'Only the Host owner can update this plugin', {})
    }
  }

  private service<T>(name: string): T | undefined {
    try {
      return (this.ctx as unknown as { get(id: string): unknown }).get(name) as T | undefined
    } catch {
      return undefined
    }
  }

  private profile(): ProfileContextLike {
    return this.service<ProfileContextLike>('profileContext') ?? {}
  }

  private manifestDir(): string {
    const resolved = this.service<PluginPackagesLike>('pluginPackages')?.packageOf(this.config.pluginName, import.meta.url)
    return typeof resolved?.dir === 'string' ? resolved.dir : this.root
  }

  private manifest(): PluginManifest {
    return readJson<PluginManifest>(join(this.manifestDir(), 'package.json')) ?? {}
  }

  private currentVersion(): string {
    return this.manifest().version ?? '0.0.0'
  }

  /** Version of the running Harness runtime, read without importing Host packages. */
  private runtimeVersion(): string | undefined {
    const published = this.service<PluginPackagesLike>('pluginPackages')
      ?.packageOf('@deepseek-ai/dsh-app-boot', import.meta.url)?.version
    if (typeof published === 'string' && parseVersion(published) !== undefined) return published
    const anchor = this.profile().installAnchor
    if (typeof anchor === 'string') {
      const candidate = join(dirname(anchor), 'node_modules', '@deepseek-ai', 'dsh-app-boot', 'package.json')
      const version = readJson<PluginManifest>(candidate)?.version
      if (typeof version === 'string' && parseVersion(version) !== undefined) return version
    }
    return undefined
  }

  private runtimeSupport(): RuntimeSupport {
    const runtime = this.runtimeVersion()
    const compatibility = this.manifest().dsh?.compatibility
    const verified = compatibility?.verifiedThrough
    if (runtime === undefined || verified === undefined) return 'unknown'
    if (Array.isArray(compatibility?.verifiedRuntimes) && compatibility.verifiedRuntimes.some(version =>
      typeof version === 'string' && parseVersion(version) !== undefined && compareVersions(runtime, version) === 0)) return 'verified'
    const order = compareVersions(runtime, verified)
    if (order === 0) return 'verified'
    return order > 0 ? 'untested-newer' : 'untested-older'
  }

  /** The saved profile dependency value for this plugin, shown as the install origin. */
  private installSpec(): string | undefined {
    const directory = this.profile().dir
    if (typeof directory !== 'string') return undefined
    const manifest = readJson<{ dependencies?: Record<string, string> }>(join(directory, 'package.json'))
    const spec = manifest?.dependencies?.[this.config.pluginName]
    return typeof spec === 'string' ? spec : undefined
  }

  private channel(): UpdateChannel {
    return existsSync(join(this.checkoutRoot(), '.git')) ? 'checkout' : 'package'
  }

  private checkoutRoot(): string {
    const spec = this.installSpec()
    if (spec !== undefined && /^link:/i.test(spec)) {
      const profileDir = this.profile().dir
      const path = spec.replace(/^link:/i, '')
      const expanded = path === '~' ? homedir() : /^~[\\/]/.test(path) ? join(homedir(), path.slice(2)) : path
      // A saved dependency is relative to the profile manifest, never the process cwd.
      const target = profileDir === undefined ? undefined : resolve(profileDir, expanded)
      if (target !== undefined && isDirectory(target)) return target
    }
    return this.manifestDir()
  }

  private assertCheckoutIdentity(root: string): void {
    const manifest = readJson<PluginManifest>(join(root, 'package.json'))
    if (manifest?.name !== this.config.pluginName) {
      throw new Blocked('package-identity-mismatch', `The linked checkout is not ${this.config.pluginName}; no Git update was performed.`)
    }
  }

  private cacheRoot(): string {
    const home = this.profile().home ?? process.env.DSH_HOME ?? join(homedir(), '.dsh')
    return join(home, 'cache', 'ai-agent-engine', 'updates')
  }

  private outdated(): boolean {
    return (this.latest !== undefined && compareVersions(this.latest.version, this.currentVersion()) > 0)
      || this.pendingCommits > 0 || this.pendingCheckout !== undefined
  }

  private view(): UpdateStateView {
    const manifest = this.manifest()
    const runtimeVersion = this.runtimeVersion()
    const verifiedThrough = manifest.dsh?.compatibility?.verifiedThrough
    const installSpec = this.installSpec()
    const settled = !['checking', 'downloading', 'installing', 'rebuilding', 'applied'].includes(this.phase)
    const outdated = this.outdated()
    const retryable = this.blocked === undefined || ['install-failed', 'install-cancelled', 'build-failed', 'activation-failed'].includes(this.blocked)
    return {
      pluginName: this.config.pluginName,
      currentVersion: manifest.version ?? '0.0.0',
      ...runtimeVersion === undefined ? {} : { runtimeVersion },
      ...verifiedThrough === undefined ? {} : { verifiedThrough },
      runtimeSupport: this.runtimeSupport(),
      channel: this.channel(),
      ...installSpec === undefined ? {} : { installSpec },
      ...this.latest === undefined ? {} : { latest: { ...this.latest } },
      ...this.pendingCommits === 0 ? {} : { pendingCommits: this.pendingCommits },
      ...this.pendingCheckout === undefined ? {} : { pendingCheckout: { target: this.pendingCheckout.target, stage: this.pendingCheckout.stage } },
      ...this.installResult === undefined ? {} : { installResult: this.installResult },
      outdated,
      canApply: outdated && retryable && !this.busy && !this.restartRequired && settled,
      ...this.blocked === undefined ? {} : { blocked: this.blocked },
      phase: this.phase,
      ...this.message === undefined ? {} : { message: this.message },
      ...this.error === undefined ? {} : { error: this.error },
      restartRequired: this.restartRequired,
      ...this.checkedAt === undefined ? {} : { checkedAt: this.checkedAt },
    }
  }

  @Remote('getState')
  async getState(_request: Record<string, never> = {}): Promise<UpdateStateView> {
    this.authorize()
    try { await this.loadPendingCheckout() } catch (error) {
      this.phase = 'failed'
      this.blocked = error instanceof Blocked ? error.blocked : 'checkout-changed'
      this.error = messageOf(error)
    }
    return this.view()
  }

  @Remote('check')
  async check(_request: Record<string, never> = {}): Promise<UpdateStateView> {
    this.authorize()
    if (this.busy || this.restartRequired) return this.view()
    this.busy = true
    this.phase = 'checking'
    this.message = undefined
    this.error = undefined
    this.blocked = undefined
    this.pendingCommits = 0
    this.latest = undefined
    try {
      await this.loadPendingCheckout()
      if (this.channel() === 'checkout') await this.checkCheckout()
      else await this.fetchRelease()
      this.checkedAt = Date.now()
      this.phase = 'idle'
      if (!this.outdated()) this.blocked = 'no-update'
    } catch (error) {
      this.phase = 'failed'
      this.blocked = error instanceof Blocked ? error.blocked : undefined
      this.error = messageOf(error)
    } finally {
      this.busy = false
    }
    return this.view()
  }

  @Remote('apply')
  async apply(_request: Record<string, never> = {}): Promise<UpdateStateView> {
    this.authorize()
    if (this.busy) return { ...this.view(), blocked: 'busy', canApply: false }
    // Occupy the operation before the first await, including pending-state discovery.
    if (this.restartRequired || this.phase === 'applied') return this.view()
    this.busy = true
    let started = false
    try {
      await this.loadPendingCheckout()
      if (!this.outdated()) {
        this.blocked = 'no-update'
        return this.view()
      }
      const channel = this.channel()
      this.blocked = undefined
      this.error = undefined
      this.message = undefined
      this.installResult = undefined
      this.restartRequired = false
      this.phase = channel === 'checkout' ? 'rebuilding' : 'downloading'
      started = true
      void this.run(channel).finally(() => { this.busy = false })
      return this.view()
    } catch (error) {
      this.phase = 'failed'
      this.blocked = error instanceof Blocked ? error.blocked : 'checkout-changed'
      this.error = messageOf(error)
      return this.view()
    } finally {
      if (!started) this.busy = false
    }
  }

  private async fetchRelease(): Promise<void> {
    try {
      this.latest = await fetchLatestRelease({
        feed: this.config.feed,
        pluginName: this.config.pluginName,
        userAgent: `${this.config.pluginName}/${this.currentVersion()}`,
      })
    } catch (error) {
      if (error instanceof UpdateSourceError && error.problem === 'no-release') this.blocked = 'no-release'
      throw error
    }
  }

  private async run(channel: UpdateChannel): Promise<void> {
    try {
      const restartRequired = channel === 'checkout' ? (await this.runCheckout(), true) : await this.runPackage()
      this.phase = 'applied'
      this.blocked = undefined
      this.message = restartRequired ? 'restart-required' : 'applied'
      this.restartRequired = restartRequired
      this.checkedAt = Date.now()
    } catch (error) {
      this.phase = 'failed'
      this.blocked = error instanceof Blocked ? error.blocked : undefined
      this.error = messageOf(error)
      this.ctx.logger.warn('AI Agent Engine update failed: %s', messageOf(error))
    }
  }

  private async runPackage(): Promise<boolean> {
    const manager = this.service<PluginManagerLike>('pluginManager')
    if (manager === undefined) {
      throw new Blocked('no-plugin-manager', 'The Host plugin manager is unavailable, so this runtime cannot install packages.')
    }
    if (this.latest === undefined) await this.fetchRelease()
    const release = this.latest
    if (release === undefined) throw new Blocked('no-release', 'The update channel lists no installable release.')
    if (release.assetUrl === undefined) throw new Blocked('no-asset', 'The release has no tarball install asset.')
    const fileName = releaseAssetName(this.config.pluginName, release.version)
    if (release.assetName !== fileName) throw new Blocked('package-identity-mismatch', 'The release asset does not name this plugin and release version.')
    const directory = join(this.cacheRoot(), release.version)
    await mkdir(directory, { recursive: true })
    const target = join(directory, basename(fileName))
    this.phase = 'downloading'
    this.message = 'downloading'
    await this.download(release.assetUrl, target)
    await this.verify(release, target, fileName)
    try {
      const identity = await readPackageIdentity(target)
      if (identity.name !== this.config.pluginName || identity.version !== release.version) {
        throw new Error(`Expected ${this.config.pluginName}@${release.version}, received ${identity.name}@${identity.version}.`)
      }
    } catch (error) {
      throw new Blocked('package-identity-mismatch', messageOf(error))
    }
    this.phase = 'installing'
    this.message = 'installing'
    try {
      // Do not pass approvedBuilds: only a separate user-approved Host operation can authorize them.
      this.installResult = installResultOf(await manager.installBundle(target, { saveExact: true, enabled: true }))
      const result = this.installResult
      if (result.application !== 'applied' && result.application !== 'restart-required') {
        const detail = result.error?.diagnostic || result.packageResult?.output || `Host installation outcome: ${result.application}.`
        const blocked = result.error?.code === 'incompatible-version' ? 'incompatible-version'
          : result.application === 'cancelled' ? 'install-cancelled'
          : result.application === 'overridden' ? 'install-overridden' : 'install-failed'
        throw new Blocked(blocked, detail)
      }
      return result.application === 'restart-required'
    } catch (error) {
      if (error instanceof Blocked) throw error
      const detail = messageOf(error)
      throw new Blocked(/incompatible-version/i.test(detail) ? 'incompatible-version' : 'install-failed', detail)
    }
  }

  private async verify(release: ReleaseView, target: string, fileName: string): Promise<void> {
    if (release.checksumUrl === undefined) throw new Blocked('checksum-missing', 'The release has no SHA256SUMS.txt asset.')
    let document: string
    try { document = await this.readText(release.checksumUrl) } catch (error) {
      throw new Blocked('checksum-invalid', messageOf(error))
    }
    const expected = parseChecksum(document, fileName)
    if (expected === undefined) throw new Blocked('checksum-invalid', `SHA256SUMS.txt has no unique valid entry for ${fileName}.`)
    if (await sha256File(target) !== expected) {
      throw new Blocked('checksum-mismatch', `Downloaded ${fileName} does not match SHA256SUMS.txt.`)
    }
  }

  private async readText(url: string): Promise<string> {
    if (url.startsWith('file:')) return readFile(new URL(url), 'utf8')
    const response = await fetch(url, {
      headers: { 'user-agent': `${this.config.pluginName}/${this.currentVersion()}` },
      signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
    })
    if (!response.ok) throw new Error(`Checksum download failed with HTTP ${response.status}.`)
    return response.text()
  }

  private async download(url: string, target: string): Promise<void> {
    if (url.startsWith('file:')) {
      await writeFile(target, await readFile(new URL(url)))
      return
    }
    const response = await fetch(url, {
      headers: { 'user-agent': `${this.config.pluginName}/${this.currentVersion()}` },
      signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
    })
    if (!response.ok) throw new Error(`Release download failed with HTTP ${response.status}.`)
    await writeFile(target, Buffer.from(await response.arrayBuffer()))
  }

  private async checkCheckout(): Promise<void> {
    const root = this.checkoutRoot()
    if (this.pendingCheckout !== undefined) {
      await this.assertCheckoutUnchanged(this.pendingCheckout)
      return
    }
    this.assertCheckoutIdentity(root)
    const status = await this.git(root, ['status', '--porcelain', '--untracked-files=no'])
    if (status.code !== 0) throw new Blocked('dirty-worktree', status.stderr.trim() || 'Not a usable git checkout.')
    if (status.stdout.trim() !== '') {
      throw new Blocked('dirty-worktree', 'The plugin checkout has local changes; commit or stash them first.')
    }
    const fetched = await this.git(root, ['fetch', '--tags', '--quiet', 'origin'])
    if (fetched.code !== 0) throw new Error(fetched.stderr.trim() || 'git fetch failed')
    const upstream = await this.upstream(root)
    const behind = await this.git(root, ['rev-list', '--count', `HEAD..${upstream}`])
    this.pendingCommits = Number.parseInt(behind.stdout.trim(), 10) || 0
    const tag = await this.git(root, ['describe', '--tags', '--abbrev=0', upstream])
    const version = tag.code === 0 ? tag.stdout.trim().replace(/^v/i, '') : this.currentVersion()
    if (parseVersion(version) === undefined) return
    const subject = await this.git(root, ['log', '-1', '--format=%s', upstream])
    this.latest = {
      version,
      tag: tag.code === 0 ? tag.stdout.trim() : version,
      ...subject.code === 0 && subject.stdout.trim() !== '' ? { notes: subject.stdout.trim() } : {},
      pageUrl: `https://github.com/${this.config.repository}/commits`,
    }
  }

  private async upstream(root: string): Promise<string> {
    const upstream = await this.git(root, ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'])
    if (upstream.code !== 0) throw new Blocked('no-upstream', 'The current branch has no upstream to update from.')
    return upstream.stdout.trim()
  }

  /** Share one read so a concurrent getState cannot overwrite an update in progress. */
  private async loadPendingCheckout(): Promise<void> {
    if (this.pendingLoaded || this.channel() !== 'checkout') return
    this.pendingLoad ??= this.readPendingCheckout()
    try { await this.pendingLoad } finally { this.pendingLoad = undefined }
  }

  /** Located inside Git metadata, including worktree-private and relative git-paths. */
  private async readPendingCheckout(): Promise<void> {
    const root = await realpath(this.checkoutRoot())
    const location = await this.git(root, ['rev-parse', '--git-path', 'ae-update'])
    if (location.code !== 0 || location.stdout.trim() === '') return
    this.pendingDirectory = resolve(root, location.stdout.trim())
    const file = join(this.pendingDirectory, 'pending.json')
    if (existsSync(file)) {
      const saved = readJson<PendingCheckout>(file)
      if (saved?.schemaVersion !== 1 || saved.root !== root || !/^[a-f0-9]{40,64}$/.test(saved.base)
        || !/^[a-f0-9]{40,64}$/.test(saved.target) || typeof saved.branch !== 'string'
        || !['install', 'build', 'merge', 'activate'].includes(saved.stage)
        || !Array.isArray(saved.activated) || saved.activated.some(item => item !== 'lib' && item !== 'node_modules')
        || (saved.promoting !== undefined && saved.promoting !== 'lib' && saved.promoting !== 'node_modules')) {
        throw new Blocked('checkout-changed', 'The saved checkout update state is invalid; it has been preserved for inspection.')
      }
      this.pendingCheckout = saved
    } else {
      this.assertCheckoutIdentity(root)
    }
    this.pendingLoaded = true
  }

  private async savePendingCheckout(pending: PendingCheckout): Promise<void> {
    const directory = this.pendingDirectory
    if (directory === undefined) throw new Blocked('checkout-changed', 'Cannot locate Git metadata for the pending update.')
    await mkdir(directory, { recursive: true })
    const file = join(directory, 'pending.json')
    await writeFile(`${file}.tmp`, JSON.stringify(pending))
    await rename(`${file}.tmp`, file)
    this.pendingCheckout = pending
  }

  private checkoutPaths(pending: PendingCheckout): { directory: string; source: string; lib: string } {
    const directory = join(this.pendingDirectory!, pending.target)
    return { directory, source: join(directory, 'source'), lib: join(directory, 'lib') }
  }

  private async assertCheckoutUnchanged(pending: PendingCheckout): Promise<string> {
    const head = await this.git(pending.root, ['rev-parse', 'HEAD'])
    const branch = await this.git(pending.root, ['symbolic-ref', '-q', 'HEAD'])
    if (head.code !== 0 || branch.code !== 0 || branch.stdout.trim() !== pending.branch
      || (head.stdout.trim() !== pending.base && head.stdout.trim() !== pending.target)) {
      throw new Blocked('checkout-changed', 'The checkout HEAD or branch changed during the pending update. No user changes were reset.')
    }
    const status = await this.git(pending.root, ['status', '--porcelain', '--untracked-files=no'])
    const paths = this.checkoutPaths(pending)
    const promotedLib = pending.activated.includes('lib') || (pending.promoting === 'lib'
      && (!existsSync(paths.lib) || (!existsSync(join(pending.root, 'lib')) && existsSync(join(paths.directory, 'previous-lib')))))
    const changes = status.stdout.split(/\r?\n/).filter(line => line !== '')
    const untrackedLib = promotedLib ? undefined : await this.git(pending.root, ['ls-files', '--others', '--', 'lib'])
    if (untrackedLib !== undefined && (untrackedLib.code !== 0 || untrackedLib.stdout.trim() !== '')) {
      throw new Blocked('checkout-changed', 'The lib directory has untracked files; they have been left in place.')
    }
    if (status.code !== 0 || changes.some(line => !promotedLib || !line.slice(3).startsWith('lib/'))) {
      throw new Blocked('checkout-changed', 'The checkout has local changes during the pending update. No user changes were reset.')
    }
    this.assertCheckoutIdentity(pending.root)
    return head.stdout.trim()
  }

  private async runCheckout(): Promise<void> {
    await this.loadPendingCheckout()
    const root = await realpath(this.checkoutRoot())
    if (this.pendingCheckout === undefined) {
      this.message = 'git-fetch'
      const status = await this.git(root, ['status', '--porcelain', '--untracked-files=no'])
      if (status.code !== 0 || status.stdout.trim() !== '') {
        throw new Blocked('dirty-worktree', status.stderr.trim() || 'The plugin checkout has local changes; commit or stash them first.')
      }
      const fetched = await this.git(root, ['fetch', '--tags', '--quiet', 'origin'])
      if (fetched.code !== 0) throw new Error(fetched.stderr.trim() || 'git fetch failed')
      const upstream = await this.upstream(root)
      const head = await this.git(root, ['rev-parse', 'HEAD'])
      const target = await this.git(root, ['rev-parse', upstream])
      const branch = await this.git(root, ['symbolic-ref', '-q', 'HEAD'])
      if (head.code !== 0 || target.code !== 0 || branch.code !== 0) throw new Blocked('checkout-changed', 'Cannot pin the checkout update target.')
      if (head.stdout.trim() === target.stdout.trim()) throw new Blocked('no-update', 'The checkout is already up to date.')
      const ancestor = await this.git(root, ['merge-base', '--is-ancestor', head.stdout.trim(), target.stdout.trim()])
      if (ancestor.code !== 0) throw new Blocked('checkout-changed', 'The target cannot fast-forward this checkout.')
      await this.savePendingCheckout({
        schemaVersion: 1, root, base: head.stdout.trim(), branch: branch.stdout.trim(),
        target: target.stdout.trim(), stage: 'install', activated: [],
      })
    }
    const pending = this.pendingCheckout!
    await this.assertCheckoutUnchanged(pending)
    const paths = this.checkoutPaths(pending)
    await mkdir(paths.directory, { recursive: true })
    if (pending.stage === 'install') {
      // A private clone leaves both the user's checkout and its runtime dependencies intact.
      const sourceHead = existsSync(join(paths.source, '.git')) ? await this.git(paths.source, ['rev-parse', 'HEAD']) : undefined
      if (sourceHead?.code !== 0 || sourceHead.stdout.trim() !== pending.target) {
        // Only our own fixed, Git-metadata staging path can be removed here.
        await rm(paths.source, { recursive: true, force: true })
        const cloned = await this.git(root, ['clone', '--shared', '--no-checkout', '--quiet', root, paths.source])
        if (cloned.code !== 0) throw new Blocked('install-failed', cloned.stderr.trim() || 'Cannot prepare an isolated checkout.')
        const checkedOut = await this.git(paths.source, ['checkout', '--detach', '--quiet', pending.target])
        if (checkedOut.code !== 0) throw new Blocked('install-failed', checkedOut.stderr.trim() || 'Cannot check out the pinned update target.')
      }
      this.assertCheckoutIdentity(paths.source)
      this.message = 'npm-install'
      const args = existsSync(join(paths.source, 'package-lock.json')) ? ['ci'] : ['install', '--package-lock=false']
      const installed = await this.exec(executable('npm'), [...args, '--ignore-scripts', '--no-audit', '--no-fund'], paths.source, PACKAGE_TIMEOUT_MS, true)
      if (installed.code !== 0) throw new Blocked('install-failed', installed.stderr.trim() || installed.stdout.trim() || 'npm install failed')
      await mkdir(join(paths.source, 'node_modules'), { recursive: true })
      await this.savePendingCheckout({ ...pending, stage: 'build' })
    }
    let active = this.pendingCheckout!
    if (active.stage === 'build') {
      this.message = 'building'
      // A fresh output tree prevents stale files from a previous failed build surviving the retry.
      await rm(paths.lib, { recursive: true, force: true })
      const built = await this.exec(process.execPath, ['tools/build.mjs'], paths.source, PACKAGE_TIMEOUT_MS, false, { AE_BUILD_OUTDIR: paths.lib, npm_config_ignore_scripts: 'true' })
      const required = ['index.js', 'engineering.js', 'client.js', 'index.d.ts', 'engineering.d.ts', 'client.d.ts']
      if (built.code !== 0 || required.some(file => !existsSync(join(paths.lib, file)) || !statSync(join(paths.lib, file)).isFile())) {
        throw new Blocked('build-failed', built.stderr.trim() || built.stdout.trim() || 'The build did not produce a complete staged plugin.')
      }
      await this.savePendingCheckout({ ...active, stage: 'merge' })
    }
    active = this.pendingCheckout!
    if (active.stage === 'merge') {
      // Recheck after the slow install/build. Never merge over user edits made in the meantime.
      const head = await this.assertCheckoutUnchanged(active)
      if (head !== active.target) {
        this.message = 'git-merge'
        const merged = await this.git(root, ['merge', '--ff-only', active.target])
        if (merged.code !== 0) throw new Blocked('checkout-changed', merged.stderr.trim() || merged.stdout.trim() || 'git merge --ff-only failed')
      }
      await this.savePendingCheckout({ ...active, stage: 'activate' })
    }
    await this.activateCheckout(this.pendingCheckout!)
    this.pendingCommits = 0
  }

  /** Swap whole dependency/output trees; backups retain every preexisting file. */
  private async activateCheckout(pending: PendingCheckout): Promise<void> {
    const paths = this.checkoutPaths(pending)
    const stage = (artifact: Artifact): string => artifact === 'lib' ? paths.lib : join(paths.source, 'node_modules')
    const live = (artifact: Artifact): string => join(pending.root, artifact)
    const backup = (artifact: Artifact): string => join(paths.directory, `previous-${artifact}`)
    let active = pending
    try {
      const head = await this.assertCheckoutUnchanged(active)
      if (head !== active.target) throw new Error('The checkout no longer points to the pending target.')
      for (const artifact of ['node_modules', 'lib'] as const) {
        if (active.activated.includes(artifact)) {
          if (!isDirectory(live(artifact))) throw new Error(`The activated ${artifact} directory is missing.`)
          continue
        }
        if (active.promoting !== undefined && active.promoting !== artifact) throw new Error('An inconsistent activation step was preserved for inspection.')
        const resuming = active.promoting === artifact
        active = { ...active, promoting: artifact }
        await this.savePendingCheckout(active)
        if (existsSync(stage(artifact))) {
          if (existsSync(live(artifact))) {
            if (existsSync(backup(artifact))) throw new Error(`Both current and backup ${artifact} exist; refusing to overwrite either.`)
            await rename(live(artifact), backup(artifact))
          }
          await rename(stage(artifact), live(artifact))
        } else if (!resuming || !isDirectory(live(artifact))) {
          throw new Error(`The staged ${artifact} directory is missing.`)
        }
        active = { ...active, activated: [...active.activated, artifact], promoting: undefined }
        await this.savePendingCheckout(active)
      }
      await unlink(join(this.pendingDirectory!, 'pending.json'))
      this.pendingCheckout = undefined
    } catch (error) {
      const diagnostics = [messageOf(error)]
      // Roll back only updater-owned directory moves, never Git or the user's source files.
      for (const artifact of ['lib', 'node_modules'] as const) {
        if (!active.activated.includes(artifact) && active.promoting !== artifact) continue
        try {
          if (!existsSync(stage(artifact)) && existsSync(live(artifact))) await rename(live(artifact), stage(artifact))
          if (existsSync(backup(artifact)) && !existsSync(live(artifact))) await rename(backup(artifact), live(artifact))
          active = { ...active, activated: active.activated.filter(item => item !== artifact), promoting: active.promoting === artifact ? undefined : active.promoting }
          await this.savePendingCheckout(active)
        } catch (rollbackError) { diagnostics.push(`Restoring ${artifact}: ${messageOf(rollbackError)}`) }
      }
      throw new Blocked(error instanceof Blocked ? error.blocked : 'activation-failed', diagnostics.join('\n'))
    }
  }

  private git(root: string, args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
    return this.exec('git', args, root, GIT_TIMEOUT_MS)
  }

  private exec(
    file: string, args: string[], cwd: string, timeoutMs: number, shell = false, environment: Record<string, string> = {},
  ): Promise<{ code: number; stdout: string; stderr: string }> {
    return new Promise(resolve => {
      execFile(file, args, {
        cwd, timeout: timeoutMs, shell, windowsHide: true, maxBuffer: 8 * 1024 * 1024, encoding: 'utf8',
        env: {
          ...process.env, ...environment, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never',
          GIT_ASKPASS: 'echo', SSH_ASKPASS: 'echo', GIT_OPTIONAL_LOCKS: '0',
        },
      }, (error, stdout, stderr) => {
        const code = error === null ? 0 : typeof error.code === 'number' ? error.code : 1
        resolve({ code, stdout: String(stdout ?? ''), stderr: String(stderr ?? '') })
      })
    })
  }
}
