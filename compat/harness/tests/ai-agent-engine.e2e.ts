// Copied by tools/harness-integration.mjs into the upstream browser test lane.
import { resolve, join } from 'node:path'
import { mkdir, mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { stringify } from 'yaml'
import { chromium, type Browser, type Page } from 'playwright'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { createMessage, createUserMessage } from '@deepseek-ai/dsh-llm'
import { SessionId, SessionLogOffset } from '@deepseek-ai/dsh-session'
import { launchWebScaffold, type WebScaffold } from './scaffold.ts'
import { connectFreshWorkspace, newEnglishPage } from './support.ts'
import { MockAdapter, textResponse } from '../../../packages/core/agent-loop/tests/mock-adapter.ts'

const pluginRoot = process.env.AE_PLUGIN_ROOT
if (!pluginRoot) throw new Error('Run this integration through tools/harness-integration.mjs')

describe('AI Agent Engine real profile and browser', () => {
  let scaffold: WebScaffold
  let browser: Browser
  let page: Page
  beforeAll(async () => {
    scaffold = await launchWebScaffold({
      profile: { hmr: false, packages: [{ dir: pluginRoot, enabled: true }] },
    })
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

  it('completes a simple scripted turn without creating teammates and deletes current and archived conversations', async () => {
    for (const archived of [false, true]) {
      const adapter = new MockAdapter([textResponse('Synthetic simple task completed.')])
      const provider = `ae-simple-${archived}`
      scaffold.ctx.llm.registerAdapter([provider], adapter)
      const workspace = scaffold.ctx.workspaceRegistry.list()[0]!
      const handle = await scaffold.ctx.agents.create({
        sessionId: SessionId(`simple-${archived}`),
        meta: { cwd: workspace.path, agentPreset: 'ai-agent-engine' },
        agentOptions: { provider, model: 'fixture' },
        setup: async ctx => { await scaffold.ctx.agentPresets.mount(ctx, 'ai-agent-engine') },
      })
      const agent = handle.agent
      await workspace.attachSession(agent.id)
      agent.followup(createUserMessage({
        content: [{ type: 'text', text: 'Reply with a short completion message.' }], source: { kind: 'user' },
      }))
      await vi.waitFor(() => {
        expect(adapter.requests.length).toBe(1)
        expect(agent.status).toBe('idle')
      })
      expect(scaffold.ctx.agents.list().filter(item => item.session.header.parentSession === agent.id)).toEqual([])
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
    const adapter = new MockAdapter(['hang', 'hang'])
    scaffold.ctx.llm.registerAdapter(['ae-test'], adapter)
    const workspace = scaffold.ctx.workspaceRegistry.list()[0]!
    const rootHandle = await scaffold.ctx.agents.create({
      sessionId: SessionId('ae-engineering-root'),
      meta: { cwd: workspace.path, agentPreset: 'ai-agent-engine' },
      agentOptions: { provider: 'ae-test', model: 'fixture' },
      setup: async (ctx) => { await scaffold.ctx.agentPresets.mount(ctx, 'ai-agent-engine') },
    })
    const root = rootHandle.agent
    await workspace.attachSession(root.id)
    // Start a real conversation without an external model request.
    root.session.append('turn/start', { turn: 1 })
    root.session.append('user/message', createUserMessage({
      content: [{ type: 'text', text: 'Synthetic engineering task' }], source: { kind: 'user' },
    }), { surfaceOp: 'append' })
    root.session.append('step/start', { turn: 1, step: 1 })
    root.session.append('assistant/message', {
      stream: [], turn: 1, step: 1,
      message: createMessage({ role: 'assistant', content: [{ type: 'text', text: 'Synthetic conversation ready.' }],
        source: { kind: 'model', provider: 'ae-test', model: 'fixture' } }),
    }, { surfaceOp: 'append' })
    root.session.append('step/end', { turn: 1, step: 1 })
    root.session.append('turn/end', { turn: 1, reason: { kind: 'completed' } })
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
    expect(adapter.requests.length).toBe(2)
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
    const row = page.locator(`[data-row-key="session:${root.id}"]`)
    await row.waitFor()
    const observer = await newEnglishPage(browser)
    await observer.goto(scaffold.authenticatedUrl)
    const observedRow = observer.locator(`[data-row-key="session:${root.id}"]`)
    await observedRow.waitFor()
    await observedRow.click()
    const selectedBefore = await row.getAttribute('aria-selected')
    await row.click({ button: 'right' })
    expect(await row.getAttribute('aria-selected')).toBe(selectedBefore)
    await scaffold.ctx.settings.update('ai-agent-engine', { conversationManagement: false })
    await expect.poll(() => page.getByRole('menuitem', { name: 'Permanently delete', exact: true }).count()).toBe(0)
    expect(await scaffold.ctx.agentPresets.resolve('ai-agent-engine')).toEqual({ id: 'ai-agent-engine' })
    await scaffold.ctx.settings.update('ai-agent-engine', { conversationManagement: true })
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
    await dialog.waitFor({ state: 'hidden' })
    expect(await scaffold.ctx.sessionPersistence.stat(root.id)).toBeUndefined()
    for (const child of children) expect(await scaffold.ctx.sessionPersistence.stat(child.member.id)).toBeUndefined()
    expect(await scaffold.ctx.sessionPersistence.stat(fork.agent.id)).toBeDefined()
    expect(JSON.stringify((await scaffold.ctx.sessionQuery.readSession(fork.agent.id)).events))
      .toContain('Synthetic engineering task')
    await observedRow.waitFor({ state: 'hidden' })
    await mkdir(resolve(pluginRoot, 'output/playwright'), { recursive: true })
    await page.screenshot({ path: resolve(pluginRoot, 'output/playwright/after-deletion.png') })
    await page.reload()
    await page.waitForSelector('[class*="frame"]')
    expect(await page.locator(`[data-row-key="session:${root.id}"]`).count()).toBe(0)
  }, 90_000)
})

describe('AI Agent Engine independent module composition', () => {
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
        .toEqual({ conversationManagement: true })
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
