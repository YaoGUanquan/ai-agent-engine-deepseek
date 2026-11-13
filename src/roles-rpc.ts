import type { InvocationDescriptor, TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol'
import { array as z_array, boolean as z_boolean, literal as z_literal, strictObject as z_strictObject, string as z_string, union as z_union, type ZodType as z_ZodType } from 'zod'

const namespace = 'aeRoles'
const roleId = z_string().regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/).refine(id => id !== 'lead')
const overlayEntry = z_strictObject({
  id: roleId,
  skill: z_string().min(1).optional(),
  responsibility: z_string().optional(),
})
const putRequest = z_strictObject({
  version: z_literal(1),
  roles: z_array(overlayEntry),
})
const roleDefinition = z_strictObject({
  id: z_string().min(1),
  skill: z_string().min(1).optional(),
  responsibility: z_string().optional(),
})
const catalogResult = z_strictObject({
  roles: z_array(roleDefinition),
  source: z_union([z_literal('builtin'), z_literal('merged')]),
  path: z_string().optional(),
  enabled: z_boolean(),
})
const overlayResult = z_strictObject({
  version: z_literal(1),
  roles: z_array(overlayEntry),
  path: z_string().optional(),
  exists: z_boolean(),
})
const putResult = z_strictObject({
  path: z_string().min(1),
  roles: z_array(roleDefinition),
  source: z_union([z_literal('builtin'), z_literal('merged')]),
})
const restoreResult = z_strictObject({
  restored: z_literal(true),
  path: z_string().optional(),
  roles: z_array(roleDefinition),
})

function codec(schema: z_ZodType, name: string) {
  return { mode: 'strict' as const, typeSymbol: `ai-agent-engine-deepseek#${name}`, create: () => schema }
}

const emptyRequest = z_strictObject({})

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
