import type { InvocationDescriptor, TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol'
import { array as z_array, literal as z_literal, strictObject as z_strictObject, string as z_string, type ZodType as z_ZodType } from 'zod'

const namespace = 'aeConversations'
const identity = z_string().min(1)
const previewRequest = z_strictObject({ sessionId: identity })
const preview = z_strictObject({
  sessionId: identity, sessionIds: z_array(identity).min(1),
  fingerprint: z_string().regex(/^[a-f0-9]{64}$/),
  runningSessionIds: z_array(identity),
})
const confirmation = preview.extend({ stopRunning: z_literal(true) })

function codec(schema: z_ZodType, name: string) {
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
    result: codec(method === 'deletePreview' ? preview : z_array(identity), `${method}Result`),
  })),
}
