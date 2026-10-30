import type { InvocationDescriptor, TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol'
import { z } from 'zod'

const namespace = 'aeRoles'
const roleId = z.string().regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/).refine(id => id !== 'lead')
const overlayEntry = z.strictObject({
  id: roleId,
  skill: z.string().min(1).optional(),
  responsibility: z.string().optional(),
})
const putRequest = z.strictObject({
  version: z.literal(1),
  roles: z.array(overlayEntry),
})
const roleDefinition = z.strictObject({
  id: z.string().min(1),
  skill: z.string().min(1).optional(),
  responsibility: z.string().optional(),
})
const catalogResult = z.strictObject({
  roles: z.array(roleDefinition),
  source: z.union([z.literal('builtin'), z.literal('merged')]),
  path: z.string().optional(),
  enabled: z.boolean(),
})
const overlayResult = z.strictObject({
  version: z.literal(1),
  roles: z.array(overlayEntry),
  path: z.string().optional(),
  exists: z.boolean(),
})
const putResult = z.strictObject({
  path: z.string().min(1),
  roles: z.array(roleDefinition),
  source: z.union([z.literal('builtin'), z.literal('merged')]),
})
const restoreResult = z.strictObject({
  restored: z.literal(true),
  path: z.string().optional(),
  roles: z.array(roleDefinition),
})

function codec(schema: z.ZodType, name: string) {
  return { mode: 'strict' as const, typeSymbol: `ai-agent-engine-deepseek#${name}`, create: () => schema }
}

const emptyRequest = z.strictObject({})

export const rolesRpc: TypertRemoteContribution = {
  package: 'ai-agent-engine-deepseek',
  descriptors: ([
    {
      method: 'getCatalog',
      parameters: [{ name: 'request', wire: 'request', source: 'json', codec: codec(emptyRequest, 'getCatalogRequest') }],
      result: codec(catalogResult, 'getCatalogResult'),
    },
    {
      method: 'getOverlay',
      parameters: [{ name: 'request', wire: 'request', source: 'json', codec: codec(emptyRequest, 'getOverlayRequest') }],
      result: codec(overlayResult, 'getOverlayResult'),
    },
    {
      method: 'putOverlay',
      parameters: [{ name: 'request', wire: 'request', source: 'json', codec: codec(putRequest, 'putOverlayRequest') }],
      result: codec(putResult, 'putOverlayResult'),
    },
    {
      method: 'restoreDefaults',
      parameters: [{ name: 'request', wire: 'request', source: 'json', codec: codec(emptyRequest, 'restoreDefaultsRequest') }],
      result: codec(restoreResult, 'restoreDefaultsResult'),
    },
  ] as const).map((method): InvocationDescriptor => ({
    id: `ai-agent-engine-deepseek#${namespace}/${method.method}`,
    service: 'aeRoles',
    namespace,
    method: method.method,
    invocation: { kind: 'direct' },
    parameters: method.parameters,
    result: method.result,
  })),
}
