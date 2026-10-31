/** Wire contracts for aeCapability remote surface. */

export interface CapabilityStatusView {
  readonly capabilityEnhanceEnabled: boolean
  readonly jailbreakEnabled: boolean
  readonly enhanceProfile: string
  readonly jailbreakPromptPath?: string
  readonly overrideExists: boolean
  readonly overridePath?: string
}

export interface CapabilityOverrideView {
  readonly text: string
  readonly path?: string
  readonly exists: boolean
}

export interface CapabilityPutOverrideRequest {
  readonly text: string
}

export interface CapabilityPutOverrideResult {
  readonly path: string
  readonly bytes: number
}

export interface CapabilityRestoreResult {
  readonly restored: true
  readonly path?: string
}

export interface CapabilityRemote {
  getStatus(request?: Record<string, never>): Promise<CapabilityStatusView>
  getOverride(request?: Record<string, never>): Promise<CapabilityOverrideView>
  putOverride(request: CapabilityPutOverrideRequest): Promise<CapabilityPutOverrideResult>
  restoreOverride(request?: Record<string, never>): Promise<CapabilityRestoreResult>
}
