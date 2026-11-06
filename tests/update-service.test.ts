import { Context } from '@deepseek-ai/cordis'
import { remoteErrorOf } from '@deepseek-ai/dsh-typert-protocol'
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { describe, expect, it, vi } from 'vitest'
import { UpdateService } from '../src/update-service.ts'
import { updateRpc } from '../src/update-rpc.ts'

const codec = updateRpc.descriptors[0]!.result!
if (codec.mode !== 'strict') throw new Error('Expected a strict update-state codec')

async function feedWith(version: string): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), 'ae-update-'))
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
  const directory = await mkdtemp(join(tmpdir(), 'ae-plugin-'))
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

describe('update service', () => {
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
