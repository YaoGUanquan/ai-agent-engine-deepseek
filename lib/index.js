var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __knownSymbol = (name3, symbol) => (symbol = Symbol[name3]) ? symbol : Symbol.for("Symbol." + name3);
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
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

// src/prompt-override.ts
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
var DEFAULT_PROMPT_OVERRIDE_RELATIVE, MAX_PROMPT_OVERRIDE_CHARS, PromptOverrideValidationError;
var init_prompt_override = __esm({
  "src/prompt-override.ts"() {
    "use strict";
    DEFAULT_PROMPT_OVERRIDE_RELATIVE = ["ai-agent-engine", "prompt-override.md"];
    MAX_PROMPT_OVERRIDE_CHARS = 64 * 1024;
    PromptOverrideValidationError = class extends Error {
      code = "ae-capability/invalid-prompt";
      constructor(message) {
        super(message);
        this.name = "PromptOverrideValidationError";
      }
    };
  }
});

// src/module-runtime.ts
function initialModuleStatuses() {
  return {
    engineering: { state: "waiting", reason: "services" },
    roles: { state: "waiting", reason: "services" },
    deletion: { state: "waiting", reason: "services" },
    capability: { state: "waiting", reason: "services" }
  };
}
function requireMethods(ctx, requirements) {
  for (const [service, methods] of Object.entries(requirements)) {
    let value;
    try {
      value = ctx[service];
    } catch {
      throw new UnsupportedInterface(service);
    }
    for (const method of methods) {
      if (typeof value?.[method] !== "function") throw new UnsupportedInterface(`${service}.${method}`);
    }
  }
}
function mountModule(ctx, id, services, requirements, statuses, setup) {
  ctx.inject(services, async (ready) => {
    ready.effect(() => () => {
      statuses[id] = { state: "waiting", reason: "services" };
    });
    const result = { completed: true };
    const scope = ready.plugin(async (child) => {
      requireMethods(child, requirements);
      result.completed = await setup(child) !== false;
    });
    try {
      await scope;
      if (result.completed) statuses[id] = { state: "ready" };
    } catch (error) {
      await scope.dispose();
      statuses[id] = statuses[id].reason === "storage" ? statuses[id] : {
        state: "unavailable",
        reason: error instanceof UnsupportedInterface ? "interface" : "initialization"
      };
      ready.logger.warn(
        "AI Agent Engine %s unavailable (%s): %s",
        id,
        statuses[id].reason,
        error instanceof Error ? error.message : "Unknown initialization error"
      );
    }
  });
}
var UnsupportedInterface;
var init_module_runtime = __esm({
  "src/module-runtime.ts"() {
    "use strict";
    UnsupportedInterface = class extends Error {
    };
  }
});

// src/role-catalog.ts
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
function validateRolesFile(raw) {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    throw new RoleOverlayValidationError("Role overlay root must be an object");
  }
  const document = raw;
  if (document.version !== 1) {
    throw new RoleOverlayValidationError(`Role overlay version is unsupported (${String(document.version)})`);
  }
  if (!Array.isArray(document.roles)) {
    throw new RoleOverlayValidationError("Role overlay roles must be an array");
  }
  const roles = [];
  const seen = /* @__PURE__ */ new Set();
  const problems = [];
  for (const [index, row] of document.roles.entries()) {
    const warnings = [];
    const entry = normalizeOverlayEntry(row, (message) => {
      warnings.push(message);
    });
    if (!entry) {
      problems.push(`roles[${index}]: ${warnings[0] ?? "invalid entry"}`);
      continue;
    }
    if (seen.has(entry.id)) {
      problems.push(`roles[${index}]: duplicate id ${entry.id}`);
      continue;
    }
    seen.add(entry.id);
    roles.push(entry);
  }
  if (problems.length > 0) {
    throw new RoleOverlayValidationError(`Role overlay rejected: ${problems.join("; ")}`);
  }
  return { version: 1, roles };
}
var BUILTIN_ROLES, ROLE_ID, RESERVED, RoleOverlayValidationError;
var init_role_catalog = __esm({
  "src/role-catalog.ts"() {
    "use strict";
    BUILTIN_ROLES = [
      { id: "requirements", skill: "ae-grill", responsibility: "Resolve decisions that materially affect acceptance." },
      { id: "frontend", skill: "ae-frontend", responsibility: "Implement accessible UI and all relevant interaction states." },
      { id: "backend", skill: "ae-backend", responsibility: "Implement compatible services, authorization and persistence." },
      { id: "unit-test", skill: "ae-unit-test", responsibility: "Exercise meaningful isolated behavior and regressions." },
      { id: "integration-test", skill: "ae-integration-test", responsibility: "Verify real cross-module contracts in isolation." },
      { id: "browser-test", skill: "ae-e2e-test", responsibility: "Verify requested user journeys with browser evidence." },
      { id: "e2e-engineer", skill: "ae-e2e-suite", responsibility: "Maintain suite infrastructure and CI when requested." }
    ];
    ROLE_ID = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
    RESERVED = /* @__PURE__ */ new Set(["lead"]);
    RoleOverlayValidationError = class extends Error {
      code = "ae-roles/invalid-overlay";
      constructor(message) {
        super(message);
        this.name = "RoleOverlayValidationError";
      }
    };
  }
});

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
async function readOverlayDocument(path, warn = () => void 0) {
  let text;
  try {
    text = await readFile(path, "utf8");
  } catch (error) {
    const code = error.code;
    if (code === "ENOENT") return void 0;
    warn("Failed to read role overlay at %s (%s)", path, code ?? "error");
    return void 0;
  }
  const roles = parseRolesFile(text, warn);
  if (!roles) return void 0;
  return { version: 1, roles };
}
async function writeRolesFile(path, raw) {
  const document = validateRolesFile(raw);
  const directory = dirname(path);
  await mkdir(directory, { recursive: true, mode: 448 });
  const temporary = `${path}.${process.pid}.${Date.now()}.tmp`;
  const payload = `${JSON.stringify({ version: 1, roles: document.roles }, null, 2)}
`;
  try {
    await writeFile(temporary, payload, { mode: 384, flag: "wx" });
    await rename(temporary, path);
  } catch (error) {
    try {
      await unlink(temporary);
    } catch {
    }
    throw error;
  }
  return document;
}
async function deleteRolesFile(path) {
  try {
    await unlink(path);
  } catch (error) {
    const code = error.code;
    if (code === "ENOENT") return;
    throw error;
  }
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
var init_role_catalog_io = __esm({
  "src/role-catalog-io.ts"() {
    "use strict";
    init_role_catalog();
  }
});

// src/roles-service.ts
var roles_service_exports = {};
__export(roles_service_exports, {
  RoleCatalogService: () => RoleCatalogService
});
import { Remote as Remote2, RemoteError as RemoteError2, TypertRemoteService as TypertRemoteService2 } from "@deepseek-ai/dsh-typert-protocol";
function reject(message, code = "ae-roles/rejected") {
  throw new RemoteError2(code, message, {});
}
var _restoreDefaults_dec, _putOverlay_dec, _getOverlay_dec, _getCatalog_dec, _a2, _init2, RoleCatalogService;
var init_roles_service = __esm({
  "src/roles-service.ts"() {
    "use strict";
    init_role_catalog();
    init_role_catalog_io();
    RoleCatalogService = class extends (_a2 = TypertRemoteService2, _getCatalog_dec = [Remote2("getCatalog")], _getOverlay_dec = [Remote2("getOverlay")], _putOverlay_dec = [Remote2("putOverlay")], _restoreDefaults_dec = [Remote2("restoreDefaults")], _a2) {
      constructor(ctx, config) {
        super(ctx, "aeRoles");
        this.config = config;
        __runInitializers(_init2, 5, this);
      }
      authorize() {
        if (this.ctx.invocation?.peer.principal.kind !== "owner") {
          reject("Only the Host owner can manage engineering roles");
        }
      }
      resolvePath() {
        const path = resolveRolesFilePath(this.config.rolesPath);
        if (!path) reject("Role overlay path is unavailable (set DSH_HOME or rolesPath)", "ae-roles/path-unavailable");
        return path;
      }
      warn(message, ...args) {
        this.ctx.logger.warn(message, ...args);
      }
      async emitUpdated() {
        this.ctx.emit("ai-agent-engine/roles-updated");
      }
      async getCatalog(_request = {}) {
        this.authorize();
        const enabled = this.config.enabled();
        const catalog = await resolveRoleCatalog({
          enabled,
          path: this.config.rolesPath,
          warn: (message, ...args) => this.warn(message, ...args)
        });
        return {
          roles: catalog.roles.map((role) => ({ ...role })),
          source: catalog.source,
          path: catalog.path,
          enabled
        };
      }
      async getOverlay(_request = {}) {
        this.authorize();
        const path = resolveRolesFilePath(this.config.rolesPath);
        if (!path) return { version: 1, roles: [], exists: false };
        const document = await readOverlayDocument(path, (message, ...args) => this.warn(message, ...args));
        if (!document) return { version: 1, roles: [], path, exists: false };
        return { version: 1, roles: document.roles.map((role) => ({ ...role })), path, exists: true };
      }
      async putOverlay(request) {
        this.authorize();
        const path = this.resolvePath();
        let written;
        try {
          written = await writeRolesFile(path, request);
        } catch (error) {
          if (error instanceof RoleOverlayValidationError) {
            reject(error.message, "ae-roles/invalid-overlay");
          }
          throw error;
        }
        const roles = mergeRoleCatalog(BUILTIN_ROLES, written.roles).map((role) => ({ ...role }));
        await this.emitUpdated();
        return {
          path,
          roles,
          source: "merged"
        };
      }
      async restoreDefaults(_request = {}) {
        this.authorize();
        const path = resolveRolesFilePath(this.config.rolesPath);
        if (path) await deleteRolesFile(path);
        await this.emitUpdated();
        return {
          restored: true,
          path,
          roles: BUILTIN_ROLES.map((role) => ({ ...role }))
        };
      }
    };
    _init2 = __decoratorStart(_a2);
    __decorateElement(_init2, 1, "getCatalog", _getCatalog_dec, RoleCatalogService);
    __decorateElement(_init2, 1, "getOverlay", _getOverlay_dec, RoleCatalogService);
    __decorateElement(_init2, 1, "putOverlay", _putOverlay_dec, RoleCatalogService);
    __decorateElement(_init2, 1, "restoreDefaults", _restoreDefaults_dec, RoleCatalogService);
    __decoratorMetadata(_init2, RoleCatalogService);
    __publicField(RoleCatalogService, "inject", ["typert"]);
  }
});

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
async function writePromptOverride(path, raw) {
  const text = validatePromptOverrideText(raw);
  const directory = dirname2(path);
  await mkdir2(directory, { recursive: true, mode: 448 });
  const temporary = `${path}.${process.pid}.${Date.now()}.tmp`;
  try {
    await writeFile2(temporary, text, { mode: 384, flag: "wx" });
    await rename2(temporary, path);
  } catch (error) {
    try {
      await unlink2(temporary);
    } catch {
    }
    throw error;
  }
  return text;
}
async function deletePromptOverride(path) {
  try {
    await unlink2(path);
  } catch (error) {
    const code = error.code;
    if (code === "ENOENT") return;
    throw error;
  }
}
var init_prompt_override_io = __esm({
  "src/prompt-override-io.ts"() {
    "use strict";
    init_prompt_override();
  }
});

// src/capability-service.ts
var capability_service_exports = {};
__export(capability_service_exports, {
  CapabilityPolicyService: () => CapabilityPolicyService
});
import { Remote as Remote3, RemoteError as RemoteError3, TypertRemoteService as TypertRemoteService3 } from "@deepseek-ai/dsh-typert-protocol";
import { readFile as readFile3 } from "node:fs/promises";
function reject2(message, code = "ae-capability/rejected") {
  throw new RemoteError3(code, message, {});
}
var _restoreOverride_dec, _putOverride_dec, _getOverride_dec, _getStatus_dec2, _a3, _init3, CapabilityPolicyService;
var init_capability_service = __esm({
  "src/capability-service.ts"() {
    "use strict";
    init_prompt_override_io();
    CapabilityPolicyService = class extends (_a3 = TypertRemoteService3, _getStatus_dec2 = [Remote3("getStatus")], _getOverride_dec = [Remote3("getOverride")], _putOverride_dec = [Remote3("putOverride")], _restoreOverride_dec = [Remote3("restoreOverride")], _a3) {
      constructor(ctx, config) {
        super(ctx, "aeCapability");
        this.config = config;
        __runInitializers(_init3, 5, this);
      }
      authorize() {
        if (this.ctx.invocation?.peer.principal.kind !== "owner") {
          reject2("Only the Host owner can manage capability / jailbreak settings");
        }
      }
      resolvePath() {
        const path = resolvePromptOverridePath(this.config.jailbreakPromptPath);
        if (!path) reject2("Prompt override path unavailable (set DSH_HOME or jailbreakPromptPath)", "ae-capability/path-unavailable");
        return path;
      }
      async emitUpdated() {
        this.ctx.emit("ai-agent-engine/capability-updated");
      }
      async getStatus(_request = {}) {
        this.authorize();
        const path = resolvePromptOverridePath(this.config.jailbreakPromptPath);
        let overrideExists = false;
        if (path) {
          try {
            await readFile3(path, "utf8");
            overrideExists = true;
          } catch {
            overrideExists = false;
          }
        }
        return {
          capabilityEnhanceEnabled: this.config.capabilityEnhanceEnabled(),
          jailbreakEnabled: this.config.jailbreakEnabled(),
          enhanceProfile: this.config.enhanceProfile,
          jailbreakPromptPath: path,
          overrideExists,
          overridePath: path
        };
      }
      async getOverride(_request = {}) {
        this.authorize();
        const path = resolvePromptOverridePath(this.config.jailbreakPromptPath);
        if (!path) return { text: "", exists: false };
        try {
          const text = await readFile3(path, "utf8");
          return { text, path, exists: true };
        } catch (error) {
          const code = error.code;
          if (code === "ENOENT") return { text: "", path, exists: false };
          this.ctx.logger.warn("Failed to read prompt override (%s)", code ?? "error");
          return { text: "", path, exists: false };
        }
      }
      async putOverride(request) {
        this.authorize();
        const path = this.resolvePath();
        try {
          const text = await writePromptOverride(path, request.text);
          await this.emitUpdated();
          return { path, bytes: Buffer.byteLength(text, "utf8") };
        } catch (error) {
          if (error instanceof PromptOverrideValidationError) {
            reject2(error.message, "ae-capability/invalid-prompt");
          }
          throw error;
        }
      }
      async restoreOverride(_request = {}) {
        this.authorize();
        const path = resolvePromptOverridePath(this.config.jailbreakPromptPath);
        if (path) await deletePromptOverride(path);
        await this.emitUpdated();
        return { restored: true, path };
      }
    };
    _init3 = __decoratorStart(_a3);
    __decorateElement(_init3, 1, "getStatus", _getStatus_dec2, CapabilityPolicyService);
    __decorateElement(_init3, 1, "getOverride", _getOverride_dec, CapabilityPolicyService);
    __decorateElement(_init3, 1, "putOverride", _putOverride_dec, CapabilityPolicyService);
    __decorateElement(_init3, 1, "restoreOverride", _restoreOverride_dec, CapabilityPolicyService);
    __decoratorMetadata(_init3, CapabilityPolicyService);
    __publicField(CapabilityPolicyService, "inject", ["typert"]);
  }
});

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
var init_runtime_method = __esm({
  "src/runtime-method.ts"() {
    "use strict";
  }
});

// src/disabled-search-index.ts
import { stat } from "node:fs/promises";
import { resolve } from "node:path";
async function validateSearchIndex(path) {
  if (!path || path === ":memory:") return;
  try {
    await stat(path);
  } catch (error) {
    if (error.code === "ENOENT") return;
    throw error;
  }
  const { DatabaseSync } = await import("node:sqlite");
  const db = new DatabaseSync(resolve(path), { readOnly: true });
  try {
    if (db.prepare("PRAGMA application_id").get()?.application_id !== 1146308689 || db.prepare("PRAGMA user_version").get()?.user_version !== 8) {
      throw new Error("The search index is not a recognized Harness index");
    }
    db.prepare("SELECT session_id FROM persisted_docs LIMIT 0").all();
    db.prepare("SELECT id FROM persisted_sessions LIMIT 0").all();
    db.prepare("SELECT global_generation FROM search_state WHERE singleton = 1").get();
  } finally {
    db.close();
  }
}
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
var init_disabled_search_index = __esm({
  "src/disabled-search-index.ts"() {
    "use strict";
  }
});

// src/conversation-deletion.ts
var conversation_deletion_exports = {};
__export(conversation_deletion_exports, {
  ConversationDeletion: () => ConversationDeletion,
  loadDeletionJournalFile: () => loadDeletionJournalFile,
  supportsConversationDeletionPersistence: () => supportsConversationDeletionPersistence
});
import { createHash, randomUUID } from "node:crypto";
import { mkdir as mkdir3, readFile as readFile4, readdir, realpath, rename as rename3, rm, writeFile as writeFile3 } from "node:fs/promises";
import { isAbsolute, join as join3, relative, resolve as resolve2, sep } from "node:path";
import { Service } from "@deepseek-ai/cordis";
import { Remote as Remote4, RemoteError as RemoteError4, TypertRemoteService as TypertRemoteService4 } from "@deepseek-ai/dsh-typert-protocol";
function reject3(message, code = "ae-conversations/delete-rejected") {
  throw new RemoteError4(code, message, {});
}
function encodeSegment(text) {
  if (text === "." || text === "..") return text.replaceAll(".", "~002E");
  return text.replace(/[^A-Za-z0-9._-]/g, (character) => `~${character.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0")}`);
}
function sessionDirectory(root, header) {
  const project = header.cwd === void 0 ? "_no-cwd" : `--${(encodeSegment(header.cwd.replace(/[\\/:]+/g, "-")).replace(/^-+/, "") || "root").slice(0, 251)}--`;
  return join3(root, project, encodeSegment(header.id));
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
  const path = join3(directory, filename);
  try {
    const record = JSON.parse(await readFile4(path, "utf8"));
    if (!isValidDeletionRecord(record, filename)) throw new Error("Invalid conversation deletion record");
    return record;
  } catch (error) {
    const quarantine = `${path}.corrupt`;
    try {
      await rename3(path, quarantine);
      log("Quarantined corrupt conversation deletion journal %s -> %s (%s)", filename, quarantine, error);
    } catch (renameError) {
      log("Failed to quarantine corrupt conversation deletion journal %s (%s); original error: %s", filename, renameError, error);
    }
    return void 0;
  }
}
var _delete_dec, _deletePreview_dec, _a4, _init4, _b, ConversationDeletion;
var init_conversation_deletion = __esm({
  "src/conversation-deletion.ts"() {
    "use strict";
    init_runtime_method();
    init_disabled_search_index();
    init_module_runtime();
    ConversationDeletion = class extends (_b = TypertRemoteService4) {
      constructor(ctx, config) {
        super(ctx, "aeConversations");
        this.config = config;
        __runInitializers(_init4, 5, this);
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
        this.ready = this.initialize();
      }
      async [(_a4 = Service.init, _deletePreview_dec = [Remote4("deletePreview")], _delete_dec = [Remote4("delete")], _a4)]() {
        await this.ready;
      }
      async initialize() {
        const ctx = this.ctx;
        const persistence = ctx.sessionPersistence;
        if (!supportsConversationDeletionPersistence(persistence)) {
          this.unsupported = true;
          this.config.onUnsupported?.();
          ctx.logger.warn("Conversation deletion disabled: storage backend is not session-persistence-jsonl with a configured root");
          return;
        }
        requireMethods(ctx, {
          agents: ["create", "resume", "get"],
          sessions: ["list", "get"],
          sessionPersistence: ["create", "open", "stat", "list"],
          sessionQuery: ["searchSessions"],
          storageDomain: ["get"],
          workspaceRegistry: ["list", "unarchiveSession", "unpinSession"],
          remoteAccess: ["allows"]
        });
        const { SESSION_FORMAT_VERSION } = await import("@deepseek-ai/dsh-session");
        if (SESSION_FORMAT_VERSION !== 4) {
          this.config.onUnsupported?.();
          throw new Error("Unsupported session storage format");
        }
        await this.validateStorage();
        this.root = resolve2(persistence.config.root);
        this.directory = join3(this.root, ".ai-agent-engine", "deletions");
        await mkdir3(this.directory, { recursive: true, mode: 448 });
        const remember = async (operation, id, parent) => {
          this.inflight.set(operation, { id, parent });
          try {
            const handle = await operation;
            if (this.blocked(handle.agent.id) || this.blocked(handle.agent.session.header.parentSession)) {
              await handle.dispose();
              reject3("This conversation is being deleted");
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
            if (owner.deleted.has(id) || access === "write" && owner.pending.has(id)) reject3("Conversation was deleted");
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
        if (this.blocked(id) || this.blocked(parent)) reject3("Conversation is being deleted or has been deleted");
      }
      authorize(ids) {
        const ctx = this.ctx;
        if (this.closing || !this.config.enabled()) reject3("Conversation management is disabled");
        if (ctx.invocation?.peer.principal.kind !== "owner") reject3("Only the Host owner can delete conversations");
        for (const id of ids) {
          if (!ctx.remoteAccess.allows({ kind: "session", id })) reject3("Conversation access denied");
        }
      }
      async collect(id) {
        const headers = new Map((await this.ctx.sessionPersistence.list()).map((row) => [row.header.id, row.header]));
        for (const session of this.ctx.sessions.list()) headers.set(session.id, session.header);
        const root = headers.get(id);
        if (!root || root.origin === "subagent") reject3("Select the owning conversation");
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
        if (this.unsupported) reject3("This storage backend is not supported by conversation deletion", "ae-conversations/delete-unsupported");
        if (!request || typeof request.sessionId !== "string" || !request.sessionId) reject3("Invalid conversation identity");
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
        if (this.unsupported) reject3("This storage backend is not supported by conversation deletion", "ae-conversations/delete-unsupported");
        const operation = this.performDeletion(request);
        this.active.add(operation);
        try {
          return await operation;
        } finally {
          this.active.delete(operation);
        }
      }
      async performDeletion(request) {
        if (!request || request.stopRunning !== true || !Array.isArray(request.sessionIds) || request.sessionIds.some((id) => typeof id !== "string")) reject3("Invalid deletion confirmation");
        this.authorize(request.sessionIds);
        await this.validateStorage();
        const record = this.previews.get(request.fingerprint);
        if (!record || record.rootId !== request.sessionId || JSON.stringify(record.headers.map((header) => header.id)) !== JSON.stringify(request.sessionIds)) {
          reject3("Preview the conversation again", "ae-conversations/delete-scope-changed");
        }
        if (this.operations.has(record.fingerprint) || request.sessionIds.some((id) => this.pending.has(id))) reject3("Deletion is already running");
        this.operations.add(record.fingerprint);
        for (const id of request.sessionIds) this.pending.add(id);
        const locks = [];
        try {
          const committed = request.sessionIds.every((id) => this.deleted.has(id));
          if (!committed) {
            if (fingerprint(await this.collect(request.sessionId)) !== record.fingerprint) reject3("Conversation family changed", "ae-conversations/delete-scope-changed");
            await Promise.allSettled([...this.inflight].filter(([, item]) => this.pending.has(item.id) || item.parent !== void 0 && this.pending.has(item.parent)).map(([operation]) => operation));
            for (const id of request.sessionIds) {
              const agent = this.ctx.agents.get(id);
              if (agent && this.handles.get(id)?.agent !== agent) {
                reject3("Restart Desktop once after enabling the plugin", "ae-conversations/delete-restart-required");
              }
              if (!agent && this.ctx.sessions.get(id)) reject3("Conversation is still in use");
            }
            for (const id of [...request.sessionIds].reverse()) {
              const agent = this.ctx.agents.get(id);
              if (agent) {
                const handle = this.handles.get(id);
                if (handle?.agent !== agent) reject3("Restart Desktop once after enabling the plugin", "ae-conversations/delete-restart-required");
                agent.cancel({ kind: "user" }, { keepInbox: false });
                await this.ctx.parallel("workspace/session-stop", { sessionId: id });
                await handle.dispose();
              }
              if (this.ctx.sessions.get(id)) reject3("Conversation is still in use");
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
        const target = join3(this.directory, `${record.fingerprint}.json`);
        const temporary = `${target}.${randomUUID()}.tmp`;
        await writeFile3(temporary, JSON.stringify(record), { mode: 384, flag: "wx" });
        await rename3(temporary, target);
      }
      async cleanup(record) {
        await this.validateStorage();
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
          if (!within || within === ".." || within.startsWith(`..${sep}`) || isAbsolute(within)) reject3("Unsafe conversation storage path");
          for (const entry of await readdir(directory, { withFileTypes: true })) {
            if (entry.name === "session.lock") continue;
            await rm(join3(directory, entry.name), { recursive: entry.isDirectory(), force: true });
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
      async validateStorage() {
        const query = this.ctx.sessionQuery;
        try {
          await validateSearchIndex(query.config?.path);
        } catch (error) {
          this.config.onUnsupported?.();
          throw error;
        }
        const cache = this.ctx.storageDomain.get("session_projcache")?.table("sessions");
        if (cache && (typeof cache.put !== "function" || typeof cache.delete !== "function")) {
          throw new Error("Unsupported session projection cache");
        }
        for (const workspace of this.ctx.workspaceRegistry.list()) {
          if (typeof workspace.detachSession !== "function") throw new Error("Unsupported workspace session interface");
        }
      }
    };
    _init4 = __decoratorStart(_b);
    __decorateElement(_init4, 1, "deletePreview", _deletePreview_dec, ConversationDeletion);
    __decorateElement(_init4, 1, "delete", _delete_dec, ConversationDeletion);
    __decoratorMetadata(_init4, ConversationDeletion);
    __publicField(ConversationDeletion, "inject", ["agents", "sessions", "sessionPersistence", "sessionQuery", "storageDomain", "workspaceRegistry", "typert", "remoteAccess"]);
  }
});

// src/capability-protocol.ts
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
var CAPABILITY_ENHANCE_SECTION, PROMPT_OVERRIDE_SECTION, ENHANCE_PROFILES;
var init_capability_protocol = __esm({
  "src/capability-protocol.ts"() {
    "use strict";
    CAPABILITY_ENHANCE_SECTION = "ai-agent-engine:capability-enhance";
    PROMPT_OVERRIDE_SECTION = "ai-agent-engine:prompt-override";
    ENHANCE_PROFILES = ["default"];
  }
});

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
var init_capability_policy = __esm({
  "src/capability-policy.ts"() {
    "use strict";
    init_capability_protocol();
    init_prompt_override();
    init_prompt_override_io();
  }
});

// src/engineering.ts
var engineering_exports = {};
__export(engineering_exports, {
  Config: () => Config,
  apply: () => apply,
  buildCapabilitySections: () => buildCapabilitySections,
  buildEngineeringPolicy: () => buildEngineeringPolicy,
  inject: () => inject,
  name: () => name
});
import z5 from "@deepseek-ai/schemastery";
import { readFile as readFile5 } from "node:fs/promises";
function flagOf(value, fallback = false) {
  if (typeof value === "function") return value();
  if (typeof value === "boolean") return value;
  return fallback;
}
function rolesEnabledOf(config) {
  return flagOf(config.rolesEnabled, true);
}
async function buildEngineeringPolicy(config, warn) {
  const template = await readFile5(new URL("../prompts/lead.md", import.meta.url), "utf8");
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
var name, inject, Config;
var init_engineering = __esm({
  "src/engineering.ts"() {
    "use strict";
    init_role_catalog();
    init_role_catalog_io();
    init_capability_protocol();
    init_capability_policy();
    name = "ai-agent-engine-engineering";
    inject = ["systemPrompt", "tools", "agents", "agentTeams", "agentPresets"];
    Config = z5.object({
      teamTools: z5.boolean().default(true),
      rolesEnabled: z5.any().default(true),
      rolesPath: z5.string().default(""),
      capabilityEnhanceEnabled: z5.any().default(false),
      jailbreakEnabled: z5.any().default(false),
      enhanceProfile: z5.string().default(""),
      jailbreakPromptPath: z5.string().default(""),
      jailbreakPrompt: z5.string().default("")
    });
  }
});

// src/skills.ts
var skills_exports = {};
__export(skills_exports, {
  installSkills: () => installSkills,
  skillNames: () => skillNames
});
import { readFile as readFile6 } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { BUNDLED_SKILL_RANK } from "@deepseek-ai/dsh-skill";
import { parse } from "yaml";
function installSkills(ctx) {
  const provider = "ai-agent-engine";
  const candidate = async (name3) => {
    const resourceBase = { kind: "directory", path: fileURLToPath(new URL(`../skills/${name3}/`, import.meta.url)) };
    const text = await readFile6(new URL(`../skills/${name3}/SKILL.md`, import.meta.url), "utf8");
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
      const text = await readFile6(new URL(`../skills/${selected.name}/SKILL.md`, import.meta.url), "utf8");
      return { ...selected, content: text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "") };
    }
  }));
}
var skillNames;
var init_skills = __esm({
  "src/skills.ts"() {
    "use strict";
    skillNames = [
      "ae-grill",
      "ae-frontend",
      "ae-backend",
      "ae-unit-test",
      "ae-integration-test",
      "ae-e2e-test",
      "ae-e2e-suite"
    ];
  }
});

// src/index.ts
import z6 from "@deepseek-ai/schemastery";

// src/deletion-rpc.ts
import { z } from "zod";
var namespace = "aeConversations";
var identity = z.string().min(1);
var previewRequest = z.strictObject({ sessionId: identity });
var preview = z.strictObject({
  sessionId: identity,
  sessionIds: z.array(identity).min(1),
  fingerprint: z.string().regex(/^[a-f0-9]{64}$/),
  runningSessionIds: z.array(identity)
});
var confirmation = preview.extend({ stopRunning: z.literal(true) });
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
    result: codec(method === "deletePreview" ? preview : z.array(identity), `${method}Result`)
  }))
};

// src/roles-rpc.ts
import { z as z2 } from "zod";
var namespace2 = "aeRoles";
var roleId = z2.string().regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/).refine((id) => id !== "lead");
var overlayEntry = z2.strictObject({
  id: roleId,
  skill: z2.string().min(1).optional(),
  responsibility: z2.string().optional()
});
var putRequest = z2.strictObject({
  version: z2.literal(1),
  roles: z2.array(overlayEntry)
});
var roleDefinition = z2.strictObject({
  id: z2.string().min(1),
  skill: z2.string().min(1).optional(),
  responsibility: z2.string().optional()
});
var catalogResult = z2.strictObject({
  roles: z2.array(roleDefinition),
  source: z2.union([z2.literal("builtin"), z2.literal("merged")]),
  path: z2.string().optional(),
  enabled: z2.boolean()
});
var overlayResult = z2.strictObject({
  version: z2.literal(1),
  roles: z2.array(overlayEntry),
  path: z2.string().optional(),
  exists: z2.boolean()
});
var putResult = z2.strictObject({
  path: z2.string().min(1),
  roles: z2.array(roleDefinition),
  source: z2.union([z2.literal("builtin"), z2.literal("merged")])
});
var restoreResult = z2.strictObject({
  restored: z2.literal(true),
  path: z2.string().optional(),
  roles: z2.array(roleDefinition)
});
function codec2(schema, name3) {
  return { mode: "strict", typeSymbol: `ai-agent-engine-deepseek#${name3}`, create: () => schema };
}
var emptyRequest = z2.strictObject({});
var rolesRpc = {
  package: "ai-agent-engine-deepseek",
  descriptors: [
    {
      method: "getCatalog",
      parameters: [{ name: "request", wire: "request", source: "json", codec: codec2(emptyRequest, "getCatalogRequest") }],
      result: codec2(catalogResult, "getCatalogResult")
    },
    {
      method: "getOverlay",
      parameters: [{ name: "request", wire: "request", source: "json", codec: codec2(emptyRequest, "getOverlayRequest") }],
      result: codec2(overlayResult, "getOverlayResult")
    },
    {
      method: "putOverlay",
      parameters: [{ name: "request", wire: "request", source: "json", codec: codec2(putRequest, "putOverlayRequest") }],
      result: codec2(putResult, "putOverlayResult")
    },
    {
      method: "restoreDefaults",
      parameters: [{ name: "request", wire: "request", source: "json", codec: codec2(emptyRequest, "restoreDefaultsRequest") }],
      result: codec2(restoreResult, "restoreDefaultsResult")
    }
  ].map((method) => ({
    id: `ai-agent-engine-deepseek#${namespace2}/${method.method}`,
    service: "aeRoles",
    namespace: namespace2,
    method: method.method,
    invocation: { kind: "direct" },
    parameters: method.parameters,
    result: method.result
  }))
};

// src/compatibility-rpc.ts
import { z as z3 } from "zod";
var status = z3.strictObject({
  state: z3.enum(["waiting", "ready", "unavailable"]),
  reason: z3.enum(["services", "interface", "initialization", "storage"]).optional()
});
var compatibilityRpc = {
  package: "ai-agent-engine-deepseek",
  descriptors: [{
    id: "ai-agent-engine-deepseek#aeCompatibility/getStatus",
    service: "aeCompatibility",
    namespace: "aeCompatibility",
    method: "getStatus",
    invocation: { kind: "direct" },
    parameters: [{
      name: "request",
      wire: "request",
      source: "json",
      codec: { mode: "strict", typeSymbol: "ai-agent-engine-deepseek#statusRequest", create: () => z3.strictObject({}) }
    }],
    result: {
      mode: "strict",
      typeSymbol: "ai-agent-engine-deepseek#statusResult",
      create: () => z3.strictObject({ engineering: status, roles: status, capability: status, deletion: status })
    }
  }]
};

// src/capability-rpc.ts
init_prompt_override();
import { z as z4 } from "zod";
var namespace3 = "aeCapability";
var emptyRequest2 = z4.strictObject({});
var putRequest2 = z4.strictObject({
  text: z4.string().max(MAX_PROMPT_OVERRIDE_CHARS)
});
var statusResult = z4.strictObject({
  capabilityEnhanceEnabled: z4.boolean(),
  jailbreakEnabled: z4.boolean(),
  enhanceProfile: z4.string(),
  jailbreakPromptPath: z4.string().optional(),
  overrideExists: z4.boolean(),
  overridePath: z4.string().optional()
});
var overrideResult = z4.strictObject({
  text: z4.string(),
  path: z4.string().optional(),
  exists: z4.boolean()
});
var putResult2 = z4.strictObject({
  path: z4.string().min(1),
  bytes: z4.number().int().nonnegative()
});
var restoreResult2 = z4.strictObject({
  restored: z4.literal(true),
  path: z4.string().optional()
});
function codec3(schema, name3) {
  return { mode: "strict", typeSymbol: `ai-agent-engine-deepseek#${name3}`, create: () => schema };
}
var capabilityRpc = {
  package: "ai-agent-engine-deepseek",
  descriptors: [
    {
      method: "getStatus",
      parameters: [{ name: "request", wire: "request", source: "json", codec: codec3(emptyRequest2, "capGetStatusRequest") }],
      result: codec3(statusResult, "capGetStatusResult")
    },
    {
      method: "getOverride",
      parameters: [{ name: "request", wire: "request", source: "json", codec: codec3(emptyRequest2, "capGetOverrideRequest") }],
      result: codec3(overrideResult, "capGetOverrideResult")
    },
    {
      method: "putOverride",
      parameters: [{ name: "request", wire: "request", source: "json", codec: codec3(putRequest2, "capPutOverrideRequest") }],
      result: codec3(putResult2, "capPutOverrideResult")
    },
    {
      method: "restoreOverride",
      parameters: [{ name: "request", wire: "request", source: "json", codec: codec3(emptyRequest2, "capRestoreOverrideRequest") }],
      result: codec3(restoreResult2, "capRestoreOverrideResult")
    }
  ].map((method) => ({
    id: `ai-agent-engine-deepseek#${namespace3}/${method.method}`,
    service: "aeCapability",
    namespace: namespace3,
    method: method.method,
    invocation: { kind: "direct" },
    parameters: method.parameters,
    result: method.result
  }))
};

// src/rpc.ts
var pluginRpc = {
  package: deletionRpc.package,
  descriptors: [
    ...deletionRpc.descriptors,
    ...rolesRpc.descriptors,
    ...compatibilityRpc.descriptors,
    ...capabilityRpc.descriptors
  ]
};

// src/compatibility-service.ts
import { Remote, RemoteError, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
var _getStatus_dec, _a, _init;
var CompatibilityService = class extends (_a = TypertRemoteService, _getStatus_dec = [Remote("getStatus")], _a) {
  constructor(ctx, config) {
    super(ctx, "aeCompatibility");
    this.config = config;
    __runInitializers(_init, 5, this);
  }
  async getStatus(_request = {}) {
    if (this.ctx.invocation?.peer.principal.kind !== "owner") {
      throw new RemoteError("ae-compatibility/rejected", "Only the Host owner can inspect module status", {});
    }
    return structuredClone(this.config.statuses);
  }
};
_init = __decoratorStart(_a);
__decorateElement(_init, 1, "getStatus", _getStatus_dec, CompatibilityService);
__decoratorMetadata(_init, CompatibilityService);
__publicField(CompatibilityService, "inject", ["typert"]);

// src/index.ts
init_module_runtime();
var name2 = "ai-agent-engine";
var inject2 = ["typert"];
var Config2 = z6.object({
  engineering: z6.boolean().default(true),
  conversationManagement: z6.boolean().default(true).volatile(),
  maxMembers: z6.natural().min(1).default(8),
  rolesEnabled: z6.boolean().default(true).volatile(),
  rolesPath: z6.string().default(""),
  capabilityEnhanceEnabled: z6.boolean().default(false).volatile(),
  jailbreakEnabled: z6.boolean().default(false).volatile(),
  enhanceProfile: z6.string().default(""),
  jailbreakPromptPath: z6.string().default(""),
  jailbreakPrompt: z6.string().default("")
});
async function apply2(ctx, config) {
  ctx.typert.register({
    package: pluginRpc.package,
    face: "host",
    schemas: [],
    model: { services: [], events: [], objects: [] },
    invocations: pluginRpc.descriptors
  });
  const statuses = initialModuleStatuses();
  await ctx.plugin(CompatibilityService, { statuses });
  mountModule(ctx, "roles", ["typert"], {}, statuses, async (scope) => {
    const { RoleCatalogService: RoleCatalogService2 } = await Promise.resolve().then(() => (init_roles_service(), roles_service_exports));
    await scope.plugin(RoleCatalogService2, {
      enabled: () => config.rolesEnabled.get(),
      rolesPath: config.rolesPath
    });
  });
  mountModule(ctx, "capability", ["typert"], {}, statuses, async (scope) => {
    const { CapabilityPolicyService: CapabilityPolicyService2 } = await Promise.resolve().then(() => (init_capability_service(), capability_service_exports));
    await scope.plugin(CapabilityPolicyService2, {
      capabilityEnhanceEnabled: () => config.capabilityEnhanceEnabled.get(),
      jailbreakEnabled: () => config.jailbreakEnabled.get(),
      jailbreakPromptPath: config.jailbreakPromptPath,
      enhanceProfile: config.enhanceProfile
    });
  });
  mountModule(ctx, "deletion", [
    "agents",
    "sessions",
    "sessionPersistence",
    "sessionQuery",
    "storageDomain",
    "workspaceRegistry",
    "typert",
    "remoteAccess"
  ], {}, statuses, async (scope) => {
    const { ConversationDeletion: ConversationDeletion2 } = await Promise.resolve().then(() => (init_conversation_deletion(), conversation_deletion_exports));
    await scope.plugin(ConversationDeletion2, {
      enabled: () => config.conversationManagement.get(),
      onUnsupported: () => {
        statuses.deletion = { state: "unavailable", reason: "storage" };
      }
    });
    if (statuses.deletion.state === "unavailable") throw new Error("Unsupported deletion storage");
  });
  if (!config.engineering) {
    statuses.engineering = { state: "unavailable" };
    return;
  }
  mountModule(ctx, "engineering", [
    "loader",
    "agentPresets",
    "agents",
    "sessions",
    "sessionPersistence",
    "sessionProjections",
    "subagents",
    "skills",
    "typert",
    "systemPrompt",
    "tools"
  ], {
    loader: ["entries"],
    agentPresets: ["readDocument", "composedPreset"],
    agents: ["list", "get"],
    skills: ["registerProvider"],
    systemPrompt: ["section"],
    tools: ["register"]
  }, statuses, (scope) => installEngineering(scope, config, statuses));
}
async function installEngineering(ctx, config, statuses) {
  const [
    { default: AgentPreset },
    { default: TeamService },
    engineering,
    { installSkills: installSkills2 },
    { entryListProblem },
    { entryListSchema },
    { load }
  ] = await Promise.all([
    import("@deepseek-ai/dsh-agent-preset"),
    import("@deepseek-ai/dsh-experimental-agent-team"),
    Promise.resolve().then(() => (init_engineering(), engineering_exports)),
    Promise.resolve().then(() => (init_skills(), skills_exports)),
    import("@deepseek-ai/dsh-agent-preset-registry"),
    import("@deepseek-ai/cordis-plugin-include"),
    import("js-yaml")
  ]);
  installSkills2(ctx);
  const configuredTeam = [...ctx.loader.entries()].some((entry) => entry.options.name === "@deepseek-ai/dsh-experimental-agent-team" && !entry.disabled);
  if (!ctx.get("agentTeams") && !configuredTeam) await ctx.plugin(TeamService, { maxMembers: config.maxMembers });
  const standard = await ctx.agentPresets.readDocument("standard");
  const plugins = load(standard.content, { schema: entryListSchema });
  const problem = entryListProblem(plugins);
  if (problem) throw new Error(`The Standard preset cannot be used as the engineering base: ${problem}`);
  const globalTeamTools = [...ctx.loader.entries()].some((entry) => entry.options.name === "@deepseek-ai/dsh-experimental-tool-agent-team" && !entry.disabled);
  mountModule(ctx, "engineering", ["agentTeams"], {
    agentTeams: ["spawnTeammate", "sendMessage", "listMembers", "listTasks", "createTask", "updateTask", "waitForChange", "interrupt"]
  }, statuses, async (ready) => {
    await ready.plugin(engineering, {
      teamTools: !globalTeamTools,
      rolesEnabled: () => config.rolesEnabled.get(),
      rolesPath: config.rolesPath,
      capabilityEnhanceEnabled: () => config.capabilityEnhanceEnabled.get(),
      jailbreakEnabled: () => config.jailbreakEnabled.get(),
      enhanceProfile: config.enhanceProfile,
      jailbreakPromptPath: config.jailbreakPromptPath,
      jailbreakPrompt: config.jailbreakPrompt
    });
    await ready.plugin(AgentPreset, {
      id: "ai-agent-engine",
      name: "AI Agent Engine",
      description: "\u6309\u9700\u7EC4\u961F\u7684\u5DE5\u7A0B\u534F\u4F5C\uFF1A\u9700\u6C42\u3001\u524D\u540E\u7AEF\u5B9E\u73B0\u4E0E\u5206\u5C42\u9A8C\u8BC1\u3002",
      plugins: [...plugins]
    });
  });
  return false;
}
export {
  Config2 as Config,
  apply2 as apply,
  inject2 as inject,
  name2 as name
};
