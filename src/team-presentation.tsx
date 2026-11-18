import { useMemo, type ComponentType } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import type { SessionListState } from '@deepseek-ai/dsh-api-session-controller/client'
import type { TeamActionProps } from '@deepseek-ai/dsh-experimental-client-ui-agent-team/client'
import type {} from '@deepseek-ai/dsh-experimental-agent-team/client'
import type { StoredEntry } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import { createRolePresentation, createTaskOwnerPresentation } from './team-roles.ts'

const HEADER_SLOT = 'conversation.session.header.actions'
// The rc.3 host contributes this footer slot through its own client package; the
// plugin's dependency window may not declare it yet, so keep the public name.
type SlotName = Parameters<Context['slots']['inject']>[0]
const TASK_BOARD_SLOT = 'conversation.session.header.actions.subagent.footer' as unknown as SlotName
type TeamComponent = ComponentType<Record<string, unknown>>

/** Shadow another plugin's public slot contribution, retaining its behavior. */
function shadowEntry(
  ctx: Context,
  slot: SlotName,
  id: string,
  wrap: (official: TeamComponent) => TeamComponent,
): void {
  ctx.slots.inject(slot, () => {
    let source: StoredEntry | undefined
    let dispose: (() => void) | undefined
    let reconciling = false
    const reconcile = () => {
      if (reconciling) return
      reconciling = true
      try {
        const entry = ctx.slots.entries(slot).find(candidate =>
          candidate.options.id === id && candidate.registrant !== 'ai-agent-engine-roles')
        if (entry === source) return
        dispose?.()
        dispose = undefined
        source = entry
        if (!entry) return
        // The registry is intentionally type-erased when reading another plugin's
        // contribution. Preserve its business face and locale at this boundary.
        const register = ctx.slots.register as unknown as (
          options: object, component: TeamComponent,
        ) => () => void
        dispose = register.call(ctx.slots, {
          name: slot, id, order: entry.options.order,
          priority: (entry.options.priority ?? 0) - 1,
          registrant: 'ai-agent-engine-roles',
          locale: entry.locale, inject: entry.inject,
        }, wrap(entry.component as TeamComponent))
      } finally {
        reconciling = false
      }
    }
    const unsubscribe = ctx.slots.subscribe(slot, reconcile)
    reconcile()
    return () => { unsubscribe(); dispose?.() }
  })
}

/** Shadow the official member panel to show localized professional titles. */
export function installTeamPresentation(ctx: Context): void {
  shadowEntry(ctx, HEADER_SLOT, 'agent-team', official => {
    const OfficialPanel = official as unknown as ComponentType<TeamActionProps>
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
    return RolePanel as unknown as TeamComponent
  })
}

interface TeamBoardProps {
  readonly sessionId: string
  readonly useProjection: (key: string) => unknown
  readonly useSessions: (selector: (state: SessionListState) => unknown, equal?: unknown) => unknown
  readonly t: (key: string, params?: Record<string, unknown>) => string
}

/** Localize shared-task owners in the official Subagent-footer task board. */
export function installTeamBoardOwnerLabels(ctx: Context): void {
  shadowEntry(ctx, TASK_BOARD_SLOT, 'agent-team', official => {
    const OfficialBoard = official as unknown as ComponentType<TeamBoardProps>
    function RoleTaskBoard(props: TeamBoardProps) {
      const translate = ctx.locale.bind('ai-agent-engine')
      const revision = ctx.locale.getSnapshot().revision
      const present = useMemo(() => {
        const taskView = createTaskOwnerPresentation(translate)
        return (team: unknown): unknown => {
          if (team === null || typeof team !== 'object') return team
          return taskView(team as { tasks?: readonly { readonly ownerName?: string }[] })
        }
      }, [revision])
      const useProjection: TeamBoardProps['useProjection'] = key => {
        const value = props.useProjection(key)
        return key === 'agentTeam' ? present(value) : value
      }
      return <OfficialBoard {...props} useProjection={useProjection} />
    }
    return RoleTaskBoard as unknown as TeamComponent
  })
}
