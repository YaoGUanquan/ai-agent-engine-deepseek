import { useCallback, useEffect, useState } from 'react'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { Button, Input } from '@deepseek-ai/dsh-client-ui-primitives'
import type { LocaleKey } from './locales.ts'
import {
  BUILTIN_ROLES,
  diffRolesAgainstBuiltin,
  isValidRoleId,
  mergeRoleCatalog,
  type RoleDefinition,
} from './role-catalog.ts'
import type { RolesRemote } from './roles-contract.ts'

type RolesSettingsProps = PropsRuntime<'settings.section'>
  & PropsLocale<'ai-agent-engine'>
  & { roles: RolesRemote }

interface DraftRole {
  id: string
  skill: string
  responsibility: string
  custom: boolean
}

function toDraft(roles: readonly RoleDefinition[]): DraftRole[] {
  const builtinIds = new Set(BUILTIN_ROLES.map(role => role.id))
  return roles.map(role => ({
    id: role.id,
    skill: role.skill ?? '',
    responsibility: role.responsibility ?? '',
    custom: !builtinIds.has(role.id),
  }))
}

function draftToDefinitions(draft: readonly DraftRole[]): RoleDefinition[] {
  return draft.map(role => ({
    id: role.id.trim(),
    skill: role.skill.trim() || undefined,
    responsibility: role.responsibility,
  }))
}

async function unwrap<T>(call: Promise<{ ok: true; value: T } | { ok: false; error: unknown }> | Promise<T>): Promise<T> {
  const result = await call as T | { ok: true; value: T } | { ok: false; error: unknown }
  if (result && typeof result === 'object' && 'ok' in result) {
    if (!result.ok) throw result.error
    return result.value
  }
  return result
}

/** Settings section for editing the shared roles.json overlay via aeRoles RPC. */
export function RolesSettingsPage({ roles, t }: RolesSettingsProps) {
  const [draft, setDraft] = useState<DraftRole[]>([])
  const [path, setPath] = useState<string | undefined>()
  const [source, setSource] = useState<'builtin' | 'merged'>('builtin')
  const [enabled, setEnabled] = useState(true)
  const [status, setStatus] = useState<'loading' | 'ready' | 'saving' | 'error'>('loading')
  const [message, setMessage] = useState<string>('')
  const [newId, setNewId] = useState('')

  const load = useCallback(async () => {
    setStatus('loading')
    setMessage('')
    try {
      const catalog = await unwrap(roles.getCatalog({}) as never)
      setDraft(toDraft(catalog.roles))
      setPath(catalog.path)
      setSource(catalog.source)
      setEnabled(catalog.enabled)
      setStatus('ready')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : t('roles.loadFailed'))
    }
  }, [roles, t])

  useEffect(() => { void load() }, [load])

  const updateRow = (index: number, patch: Partial<DraftRole>) => {
    setDraft(current => current.map((row, i) => i === index ? { ...row, ...patch } : row))
  }

  const removeCustom = (index: number) => {
    setDraft(current => current.filter((row, i) => i !== index || !row.custom))
  }

  const addCustom = () => {
    const id = newId.trim()
    if (!isValidRoleId(id) || draft.some(row => row.id === id)) {
      setMessage(t('roles.invalidId'))
      return
    }
    setDraft(current => [...current, { id, skill: '', responsibility: '', custom: true }])
    setNewId('')
    setMessage('')
  }

  const save = async () => {
    setStatus('saving')
    setMessage('')
    try {
      const definitions = draftToDefinitions(draft)
      for (const role of definitions) {
        if (!isValidRoleId(role.id)) throw new Error(t('roles.invalidId'))
      }
      const overlay = diffRolesAgainstBuiltin(definitions)
      const result = await unwrap(roles.putOverlay({ version: 1, roles: overlay }) as never)
      setDraft(toDraft(result.roles))
      setPath(result.path)
      setSource(result.source)
      setStatus('ready')
      setMessage(t('roles.saved'))
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : t('roles.saveFailed'))
    }
  }

  const restore = async () => {
    setStatus('saving')
    setMessage('')
    try {
      const result = await unwrap(roles.restoreDefaults({}) as never)
      setDraft(toDraft(result.roles.length ? result.roles : mergeRoleCatalog(BUILTIN_ROLES, [])))
      setPath(result.path)
      setSource('builtin')
      setStatus('ready')
      setMessage(t('roles.restored'))
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : t('roles.saveFailed'))
    }
  }

  if (status === 'loading' && draft.length === 0) {
    return <p role="status">{t('roles.loading')}</p>
  }

  return (
    <div data-ae-roles-settings style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 720 }}>
      <p>{t('roles.intro')}</p>
      <p style={{ opacity: 0.8, fontSize: 12 }}>
        {t('roles.pathLabel')}: {path ?? t('roles.pathUnavailable')} · {t('roles.sourceLabel')}: {source}
        {!enabled ? ` · ${t('roles.disabledHint')}` : ''}
      </p>
      {draft.map((row, index) => (
        <div key={row.id} data-ae-role-row={row.id} style={{ display: 'grid', gap: 6, padding: 8, border: '1px solid rgba(127,127,127,0.35)', borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
            <strong>{row.id}{row.custom ? ` (${t('roles.custom')})` : ''}</strong>
            {row.custom && <Button variant="outline" onClick={() => removeCustom(index)}>{t('roles.remove')}</Button>}
          </div>
          <label style={{ display: 'grid', gap: 4 }}>
            <span>{t('roles.skill')}</span>
            <Input value={row.skill} onChange={event => updateRow(index, { skill: event.target.value })} />
          </label>
          <label style={{ display: 'grid', gap: 4 }}>
            <span>{t('roles.responsibility')}</span>
            <Input value={row.responsibility} onChange={event => updateRow(index, { responsibility: event.target.value })} />
          </label>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Input value={newId} placeholder={t('roles.newIdPlaceholder')} onChange={event => setNewId(event.target.value)} />
        <Button variant="outline" onClick={addCustom}>{t('roles.add')}</Button>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button disabled={status === 'saving'} onClick={() => { void save() }}>{status === 'saving' ? t('roles.saving') : t('roles.save')}</Button>
        <Button variant="outline" disabled={status === 'saving'} onClick={() => { void restore() }}>{t('roles.restore')}</Button>
        <Button variant="outline" disabled={status === 'saving'} onClick={() => { void load() }}>{t('roles.reload')}</Button>
      </div>
      {message && <p role={status === 'error' ? 'alert' : 'status'}>{message}</p>}
    </div>
  )
}
