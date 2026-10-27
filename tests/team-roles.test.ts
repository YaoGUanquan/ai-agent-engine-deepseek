import { describe, expect, it } from 'vitest'
import { createRolePresentation, roleKeys, roleLabel } from '../src/team-roles.ts'
import { en, zh } from '../src/locales.ts'

describe('professional role presentation', () => {
  it('localizes each explicit responsibility and same-role numeric suffixes', () => {
    for (const [name, key] of Object.entries(roleKeys)) {
      expect(roleLabel(name, key => zh[key])).toBe(zh[key])
      expect(roleLabel(`${name}-2`, key => zh[key])).toBe(`${zh[key]} 2`)
      expect(roleLabel(name, key => en[key])).toBe(en[key])
    }
  })

  it('does not invent a role for historical or unrelated teammate names', () => {
    for (const name of ['collab-writer-a', 'backend-audit', 'frontend-copy', 'my-backend', 'backend-0']) {
      expect(roleLabel(name, key => zh[key])).toBe(name)
    }
  })

  it('displays the same role on members and owners without changing their routing identity', () => {
    const team = {
      members: [{ id: 'member-1', name: 'backend', phase: 'active' }],
      tasks: [
        { id: 'task-1', ownerName: 'backend', status: 'in_progress' },
        { id: 'task-2', status: 'pending' },
      ],
    }
    const present = createRolePresentation(key => zh[key])
    const displayed = present(team)
    expect(displayed.members[0]).toEqual({ id: 'member-1', name: '后端工程师', phase: 'active' })
    expect(displayed.tasks[0].ownerName).toBe('后端工程师')
    expect(displayed.tasks[1]).not.toHaveProperty('ownerName')
    expect(team.members[0].name).toBe('backend')
    expect(team.tasks[0].ownerName).toBe('backend')
    expect(present(team)).toBe(displayed)
  })
})
