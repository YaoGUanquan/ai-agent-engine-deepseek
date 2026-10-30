import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it, vi } from 'vitest'
import { initialModuleStatuses, mountModule } from '../src/module-runtime.ts'

describe('independent feature lifecycles', () => {
  it('keeps other features active when a service is absent or a method changes', async () => {
    const ctx = new Context()
    const statuses = initialModuleStatuses()
    const waiting = vi.fn()
    const ready = vi.fn()
    try {
      mountModule(ctx, 'engineering', ['missingHostService'], {}, statuses, waiting)
      mountModule(ctx, 'deletion', [], { missingHostService: ['remove'] }, statuses, async () => {
        throw new Error('must not reach setup')
      })
      mountModule(ctx, 'roles', [], {}, statuses, async scope => {
        scope.effect(() => { ready(); return () => ready('disposed') })
      })
      await vi.waitFor(() => {
        expect(statuses.roles.state).toBe('ready')
        expect(statuses.deletion).toEqual({ state: 'unavailable', reason: 'interface' })
      })
      expect(statuses.engineering).toEqual({ state: 'waiting', reason: 'services' })
      expect(waiting).not.toHaveBeenCalled()
      expect(ready).toHaveBeenCalledTimes(1)
    } finally { await ctx.fiber.dispose() }
    expect(ready).toHaveBeenLastCalledWith('disposed')
  })

  it('cleans partial effects after an official import or initialization fails', async () => {
    const ctx = new Context()
    const statuses = initialModuleStatuses()
    let installed = false
    try {
      mountModule(ctx, 'engineering', [], {}, statuses, async scope => {
        scope.effect(() => { installed = true; return () => { installed = false } })
        await Promise.reject(new Error('Official module export changed'))
      })
      mountModule(ctx, 'roles', [], {}, statuses, async () => {})
      await vi.waitFor(() => {
        expect(statuses.engineering).toEqual({ state: 'unavailable', reason: 'initialization' })
        expect(statuses.roles.state).toBe('ready')
      })
      expect(installed).toBe(false)
    } finally { await ctx.fiber.dispose() }
  })
})
