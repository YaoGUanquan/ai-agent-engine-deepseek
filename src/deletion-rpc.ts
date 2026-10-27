import type { InvocationDescriptor, TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol'
import { z } from 'zod'

const namespace = 'aeConversations'
const identity = z.string().min(1)
const previewRequest = z.strictObject({ sessionId: identity })
const preview = z.strictObject({
  sessionId: identity, sessionIds: z.array(identity).min(1),
  fingerprint: z.string().regex(/^[a-f0-9]{64}$/),
  runningSessionIds: z.array(identity),
})
const confirmation = preview.extend({ stopRunning: z.literal(true) })

function codec(schema: z.ZodType, name: string) {
  return { mode: 'strict' as const, typeSymbol: `ai-agent-engine-deepseek#${name}`, create: () => schema }
}

export const deletionRpc: TypertRemoteContribution = {
  package: 'ai-agent-engine-deepseek',
  descriptors: ['deletePreview', 'delete'].map((method): InvocationDescriptor => ({
    id: `ai-agent-engine-deepseek#${namespace}/${method}`,
    service: 'aeConversations', namespace, method, invocation: { kind: 'direct' },
    parameters: [{
      name: 'request', wire: 'request', source: 'json',
      codec: codec(method === 'deletePreview' ? previewRequest : confirmation, `${method}Request`),
    }],
    result: codec(method === 'deletePreview' ? preview : z.array(identity), `${method}Result`),
  })),
}
