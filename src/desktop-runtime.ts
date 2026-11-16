import { lstat, mkdir, readFile, realpath, stat, symlink } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'

export interface DesktopRuntimeProfile {
  home?: string
  packageManager?: { command: string; args: readonly string[]; env?: Readonly<Record<string, string>> }
}

export class DesktopRuntimeError extends Error {}

async function missing(path: string): Promise<boolean> {
  try { await lstat(path); return false } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return true
    throw error
  }
}

/** Repair only the known packaged Windows layout, after an owner requests installation. */
export async function ensureDesktopRuntime(
  profile: DesktopRuntimeProfile,
  environment = { platform: process.platform, arch: process.arch, executable: process.execPath },
): Promise<boolean> {
  const manager = profile.packageManager
  if (environment.platform !== 'win32' || !manager || !profile.home
    || resolve(manager.command) !== resolve(environment.executable)
    || manager.env?.ELECTRON_RUN_AS_NODE !== '1') return false
  const resources = join(dirname(environment.executable), 'resources')
  const expected = join(resources, 'runtime', 'primary-runtime')
  const entry = join(expected, 'dependencies', 'pnpm', 'bin', 'pnpm.mjs')
  if (manager.args.length !== 2 || manager.args[0] !== '--expose-internals'
    || resolve(manager.args[1]!) !== resolve(entry)) return false
  try {
    if (!await missing(entry)) return false
    // Never replace even an incomplete directory or a dangling junction.
    if (!await missing(expected)) {
      if (!await missing(entry)) return false
      throw new DesktopRuntimeError('The Desktop runtime is incomplete. Repair the Desktop installation and retry.')
    }
    const source = join(profile.home, 'dsh-runtimes', 'dsh-primary-runtime')
    const metadata = JSON.parse(await readFile(join(source, 'runtime.json'), 'utf8'))
    const pnpm = JSON.parse(await readFile(join(source, 'dependencies', 'pnpm', 'package.json'), 'utf8'))
    if (metadata.platform !== 'win32' || metadata.arch !== environment.arch
      || typeof metadata.desktopVersion !== 'string' || !/^\d+\.\d+\.\d+/.test(metadata.desktopVersion)
      || typeof metadata.pnpm !== 'string' || metadata.pnpm !== pnpm.version || pnpm.name !== 'pnpm'
      || typeof metadata.node !== 'string' || !/^\d+\.\d+\.\d+$/.test(metadata.node)) {
      throw new DesktopRuntimeError('No matching local Desktop runtime was found. Repair the Desktop installation and retry.')
    }
    for (const file of [
      join(source, 'dependencies', 'pnpm', 'bin', 'pnpm.mjs'),
      join(source, 'dependencies', 'pnpm', 'dist', 'pnpm.mjs'),
      join(source, 'dependencies', 'node', 'bin', 'node.exe'),
    ]) {
      if (!(await stat(file)).isFile()) throw new DesktopRuntimeError('The local Desktop runtime is incomplete. Repair the Desktop installation and retry.')
    }
    // The real executable's resources directory must already belong to the Host.
    if (!(await stat(resources)).isDirectory()) throw new DesktopRuntimeError('The Desktop resources directory is unavailable.')
    const target = await realpath(source)
    await mkdir(dirname(expected), { recursive: true })
    try { await symlink(target, expected, 'junction') } catch (error) {
      // Another update may have restored this same mapping concurrently.
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST' || await realpath(expected) !== target) throw error
      return false
    }
    return true
  } catch (error) {
    if (error instanceof DesktopRuntimeError) throw error
    throw new DesktopRuntimeError('The Desktop package manager runtime could not be restored. Check installation permissions or repair Desktop, then retry.')
  }
}
