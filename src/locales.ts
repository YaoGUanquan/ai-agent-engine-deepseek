export const en = {
  delete: 'Permanently delete',
  title: 'Permanently delete conversation?',
  description: 'This conversation and its owned teammate conversations will be permanently deleted. Independent forks and project files are retained.',
  conversation: 'Conversation',
  related: 'Related teammate conversations',
  running: 'Running conversations will be stopped before deletion.',
  loading: 'Checking conversation scope...',
  pending: 'Stopping activity and deleting...',
  cancel: 'Cancel',
  close: 'Close',
  retry: 'Check again',
  unsupported: 'Permanent deletion is unavailable. Install the matching Harness host patch first.',
  failed: 'Deletion did not complete. The Host may have committed part of the cleanup; retry this operation.',
  changed: 'The conversation family changed. Check the scope again and confirm the updated list.',
} as const

export const zh: Record<keyof typeof en, string> = {
  delete: '永久删除',
  title: '永久删除对话？',
  description: '将永久删除此对话及其所属队友对话，保留独立分叉对话和工程文件。',
  conversation: '对话',
  related: '关联队友对话',
  running: '将先停止正在运行的对话，再执行删除。',
  loading: '正在核对删除范围…',
  pending: '正在停止任务并删除…',
  cancel: '取消',
  close: '关闭',
  retry: '重新核对',
  unsupported: '当前宿主尚不支持永久删除，请先安装匹配的 Harness 宿主补丁。',
  failed: '删除尚未完成，宿主可能已提交部分清理；请重试此操作。',
  changed: '关联对话范围已变化，请重新核对并确认新的删除范围。',
}

export type LocaleKey = keyof typeof en
