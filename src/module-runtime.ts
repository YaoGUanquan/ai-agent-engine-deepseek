import type { Context } from '@deepseek-ai/cordis'

export type ModuleId = 'engineering' | 'roles' | 'deletion' | 'capability'
export interface ModuleStatus {
  state: 'waiting' | 'ready' | 'unavailable'
  reason?: 'services' | 'interface' | 'initialization' | 'storage'
}
export type ModuleStatuses = Record<ModuleId, ModuleStatus>
export type RequiredMethods = Record<string, readonly string[]>

export function initialModuleStatuses(): ModuleStatuses {
  return {
    engineering: { state: 'waiting', reason: 'services' },
    roles: { state: 'waiting', reason: 'services' },
    deletion: { state: 'waiting', reason: 'services' },
    capability: { state: 'waiting', reason: 'services' },
  }
}

export class UnsupportedInterface extends Error {}

/** Check the whole interface before installing effects or touching storage. */
export function requireMethods(ctx: Context, requirements: RequiredMethods): void {
  for (const [service, methods] of Object.entries(requirements)) {
    let value: Record<string, unknown> | undefined
    try {
      value = (ctx as unknown as Record<string, unknown>)[service] as typeof value
    } catch { throw new UnsupportedInterface(service) }
    for (const method of methods) {
      if (typeof value?.[method] !== 'function') throw new UnsupportedInterface(`${service}.${method}`)
    }
  }
}

/** Each feature owns a disposable scope; startup failures never escape to the app. */
export function mountModule(
  ctx: Context, id: ModuleId, services: string[], requirements: RequiredMethods,
  statuses: ModuleStatuses, setup: (scope: Context) => Promise<void | false>,
): void {
  ctx.inject(services, async ready => {
    ready.effect(() => () => { statuses[id] = { state: 'waiting', reason: 'services' } })
    const result = { completed: true }
    const scope = ready.plugin(async child => {
      requireMethods(child, requirements)
      result.completed = await setup(child) !== false
    })
    try {
      await scope
      if (result.completed) statuses[id] = { state: 'ready' }
    } catch (error) {
      await scope.dispose()
      statuses[id] = statuses[id].reason === 'storage' ? statuses[id] : {
        state: 'unavailable',
        reason: error instanceof UnsupportedInterface ? 'interface' : 'initialization',
      }
      ready.logger.warn('AI Agent Engine %s unavailable (%s): %s', id, statuses[id].reason,
        error instanceof Error ? error.message : 'Unknown initialization error')
    }
  })
}
