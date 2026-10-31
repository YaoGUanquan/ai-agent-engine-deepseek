import { describe, expect, it } from 'vitest'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { resolveCapabilityPolicySections } from '../src/capability-policy.ts'
import { capabilityEnhanceText, isKnownEnhanceProfile } from '../src/capability-protocol.ts'
import {
  MAX_PROMPT_OVERRIDE_CHARS,
  normalizePromptOverrideForRead,
  validatePromptOverrideText,
} from '../src/prompt-override.ts'
import { writePromptOverride, deletePromptOverride } from '../src/prompt-override-io.ts'

describe('capability enhance protocol', () => {
  it('accepts default profile and rejects unknown ids', () => {
    expect(isKnownEnhanceProfile('')).toBe(true)
    expect(isKnownEnhanceProfile('default')).toBe(true)
    expect(isKnownEnhanceProfile('apex-v1')).toBe(false)
    expect(capabilityEnhanceText('default')).toContain('Capability selection')
    expect(capabilityEnhanceText('default')).toContain('Verification feedback')
    expect(capabilityEnhanceText('nope')).toBe('')
  })
})

describe('prompt override validation', () => {
  it('rejects oversized or control-laden text; empty is allowed on write', () => {
    expect(validatePromptOverrideText('')).toBe('')
    expect(validatePromptOverrideText('hello')).toBe('hello')
    expect(() => validatePromptOverrideText('a'.repeat(MAX_PROMPT_OVERRIDE_CHARS + 1))).toThrow()
    expect(() => validatePromptOverrideText('bad\u0000')).toThrow()
    expect(normalizePromptOverrideForRead('   ')).toBeUndefined()
    expect(normalizePromptOverrideForRead('ok\n')).toBe('ok\n')
  })
})

describe('resolveCapabilityPolicySections', () => {
  it('fully bypasses when both switches are off', async () => {
    const result = await resolveCapabilityPolicySections({
      capabilityEnhanceEnabled: false,
      jailbreakEnabled: false,
      jailbreakPrompt: 'should-not-appear',
      enhanceProfile: 'default',
    })
    expect(result.enhanceText).toBeUndefined()
    expect(result.overrideText).toBeUndefined()
  })

  it('injects enhance only when enhance is on', async () => {
    const result = await resolveCapabilityPolicySections({
      capabilityEnhanceEnabled: true,
      jailbreakEnabled: false,
      enhanceProfile: 'default',
    })
    expect(result.enhanceText).toContain('Capability selection')
    expect(result.overrideText).toBeUndefined()
  })

  it('isolates unknown enhanceProfile without blocking jailbreak', async () => {
    const result = await resolveCapabilityPolicySections({
      capabilityEnhanceEnabled: true,
      jailbreakEnabled: true,
      enhanceProfile: 'not-a-profile',
      jailbreakPrompt: 'overlay-body',
    })
    expect(result.enhanceSkipped).toBe('profile')
    expect(result.enhanceText).toBeUndefined()
    expect(result.overrideText).toBe('overlay-body')
  })

  it('reads overlay file when jailbreak on and inline empty', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ae-cap-'))
    const path = join(dir, 'prompt-override.md')
    await writePromptOverride(path, 'from-file')
    const result = await resolveCapabilityPolicySections({
      capabilityEnhanceEnabled: false,
      jailbreakEnabled: true,
      jailbreakPromptPath: path,
    })
    expect(result.overrideText).toBe('from-file')
    await deletePromptOverride(path)
  })

  it('prefers inline jailbreakPrompt over file', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ae-cap-'))
    const path = join(dir, 'prompt-override.md')
    await writeFile(path, 'file-text', 'utf8')
    const result = await resolveCapabilityPolicySections({
      capabilityEnhanceEnabled: false,
      jailbreakEnabled: true,
      jailbreakPromptPath: path,
      jailbreakPrompt: 'inline-text',
    })
    expect(result.overrideText).toBe('inline-text')
  })
})

describe('buildCapabilitySections enhanceProfile getter', () => {
  it('reads live enhanceProfile from a getter (volatile wiring)', async () => {
    const { buildCapabilitySections } = await import('../src/engineering.ts')
    let profile = 'default'
    const sections = await buildCapabilitySections({
      capabilityEnhanceEnabled: true,
      jailbreakEnabled: false,
      enhanceProfile: () => profile,
    })
    expect(sections.enhance).toContain('Capability selection')
    profile = 'nope'
    const isolated = await buildCapabilitySections({
      capabilityEnhanceEnabled: true,
      jailbreakEnabled: false,
      enhanceProfile: () => profile,
    })
    expect(isolated.enhance).toBeUndefined()
  })
})
