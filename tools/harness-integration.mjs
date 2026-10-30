import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'

const root = fileURLToPath(new URL('../', import.meta.url))
const upstream = resolve(process.argv[2] ?? resolve(root, '.harness/rc5'))
const supportedRuntime = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).engines.dsh
const fixtureRuntime = JSON.parse(readFileSync(resolve(upstream, 'package.json'), 'utf8')).version
if (fixtureRuntime !== supportedRuntime) {
  throw new Error(`Harness fixture ${fixtureRuntime} does not match supported runtime ${supportedRuntime}`)
}
const integration = resolve(upstream, '.ae-integration')
mkdirSync(integration, { recursive: true })
const target = resolve(integration, 'ae-plugin.e2e.ts')
const template = readFileSync(resolve(root, 'compat/harness/tests/ai-agent-engine.e2e.ts'), 'utf8')
writeFileSync(target, template
  .replace("from './scaffold.ts'", "from '../apps/web/tests/scaffold.ts'")
  .replace("from './support.ts'", "from '../apps/web/tests/support.ts'")
  .replace("from '../../../packages/", "from '../packages/"))
const playwright = createRequire(resolve(upstream, 'apps/web/package.json')).resolve('playwright')
writeFileSync(resolve(integration, 'vitest.config.ts'),
  "import base from '../vitest.web.config.ts'\nexport default { ...base, resolve: { alias: { playwright: "
  + JSON.stringify(playwright) + " } }, test: { ...base.test, include: ['.ae-integration/ae-plugin.e2e.ts'] } }\n")
const oldTarget = resolve(upstream, 'apps/web/tests/ae-plugin.e2e.ts')
// Remove only an earlier generated copy bearing this tool's fixture header.
if (existsSync(oldTarget) && readFileSync(oldTarget, 'utf8').startsWith('// Copied by tools/harness-integration.mjs')) unlinkSync(oldTarget)
const temporary = resolve(process.env.AE_HARNESS_TEST_TEMP ?? tmpdir())
mkdirSync(temporary, { recursive: true })
const child = spawn(process.execPath, [
  resolve(upstream, 'node_modules/vitest/vitest.mjs'),
  'run', '--config', '.ae-integration/vitest.config.ts',
  ...process.argv.slice(3),
], {
  cwd: upstream,
  env: { ...process.env, AE_PLUGIN_ROOT: process.env.AE_PLUGIN_INSTALL_ROOT ?? root, AE_HARNESS_SOURCE: upstream, DSH_SNAPSHOT: 'replay', TEMP: temporary, TMP: temporary },
  stdio: 'inherit',
})
child.once('error', error => { console.error(error.message); process.exitCode = 1 })
child.once('exit', code => { process.exitCode = code ?? 1 })
