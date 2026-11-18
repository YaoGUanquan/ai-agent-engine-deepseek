// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import type { ComponentType } from 'react'
import { Context } from '@deepseek-ai/cordis'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { installTeamBoardOwnerLabels } from '../src/team-presentation.tsx'
import { zh } from '../src/locales.ts'

afterEach(cleanup)

const TEAM_BOARD_SLOT = 'conversation.session.header.actions.subagent.footer'

function OfficialBoard({ useProjection }: {
  useProjection: (key: string) => unknown
}) {
  const team = useProjection('agentTeam') as { tasks?: readonly { id: string; ownerName?: string }[] } | undefined
  return <div data-testid="owners">{(team?.tasks ?? []).map(task => task.ownerName ?? '-').join('|')}</div>
}

function fixture(entries: readonly unknown[]) {
  const ctx = new Context()
  const registered: ComponentType<Record<string, unknown>>[] = []
  const options: Record<string, unknown>[] = []
  const slots = {
    inject: vi.fn((_name: string, factory: () => () => void) => { factory() }),
    entries: vi.fn(() => entries),
    subscribe: vi.fn(() => () => {}),
    register: vi.fn((entry: Record<string, unknown>, component: ComponentType<Record<string, unknown>>) => {
      options.push(entry)
      registered.push(component)
      return () => {}
    }),
  }
  const locale = {
    bind: vi.fn(() => (key: keyof typeof zh) => zh[key]),
    getSnapshot: vi.fn(() => ({ revision: 0 })),
  }
  ctx.provide('slots', slots)
  ctx.provide('locale', locale)
  installTeamBoardOwnerLabels(ctx)
  return { ctx, slots, registered, options }
}

describe('task-board owner presentation', () => {
  it('shadows the official footer board and localizes only owner labels', () => {
    const projection = {
      enabled: true,
      failure: null,
      tasks: [
        { id: 'task-1', status: 'in_progress', ownerName: 'backend' },
        { id: 'task-2', status: 'completed', ownerName: 'frontend-2' },
        { id: 'task-3', status: 'pending', ownerId: 'session-123' },
      ],
    }
    const { slots, registered, options } = fixture([{
      options: { id: 'agent-team', order: 30, priority: 10 },
      locale: 'agent-team', inject: () => ({}), component: OfficialBoard,
    }])
    expect(slots.inject).toHaveBeenCalledWith(TEAM_BOARD_SLOT, expect.any(Function))
    expect(options[0]).toMatchObject({
      name: TEAM_BOARD_SLOT, id: 'agent-team', order: 30, priority: 9,
      registrant: 'ai-agent-engine-roles', locale: 'agent-team',
    })
    const RoleTaskBoard = registered[0]!
    render(<RoleTaskBoard
      sessionId="root"
      t={(key: string) => key}
      useSessions={() => undefined}
      useProjection={key => key === 'agentTeam' ? projection : undefined}
    />)
    expect(screen.getByTestId('owners').textContent).toBe('后端工程师|前端工程师 2|-')
    // The host projection itself must stay untouched.
    expect(projection.tasks[0]!.ownerName).toBe('backend')
  })

  it('does nothing when the Host has no footer board', () => {
    const { slots, registered } = fixture([])
    expect(slots.inject).toHaveBeenCalledOnce()
    expect(registered).toHaveLength(0)
  })
})
