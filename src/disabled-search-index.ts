import { stat } from 'node:fs/promises'
import { resolve } from 'node:path'

/** Remove selected records from an existing, disabled rc.3 disposable index. */
export async function clearDisabledSearchIndex(path: string | undefined, ids: readonly string[]): Promise<void> {
  if (!path) throw new Error('The disabled search index has no known storage path')
  if (path === ':memory:') return
  const target = resolve(path)
  try { await stat(target) } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return
    throw error
  }
  const { DatabaseSync } = await import('node:sqlite')
  const db = new DatabaseSync(target)
  try {
    const application = db.prepare('PRAGMA application_id').get()
    const version = db.prepare('PRAGMA user_version').get()
    if (application?.application_id !== 0x44534851 || version?.user_version !== 8) {
      throw new Error('The search index is not a recognized Harness rc.3 index')
    }
    db.exec('PRAGMA busy_timeout = 5000')
    db.exec('BEGIN IMMEDIATE')
    try {
      const documents = db.prepare('DELETE FROM persisted_docs WHERE session_id = ?')
      const sessions = db.prepare('DELETE FROM persisted_sessions WHERE id = ?')
      for (const id of ids) { documents.run(id); sessions.run(id) }
      db.exec('UPDATE search_state SET global_generation = global_generation + 1 WHERE singleton = 1')
      db.exec('COMMIT')
    } catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
  } finally { db.close() }
}
