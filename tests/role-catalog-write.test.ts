import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  BUILTIN_ROLES,
  RoleOverlayValidationError,
  diffRolesAgainstBuiltin,
  mergeRoleCatalog,
  validateRolesFile,
} from '../src/role-catalog.ts'
import {
  deleteRolesFile,
  readOverlayDocument,
  resolveRoleCatalog,
  writeRolesFile,
} from '../src/role-catalog-io.ts'

describe('role overlay write path', () => {
  it('writes atomically and rejects invalid payloads without persisting', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'ae-roles-write-'))
    const path = join(directory, 'roles.json')
    try {
      await expect(writeRolesFile(path, { version: 2, roles: [] })).rejects.toBeInstanceOf(RoleOverlayValidationError)
      await expect(writeRolesFile(path, {
        version: 1,
        roles: [{ id: 'lead', responsibility: 'nope' }],
      })).rejects.toBeInstanceOf(RoleOverlayValidationError)
      await expect(readFile(path, 'utf8')).rejects.toMatchObject({ code: 'ENOENT' })

      const written = await writeRolesFile(path, {
        version: 1,
        roles: [{ id: 'frontend', responsibility: 'Custom UI brief.' }],
      })
      expect(written.roles).toEqual([{ id: 'frontend', responsibility: 'Custom UI brief.' }])
      const onDisk = JSON.parse(await readFile(path, 'utf8'))
      expect(onDisk).toEqual({
        version: 1,
        roles: [{ id: 'frontend', responsibility: 'Custom UI brief.' }],
      })
      const merged = await resolveRoleCatalog({ enabled: true, path })
      expect(merged.source).toBe('merged')
      expect(merged.roles.find(role => role.id === 'frontend')?.responsibility).toBe('Custom UI brief.')
      expect(merged.roles.find(role => role.id === 'frontend')?.skill).toBe('ae-frontend')
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })

  it('deleteRolesFile restores builtin and treats missing file as success', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'ae-roles-del-'))
    const path = join(directory, 'roles.json')
    try {
      await writeRolesFile(path, {
        version: 1,
        roles: [{ id: 'backend', responsibility: 'Custom backend' }],
      })
      await deleteRolesFile(path)
      await deleteRolesFile(path)
      const catalog = await resolveRoleCatalog({ enabled: true, path })
      expect(catalog.source).toBe('builtin')
      expect(catalog.roles.map(role => role.id)).toEqual(BUILTIN_ROLES.map(role => role.id))
      expect(await readOverlayDocument(path)).toBeUndefined()
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })

  it('diffRolesAgainstBuiltin records only dirty fields and custom ids', () => {
    const edited = mergeRoleCatalog(BUILTIN_ROLES, [
      { id: 'frontend', responsibility: 'Custom frontend' },
      { id: 'security', skill: 'ae-grill', responsibility: 'Threat model' },
    ])
    expect(diffRolesAgainstBuiltin(edited)).toEqual([
      { id: 'frontend', responsibility: 'Custom frontend' },
      { id: 'security', skill: 'ae-grill', responsibility: 'Threat model' },
    ])
    expect(diffRolesAgainstBuiltin(BUILTIN_ROLES)).toEqual([])
    expect(() => validateRolesFile({ version: 1, roles: [{ id: 'Bad_Id' }] })).toThrow(RoleOverlayValidationError)
  })

  it('readOverlayDocument isolates corrupt JSON', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'ae-roles-read-'))
    const path = join(directory, 'roles.json')
    try {
      await writeFile(path, '{broken', 'utf8')
      const warn = [] as string[]
      expect(await readOverlayDocument(path, message => { warn.push(message) })).toBeUndefined()
      expect(warn.length).toBeGreaterThan(0)
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })
})
