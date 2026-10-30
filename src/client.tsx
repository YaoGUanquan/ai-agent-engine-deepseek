import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/cordis-plugin-loader'
import { useEffect, useRef } from 'react'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-api-session-controller/client'
import type {} from '@deepseek-ai/dsh-client-ui-workspace/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { SettingsDescribeFace } from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { PropsHooks, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { Button, IconTrashOutlineRegular, MenuItemButton, Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import type {} from './deletion-contract.ts'
import { createDeletionController } from './deletion-state.ts'
import { en, zh, type LocaleKey } from './locales.ts'
import { conversationManagementEnabled } from './module-config.ts'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import { installTeamPresentation } from './team-presentation.tsx'
import { pluginRpc } from './rpc.ts'
import { RolesSettingsPage } from './roles-settings.tsx'
import type { RolesRemote } from './roles-contract.ts'
import { attachRowContextMenu } from './row-context-menu.ts'
import { initialModuleStatuses, mountModule } from './module-runtime.ts'
import { CompatibilitySettingsPage } from './compatibility-settings.tsx'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap { 'ai-agent-engine': LocaleKey }
}

export const inject = ['slots', 'locale', 'remote']

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
  return <MenuItemButton data-ae-delete-session={sessionId} icon={<IconTrashOutlineRegular size={14} />} danger separatorBefore onSelect={() => {
    setOpen(false)
    void requestDeletion(sessionId, displayTitle)
  }}>{t('delete')}</MenuItemButton>
}

type RowContextProps = PropsRuntime<'sidebar.workspaces.session.row.action'> & ModuleProps

function RowContextMenu({ sessionId, useSettings }: RowContextProps) {
  const marker = useRef<HTMLSpanElement>(null)
  const enabled = useSettings(conversationManagementEnabled)
  useEffect(() => {
    if (enabled && marker.current) return attachRowContextMenu(marker.current, sessionId)
  }, [enabled, sessionId])
  return <span hidden ref={marker} data-ae-row-context={enabled ? 'enabled' : 'disabled'} />
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
    {state.phase === 'error' && <p role="alert">{t(state.unavailable ? 'unsupported' : state.restartRequired ? 'restart' : state.changedScope ? 'changed' : 'failed')}</p>}
  </Modal>
}

/** Follow the shared Host settings mirror and register deletion controls. */
export async function apply(ctx: Context): Promise<void> {
  ctx.locale.register('ai-agent-engine', { en, zh })
  const statuses = initialModuleStatuses()
  await ctx.remote.$mount(pluginRpc)
  const translate = ctx.locale.bind('ai-agent-engine')
  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section', id: 'ai-agent-engine-compatibility', order: 421,
    label: translate('compatibility.section'), locale: 'ai-agent-engine',
    inject: () => ({ remote: ctx.get('remote.aeCompatibility'), clientStatuses: statuses }),
  }, CompatibilitySettingsPage))
  mountModule(ctx, 'engineering', ['slots', 'locale', 'sessions', 'uiWorkspace', 'loader'], {
    slots: ['inject', 'register', 'entries', 'subscribe'], locale: ['bind', 'getSnapshot'],
    sessions: ['binding', 'retainInfo'], uiWorkspace: ['openSession'],
    loader: ['entries'],
  }, statuses, async scope => {
    try {
      const configured = [...scope.loader.entries()].some(entry =>
        entry.options.name === '@deepseek-ai/dsh-experimental-client-ui-agent-team' && !entry.disabled)
      const existing = scope.slots.entries('conversation.session.header.actions').some(entry => entry.options.id === 'agent-team')
      if (!configured && !existing) {
        const official = await import('@deepseek-ai/dsh-experimental-client-ui-agent-team/client')
        await scope.plugin(official)
      }
      installTeamPresentation(scope)
    } catch (error) {
      console.warn('AI Agent Engine team interface unavailable:', error instanceof Error ? error.message : 'Unknown initialization error')
      throw error
    }
  })
  mountModule(ctx, 'deletion', ['slots', 'locale', 'remote', 'remote.session', 'configForms', 'sessions', 'uiWorkspace'], {
    configForms: ['describe'], sessions: ['retainInfo'], uiWorkspace: ['startSession'],
    remote: ['$on'], slots: ['inject', 'register'],
  }, statuses, async scope => { mountDeletion(scope) })
  mountModule(ctx, 'roles', ['slots', 'locale', 'remote'], {
    slots: ['inject', 'register'], locale: ['bind', 'subscribe'],
  }, statuses, async scope => { mountRoles(scope) })
}

function mountDeletion(ctx: Context): void {
  const settings = ctx.configForms.describe()
  const remote = ctx.get('remote.aeConversations')
  if (!remote) throw new Error('AI Agent Engine conversation API namespace was not mounted')
  const leaveDeleted = (ids: readonly SessionId[]) => {
    if (ids.some(id => (ctx.sessions.retainInfo(id).getSnapshot().retainedBy.mainView ?? 0) > 0)) {
      ctx.uiWorkspace.startSession()
    }
  }
  ctx.remote.$on('api-session/removed', id => { leaveDeleted([id]) })
  const controller = createDeletionController(remote, leaveDeleted)
  ctx.effect(() => () => controller.dispose())
  const requestDeletion: Controller['request'] = async (sessionId, title) => {
    if (conversationManagementEnabled(settings.getSnapshot())) await controller.request(sessionId, title)
  }
  ctx.slots.inject('sidebar.workspaces.session.menu.item', () => ctx.slots.register({
    name: 'sidebar.workspaces.session.menu.item', id: 'ai-agent-engine-delete', order: 500,
    locale: 'ai-agent-engine', inject: () => ({ hooks: { settings }, requestDeletion }),
  }, DeleteMenuItem))
  ctx.slots.inject('sidebar.workspaces.session.row.action', () => ctx.slots.register({
    name: 'sidebar.workspaces.session.row.action', id: 'ai-agent-engine-context-menu',
    inject: () => ({ hooks: { settings } }),
  }, RowContextMenu))
  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay', id: 'ai-agent-engine-delete', locale: 'ai-agent-engine',
    inject: () => ({
      hooks: { deletion: controller.state, settings }, confirm: controller.confirm,
      close: controller.close, requestDeletion,
    }),
  }, DeletionDialog))
}

function mountRoles(ctx: Context): void {
  const rolesRemote = ctx.get('remote.aeRoles') as RolesRemote | undefined
  if (!rolesRemote) throw new Error('AI Agent Engine roles API namespace was not mounted')
  const translate = ctx.locale.bind('ai-agent-engine')
  const registerRolesSection = () => ctx.slots.register({
    name: 'settings.section',
    id: 'ai-agent-engine-roles',
    order: 420,
    label: translate('roles.section'),
    locale: 'ai-agent-engine',
    inject: () => ({ roles: rolesRemote }),
  }, RolesSettingsPage)
  ctx.slots.inject('settings.section', () => {
    let dispose = registerRolesSection()
    const refresh = () => {
      dispose()
      dispose = registerRolesSection()
    }
    // Locale changes update dictionary; re-register so the nav label refreshes.
    const unsubscribe = ctx.locale.subscribe(refresh)
    return () => { unsubscribe(); dispose() }
  })
}
