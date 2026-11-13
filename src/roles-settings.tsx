import { useCallback, useEffect, useRef, useState } from 'react'
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
import type { RolesCatalogView, RolesOverlayView, RolesPutResult, RolesRemote, RolesRestoreResult } from './roles-contract.ts'

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

async function unwrap<T>(call: Promise<unknown>): Promise<T> {
  const result = await call
  if (result && typeof result === 'object' && 'ok' in result) {
    const wrapped = result as { ok: boolean; value?: T; error?: unknown }
    if (!wrapped.ok) throw wrapped.error
    return wrapped.value as T
  }
  return result as T
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
  const [loaded, setLoaded] = useState(false)
  const generation = useRef(0)
  const pending = useRef(false)

  const load = useCallback(async () => {
    const current = ++generation.current
    pending.current = true
    setLoaded(false)
    setStatus('loading')
    setMessage('')
    try {
      const [catalog, overlay] = await Promise.all([
        unwrap<RolesCatalogView>(roles.getCatalog({})),
        unwrap<RolesOverlayView>(roles.getOverlay({})),
      ])
      if (current !== generation.current) return
      // Edit the saved overlay even while its use in Lead policy is switched off.
      setDraft(toDraft(mergeRoleCatalog(BUILTIN_ROLES, overlay.roles)))
      setPath(overlay.path ?? catalog.path)
      setSource(overlay.exists ? 'merged' : 'builtin')
      setEnabled(catalog.enabled)
      setLoaded(true)
      setStatus('ready')
    } catch (error) {
      if (current !== generation.current) return
      setStatus('error')
      setMessage(error instanceof Error ? error.message : t('roles.loadFailed'))
    } finally {
      if (current === generation.current) pending.current = false
    }
  }, [roles, t])

  useEffect(() => {
    void load()
    return () => { generation.current++; pending.current = false }
  }, [load])

  const editable = loaded && status !== 'loading' && status !== 'saving'
  const updateRow = (index: number, patch: Partial<DraftRole>) => {
    if (!loaded || pending.current) return
    setDraft(current => current.map((row, i) => i === index ? { ...row, ...patch } : row))
  }

  const removeCustom = (index: number) => {
    if (!loaded || pending.current) return
    setDraft(current => current.filter((row, i) => i !== index || !row.custom))
  }

  const addCustom = () => {
    if (!loaded || pending.current) return
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
    if (!loaded || pending.current) return
    pending.current = true
    const current = ++generation.current
    setStatus('saving')
    setMessage('')
    try {
      const definitions = draftToDefinitions(draft)
      for (const role of definitions) {
        if (!isValidRoleId(role.id)) throw new Error(t('roles.invalidId'))
      }
      const overlay = diffRolesAgainstBuiltin(definitions)
      const result = await unwrap<RolesPutResult>(roles.putOverlay({ version: 1, roles: overlay }))
      if (current !== generation.current) return
      setDraft(toDraft(result.roles))
      setPath(result.path)
      setSource(result.source)
      setStatus('ready')
      setMessage(t('roles.saved'))
    } catch (error) {
      if (current !== generation.current) return
      setStatus('error')
      setMessage(error instanceof Error ? error.message : t('roles.saveFailed'))
    } finally {
      if (current === generation.current) pending.current = false
    }
  }

  const restore = async () => {
    if (!loaded || pending.current) return
    pending.current = true
    const current = ++generation.current
    setStatus('saving')
    setMessage('')
    try {
      const result = await unwrap<RolesRestoreResult>(roles.restoreDefaults({}))
      if (current !== generation.current) return
      setDraft(toDraft(result.roles.length ? result.roles : mergeRoleCatalog(BUILTIN_ROLES, [])))
      setPath(result.path)
      setSource('builtin')
      setStatus('ready')
      setMessage(t('roles.restored'))
    } catch (error) {
      if (current !== generation.current) return
      setStatus('error')
      setMessage(error instanceof Error ? error.message : t('roles.saveFailed'))
    } finally {
      if (current === generation.current) pending.current = false
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
            {row.custom && <Button variant="outline" disabled={!editable} onClick={() => removeCustom(index)}>{t('roles.remove')}</Button>}
          </div>
          <label style={{ display: 'grid', gap: 4 }}>
            <span>{t('roles.skill')}</span>
            <Input disabled={!editable} value={row.skill} onChange={event => updateRow(index, { skill: event.target.value })} />
          </label>
          <label style={{ display: 'grid', gap: 4 }}>
            <span>{t('roles.responsibility')}</span>
            <Input disabled={!editable} value={row.responsibility} onChange={event => updateRow(index, { responsibility: event.target.value })} />
          </label>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Input disabled={!editable} value={newId} placeholder={t('roles.newIdPlaceholder')} onChange={event => setNewId(event.target.value)} />
        <Button variant="outline" disabled={!editable} onClick={addCustom}>{t('roles.add')}</Button>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button disabled={!editable} onClick={() => { void save() }}>{status === 'saving' ? t('roles.saving') : t('roles.save')}</Button>
        <Button variant="outline" disabled={!editable} onClick={() => { void restore() }}>{t('roles.restore')}</Button>
        <Button variant="outline" disabled={status === 'saving' || status === 'loading'} onClick={() => { void load() }}>{t('roles.reload')}</Button>
      </div>
      {message && <p role={status === 'error' ? 'alert' : 'status'}>{message}</p>}
    </div>
  )
}
