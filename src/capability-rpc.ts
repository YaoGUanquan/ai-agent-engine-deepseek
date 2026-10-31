import type { InvocationDescriptor, TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol'
import { z } from 'zod'
import { MAX_PROMPT_OVERRIDE_CHARS } from './prompt-override.ts'

const namespace = 'aeCapability'
const emptyRequest = z.strictObject({})
const putRequest = z.strictObject({
  text: z.string().max(MAX_PROMPT_OVERRIDE_CHARS),
})
const statusResult = z.strictObject({
  capabilityEnhanceEnabled: z.boolean(),
  jailbreakEnabled: z.boolean(),
  enhanceProfile: z.string(),
  jailbreakPromptPath: z.string().optional(),
  overrideExists: z.boolean(),
  overridePath: z.string().optional(),
})
const overrideResult = z.strictObject({
  text: z.string(),
  path: z.string().optional(),
  exists: z.boolean(),
})
const putResult = z.strictObject({
  path: z.string().min(1),
  bytes: z.number().int().nonnegative(),
})
const restoreResult = z.strictObject({
  restored: z.literal(true),
  path: z.string().optional(),
})

function codec(schema: z.ZodType, name: string) {
  return { mode: 'strict' as const, typeSymbol: `ai-agent-engine-deepseek#${name}`, create: () => schema }
}

export const capabilityRpc: TypertRemoteContribution = {
  package: 'ai-agent-engine-deepseek',
  descriptors: ([
    {
      method: 'getStatus',
      parameters: [{ name: 'request', wire: 'request', source: 'json', codec: codec(emptyRequest, 'capGetStatusRequest') }],
      result: codec(statusResult, 'capGetStatusResult'),
    },
    {
      method: 'getOverride',
      parameters: [{ name: 'request', wire: 'request', source: 'json', codec: codec(emptyRequest, 'capGetOverrideRequest') }],
      result: codec(overrideResult, 'capGetOverrideResult'),
    },
    {
      method: 'putOverride',
      parameters: [{ name: 'request', wire: 'request', source: 'json', codec: codec(putRequest, 'capPutOverrideRequest') }],
      result: codec(putResult, 'capPutOverrideResult'),
    },
    {
      method: 'restoreOverride',
      parameters: [{ name: 'request', wire: 'request', source: 'json', codec: codec(emptyRequest, 'capRestoreOverrideRequest') }],
      result: codec(restoreResult, 'capRestoreOverrideResult'),
    },
  ] as const).map((method): InvocationDescriptor => ({
    id: `ai-agent-engine-deepseek#${namespace}/${method.method}`,
    service: 'aeCapability',
    namespace,
    method: method.method,
    invocation: { kind: 'direct' },
    parameters: method.parameters,
    result: method.result,
  })),
}
