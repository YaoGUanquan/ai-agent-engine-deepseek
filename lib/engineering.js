// src/engineering.ts
import z from "@deepseek-ai/schemastery";
import { readFile as readFile3 } from "node:fs/promises";

// src/role-catalog.ts
var BUILTIN_ROLES = [
  { id: "requirements", skill: "ae-grill", responsibility: "Resolve decisions that materially affect acceptance." },
  { id: "frontend", skill: "ae-frontend", responsibility: "Implement accessible UI and all relevant interaction states." },
  { id: "backend", skill: "ae-backend", responsibility: "Implement compatible services, authorization and persistence." },
  { id: "unit-test", skill: "ae-unit-test", responsibility: "Exercise meaningful isolated behavior and regressions." },
  { id: "integration-test", skill: "ae-integration-test", responsibility: "Verify real cross-module contracts in isolation." },
  { id: "browser-test", skill: "ae-e2e-test", responsibility: "Verify requested user journeys with browser evidence." },
  { id: "e2e-engineer", skill: "ae-e2e-suite", responsibility: "Maintain suite infrastructure and CI when requested." }
];
var ROLE_ID = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
var RESERVED = /* @__PURE__ */ new Set(["lead"]);
function isValidRoleId(id) {
  return typeof id === "string" && ROLE_ID.test(id) && !RESERVED.has(id);
}
function isNonEmptyString(value) {
  return typeof value === "string" && value.length > 0;
}
function normalizeOverlayEntry(raw, warn) {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    warn("Ignoring non-object role overlay entry");
    return void 0;
  }
  const row = raw;
  if (!isValidRoleId(row.id)) {
    warn("Ignoring role overlay entry with invalid id: %o", row.id);
    return void 0;
  }
  const entry = { id: row.id };
  if ("skill" in row) {
    if (row.skill !== void 0 && !isNonEmptyString(row.skill)) {
      warn("Ignoring invalid skill on role overlay entry %s", row.id);
      return void 0;
    }
    if (isNonEmptyString(row.skill)) Object.assign(entry, { skill: row.skill });
  }
  if ("responsibility" in row) {
    if (row.responsibility !== void 0 && typeof row.responsibility !== "string") {
      warn("Ignoring invalid responsibility on role overlay entry %s", row.id);
      return void 0;
    }
    if (typeof row.responsibility === "string") Object.assign(entry, { responsibility: row.responsibility });
  }
  return entry;
}
function mergeRoleCatalog(builtin, overlay) {
  const byId = /* @__PURE__ */ new Map();
  const order = [];
  for (const role of builtin) {
    byId.set(role.id, { ...role });
    order.push(role.id);
  }
  for (const entry of overlay) {
    const current = byId.get(entry.id);
    if (current) {
      byId.set(entry.id, {
        id: current.id,
        skill: entry.skill !== void 0 ? entry.skill : current.skill,
        responsibility: entry.responsibility !== void 0 ? entry.responsibility : current.responsibility
      });
      continue;
    }
    byId.set(entry.id, {
      id: entry.id,
      skill: entry.skill,
      responsibility: entry.responsibility ?? ""
    });
    order.push(entry.id);
  }
  return order.map((id) => ({ ...byId.get(id) }));
}
function parseRolesFile(text, warn) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    warn("Role overlay JSON is corrupt; using builtin roles");
    return void 0;
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    warn("Role overlay root must be an object; using builtin roles");
    return void 0;
  }
  const document = parsed;
  if (document.version !== 1) {
    warn("Role overlay version is unsupported (%o); using builtin roles", document.version);
    return void 0;
  }
  if (!Array.isArray(document.roles)) {
    warn("Role overlay roles must be an array; using builtin roles");
    return void 0;
  }
  const roles = [];
  for (const row of document.roles) {
    const entry = normalizeOverlayEntry(row, warn);
    if (entry) roles.push(entry);
  }
  return roles;
}
function formatRoleIds(roles) {
  const ids = roles.map((role) => role.id);
  if (ids.length === 0) return "(none configured)";
  if (ids.length === 1) return ids[0];
  if (ids.length === 2) return `${ids[0]} or ${ids[1]}`;
  return `${ids.slice(0, -1).join(", ")}, or ${ids.at(-1)}`;
}
function formatRoleTable(roles) {
  const rows = roles.map((role) => `| ${role.id} | ${role.skill ?? "\u2014"} | ${role.responsibility ?? ""} |`);
  return ["| Role | Skill | Responsibility |", "| --- | --- | --- |", ...rows].join("\n");
}
function renderLeadPolicy(template, roles) {
  return template.replaceAll("{{ROLE_IDS}}", formatRoleIds(roles)).replaceAll("{{ROLE_TABLE}}", formatRoleTable(roles));
}

// src/role-catalog-io.ts
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
function resolveRolesFilePath(rolesPath) {
  const explicit = rolesPath?.trim();
  if (explicit) return explicit;
  const home = process.env.DSH_HOME?.trim();
  if (!home) return void 0;
  return join(home, "ai-agent-engine", "roles.json");
}
async function resolveRoleCatalog(options) {
  const warn = options.warn ?? (() => void 0);
  const builtin = BUILTIN_ROLES.map((role) => ({ ...role }));
  if (!options.enabled) return { roles: builtin, source: "builtin" };
  const path = resolveRolesFilePath(options.path);
  if (!path) return { roles: builtin, source: "builtin" };
  let text;
  try {
    text = await readFile(path, "utf8");
  } catch (error) {
    const code = error.code;
    if (code === "ENOENT") return { roles: builtin, source: "builtin", path };
    warn("Failed to read role overlay at %s (%s); using builtin roles", path, code ?? "error");
    return { roles: builtin, source: "builtin", path };
  }
  const overlay = parseRolesFile(text, warn);
  if (!overlay) return { roles: builtin, source: "builtin", path };
  return { roles: mergeRoleCatalog(builtin, overlay), source: "merged", path };
}

// src/capability-protocol.ts
var CAPABILITY_ENHANCE_SECTION = "ai-agent-engine:capability-enhance";
var PROMPT_OVERRIDE_SECTION = "ai-agent-engine:prompt-override";
var ENHANCE_PROFILES = ["default"];
function isKnownEnhanceProfile(value) {
  if (value === void 0 || value === null) return true;
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  return trimmed === "" || ENHANCE_PROFILES.includes(trimmed);
}
function capabilityEnhanceText(profile = "default") {
  const id = profile.trim() || "default";
  if (id !== "default") {
    return "";
  }
  return [
    "## Capability selection (AI Agent Engine)",
    "",
    "When this section is active for the session:",
    "1. Inspect available skills and host/MCP tools before improvising.",
    "2. Prefer a matching skill or tool for the user task; load skills through the host skill tool.",
    "3. Only fall back to ad-hoc shell steps when nothing in the catalog fits; say what was missing.",
    "4. Teammates you spawn should follow the same selection rule.",
    "",
    "## Collaboration (optional, task-driven)",
    "",
    "5. Keep simple tasks on the lead path; spawn teammates only for independent subtasks.",
    "6. State success criteria before delegating; do not rebind already-running teammates.",
    "",
    "## Verification feedback",
    "",
    "7. Prefer observable evidence (command output, tests, file diffs) over ungrounded claims.",
    "8. When a check fails, record the failure fact and a single next verification step.",
    "",
    "This guidance does not bypass host approvals, sandbox, or safety policy."
  ].join("\n");
}

// src/prompt-override.ts
var DEFAULT_PROMPT_OVERRIDE_RELATIVE = ["ai-agent-engine", "prompt-override.md"];
var MAX_PROMPT_OVERRIDE_CHARS = 64 * 1024;
var PromptOverrideValidationError = class extends Error {
  code = "ae-capability/invalid-prompt";
  constructor(message) {
    super(message);
    this.name = "PromptOverrideValidationError";
  }
};
function validatePromptOverrideText(raw) {
  if (typeof raw !== "string") {
    throw new PromptOverrideValidationError("Prompt override must be a string");
  }
  if (raw.length > MAX_PROMPT_OVERRIDE_CHARS) {
    throw new PromptOverrideValidationError(`Prompt override exceeds ${MAX_PROMPT_OVERRIDE_CHARS} characters`);
  }
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(raw)) {
    throw new PromptOverrideValidationError("Prompt override contains illegal control characters");
  }
  return raw;
}
function normalizePromptOverrideForRead(raw, warn = () => void 0) {
  try {
    const text = validatePromptOverrideText(raw);
    if (!text.trim()) return void 0;
    return text;
  } catch (error) {
    warn("Ignoring invalid prompt override (%s)", error instanceof Error ? error.message : error);
    return void 0;
  }
}

// src/prompt-override-io.ts
import { mkdir as mkdir2, readFile as readFile2, rename as rename2, unlink as unlink2, writeFile as writeFile2 } from "node:fs/promises";
import { dirname as dirname2, join as join2 } from "node:path";
function resolvePromptOverridePath(explicitPath) {
  const explicit = explicitPath?.trim();
  if (explicit) return explicit;
  const home = process.env.DSH_HOME?.trim();
  if (!home) return void 0;
  return join2(home, ...DEFAULT_PROMPT_OVERRIDE_RELATIVE);
}
async function readPromptOverride(path, warn = () => void 0) {
  if (!path) return {};
  let raw;
  try {
    raw = await readFile2(path, "utf8");
  } catch (error) {
    const code = error.code;
    if (code === "ENOENT") return { path };
    warn("Failed to read prompt override at %s (%s)", path, code ?? "error");
    return { path };
  }
  const text = normalizePromptOverrideForRead(raw, warn);
  return { text, path };
}

// src/capability-policy.ts
async function resolveCapabilityPolicySections(options) {
  const warn = options.warn ?? (() => void 0);
  const result = {};
  if (options.capabilityEnhanceEnabled) {
    const profile = options.enhanceProfile?.trim() ?? "";
    if (!isKnownEnhanceProfile(profile)) {
      warn("Unknown enhanceProfile %o; capability enhance isolated this turn", options.enhanceProfile);
      Object.assign(result, { enhanceSkipped: "profile" });
    } else {
      const text = capabilityEnhanceText(profile || "default");
      if (text) Object.assign(result, { enhanceText: text });
    }
  }
  if (!options.jailbreakEnabled) return result;
  const inline = options.jailbreakPrompt;
  if (typeof inline === "string" && inline.trim()) {
    const text = normalizePromptOverrideForRead(inline, warn);
    if (!text) return { ...result, overrideSkipped: "invalid" };
    return { ...result, overrideText: text };
  }
  const path = resolvePromptOverridePath(options.jailbreakPromptPath);
  if (!path) {
    warn("Jailbreak enabled but prompt override path unavailable (set DSH_HOME or jailbreakPromptPath)");
    return { ...result, overrideSkipped: "path" };
  }
  const loaded = await readPromptOverride(path, warn);
  if (!loaded.text) {
    return { ...result, overridePath: loaded.path ?? path, overrideSkipped: loaded.path ? "empty" : "empty" };
  }
  return { ...result, overrideText: loaded.text, overridePath: loaded.path ?? path };
}

// src/engineering.ts
var name = "ai-agent-engine-engineering";
var inject = ["systemPrompt", "tools", "agents", "agentTeams", "agentPresets"];
var Config = z.object({
  teamTools: z.boolean().default(true),
  rolesEnabled: z.any().default(true),
  rolesPath: z.string().default(""),
  capabilityEnhanceEnabled: z.any().default(false),
  jailbreakEnabled: z.any().default(false),
  enhanceProfile: z.string().default(""),
  jailbreakPromptPath: z.string().default(""),
  jailbreakPrompt: z.string().default("")
});
function flagOf(value, fallback = false) {
  if (typeof value === "function") return value();
  if (typeof value === "boolean") return value;
  return fallback;
}
function rolesEnabledOf(config) {
  return flagOf(config.rolesEnabled, true);
}
async function buildEngineeringPolicy(config, warn) {
  const template = await readFile3(new URL("../prompts/lead.md", import.meta.url), "utf8");
  const catalog = await resolveRoleCatalog({
    enabled: rolesEnabledOf(config),
    path: config.rolesPath,
    warn
  });
  return renderLeadPolicy(template, catalog.roles);
}
async function buildCapabilitySections(config, warn) {
  const resolved = await resolveCapabilityPolicySections({
    capabilityEnhanceEnabled: flagOf(config.capabilityEnhanceEnabled, false),
    jailbreakEnabled: flagOf(config.jailbreakEnabled, false),
    enhanceProfile: config.enhanceProfile,
    jailbreakPromptPath: config.jailbreakPromptPath,
    jailbreakPrompt: config.jailbreakPrompt,
    warn
  });
  return {
    enhance: resolved.enhanceText,
    override: resolved.overrideText
  };
}
async function apply(ctx, config) {
  const warn = (message, ...args) => {
    ctx.logger.warn(message, ...args);
  };
  let policy = await buildEngineeringPolicy(config, warn);
  let sections = await buildCapabilitySections(config, warn);
  if (config.teamTools) await ctx.plugin(await import("@deepseek-ai/dsh-experimental-tool-agent-team"));
  const installed = /* @__PURE__ */ new Map();
  const disposeAll = (entry) => {
    entry.disposeLead();
    entry.disposeEnhance?.();
    entry.disposeOverride?.();
  };
  const installSections = (agent) => {
    const disposeLead = agent.ctx.systemPrompt.section({
      name: "ai-agent-engine:engineering",
      order: 700,
      text: policy,
      interpolate: false
    });
    let disposeOverride;
    if (sections.override) {
      disposeOverride = agent.ctx.systemPrompt.section({
        name: PROMPT_OVERRIDE_SECTION,
        order: 740,
        text: sections.override,
        interpolate: false
      });
    }
    let disposeEnhance;
    if (sections.enhance) {
      disposeEnhance = agent.ctx.systemPrompt.section({
        name: CAPABILITY_ENHANCE_SECTION,
        order: 780,
        text: sections.enhance,
        interpolate: false
      });
    }
    return { disposeLead, disposeEnhance, disposeOverride };
  };
  const reconcile = (agent) => {
    const preset = ctx.agentPresets.composedPreset(agent.ctx);
    const enabled = preset === "standard" || preset === "ai-agent-engine";
    if (!enabled) {
      const prev = installed.get(agent);
      if (prev) {
        disposeAll(prev);
        installed.delete(agent);
      }
    } else if (!installed.has(agent)) {
      installed.set(agent, installSections(agent));
    }
  };
  const reconcileAll = () => {
    for (const agent of [...installed.keys()]) {
      const prev = installed.get(agent);
      if (prev) {
        disposeAll(prev);
        installed.delete(agent);
      }
    }
    for (const agent of ctx.agents.list()) reconcile(agent);
  };
  for (const agent of ctx.agents.list()) reconcile(agent);
  ctx.on("agent/created", ({ agent }) => {
    reconcile(agent);
    return void 0;
  });
  ctx.on("agent-preset/selected", (sessionId) => {
    const agent = ctx.agents.get(sessionId);
    if (agent) {
      const prev = installed.get(agent);
      if (prev) {
        disposeAll(prev);
        installed.delete(agent);
      }
      reconcile(agent);
    }
  });
  ctx.on("agent/disposed", ({ agent }) => {
    const prev = installed.get(agent);
    if (prev) {
      disposeAll(prev);
      installed.delete(agent);
    }
  });
  const refreshPolicy = () => {
    void (async () => {
      try {
        policy = await buildEngineeringPolicy(config, warn);
        sections = await buildCapabilitySections(config, warn);
        reconcileAll();
      } catch (error) {
        warn("Failed to refresh engineering / capability policy: %s", error instanceof Error ? error.message : error);
      }
    })();
  };
  ctx.on("loader/volatile-update", refreshPolicy);
  ctx.on("ai-agent-engine/roles-updated", refreshPolicy);
  ctx.on("ai-agent-engine/capability-updated", refreshPolicy);
  ctx.effect(() => () => {
    for (const entry of installed.values()) disposeAll(entry);
    installed.clear();
  }, "ai-agent-engine.scopedPolicy()");
}
export {
  Config,
  apply,
  buildCapabilitySections,
  buildEngineeringPolicy,
  inject,
  name
};
