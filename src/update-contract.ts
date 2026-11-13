/**
 * Wire contracts for the `aeUpdate` remote surface.
 *
 * Browser-safe by design: types only, no Node imports, so the client bundle can
 * import it without pulling host code.
 */

export type UpdateChannel = 'package' | 'checkout'

export type UpdatePhase = 'idle' | 'checking' | 'downloading' | 'installing' | 'rebuilding' | 'applied' | 'failed'

export type UpdateBlocked =
  | 'busy'
  | 'no-plugin-manager'
  | 'no-release'
  | 'no-asset'
  | 'checksum-mismatch'
  | 'checksum-missing'
  | 'checksum-invalid'
  | 'package-identity-mismatch'
  | 'install-failed'
  | 'install-cancelled'
  | 'install-overridden'
  | 'checkout-changed'
  | 'build-failed'
  | 'activation-failed'
  | 'incompatible-version'
  | 'dirty-worktree'
  | 'no-upstream'
  | 'no-update'

/** Whether this Host is a recorded runtime check or an untested version. */
export type RuntimeSupport = 'verified' | 'untested-newer' | 'untested-older' | 'unknown'

export interface UpdateReleaseView {
  readonly version: string
  readonly tag: string
  readonly notes?: string
  readonly pageUrl?: string
  readonly assetUrl?: string
  readonly assetName?: string
  readonly checksumUrl?: string
  readonly publishedAt?: string
}

export type CheckoutUpdateStage = 'install' | 'build' | 'merge' | 'activate'

/** Serializable diagnostics from the Host plugin manager; never grants script approval. */
export interface UpdateInstallResult {
  readonly changed: boolean
  readonly application: 'applied' | 'restart-required' | 'overridden' | 'failed' | 'cancelled'
  readonly error?: { readonly code: string; readonly diagnostic?: string }
  readonly packageResult?: {
    readonly exitCode: number
    readonly output: string
    readonly truncated: boolean
    readonly logPath: string
    readonly kind?: string
    readonly timedOut?: boolean
  }
  readonly warnings?: readonly string[]
  readonly pendingBuilds?: readonly string[]
}

export interface UpdateStateView {
  readonly pluginName: string
  readonly currentVersion: string
  /** Version of the running Harness runtime, when the Host exposes it. */
  readonly runtimeVersion?: string
  /** Highest Host version this build was verified against. */
  readonly verifiedThrough?: string
  readonly runtimeSupport: RuntimeSupport
  readonly channel: UpdateChannel
  readonly installSpec?: string
  readonly latest?: UpdateReleaseView
  /** Upstream commits the plugin checkout is behind, for the checkout channel. */
  readonly pendingCommits?: number
  /** Persisted checkout work, including retries after HEAD already reached target. */
  readonly pendingCheckout?: { readonly target: string; readonly stage: CheckoutUpdateStage }
  readonly installResult?: UpdateInstallResult
  readonly outdated: boolean
  readonly canApply: boolean
  readonly blocked?: UpdateBlocked
  readonly phase: UpdatePhase
  readonly message?: string
  readonly error?: string
  readonly restartRequired: boolean
  readonly checkedAt?: number
}

export interface UpdateRemote {
  getState(request?: Record<string, never>): Promise<UpdateStateView>
  check(request?: Record<string, never>): Promise<UpdateStateView>
  apply(request?: Record<string, never>): Promise<UpdateStateView>
}
