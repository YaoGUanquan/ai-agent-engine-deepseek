// Copied by tools/harness-integration.mjs into the upstream browser test lane.
import { resolve, join } from 'node:path'
import { cp, mkdir, mkdtemp, readFile, readdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { stringify } from 'yaml'
import { chromium, type Browser, type Page } from 'playwright'
import { afterAll, beforeAll, describe, expect, it, onTestFinished, vi } from 'vitest'
import { symbols } from '@deepseek-ai/cordis'
import { evaluatePluginCompatibility } from '@deepseek-ai/dsh-app-boot'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { SessionId, SessionLogOffset } from '@deepseek-ai/dsh-session'
import { launchWebScaffold, type WebScaffold } from './scaffold.ts'
import { connectFreshWorkspace, newEnglishPage } from './support.ts'
import { MockAdapter, textResponse } from '../../../packages/core/agent-loop/tests/mock-adapter.ts'

const pluginRoot = process.env.AE_PLUGIN_ROOT
if (!pluginRoot) throw new Error('Run this integration through tools/harness-integration.mjs')

describe('AI Agent Engine runtime compatibility', () => {
  it('admits supported runtimes without exemptions, including the peer fallback', async () => {
    const manifest = JSON.parse(await readFile(join(pluginRoot, 'package.json'), 'utf8'))
    for (const runtime of ['0.2.1-rc.5']) {
      expect(evaluatePluginCompatibility(manifest, {}, runtime)).toBeUndefined()
      const { engines: _engines, ...peerManifest } = manifest
      expect(evaluatePluginCompatibility(peerManifest, {}, runtime)).toBeUndefined()
    }
    for (const runtime of ['0.2.1-rc.2', '0.2.1-rc.3', '0.2.1-rc.4', '0.2.1-rc.6', '0.2.1', '0.2.2']) {
      expect(evaluatePluginCompatibility(manifest, {}, runtime)).toMatchObject({
        exempted: false,
        requirements: { 'engines.dsh': manifest.engines.dsh },
      })
    }
  })
})

let rpcSequence = 0
type DeletionPreview = {
  sessionId: SessionId; sessionIds: SessionId[]; fingerprint: string; runningSessionIds: SessionId[]
}
type ApiResult<T> = { ok: true; value: T } | { ok: false; error: { code: string; message: string } }
async function conversationCall<T>(world: WebScaffold, method: string, request: object): Promise<ApiResult<T>> {
  const response = await world.hostFetch(`/api/aeConversations/${method}`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      type: 'client-request', rpcId: `ae-test-${++rpcSequence}`, method: `aeConversations/${method}`,
      payload: { args: { request } },
    }),
  })
  expect(response.ok).toBe(true)
  return (await response.json() as { result: ApiResult<T> }).result
}

describe('AI Agent Engine real profile and browser', () => {
  let scaffold: WebScaffold
  let browser: Browser
  let page: Page
  beforeAll(async () => {
    scaffold = await launchWebScaffold({
      profile: { hmr: false, packages: [{ dir: pluginRoot, enabled: true }] },
    })
    expect('disposeForDeletion' in scaffold.ctx.agents).toBe(false)
    expect('reserveDeletion' in scaffold.ctx.sessions).toBe(false)
    expect('deleteSessions' in scaffold.ctx.sessionPersistence).toBe(false)
    expect(await scaffold.ctx.agentPresets.resolve('ai-agent-engine')).toEqual({ id: 'ai-agent-engine' })
    browser = await chromium.launch()
    page = await newEnglishPage(browser)
    page.on('pageerror', error => { console.error(`Fixture browser error: ${error.message}`) })
    page.on('console', message => {
      if (message.type() === 'error') console.error(`Fixture browser console: ${message.text()}`)
    })
    await page.goto(scaffold.authenticatedUrl)
    try {
      await page.waitForSelector('[class*="frame"]')
    } catch (error) {
      console.error('Fixture page:', await page.locator('body').innerText())
      throw error
    }
    await connectFreshWorkspace(page, scaffold.workspaceCwd)
  }, 120_000)
  afterAll(async () => {
    await browser?.close()
    await scaffold?.close()
  })

  it('loads an optional usable engineering preset without changing Standard', async () => {
    expect(await scaffold.ctx.agentPresets.resolve()).toEqual({ id: 'standard' })
    expect(await scaffold.ctx.agentPresets.resolve('ai-agent-engine')).toEqual({ id: 'ai-agent-engine' })
    expect((await scaffold.ctx.skills.list()).map(skill => skill.name)).toContain('ae-backend')
  })

  it('activates deletion and roles together in the browser', async () => {
    await page.getByRole('button', { name: 'Account menu', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Settings', exact: true }).click()
    const settings = page.getByRole('dialog', { name: 'Settings', exact: true })
    await settings.getByText('Engineering roles', { exact: true }).click()
    await settings.locator('[data-ae-role-row="frontend"]').waitFor()
    await settings.locator('[data-ae-role-row="backend"]').waitFor()
    expect(await settings.locator('[data-ae-roles-settings] [role="alert"]').count()).toBe(0)
    await settings.getByRole('button', { name: 'Close', exact: true }).click()
    await settings.waitFor({ state: 'detached' })
  })

  it('completes a simple scripted turn without creating teammates and deletes current and archived conversations', async () => {
    for (const archived of [false, true]) {
      const preset = archived ? 'ai-agent-engine' : 'standard'
      const adapter = new MockAdapter([textResponse('Synthetic simple task completed.')])
      const provider = `ae-simple-${archived}`
      scaffold.ctx.llm.registerAdapter([provider], adapter)
      const workspace = scaffold.ctx.workspaceRegistry.list()[0]!
      const handle = await scaffold.ctx.agents.create({
        sessionId: SessionId(`simple-${archived}`),
        meta: { cwd: workspace.path, agentPreset: 'standard' },
        agentOptions: { provider, model: 'fixture' },
        setup: async ctx => { await scaffold.ctx.agentPresets.mount(ctx, 'standard') },
      })
      const agent = handle.agent
      if (archived) await scaffold.ctx.agentPresets.select(agent, preset)
      await workspace.attachSession(agent.id)
      agent.followup(createUserMessage({
        content: [{ type: 'text', text: 'Reply with a short completion message.' }], source: { kind: 'user' },
      }))
      await vi.waitFor(() => {
        expect(adapter.requests.length).toBe(1)
        expect(agent.status).toBe('idle')
      })
      expect(scaffold.ctx.agents.list().filter(item => item.session.header.parentSession === agent.id)).toEqual([])
      const request = JSON.stringify(adapter.requests[0])
      expect(request).toContain('spawn_teammate')
      expect(request).toContain('Name each teammate after its actual professional responsibility')
      expect(request.split('Name each teammate after its actual professional responsibility')).toHaveLength(2)
      await scaffold.ctx.sessions.flush(agent.session)
      const row = page.locator(`[data-row-key="session:${agent.id}"]`)
      await row.waitFor()
      if (archived) {
        await scaffold.ctx.workspaceRegistry.archiveSession(agent.id)
        await page.getByRole('button', { name: 'View options' }).click()
        await page.getByRole('menuitem', { name: 'All conversations (show archived)', exact: true }).click()
      } else await row.click()
      await row.hover()
      await row.getByRole('button', { name: /Session actions/ }).click()
      await page.getByRole('menuitem', { name: 'Permanently delete', exact: true }).click()
      const dialog = page.getByRole('dialog', { name: 'Permanently delete conversation?' })
      await expect.poll(() => dialog.innerText()).toContain('Related teammate conversations: 0')
      await dialog.getByRole('button', { name: 'Permanently delete', exact: true }).click()
      await dialog.waitFor({ state: 'hidden' })
      expect(await scaffold.ctx.sessionPersistence.stat(agent.id)).toBeUndefined()
      await row.waitFor({ state: 'hidden' })
    }
  }, 90_000)

  it('runs two real native teammates concurrently, then stops and permanently deletes their tree from the browser', async () => {
    const adapter = new MockAdapter([textResponse('Synthetic conversation ready.'), 'hang', 'hang'])
    scaffold.ctx.llm.registerAdapter(['ae-test'], adapter)
    const workspace = scaffold.ctx.workspaceRegistry.list()[0]!
    const rootHandle = await scaffold.ctx.agents.create({
      sessionId: SessionId('ae-engineering-root'),
      meta: { cwd: workspace.path, agentPreset: 'standard' },
      agentOptions: { provider: 'ae-test', model: 'fixture' },
      setup: async (ctx) => { await scaffold.ctx.agentPresets.mount(ctx, 'standard') },
    })
    const root = rootHandle.agent
    await workspace.attachSession(root.id)
    root.followup(createUserMessage({
      content: [{ type: 'text', text: 'Synthetic engineering task' }], source: { kind: 'user' },
    }))
    await vi.waitFor(() => {
      expect(adapter.requests.length).toBe(1)
      expect(root.status).toBe('idle')
    })
    await scaffold.ctx.sessions.flush(root.session)
    // A separate independent fork remains outside this Team's owned subtree.
    const fork = await scaffold.ctx.agents.create({
      sessionId: SessionId('independent-fork'),
      seed: root.session.snapshotEvents(),
      inheritedEventCount: SessionLogOffset(root.session.seq),
      meta: { cwd: workspace.path, parentSession: root.id, isSeeded: true },
      agentOptions: { provider: 'ae-test', model: 'fixture' },
    })
    await scaffold.ctx.sessions.flush(fork.agent.session)
    const signal = new AbortController().signal
    const children = await Promise.all(['backend', 'frontend'].map(name => scaffold.ctx.agentTeams.spawnTeammate(root, {
      name, description: `${name} synthetic task`,
      prompt: [{ type: 'text', text: 'Stay running until cancelled.' }],
      provider: 'spawn', context: 'fresh', signal,
    })))
    await vi.waitFor(() => {
      expect(children.every(child => scaffold.ctx.agents.get(child.member.id)?.status === 'running')).toBe(true)
    })
    expect(adapter.requests.length).toBe(3)
    const first = await scaffold.ctx.agentTeams.createTask(root, {
      subject: 'Backend contract', description: 'Synthetic producer task', writeScopes: ['server'],
    })
    const dependent = await scaffold.ctx.agentTeams.createTask(root, {
      subject: 'Integration verification', description: 'Wait for producer', blockedBy: [first.id],
    })
    await expect(scaffold.ctx.agentTeams.updateTask(root, {
      taskId: dependent.id, expectedRevision: dependent.revision, action: 'claim',
    })).rejects.toMatchObject({ code: 'TEAM_TASK_BLOCKED' })
    const claimed = await scaffold.ctx.agentTeams.updateTask(root, {
      taskId: first.id, expectedRevision: first.revision, action: 'claim',
    })
    await scaffold.ctx.agentTeams.updateTask(root, {
      taskId: first.id, expectedRevision: claimed.revision, action: 'complete',
    })
    expect(scaffold.ctx.agentTeams.getTask(root, dependent.id).ready).toBe(true)
    for (const id of [root.id, ...children.map(child => child.member.id)]) {
      await scaffold.ctx.sessions.flush(scaffold.ctx.sessions.get(id)!)
    }
    const recovery = await mkdtemp(join(tmpdir(), 'ae-deletion-recovery-'))
    onTestFinished(() => rm(recovery, { recursive: true, force: true }))
    const retainedSessions = join(recovery, 'sessions')
    await cp(scaffold.persistenceRoot, retainedSessions, { recursive: true })
    expect((await scaffold.ctx.sessionQuery.searchSessions({ query: 'Synthetic engineering task', limit: 100 }))
      .items.some(item => item.header.id === root.id)).toBe(true)
    const row = page.locator(`[data-row-key="session:${root.id}"]`)
    await row.waitFor()
    const observer = await newEnglishPage(browser)
    await observer.goto(scaffold.authenticatedUrl)
    const observedRow = observer.locator(`[data-row-key="session:${root.id}"]`)
    await observedRow.waitFor()
    await observedRow.click()
    await observer.getByRole('button', { name: 'Agent Team', exact: true }).click()
    const teamPanel = observer.locator('[data-team-panel]')
    await expect.poll(() => teamPanel.innerText()).toContain('Backend engineer')
    expect(await teamPanel.innerText()).toContain('Frontend engineer')
    expect(await teamPanel.innerText()).toContain('Engineering lead')
    expect(await teamPanel.innerText()).toContain('Owner: Engineering lead')
    // Presentation must never rewrite the names accepted by the official tools.
    expect(scaffold.ctx.agentTeams.listMembers(root).map(member => member.name)).toEqual(['lead', 'backend', 'frontend'])
    await scaffold.ctx.settings.update('locale', { preference: 'zh' })
    await expect.poll(() => teamPanel.innerText()).toContain('后端工程师')
    expect(await teamPanel.innerText()).toContain('前端工程师')
    expect(await teamPanel.innerText()).toContain('工程负责人')
    await mkdir(resolve(pluginRoot, 'output/playwright'), { recursive: true })
    await observer.screenshot({ path: resolve(pluginRoot, 'output/playwright/team-roles-desktop.png') })
    await observer.setViewportSize({ width: 390, height: 844 })
    await observer.screenshot({ path: resolve(pluginRoot, 'output/playwright/team-roles-mobile.png') })
    await scaffold.ctx.settings.update('locale', { preference: 'en' })
    await observer.keyboard.press('Escape')
    const selectedBefore = await row.getAttribute('aria-selected')
    await row.click({ button: 'right' })
    await expect.poll(() => page.getByRole('menuitem', { name: 'Permanently delete', exact: true }).count(), { timeout: 5000 }).toBe(1)
    expect(await row.getAttribute('aria-selected')).toBe(selectedBefore)
    await scaffold.ctx.settings.update('ai-agent-engine', { conversationManagement: false })
    await expect.poll(() => page.getByRole('menuitem', { name: 'Permanently delete', exact: true }).count()).toBe(0)
    expect(await scaffold.ctx.agentPresets.resolve('ai-agent-engine')).toEqual({ id: 'ai-agent-engine' })
    await scaffold.ctx.settings.update('ai-agent-engine', { conversationManagement: true })
    await row.locator('[data-ae-row-context="enabled"]').waitFor({ state: 'attached' })
    await row.click({ button: 'right' })
    await page.getByRole('menuitem', { name: 'Permanently delete', exact: true }).waitFor()
    await mkdir(resolve(pluginRoot, 'output/playwright'), { recursive: true })
    await page.screenshot({ path: resolve(pluginRoot, 'output/playwright/menu.png') })
    await page.getByRole('menuitem', { name: 'Permanently delete', exact: true }).click()
    const dialog = page.getByRole('dialog', { name: 'Permanently delete conversation?' })
    await dialog.waitFor()
    await expect.poll(() => dialog.innerText()).toContain('Related teammate conversations: 2')
    expect(await dialog.innerText()).toContain('will be stopped')
    await page.screenshot({ path: resolve(pluginRoot, 'output/playwright/delete-confirmation-desktop.png') })
    const desktopViewport = page.viewportSize()!
    await page.setViewportSize({ width: 390, height: 844 })
    const bounds = await dialog.boundingBox()
    expect(bounds!.x).toBeGreaterThanOrEqual(0)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390)
    await page.screenshot({ path: resolve(pluginRoot, 'output/playwright/delete-confirmation-mobile.png') })
    await page.setViewportSize(desktopViewport)
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
    expect(scaffold.ctx.agents.get(root.id)).toBeDefined()
    await row.click({ button: 'right' })
    await page.getByRole('menuitem', { name: 'Permanently delete', exact: true }).click()
    await dialog.getByRole('button', { name: 'Permanently delete', exact: true }).click()
    try { await dialog.waitFor({ state: 'hidden' }) } catch (error) {
      console.error('Deletion dialog failure:', await dialog.innerText())
      throw error
    }
    expect(await scaffold.ctx.sessionPersistence.stat(root.id)).toBeUndefined()
    for (const child of children) expect(await scaffold.ctx.sessionPersistence.stat(child.member.id)).toBeUndefined()
    expect(await scaffold.ctx.sessionPersistence.stat(fork.agent.id)).toBeDefined()
    expect(JSON.stringify((await scaffold.ctx.sessionQuery.readSession(fork.agent.id)).events))
      .toContain('Synthetic engineering task')
    expect(scaffold.ctx.storageDomain.get('session_projcache')?.table('sessions').get(root.id)).toBeUndefined()
    expect((await scaffold.ctx.sessionQuery.searchSessions({ query: 'Synthetic engineering task', limit: 100 }))
      .items.some(item => item.header.id === root.id)).toBe(false)
    await observedRow.waitFor({ state: 'hidden' })
    await mkdir(resolve(pluginRoot, 'output/playwright'), { recursive: true })
    await page.screenshot({ path: resolve(pluginRoot, 'output/playwright/after-deletion.png') })
    await page.reload()
    await page.waitForSelector('[class*="frame"]')
    expect(await page.locator(`[data-row-key="session:${root.id}"]`).count()).toBe(0)
    // Rebuild a fresh Host context with pre-deletion artifacts and a committed,
    // unfinished deletion record: the plugin's startup must finish cleanup.
    const restarted = await launchWebScaffold({
      profile: { hmr: false, packages: [{ dir: pluginRoot, enabled: true }] },
    })
    try {
      const entry = [...restarted.ctx.loader.entries()].find(item => item.options.name === 'ai-agent-engine-deepseek')!
      await entry.update({ disabled: true })
      await restarted.ctx.loader.await()
      await cp(retainedSessions, restarted.persistenceRoot, { recursive: true })
      const records = join(restarted.persistenceRoot, '.ai-agent-engine', 'deletions')
      await cp(join(scaffold.persistenceRoot, '.ai-agent-engine', 'deletions'), records, { recursive: true })
      for (const filename of await readdir(records)) {
        if (!filename.endsWith('.json')) continue
        const path = join(records, filename)
        const record = JSON.parse(await readFile(path, 'utf8')) as { rootId: string; complete: boolean }
        if (record.rootId === root.id) await writeFile(path, JSON.stringify({ ...record, complete: false }))
      }
      await entry.update({ disabled: false })
      await restarted.ctx.loader.await()
      await vi.waitFor(() => expect(restarted.ctx.get('aeConversations')).toBeDefined())
      const recovered = await restarted.ctx.sessionQuery.listSessions()
      expect(recovered.some(item => item.header.id === root.id)).toBe(false)
      expect(recovered.some(item => item.header.id === fork.agent.id)).toBe(true)
      await expect(restarted.ctx.agents.resume({ resumeSessionId: root.id })).rejects.toThrow('deleted')
      const paths = (await readdir(restarted.persistenceRoot, { recursive: true })).map(path => path.replaceAll('\\', '/'))
      for (const id of [root.id, ...children.map(child => child.member.id)]) {
        expect(paths.some(path => path.includes(`/${id}/`) && /\.jsonl(?:\.zstd)?$/.test(path))).toBe(false)
      }
    } finally { await restarted.close() }
  }, 90_000)
})

describe('AI Agent Engine independent module composition', () => {
  it('enforces owner, confirmation scope, late descendants and first-enable lifecycle ownership', async () => {
    const fixture = await launchWebScaffold({
      profile: { hmr: false, packages: [{ dir: pluginRoot, enabled: true }] },
    })
    try {
      const entry = [...fixture.ctx.loader.entries()].find(item => item.options.name === 'ai-agent-engine-deepseek')!
      await entry.update({ disabled: true })
      await fixture.ctx.loader.await()
      const previous = await fixture.ctx.agents.create({ sessionId: SessionId('before-enable') })
      await fixture.ctx.sessions.flush(previous.agent.session)
      await entry.update({ disabled: false })
      await fixture.ctx.loader.await()
      await vi.waitFor(() => expect(fixture.ctx.get('aeConversations')).toBeDefined())
      const oldPreview = await conversationCall<DeletionPreview>(fixture, 'deletePreview', { sessionId: previous.agent.id })
      if (!oldPreview.ok) throw new Error(JSON.stringify(oldPreview.error))
      expect(oldPreview).toMatchObject({ ok: true })
      if (!oldPreview.ok) throw new Error('Expected a deletion preview')
      const refused = await conversationCall(fixture, 'delete', { ...oldPreview.value, stopRunning: true })
      expect(refused).toMatchObject({ ok: false, error: { code: 'ae-conversations/delete-restart-required' } })
      expect(fixture.ctx.agents.get(previous.agent.id)).toBe(previous.agent)
      await previous.dispose()
      const root = await fixture.ctx.agents.create({ sessionId: SessionId('guarded-root') })
      await fixture.ctx.sessions.flush(root.agent.session)
      const service = fixture.ctx.get('aeConversations') as { deletePreview(request: { sessionId: SessionId }): Promise<unknown> }
      await expect(service.deletePreview({ sessionId: root.agent.id })).rejects.toThrow('Only the Host owner')
      const preview = await conversationCall<DeletionPreview>(fixture, 'deletePreview', { sessionId: root.agent.id })
      if (!preview.ok) throw new Error('Expected a deletion preview')
      const forged = await conversationCall(fixture, 'delete', {
        ...preview.value, sessionIds: ['before-enable'], stopRunning: true,
      })
      expect(forged).toMatchObject({ ok: false, error: { code: 'ae-conversations/delete-scope-changed' } })
      const child = await fixture.ctx.agents.create({
        sessionId: SessionId('late-owned-child'),
        meta: { parentSession: root.agent.id, origin: 'subagent', delegationDepth: 1 },
      })
      await fixture.ctx.sessions.flush(child.agent.session)
      const changed = await conversationCall(fixture, 'delete', { ...preview.value, stopRunning: true })
      expect(changed).toMatchObject({ ok: false, error: { code: 'ae-conversations/delete-scope-changed' } })
      expect(fixture.ctx.agents.get(root.agent.id)).toBe(root.agent)
      expect(fixture.ctx.agents.get(child.agent.id)).toBe(child.agent)
      const updated = await conversationCall<DeletionPreview>(fixture, 'deletePreview', { sessionId: root.agent.id })
      if (!updated.ok) throw new Error('Expected an updated preview')
      const outcomes = await Promise.all([
        conversationCall(fixture, 'delete', { ...updated.value, stopRunning: true }),
        conversationCall(fixture, 'delete', { ...updated.value, stopRunning: true }),
      ])
      expect(outcomes.some(outcome => outcome.ok)).toBe(true)
      expect(await fixture.ctx.sessionPersistence.stat(root.agent.id)).toBeUndefined()
      expect(await fixture.ctx.sessionPersistence.stat(child.agent.id)).toBeUndefined()
      expect(await fixture.ctx.sessionPersistence.stat(previous.agent.id)).toBeDefined()
      const draining = await fixture.ctx.agents.create({ sessionId: SessionId('unload-during-delete') })
      await fixture.ctx.sessions.flush(draining.agent.session)
      const drainPreview = await conversationCall<DeletionPreview>(fixture, 'deletePreview', { sessionId: draining.agent.id })
      if (!drainPreview.ok) throw new Error('Expected unload preview')
      let reached!: () => void
      let release!: () => void
      const stopped = new Promise<void>(resolve => { reached = resolve })
      const gate = new Promise<void>(resolve => { release = resolve })
      const stop = fixture.ctx.on('workspace/session-stop', async ({ sessionId }) => {
        if (sessionId !== draining.agent.id) return
        reached()
        await gate
      })
      const registry = fixture.ctx.agents[symbols.original]
      const adaptedCreate = registry.create
      const deletion = conversationCall(fixture, 'delete', { ...drainPreview.value, stopRunning: true })
      try {
        await stopped
        await entry.update({ disabled: true })
        expect(registry.create).toBe(adaptedCreate)
      } finally { release(); stop() }
      expect(await deletion).toMatchObject({ ok: true })
      await fixture.ctx.loader.await()
      await vi.waitFor(() => expect(registry.create).not.toBe(adaptedCreate))
      expect(await fixture.ctx.sessionPersistence.stat(draining.agent.id)).toBeUndefined()
    } finally { await fixture.close() }
  }, 90_000)

  it.each([true, false])('coexists with the official Team bundle when engineering is %s', async (engineering) => {
    const directory = await mkdtemp(join(tmpdir(), 'ae-module-composition-'))
    const overlay = join(directory, 'cordis.patch.yml')
    await writeFile(overlay, stringify([
      { id: 'agent-team', config: { maxMembers: 1 } },
      { id: 'ai-agent-engine', config: { engineering, conversationManagement: true, maxMembers: 8 } },
    ]))
    let fixture: WebScaffold | undefined
    try {
      fixture = await launchWebScaffold({
        profile: { hmr: false, packages: [
          { dir: resolve(process.env.AE_HARNESS_SOURCE!, 'packages/experimental/agent-team-profile'), enabled: true },
          { dir: pluginRoot, enabled: true },
        ] },
        extraOverlayPath: overlay,
      })
      expect((await fixture.ctx.agentPresets.list()).some(row => row.id === 'ai-agent-engine')).toBe(engineering)
      expect((await fixture.ctx.skills.list()).some(row => row.name === 'ae-backend')).toBe(engineering)
      expect(fixture.ctx.get('agentTeams')).toBeDefined()
      expect(fixture.ctx.settings.describe().find(row => row.ns === 'ai-agent-engine')?.value)
        .toEqual({ conversationManagement: true, rolesEnabled: true })
      if (engineering) {
        const adapter = new MockAdapter(['hang'])
        fixture.ctx.llm.registerAdapter(['ae-coexist'], adapter)
        const handle = await fixture.ctx.agents.create({
          sessionId: SessionId('coexist-root'),
          agentOptions: { provider: 'ae-coexist', model: 'fixture' },
          setup: async ctx => { await fixture!.ctx.agentPresets.mount(ctx, 'ai-agent-engine') },
        })
        const request = {
          description: 'Synthetic teammate', prompt: [{ type: 'text' as const, text: 'Wait' }],
          provider: 'spawn', context: 'fresh' as const, signal: new AbortController().signal,
        }
        await fixture.ctx.agentTeams.spawnTeammate(handle.agent, { ...request, name: 'first' })
        await expect(fixture.ctx.agentTeams.spawnTeammate(handle.agent, { ...request, name: 'second' }))
          .rejects.toMatchObject({ code: 'TEAM_MEMBER_LIMIT' })
      }
    } finally {
      await fixture?.close()
      await rm(directory, { recursive: true, force: true })
    }
  }, 120_000)
})
