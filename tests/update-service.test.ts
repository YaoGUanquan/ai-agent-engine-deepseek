import { Context } from '@deepseek-ai/cordis'
import { remoteErrorOf } from '@deepseek-ai/dsh-typert-protocol'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { homedir, tmpdir } from 'node:os'
import { join, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { gzipSync } from 'node:zlib'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { UpdateStateView } from '../src/update-contract.ts'
import { UpdateService } from '../src/update-service.ts'
import { updateRpc } from '../src/update-rpc.ts'

const codec = updateRpc.descriptors[0]!.result!
if (codec.mode !== 'strict') throw new Error('Expected a strict update-state codec')

async function feedWith(version: string): Promise<string> {
  const directory = await temporary('ae-update-')
  const file = join(directory, 'latest.json')
  await writeFile(file, JSON.stringify({
    tag_name: `v${version}`,
    html_url: 'https://example.invalid/releases',
    body: 'Release notes',
    assets: [
      { name: `ai-agent-engine-deepseek-${version}.tgz`, browser_download_url: 'https://example.invalid/pkg.tgz' },
      { name: 'SHA256SUMS.txt', browser_download_url: 'https://example.invalid/SHA256SUMS.txt' },
    ],
  }))
  return pathToFileURL(file).href
}

/** A plugin root without `.git`, so the service takes the package channel. */
async function packageRoot(version = '0.2.5'): Promise<string> {
  const directory = await temporary('ae-plugin-')
  await writeFile(join(directory, 'package.json'), JSON.stringify({
    name: 'ai-agent-engine-deepseek',
    version,
    engines: { dsh: '>=0.2.1-rc.5' },
    dsh: { compatibility: { verifiedThrough: '0.2.1-rc.5' } },
  }))
  return directory
}

function serviceFor(ctx: Context, feed: string, root: string): UpdateService {
  return new UpdateService(ctx, {
    pluginName: 'ai-agent-engine-deepseek',
    feed,
    repository: 'YaoGUanquan/ai-agent-engine-deepseek',
    root,
  })
}

function ownerOf(ctx: Context): UpdateService {
  return ctx.extend({ invocation: { peer: { principal: { kind: 'owner' } } } }).get('aeUpdate') as UpdateService
}

const temporaryRoots: string[] = []
afterEach(async () => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
  for (const directory of temporaryRoots.splice(0)) await rm(directory, { recursive: true, force: true, maxRetries: 3 })
})

async function temporary(prefix: string): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), prefix))
  temporaryRoots.push(directory)
  return directory
}

/** Small real npm-style archive; no package manager or network is used to create it. */
function packedManifest(manifest: unknown): Buffer {
  const content = Buffer.from(JSON.stringify(manifest))
  const header = Buffer.alloc(512)
  header.write('package/package.json', 0)
  header.write('0000644\0', 100)
  header.write('0000000\0', 108)
  header.write('0000000\0', 116)
  header.write(`${content.length.toString(8).padStart(11, '0')}\0`, 124)
  header.write('00000000000\0', 136)
  header.fill(32, 148, 156)
  header.write('0', 156)
  header.write('ustar\0', 257)
  header.write('00', 263)
  const sum = header.reduce((total, byte) => total + byte, 0)
  header.write(`${sum.toString(8).padStart(6, '0')}\0 `, 148)
  return gzipSync(Buffer.concat([header, content, Buffer.alloc((512 - content.length % 512) % 512), Buffer.alloc(1024)]))
}

async function installFixture(options: {
  identity?: { name: string; version: string }
  checksum?: 'missing' | 'malformed' | 'wrong-file' | 'mismatch'
} = {}): Promise<{ ctx: Context; owner: UpdateService; install: ReturnType<typeof vi.fn> }> {
  const directory = await temporary('ae-update-package-')
  const fileName = 'ai-agent-engine-deepseek-9.9.9.tgz'
  const bytes = packedManifest(options.identity ?? { name: 'ai-agent-engine-deepseek', version: '9.9.9' })
  const asset = join(directory, fileName)
  await writeFile(asset, bytes)
  const digest = createHash('sha256').update(bytes).digest('hex')
  const checksum = join(directory, 'SHA256SUMS.txt')
  await writeFile(checksum, options.checksum === 'malformed' ? 'not a checksum'
    : `${options.checksum === 'mismatch' ? '0'.repeat(64) : digest}  ${options.checksum === 'wrong-file' ? 'another.tgz' : fileName}\n`)
  const feed = join(directory, 'latest.json')
  await writeFile(feed, JSON.stringify({ version: '9.9.9', assets: [
    { name: fileName, browser_download_url: pathToFileURL(asset).href },
    ...options.checksum === 'missing' ? [] : [{ name: 'SHA256SUMS.txt', browser_download_url: pathToFileURL(checksum).href }],
  ] }))
  const ctx = new Context()
  const install = vi.fn().mockResolvedValue({ changed: true, application: 'restart-required' })
  Object.assign(ctx, { typert: { register: vi.fn() } })
  ctx.provide('profileContext', { home: directory })
  ctx.provide('pluginManager', { installBundle: install })
  serviceFor(ctx, pathToFileURL(feed).href, await packageRoot())
  return { ctx, owner: ownerOf(ctx), install }
}

async function settled(owner: UpdateService): Promise<UpdateStateView> {
  let state: UpdateStateView | undefined
  await vi.waitFor(async () => {
    state = await owner.getState()
    expect(['applied', 'failed']).toContain(state.phase)
  }, { timeout: 15000, interval: 25 })
  return state!
}

function git(directory: string, ...args: string[]): string {
  return execFileSync('git', args, { cwd: directory, encoding: 'utf8', env: { ...process.env, GIT_CONFIG_NOSYSTEM: '1' } }).trim()
}

/** Only these independent temporary repositories are mutated by the tests. */
async function checkoutFixture(): Promise<{ root: string; upstream: string; directory: string; target: string; base: string }> {
  const directory = await temporary('ae-update-git-')
  const upstream = join(directory, 'upstream')
  const root = join(directory, 'checkout')
  await mkdir(upstream)
  git(upstream, 'init', '--quiet', '--initial-branch=main')
  git(upstream, 'config', 'user.email', 'update-test@example.invalid')
  git(upstream, 'config', 'user.name', 'Update Test')
  git(upstream, 'config', 'commit.gpgSign', 'false')
  git(upstream, 'config', 'core.autocrlf', 'false')
  await writeFile(join(upstream, '.gitignore'), 'node_modules/\n')
  await writeFile(join(upstream, 'package.json'), JSON.stringify({ name: 'ai-agent-engine-deepseek', version: '1.0.0' }))
  await mkdir(join(upstream, 'lib'))
  await writeFile(join(upstream, 'lib', 'index.js'), 'old runtime')
  git(upstream, 'add', '.gitignore', 'package.json', 'lib/index.js')
  git(upstream, 'commit', '--quiet', '-m', 'base')
  git(directory, 'clone', '--quiet', upstream, root)
  const base = git(root, 'rev-parse', 'HEAD')
  await mkdir(join(root, 'node_modules'))
  await writeFile(join(root, 'node_modules', 'old-dependency'), 'keep for rollback')
  await mkdir(join(upstream, 'tools'))
  await writeFile(join(upstream, 'tools', 'build.mjs'), `
    import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
    import { join } from 'node:path'
    const out = process.env.AE_BUILD_OUTDIR
    if (process.env.AE_TEST_BLOCK_ACTIVATION && existsSync(process.env.AE_TEST_BLOCK_ACTIVATION)) mkdirSync(join(out, '..', 'previous-lib'), { recursive: true })
    mkdirSync(out, { recursive: true })
    writeFileSync(join(out, 'partial.js'), 'partial output')
    if (process.env.AE_TEST_BUILD_FAILURE && existsSync(process.env.AE_TEST_BUILD_FAILURE)) process.exit(7)
    for (const name of ['index.js', 'engineering.js', 'client.js', 'index.d.ts', 'engineering.d.ts', 'client.d.ts']) writeFileSync(join(out, name), 'new runtime')
  `)
  await writeFile(join(upstream, 'package.json'), JSON.stringify({ name: 'ai-agent-engine-deepseek', version: '2.0.0', scripts: {
    preinstall: 'node -e "process.exit(91)"',
    prebuild: 'node -e "process.exit(92)"',
    postbuild: 'node -e "process.exit(93)"',
  } }))
  // A tracked release lib must also stay out of the running checkout until the build succeeds.
  await writeFile(join(upstream, 'lib', 'index.js'), 'shipped runtime')
  git(upstream, 'add', 'package.json', 'tools/build.mjs', 'lib/index.js')
  git(upstream, 'commit', '--quiet', '-m', 'target')
  const target = git(upstream, 'rev-parse', 'HEAD')
  return { root, upstream, directory, target, base }
}

function checkoutService(root: string): { ctx: Context; service: UpdateService; owner: UpdateService } {
  const ctx = new Context()
  Object.assign(ctx, { typert: { register: vi.fn() } })
  const service = serviceFor(ctx, '', root)
  return { ctx, service, owner: ownerOf(ctx) }
}

describe('update service', () => {
  it.each([
    ['0.2.1-rc.5', 'verified'], ['0.2.2-rc.1', 'verified'],
    ['0.2.1-rc.6', 'untested-older'], ['0.2.2-rc.2', 'untested-newer'],
  ])('classifies the exact runtime matrix without inventing coverage for %s', async (runtime, support) => {
    const root = await packageRoot()
    const manifest = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))
    manifest.dsh.compatibility = {
      verifiedThrough: '0.2.2-rc.1', verifiedRuntimes: ['0.2.1-rc.5', '0.2.2-rc.1'],
    }
    await writeFile(join(root, 'package.json'), JSON.stringify(manifest))
    const ctx = new Context()
    Object.assign(ctx, { typert: { register: vi.fn() } })
    ctx.provide('pluginPackages', { packageOf: (name: string) => name === '@deepseek-ai/dsh-app-boot'
      ? { name, version: runtime, dir: root } : undefined })
    serviceFor(ctx, '', root)
    try {
      const state = await ownerOf(ctx).getState()
      expect(state.runtimeSupport).toBe(support)
      expect(state.verifiedThrough).toBe('0.2.2-rc.1')
    } finally { await ctx.fiber.dispose() }
  })

  it('serves only the Host owner', async () => {
    const ctx = new Context()
    Object.assign(ctx, { typert: { register: vi.fn() } })
    const service = serviceFor(ctx, '', await packageRoot())
    try {
      await expect(service.getState()).rejects.toSatisfy((error: unknown) =>
        remoteErrorOf(error)?.code === 'ae-update/rejected')
    } finally { await ctx.fiber.dispose() }
  })

  it('reports a newer release from the configured feed', async () => {
    const ctx = new Context()
    Object.assign(ctx, { typert: { register: vi.fn() } })
    const service = serviceFor(ctx, await feedWith('9.9.9'), await packageRoot())
    try {
      const state = await ownerOf(ctx).check()
      expect(codec.create().parse(state)).toEqual(state)
      expect(state.channel).toBe('package')
      expect(state.currentVersion).toBe('0.2.5')
      expect(state.verifiedThrough).toBe('0.2.1-rc.5')
      expect(state.latest?.version).toBe('9.9.9')
      expect(state.latest?.assetName).toBe('ai-agent-engine-deepseek-9.9.9.tgz')
      expect(state.outdated).toBe(true)
      expect(state.canApply).toBe(true)
      expect(state.runtimeSupport).toBe('unknown')
      expect(state.restartRequired).toBe(false)
    } finally { await ctx.fiber.dispose() }
  })

  it('stops apply when the runtime has no plugin manager', async () => {
    const ctx = new Context()
    Object.assign(ctx, { typert: { register: vi.fn() } })
    const service = serviceFor(ctx, await feedWith('9.9.9'), await packageRoot())
    try {
      const owner = ownerOf(ctx)
      await owner.check()
      const started = await owner.apply()
      expect(started.phase).toBe('downloading')
      await vi.waitFor(async () => {
        const settled = await owner.getState()
        expect(settled.phase).toBe('failed')
        expect(settled.blocked).toBe('no-plugin-manager')
        expect(settled.restartRequired).toBe(false)
      })
    } finally { await ctx.fiber.dispose() }
  })

  it('refuses apply when nothing newer was found', async () => {
    const ctx = new Context()
    Object.assign(ctx, { typert: { register: vi.fn() } })
    const service = serviceFor(ctx, await feedWith('0.0.1'), await packageRoot())
    try {
      const owner = ownerOf(ctx)
      const checked = await owner.check()
      expect(checked.outdated).toBe(false)
      expect(checked.blocked).toBe('no-update')
      const state = await owner.apply()
      expect(state.phase).not.toBe('downloading')
      expect(state.blocked).toBe('no-update')
    } finally { await ctx.fiber.dispose() }
  })

  it.each(['failed', 'cancelled', 'overridden'] as const)('preserves a resolved Host %s outcome without reporting success', async application => {
    const fixture = await installFixture()
    fixture.install.mockResolvedValue({
      changed: application !== 'cancelled', application,
      error: { code: 'operation-error', diagnostic: 'actual Host diagnostic', privateObject: { hidden: true } },
      packageResult: { exitCode: 7, output: 'package manager output', truncated: true, logPath: '/synthetic/install.log', kind: 'build-blocked' },
      warnings: ['dependency scripts need approval'], pendingBuilds: ['native-package'], otherHostObject: { secret: true },
    })
    try {
      await fixture.owner.check()
      await fixture.owner.apply()
      const state = await settled(fixture.owner)
      expect(state.phase).toBe('failed')
      expect(state.blocked).toBe(`install-${application}`)
      expect(state.restartRequired).toBe(false)
      expect(state.error).toBe('actual Host diagnostic')
      expect(state.installResult).toEqual({
        changed: application !== 'cancelled', application,
        error: { code: 'operation-error', diagnostic: 'actual Host diagnostic' },
        packageResult: { exitCode: 7, output: 'package manager output', truncated: true, logPath: '/synthetic/install.log', kind: 'build-blocked' },
        warnings: ['dependency scripts need approval'], pendingBuilds: ['native-package'],
      })
      expect(codec.create().parse(state)).toEqual(state)
      expect(fixture.install).toHaveBeenCalledWith(expect.any(String), { saveExact: true, enabled: true })
    } finally { await fixture.ctx.fiber.dispose() }
  })

  it.each(['applied', 'restart-required'] as const)('honors the Host %s lifecycle and leaves pending scripts unapproved', async application => {
    const fixture = await installFixture()
    fixture.install.mockResolvedValue({ changed: true, application, pendingBuilds: ['native-package'] })
    try {
      await fixture.owner.check()
      await fixture.owner.apply()
      const state = await settled(fixture.owner)
      expect(state.phase).toBe('applied')
      expect(state.canApply).toBe(false)
      expect(state.restartRequired).toBe(application === 'restart-required')
      expect(state.installResult?.pendingBuilds).toEqual(['native-package'])
      await fixture.owner.apply()
      expect(fixture.install).toHaveBeenCalledTimes(1)
      expect(fixture.install.mock.calls[0]![1]).not.toHaveProperty('approvedBuilds')
    } finally { await fixture.ctx.fiber.dispose() }
  })

  it('retains a returned incompatibility diagnostic', async () => {
    const fixture = await installFixture()
    fixture.install.mockResolvedValue({ changed: false, application: 'failed', error: { code: 'incompatible-version', diagnostic: 'requires a newer Host' } })
    try {
      await fixture.owner.check()
      await fixture.owner.apply()
      const state = await settled(fixture.owner)
      expect(state.blocked).toBe('incompatible-version')
      expect(state.error).toBe('requires a newer Host')
      expect(state.restartRequired).toBe(false)
    } finally { await fixture.ctx.fiber.dispose() }
  })

  it.each(['missing', 'malformed', 'wrong-file', 'mismatch'] as const)('blocks %s checksums before invoking the Host installer', async checksum => {
    const fixture = await installFixture({ checksum })
    try {
      await fixture.owner.check()
      await fixture.owner.apply()
      const state = await settled(fixture.owner)
      expect(state.blocked).toBe(checksum === 'missing' ? 'checksum-missing' : checksum === 'mismatch' ? 'checksum-mismatch' : 'checksum-invalid')
      expect(fixture.install).not.toHaveBeenCalled()
      expect(state.restartRequired).toBe(false)
    } finally { await fixture.ctx.fiber.dispose() }
  })

  it.each([
    { name: 'another-plugin', version: '9.9.9' },
    { name: 'ai-agent-engine-deepseek', version: '8.8.8' },
  ])('rejects a checksum-valid tarball with the wrong manifest identity: $name@$version', async identity => {
    const fixture = await installFixture({ identity })
    try {
      await fixture.owner.check()
      await fixture.owner.apply()
      const state = await settled(fixture.owner)
      expect(state.blocked).toBe('package-identity-mismatch')
      expect(fixture.install).not.toHaveBeenCalled()
    } finally { await fixture.ctx.fiber.dispose() }
  })

  it('keeps the running lib and dependencies intact on build failure, then resumes the pinned target after service recreation', async () => {
    const fixture = await checkoutFixture()
    const failure = join(fixture.directory, 'fail-build')
    await writeFile(failure, 'fail')
    vi.stubEnv('AE_TEST_BUILD_FAILURE', failure)
    const first = checkoutService(fixture.root)
    try {
      expect((await first.owner.check()).canApply).toBe(true)
      await first.owner.apply()
      const failed = await settled(first.owner)
      expect(failed.blocked).toBe('build-failed')
      expect(failed.pendingCheckout).toEqual({ target: fixture.target, stage: 'build' })
      expect(failed.canApply).toBe(true)
      expect(git(fixture.root, 'rev-parse', 'HEAD')).toBe(fixture.base)
      expect(await readFile(join(fixture.root, 'lib/index.js'), 'utf8')).toBe('old runtime')
      expect(await readFile(join(fixture.root, 'node_modules/old-dependency'), 'utf8')).toBe('keep for rollback')
      expect(git(fixture.root, 'status', '--porcelain')).toBe('')
    } finally { await first.ctx.fiber.dispose() }
    await rm(failure)
    // Simulate a prior updater/user having already fast-forwarded HEAD, then an offline origin.
    git(fixture.root, 'merge', '--ff-only', fixture.target)
    git(fixture.root, 'remote', 'set-url', 'origin', join(fixture.directory, 'offline-origin'))
    const second = checkoutService(fixture.root)
    try {
      expect((await second.owner.getState()).pendingCheckout).toEqual({ target: fixture.target, stage: 'build' })
      expect((await second.owner.check()).canApply).toBe(true)
      await second.owner.apply()
      const applied = await settled(second.owner)
      expect(applied.phase).toBe('applied')
      expect(applied.restartRequired).toBe(true)
      expect(applied.pendingCheckout).toBeUndefined()
      expect(await readFile(join(fixture.root, 'lib/index.js'), 'utf8')).toBe('new runtime')
      expect(existsSync(join(fixture.root, 'node_modules/old-dependency'))).toBe(false)
      expect(await readFile(join(fixture.root, '.git/ae-update', fixture.target, 'previous-node_modules/old-dependency'), 'utf8')).toBe('keep for rollback')
      expect(existsSync(join(fixture.root, '.git/ae-update/pending.json'))).toBe(false)
    } finally { await second.ctx.fiber.dispose() }
  }, 30000)

  it('retries an installation failure without fetching or merging over the running checkout', async () => {
    const fixture = await checkoutFixture()
    const first = checkoutService(fixture.root)
    type Exec = (file: string, args: string[], cwd: string, timeout: number, shell?: boolean, env?: Record<string, string>) => Promise<{ code: number; stdout: string; stderr: string }>
    const processBoundary = first.service as unknown as { exec: Exec }
    const execute = processBoundary.exec.bind(first.service)
    vi.spyOn(processBoundary, 'exec').mockImplementation((file, ...args) => /npm(?:\.cmd)?$/.test(file)
      ? Promise.resolve({ code: 23, stdout: '', stderr: 'synthetic install failure' }) : execute(file, ...args))
    try {
      await first.owner.check()
      await first.owner.apply()
      const failed = await settled(first.owner)
      expect(failed.blocked).toBe('install-failed')
      expect(failed.canApply).toBe(true)
      expect(failed.pendingCheckout?.stage).toBe('install')
      expect(git(fixture.root, 'rev-parse', 'HEAD')).toBe(fixture.base)
      expect(await readFile(join(fixture.root, 'lib/index.js'), 'utf8')).toBe('old runtime')
    } finally { await first.ctx.fiber.dispose() }
    git(fixture.root, 'merge', '--ff-only', fixture.target)
    git(fixture.root, 'remote', 'set-url', 'origin', join(fixture.directory, 'offline-origin'))
    const second = checkoutService(fixture.root)
    try {
      expect((await second.owner.getState()).canApply).toBe(true)
      await second.owner.apply()
      expect((await settled(second.owner)).phase).toBe('applied')
    } finally { await second.ctx.fiber.dispose() }
  }, 30000)

  it('rolls dependencies back when lib activation fails and permits a direct retry after HEAD advanced', async () => {
    const fixture = await checkoutFixture()
    const obstruction = join(fixture.directory, 'block-activation')
    await writeFile(obstruction, 'block')
    vi.stubEnv('AE_TEST_BLOCK_ACTIVATION', obstruction)
    const current = checkoutService(fixture.root)
    try {
      await current.owner.check()
      await current.owner.apply()
      const failed = await settled(current.owner)
      expect(failed.blocked).toBe('activation-failed')
      expect(failed.canApply).toBe(true)
      expect(failed.pendingCheckout?.stage).toBe('activate')
      expect(git(fixture.root, 'rev-parse', 'HEAD')).toBe(fixture.target)
      expect(await readFile(join(fixture.root, 'node_modules/old-dependency'), 'utf8')).toBe('keep for rollback')
      expect(await readFile(join(fixture.root, 'lib/index.js'), 'utf8')).toBe('shipped runtime')
      await rm(join(fixture.root, '.git/ae-update', fixture.target, 'previous-lib'), { recursive: true })
      await current.owner.apply()
      expect((await settled(current.owner)).phase).toBe('applied')
      expect(await readFile(join(fixture.root, 'lib/index.js'), 'utf8')).toBe('new runtime')
    } finally { await current.ctx.fiber.dispose() }
  }, 30000)

  it('preserves user source edits introduced while an update is pending', async () => {
    const fixture = await checkoutFixture()
    const failure = join(fixture.directory, 'fail-build')
    await writeFile(failure, 'fail')
    vi.stubEnv('AE_TEST_BUILD_FAILURE', failure)
    const first = checkoutService(fixture.root)
    try {
      await first.owner.check()
      await first.owner.apply()
      expect((await settled(first.owner)).blocked).toBe('build-failed')
    } finally { await first.ctx.fiber.dispose() }
    await writeFile(join(fixture.root, 'package.json'), 'user edit')
    const second = checkoutService(fixture.root)
    try {
      const state = await second.owner.check()
      expect(state.blocked).toBe('checkout-changed')
      expect(state.canApply).toBe(false)
      expect(await readFile(join(fixture.root, 'package.json'), 'utf8')).toBe('user edit')
      expect(git(fixture.root, 'rev-parse', 'HEAD')).toBe(fixture.base)
      await second.owner.apply()
      expect((await settled(second.owner)).blocked).toBe('checkout-changed')
      expect(await readFile(join(fixture.root, 'package.json'), 'utf8')).toBe('user edit')
    } finally { await second.ctx.fiber.dispose() }
  }, 30000)

  it('occupies apply before pending discovery and shares an in-flight getState read', async () => {
    const fixture = await checkoutFixture()
    git(fixture.root, 'fetch', '--quiet', 'origin')
    const metadata = join(fixture.root, '.git/ae-update')
    await mkdir(metadata)
    await writeFile(join(metadata, 'pending.json'), JSON.stringify({
      schemaVersion: 1, root: fixture.root, base: fixture.base, branch: 'refs/heads/main', target: fixture.target, stage: 'install', activated: [],
    }))
    const current = checkoutService(fixture.root)
    type Exec = (file: string, args: string[], cwd: string, timeout: number, shell?: boolean, env?: Record<string, string>) => Promise<{ code: number; stdout: string; stderr: string }>
    const boundary = current.service as unknown as { exec: Exec }
    const execute = boundary.exec.bind(current.service)
    let release!: () => void
    const gate = new Promise<void>(resolveGate => { release = resolveGate })
    const calls = vi.spyOn(boundary, 'exec').mockImplementation(async (file, args, ...rest) => {
      if (args.includes('--git-path')) await gate
      return execute(file, args, ...rest)
    })
    try {
      const reading = current.owner.getState()
      await vi.waitFor(() => expect(calls.mock.calls.some(call => call[1].includes('--git-path'))).toBe(true))
      const applying = current.owner.apply()
      expect((await current.owner.apply()).blocked).toBe('busy')
      release()
      await reading
      await applying
      const state = await settled(current.owner)
      expect(state.phase).toBe('applied')
      expect(calls.mock.calls.filter(call => call[1].includes('--git-path'))).toHaveLength(1)
      expect(calls.mock.calls.filter(call => /npm(?:\.cmd)?$/.test(call[0]))).toHaveLength(1)
      expect(state.pendingCheckout).toBeUndefined()
    } finally { release(); await current.ctx.fiber.dispose() }
  }, 30000)

  it('recovers a persisted interruption between backing up lib and promoting its staged replacement', async () => {
    const fixture = await checkoutFixture()
    const obstruction = join(fixture.directory, 'block-activation')
    await writeFile(obstruction, 'block')
    vi.stubEnv('AE_TEST_BLOCK_ACTIVATION', obstruction)
    const first = checkoutService(fixture.root)
    try {
      await first.owner.check()
      await first.owner.apply()
      expect((await settled(first.owner)).blocked).toBe('activation-failed')
    } finally { await first.ctx.fiber.dispose() }
    const metadata = join(fixture.root, '.git/ae-update')
    const staged = join(metadata, fixture.target)
    await rm(join(staged, 'previous-lib'), { recursive: true })
    await rename(join(fixture.root, 'node_modules'), join(staged, 'previous-node_modules'))
    await rename(join(staged, 'source/node_modules'), join(fixture.root, 'node_modules'))
    await rename(join(fixture.root, 'lib'), join(staged, 'previous-lib'))
    const saved = JSON.parse(await readFile(join(metadata, 'pending.json'), 'utf8'))
    await writeFile(join(metadata, 'pending.json'), JSON.stringify({ ...saved, activated: ['node_modules'], promoting: 'lib' }))
    const second = checkoutService(fixture.root)
    try {
      expect((await second.owner.check()).canApply).toBe(true)
      await second.owner.apply()
      expect((await settled(second.owner)).phase).toBe('applied')
      expect(await readFile(join(fixture.root, 'lib/index.js'), 'utf8')).toBe('new runtime')
      expect(existsSync(join(metadata, 'pending.json'))).toBe(false)
    } finally { await second.ctx.fiber.dispose() }
  }, 30000)

  it('locates pending state inside a linked worktree Git directory', async () => {
    const fixture = await checkoutFixture()
    const linked = join(fixture.directory, 'linked')
    git(fixture.root, 'worktree', 'add', '--quiet', '--track', '-b', 'linked', linked, 'origin/main')
    const failure = join(fixture.directory, 'fail-linked-build')
    await writeFile(failure, 'fail')
    vi.stubEnv('AE_TEST_BUILD_FAILURE', failure)
    const first = checkoutService(linked)
    try {
      await first.owner.check()
      await first.owner.apply()
      expect((await settled(first.owner)).blocked).toBe('build-failed')
    } finally { await first.ctx.fiber.dispose() }
    const metadata = resolve(linked, git(linked, 'rev-parse', '--git-path', 'ae-update'))
    expect(existsSync(join(metadata, 'pending.json'))).toBe(true)
    const second = checkoutService(linked)
    try {
      const state = await second.owner.getState()
      expect(state.pendingCheckout).toEqual({ target: fixture.target, stage: 'build' })
      expect(state.canApply).toBe(true)
      expect(git(fixture.root, 'rev-parse', 'HEAD')).toBe(fixture.base)
    } finally { await second.ctx.fiber.dispose() }
  }, 30000)

  it('preserves untracked user files in lib by refusing to replace their directory', async () => {
    const fixture = await checkoutFixture()
    await writeFile(join(fixture.root, 'lib/user-note'), 'user file')
    const current = checkoutService(fixture.root)
    try {
      await current.owner.check()
      await current.owner.apply()
      expect((await settled(current.owner)).blocked).toBe('checkout-changed')
      expect(await readFile(join(fixture.root, 'lib/user-note'), 'utf8')).toBe('user file')
      expect(git(fixture.root, 'rev-parse', 'HEAD')).toBe(fixture.base)
    } finally { await current.ctx.fiber.dispose() }
  }, 30000)

  it('resolves relative link dependencies from the profile directory, independent of process cwd', async () => {
    const fixture = await checkoutFixture()
    const profile = join(fixture.directory, 'profile')
    await mkdir(profile)
    await writeFile(join(profile, 'package.json'), JSON.stringify({ dependencies: { 'ai-agent-engine-deepseek': `link:${relative(profile, fixture.root).replaceAll('\\', '/')}` } }))
    const ctx = new Context()
    Object.assign(ctx, { typert: { register: vi.fn() } })
    ctx.provide('profileContext', { dir: profile })
    serviceFor(ctx, '', await packageRoot())
    try {
      const state = await ownerOf(ctx).check()
      expect(state.channel).toBe('checkout')
      expect(state.pendingCommits).toBe(1)
      expect(state.canApply).toBe(true)
    } finally { await ctx.fiber.dispose() }
  })

  it('expands a home-relative link independently of the profile directory', async () => {
    const fixture = await checkoutFixture()
    const profile = join(fixture.directory, 'profile')
    await mkdir(profile)
    await writeFile(join(profile, 'package.json'), JSON.stringify({ dependencies: { 'ai-agent-engine-deepseek': `link:~/${relative(homedir(), fixture.root).replaceAll('\\', '/')}` } }))
    const ctx = new Context()
    Object.assign(ctx, { typert: { register: vi.fn() } })
    ctx.provide('profileContext', { dir: profile })
    serviceFor(ctx, '', await packageRoot())
    try { expect((await ownerOf(ctx).check()).channel).toBe('checkout') } finally { await ctx.fiber.dispose() }
  })

  it('rejects a wrong checkout identity before fetching or changing any Git refs', async () => {
    const fixture = await checkoutFixture()
    await writeFile(join(fixture.root, 'package.json'), JSON.stringify({ name: 'another-plugin', version: '1.0.0' }))
    const current = checkoutService(fixture.root)
    try {
      const state = await current.owner.check()
      expect(state.blocked).toBe('package-identity-mismatch')
      expect(state.canApply).toBe(false)
      expect(git(fixture.root, 'rev-parse', 'refs/remotes/origin/main')).toBe(fixture.base)
      expect(git(fixture.root, 'rev-parse', 'HEAD')).toBe(fixture.base)
    } finally { await current.ctx.fiber.dispose() }
  })

  it('reports a checkout root it cannot inspect instead of pretending to update', async () => {
    const ctx = new Context()
    Object.assign(ctx, { typert: { register: vi.fn() } })
    const root = await mkdtemp(join(tmpdir(), 'ae-checkout-'))
    await writeFile(join(root, 'package.json'), JSON.stringify({
      name: 'ai-agent-engine-deepseek', version: '0.2.5',
    }))
    await mkdir(join(root, '.git'))
    const service = serviceFor(ctx, '', root)
    try {
      const state = await ownerOf(ctx).check()
      expect(state.channel).toBe('checkout')
      expect(state.phase).toBe('failed')
      expect(state.blocked).toBe('dirty-worktree')
    } finally { await ctx.fiber.dispose() }
  })
})
