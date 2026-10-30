import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import {
  BUILTIN_ROLES,
  formatRoleIds,
  formatRoleTable,
  mergeRoleCatalog,
  parseRolesFile,
  renderLeadPolicy,
  resolveRoleCatalog,
  resolveRolesFilePath,
} from '../src/role-catalog.ts'
import { buildEngineeringPolicy } from '../src/engineering.ts'

describe('role catalog builtins', () => {
  it('seeds the seven packaged engineering roles with skills', () => {
    expect(BUILTIN_ROLES.map(role => role.id)).toEqual([
      'requirements', 'frontend', 'backend', 'unit-test',
      'integration-test', 'browser-test', 'e2e-engineer',
    ])
    expect(BUILTIN_ROLES.every(role => typeof role.skill === 'string' && role.skill.startsWith('ae-'))).toBe(true)
  })

  it('renders lead placeholders for the default seed without mutation', () => {
    const template = 'Roles: {{ROLE_IDS}}\n\n{{ROLE_TABLE}}\n'
    const first = renderLeadPolicy(template, BUILTIN_ROLES)
    const second = renderLeadPolicy(template, BUILTIN_ROLES)
    expect(first).toContain('requirements, frontend, backend, unit-test, integration-test, browser-test, or e2e-engineer')
    expect(first).toContain('| frontend | ae-frontend |')
    expect(first).toBe(second)
    expect(template).toBe('Roles: {{ROLE_IDS}}\n\n{{ROLE_TABLE}}\n')
    expect(formatRoleIds(BUILTIN_ROLES.slice(0, 1))).toBe('requirements')
    expect(formatRoleIds(BUILTIN_ROLES.slice(0, 2))).toBe('requirements or frontend')
    expect(formatRoleTable([])).toContain('| Role | Skill | Responsibility |')
  })
})

describe('role catalog merge', () => {
  it('overrides recorded fields and appends custom ids', () => {
    const seed = BUILTIN_ROLES.map(role => ({ ...role }))
    const merged = mergeRoleCatalog(seed, [
      { id: 'frontend', responsibility: 'Custom frontend brief.' },
      { id: 'security', skill: 'ae-grill', responsibility: 'Threat model reviews.' },
    ])
    expect(merged.find(role => role.id === 'frontend')).toEqual({
      id: 'frontend', skill: 'ae-frontend', responsibility: 'Custom frontend brief.',
    })
    expect(merged.at(-1)).toEqual({
      id: 'security', skill: 'ae-grill', responsibility: 'Threat model reviews.',
    })
    expect(seed.find(role => role.id === 'frontend')?.responsibility).toContain('Implement accessible UI')
    expect(BUILTIN_ROLES.find(role => role.id === 'frontend')?.responsibility).toContain('Implement accessible UI')
  })

  it('restore default is empty/missing overlay (builtin only)', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'ae-roles-'))
    try {
      const missing = await resolveRoleCatalog({ enabled: true, path: join(directory, 'roles.json') })
      expect(missing.source).toBe('builtin')
      expect(missing.roles.map(role => role.id)).toEqual(BUILTIN_ROLES.map(role => role.id))
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })
})

describe('role catalog isolation', () => {
  it('falls back to builtin on corrupt JSON without throwing', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'ae-roles-'))
    const path = join(directory, 'roles.json')
    const warn = vi.fn()
    try {
      await writeFile(path, '{not-json', 'utf8')
      const result = await resolveRoleCatalog({ enabled: true, path, warn })
      expect(result.source).toBe('builtin')
      expect(result.roles).toHaveLength(BUILTIN_ROLES.length)
      expect(warn).toHaveBeenCalled()
      expect(parseRolesFile('{', warn)).toBeUndefined()
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })

  it('skips invalid overlay rows but keeps valid siblings', () => {
    const warn = vi.fn()
    const overlay = parseRolesFile(JSON.stringify({
      version: 1,
      roles: [
        { id: 'lead', responsibility: 'nope' },
        { id: 'Backend' },
        { id: 'frontend', responsibility: 'OK frontend' },
        null,
        { id: 'security', skill: 1 },
      ],
    }), warn)
    expect(overlay).toEqual([{ id: 'frontend', responsibility: 'OK frontend' }])
    expect(warn.mock.calls.length).toBeGreaterThanOrEqual(3)
  })

  it('rolesEnabled=false ignores overlay content', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'ae-roles-'))
    const path = join(directory, 'roles.json')
    try {
      await writeFile(path, JSON.stringify({
        version: 1,
        roles: [{ id: 'frontend', responsibility: 'Should not apply' }],
      }), 'utf8')
      const result = await resolveRoleCatalog({ enabled: false, path })
      expect(result.source).toBe('builtin')
      expect(result.roles.find(role => role.id === 'frontend')?.responsibility).toContain('Implement accessible UI')
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })

  it('parallel session merges do not share or mutate catalog objects', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'ae-roles-'))
    const pathA = join(directory, 'a.json')
    const pathB = join(directory, 'b.json')
    try {
      await writeFile(pathA, JSON.stringify({
        version: 1,
        roles: [{ id: 'frontend', responsibility: 'Session A frontend' }],
      }), 'utf8')
      await writeFile(pathB, JSON.stringify({
        version: 1,
        roles: [
          { id: 'backend', responsibility: 'Session B backend' },
          { id: 'security', skill: 'ae-grill', responsibility: 'Session B only' },
        ],
      }), 'utf8')

      const [a, b, c] = await Promise.all([
        resolveRoleCatalog({ enabled: true, path: pathA }),
        resolveRoleCatalog({ enabled: true, path: pathB }),
        resolveRoleCatalog({ enabled: true, path: pathA }),
      ])

      expect(a.roles.find(role => role.id === 'frontend')?.responsibility).toBe('Session A frontend')
      expect(b.roles.find(role => role.id === 'frontend')?.responsibility).toContain('Implement accessible UI')
      expect(b.roles.find(role => role.id === 'security')?.responsibility).toBe('Session B only')
      expect(a.roles.find(role => role.id === 'security')).toBeUndefined()
      expect(c.roles.find(role => role.id === 'frontend')?.responsibility).toBe('Session A frontend')

      // Mutating one result must not affect another parallel resolve.
      ;(a.roles.find(role => role.id === 'frontend') as { responsibility: string }).responsibility = 'mutated'
      expect(c.roles.find(role => role.id === 'frontend')?.responsibility).toBe('Session A frontend')
      expect(BUILTIN_ROLES.find(role => role.id === 'frontend')?.responsibility).toContain('Implement accessible UI')
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })

  it('builds independent lead policies for concurrent builtin-role spawns', async () => {
    const policies = await Promise.all([
      buildEngineeringPolicy({ rolesEnabled: true, rolesPath: '' }),
      buildEngineeringPolicy({ rolesEnabled: true, rolesPath: '' }),
      buildEngineeringPolicy({ rolesEnabled: false, rolesPath: '/tmp/does-not-matter.json' }),
    ])
    for (const policy of policies) {
      expect(policy).toContain('| backend | ae-backend |')
      expect(policy).toContain('| frontend | ae-frontend |')
      expect(policy).not.toContain('{{ROLE_IDS}}')
      expect(policy).not.toContain('{{ROLE_TABLE}}')
      expect(policy).toContain('spawn_teammate')
    }
    expect(policies[0]).toBe(policies[1])
    expect(policies[0]).toBe(policies[2])
    // Distinct string instances are fine; content must stay builtin and stable.
    policies[0] = `${policies[0]}\nMUTATED`
    expect(policies[1]).not.toContain('MUTATED')
  })
})

describe('roles path resolution', () => {
  it('prefers explicit path and otherwise uses DSH_HOME', () => {
    expect(resolveRolesFilePath('/tmp/custom-roles.json')).toBe('/tmp/custom-roles.json')
    const previous = process.env.DSH_HOME
    try {
      delete process.env.DSH_HOME
      expect(resolveRolesFilePath('')).toBeUndefined()
      expect(resolveRolesFilePath(undefined)).toBeUndefined()
      process.env.DSH_HOME = join(tmpdir(), 'dsh-home')
      expect(resolveRolesFilePath()).toBe(join(process.env.DSH_HOME, 'ai-agent-engine', 'roles.json'))
    } finally {
      if (previous === undefined) delete process.env.DSH_HOME
      else process.env.DSH_HOME = previous
    }
  })
})
