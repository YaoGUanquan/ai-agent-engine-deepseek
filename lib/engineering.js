// src/engineering.ts
import z from "@deepseek-ai/schemastery";
import { readFile as readFile2 } from "node:fs/promises";
import * as teamTools from "@deepseek-ai/dsh-experimental-tool-agent-team";

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

// src/engineering.ts
var name = "ai-agent-engine-engineering";
var inject = ["systemPrompt", "tools", "agents", "agentTeams", "agentPresets"];
var Config = z.object({
  teamTools: z.boolean().default(true),
  rolesEnabled: z.any().default(true),
  rolesPath: z.string().default("")
});
function rolesEnabledOf(config) {
  const value = config.rolesEnabled;
  if (typeof value === "function") return value();
  return value !== false;
}
async function buildEngineeringPolicy(config, warn) {
  const template = await readFile2(new URL("../prompts/lead.md", import.meta.url), "utf8");
  const catalog = await resolveRoleCatalog({
    enabled: rolesEnabledOf(config),
    path: config.rolesPath,
    warn
  });
  return renderLeadPolicy(template, catalog.roles);
}
async function apply(ctx, config) {
  const warn = (message, ...args) => {
    ctx.logger.warn(message, ...args);
  };
  let policy = await buildEngineeringPolicy(config, warn);
  if (config.teamTools) ctx.plugin(teamTools);
  const installed = /* @__PURE__ */ new Map();
  const reconcile = (agent) => {
    const preset = ctx.agentPresets.composedPreset(agent.ctx);
    const enabled = preset === "standard" || preset === "ai-agent-engine";
    if (!enabled) {
      installed.get(agent)?.();
      installed.delete(agent);
    } else if (!installed.has(agent)) {
      installed.set(agent, agent.ctx.systemPrompt.section({
        name: "ai-agent-engine:engineering",
        order: 700,
        text: policy,
        interpolate: false
      }));
    }
  };
  const reconcileAll = () => {
    for (const agent of [...installed.keys()]) {
      installed.get(agent)?.();
      installed.delete(agent);
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
      installed.get(agent)?.();
      installed.delete(agent);
      reconcile(agent);
    }
  });
  ctx.on("agent/disposed", ({ agent }) => {
    installed.get(agent)?.();
    installed.delete(agent);
  });
  const refreshPolicy = () => {
    void (async () => {
      try {
        policy = await buildEngineeringPolicy(config, warn);
        reconcileAll();
      } catch (error) {
        warn("Failed to refresh engineering role policy: %s", error instanceof Error ? error.message : error);
      }
    })();
  };
  ctx.on("loader/volatile-update", refreshPolicy);
  ctx.on("ai-agent-engine/roles-updated", refreshPolicy);
  ctx.effect(() => () => {
    for (const dispose of installed.values()) dispose();
    installed.clear();
  }, "ai-agent-engine.scopedPolicy()");
}
export {
  Config,
  apply,
  buildEngineeringPolicy,
  inject,
  name
};
