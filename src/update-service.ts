import type { Context } from '@deepseek-ai/cordis'
import { Remote, RemoteError, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { execFile } from 'node:child_process'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type {
  RuntimeSupport,
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
  dsh?: { compatibility?: { verifiedThrough?: string } }
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
 * manager install it) and a git checkout (fetch and `--ff-only` merge the
 * upstream, then rebuild). Both end with a restart notice because Host code is
 * loaded at composition time.
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
    const verified = this.manifest().dsh?.compatibility?.verifiedThrough
    if (runtime === undefined || verified === undefined) return 'unknown'
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
    const spec = this.installSpec()
    const linked = spec !== undefined && /^link:/i.test(spec)
    const directory = linked
      ? (isDirectory(spec.replace(/^link:/i, '')) ? spec.replace(/^link:/i, '') : this.manifestDir())
      : this.manifestDir()
    return existsSync(join(directory, '.git')) ? 'checkout' : 'package'
  }

  private checkoutRoot(): string {
    const spec = this.installSpec()
    if (spec !== undefined && /^link:/i.test(spec)) {
      const target = spec.replace(/^link:/i, '')
      if (isDirectory(target)) return target
    }
    return this.manifestDir()
  }

  private cacheRoot(): string {
    const home = this.profile().home ?? process.env.DSH_HOME ?? join(homedir(), '.dsh')
    return join(home, 'cache', 'ai-agent-engine', 'updates')
  }

  private outdated(): boolean {
    return (this.latest !== undefined && compareVersions(this.latest.version, this.currentVersion()) > 0)
      || this.pendingCommits > 0
  }

  private view(): UpdateStateView {
    const manifest = this.manifest()
    const runtimeVersion = this.runtimeVersion()
    const verifiedThrough = manifest.dsh?.compatibility?.verifiedThrough
    const installSpec = this.installSpec()
    const settled = this.phase !== 'downloading' && this.phase !== 'installing' && this.phase !== 'rebuilding'
    const outdated = this.outdated()
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
      outdated,
      canApply: outdated && this.blocked === undefined && !this.busy && !this.restartRequired && settled,
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
    return this.view()
  }

  @Remote('check')
  async check(_request: Record<string, never> = {}): Promise<UpdateStateView> {
    this.authorize()
    if (this.busy) return this.view()
    this.phase = 'checking'
    this.message = undefined
    this.error = undefined
    this.blocked = undefined
    this.pendingCommits = 0
    this.latest = undefined
    try {
      if (this.channel() === 'checkout') await this.checkCheckout()
      else await this.fetchRelease()
      this.checkedAt = Date.now()
      this.phase = 'idle'
      if (!this.outdated()) this.blocked = 'no-update'
    } catch (error) {
      this.phase = 'failed'
      this.blocked = error instanceof Blocked ? error.blocked : undefined
      this.error = messageOf(error)
    }
    return this.view()
  }

  @Remote('apply')
  async apply(_request: Record<string, never> = {}): Promise<UpdateStateView> {
    this.authorize()
    if (this.busy) {
      this.blocked = 'busy'
      return this.view()
    }
    // An installed build waits for the restart; running the update twice would only reinstall it.
    if (this.restartRequired) return this.view()
    if (!this.outdated()) {
      this.blocked = 'no-update'
      return this.view()
    }
    const channel = this.channel()
    this.busy = true
    this.blocked = undefined
    this.error = undefined
    this.message = undefined
    this.restartRequired = false
    this.phase = channel === 'checkout' ? 'rebuilding' : 'downloading'
    void this.run(channel).finally(() => { this.busy = false })
    return this.view()
  }

  private async fetchRelease(): Promise<void> {
    try {
      this.latest = await fetchLatestRelease({
        feed: this.config.feed,
        userAgent: `${this.config.pluginName}/${this.currentVersion()}`,
      })
    } catch (error) {
      if (error instanceof UpdateSourceError && error.problem === 'no-release') this.blocked = 'no-release'
      throw error
    }
  }

  private async run(channel: UpdateChannel): Promise<void> {
    try {
      if (channel === 'checkout') await this.runCheckout()
      else await this.runPackage()
      this.phase = 'applied'
      this.message = 'restart-required'
      this.restartRequired = true
      this.checkedAt = Date.now()
    } catch (error) {
      this.phase = 'failed'
      this.blocked = error instanceof Blocked ? error.blocked : undefined
      this.error = messageOf(error)
      this.ctx.logger.warn('AI Agent Engine update failed: %s', messageOf(error))
    }
  }

  private async runPackage(): Promise<void> {
    const manager = this.service<PluginManagerLike>('pluginManager')
    if (manager === undefined) {
      throw new Blocked('no-plugin-manager', 'The Host plugin manager is unavailable, so this runtime cannot install packages.')
    }
    if (this.latest === undefined) await this.fetchRelease()
    const release = this.latest
    if (release === undefined) throw new Blocked('no-release', 'The update channel lists no installable release.')
    if (release.assetUrl === undefined) throw new Blocked('no-asset', 'The release has no tarball install asset.')
    const fileName = release.assetName ?? `${this.config.pluginName}-${release.version}.tgz`
    const directory = join(this.cacheRoot(), release.version)
    await mkdir(directory, { recursive: true })
    const target = join(directory, basename(fileName))
    this.phase = 'downloading'
    this.message = 'downloading'
    await this.download(release.assetUrl, target)
    await this.verify(release, target, basename(fileName))
    this.phase = 'installing'
    this.message = 'installing'
    try {
      await manager.installBundle(target, { saveExact: true, enabled: true })
    } catch (error) {
      const detail = messageOf(error)
      if (/incompatible-version/i.test(detail)) throw new Blocked('incompatible-version', detail)
      throw error
    }
  }

  private async verify(release: ReleaseView, target: string, fileName: string): Promise<void> {
    if (release.checksumUrl === undefined) return
    const expected = parseChecksum(await this.readText(release.checksumUrl), fileName)
    if (expected === undefined) return
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

  private async runCheckout(): Promise<void> {
    const root = this.checkoutRoot()
    this.message = 'git-fetch'
    const status = await this.git(root, ['status', '--porcelain', '--untracked-files=no'])
    if (status.stdout.trim() !== '') {
      throw new Blocked('dirty-worktree', 'The plugin checkout has local changes; commit or stash them first.')
    }
    const fetched = await this.git(root, ['fetch', '--tags', '--quiet', 'origin'])
    if (fetched.code !== 0) throw new Error(fetched.stderr.trim() || 'git fetch failed')
    const upstream = await this.upstream(root)
    const behind = await this.git(root, ['rev-list', '--count', `HEAD..${upstream}`])
    this.pendingCommits = Number.parseInt(behind.stdout.trim(), 10) || 0
    if (this.pendingCommits === 0) throw new Blocked('no-update', 'The checkout is already up to date.')
    const merged = await this.git(root, ['merge', '--ff-only', upstream])
    if (merged.code !== 0) throw new Error(merged.stderr.trim() || merged.stdout.trim() || 'git merge --ff-only failed')
    const changed = await this.git(root, ['diff', '--name-only', 'ORIG_HEAD', 'HEAD'])
    const files = changed.stdout.split(/\r?\n/).map(line => line.trim())
    if (files.includes('package.json') || files.includes('package-lock.json')) {
      this.message = 'npm-install'
      const installed = await this.exec(executable('npm'), ['install', '--no-audit', '--no-fund'], root, PACKAGE_TIMEOUT_MS, true)
      if (installed.code !== 0) throw new Error(installed.stderr.trim() || 'npm install failed')
    }
    this.message = 'building'
    const built = await this.exec(executable('npm'), ['run', 'build'], root, PACKAGE_TIMEOUT_MS, true)
    if (built.code !== 0) throw new Error(built.stderr.trim() || 'npm run build failed')
  }

  private git(root: string, args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
    return this.exec('git', args, root, GIT_TIMEOUT_MS)
  }

  private exec(
    file: string, args: string[], cwd: string, timeoutMs: number, shell = false,
  ): Promise<{ code: number; stdout: string; stderr: string }> {
    return new Promise(resolve => {
      execFile(file, args, {
        cwd, timeout: timeoutMs, shell, windowsHide: true, maxBuffer: 8 * 1024 * 1024, encoding: 'utf8',
        env: {
          ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never',
          GIT_ASKPASS: 'echo', SSH_ASKPASS: 'echo', GIT_OPTIONAL_LOCKS: '0',
        },
      }, (error, stdout, stderr) => {
        const code = error === null ? 0 : typeof error.code === 'number' ? error.code : 1
        resolve({ code, stdout: String(stdout ?? ''), stderr: String(stderr ?? '') })
      })
    })
  }
}
