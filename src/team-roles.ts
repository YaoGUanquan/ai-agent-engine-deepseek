export const roleKeys = {
  lead: 'role.lead',
  requirements: 'role.requirements',
  frontend: 'role.frontend',
  backend: 'role.backend',
  'unit-test': 'role.unit-test',
  'integration-test': 'role.integration-test',
  'browser-test': 'role.browser-test',
  'e2e-engineer': 'role.e2e-engineer',
} as const

export type RoleKey = typeof roleKeys[keyof typeof roleKeys]

/** Names remain official routing identities; only their presentation changes. */
export function roleLabel(name: string, translate: (key: RoleKey) => string): string {
  for (const [role, key] of Object.entries(roleKeys)) {
    if (name === role) return translate(key)
    const suffix = name.slice(role.length)
    if (name.startsWith(role) && /^-[1-9]\d*$/.test(suffix)) {
      return `${translate(key)} ${suffix.slice(1)}`
    }
  }
  return name
}

interface TeamPresentation {
  readonly members: readonly { readonly name: string }[]
  readonly tasks: readonly { readonly ownerName?: string }[]
}

/** Preserve reference identity between store reads, without rewriting host data. */
export function createRolePresentation(translate: (key: RoleKey) => string) {
  const cache = new WeakMap<TeamPresentation, TeamPresentation>()
  return <T extends TeamPresentation>(team: T): T => {
    const cached = cache.get(team)
    if (cached) return cached as T
    const result = {
      ...team,
      members: team.members.map(member => ({ ...member, name: roleLabel(member.name, translate) })),
      tasks: team.tasks.map(task => task.ownerName === undefined
        ? task : { ...task, ownerName: roleLabel(task.ownerName, translate) }),
    } as T
    cache.set(team, result)
    return result
  }
}
