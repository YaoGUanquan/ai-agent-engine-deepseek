import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { describe, expect, it } from 'vitest'
import { clearDisabledSearchIndex, validateSearchIndex } from '../src/disabled-search-index.ts'

describe('disabled Harness search index cleanup', () => {
  it('deletes only the selected identities and retains unrelated documents', async () => {
    const root = await mkdtemp(join(tmpdir(), 'ae-index-'))
    const path = join(root, 'search.sqlite')
    const db = new DatabaseSync(path)
    try {
      db.exec('PRAGMA application_id = 1146308689; PRAGMA user_version = 8')
      db.exec('CREATE TABLE persisted_sessions (id TEXT PRIMARY KEY)')
      db.exec('CREATE VIRTUAL TABLE persisted_docs USING fts5(text, session_id UNINDEXED)')
      db.exec('CREATE TABLE search_state (singleton INTEGER PRIMARY KEY, global_generation INTEGER)')
      db.exec('INSERT INTO search_state VALUES (1, 0)')
      for (const id of ['deleted', 'retained']) {
        db.prepare('INSERT INTO persisted_sessions VALUES (?)').run(id)
        db.prepare('INSERT INTO persisted_docs (text, session_id) VALUES (?, ?)').run('Synthetic document', id)
      }
      await clearDisabledSearchIndex(path, ['deleted'])
      expect(db.prepare('SELECT id FROM persisted_sessions').all()).toEqual([{ id: 'retained' }])
      expect(db.prepare('SELECT session_id FROM persisted_docs').all()).toEqual([{ session_id: 'retained' }])
      expect(db.prepare('SELECT global_generation FROM search_state').get()?.global_generation).toBe(1)
    } finally {
      db.close()
      await rm(root, { recursive: true, force: true })
    }
  })

  it('refuses a foreign database without altering its contents', async () => {
    const root = await mkdtemp(join(tmpdir(), 'ae-foreign-index-'))
    const path = join(root, 'foreign.sqlite')
    const db = new DatabaseSync(path)
    try {
      db.exec('CREATE TABLE preserved (id INTEGER); INSERT INTO preserved VALUES (1)')
      await expect(validateSearchIndex(path)).rejects.toThrow('not a recognized')
      await expect(clearDisabledSearchIndex(path, ['deleted'])).rejects.toThrow('not a recognized')
      expect(db.prepare('SELECT id FROM preserved').all()).toEqual([{ id: 1 }])
    } finally {
      db.close()
      await rm(root, { recursive: true, force: true })
    }
  })
})
