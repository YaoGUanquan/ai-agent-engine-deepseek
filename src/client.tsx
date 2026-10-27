import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-api-session-controller/client'
import type {} from '@deepseek-ai/dsh-client-ui-workspace/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { SettingsDescribeFace } from '@deepseek-ai/dsh-client-ui-settings/client'
import type { PropsHooks, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { Button, IconTrashOutlineRegular, MenuItemButton, Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import type { SessionDeletionRemote } from './deletion-contract.ts'
import { createDeletionController } from './deletion-state.ts'
import { en, zh, type LocaleKey } from './locales.ts'
import { conversationManagementEnabled } from './module-config.ts'
import type { SessionId } from '@deepseek-ai/dsh-session/types'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap { 'ai-agent-engine': LocaleKey }
}

export const inject = ['slots', 'locale', 'remote', 'remote.session', 'configForms']

type Controller = ReturnType<typeof createDeletionController>
type ModuleProps = PropsHooks<{ settings: SettingsDescribeFace }>
type DeleteMenuProps = PropsRuntime<'sidebar.workspaces.session.menu.item'>
  & PropsLocale<'ai-agent-engine'>
  & ModuleProps
  & { requestDeletion: Controller['request'] }

function DeleteMenuItem({ sessionId, displayTitle, useMenuOpenState, useSettings, requestDeletion, t }: DeleteMenuProps) {
  const [, setOpen] = useMenuOpenState()
  const enabled = useSettings(conversationManagementEnabled)
  if (!enabled) return null
  return <MenuItemButton icon={<IconTrashOutlineRegular size={14} />} danger separatorBefore onSelect={() => {
    setOpen(false)
    void requestDeletion(sessionId, displayTitle)
  }}>{t('delete')}</MenuItemButton>
}

type DeleteDialogProps = PropsRuntime<'shell.overlay'> & PropsLocale<'ai-agent-engine'>
  & ModuleProps
  & PropsHooks<{ deletion: Controller['state'] }>
  & { confirm: Controller['confirm']; close: Controller['close']; requestDeletion: Controller['request'] }

export function DeletionDialog({ useDeletion, useSettings, confirm, close, requestDeletion, t }: DeleteDialogProps) {
  const state = useDeletion(value => value)
  const enabled = useSettings(conversationManagementEnabled)
  if (state === null || !enabled) return null
  const busy = state.phase === 'deleting'
  const ready = state.preview !== undefined && !state.unavailable && !busy
  return <Modal open onClose={close} closeLabel={t('close')} title={t('title')}
    description={t('description')}
    footer={<>
      <Button variant="outline" disabled={busy} onClick={close}>{t('cancel')}</Button>
      {state.phase === 'error' && state.preview === undefined && !state.unavailable
        ? <Button variant="outline" onClick={() => { void requestDeletion(state.sessionId, state.displayTitle) }}>{t('retry')}</Button>
        : <Button variant="outline" disabled={!ready} onClick={() => { void confirm() }}>{t('delete')}</Button>}
    </>}>
    <p>{t('conversation')}: {state.displayTitle || state.sessionId}</p>
    {state.phase === 'loading' && <p role="status">{t('loading')}</p>}
    {state.preview && <>
      <p>{t('related')}: {state.preview.sessionIds.length - 1}</p>
      {state.preview.runningSessionIds.length > 0 && <p>{t('running')}</p>}
    </>}
    {busy && <p role="status">{t('pending')}</p>}
    {state.phase === 'error' && <p role="alert">{t(state.unavailable ? 'unsupported' : state.changedScope ? 'changed' : 'failed')}</p>}
  </Modal>
}

/** Follow the shared Host settings mirror and register deletion controls. */
export function apply(ctx: Context): void {
  ctx.locale.register('ai-agent-engine', { en, zh })
  const settings = ctx.configForms.describe()
  // The Host patch supplies generated codecs; an unpatched Host rejects these
  // optional methods before the confirmation can become actionable.
  const remote = ctx.remote.session as typeof ctx.remote.session & SessionDeletionRemote
  const controller = createDeletionController(remote, (_ids: readonly SessionId[]) => {
    // The patched workspace navigation closes deleted selections in every
    // connected client from the authoritative Session list removal.
  })
  ctx.effect(() => () => controller.dispose())
  const requestDeletion: Controller['request'] = async (sessionId, title) => {
    if (conversationManagementEnabled(settings.getSnapshot())) await controller.request(sessionId, title)
  }
  ctx.slots.inject('sidebar.workspaces.session.menu.item', () => ctx.slots.register({
    name: 'sidebar.workspaces.session.menu.item', id: 'ai-agent-engine-delete', order: 500,
    locale: 'ai-agent-engine', inject: () => ({ hooks: { settings }, requestDeletion }),
  }, DeleteMenuItem))
  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay', id: 'ai-agent-engine-delete', locale: 'ai-agent-engine',
    inject: () => ({
      hooks: { deletion: controller.state, settings }, confirm: controller.confirm,
      close: controller.close, requestDeletion,
    }),
  }, DeletionDialog))
}
