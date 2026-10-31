import { useCallback, useEffect, useState } from 'react'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client'
import { Button, Switch } from '@deepseek-ai/dsh-client-ui-primitives'
import type {
  CapabilityOverrideView,
  CapabilityRemote,
} from './capability-contract.ts'

type CapabilityConfig = {
  capabilityEnhanceEnabled?: boolean
  jailbreakEnabled?: boolean
  enhanceProfile?: string
  jailbreakPrompt?: string
}

type CapabilitySettingsProps = PropsRuntime<'settings.section'>
  & PropsLocale<'ai-agent-engine'>
  & {
    capability: CapabilityRemote
    configForm: ConfigForm<CapabilityConfig>
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

function readSwitches(form: ConfigForm<CapabilityConfig>): {
  enhance: boolean
  jailbreak: boolean
  profile: string
  writable: boolean
} {
  const snap = form.getSnapshot()
  const value = snap.value
  return {
    enhance: value?.capabilityEnhanceEnabled === true,
    jailbreak: value?.jailbreakEnabled === true,
    profile: typeof value?.enhanceProfile === 'string' ? value.enhanceProfile : '',
    writable: snap.writable === true && snap.status === 'ready',
  }
}

/** Settings section: master switches + expand editors when on (preset-manager UX). */
export function CapabilitySettingsPage({ capability, configForm, t }: CapabilitySettingsProps) {
  const [enhance, setEnhance] = useState(false)
  const [jailbreak, setJailbreak] = useState(false)
  const [profile, setProfile] = useState('')
  const [writable, setWritable] = useState(false)
  const [text, setText] = useState('')
  const [path, setPath] = useState<string | undefined>()
  const [status, setStatus] = useState<'loading' | 'ready' | 'saving' | 'error'>('loading')
  const [message, setMessage] = useState('')

  const syncForm = useCallback(() => {
    const next = readSwitches(configForm)
    setEnhance(next.enhance)
    setJailbreak(next.jailbreak)
    setProfile(next.profile)
    setWritable(next.writable)
  }, [configForm])

  const loadOverride = useCallback(async () => {
    try {
      const view = await unwrap<CapabilityOverrideView>(capability.getOverride({}) as never)
      setText(view.text)
      setPath(view.path)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t('capability.loadFailed'))
      setStatus('error')
    }
  }, [capability, t])

  useEffect(() => {
    syncForm()
    const unsub = configForm.subscribe(syncForm)
    setStatus('ready')
    void loadOverride()
    return unsub
  }, [configForm, syncForm, loadOverride])

  const setSwitch = async (field: 'capabilityEnhanceEnabled' | 'jailbreakEnabled', value: boolean) => {
    setStatus('saving')
    setMessage('')
    try {
      const ok = await configForm.set(field, value)
      if (!ok) throw new Error(t('capability.saveFailed'))
      syncForm()
      setStatus('ready')
      setMessage(t('capability.switchSaved'))
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : t('capability.saveFailed'))
    }
  }

  const saveProfile = async () => {
    setStatus('saving')
    setMessage('')
    try {
      const next = profile.trim()
      const ok = next
        ? await configForm.set('enhanceProfile', next)
        : await configForm.unset('enhanceProfile')
      if (!ok) throw new Error(t('capability.saveFailed'))
      syncForm()
      setStatus('ready')
      setMessage(t('capability.profileSaved'))
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : t('capability.saveFailed'))
    }
  }

  const saveOverride = async () => {
    setStatus('saving')
    setMessage('')
    try {
      const result = await unwrap<{ path: string }>(capability.putOverride({ text }) as never)
      // Keep Config.jailbreakPrompt empty so the overlay file remains the sole long-text source.
      await configForm.unset('jailbreakPrompt')
      setPath(result.path)
      setStatus('ready')
      setMessage(t('capability.overrideSaved'))
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : t('capability.saveFailed'))
    }
  }

  const restoreOverride = async () => {
    setStatus('saving')
    setMessage('')
    try {
      await unwrap(capability.restoreOverride({}) as never)
      await configForm.unset('jailbreakPrompt')
      setText('')
      setStatus('ready')
      setMessage(t('capability.overrideRestored'))
      await loadOverride()
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : t('capability.saveFailed'))
    }
  }

  const restoreDefaults = async () => {
    setStatus('saving')
    setMessage('')
    try {
      const okEnhance = await configForm.set('capabilityEnhanceEnabled', false)
      const okJail = await configForm.set('jailbreakEnabled', false)
      await configForm.unset('enhanceProfile')
      await configForm.unset('jailbreakPrompt')
      await unwrap(capability.restoreOverride({}) as never)
      if (!okEnhance || !okJail) throw new Error(t('capability.saveFailed'))
      setText('')
      setProfile('')
      syncForm()
      setStatus('ready')
      setMessage(t('capability.restoredDefaults'))
      await loadOverride()
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : t('capability.saveFailed'))
    }
  }

  const busy = status === 'saving'
  const locked = !writable || busy

  return (
    <div data-ae-capability-settings style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 720 }}>
      <p>{t('capability.intro')}</p>
      <p style={{ opacity: 0.85, fontSize: 12 }}>{t('capability.risk')}</p>
      <p style={{ opacity: 0.8, fontSize: 12 }}>{t('capability.ownerHint')}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Switch
          checked={enhance}
          disabled={locked}
          label={t('capability.enhanceLabel')}
          onChange={next => { void setSwitch('capabilityEnhanceEnabled', next) }}
        />
        <p style={{ opacity: 0.8, fontSize: 12, margin: 0 }}>{t('capability.enhanceHint')}</p>
        {enhance && (
          <div data-ae-enhance-editor style={{ display: 'grid', gap: 8, paddingLeft: 4 }}>
            <label style={{ display: 'grid', gap: 4 }}>
              <span>{t('capability.profileLabel')}</span>
              <input
                data-ae-enhance-profile
                value={profile}
                placeholder="default"
                disabled={locked}
                style={{ fontFamily: 'monospace', fontSize: 12, padding: '6px 8px' }}
                onChange={event => setProfile(event.target.value)}
              />
            </label>
            <p style={{ opacity: 0.8, fontSize: 12, margin: 0 }}>{t('capability.profileHint')}</p>
            <Button disabled={locked} onClick={() => { void saveProfile() }}>
              {t('capability.saveProfile')}
            </Button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Switch
          checked={jailbreak}
          disabled={locked}
          label={t('capability.jailbreakLabel')}
          onChange={next => { void setSwitch('jailbreakEnabled', next) }}
        />
        <p style={{ opacity: 0.8, fontSize: 12, margin: 0 }}>{t('capability.jailbreakHint')}</p>
        <p style={{ opacity: 0.85, fontSize: 12, margin: 0 }}>{t('capability.jailbreakRisk')}</p>
        {jailbreak && (
          <div data-ae-jailbreak-editor style={{ display: 'grid', gap: 8, paddingLeft: 4 }}>
            <p style={{ fontSize: 12, margin: 0 }}>
              {t('capability.pathLabel')}: {path ?? t('capability.pathUnavailable')}
            </p>
            <label style={{ display: 'grid', gap: 4 }}>
              <span>{t('capability.overrideLabel')}</span>
              <textarea
                data-ae-prompt-override
                value={text}
                rows={12}
                disabled={locked}
                placeholder={t('capability.overridePlaceholder')}
                style={{ width: '100%', fontFamily: 'monospace', fontSize: 12 }}
                onChange={event => setText(event.target.value)}
              />
            </label>
            <p style={{ opacity: 0.8, fontSize: 12, margin: 0 }}>{t('capability.overrideHint')}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button disabled={locked} onClick={() => { void saveOverride() }}>
                {busy ? t('capability.saving') : t('capability.saveOverride')}
              </Button>
              <Button variant="outline" disabled={locked} onClick={() => { void restoreOverride() }}>
                {t('capability.restoreOverride')}
              </Button>
              <Button variant="outline" disabled={busy} onClick={() => { void loadOverride() }}>
                {t('capability.reload')}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button variant="outline" disabled={locked} onClick={() => { void restoreDefaults() }}>
          {t('capability.restoreDefaults')}
        </Button>
      </div>
      <p style={{ opacity: 0.8, fontSize: 12 }}>{t('capability.rolesCrossHint')}</p>
      {message && <p role={status === 'error' ? 'alert' : 'status'}>{message}</p>}
    </div>
  )
}
