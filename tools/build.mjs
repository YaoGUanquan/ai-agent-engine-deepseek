import { build } from 'esbuild'
import { mkdir } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

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
  external: [...baseline, ...pkg.dsh.client.external],
  banner: { js: 'window.__ModuleLoader__.load({id:"ai-agent-engine-deepseek",factory:(require)=>{var module={exports:{}};var exports=module.exports;' },
  footer: { js: 'return module.exports;}});' },
})
for (const face of ['host', 'client']) {
  const result = spawnSync(process.execPath, ['node_modules/typescript/bin/tsc', '--declaration', '--emitDeclarationOnly', '--noEmit', 'false', '--allowImportingTsExtensions', '--outDir', 'lib', '--rootDir', 'src', '-p', `tsconfig.${face}.json`], { stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status ?? 1)
}
