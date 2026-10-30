var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __knownSymbol = (name3, symbol) => (symbol = Symbol[name3]) ? symbol : Symbol.for("Symbol." + name3);
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name3 in all)
    __defProp(target, name3, { get: all[name3], enumerable: true });
};
var __decoratorStart = (base) => [, , , __create(base?.[__knownSymbol("metadata")] ?? null)];
var __decoratorStrings = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError("Function expected") : fn;
var __decoratorContext = (kind, name3, done, metadata, fns) => ({ kind: __decoratorStrings[kind], name: name3, metadata, addInitializer: (fn) => done._ ? __typeError("Already initialized") : fns.push(__expectFn(fn || null)) });
var __decoratorMetadata = (array, target) => __defNormalProp(target, __knownSymbol("metadata"), array[3]);
var __runInitializers = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) flags & 1 ? fns[i].call(self) : value = fns[i].call(self, value);
  return value;
};
var __decorateElement = (array, flags, name3, decorators, target, extra) => {
  var fn, it, done, ctx, access, k = flags & 7, s = !!(flags & 8), p = !!(flags & 16);
  var j = k > 3 ? array.length + 1 : k ? s ? 1 : 2 : 0, key = __decoratorStrings[k + 5];
  var initializers = k > 3 && (array[j - 1] = []), extraInitializers = array[j] || (array[j] = []);
  var desc = k && (!p && !s && (target = target.prototype), k < 5 && (k > 3 || !p) && __getOwnPropDesc(k < 4 ? target : { get [name3]() {
    return __privateGet(this, extra);
  }, set [name3](x) {
    return __privateSet(this, extra, x);
  } }, name3));
  k ? p && k < 4 && __name(extra, (k > 2 ? "set " : k > 1 ? "get " : "") + name3) : __name(target, name3);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext(k, name3, done = {}, array[3], extraInitializers);
    if (k) {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: p ? (x) => __privateIn(target, x) : (x) => name3 in x };
      if (k ^ 3) access.get = p ? (x) => (k ^ 1 ? __privateGet : __privateMethod)(x, target, k ^ 4 ? extra : desc.get) : (x) => x[name3];
      if (k > 2) access.set = p ? (x, y) => __privateSet(x, target, y, k ^ 4 ? extra : desc.set) : (x, y) => x[name3] = y;
    }
    it = (0, decorators[i])(k ? k < 4 ? p ? extra : desc[key] : k > 4 ? void 0 : { get: desc.get, set: desc.set } : target, ctx), done._ = 1;
    if (k ^ 4 || it === void 0) __expectFn(it) && (k > 4 ? initializers.unshift(it) : k ? p ? extra = it : desc[key] = it : target = it);
    else if (typeof it !== "object" || it === null) __typeError("Object expected");
    else __expectFn(fn = it.get) && (desc.get = fn), __expectFn(fn = it.set) && (desc.set = fn), __expectFn(fn = it.init) && initializers.unshift(fn);
  }
  return k || __decoratorMetadata(array, target), desc && __defProp(target, name3, desc), p ? k ^ 4 ? extra : desc : target;
};
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateIn = (member, obj) => Object(obj) !== obj ? __typeError('Cannot use the "in" operator on this value') : member.has(obj);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

// src/index.ts
import z3 from "@deepseek-ai/schemastery";
import AgentPreset from "@deepseek-ai/dsh-agent-preset";
import TeamService from "@deepseek-ai/dsh-experimental-agent-team";
import { entryListProblem } from "@deepseek-ai/dsh-agent-preset-registry";
import { entryListSchema } from "@deepseek-ai/cordis-plugin-include";
import { load } from "js-yaml";

// src/skills.ts
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { BUNDLED_SKILL_RANK } from "@deepseek-ai/dsh-skill";
import { parse } from "yaml";
var skillNames = [
  "ae-grill",
  "ae-frontend",
  "ae-backend",
  "ae-unit-test",
  "ae-integration-test",
  "ae-e2e-test",
  "ae-e2e-suite"
];
function installSkills(ctx) {
  const provider = "ai-agent-engine";
  const candidate = async (name3) => {
    const resourceBase = { kind: "directory", path: fileURLToPath(new URL(`../skills/${name3}/`, import.meta.url)) };
    const text = await readFile(new URL(`../skills/${name3}/SKILL.md`, import.meta.url), "utf8");
    const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(text);
    if (!frontmatter) throw new Error(`Missing skill frontmatter: ${name3}`);
    const data = parse(frontmatter[1]);
    if (data.name !== name3 || !data.description) throw new Error(`Invalid skill metadata: ${name3}`);
    return {
      name: name3,
      description: data.description,
      provider,
      source: "bundled",
      rank: BUNDLED_SKILL_RANK,
      invocation: { modelInvocable: true, userInvocable: true },
      resourceBase,
      locator: name3
    };
  };
  ctx.skills.registerProvider(() => ({
    name: provider,
    list: () => Promise.all(skillNames.map(candidate)),
    async get(selected) {
      if (!skillNames.some((name3) => name3 === selected.name)) return void 0;
      const text = await readFile(new URL(`../skills/${selected.name}/SKILL.md`, import.meta.url), "utf8");
      return { ...selected, content: text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "") };
    }
  }));
}

// src/engineering.ts
var engineering_exports = {};
__export(engineering_exports, {
  Config: () => Config,
  apply: () => apply,
  buildEngineeringPolicy: () => buildEngineeringPolicy,
  inject: () => inject,
  name: () => name
});
import z from "@deepseek-ai/schemastery";
import { readFile as readFile3 } from "node:fs/promises";
import * as teamTools from "@deepseek-ai/dsh-experimental-tool-agent-team";

// src/role-catalog.ts
import { readFile as readFile2 } from "node:fs/promises";
import { join } from "node:path";
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
function resolveRolesFilePath(rolesPath) {
  const explicit = rolesPath?.trim();
  if (explicit) return explicit;
  const home = process.env.DSH_HOME?.trim();
  if (!home) return void 0;
  return join(home, "ai-agent-engine", "roles.json");
}
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
async function resolveRoleCatalog(options) {
  const warn = options.warn ?? (() => void 0);
  const builtin = BUILTIN_ROLES.map((role) => ({ ...role }));
  if (!options.enabled) return { roles: builtin, source: "builtin" };
  const path = resolveRolesFilePath(options.path);
  if (!path) return { roles: builtin, source: "builtin" };
  let text;
  try {
    text = await readFile2(path, "utf8");
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
  const template = await readFile3(new URL("../prompts/lead.md", import.meta.url), "utf8");
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
  ctx.on("loader/volatile-update", () => {
    void (async () => {
      try {
        policy = await buildEngineeringPolicy(config, warn);
        reconcileAll();
      } catch (error) {
        warn("Failed to refresh engineering role policy: %s", error instanceof Error ? error.message : error);
      }
    })();
  });
  ctx.effect(() => () => {
    for (const dispose of installed.values()) dispose();
    installed.clear();
  }, "ai-agent-engine.scopedPolicy()");
}

// src/conversation-deletion.ts
import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile as readFile4, readdir, realpath, rename, rm, writeFile } from "node:fs/promises";
import { isAbsolute, join as join2, relative, resolve as resolve2, sep } from "node:path";
import { Service } from "@deepseek-ai/cordis";
import { Remote, RemoteError, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";

// src/deletion-rpc.ts
import { z as z2 } from "zod";
var namespace = "aeConversations";
var identity = z2.string().min(1);
var previewRequest = z2.strictObject({ sessionId: identity });
var preview = z2.strictObject({
  sessionId: identity,
  sessionIds: z2.array(identity).min(1),
  fingerprint: z2.string().regex(/^[a-f0-9]{64}$/),
  runningSessionIds: z2.array(identity)
});
var confirmation = preview.extend({ stopRunning: z2.literal(true) });
function codec(schema, name3) {
  return { mode: "strict", typeSymbol: `ai-agent-engine-deepseek#${name3}`, create: () => schema };
}
var deletionRpc = {
  package: "ai-agent-engine-deepseek",
  descriptors: ["deletePreview", "delete"].map((method) => ({
    id: `ai-agent-engine-deepseek#${namespace}/${method}`,
    service: "aeConversations",
    namespace,
    method,
    invocation: { kind: "direct" },
    parameters: [{
      name: "request",
      wire: "request",
      source: "json",
      codec: codec(method === "deletePreview" ? previewRequest : confirmation, `${method}Request`)
    }],
    result: codec(method === "deletePreview" ? preview : z2.array(identity), `${method}Result`)
  }))
};

// src/runtime-method.ts
import { symbols } from "@deepseek-ai/cordis";
function wrapMethod(service, key, wrap) {
  const raw = service[symbols.original] ?? service;
  const descriptor = Object.getOwnPropertyDescriptor(raw, key);
  const original = raw[key];
  const adapted = wrap(original);
  if (typeof original !== "function" || typeof adapted !== "function") throw new TypeError("Expected a service method");
  let active = true;
  const replacement = function(...args) {
    return Reflect.apply(active ? adapted : original, this, args);
  };
  Object.defineProperty(raw, key, { configurable: true, writable: true, value: replacement });
  return () => {
    active = false;
    if (raw[key] !== replacement) return;
    if (descriptor) Object.defineProperty(raw, key, descriptor);
    else Reflect.deleteProperty(raw, key);
  };
}

// src/disabled-search-index.ts
import { stat } from "node:fs/promises";
import { resolve } from "node:path";
async function clearDisabledSearchIndex(path, ids) {
  if (!path) throw new Error("The disabled search index has no known storage path");
  if (path === ":memory:") return;
  const target = resolve(path);
  try {
    await stat(target);
  } catch (error) {
    if (error.code === "ENOENT") return;
    throw error;
  }
  const { DatabaseSync } = await import("node:sqlite");
  const db = new DatabaseSync(target);
  try {
    const application = db.prepare("PRAGMA application_id").get();
    const version = db.prepare("PRAGMA user_version").get();
    if (application?.application_id !== 1146308689 || version?.user_version !== 8) {
      throw new Error("The search index is not a recognized Harness rc.3 index");
    }
    db.exec("PRAGMA busy_timeout = 5000");
    db.exec("BEGIN IMMEDIATE");
    try {
      const documents = db.prepare("DELETE FROM persisted_docs WHERE session_id = ?");
      const sessions = db.prepare("DELETE FROM persisted_sessions WHERE id = ?");
      for (const id of ids) {
        documents.run(id);
        sessions.run(id);
      }
      db.exec("UPDATE search_state SET global_generation = global_generation + 1 WHERE singleton = 1");
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  } finally {
    db.close();
  }
}

// src/conversation-deletion.ts
function reject(message, code = "ae-conversations/delete-rejected") {
  throw new RemoteError(code, message, {});
}
function encodeSegment(text) {
  if (text === "." || text === "..") return text.replaceAll(".", "~002E");
  return text.replace(/[^A-Za-z0-9._-]/g, (character) => `~${character.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0")}`);
}
function sessionDirectory(root, header) {
  const project = header.cwd === void 0 ? "_no-cwd" : `--${(encodeSegment(header.cwd.replace(/[\\/:]+/g, "-")).replace(/^-+/, "") || "root").slice(0, 251)}--`;
  return join2(root, project, encodeSegment(header.id));
}
function fingerprint(headers) {
  return createHash("sha256").update(JSON.stringify(headers.map((header) => [header.id, header.createdAt, header.cwd, header.parentSession, header.origin]))).digest("hex");
}
function supportsConversationDeletionPersistence(persistence) {
  return persistence.name === "session-persistence-jsonl" && typeof persistence.config?.root === "string";
}
function isValidDeletionRecord(record, filename) {
  return record.version === 1 && record.fingerprint === filename.slice(0, -5) && typeof record.rootId === "string" && typeof record.complete === "boolean" && Array.isArray(record.headers) && record.headers.length > 0 && record.headers.every((header) => header && typeof header.id === "string" && header.id.length > 0 && typeof header.createdAt === "number" && (header.cwd === void 0 || typeof header.cwd === "string")) && record.headers.some((header) => header.id === record.rootId) && fingerprint(record.headers) === record.fingerprint;
}
async function loadDeletionJournalFile(directory, filename, log) {
  if (!/^[a-f0-9]{64}\.json$/.test(filename)) return void 0;
  const path = join2(directory, filename);
  try {
    const record = JSON.parse(await readFile4(path, "utf8"));
    if (!isValidDeletionRecord(record, filename)) throw new Error("Invalid conversation deletion record");
    return record;
  } catch (error) {
    const quarantine = `${path}.corrupt`;
    try {
      await rename(path, quarantine);
      log("Quarantined corrupt conversation deletion journal %s -> %s (%s)", filename, quarantine, error);
    } catch (renameError) {
      log("Failed to quarantine corrupt conversation deletion journal %s (%s); original error: %s", filename, renameError, error);
    }
    return void 0;
  }
}
var _delete_dec, _deletePreview_dec, _a, _init, _b;
var ConversationDeletion = class extends (_b = TypertRemoteService) {
  constructor(ctx, config) {
    super(ctx, "aeConversations");
    this.config = config;
    __runInitializers(_init, 5, this);
    __publicField(this, "handles", /* @__PURE__ */ new Map());
    __publicField(this, "inflight", /* @__PURE__ */ new Map());
    __publicField(this, "pending", /* @__PURE__ */ new Set());
    __publicField(this, "deleted", /* @__PURE__ */ new Set());
    __publicField(this, "previews", /* @__PURE__ */ new Map());
    __publicField(this, "operations", /* @__PURE__ */ new Set());
    __publicField(this, "root");
    __publicField(this, "directory");
    __publicField(this, "rawOpen");
    __publicField(this, "rawStat");
    __publicField(this, "ready");
    __publicField(this, "active", /* @__PURE__ */ new Set());
    __publicField(this, "closing", false);
    __publicField(this, "unsupported", false);
    ctx.typert.register({
      package: deletionRpc.package,
      face: "host",
      schemas: [],
      model: { services: [], events: [], objects: [] },
      invocations: deletionRpc.descriptors
    });
    this.ready = this.initialize();
  }
  async [(_a = Service.init, _deletePreview_dec = [Remote("deletePreview")], _delete_dec = [Remote("delete")], _a)]() {
    await this.ready;
  }
  async initialize() {
    const ctx = this.ctx;
    const persistence = ctx.sessionPersistence;
    if (!supportsConversationDeletionPersistence(persistence)) {
      this.unsupported = true;
      ctx.logger.warn("Conversation deletion disabled: storage backend is not session-persistence-jsonl with a configured root");
      return;
    }
    this.root = resolve2(persistence.config.root);
    this.directory = join2(this.root, ".ai-agent-engine", "deletions");
    await mkdir(this.directory, { recursive: true, mode: 448 });
    const remember = async (operation, id, parent) => {
      this.inflight.set(operation, { id, parent });
      try {
        const handle = await operation;
        if (this.blocked(handle.agent.id) || this.blocked(handle.agent.session.header.parentSession)) {
          await handle.dispose();
          reject("This conversation is being deleted");
        }
        this.handles.set(handle.agent.id, handle);
        return handle;
      } finally {
        this.inflight.delete(operation);
      }
    };
    const owner = this;
    const restore = [];
    ctx.effect(() => async () => {
      this.closing = true;
      await Promise.allSettled([...this.active]);
      for (const dispose of restore.reverse()) dispose();
    }, "ai-agent-engine.deletionDrain()");
    restore.push(wrapMethod(ctx.agents, "create", (original) => async function(options) {
      const parent = options.meta?.parentSession ?? options.parentAgent?.id;
      owner.assertWritable(options.sessionId, parent);
      return remember(original.call(this, options), options.sessionId, parent);
    }));
    restore.push(wrapMethod(ctx.agents, "resume", (original) => async function(options) {
      owner.assertWritable(options.resumeSessionId);
      return remember(original.call(this, options), options.resumeSessionId, options.parentAgent?.id);
    }));
    restore.push(wrapMethod(persistence, "create", (original) => async function(header, options) {
      owner.assertWritable(header.id, header.parentSession);
      return original.call(this, header, options);
    }));
    const rawPersistence = persistence;
    restore.push(wrapMethod(persistence, "open", (original) => {
      this.rawOpen = original.bind(rawPersistence);
      return async function(id, access, options) {
        if (owner.deleted.has(id) || access === "write" && owner.pending.has(id)) reject("Conversation was deleted");
        return original.call(this, id, access, options);
      };
    }));
    restore.push(wrapMethod(persistence, "stat", (original) => {
      this.rawStat = original.bind(rawPersistence);
      return function(id, options) {
        return owner.deleted.has(id) ? Promise.resolve(void 0) : original.call(this, id, options);
      };
    }));
    restore.push(wrapMethod(persistence, "list", (original) => async function(options) {
      return (await original.call(this, options)).filter((row) => !owner.deleted.has(row.header.id));
    }));
    ctx.on("session/created", (session) => {
      this.assertWritable(session.id, session.header.parentSession);
    });
    ctx.on("agent/disposed", ({ agent }) => {
      this.handles.delete(agent.id);
    });
    const cache = ctx.storageDomain.get("session_projcache")?.table("sessions");
    if (cache) restore.push(wrapMethod(cache, "put", (original) => function(id, value) {
      return owner.blocked(id) ? Promise.resolve() : original.call(this, id, value);
    }));
    for (const filename of await readdir(this.directory)) {
      const record = await loadDeletionJournalFile(this.directory, filename, (format, ...args) => {
        ctx.logger.warn(format, ...args);
      });
      if (!record) continue;
      for (const header of record.headers) this.deleted.add(header.id);
      if (!record.complete) {
        const locks = [];
        try {
          for (const header of record.headers) {
            if (await this.rawStat(header.id)) locks.push(await this.rawOpen(header.id, "write"));
          }
          await this.cleanup(record);
        } finally {
          await Promise.all(locks.map((handle) => handle.close()));
        }
      }
    }
  }
  blocked(id) {
    return id !== void 0 && (this.pending.has(id) || this.deleted.has(id));
  }
  assertWritable(id, parent) {
    if (this.blocked(id) || this.blocked(parent)) reject("Conversation is being deleted or has been deleted");
  }
  authorize(ids) {
    const ctx = this.ctx;
    if (this.closing || !this.config.enabled()) reject("Conversation management is disabled");
    if (ctx.invocation?.peer.principal.kind !== "owner") reject("Only the Host owner can delete conversations");
    for (const id of ids) {
      if (!ctx.remoteAccess.allows({ kind: "session", id })) reject("Conversation access denied");
    }
  }
  async collect(id) {
    const headers = new Map((await this.ctx.sessionPersistence.list()).map((row) => [row.header.id, row.header]));
    for (const session of this.ctx.sessions.list()) headers.set(session.id, session.header);
    const root = headers.get(id);
    if (!root || root.origin === "subagent") reject("Select the owning conversation");
    const ids = /* @__PURE__ */ new Set([id]);
    let previous = 0;
    while (ids.size !== previous) {
      previous = ids.size;
      for (const header of headers.values()) {
        if (header.origin === "subagent" && header.parentSession && ids.has(header.parentSession)) ids.add(header.id);
      }
    }
    return [...ids].sort().map((key) => headers.get(key));
  }
  async deletePreview(request) {
    await this.ready;
    if (this.unsupported) reject("This storage backend is not supported by conversation deletion", "ae-conversations/delete-unsupported");
    if (!request || typeof request.sessionId !== "string" || !request.sessionId) reject("Invalid conversation identity");
    this.authorize([request.sessionId]);
    const headers = await this.collect(request.sessionId);
    const sessionIds = headers.map((header) => header.id);
    this.authorize(sessionIds);
    const key = fingerprint(headers);
    this.previews.set(key, { version: 1, rootId: request.sessionId, fingerprint: key, headers, complete: false });
    return {
      sessionId: request.sessionId,
      sessionIds,
      fingerprint: key,
      runningSessionIds: sessionIds.filter((id) => this.ctx.agents.get(id)?.status === "running")
    };
  }
  async delete(request) {
    await this.ready;
    if (this.unsupported) reject("This storage backend is not supported by conversation deletion", "ae-conversations/delete-unsupported");
    const operation = this.performDeletion(request);
    this.active.add(operation);
    try {
      return await operation;
    } finally {
      this.active.delete(operation);
    }
  }
  async performDeletion(request) {
    if (!request || request.stopRunning !== true || !Array.isArray(request.sessionIds) || request.sessionIds.some((id) => typeof id !== "string")) reject("Invalid deletion confirmation");
    this.authorize(request.sessionIds);
    const record = this.previews.get(request.fingerprint);
    if (!record || record.rootId !== request.sessionId || JSON.stringify(record.headers.map((header) => header.id)) !== JSON.stringify(request.sessionIds)) {
      reject("Preview the conversation again", "ae-conversations/delete-scope-changed");
    }
    if (this.operations.has(record.fingerprint) || request.sessionIds.some((id) => this.pending.has(id))) reject("Deletion is already running");
    this.operations.add(record.fingerprint);
    for (const id of request.sessionIds) this.pending.add(id);
    const locks = [];
    try {
      const committed = request.sessionIds.every((id) => this.deleted.has(id));
      if (!committed) {
        if (fingerprint(await this.collect(request.sessionId)) !== record.fingerprint) reject("Conversation family changed", "ae-conversations/delete-scope-changed");
        await Promise.allSettled([...this.inflight].filter(([, item]) => this.pending.has(item.id) || item.parent !== void 0 && this.pending.has(item.parent)).map(([operation]) => operation));
        for (const id of request.sessionIds) {
          const agent = this.ctx.agents.get(id);
          if (agent && this.handles.get(id)?.agent !== agent) {
            reject("Restart Desktop once after enabling the plugin", "ae-conversations/delete-restart-required");
          }
          if (!agent && this.ctx.sessions.get(id)) reject("Conversation is still in use");
        }
        for (const id of [...request.sessionIds].reverse()) {
          const agent = this.ctx.agents.get(id);
          if (agent) {
            const handle = this.handles.get(id);
            if (handle?.agent !== agent) reject("Restart Desktop once after enabling the plugin", "ae-conversations/delete-restart-required");
            agent.cancel({ kind: "user" }, { keepInbox: false });
            await this.ctx.parallel("workspace/session-stop", { sessionId: id });
            await handle.dispose();
          }
          if (this.ctx.sessions.get(id)) reject("Conversation is still in use");
        }
      }
      for (const id of request.sessionIds) {
        if (await this.rawStat(id)) locks.push(await this.rawOpen(id, "write"));
      }
      if (!committed) {
        await this.save(record);
        for (const id of request.sessionIds) this.deleted.add(id);
      }
      await this.cleanup(record);
      return request.sessionIds;
    } finally {
      try {
        await Promise.all(locks.map((handle) => handle.close()));
      } finally {
        for (const id of request.sessionIds) this.pending.delete(id);
        this.operations.delete(record.fingerprint);
      }
    }
  }
  async save(record) {
    const target = join2(this.directory, `${record.fingerprint}.json`);
    const temporary = `${target}.${randomUUID()}.tmp`;
    await writeFile(temporary, JSON.stringify(record), { mode: 384, flag: "wx" });
    await rename(temporary, target);
  }
  async cleanup(record) {
    const root = await realpath(this.root);
    for (const header of record.headers) {
      const directory = sessionDirectory(this.root, header);
      let actual;
      try {
        actual = await realpath(directory);
      } catch (error) {
        if (error.code === "ENOENT") continue;
        throw error;
      }
      const within = relative(root, actual);
      if (!within || within === ".." || within.startsWith(`..${sep}`) || isAbsolute(within)) reject("Unsafe conversation storage path");
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        if (entry.name === "session.lock") continue;
        await rm(join2(directory, entry.name), { recursive: entry.isDirectory(), force: true });
      }
    }
    const ctx = this.ctx;
    const ids = record.headers.map((header) => header.id);
    const cache = ctx.storageDomain.get("session_projcache")?.table("sessions");
    for (const id of ids) {
      await cache?.delete(id);
      for (const workspace of ctx.workspaceRegistry.list()) await workspace.detachSession(id);
      await ctx.workspaceRegistry.unarchiveSession(id);
      await ctx.workspaceRegistry.unpinSession(id);
    }
    try {
      await ctx.sessionQuery.searchSessions({ query: "ai-agent-engine-deletion", limit: 1 });
    } catch (error) {
      if (error.code !== "SESSION_QUERY_SEARCH_DISABLED") throw error;
      const query = ctx.sessionQuery;
      await clearDisabledSearchIndex(query.config?.path, ids);
    }
    record.complete = true;
    await this.save(record);
    for (const id of ids) ctx.emit("api-session/removed", id);
  }
};
_init = __decoratorStart(_b);
__decorateElement(_init, 1, "deletePreview", _deletePreview_dec, ConversationDeletion);
__decorateElement(_init, 1, "delete", _delete_dec, ConversationDeletion);
__decoratorMetadata(_init, ConversationDeletion);
__publicField(ConversationDeletion, "inject", ["agents", "sessions", "sessionPersistence", "sessionQuery", "storageDomain", "workspaceRegistry", "typert", "remoteAccess"]);

// src/index.ts
var name2 = "ai-agent-engine";
var inject2 = ["loader", "agentPresets", "agents", "sessions", "sessionPersistence", "sessionProjections", "subagents", "skills"];
var Config2 = z3.object({
  engineering: z3.boolean().default(true),
  conversationManagement: z3.boolean().default(true).volatile(),
  maxMembers: z3.natural().min(1).default(8),
  rolesEnabled: z3.boolean().default(true).volatile(),
  rolesPath: z3.string().default("")
});
async function apply2(ctx, config) {
  ctx.plugin(ConversationDeletion, { enabled: () => config.conversationManagement.get() });
  if (!config.engineering) return;
  installSkills(ctx);
  const configuredTeam = [...ctx.loader.entries()].some((entry) => entry.options.name === "@deepseek-ai/dsh-experimental-agent-team" && !entry.disabled);
  if (!ctx.get("agentTeams") && !configuredTeam) ctx.plugin(TeamService, { maxMembers: config.maxMembers });
  const standard = await ctx.agentPresets.readDocument("standard");
  const plugins = load(standard.content, { schema: entryListSchema });
  const problem = entryListProblem(plugins);
  if (problem) throw new Error(`The Standard preset cannot be used as the engineering base: ${problem}`);
  const globalTeamTools = [...ctx.loader.entries()].some((entry) => entry.options.name === "@deepseek-ai/dsh-experimental-tool-agent-team" && !entry.disabled);
  ctx.plugin(engineering_exports, {
    teamTools: !globalTeamTools,
    rolesEnabled: () => config.rolesEnabled.get(),
    rolesPath: config.rolesPath
  });
  ctx.plugin(AgentPreset, {
    id: "ai-agent-engine",
    name: "AI Agent Engine",
    description: "\u6309\u9700\u7EC4\u961F\u7684\u5DE5\u7A0B\u534F\u4F5C\uFF1A\u9700\u6C42\u3001\u524D\u540E\u7AEF\u5B9E\u73B0\u4E0E\u5206\u5C42\u9A8C\u8BC1\u3002",
    plugins: [
      ...plugins
    ]
  });
}
export {
  Config2 as Config,
  apply2 as apply,
  inject2 as inject,
  name2 as name
};
