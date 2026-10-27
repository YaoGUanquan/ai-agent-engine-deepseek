import { useMemo, type ComponentType } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import type { SessionListState } from '@deepseek-ai/dsh-api-session-controller/client'
import type { TeamActionProps } from '@deepseek-ai/dsh-experimental-client-ui-agent-team/client'
import type {} from '@deepseek-ai/dsh-experimental-agent-team/client'
import type { StoredEntry } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import { createRolePresentation } from './team-roles.ts'

const slot = 'conversation.session.header.actions'

/** Shadow the official panel through its public slot, retaining its behavior. */
export function installTeamPresentation(ctx: Context): void {
  ctx.slots.inject(slot, () => {
    let source: StoredEntry | undefined
    let dispose: (() => void) | undefined
    let reconciling = false
    const reconcile = () => {
      if (reconciling) return
      reconciling = true
      try {
        const entry = ctx.slots.entries(slot).find(candidate =>
          candidate.options.id === 'agent-team' && candidate.registrant !== 'ai-agent-engine-roles')
        if (entry === source) return
        dispose?.()
        dispose = undefined
        source = entry
        if (!entry) return
        const OfficialPanel = entry.component as ComponentType<TeamActionProps>
        function RolePanel(props: TeamActionProps) {
          const translate = ctx.locale.bind('ai-agent-engine')
          // Locale revision remounts/re-renders the slot; key the cache by its labels.
          const revision = ctx.locale.getSnapshot().revision
          const present = useMemo(() => {
            const teamView = createRolePresentation(translate)
            const snapshots = new WeakMap<SessionListState, SessionListState>()
            return (snapshot: SessionListState): SessionListState => {
              const cached = snapshots.get(snapshot)
              if (cached) return cached
              const result = {
                ...snapshot,
                projectionsBySession: Object.fromEntries(Object.entries(snapshot.projectionsBySession).map(([id, projection]) => {
                  const team = projection.values.agentTeam
                  return [id, team === undefined ? projection : {
                    ...projection, values: { ...projection.values, agentTeam: teamView(team) },
                  }]
                })),
              }
              snapshots.set(snapshot, result)
              return result
            }
          }, [revision])
          const useSessions: TeamActionProps['useSessions'] = (selector, equal) =>
            props.useSessions(snapshot => selector(present(snapshot)), equal)
          return <OfficialPanel {...props} useSessions={useSessions} />
        }
        // The registry is intentionally type-erased when reading another plugin's
        // contribution. Preserve its business face and locale at this boundary.
        const register = ctx.slots.register as unknown as (
          options: object, component: ComponentType<TeamActionProps>,
        ) => () => void
        dispose = register.call(ctx.slots, {
          name: slot, id: 'agent-team', order: entry.options.order,
          priority: (entry.options.priority ?? 0) - 1,
          registrant: 'ai-agent-engine-roles',
          locale: entry.locale, inject: entry.inject,
        }, RolePanel)
      } finally {
        reconciling = false
      }
    }
    const unsubscribe = ctx.slots.subscribe(slot, reconcile)
    reconcile()
    return () => { unsubscribe(); dispose?.() }
  })
}
