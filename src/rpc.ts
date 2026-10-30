import type { TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol'
import { deletionRpc } from './deletion-rpc.ts'
import { rolesRpc } from './roles-rpc.ts'

// Typert owns contributions by package, so both namespaces share one registration.
export const pluginRpc: TypertRemoteContribution = {
  package: deletionRpc.package,
  descriptors: [...deletionRpc.descriptors, ...rolesRpc.descriptors],
}
