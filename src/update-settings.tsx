import { useCallback, useEffect, useRef, useState } from 'react'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import type { LocaleKey } from './locales.ts'
import type { UpdateRemote, UpdateStateView } from './update-contract.ts'

type UpdateSettingsProps = PropsLocale<'ai-agent-engine'> & {
  remote?: UpdateRemote
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

const ACTIVE = ['checking', 'downloading', 'installing', 'rebuilding'] as const

function active(state: UpdateStateView | undefined): boolean {
  return state !== undefined && (ACTIVE as readonly string[]).includes(state.phase)
}

/**
 * Settings section for this plugin's own updater.
 *
 * The Host owns every download and install step; this page only shows the state
 * and asks for `check` / `apply`, then polls while an update is running.
 */
export function UpdateSettingsPage({ remote, t }: UpdateSettingsProps) {
  const [state, setState] = useState<UpdateStateView>()
  const [error, setError] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  const load = useCallback(async () => {
    if (remote === undefined) return
    try {
      const next = await unwrap<UpdateStateView>(remote.getState({}))
      if (mounted.current) setState(next)
    } catch (failure) {
      if (mounted.current) setError(failure instanceof Error ? failure.message : String(failure))
    }
  }, [remote])

  const check = useCallback(async () => {
    if (remote === undefined) return
    setBusy(true)
    setError('')
    try {
      const next = await unwrap<UpdateStateView>(remote.check({}))
      if (mounted.current) setState(next)
    } catch (failure) {
      if (mounted.current) setError(failure instanceof Error ? failure.message : String(failure))
    } finally {
      if (mounted.current) setBusy(false)
    }
  }, [remote])

  const apply = useCallback(async () => {
    if (remote === undefined) return
    setBusy(true)
    setError('')
    try {
      const next = await unwrap<UpdateStateView>(remote.apply({}))
      if (mounted.current) setState(next)
    } catch (failure) {
      if (mounted.current) setError(failure instanceof Error ? failure.message : String(failure))
    } finally {
      if (mounted.current) setBusy(false)
    }
  }, [remote])

  // Read once, and ask the Host for a fresh answer only when nothing was checked yet.
  useEffect(() => {
    if (remote === undefined) return
    void (async () => {
      try {
        const initial = await unwrap<UpdateStateView>(remote.getState({}))
        if (!mounted.current) return
        setState(initial)
        if (initial.checkedAt === undefined) await check()
      } catch (failure) {
        if (mounted.current) setError(failure instanceof Error ? failure.message : String(failure))
      }
    })()
  }, [remote, check])

  // Poll only while the Host is working; a settled update needs no timer.
  useEffect(() => {
    if (!active(state)) return
    const timer = setInterval(() => { void load() }, 1500)
    return () => clearInterval(timer)
  }, [state, load])

  if (remote === undefined) return <p role="status">{t('update.unavailable')}</p>

  const phase = state?.phase ?? 'idle'
  const running = active(state)
  const compat = state?.runtimeSupport ?? 'unknown'
  const blocked = state?.blocked
  const pendingBuilds = state?.installResult?.pendingBuilds ?? []
  const compatKey = `update.compat${{ verified: 'Verified', 'untested-newer': 'Newer', 'untested-older': 'Older', unknown: 'Unknown' }[compat]}` as LocaleKey

  return <div data-ae-update-settings style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 720 }}>
    <p>{t('update.intro')}</p>
    <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
      <tbody>
        <Row label={t('update.current')} value={state?.currentVersion ?? t('update.unknown')} />
        <Row label={t('update.latest')} value={state?.latest?.version ?? t('update.unknown')} />
        <Row label={t('update.channel')} value={state === undefined ? t('update.unknown')
          : state.channel === 'checkout' ? t('update.channelCheckout') : t('update.channelPackage')} />
        {state?.runtimeVersion !== undefined
          && <Row label={t('update.runtime')} value={`${state.runtimeVersion}${state.verifiedThrough === undefined ? '' : ` · ${state.verifiedThrough}`}`} />}
      </tbody>
    </table>
    <p style={{ opacity: 0.85, fontSize: 12 }}>{t(compatKey)}</p>
    {state?.pendingCommits !== undefined
      && <p style={{ fontSize: 12 }}>{t('update.pendingCommits')}: {state.pendingCommits}</p>}
    {state?.latest?.notes !== undefined && <p style={{ whiteSpace: 'pre-wrap', fontSize: 12, opacity: 0.85 }}>{state.latest.notes}</p>}
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Button variant="outline" disabled={busy || running} onClick={() => { void check() }}>
        {phase === 'checking' ? t('update.checking') : t('update.check')}
      </Button>
      <Button disabled={busy || running || state?.canApply !== true} onClick={() => { void apply() }}>
        {running ? t(`update.${phase}` as LocaleKey) : t('update.apply')}
      </Button>
    </div>
    {state !== undefined && !running && phase !== 'failed' && (
      <p role="status">{phase === 'applied'
        ? t('update.applied')
        : state.outdated ? t('update.outdated')
          : blocked === 'no-update' ? t('update.uptodate') : t('update.idle')}</p>
    )}
    {running && <p role="status">{t(`update.${phase}` as LocaleKey)}</p>}
    {state?.restartRequired === true && <p role="alert">{t('update.restart')}</p>}
    {state?.pendingCheckout !== undefined && !running && <p role="status">{t('update.resumePending')}</p>}
    {pendingBuilds.length > 0 && <p role="alert">
      {t('update.pendingBuilds')} {pendingBuilds.join(', ')}
    </p>}
    {state?.installResult?.warnings?.map((warning, index) => <p key={index} role="status">
      {t('update.warning')}: {warning}
    </p>)}
    {blocked !== undefined && blocked !== 'no-update' && (
      <p role="alert">{t(`update.blocked.${blocked}` as LocaleKey)}</p>
    )}
    {(error !== '' || state?.error !== undefined) && <p role="alert">{error || state?.error}</p>}
  </div>
}

function Row({ label, value }: { label: string, value: string }) {
  const cell = {
    padding: '8px 10px', textAlign: 'left' as const, verticalAlign: 'top' as const,
    overflowWrap: 'anywhere' as const, borderBottom: '1px solid rgba(127,127,127,0.2)',
  }
  return <tr><th scope="row" style={{ ...cell, width: 160 }}>{label}</th><td style={cell}>{value}</td></tr>
}
