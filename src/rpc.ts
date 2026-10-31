import type { TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol'
import { deletionRpc } from './deletion-rpc.ts'
import { rolesRpc } from './roles-rpc.ts'
import { compatibilityRpc } from './compatibility-rpc.ts'
import { capabilityRpc } from './capability-rpc.ts'

// Typert owns contributions by package, so namespaces share one registration.
export const pluginRpc: TypertRemoteContribution = {
  package: deletionRpc.package,
  descriptors: [
    ...deletionRpc.descriptors,
    ...rolesRpc.descriptors,
    ...compatibilityRpc.descriptors,
    ...capabilityRpc.descriptors,
  ],
}
