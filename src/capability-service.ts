import type { Context } from '@deepseek-ai/cordis'
import { Remote, RemoteError, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import type {} from '@deepseek-ai/dsh-typert-registry'
import type {
  CapabilityOverrideView,
  CapabilityPutOverrideRequest,
  CapabilityPutOverrideResult,
  CapabilityRestoreResult,
  CapabilityStatusView,
} from './capability-contract.ts'
import {
  PromptOverrideValidationError,
  deletePromptOverride,
  resolvePromptOverridePath,
  writePromptOverride,
} from './prompt-override-io.ts'
import { readFile } from 'node:fs/promises'

declare module '@deepseek-ai/cordis' {
  interface Context { aeCapability: CapabilityPolicyService }
  interface Events {
    'ai-agent-engine/capability-updated': () => void
  }
}

declare module '@deepseek-ai/dsh-typert-protocol' {
  interface RemoteErrorDetailsMap {
    'ae-capability/rejected': {}
    'ae-capability/invalid-prompt': {}
    'ae-capability/path-unavailable': {}
  }
}

function reject(
  message: string,
  code: 'ae-capability/rejected' | 'ae-capability/invalid-prompt' | 'ae-capability/path-unavailable' = 'ae-capability/rejected',
): never {
  throw new RemoteError(code, message, {})
}

/** Host RPC for prompt-override file; switches live in plugin Config. */
export class CapabilityPolicyService extends TypertRemoteService {
  static inject = ['typert']

  constructor(
    ctx: Context,
    private readonly config: {
      capabilityEnhanceEnabled: () => boolean
      jailbreakEnabled: () => boolean
      jailbreakPromptPath: string
      enhanceProfile: () => string
    },
  ) {
    super(ctx, 'aeCapability')
  }

  private authorize(): void {
    if (this.ctx.invocation?.peer.principal.kind !== 'owner') {
      reject('Only the Host owner can manage capability / jailbreak settings')
    }
  }

  private resolvePath(): string {
    const path = resolvePromptOverridePath(this.config.jailbreakPromptPath)
    if (!path) reject('Prompt override path unavailable (set DSH_HOME or jailbreakPromptPath)', 'ae-capability/path-unavailable')
    return path
  }

  private async emitUpdated(): Promise<void> {
    this.ctx.emit('ai-agent-engine/capability-updated')
  }

  @Remote('getStatus')
  async getStatus(_request: Record<string, never> = {}): Promise<CapabilityStatusView> {
    this.authorize()
    const path = resolvePromptOverridePath(this.config.jailbreakPromptPath)
    let overrideExists = false
    if (path) {
      try {
        await readFile(path, 'utf8')
        overrideExists = true
      } catch {
        overrideExists = false
      }
    }
    return {
      capabilityEnhanceEnabled: this.config.capabilityEnhanceEnabled(),
      jailbreakEnabled: this.config.jailbreakEnabled(),
      enhanceProfile: this.config.enhanceProfile(),
      jailbreakPromptPath: path,
      overrideExists,
      overridePath: path,
    }
  }

  @Remote('getOverride')
  async getOverride(_request: Record<string, never> = {}): Promise<CapabilityOverrideView> {
    this.authorize()
    const path = resolvePromptOverridePath(this.config.jailbreakPromptPath)
    if (!path) return { text: '', exists: false }
    try {
      const text = await readFile(path, 'utf8')
      return { text, path, exists: true }
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code
      if (code === 'ENOENT') return { text: '', path, exists: false }
      this.ctx.logger.warn('Failed to read prompt override (%s)', code ?? 'error')
      return { text: '', path, exists: false }
    }
  }

  @Remote('putOverride')
  async putOverride(request: CapabilityPutOverrideRequest): Promise<CapabilityPutOverrideResult> {
    this.authorize()
    const path = this.resolvePath()
    try {
      const text = await writePromptOverride(path, request.text)
      await this.emitUpdated()
      return { path, bytes: Buffer.byteLength(text, 'utf8') }
    } catch (error) {
      if (error instanceof PromptOverrideValidationError) {
        reject(error.message, 'ae-capability/invalid-prompt')
      }
      throw error
    }
  }

  @Remote('restoreOverride')
  async restoreOverride(_request: Record<string, never> = {}): Promise<CapabilityRestoreResult> {
    this.authorize()
    const path = resolvePromptOverridePath(this.config.jailbreakPromptPath)
    if (path) await deletePromptOverride(path)
    await this.emitUpdated()
    return { restored: true, path }
  }
}
