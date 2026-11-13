import { readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import semver from 'semver'
import ts from 'typescript'

const root = fileURLToPath(new URL('../', import.meta.url))
const upstream = resolve(process.argv[2] ?? resolve(root, '.harness/rc5'))
const supportedRuntime = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).engines.dsh
const fixtureRuntime = JSON.parse(readFileSync(resolve(upstream, 'package.json'), 'utf8')).version
if (!semver.satisfies(fixtureRuntime, supportedRuntime, { includePrerelease: true })) {
  throw new Error(`Harness fixture ${fixtureRuntime} does not match supported runtime ${supportedRuntime}`)
}
const integration = resolve(process.env.AE_HARNESS_TEST_DIR ?? resolve(upstream, '.ae-integration'))
mkdirSync(integration, { recursive: true })
const target = resolve(integration, 'ae-plugin.e2e.ts')
const pathOf = path => resolve(upstream, path).replaceAll('\\', '/')
const facade = ts.readConfigFile(resolve(upstream, 'tsconfig.base.json'), ts.sys.readFile)
if (facade.error) throw new Error(ts.flattenDiagnosticMessageText(facade.error.messageText, '\n'))
// External generated tests are outside the facade's importer scope in strict layouts.
const workspaceSource = name => {
  const paths = facade.config.compilerOptions?.paths?.[name]
  if (!Array.isArray(paths) || paths.length !== 1 || typeof paths[0] !== 'string' || paths[0].includes('*')) {
    throw new Error(`The Harness source facade has no unambiguous entry for ${name}`)
  }
  const target = resolve(upstream, paths[0])
  return statSync(target).isDirectory() ? resolve(target, 'index.ts') : target
}
const template = readFileSync(resolve(root, 'compat/harness/tests/ai-agent-engine.e2e.ts'), 'utf8')
const pluginRequire = createRequire(resolve(root, 'package.json'))
writeFileSync(target, template
  .replace(/from\s+(['"])(@deepseek-ai\/[^'"]+)\1/g, (_match, _quote, name) =>
    `from ${JSON.stringify(workspaceSource(name).replaceAll('\\', '/'))}`)
  .replace("'yaml'", JSON.stringify(pluginRequire.resolve('yaml').replaceAll('\\', '/')))
  .replace("'./scaffold.ts'", JSON.stringify(pathOf('apps/web/tests/scaffold.ts')))
  .replace("'./support.ts'", JSON.stringify(pathOf('apps/web/tests/support.ts')))
  .replace("'../../../packages/core/agent-loop/tests/mock-adapter.ts'", JSON.stringify(pathOf('packages/core/agent-loop/tests/mock-adapter.ts'))))
const require = createRequire(resolve(upstream, 'apps/web/package.json'))
const config = resolve(integration, 'vitest.config.mts')
writeFileSync(config,
  `import base from ${JSON.stringify(pathOf('vitest.web.config.ts'))}\n`
  + `export default { ...base, root: ${JSON.stringify(pathOf('.'))}, resolve: { alias: `
  + JSON.stringify({ playwright: require.resolve('playwright'), vitest: pathOf('node_modules/vitest/dist/index.js') })
  + ` }, test: { ...base.test, include: [${JSON.stringify(target.replaceAll('\\', '/'))}] } }\n`)
const temporary = resolve(process.env.AE_HARNESS_TEST_TEMP ?? tmpdir())
mkdirSync(temporary, { recursive: true })
// Plugins that read process.env directly must not see the user's real home.
const harnessHome = resolve(integration, 'home')
mkdirSync(harnessHome, { recursive: true })
const child = spawn(process.execPath, [
  resolve(upstream, 'node_modules/vitest/vitest.mjs'),
  'run', '--config', config,
  ...process.argv.slice(3),
], {
  cwd: upstream,
  env: { ...process.env, AE_PLUGIN_ROOT: process.env.AE_PLUGIN_INSTALL_ROOT ?? root, AE_HARNESS_SOURCE: upstream, DSH_SNAPSHOT: 'replay', DSH_HOME: harnessHome, TEMP: temporary, TMP: temporary },
  stdio: 'inherit',
})
child.once('error', error => { console.error(error.message); process.exitCode = 1 })
child.once('exit', code => { process.exitCode = code ?? 1 })
