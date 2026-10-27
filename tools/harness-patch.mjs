import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const project = fileURLToPath(new URL('../', import.meta.url))
const base = resolve(project, '.harness/base')
const source = resolve(project, '.harness/upstream')
const output = resolve(project, 'compat/harness')
const patch = resolve(output, 'dsh-v0.2.1-rc.3.patch')
const manifest = resolve(output, 'manifest.json')
const originals = [
  'docs/architecture.md',
  'packages/core/agent-loop/src/agent.ts',
  'packages/core/agent-loop/src/inbox.ts',
  'packages/core/agent-loop/tests/inbox.spec.ts',
  'packages/core/agent/src/index.ts',
  'packages/core/session/src/index.ts',
  'packages/session/session-persistence/src/index.ts',
  'packages/session/session-persistence-jsonl/src/index.ts',
  'packages/session/session-persistence-jsonl/src/storage.ts',
  'packages/session/session-persistence-jsonl/tests/jsonl.spec.ts',
  'packages/session/session-projection-cache/src/index.ts',
  'packages/session-query/session-query/src/index.ts',
  'packages/session-query/session-query-sqlite/src/index.ts',
  'packages/session-query/session-query-sqlite/tests/sqlite.spec.ts',
  'packages/workspace/workspace/src/index.ts',
  'packages/api/session-controller/src/index.ts',
  'packages/api/session-controller/src/types.ts',
  'packages/api/session-controller/tsconfig.host.json',
  'packages/client/ui-workspace/src/client/rows/Rows.tsx',
  'packages/client/ui-workspace/src/client/navigation.ts',
  'packages/client/ui-workspace/tests/workspaces-service.client.spec.ts',
]
const additions = [
  'packages/api/session-controller/src/deletion.ts',
  'packages/api/session-controller/tests/deletion.spec.ts',
  'packages/session/session-persistence-jsonl/src/deletion.ts',
  'packages/session/session-persistence-jsonl/tests/deletion.spec.ts',
]
const hash = file => createHash('sha256').update(readFileSync(file)).digest('hex')
function git(args, cwd) {
  const result = spawnSync('git', ['-c', 'core.autocrlf=false', ...args], {
    cwd, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
    // A source archive nested in this repository must not inherit its Git root.
    env: { ...process.env, GIT_CEILING_DIRECTORIES: dirname(cwd) },
  })
  if (result.error) throw result.error
  return result
}
const mode = process.argv[2] ?? 'check'
if (mode === 'generate') {
  mkdirSync(output, { recursive: true })
  const chunks = []
  for (const path of [...originals, ...additions]) {
    const old = originals.includes(path) ? `.harness/base/${path}` : '/dev/null'
    const result = git(['diff', '--no-index', '--', old, `.harness/upstream/${path}`], project)
    if (![0, 1].includes(result.status)) throw new Error(result.stderr)
    chunks.push(result.stdout.replaceAll('a/.harness/base/', 'a/').replaceAll('b/.harness/upstream/', 'b/').replaceAll('a/.harness/upstream/', 'a/'))
  }
  writeFileSync(patch, chunks.join(''), 'utf8')
  writeFileSync(manifest, JSON.stringify({
    tag: 'dsh-v0.2.1-rc.3',
    commit: '1f81c047fc48fa190a683e469daa699857e9afe8',
    patchSha256: hash(patch),
    files: Object.fromEntries([...originals.map(path => [path, hash(resolve(base, path))]), ...additions.map(path => [path, null])]),
  }, null, 2) + '\n')
  console.log(`Generated ${patch}`)
} else if (mode === 'check' || mode === 'apply') {
  const target = resolve(process.argv[3] ?? base)
  const data = JSON.parse(readFileSync(manifest, 'utf8'))
  if (hash(patch) !== data.patchSha256) throw new Error('Patch checksum does not match manifest')
  for (const [path, expected] of Object.entries(data.files)) {
    const file = resolve(target, path)
    if (expected === null ? existsSync(file) : !existsSync(file) || hash(file) !== expected) {
      throw new Error(`Source differs from the pinned baseline: ${path}`)
    }
  }
  const checked = git(['apply', '--check', '--whitespace=error', patch], target)
  if (checked.status !== 0) throw new Error(checked.stderr)
  if (mode === 'apply') {
    const applied = git(['apply', patch], target)
    if (applied.status !== 0) throw new Error(applied.stderr)
  }
  console.log(`${mode}: verified source hashes and patch for ${target}`)
} else {
  throw new Error('Use generate, check [source-directory], or apply <source-directory>')
}
