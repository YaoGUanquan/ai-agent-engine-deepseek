import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import type { Context } from '@deepseek-ai/cordis'
import { BUNDLED_SKILL_RANK, type SkillCandidate } from '@deepseek-ai/dsh-skill'
import { parse } from 'yaml'

export const skillNames = [
  'ae-grill', 'ae-frontend', 'ae-backend', 'ae-unit-test',
  'ae-integration-test', 'ae-e2e-test', 'ae-e2e-suite',
] as const

/** Register packaged skills; the local project retains normal precedence. */
export function installSkills(ctx: Context): void {
  const provider = 'ai-agent-engine'
  const candidate = async (name: string): Promise<SkillCandidate> => {
    const resourceBase = { kind: 'directory' as const, path: fileURLToPath(new URL(`../skills/${name}/`, import.meta.url)) }
    const text = await readFile(new URL(`../skills/${name}/SKILL.md`, import.meta.url), 'utf8')
    const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(text)
    if (!frontmatter) throw new Error(`Missing skill frontmatter: ${name}`)
    const data = parse(frontmatter[1]) as { name: string; description: string }
    if (data.name !== name || !data.description) throw new Error(`Invalid skill metadata: ${name}`)
    return {
      name, description: data.description, provider, source: 'bundled',
      rank: BUNDLED_SKILL_RANK, invocation: { modelInvocable: true, userInvocable: true },
      resourceBase, locator: name,
    }
  }
  ctx.skills.registerProvider(() => ({
    name: provider,
    list: () => Promise.all(skillNames.map(candidate)),
    async get(selected) {
      if (!skillNames.some(name => name === selected.name)) return undefined
      const text = await readFile(new URL(`../skills/${selected.name}/SKILL.md`, import.meta.url), 'utf8')
      return { ...selected, content: text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '') }
    },
  }))
}
