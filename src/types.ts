/** Independent module switches and the native Team roster limit. */
export interface Config {
  engineering: boolean
  conversationManagement: boolean
  maxMembers: number
  /** When false, Lead policy uses packaged builtin roles only. */
  rolesEnabled: boolean
  /**
   * Absolute overlay path. Empty uses `$DSH_HOME/ai-agent-engine/roles.json`.
   * Not workspace `.ai-agent-engine/` (that path remains deletion journals only).
   */
  rolesPath: string
  /**
   * Release feed the settings update button reads. Empty uses the official
   * GitHub release channel; a `file:` URL reads a local document for mirrors.
   */
  updateFeed: string
}
