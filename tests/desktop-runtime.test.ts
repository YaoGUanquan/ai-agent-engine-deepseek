import { mkdtemp, mkdir, writeFile, readFile, lstat, realpath, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { ensureDesktopRuntime, DesktopRuntimeError } from '../src/desktop-runtime.ts'

const roots: string[] = []
afterEach(async () => { for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true, maxRetries: 3 }) })

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'ae-desktop-runtime-'))
  roots.push(root)
  const executable = join(root, 'desktop', 'Harness.exe')
  const home = join(root, 'home')
  const expected = join(root, 'desktop', 'resources', 'runtime', 'primary-runtime')
  const source = join(home, 'dsh-runtimes', 'dsh-primary-runtime')
  await mkdir(join(root, 'desktop', 'resources'), { recursive: true })
  const files = {
    'runtime.json': JSON.stringify({ desktopVersion: '0.2.2-rc.1', platform: 'win32', arch: 'x64', node: '24.21.0', pnpm: '11.28.5' }),
    'dependencies/pnpm/package.json': JSON.stringify({ name: 'pnpm', version: '11.28.5' }),
    'dependencies/pnpm/bin/pnpm.mjs': 'test pnpm entry',
    'dependencies/pnpm/dist/pnpm.mjs': 'test pnpm distribution',
    'dependencies/node/bin/node.exe': 'test node executable',
  }
  for (const [path, content] of Object.entries(files)) {
    await mkdir(join(source, path, '..'), { recursive: true })
    await writeFile(join(source, path), content)
  }
  const entry = join(expected, 'dependencies', 'pnpm', 'bin', 'pnpm.mjs')
  const profile = { home, packageManager: { command: executable, args: ['--expose-internals', entry], env: { ELECTRON_RUN_AS_NODE: '1' } } }
  const environment = { platform: 'win32' as const, arch: 'x64', executable }
  return { root, source, expected, entry, profile, environment }
}

describe('known Windows Desktop runtime path recovery', () => {
  it('maps the complete existing runtime and is idempotent', async () => {
    const f = await fixture()
    expect(await ensureDesktopRuntime(f.profile, f.environment)).toBe(true)
    expect(await realpath(f.expected)).toBe(await realpath(f.source))
    expect(await readFile(f.entry, 'utf8')).toBe('test pnpm entry')
    expect(await ensureDesktopRuntime(f.profile, f.environment)).toBe(false)
  })

  it('keeps a complete packaged runtime without requiring an external copy', async () => {
    const f = await fixture()
    await mkdir(join(f.entry, '..'), { recursive: true })
    await writeFile(f.entry, 'packaged entry')
    await rm(f.source, { recursive: true })
    expect(await ensureDesktopRuntime(f.profile, f.environment)).toBe(false)
    expect(await readFile(f.entry, 'utf8')).toBe('packaged entry')
    expect((await lstat(f.expected)).isSymbolicLink()).toBe(false)
  })

  it('preserves an existing incomplete directory', async () => {
    const f = await fixture()
    await mkdir(f.expected, { recursive: true })
    await writeFile(join(f.expected, 'keep'), 'user data')
    await expect(ensureDesktopRuntime(f.profile, f.environment)).rejects.toBeInstanceOf(DesktopRuntimeError)
    expect(await readFile(join(f.expected, 'keep'), 'utf8')).toBe('user data')
  })

  it.each(['runtime.json', 'dependencies/pnpm/dist/pnpm.mjs', 'dependencies/node/bin/node.exe'])('refuses an incomplete fallback missing %s', async path => {
    const f = await fixture()
    await rm(join(f.source, path))
    await expect(ensureDesktopRuntime(f.profile, f.environment)).rejects.toBeInstanceOf(DesktopRuntimeError)
    await expect(lstat(f.expected)).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it.each([{ platform: 'linux' }, { arch: 'arm64' }, { pnpm: '0.0.0' }])('refuses mismatched fallback metadata %j', async fields => {
    const f = await fixture()
    const path = join(f.source, 'runtime.json')
    await writeFile(path, JSON.stringify({ ...JSON.parse(await readFile(path, 'utf8')), ...fields }))
    await expect(ensureDesktopRuntime(f.profile, f.environment)).rejects.toBeInstanceOf(DesktopRuntimeError)
    await expect(lstat(f.expected)).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('leaves CLI, custom commands and non-Windows hosts alone', async () => {
    const f = await fixture()
    expect(await ensureDesktopRuntime({}, f.environment)).toBe(false)
    expect(await ensureDesktopRuntime(f.profile, { ...f.environment, platform: 'linux' })).toBe(false)
    expect(await ensureDesktopRuntime({ ...f.profile, packageManager: { ...f.profile.packageManager, command: 'custom-node' } }, f.environment)).toBe(false)
    expect(await ensureDesktopRuntime({ ...f.profile, packageManager: { ...f.profile.packageManager, args: ['some-other.mjs'] } }, f.environment)).toBe(false)
    await expect(lstat(f.expected)).rejects.toMatchObject({ code: 'ENOENT' })
  })
})
