import type { InvocationDescriptor, TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol'
import { z } from 'zod'

const namespace = 'aeUpdate'

const release = z.strictObject({
  version: z.string().min(1),
  tag: z.string().min(1),
  notes: z.string().optional(),
  pageUrl: z.string().optional(),
  assetUrl: z.string().optional(),
  assetName: z.string().optional(),
  checksumUrl: z.string().optional(),
  publishedAt: z.string().optional(),
})

const state = z.strictObject({
  pluginName: z.string().min(1),
  currentVersion: z.string().min(1),
  runtimeVersion: z.string().optional(),
  verifiedThrough: z.string().optional(),
  runtimeSupport: z.enum(['verified', 'untested-newer', 'untested-older', 'unknown']),
  channel: z.enum(['package', 'checkout']),
  installSpec: z.string().optional(),
  latest: release.optional(),
  pendingCommits: z.number().int().nonnegative().optional(),
  outdated: z.boolean(),
  canApply: z.boolean(),
  blocked: z.enum([
    'busy', 'no-plugin-manager', 'no-release', 'no-asset', 'checksum-mismatch',
    'incompatible-version', 'dirty-worktree', 'no-upstream', 'no-update',
  ]).optional(),
  phase: z.enum(['idle', 'checking', 'downloading', 'installing', 'rebuilding', 'applied', 'failed']),
  message: z.string().optional(),
  error: z.string().optional(),
  restartRequired: z.boolean(),
  checkedAt: z.number().optional(),
})

const emptyRequest = z.strictObject({})

function codec(schema: z.ZodType, name: string) {
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
