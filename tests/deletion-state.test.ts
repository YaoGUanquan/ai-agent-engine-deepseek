import { describe, expect, it, vi } from 'vitest'
import { createDeletionController } from '../src/deletion-state.ts'
import type { SessionDeletionPreview, SessionDeletionRemote } from '../src/deletion-contract.ts'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import { RemoteError, type RemoteResult } from '@deepseek-ai/dsh-typert-protocol'

const id = 'root' as SessionId
const preview: SessionDeletionPreview = {
  sessionId: id, sessionIds: [id, 'child' as SessionId], fingerprint: 'confirmation',
  runningSessionIds: [id],
}
const success = { ok: true as const, value: preview }

describe('conversation deletion confirmation', () => {
  it('does not delete before confirmation, and cancel invalidates a delayed preview', async () => {
    const pending = Promise.withResolvers<RemoteResult<SessionDeletionPreview>>()
    const remote = { deletePreview: vi.fn(() => pending.promise), delete: vi.fn() }
    const controller = createDeletionController(remote, vi.fn())
    const request = controller.request(id, 'Example')
    expect(controller.state.getSnapshot()?.phase).toBe('loading')
    expect(remote.delete).not.toHaveBeenCalled()
    controller.close()
    pending.resolve(success)
    await request
    expect(controller.state.getSnapshot()).toBeNull()
  })

  it('keeps the confirmed scope on failure and permits an exact retry', async () => {
    const remote: SessionDeletionRemote = {
      deletePreview: vi.fn(async () => success),
      delete: vi.fn().mockRejectedValueOnce(new Error('cleanup incomplete')).mockResolvedValueOnce({ ok: true, value: preview.sessionIds }),
    }
    const done = vi.fn()
    const controller = createDeletionController(remote, done)
    await controller.request(id, 'Example')
    await controller.confirm()
    expect(done).not.toHaveBeenCalled()
    expect(controller.state.getSnapshot()?.phase).toBe('error')
    expect(controller.state.getSnapshot()?.preview).toEqual(preview)
    await controller.confirm()
    expect(remote.delete).toHaveBeenLastCalledWith({ ...preview, stopRunning: true })
    expect(done).toHaveBeenCalledWith(preview.sessionIds)
    expect(controller.state.getSnapshot()).toBeNull()
  })

  it('prevents repeated confirmation and closure while deletion is in progress', async () => {
    const pending = Promise.withResolvers<RemoteResult<readonly SessionId[]>>()
    const remote = { deletePreview: vi.fn(async () => success), delete: vi.fn(() => pending.promise) }
    const controller = createDeletionController(remote, vi.fn())
    await controller.request(id, 'Example')
    const deleting = controller.confirm()
    await controller.confirm()
    controller.close()
    expect(remote.delete).toHaveBeenCalledTimes(1)
    expect(controller.state.getSnapshot()?.phase).toBe('deleting')
    pending.resolve({ ok: true, value: preview.sessionIds })
    await deleting
  })

  it('makes unsupported Host methods visibly unavailable', async () => {
    const controller = createDeletionController({
      deletePreview: async () => { throw { code: 'gateway/method-not-found' } },
      delete: vi.fn(),
    }, vi.fn())
    await controller.request(id, 'Example')
    expect(controller.state.getSnapshot()?.unavailable).toBe(true)
    await controller.confirm()
    expect(controller.state.getSnapshot()?.phase).toBe('error')
  })

  it('detects an unpatched generated client without attempting an absent method', async () => {
    const controller = createDeletionController({}, vi.fn())
    await controller.request(id, 'Example')
    expect(controller.state.getSnapshot()?.unavailable).toBe(true)
    await controller.confirm()
    expect(controller.state.getSnapshot()?.phase).toBe('error')
  })

  it('handles typed Remote failure envelopes without opening an actionable confirmation', async () => {
    const remote: SessionDeletionRemote = {
      deletePreview: async () => ({ ok: false, error: new RemoteError('gateway/method-not-found', 'not installed', {}) }),
      delete: vi.fn(),
    }
    const controller = createDeletionController(remote, vi.fn())
    await controller.request(id, 'Example')
    expect(controller.state.getSnapshot()?.unavailable).toBe(true)
    await controller.confirm()
    expect(remote.delete).not.toHaveBeenCalled()
  })

  it('never publishes a stale result after the plugin is unloaded', async () => {
    const pending = Promise.withResolvers<RemoteResult<SessionDeletionPreview>>()
    const controller = createDeletionController({ deletePreview: () => pending.promise, delete: vi.fn() }, vi.fn())
    const request = controller.request(id, 'Example')
    controller.dispose()
    pending.resolve(success)
    await request
    expect(controller.state.getSnapshot()).toBeNull()
  })

  it('requires another preview and confirmation when the Host reports changed scope', async () => {
    const remote: SessionDeletionRemote = {
      deletePreview: async () => success,
      delete: vi.fn(async () => { throw { code: 'session/delete-scope-changed' } }),
    }
    const controller = createDeletionController(remote, vi.fn())
    await controller.request(id, 'Example')
    await controller.confirm()
    expect(controller.state.getSnapshot()?.changedScope).toBe(true)
    expect(controller.state.getSnapshot()?.preview).toBeUndefined()
    await controller.confirm()
    expect(remote.delete).toHaveBeenCalledTimes(1)
  })
})
