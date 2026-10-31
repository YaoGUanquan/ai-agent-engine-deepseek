import { useEffect, useState } from 'react'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { CompatibilityRemote } from './compatibility-rpc.ts'
import type { ModuleId, ModuleStatuses, ModuleStatus } from './module-runtime.ts'
import type { LocaleKey } from './locales.ts'

export function CompatibilitySettingsPage({ remote, clientStatuses, t }: PropsLocale<'ai-agent-engine'> & {
  remote?: CompatibilityRemote
  clientStatuses: ModuleStatuses
}) {
  const [host, setHost] = useState<ModuleStatuses>()
  const [client, setClient] = useState(clientStatuses)
  useEffect(() => {
    let active = true
    let pending = false
    const refresh = async () => {
      if (pending) return
      pending = true
      try {
        const result = await remote?.getStatus({})
        if (active) {
          setHost(result?.ok ? result.value : undefined)
          setClient(structuredClone(clientStatuses))
        }
      } catch {
        if (active) setHost(undefined)
      } finally { pending = false }
    }
    void refresh()
    const timer = setInterval(() => { void refresh() }, 2000)
    return () => { active = false; clearInterval(timer) }
  }, [remote, clientStatuses])
  const text = (status?: ModuleStatus) => {
    if (!status) return t('compatibility.unreachable')
    if (status.state === 'ready') return t('compatibility.ready')
    return t(`compatibility.${status.reason ?? status.state}` as LocaleKey)
  }
  const cell = {
    padding: '10px 12px', textAlign: 'left' as const, verticalAlign: 'top' as const,
    overflowWrap: 'anywhere' as const, borderBottom: '1px solid rgba(127,127,127,0.2)',
  }
  return <div data-ae-compatibility style={{ maxWidth: 720 }}>
    <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
      <thead><tr>{(['module', 'host', 'client'] as const).map(label =>
        <th key={label} scope="col" style={cell}>{t(`compatibility.${label}`)}</th>)}</tr></thead>
      <tbody>{(['engineering', 'roles', 'capability', 'deletion'] as ModuleId[]).map(id =>
        <tr key={id}><th scope="row" style={cell}>{t(`compatibility.${id}`)}</th>
          <td style={cell}>{text(host?.[id])}</td><td style={cell}>{text(client[id])}</td></tr>)}</tbody>
    </table>
  </div>
}
