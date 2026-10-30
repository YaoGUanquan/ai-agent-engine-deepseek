import { readFileSync, readdirSync, existsSync, realpathSync, statSync } from 'node:fs'
import { resolve, dirname, relative, isAbsolute } from 'node:path'
import assert from 'node:assert/strict'
import { parseDocument } from 'yaml'

const expected = ['ae-grill', 'ae-frontend', 'ae-backend', 'ae-unit-test', 'ae-integration-test', 'ae-e2e-test', 'ae-e2e-suite'].sort()
assert.deepEqual(readdirSync('skills').sort(), expected)
const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'))
assert.equal(pkg.license, 'GPL-2.0-only')
assert.equal(pkg.version, lock.version)
assert.equal(pkg.version, lock.packages[''].version)
assert.ok(readFileSync('README.md', 'utf8').includes(`github:YaoGUanquan/ai-agent-engine-deepseek#v${pkg.version}`))
assert.ok(readFileSync('CHANGELOG.md', 'utf8').includes(`## ${pkg.version} -`))
assert.equal(pkg.engines.dsh, '0.2.1-rc.5')
assert.deepEqual(lock.packages[''].engines, pkg.engines)
assert.deepEqual(lock.packages[''].peerDependencies, pkg.peerDependencies)
for (const [name, range] of Object.entries(pkg.peerDependencies)) {
  if (name.startsWith('@deepseek-ai/dsh-')) assert.equal(range, pkg.engines.dsh)
}
for (const [name, version] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })) {
  if (!name.startsWith('@deepseek-ai/dsh-')) continue
  assert.equal(version, pkg.engines.dsh)
  assert.equal(lock.packages[`node_modules/${name}`].version, version)
}
assert.ok(!pkg.files.some(path => path.startsWith('.harness')))
const patch = parseDocument(readFileSync('cordis.patch.yml', 'utf8'), { uniqueKeys: true })
assert.equal(patch.errors.length, 0)
const publicPaths = ['src', 'tools', 'prompts', 'compat', 'tests', 'README.md', 'CHANGELOG.md', 'NOTICE.md', 'LICENSE', 'package.json', 'package-lock.json', 'cordis.patch.yml']
if (existsSync('lib')) publicPaths.push('lib')
while (publicPaths.length) {
  const path = publicPaths.pop()
  if (statSync(path).isDirectory()) {
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      assert.ok(!entry.isSymbolicLink(), `Linked public resource: ${path}/${entry.name}`)
      publicPaths.push(`${path}/${entry.name}`)
    }
    continue
  }
  const text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(readFileSync(path))
  assert.ok(!text.includes('\uFFFD') && text.charCodeAt(0) !== 0xFEFF, `Invalid public text encoding: ${path}`)
  assert.ok(!/(?:[A-Z]:[\\/](?:Users|codes)[\\/]|sk-[a-zA-Z0-9]{24,})/.test(text), `Private path or credential in public content: ${path}`)
}
for (const name of expected) {
  const root = resolve('skills', name)
  const pending = [root]
  while (pending.length) {
    const directory = pending.pop()
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const file = resolve(directory, entry.name)
      assert.ok(!entry.isSymbolicLink(), `Linked skill resource: ${file}`)
      if (entry.isDirectory()) { pending.push(file); continue }
      const text = readFileSync(file, 'utf8')
      assert.ok(!text.includes('\uFFFD') && text.charCodeAt(0) !== 0xFEFF, `Invalid UTF-8: ${file}`)
      assert.ok(!/\b(?:spawn_agent|request_user_input|AskUserQuestion|subagent_type)\b/.test(text), `Foreign host syntax: ${file}`)
      assert.ok(!/(?:[A-Z]:\\(?:Users|codes)|sk-[a-zA-Z0-9]{24,})/.test(text), `Private path or credential: ${file}`)
      for (const match of text.matchAll(/\[[^\]\n]+\]\(([^)\s]+)\)/g)) {
        if (/^(?:https?:|#)/.test(match[1])) continue
        const target = resolve(dirname(file), decodeURIComponent(match[1].split('#')[0]))
        const path = relative(root, target)
        assert.ok(!path.startsWith('..') && !isAbsolute(path) && existsSync(target), `Broken or escaping resource: ${file}: ${match[1]}`)
        assert.ok(realpathSync(target).startsWith(root), `Linked resource escapes skill: ${file}`)
      }
    }
  }
  const text = readFileSync(resolve(root, 'SKILL.md'), 'utf8')
  const metadata = parseDocument(/^---\r?\n([\s\S]*?)\r?\n---/.exec(text)?.[1] ?? '')
  assert.equal(metadata.errors.length, 0)
  assert.equal(metadata.toJS().name, name)
  assert.ok(existsSync(resolve(root, 'references/teammate.md')))
}
assert.ok(!pkg.files.some(path => path.endsWith('.patch') || path === 'compat/'))
console.log('Validated version, seven skills, public content and encoding, and plugin-only package contents.')
