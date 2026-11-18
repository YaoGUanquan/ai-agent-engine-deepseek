import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { BUILTIN_ROLES, renderLeadPolicy } from '../src/role-catalog.ts'

const template = readFileSync(new URL('../prompts/lead.md', import.meta.url), 'utf8')
const policy = renderLeadPolicy(template, BUILTIN_ROLES)

describe('lead policy follows the host team collaboration model', () => {
  it('places every configured role in the rendered table', () => {
    expect(policy).not.toContain('{{')
    for (const role of BUILTIN_ROLES) {
      expect(policy).toContain(`| ${role.id} | ${role.skill} | ${role.responsibility} |`)
    }
  })

  it('describes the per-session team switch and both collaboration paths', () => {
    expect(policy).toContain('Enable agent teamwork')
    expect(policy).toContain('new sessions')
    expect(policy).toContain('team_task_*')
    expect(policy).toContain('team_task_create')
    expect(policy).toContain('shared task board')
    // Team off still permits plain subagent delegation with the brief inline.
    expect(policy).toMatch(/`team_task_\*` tools are absent[\s\S]*?`subagent`/)
  })

  it('creates teammates with the host subagent tools and their names', () => {
    expect(policy).toContain('`subagent`')
    expect(policy).toContain('`subagent_fork`')
    expect(policy).toContain('exact name returned by `subagent`')
    // The removed legacy tool must not reappear in model guidance.
    expect(policy).not.toContain('spawn_teammate')
    expect(policy).not.toContain('official Team roster')
  })

  it('keeps integration, authority and evidence boundaries', () => {
    expect(policy).toContain('Integrate and verify')
    expect(policy).toContain('authorization')
    expect(policy).toContain('Never claim a layer that was not exercised')
  })
})
