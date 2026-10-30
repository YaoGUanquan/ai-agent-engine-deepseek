import { build } from 'esbuild'
import { mkdir } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { fileURLToPath } from 'node:url'

await mkdir('lib', { recursive: true })
await build({
  entryPoints: ['src/index.ts', 'src/engineering.ts'], outdir: 'lib', bundle: true,
  format: 'esm', platform: 'node', target: 'node24', packages: 'external',
})
const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const baseline = ['react', 'react-dom', 'react/jsx-runtime', '@deepseek-ai/cordis', '@deepseek-ai/dsh-client-store', '@deepseek-ai/dsh-client-ui-slots', '@deepseek-ai/dsh-client-ui-primitives']
await build({
  entryPoints: ['src/client.tsx'], outfile: 'lib/client.js', bundle: true,
  format: 'cjs', platform: 'browser', target: 'es2022',
  // Preserve bundled string values without multiline trailing whitespace.
  supported: { 'template-literal': false },
  external: [...baseline, ...pkg.dsh.client.external],
  plugins: [{
    name: 'harness-team-client',
    setup(builder) {
      builder.onResolve({ filter: /^@deepseek-ai\/dsh-experimental-client-ui-agent-team\/client$/ }, () => ({
        path: 'agent-team-client',
        namespace: 'harness-client',
      }))
      builder.onLoad({ filter: /.*/, namespace: 'harness-client' }, () => {
        // Official bundles register a lazy CJS factory, rather than exporting ESM.
        // Capture only the registration at build time; execute its body inside our feature scope.
        const registrations = []
        const path = fileURLToPath(import.meta.resolve('@deepseek-ai/dsh-experimental-client-ui-agent-team/client'))
        runInNewContext(readFileSync(path, 'utf8'), {
          window: { __ModuleLoader__: { load: registration => registrations.push(registration) } },
        }, { timeout: 1000 })
        const [registration] = registrations
        if (registrations.length !== 1 || registration?.id !== '@deepseek-ai/dsh-experimental-client-ui-agent-team'
          || typeof registration.factory !== 'function') throw new Error('Unsupported Harness Team client bundle')
        return { contents: `module.exports = (${registration.factory.toString()})(require);`, loader: 'js' }
      })
    },
  }],
  banner: { js: 'window.__ModuleLoader__.load({id:"ai-agent-engine-deepseek",factory:(require)=>{var module={exports:{}};var exports=module.exports;' },
  footer: { js: 'return module.exports;}});' },
})
for (const face of ['host', 'client']) {
  const result = spawnSync(process.execPath, ['node_modules/typescript/bin/tsc', '--declaration', '--emitDeclarationOnly', '--noEmit', 'false', '--allowImportingTsExtensions', '--outDir', 'lib', '--rootDir', 'src', '-p', `tsconfig.${face}.json`], { stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status ?? 1)
}
