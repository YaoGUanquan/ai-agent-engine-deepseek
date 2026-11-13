import type { InvocationDescriptor, TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol'
import { array as z_array, boolean as z_boolean, enum as z_enum, number as z_number, strictObject as z_strictObject, string as z_string, type ZodType as z_ZodType } from 'zod'

const namespace = 'aeUpdate'

const release = z_strictObject({
  version: z_string().min(1),
  tag: z_string().min(1),
  notes: z_string().optional(),
  pageUrl: z_string().optional(),
  assetUrl: z_string().optional(),
  assetName: z_string().optional(),
  checksumUrl: z_string().optional(),
  publishedAt: z_string().optional(),
})

const installResult = z_strictObject({
  changed: z_boolean(),
  application: z_enum(['applied', 'restart-required', 'overridden', 'failed', 'cancelled']),
  error: z_strictObject({ code: z_string(), diagnostic: z_string().optional() }).optional(),
  packageResult: z_strictObject({
    exitCode: z_number().int(), output: z_string(), truncated: z_boolean(), logPath: z_string(),
    kind: z_string().optional(), timedOut: z_boolean().optional(),
  }).optional(),
  warnings: z_array(z_string()).optional(),
  pendingBuilds: z_array(z_string()).optional(),
})

const state = z_strictObject({
  pluginName: z_string().min(1),
  currentVersion: z_string().min(1),
  runtimeVersion: z_string().optional(),
  verifiedThrough: z_string().optional(),
  runtimeSupport: z_enum(['verified', 'untested-newer', 'untested-older', 'unknown']),
  channel: z_enum(['package', 'checkout']),
  installSpec: z_string().optional(),
  latest: release.optional(),
  pendingCommits: z_number().int().nonnegative().optional(),
  pendingCheckout: z_strictObject({
    target: z_string(), stage: z_enum(['install', 'build', 'merge', 'activate']),
  }).optional(),
  installResult: installResult.optional(),
  outdated: z_boolean(),
  canApply: z_boolean(),
  blocked: z_enum([
    'busy', 'no-plugin-manager', 'no-release', 'no-asset', 'checksum-mismatch',
    'incompatible-version', 'dirty-worktree', 'no-upstream', 'no-update',
    'checksum-missing', 'checksum-invalid', 'package-identity-mismatch',
    'install-failed', 'install-cancelled', 'install-overridden',
    'checkout-changed', 'build-failed', 'activation-failed',
  ]).optional(),
  phase: z_enum(['idle', 'checking', 'downloading', 'installing', 'rebuilding', 'applied', 'failed']),
  message: z_string().optional(),
  error: z_string().optional(),
  restartRequired: z_boolean(),
  checkedAt: z_number().optional(),
})

const emptyRequest = z_strictObject({})

function codec(schema: z_ZodType, name: string) {
  return { mode: 'strict' as const, typeSymbol: `ai-agent-engine-deepseek#${name}`, create: () => schema }
}

const result = codec(state, 'updateState')

export const updateRpc: TypertRemoteContribution = {
  package: 'ai-agent-engine-deepseek',
  descriptors: ([
    { method: 'getState', name: 'getStateRequest' },
    { method: 'check', name: 'checkUpdateRequest' },
    { method: 'apply', name: 'applyUpdateRequest' },
  ] as const).map((method): InvocationDescriptor => ({
    id: `ai-agent-engine-deepseek#${namespace}/${method.method}`,
    service: 'aeUpdate',
    namespace,
    method: method.method,
    invocation: { kind: 'direct' },
    parameters: [{ name: 'request', wire: 'request', source: 'json', codec: codec(emptyRequest, method.name) }],
    result: { ...result, typeSymbol: `ai-agent-engine-deepseek#${method.method}Result` },
  })),
}
