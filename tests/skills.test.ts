import { describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Skills from '@deepseek-ai/dsh-skill'
import { installSkills } from '../src/skills.ts'

describe('packaged native skills', () => {
  it('loads all seven skills with their original resource directories and unloads cleanly', async () => {
    const ctx = new Context()
    const skills = ctx.plugin(Skills)
    await skills.await()
    const provider = ctx.plugin({ inject: ['skills'], apply: installSkills })
    await provider.await()
    const registry = ctx.get('skills')!
    const summaries = await registry.list()
    expect(summaries).toHaveLength(7)
    const backend = await registry.get('ae-backend')
    expect(backend?.content).toContain('references/teammate.md')
    expect(backend?.resourceBase?.kind).toBe('directory')
    await provider.dispose()
    expect(await registry.list()).toEqual([])
    await ctx.fiber.dispose()
  })
})
