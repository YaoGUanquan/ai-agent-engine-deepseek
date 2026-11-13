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

// src/module-runtime.ts
function initialModuleStatuses() {
  return {
    engineering: { state: "waiting", reason: "services" },
    roles: { state: "waiting", reason: "services" },
    deletion: { state: "waiting", reason: "services" },
    update: { state: "waiting", reason: "services" }
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
    const result2 = { completed: true };
    const scope = ready.plugin(async (child) => {
      requireMethods(child, requirements);
      result2.completed = await setup(child) !== false;
    });
    try {
      await scope;
      if (result2.completed) statuses[id] = { state: "ready" };
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

// src/update-sources.ts
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { createGunzip } from "node:zlib";
function parseVersion(input) {
  const match = VERSION.exec(String(input ?? "").trim());
  if (!match) return void 0;
  const prerelease = match[4] === void 0 ? [] : match[4].split(".").map((part) => /^\d+$/.test(part) ? Number(part) : part);
  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]), prerelease };
}
function comparePrerelease(left, right) {
  if (left.length === 0 && right.length === 0) return 0;
  if (left.length === 0) return 1;
  if (right.length === 0) return -1;
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    const a = left[index];
    const b = right[index];
    if (a === void 0) return -1;
    if (b === void 0) return 1;
    if (a === b) continue;
    const aNumeric = typeof a === "number";
    const bNumeric = typeof b === "number";
    if (aNumeric && bNumeric) return a > b ? 1 : -1;
    if (aNumeric) return -1;
    if (bNumeric) return 1;
    return String(a) > String(b) ? 1 : -1;
  }
  return 0;
}
function compareVersions(left, right) {
  const a = parseVersion(left);
  const b = parseVersion(right);
  if (a === void 0 || b === void 0) return 0;
  if (a.major !== b.major) return a.major > b.major ? 1 : -1;
  if (a.minor !== b.minor) return a.minor > b.minor ? 1 : -1;
  if (a.patch !== b.patch) return a.patch > b.patch ? 1 : -1;
  return comparePrerelease(a.prerelease, b.prerelease);
}
function releaseVersionOf(tag) {
  return String(tag ?? "").trim().replace(/^v/i, "");
}
function text(value) {
  return typeof value === "string" && value.trim() !== "" ? value : void 0;
}
function assetUrlOf(asset) {
  return text(asset.browser_download_url) ?? text(asset.url);
}
function releaseAssetName(pluginName, version) {
  return `${pluginName.replace(/^@/, "").replace(/\//g, "-")}-${version}.tgz`;
}
function normalizeRelease(payload, pluginName = "ai-agent-engine-deepseek") {
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
    throw new UpdateSourceError("invalid-feed", "The update feed did not return a release object.");
  }
  const record = payload;
  const tag = text(record.tag_name) ?? (text(record.version) === void 0 ? void 0 : `v${text(record.version)}`);
  if (tag === void 0) {
    throw new UpdateSourceError("invalid-feed", "The update feed entry has no tag_name or version.");
  }
  const version = releaseVersionOf(tag);
  if (parseVersion(version) === void 0) {
    throw new UpdateSourceError("invalid-feed", `The update feed version "${version}" is not a semantic version.`);
  }
  const assets = Array.isArray(record.assets) ? record.assets.filter((asset) => asset !== null && typeof asset === "object") : [];
  const expectedName = releaseAssetName(pluginName, version);
  const tarball = assets.map((asset) => asset).find((asset) => text(asset.name) === expectedName && assetUrlOf(asset) !== void 0);
  const checksum = assets.map((asset) => asset).find((asset) => text(asset.name) === "SHA256SUMS.txt" && assetUrlOf(asset) !== void 0);
  const notes = text(record.body) ?? text(record.notes);
  return {
    version,
    tag,
    ...notes === void 0 ? {} : { notes: notes.length > 4e3 ? `${notes.slice(0, 4e3)}\u2026` : notes },
    ...text(record.html_url) === void 0 ? {} : { pageUrl: text(record.html_url) },
    ...tarball === void 0 ? {} : {
      assetUrl: assetUrlOf(tarball),
      assetName: text(tarball.name)
    },
    ...checksum === void 0 ? {} : { checksumUrl: assetUrlOf(checksum) },
    ...text(record.published_at) === void 0 ? {} : { publishedAt: text(record.published_at) }
  };
}
async function readFeed(feed, options) {
  if (feed.startsWith("file:")) {
    try {
      return await readFile(new URL(feed), "utf8");
    } catch (error) {
      throw new UpdateSourceError("network", `The update feed could not be read: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  const call = options.fetchImpl ?? fetch;
  let response;
  try {
    response = await call(feed, {
      headers: { accept: "application/vnd.github+json", "user-agent": options.userAgent ?? "ai-agent-engine-deepseek" },
      signal: AbortSignal.timeout(options.timeoutMs ?? 15e3)
    });
  } catch (error) {
    throw new UpdateSourceError("network", `The update feed is unreachable: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (!response.ok) {
    throw new UpdateSourceError("network", `The update feed answered HTTP ${response.status}.`);
  }
  return await response.text();
}
async function fetchLatestRelease(options = {}) {
  const feed = options.feed?.trim() || DEFAULT_FEED;
  const document = await readFeed(feed, options);
  let payload;
  try {
    payload = JSON.parse(document);
  } catch {
    throw new UpdateSourceError("invalid-feed", "The update feed did not return JSON.");
  }
  return normalizeRelease(payload, options.pluginName);
}
function parseChecksum(document, fileName) {
  const matches = [];
  for (const line of String(document ?? "").split(/\r?\n/)) {
    const match = /^([a-fA-F0-9]{64})\s+\*?(.+?)\s*$/.exec(line.trim());
    if (match !== null && match[2] === fileName) matches.push(match[1].toLowerCase());
  }
  return matches.length === 1 ? matches[0] : void 0;
}
async function readPackageIdentity(path) {
  const input = createReadStream(path);
  const archive = input.pipe(createGunzip());
  input.on("error", (error) => archive.destroy(error));
  let buffer = Buffer.alloc(0);
  let remaining = 0;
  let size = 0;
  let entryPath = "";
  let kind = "";
  let pieces = [];
  let manifest;
  let nextPath;
  let nextSize;
  let ended = false;
  let total = 0;
  const invalid = () => {
    throw new Error("The release tarball has an invalid or ambiguous package manifest.");
  };
  const field = (header, start, length) => header.subarray(start, start + length).toString("utf8").replace(/\0.*$/s, "");
  const octal = (value) => /^[0-7]+$/.test(value.trim()) ? Number.parseInt(value.trim(), 8) : invalid();
  try {
    for await (const chunk of archive) {
      total += chunk.length;
      if (total > 256 * 1024 * 1024) invalid();
      buffer = Buffer.concat([buffer, chunk]);
      while (buffer.length > 0) {
        if (ended) {
          if (buffer.some((byte) => byte !== 0)) invalid();
          buffer = Buffer.alloc(0);
          break;
        }
        if (remaining === 0) {
          if (buffer.length < 512) break;
          const header = buffer.subarray(0, 512);
          buffer = buffer.subarray(512);
          if (header.every((byte) => byte === 0)) {
            ended = true;
            continue;
          }
          const checksum = octal(field(header, 148, 8));
          let sum = 0;
          for (let index = 0; index < 512; index += 1) sum += index >= 148 && index < 156 ? 32 : header[index];
          if (sum !== checksum) invalid();
          kind = field(header, 156, 1);
          if (kind === "g" || kind === "K") invalid();
          const name3 = field(header, 0, 100);
          const prefix = field(header, 345, 155);
          entryPath = nextPath ?? (prefix ? `${prefix}/${name3}` : name3);
          const segments = entryPath.replace(/\/$/, "").split("/");
          if (entryPath.includes("\\") || segments.some((part) => part === "" || part === "." || part === ".." || part.endsWith(".") || part.trim() !== part || part.includes(":")) || kind === "1" || kind === "2" || kind !== "x" && kind !== "L" && segments[0] !== "package" || (kind === "" || kind === "0") && entryPath.endsWith("/") || entryPath.toLowerCase() === "package/package.json" && entryPath !== "package/package.json") invalid();
          size = nextSize ?? octal(field(header, 124, 12));
          nextPath = void 0;
          nextSize = void 0;
          if (!Number.isSafeInteger(size) || size < 0) invalid();
          if ((entryPath === "package/package.json" || kind === "x" || kind === "L") && size > 1024 * 1024) invalid();
          remaining = Math.ceil(size / 512) * 512;
          pieces = [];
          if (remaining === 0) continue;
        }
        const take = Math.min(buffer.length, remaining);
        const consumed = Math.ceil(size / 512) * 512 - remaining;
        if (entryPath === "package/package.json" || kind === "x" || kind === "L") {
          const contentBytes = Math.min(take, Math.max(0, size - consumed));
          if (contentBytes > 0) pieces.push(Buffer.from(buffer.subarray(0, contentBytes)));
        }
        buffer = buffer.subarray(take);
        remaining -= take;
        if (remaining !== 0) continue;
        const content = Buffer.concat(pieces);
        if (kind === "L") {
          nextPath = content.toString("utf8").replace(/\0.*$/s, "");
        } else if (kind === "x") {
          for (let offset = 0; offset < content.length; ) {
            const space = content.indexOf(32, offset);
            if (space < 0) invalid();
            const lengthText = content.subarray(offset, space).toString("ascii");
            const length = /^\d+$/.test(lengthText) ? Number(lengthText) : 0;
            if (length <= space - offset + 1 || offset + length > content.length || content[offset + length - 1] !== 10) invalid();
            const record = content.subarray(space + 1, offset + length - 1).toString("utf8");
            const equals = record.indexOf("=");
            const key = record.slice(0, equals);
            const value = record.slice(equals + 1);
            if (key === "path") nextPath = value;
            if (key === "size") {
              if (!/^\d+$/.test(value)) invalid();
              nextSize = Number(value);
            }
            offset += length;
          }
        } else if (entryPath === "package/package.json") {
          if (kind !== "" && kind !== "0" || manifest !== void 0) invalid();
          const value = JSON.parse(content.toString("utf8"));
          if (value === null || typeof value !== "object" || Array.isArray(value)) invalid();
          const record = value;
          if (typeof record.name !== "string" || typeof record.version !== "string") invalid();
          manifest = { name: record.name, version: record.version };
        }
      }
    }
    if (!ended || remaining !== 0 || manifest === void 0) return invalid();
    return manifest;
  } finally {
    input.destroy();
    archive.destroy();
  }
}
async function sha256File(path) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest("hex");
}
var DEFAULT_FEED, VERSION, UpdateSourceError;
var init_update_sources = __esm({
  "src/update-sources.ts"() {
    "use strict";
    DEFAULT_FEED = "https://api.github.com/repos/YaoGUanquan/ai-agent-engine-deepseek/releases/latest";
    VERSION = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/;
    UpdateSourceError = class extends Error {
      constructor(problem, message) {
        super(message);
        this.problem = problem;
        this.name = "UpdateSourceError";
      }
    };
  }
});

// src/update-service.ts
var update_service_exports = {};
__export(update_service_exports, {
  UpdateService: () => UpdateService
});
import { Remote as Remote2, RemoteError as RemoteError2, TypertRemoteService as TypertRemoteService2 } from "@deepseek-ai/dsh-typert-protocol";
import { execFile } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { mkdir, readFile as readFile2, realpath, rename, rm, unlink, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
function installResultOf(value) {
  if (value === null || typeof value !== "object") throw new Blocked("install-failed", "The Host returned no installation outcome.");
  const record = value;
  if (typeof record.changed !== "boolean" || typeof record.application !== "string" || !["applied", "restart-required", "overridden", "failed", "cancelled"].includes(record.application)) {
    throw new Blocked("install-failed", "The Host returned an invalid installation outcome.");
  }
  const error = record.error;
  const result2 = record.packageResult;
  const strings = (items) => Array.isArray(items) ? items.filter((item) => typeof item === "string") : void 0;
  return {
    changed: record.changed,
    application: record.application,
    ...error !== null && typeof error === "object" && typeof error.code === "string" ? {
      error: { code: error.code, ...typeof error.diagnostic === "string" ? { diagnostic: error.diagnostic } : {} }
    } : {},
    ...result2 !== null && typeof result2 === "object" && typeof result2.exitCode === "number" && typeof result2.output === "string" && typeof result2.truncated === "boolean" && typeof result2.logPath === "string" ? {
      packageResult: {
        exitCode: result2.exitCode,
        output: result2.output,
        truncated: result2.truncated,
        logPath: result2.logPath,
        ...typeof result2.kind === "string" ? { kind: result2.kind } : {},
        ...typeof result2.timedOut === "boolean" ? { timedOut: result2.timedOut } : {}
      }
    } : {},
    ...strings(record.warnings) === void 0 ? {} : { warnings: strings(record.warnings) },
    ...strings(record.pendingBuilds) === void 0 ? {} : { pendingBuilds: strings(record.pendingBuilds) }
  };
}
function messageOf(error) {
  return error instanceof Error ? error.message : String(error);
}
function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return void 0;
  }
}
function isDirectory(target) {
  try {
    return existsSync(target) && statSync(target).isDirectory();
  } catch {
    return false;
  }
}
function executable(command) {
  return process.platform === "win32" ? `${command}.cmd` : command;
}
var Blocked, DOWNLOAD_TIMEOUT_MS, GIT_TIMEOUT_MS, PACKAGE_TIMEOUT_MS, _apply_dec, _check_dec, _getState_dec, _a2, _init2, UpdateService;
var init_update_service = __esm({
  "src/update-service.ts"() {
    "use strict";
    init_update_sources();
    Blocked = class extends Error {
      constructor(blocked, message) {
        super(message);
        this.blocked = blocked;
        this.name = "Blocked";
      }
    };
    DOWNLOAD_TIMEOUT_MS = 12e4;
    GIT_TIMEOUT_MS = 18e4;
    PACKAGE_TIMEOUT_MS = 6e5;
    UpdateService = class extends (_a2 = TypertRemoteService2, _getState_dec = [Remote2("getState")], _check_dec = [Remote2("check")], _apply_dec = [Remote2("apply")], _a2) {
      constructor(ctx, config) {
        super(ctx, "aeUpdate");
        this.config = config;
        __runInitializers(_init2, 5, this);
        __publicField(this, "root");
        __publicField(this, "phase", "idle");
        __publicField(this, "message");
        __publicField(this, "error");
        __publicField(this, "latest");
        __publicField(this, "checkedAt");
        __publicField(this, "pendingCommits", 0);
        __publicField(this, "restartRequired", false);
        __publicField(this, "blocked");
        __publicField(this, "busy", false);
        __publicField(this, "installResult");
        __publicField(this, "pendingCheckout");
        __publicField(this, "pendingDirectory");
        __publicField(this, "pendingLoaded", false);
        __publicField(this, "pendingLoad");
        this.root = config.root ?? dirname(dirname(fileURLToPath(import.meta.url)));
      }
      authorize() {
        if (this.ctx.invocation?.peer.principal.kind !== "owner") {
          throw new RemoteError2("ae-update/rejected", "Only the Host owner can update this plugin", {});
        }
      }
      service(name3) {
        try {
          return this.ctx.get(name3);
        } catch {
          return void 0;
        }
      }
      profile() {
        return this.service("profileContext") ?? {};
      }
      manifestDir() {
        const resolved = this.service("pluginPackages")?.packageOf(this.config.pluginName, import.meta.url);
        return typeof resolved?.dir === "string" ? resolved.dir : this.root;
      }
      manifest() {
        return readJson(join(this.manifestDir(), "package.json")) ?? {};
      }
      currentVersion() {
        return this.manifest().version ?? "0.0.0";
      }
      /** Version of the running Harness runtime, read without importing Host packages. */
      runtimeVersion() {
        const published = this.service("pluginPackages")?.packageOf("@deepseek-ai/dsh-app-boot", import.meta.url)?.version;
        if (typeof published === "string" && parseVersion(published) !== void 0) return published;
        const anchor = this.profile().installAnchor;
        if (typeof anchor === "string") {
          const candidate = join(dirname(anchor), "node_modules", "@deepseek-ai", "dsh-app-boot", "package.json");
          const version = readJson(candidate)?.version;
          if (typeof version === "string" && parseVersion(version) !== void 0) return version;
        }
        return void 0;
      }
      runtimeSupport() {
        const runtime = this.runtimeVersion();
        const compatibility = this.manifest().dsh?.compatibility;
        const verified = compatibility?.verifiedThrough;
        if (runtime === void 0 || verified === void 0) return "unknown";
        if (Array.isArray(compatibility?.verifiedRuntimes) && compatibility.verifiedRuntimes.some((version) => typeof version === "string" && parseVersion(version) !== void 0 && compareVersions(runtime, version) === 0)) return "verified";
        const order = compareVersions(runtime, verified);
        if (order === 0) return "verified";
        return order > 0 ? "untested-newer" : "untested-older";
      }
      /** The saved profile dependency value for this plugin, shown as the install origin. */
      installSpec() {
        const directory = this.profile().dir;
        if (typeof directory !== "string") return void 0;
        const manifest = readJson(join(directory, "package.json"));
        const spec = manifest?.dependencies?.[this.config.pluginName];
        return typeof spec === "string" ? spec : void 0;
      }
      channel() {
        return existsSync(join(this.checkoutRoot(), ".git")) ? "checkout" : "package";
      }
      checkoutRoot() {
        const spec = this.installSpec();
        if (spec !== void 0 && /^link:/i.test(spec)) {
          const profileDir = this.profile().dir;
          const path = spec.replace(/^link:/i, "");
          const expanded = path === "~" ? homedir() : /^~[\\/]/.test(path) ? join(homedir(), path.slice(2)) : path;
          const target = profileDir === void 0 ? void 0 : resolve(profileDir, expanded);
          if (target !== void 0 && isDirectory(target)) return target;
        }
        return this.manifestDir();
      }
      assertCheckoutIdentity(root) {
        const manifest = readJson(join(root, "package.json"));
        if (manifest?.name !== this.config.pluginName) {
          throw new Blocked("package-identity-mismatch", `The linked checkout is not ${this.config.pluginName}; no Git update was performed.`);
        }
      }
      cacheRoot() {
        const home = this.profile().home ?? process.env.DSH_HOME ?? join(homedir(), ".dsh");
        return join(home, "cache", "ai-agent-engine", "updates");
      }
      outdated() {
        return this.latest !== void 0 && compareVersions(this.latest.version, this.currentVersion()) > 0 || this.pendingCommits > 0 || this.pendingCheckout !== void 0;
      }
      view() {
        const manifest = this.manifest();
        const runtimeVersion = this.runtimeVersion();
        const verifiedThrough = manifest.dsh?.compatibility?.verifiedThrough;
        const installSpec = this.installSpec();
        const settled = !["checking", "downloading", "installing", "rebuilding", "applied"].includes(this.phase);
        const outdated = this.outdated();
        const retryable = this.blocked === void 0 || ["install-failed", "install-cancelled", "build-failed", "activation-failed"].includes(this.blocked);
        return {
          pluginName: this.config.pluginName,
          currentVersion: manifest.version ?? "0.0.0",
          ...runtimeVersion === void 0 ? {} : { runtimeVersion },
          ...verifiedThrough === void 0 ? {} : { verifiedThrough },
          runtimeSupport: this.runtimeSupport(),
          channel: this.channel(),
          ...installSpec === void 0 ? {} : { installSpec },
          ...this.latest === void 0 ? {} : { latest: { ...this.latest } },
          ...this.pendingCommits === 0 ? {} : { pendingCommits: this.pendingCommits },
          ...this.pendingCheckout === void 0 ? {} : { pendingCheckout: { target: this.pendingCheckout.target, stage: this.pendingCheckout.stage } },
          ...this.installResult === void 0 ? {} : { installResult: this.installResult },
          outdated,
          canApply: outdated && retryable && !this.busy && !this.restartRequired && settled,
          ...this.blocked === void 0 ? {} : { blocked: this.blocked },
          phase: this.phase,
          ...this.message === void 0 ? {} : { message: this.message },
          ...this.error === void 0 ? {} : { error: this.error },
          restartRequired: this.restartRequired,
          ...this.checkedAt === void 0 ? {} : { checkedAt: this.checkedAt }
        };
      }
      async getState(_request = {}) {
        this.authorize();
        try {
          await this.loadPendingCheckout();
        } catch (error) {
          this.phase = "failed";
          this.blocked = error instanceof Blocked ? error.blocked : "checkout-changed";
          this.error = messageOf(error);
        }
        return this.view();
      }
      async check(_request = {}) {
        this.authorize();
        if (this.busy || this.restartRequired) return this.view();
        this.busy = true;
        this.phase = "checking";
        this.message = void 0;
        this.error = void 0;
        this.blocked = void 0;
        this.pendingCommits = 0;
        this.latest = void 0;
        try {
          await this.loadPendingCheckout();
          if (this.channel() === "checkout") await this.checkCheckout();
          else await this.fetchRelease();
          this.checkedAt = Date.now();
          this.phase = "idle";
          if (!this.outdated()) this.blocked = "no-update";
        } catch (error) {
          this.phase = "failed";
          this.blocked = error instanceof Blocked ? error.blocked : void 0;
          this.error = messageOf(error);
        } finally {
          this.busy = false;
        }
        return this.view();
      }
      async apply(_request = {}) {
        this.authorize();
        if (this.busy) return { ...this.view(), blocked: "busy", canApply: false };
        if (this.restartRequired || this.phase === "applied") return this.view();
        this.busy = true;
        let started = false;
        try {
          await this.loadPendingCheckout();
          if (!this.outdated()) {
            this.blocked = "no-update";
            return this.view();
          }
          const channel = this.channel();
          this.blocked = void 0;
          this.error = void 0;
          this.message = void 0;
          this.installResult = void 0;
          this.restartRequired = false;
          this.phase = channel === "checkout" ? "rebuilding" : "downloading";
          started = true;
          void this.run(channel).finally(() => {
            this.busy = false;
          });
          return this.view();
        } catch (error) {
          this.phase = "failed";
          this.blocked = error instanceof Blocked ? error.blocked : "checkout-changed";
          this.error = messageOf(error);
          return this.view();
        } finally {
          if (!started) this.busy = false;
        }
      }
      async fetchRelease() {
        try {
          this.latest = await fetchLatestRelease({
            feed: this.config.feed,
            pluginName: this.config.pluginName,
            userAgent: `${this.config.pluginName}/${this.currentVersion()}`
          });
        } catch (error) {
          if (error instanceof UpdateSourceError && error.problem === "no-release") this.blocked = "no-release";
          throw error;
        }
      }
      async run(channel) {
        try {
          const restartRequired = channel === "checkout" ? (await this.runCheckout(), true) : await this.runPackage();
          this.phase = "applied";
          this.blocked = void 0;
          this.message = restartRequired ? "restart-required" : "applied";
          this.restartRequired = restartRequired;
          this.checkedAt = Date.now();
        } catch (error) {
          this.phase = "failed";
          this.blocked = error instanceof Blocked ? error.blocked : void 0;
          this.error = messageOf(error);
          this.ctx.logger.warn("AI Agent Engine update failed: %s", messageOf(error));
        }
      }
      async runPackage() {
        const manager = this.service("pluginManager");
        if (manager === void 0) {
          throw new Blocked("no-plugin-manager", "The Host plugin manager is unavailable, so this runtime cannot install packages.");
        }
        if (this.latest === void 0) await this.fetchRelease();
        const release2 = this.latest;
        if (release2 === void 0) throw new Blocked("no-release", "The update channel lists no installable release.");
        if (release2.assetUrl === void 0) throw new Blocked("no-asset", "The release has no tarball install asset.");
        const fileName = releaseAssetName(this.config.pluginName, release2.version);
        if (release2.assetName !== fileName) throw new Blocked("package-identity-mismatch", "The release asset does not name this plugin and release version.");
        const directory = join(this.cacheRoot(), release2.version);
        await mkdir(directory, { recursive: true });
        const target = join(directory, basename(fileName));
        this.phase = "downloading";
        this.message = "downloading";
        await this.download(release2.assetUrl, target);
        await this.verify(release2, target, fileName);
        try {
          const identity2 = await readPackageIdentity(target);
          if (identity2.name !== this.config.pluginName || identity2.version !== release2.version) {
            throw new Error(`Expected ${this.config.pluginName}@${release2.version}, received ${identity2.name}@${identity2.version}.`);
          }
        } catch (error) {
          throw new Blocked("package-identity-mismatch", messageOf(error));
        }
        this.phase = "installing";
        this.message = "installing";
        try {
          this.installResult = installResultOf(await manager.installBundle(target, { saveExact: true, enabled: true }));
          const result2 = this.installResult;
          if (result2.application !== "applied" && result2.application !== "restart-required") {
            const detail = result2.error?.diagnostic || result2.packageResult?.output || `Host installation outcome: ${result2.application}.`;
            const blocked = result2.error?.code === "incompatible-version" ? "incompatible-version" : result2.application === "cancelled" ? "install-cancelled" : result2.application === "overridden" ? "install-overridden" : "install-failed";
            throw new Blocked(blocked, detail);
          }
          return result2.application === "restart-required";
        } catch (error) {
          if (error instanceof Blocked) throw error;
          const detail = messageOf(error);
          throw new Blocked(/incompatible-version/i.test(detail) ? "incompatible-version" : "install-failed", detail);
        }
      }
      async verify(release2, target, fileName) {
        if (release2.checksumUrl === void 0) throw new Blocked("checksum-missing", "The release has no SHA256SUMS.txt asset.");
        let document;
        try {
          document = await this.readText(release2.checksumUrl);
        } catch (error) {
          throw new Blocked("checksum-invalid", messageOf(error));
        }
        const expected = parseChecksum(document, fileName);
        if (expected === void 0) throw new Blocked("checksum-invalid", `SHA256SUMS.txt has no unique valid entry for ${fileName}.`);
        if (await sha256File(target) !== expected) {
          throw new Blocked("checksum-mismatch", `Downloaded ${fileName} does not match SHA256SUMS.txt.`);
        }
      }
      async readText(url) {
        if (url.startsWith("file:")) return readFile2(new URL(url), "utf8");
        const response = await fetch(url, {
          headers: { "user-agent": `${this.config.pluginName}/${this.currentVersion()}` },
          signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS)
        });
        if (!response.ok) throw new Error(`Checksum download failed with HTTP ${response.status}.`);
        return response.text();
      }
      async download(url, target) {
        if (url.startsWith("file:")) {
          await writeFile(target, await readFile2(new URL(url)));
          return;
        }
        const response = await fetch(url, {
          headers: { "user-agent": `${this.config.pluginName}/${this.currentVersion()}` },
          signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS)
        });
        if (!response.ok) throw new Error(`Release download failed with HTTP ${response.status}.`);
        await writeFile(target, Buffer.from(await response.arrayBuffer()));
      }
      async checkCheckout() {
        const root = this.checkoutRoot();
        if (this.pendingCheckout !== void 0) {
          await this.assertCheckoutUnchanged(this.pendingCheckout);
          return;
        }
        this.assertCheckoutIdentity(root);
        const status2 = await this.git(root, ["status", "--porcelain", "--untracked-files=no"]);
        if (status2.code !== 0) throw new Blocked("dirty-worktree", status2.stderr.trim() || "Not a usable git checkout.");
        if (status2.stdout.trim() !== "") {
          throw new Blocked("dirty-worktree", "The plugin checkout has local changes; commit or stash them first.");
        }
        const fetched = await this.git(root, ["fetch", "--tags", "--quiet", "origin"]);
        if (fetched.code !== 0) throw new Error(fetched.stderr.trim() || "git fetch failed");
        const upstream = await this.upstream(root);
        const behind = await this.git(root, ["rev-list", "--count", `HEAD..${upstream}`]);
        this.pendingCommits = Number.parseInt(behind.stdout.trim(), 10) || 0;
        const tag = await this.git(root, ["describe", "--tags", "--abbrev=0", upstream]);
        const version = tag.code === 0 ? tag.stdout.trim().replace(/^v/i, "") : this.currentVersion();
        if (parseVersion(version) === void 0) return;
        const subject = await this.git(root, ["log", "-1", "--format=%s", upstream]);
        this.latest = {
          version,
          tag: tag.code === 0 ? tag.stdout.trim() : version,
          ...subject.code === 0 && subject.stdout.trim() !== "" ? { notes: subject.stdout.trim() } : {},
          pageUrl: `https://github.com/${this.config.repository}/commits`
        };
      }
      async upstream(root) {
        const upstream = await this.git(root, ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"]);
        if (upstream.code !== 0) throw new Blocked("no-upstream", "The current branch has no upstream to update from.");
        return upstream.stdout.trim();
      }
      /** Share one read so a concurrent getState cannot overwrite an update in progress. */
      async loadPendingCheckout() {
        if (this.pendingLoaded || this.channel() !== "checkout") return;
        this.pendingLoad ??= this.readPendingCheckout();
        try {
          await this.pendingLoad;
        } finally {
          this.pendingLoad = void 0;
        }
      }
      /** Located inside Git metadata, including worktree-private and relative git-paths. */
      async readPendingCheckout() {
        const root = await realpath(this.checkoutRoot());
        const location = await this.git(root, ["rev-parse", "--git-path", "ae-update"]);
        if (location.code !== 0 || location.stdout.trim() === "") return;
        this.pendingDirectory = resolve(root, location.stdout.trim());
        const file = join(this.pendingDirectory, "pending.json");
        if (existsSync(file)) {
          const saved = readJson(file);
          if (saved?.schemaVersion !== 1 || saved.root !== root || !/^[a-f0-9]{40,64}$/.test(saved.base) || !/^[a-f0-9]{40,64}$/.test(saved.target) || typeof saved.branch !== "string" || !["install", "build", "merge", "activate"].includes(saved.stage) || !Array.isArray(saved.activated) || saved.activated.some((item) => item !== "lib" && item !== "node_modules") || saved.promoting !== void 0 && saved.promoting !== "lib" && saved.promoting !== "node_modules") {
            throw new Blocked("checkout-changed", "The saved checkout update state is invalid; it has been preserved for inspection.");
          }
          this.pendingCheckout = saved;
        } else {
          this.assertCheckoutIdentity(root);
        }
        this.pendingLoaded = true;
      }
      async savePendingCheckout(pending) {
        const directory = this.pendingDirectory;
        if (directory === void 0) throw new Blocked("checkout-changed", "Cannot locate Git metadata for the pending update.");
        await mkdir(directory, { recursive: true });
        const file = join(directory, "pending.json");
        await writeFile(`${file}.tmp`, JSON.stringify(pending));
        await rename(`${file}.tmp`, file);
        this.pendingCheckout = pending;
      }
      checkoutPaths(pending) {
        const directory = join(this.pendingDirectory, pending.target);
        return { directory, source: join(directory, "source"), lib: join(directory, "lib") };
      }
      async assertCheckoutUnchanged(pending) {
        const head = await this.git(pending.root, ["rev-parse", "HEAD"]);
        const branch = await this.git(pending.root, ["symbolic-ref", "-q", "HEAD"]);
        if (head.code !== 0 || branch.code !== 0 || branch.stdout.trim() !== pending.branch || head.stdout.trim() !== pending.base && head.stdout.trim() !== pending.target) {
          throw new Blocked("checkout-changed", "The checkout HEAD or branch changed during the pending update. No user changes were reset.");
        }
        const status2 = await this.git(pending.root, ["status", "--porcelain", "--untracked-files=no"]);
        const paths = this.checkoutPaths(pending);
        const promotedLib = pending.activated.includes("lib") || pending.promoting === "lib" && (!existsSync(paths.lib) || !existsSync(join(pending.root, "lib")) && existsSync(join(paths.directory, "previous-lib")));
        const changes = status2.stdout.split(/\r?\n/).filter((line) => line !== "");
        const untrackedLib = promotedLib ? void 0 : await this.git(pending.root, ["ls-files", "--others", "--", "lib"]);
        if (untrackedLib !== void 0 && (untrackedLib.code !== 0 || untrackedLib.stdout.trim() !== "")) {
          throw new Blocked("checkout-changed", "The lib directory has untracked files; they have been left in place.");
        }
        if (status2.code !== 0 || changes.some((line) => !promotedLib || !line.slice(3).startsWith("lib/"))) {
          throw new Blocked("checkout-changed", "The checkout has local changes during the pending update. No user changes were reset.");
        }
        this.assertCheckoutIdentity(pending.root);
        return head.stdout.trim();
      }
      async runCheckout() {
        await this.loadPendingCheckout();
        const root = await realpath(this.checkoutRoot());
        if (this.pendingCheckout === void 0) {
          this.message = "git-fetch";
          const status2 = await this.git(root, ["status", "--porcelain", "--untracked-files=no"]);
          if (status2.code !== 0 || status2.stdout.trim() !== "") {
            throw new Blocked("dirty-worktree", status2.stderr.trim() || "The plugin checkout has local changes; commit or stash them first.");
          }
          const fetched = await this.git(root, ["fetch", "--tags", "--quiet", "origin"]);
          if (fetched.code !== 0) throw new Error(fetched.stderr.trim() || "git fetch failed");
          const upstream = await this.upstream(root);
          const head = await this.git(root, ["rev-parse", "HEAD"]);
          const target = await this.git(root, ["rev-parse", upstream]);
          const branch = await this.git(root, ["symbolic-ref", "-q", "HEAD"]);
          if (head.code !== 0 || target.code !== 0 || branch.code !== 0) throw new Blocked("checkout-changed", "Cannot pin the checkout update target.");
          if (head.stdout.trim() === target.stdout.trim()) throw new Blocked("no-update", "The checkout is already up to date.");
          const ancestor = await this.git(root, ["merge-base", "--is-ancestor", head.stdout.trim(), target.stdout.trim()]);
          if (ancestor.code !== 0) throw new Blocked("checkout-changed", "The target cannot fast-forward this checkout.");
          await this.savePendingCheckout({
            schemaVersion: 1,
            root,
            base: head.stdout.trim(),
            branch: branch.stdout.trim(),
            target: target.stdout.trim(),
            stage: "install",
            activated: []
          });
        }
        const pending = this.pendingCheckout;
        await this.assertCheckoutUnchanged(pending);
        const paths = this.checkoutPaths(pending);
        await mkdir(paths.directory, { recursive: true });
        if (pending.stage === "install") {
          const sourceHead = existsSync(join(paths.source, ".git")) ? await this.git(paths.source, ["rev-parse", "HEAD"]) : void 0;
          if (sourceHead?.code !== 0 || sourceHead.stdout.trim() !== pending.target) {
            await rm(paths.source, { recursive: true, force: true });
            const cloned = await this.git(root, ["clone", "--shared", "--no-checkout", "--quiet", root, paths.source]);
            if (cloned.code !== 0) throw new Blocked("install-failed", cloned.stderr.trim() || "Cannot prepare an isolated checkout.");
            const checkedOut = await this.git(paths.source, ["checkout", "--detach", "--quiet", pending.target]);
            if (checkedOut.code !== 0) throw new Blocked("install-failed", checkedOut.stderr.trim() || "Cannot check out the pinned update target.");
          }
          this.assertCheckoutIdentity(paths.source);
          this.message = "npm-install";
          const args = existsSync(join(paths.source, "package-lock.json")) ? ["ci"] : ["install", "--package-lock=false"];
          const installed = await this.exec(executable("npm"), [...args, "--ignore-scripts", "--no-audit", "--no-fund"], paths.source, PACKAGE_TIMEOUT_MS, true);
          if (installed.code !== 0) throw new Blocked("install-failed", installed.stderr.trim() || installed.stdout.trim() || "npm install failed");
          await mkdir(join(paths.source, "node_modules"), { recursive: true });
          await this.savePendingCheckout({ ...pending, stage: "build" });
        }
        let active = this.pendingCheckout;
        if (active.stage === "build") {
          this.message = "building";
          await rm(paths.lib, { recursive: true, force: true });
          const built = await this.exec(process.execPath, ["tools/build.mjs"], paths.source, PACKAGE_TIMEOUT_MS, false, { AE_BUILD_OUTDIR: paths.lib, npm_config_ignore_scripts: "true" });
          const required = ["index.js", "engineering.js", "client.js", "index.d.ts", "engineering.d.ts", "client.d.ts"];
          if (built.code !== 0 || required.some((file) => !existsSync(join(paths.lib, file)) || !statSync(join(paths.lib, file)).isFile())) {
            throw new Blocked("build-failed", built.stderr.trim() || built.stdout.trim() || "The build did not produce a complete staged plugin.");
          }
          await this.savePendingCheckout({ ...active, stage: "merge" });
        }
        active = this.pendingCheckout;
        if (active.stage === "merge") {
          const head = await this.assertCheckoutUnchanged(active);
          if (head !== active.target) {
            this.message = "git-merge";
            const merged = await this.git(root, ["merge", "--ff-only", active.target]);
            if (merged.code !== 0) throw new Blocked("checkout-changed", merged.stderr.trim() || merged.stdout.trim() || "git merge --ff-only failed");
          }
          await this.savePendingCheckout({ ...active, stage: "activate" });
        }
        await this.activateCheckout(this.pendingCheckout);
        this.pendingCommits = 0;
      }
      /** Swap whole dependency/output trees; backups retain every preexisting file. */
      async activateCheckout(pending) {
        const paths = this.checkoutPaths(pending);
        const stage = (artifact) => artifact === "lib" ? paths.lib : join(paths.source, "node_modules");
        const live = (artifact) => join(pending.root, artifact);
        const backup = (artifact) => join(paths.directory, `previous-${artifact}`);
        let active = pending;
        try {
          const head = await this.assertCheckoutUnchanged(active);
          if (head !== active.target) throw new Error("The checkout no longer points to the pending target.");
          for (const artifact of ["node_modules", "lib"]) {
            if (active.activated.includes(artifact)) {
              if (!isDirectory(live(artifact))) throw new Error(`The activated ${artifact} directory is missing.`);
              continue;
            }
            if (active.promoting !== void 0 && active.promoting !== artifact) throw new Error("An inconsistent activation step was preserved for inspection.");
            const resuming = active.promoting === artifact;
            active = { ...active, promoting: artifact };
            await this.savePendingCheckout(active);
            if (existsSync(stage(artifact))) {
              if (existsSync(live(artifact))) {
                if (existsSync(backup(artifact))) throw new Error(`Both current and backup ${artifact} exist; refusing to overwrite either.`);
                await rename(live(artifact), backup(artifact));
              }
              await rename(stage(artifact), live(artifact));
            } else if (!resuming || !isDirectory(live(artifact))) {
              throw new Error(`The staged ${artifact} directory is missing.`);
            }
            active = { ...active, activated: [...active.activated, artifact], promoting: void 0 };
            await this.savePendingCheckout(active);
          }
          await unlink(join(this.pendingDirectory, "pending.json"));
          this.pendingCheckout = void 0;
        } catch (error) {
          const diagnostics = [messageOf(error)];
          for (const artifact of ["lib", "node_modules"]) {
            if (!active.activated.includes(artifact) && active.promoting !== artifact) continue;
            try {
              if (!existsSync(stage(artifact)) && existsSync(live(artifact))) await rename(live(artifact), stage(artifact));
              if (existsSync(backup(artifact)) && !existsSync(live(artifact))) await rename(backup(artifact), live(artifact));
              active = { ...active, activated: active.activated.filter((item) => item !== artifact), promoting: active.promoting === artifact ? void 0 : active.promoting };
              await this.savePendingCheckout(active);
            } catch (rollbackError) {
              diagnostics.push(`Restoring ${artifact}: ${messageOf(rollbackError)}`);
            }
          }
          throw new Blocked(error instanceof Blocked ? error.blocked : "activation-failed", diagnostics.join("\n"));
        }
      }
      git(root, args) {
        return this.exec("git", args, root, GIT_TIMEOUT_MS);
      }
      exec(file, args, cwd, timeoutMs, shell = false, environment = {}) {
        return new Promise((resolve4) => {
          execFile(file, args, {
            cwd,
            timeout: timeoutMs,
            shell,
            windowsHide: true,
            maxBuffer: 8 * 1024 * 1024,
            encoding: "utf8",
            env: {
              ...process.env,
              ...environment,
              GIT_TERMINAL_PROMPT: "0",
              GCM_INTERACTIVE: "never",
              GIT_ASKPASS: "echo",
              SSH_ASKPASS: "echo",
              GIT_OPTIONAL_LOCKS: "0"
            }
          }, (error, stdout, stderr) => {
            const code = error === null ? 0 : typeof error.code === "number" ? error.code : 1;
            resolve4({ code, stdout: String(stdout ?? ""), stderr: String(stderr ?? "") });
          });
        });
      }
    };
    _init2 = __decoratorStart(_a2);
    __decorateElement(_init2, 1, "getState", _getState_dec, UpdateService);
    __decorateElement(_init2, 1, "check", _check_dec, UpdateService);
    __decorateElement(_init2, 1, "apply", _apply_dec, UpdateService);
    __decoratorMetadata(_init2, UpdateService);
    __publicField(UpdateService, "inject", ["typert"]);
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
function parseRolesFile(text2, warn) {
  let parsed;
  try {
    parsed = JSON.parse(text2);
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
import { mkdir as mkdir2, readFile as readFile3, rename as rename2, unlink as unlink2, writeFile as writeFile2 } from "node:fs/promises";
import { dirname as dirname2, join as join2 } from "node:path";
function resolveRolesFilePath(rolesPath) {
  const explicit = rolesPath?.trim();
  if (explicit) return explicit;
  const home = process.env.DSH_HOME?.trim();
  if (!home) return void 0;
  return join2(home, "ai-agent-engine", "roles.json");
}
async function readOverlayDocument(path, warn = () => void 0) {
  let text2;
  try {
    text2 = await readFile3(path, "utf8");
  } catch (error) {
    const code = error.code;
    if (code === "ENOENT") return void 0;
    warn("Failed to read role overlay at %s (%s); refusing editor load", path, code ?? "error");
    throw error;
  }
  try {
    return validateRolesFile(JSON.parse(text2));
  } catch (error) {
    const failure = error instanceof SyntaxError ? new RoleOverlayValidationError("Role overlay JSON is corrupt") : error;
    warn(
      "Invalid role overlay at %s (%s); refusing editor load",
      path,
      failure instanceof Error ? failure.message : failure
    );
    throw failure;
  }
}
async function writeRolesFile(path, raw) {
  const document = validateRolesFile(raw);
  const directory = dirname2(path);
  await mkdir2(directory, { recursive: true, mode: 448 });
  const temporary = `${path}.${process.pid}.${Date.now()}.tmp`;
  const payload = `${JSON.stringify({ version: 1, roles: document.roles }, null, 2)}
`;
  try {
    await writeFile2(temporary, payload, { mode: 384, flag: "wx" });
    await rename2(temporary, path);
  } catch (error) {
    try {
      await unlink2(temporary);
    } catch {
    }
    throw error;
  }
  return document;
}
async function deleteRolesFile(path) {
  try {
    await unlink2(path);
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
  let text2;
  try {
    text2 = await readFile3(path, "utf8");
  } catch (error) {
    const code = error.code;
    if (code === "ENOENT") return { roles: builtin, source: "builtin", path };
    warn("Failed to read role overlay at %s (%s); using builtin roles", path, code ?? "error");
    return { roles: builtin, source: "builtin", path };
  }
  const overlay = parseRolesFile(text2, warn);
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
import { Remote as Remote3, RemoteError as RemoteError3, TypertRemoteService as TypertRemoteService3 } from "@deepseek-ai/dsh-typert-protocol";
function reject(message, code = "ae-roles/rejected") {
  throw new RemoteError3(code, message, {});
}
var _restoreDefaults_dec, _putOverlay_dec, _getOverlay_dec, _getCatalog_dec, _a3, _init3, RoleCatalogService;
var init_roles_service = __esm({
  "src/roles-service.ts"() {
    "use strict";
    init_role_catalog();
    init_role_catalog_io();
    RoleCatalogService = class extends (_a3 = TypertRemoteService3, _getCatalog_dec = [Remote3("getCatalog")], _getOverlay_dec = [Remote3("getOverlay")], _putOverlay_dec = [Remote3("putOverlay")], _restoreDefaults_dec = [Remote3("restoreDefaults")], _a3) {
      constructor(ctx, config) {
        super(ctx, "aeRoles");
        this.config = config;
        __runInitializers(_init3, 5, this);
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
        let document;
        try {
          document = await readOverlayDocument(path, (message, ...args) => this.warn(message, ...args));
        } catch (error) {
          if (error instanceof RoleOverlayValidationError) reject(error.message, "ae-roles/invalid-overlay");
          const code = error.code;
          reject(`Could not read role overlay${typeof code === "string" ? ` (${code})` : ""}. Existing configuration was not changed; retry loading.`);
        }
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
    _init3 = __decoratorStart(_a3);
    __decorateElement(_init3, 1, "getCatalog", _getCatalog_dec, RoleCatalogService);
    __decorateElement(_init3, 1, "getOverlay", _getOverlay_dec, RoleCatalogService);
    __decorateElement(_init3, 1, "putOverlay", _putOverlay_dec, RoleCatalogService);
    __decorateElement(_init3, 1, "restoreDefaults", _restoreDefaults_dec, RoleCatalogService);
    __decoratorMetadata(_init3, RoleCatalogService);
    __publicField(RoleCatalogService, "inject", ["typert"]);
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
import { resolve as resolve2 } from "node:path";
async function validateSearchIndex(path) {
  if (!path || path === ":memory:") return;
  try {
    await stat(path);
  } catch (error) {
    if (error.code === "ENOENT") return;
    throw error;
  }
  const { DatabaseSync } = await import("node:sqlite");
  const db = new DatabaseSync(resolve2(path), { readOnly: true });
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
  const target = resolve2(path);
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
import { createHash as createHash2, randomUUID } from "node:crypto";
import { mkdir as mkdir3, readFile as readFile4, readdir, realpath as realpath2, rename as rename3, rm as rm2, writeFile as writeFile3 } from "node:fs/promises";
import { isAbsolute, join as join3, relative, resolve as resolve3, sep } from "node:path";
import { Service } from "@deepseek-ai/cordis";
import { Remote as Remote4, RemoteError as RemoteError4, TypertRemoteService as TypertRemoteService4 } from "@deepseek-ai/dsh-typert-protocol";
function reject2(message, code = "ae-conversations/delete-rejected") {
  throw new RemoteError4(code, message, {});
}
function encodeSegment(text2) {
  if (text2 === "." || text2 === "..") return text2.replaceAll(".", "~002E");
  return text2.replace(/[^A-Za-z0-9._-]/g, (character) => `~${character.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0")}`);
}
function sessionDirectory(root, header) {
  const project = header.cwd === void 0 ? "_no-cwd" : `--${(encodeSegment(header.cwd.replace(/[\\/:]+/g, "-")).replace(/^-+/, "") || "root").slice(0, 251)}--`;
  return join3(root, project, encodeSegment(header.id));
}
function ownedParent(header) {
  return header?.origin === "subagent" ? header.parentSession : void 0;
}
function fingerprint(headers) {
  return createHash2("sha256").update(JSON.stringify(headers.map((header) => [header.id, header.createdAt, header.cwd, header.parentSession, header.origin]))).digest("hex");
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
  let text2;
  try {
    text2 = await readFile4(path, "utf8");
  } catch (error) {
    log("Failed to read conversation deletion journal %s; preserving it for recovery (%s)", filename, error);
    throw error;
  }
  try {
    const record = JSON.parse(text2);
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
        this.root = resolve3(persistence.config.root);
        this.directory = join3(this.root, ".ai-agent-engine", "deletions");
        await mkdir3(this.directory, { recursive: true, mode: 448 });
        const remember = (operation, id, parent) => {
          const remembered = operation.then(async (handle) => {
            if (this.blocked(handle.agent.id) || this.blocked(parent) || this.blocked(ownedParent(handle.agent.session.header))) {
              await handle.dispose();
              reject2("This conversation is being deleted");
            }
            this.handles.set(handle.agent.id, handle);
            return handle;
          }).finally(() => {
            this.inflight.delete(remembered);
          });
          this.inflight.set(remembered, { id, parent });
          return remembered;
        };
        const owner = this;
        const restore = [];
        ctx.effect(() => async () => {
          this.closing = true;
          await Promise.allSettled([...this.active]);
          for (const dispose of restore.reverse()) dispose();
        }, "ai-agent-engine.deletionDrain()");
        restore.push(wrapMethod(ctx.agents, "create", (original) => async function(options) {
          const parent = ownedParent(options.meta) ?? options.parentAgent?.id;
          owner.assertWritable(options.sessionId, parent);
          return remember(original.call(this, options), options.sessionId, parent);
        }));
        restore.push(wrapMethod(ctx.agents, "resume", (original) => async function(options) {
          owner.assertWritable(options.resumeSessionId, options.parentAgent?.id);
          return remember(original.call(this, options), options.resumeSessionId, options.parentAgent?.id);
        }));
        restore.push(wrapMethod(persistence, "create", (original) => async function(header, options) {
          owner.assertWritable(header.id, ownedParent(header));
          return original.call(this, header, options);
        }));
        const rawPersistence = persistence;
        restore.push(wrapMethod(persistence, "open", (original) => {
          this.rawOpen = original.bind(rawPersistence);
          return async function(id, access, options) {
            if (owner.deleted.has(id) || access === "write" && owner.pending.has(id)) reject2("Conversation was deleted");
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
          this.assertWritable(session.id, ownedParent(session.header));
        });
        ctx.on("agent/disposed", ({ agent }) => {
          this.handles.delete(agent.id);
        });
        const cache = ctx.storageDomain.get("session_projcache")?.table("sessions");
        if (cache) restore.push(wrapMethod(cache, "put", (original) => function(id, value) {
          return owner.blocked(id) ? Promise.resolve() : original.call(this, id, value);
        }));
        for (const filename of await readdir(this.directory)) {
          let record;
          try {
            record = await loadDeletionJournalFile(this.directory, filename, (format, ...args) => {
              ctx.logger.warn(format, ...args);
            });
          } catch (error) {
            this.config.onUnsupported?.();
            throw error;
          }
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
        if (this.blocked(id) || this.blocked(parent)) reject2("Conversation is being deleted or has been deleted");
      }
      authorize(ids) {
        const ctx = this.ctx;
        if (this.closing || !this.config.enabled()) reject2("Conversation management is disabled");
        if (ctx.invocation?.peer.principal.kind !== "owner") reject2("Only the Host owner can delete conversations");
        for (const id of ids) {
          if (!ctx.remoteAccess.allows({ kind: "session", id })) reject2("Conversation access denied");
        }
      }
      async collect(id) {
        const headers = new Map((await this.ctx.sessionPersistence.list()).map((row) => [row.header.id, row.header]));
        for (const session of this.ctx.sessions.list()) headers.set(session.id, session.header);
        const root = headers.get(id);
        if (!root || root.origin === "subagent") reject2("Select the owning conversation");
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
        if (this.unsupported) reject2("This storage backend is not supported by conversation deletion", "ae-conversations/delete-unsupported");
        if (!request || typeof request.sessionId !== "string" || !request.sessionId) reject2("Invalid conversation identity");
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
        if (this.unsupported) reject2("This storage backend is not supported by conversation deletion", "ae-conversations/delete-unsupported");
        const operation = this.performDeletion(request);
        this.active.add(operation);
        try {
          return await operation;
        } finally {
          this.active.delete(operation);
        }
      }
      async performDeletion(request) {
        if (!request || request.stopRunning !== true || !Array.isArray(request.sessionIds) || request.sessionIds.some((id) => typeof id !== "string")) reject2("Invalid deletion confirmation");
        this.authorize(request.sessionIds);
        await this.validateStorage();
        const record = this.previews.get(request.fingerprint);
        if (!record || record.rootId !== request.sessionId || JSON.stringify(record.headers.map((header) => header.id)) !== JSON.stringify(request.sessionIds)) {
          reject2("Preview the conversation again", "ae-conversations/delete-scope-changed");
        }
        if (this.operations.has(record.fingerprint) || request.sessionIds.some((id) => this.pending.has(id))) reject2("Deletion is already running");
        this.operations.add(record.fingerprint);
        for (const id of request.sessionIds) this.pending.add(id);
        const locks = [];
        try {
          const committed = request.sessionIds.every((id) => this.deleted.has(id));
          if (!committed) {
            await Promise.allSettled([...this.inflight].filter(([, item]) => this.pending.has(item.id) || item.parent !== void 0 && this.pending.has(item.parent)).map(([operation]) => operation));
            if (fingerprint(await this.collect(request.sessionId)) !== record.fingerprint) reject2("Conversation family changed", "ae-conversations/delete-scope-changed");
            for (const id of request.sessionIds) {
              const agent = this.ctx.agents.get(id);
              if (agent && this.handles.get(id)?.agent !== agent) {
                reject2("Restart Desktop once after enabling the plugin", "ae-conversations/delete-restart-required");
              }
              if (!agent && this.ctx.sessions.get(id)) reject2("Conversation is still in use");
            }
            for (const id of [...request.sessionIds].reverse()) {
              const agent = this.ctx.agents.get(id);
              if (agent) {
                const handle = this.handles.get(id);
                if (handle?.agent !== agent) reject2("Restart Desktop once after enabling the plugin", "ae-conversations/delete-restart-required");
                agent.cancel({ kind: "user" }, { keepInbox: false });
                await this.ctx.parallel("workspace/session-stop", { sessionId: id });
                await handle.dispose();
              }
              if (this.ctx.sessions.get(id)) reject2("Conversation is still in use");
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
        const root = await realpath2(this.root);
        for (const header of record.headers) {
          const directory = sessionDirectory(this.root, header);
          let actual;
          try {
            actual = await realpath2(directory);
          } catch (error) {
            if (error.code === "ENOENT") continue;
            throw error;
          }
          const within = relative(root, actual);
          if (!within || within === ".." || within.startsWith(`..${sep}`) || isAbsolute(within)) reject2("Unsafe conversation storage path");
          for (const entry of await readdir(directory, { withFileTypes: true })) {
            if (entry.name === "session.lock") continue;
            await rm2(join3(directory, entry.name), { recursive: entry.isDirectory(), force: true });
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
import { readFile as readFile5 } from "node:fs/promises";
function rolesEnabledOf(config) {
  const value = config.rolesEnabled;
  if (typeof value === "function") return value();
  return value !== false;
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
async function apply(ctx, config) {
  const warn = (message, ...args) => {
    ctx.logger.warn(message, ...args);
  };
  const installed = /* @__PURE__ */ new Map();
  let disposed = false;
  let generation = 0;
  let initializing = true;
  let policy = "";
  ctx.on("ai-agent-engine/roles-updated", () => {
    if (initializing) generation++;
    else refreshPolicy();
  });
  ctx.effect(() => () => {
    disposed = true;
    generation++;
    for (const dispose of installed.values()) dispose();
    installed.clear();
  }, "ai-agent-engine.scopedPolicy()");
  const reconcile = (agent) => {
    if (initializing || disposed) return;
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
    const current = ++generation;
    void (async () => {
      try {
        const next = await buildEngineeringPolicy(config, warn);
        if (disposed || current !== generation || next === policy) return;
        policy = next;
        reconcileAll();
      } catch (error) {
        if (!disposed && current === generation) {
          warn("Failed to refresh engineering role policy: %s", error instanceof Error ? error.message : error);
        }
      }
    })();
  };
  if (config.teamTools) await ctx.plugin(await import("@deepseek-ai/dsh-experimental-tool-agent-team"));
  if (disposed) return;
  let initialGeneration;
  do {
    initialGeneration = generation;
    policy = await buildEngineeringPolicy(config, warn);
    if (disposed) return;
  } while (initialGeneration !== generation);
  initializing = false;
  reconcileAll();
}
var name, inject, Config;
var init_engineering = __esm({
  "src/engineering.ts"() {
    "use strict";
    init_role_catalog();
    init_role_catalog_io();
    name = "ai-agent-engine-engineering";
    inject = ["systemPrompt", "tools", "agents", "agentTeams", "agentPresets"];
    Config = z.object({
      teamTools: z.boolean().default(true),
      rolesEnabled: z.any().default(true),
      rolesPath: z.string().default("")
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
import { fileURLToPath as fileURLToPath2 } from "node:url";
import { BUNDLED_SKILL_RANK } from "@deepseek-ai/dsh-skill";
import { parse } from "yaml";
function installSkills(ctx) {
  const provider = "ai-agent-engine";
  const candidate = async (name3) => {
    const resourceBase = { kind: "directory", path: fileURLToPath2(new URL(`../skills/${name3}/`, import.meta.url)) };
    const text2 = await readFile6(new URL(`../skills/${name3}/SKILL.md`, import.meta.url), "utf8");
    const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(text2);
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
      const text2 = await readFile6(new URL(`../skills/${selected.name}/SKILL.md`, import.meta.url), "utf8");
      return { ...selected, content: text2.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "") };
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
import z2 from "@deepseek-ai/schemastery";

// src/deletion-rpc.ts
import { array as z_array, literal as z_literal, strictObject as z_strictObject, string as z_string } from "zod";
var namespace = "aeConversations";
var identity = z_string().min(1);
var previewRequest = z_strictObject({ sessionId: identity });
var preview = z_strictObject({
  sessionId: identity,
  sessionIds: z_array(identity).min(1),
  fingerprint: z_string().regex(/^[a-f0-9]{64}$/),
  runningSessionIds: z_array(identity)
});
var confirmation = preview.extend({ stopRunning: z_literal(true) });
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
    result: codec(method === "deletePreview" ? preview : z_array(identity), `${method}Result`)
  }))
};

// src/roles-rpc.ts
import { array as z_array2, boolean as z_boolean, literal as z_literal2, strictObject as z_strictObject2, string as z_string2, union as z_union } from "zod";
var namespace2 = "aeRoles";
var roleId = z_string2().regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/).refine((id) => id !== "lead");
var overlayEntry = z_strictObject2({
  id: roleId,
  skill: z_string2().min(1).optional(),
  responsibility: z_string2().optional()
});
var putRequest = z_strictObject2({
  version: z_literal2(1),
  roles: z_array2(overlayEntry)
});
var roleDefinition = z_strictObject2({
  id: z_string2().min(1),
  skill: z_string2().min(1).optional(),
  responsibility: z_string2().optional()
});
var catalogResult = z_strictObject2({
  roles: z_array2(roleDefinition),
  source: z_union([z_literal2("builtin"), z_literal2("merged")]),
  path: z_string2().optional(),
  enabled: z_boolean()
});
var overlayResult = z_strictObject2({
  version: z_literal2(1),
  roles: z_array2(overlayEntry),
  path: z_string2().optional(),
  exists: z_boolean()
});
var putResult = z_strictObject2({
  path: z_string2().min(1),
  roles: z_array2(roleDefinition),
  source: z_union([z_literal2("builtin"), z_literal2("merged")])
});
var restoreResult = z_strictObject2({
  restored: z_literal2(true),
  path: z_string2().optional(),
  roles: z_array2(roleDefinition)
});
function codec2(schema, name3) {
  return { mode: "strict", typeSymbol: `ai-agent-engine-deepseek#${name3}`, create: () => schema };
}
var emptyRequest = z_strictObject2({});
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
import { enum as z_enum, strictObject as z_strictObject3 } from "zod";
var status = z_strictObject3({
  state: z_enum(["waiting", "ready", "unavailable"]),
  reason: z_enum(["services", "interface", "initialization", "storage"]).optional()
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
      codec: { mode: "strict", typeSymbol: "ai-agent-engine-deepseek#statusRequest", create: () => z_strictObject3({}) }
    }],
    result: {
      mode: "strict",
      typeSymbol: "ai-agent-engine-deepseek#statusResult",
      create: () => z_strictObject3({ engineering: status, roles: status, deletion: status, update: status })
    }
  }]
};

// src/update-rpc.ts
import { array as z_array3, boolean as z_boolean2, enum as z_enum2, number as z_number, strictObject as z_strictObject4, string as z_string3 } from "zod";
var namespace3 = "aeUpdate";
var release = z_strictObject4({
  version: z_string3().min(1),
  tag: z_string3().min(1),
  notes: z_string3().optional(),
  pageUrl: z_string3().optional(),
  assetUrl: z_string3().optional(),
  assetName: z_string3().optional(),
  checksumUrl: z_string3().optional(),
  publishedAt: z_string3().optional()
});
var installResult = z_strictObject4({
  changed: z_boolean2(),
  application: z_enum2(["applied", "restart-required", "overridden", "failed", "cancelled"]),
  error: z_strictObject4({ code: z_string3(), diagnostic: z_string3().optional() }).optional(),
  packageResult: z_strictObject4({
    exitCode: z_number().int(),
    output: z_string3(),
    truncated: z_boolean2(),
    logPath: z_string3(),
    kind: z_string3().optional(),
    timedOut: z_boolean2().optional()
  }).optional(),
  warnings: z_array3(z_string3()).optional(),
  pendingBuilds: z_array3(z_string3()).optional()
});
var state = z_strictObject4({
  pluginName: z_string3().min(1),
  currentVersion: z_string3().min(1),
  runtimeVersion: z_string3().optional(),
  verifiedThrough: z_string3().optional(),
  runtimeSupport: z_enum2(["verified", "untested-newer", "untested-older", "unknown"]),
  channel: z_enum2(["package", "checkout"]),
  installSpec: z_string3().optional(),
  latest: release.optional(),
  pendingCommits: z_number().int().nonnegative().optional(),
  pendingCheckout: z_strictObject4({
    target: z_string3(),
    stage: z_enum2(["install", "build", "merge", "activate"])
  }).optional(),
  installResult: installResult.optional(),
  outdated: z_boolean2(),
  canApply: z_boolean2(),
  blocked: z_enum2([
    "busy",
    "no-plugin-manager",
    "no-release",
    "no-asset",
    "checksum-mismatch",
    "incompatible-version",
    "dirty-worktree",
    "no-upstream",
    "no-update",
    "checksum-missing",
    "checksum-invalid",
    "package-identity-mismatch",
    "install-failed",
    "install-cancelled",
    "install-overridden",
    "checkout-changed",
    "build-failed",
    "activation-failed"
  ]).optional(),
  phase: z_enum2(["idle", "checking", "downloading", "installing", "rebuilding", "applied", "failed"]),
  message: z_string3().optional(),
  error: z_string3().optional(),
  restartRequired: z_boolean2(),
  checkedAt: z_number().optional()
});
var emptyRequest2 = z_strictObject4({});
function codec3(schema, name3) {
  return { mode: "strict", typeSymbol: `ai-agent-engine-deepseek#${name3}`, create: () => schema };
}
var result = codec3(state, "updateState");
var updateRpc = {
  package: "ai-agent-engine-deepseek",
  descriptors: [
    { method: "getState", name: "getStateRequest" },
    { method: "check", name: "checkUpdateRequest" },
    { method: "apply", name: "applyUpdateRequest" }
  ].map((method) => ({
    id: `ai-agent-engine-deepseek#${namespace3}/${method.method}`,
    service: "aeUpdate",
    namespace: namespace3,
    method: method.method,
    invocation: { kind: "direct" },
    parameters: [{ name: "request", wire: "request", source: "json", codec: codec3(emptyRequest2, method.name) }],
    result: { ...result, typeSymbol: `ai-agent-engine-deepseek#${method.method}Result` }
  }))
};

// src/rpc.ts
var pluginRpc = {
  package: deletionRpc.package,
  descriptors: [
    ...deletionRpc.descriptors,
    ...rolesRpc.descriptors,
    ...compatibilityRpc.descriptors,
    ...updateRpc.descriptors
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
var Config2 = z2.object({
  engineering: z2.boolean().default(true),
  conversationManagement: z2.boolean().default(true).volatile(),
  maxMembers: z2.natural().min(1).default(8),
  rolesEnabled: z2.boolean().default(true).volatile(),
  rolesPath: z2.string().default(""),
  updateFeed: z2.string().default("")
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
  ctx.on("loader/volatile-update", (paths) => {
    if (paths.some((path) => path.length === 1 && path[0] === "rolesEnabled")) {
      ctx.emit("ai-agent-engine/roles-updated");
    }
  });
  await ctx.plugin(CompatibilityService, { statuses });
  mountModule(ctx, "update", ["typert"], {}, statuses, async (scope) => {
    const { UpdateService: UpdateService2 } = await Promise.resolve().then(() => (init_update_service(), update_service_exports));
    await scope.plugin(UpdateService2, {
      pluginName: "ai-agent-engine-deepseek",
      feed: config.updateFeed,
      repository: "YaoGUanquan/ai-agent-engine-deepseek"
    });
  });
  mountModule(ctx, "roles", ["typert"], {}, statuses, async (scope) => {
    const { RoleCatalogService: RoleCatalogService2 } = await Promise.resolve().then(() => (init_roles_service(), roles_service_exports));
    await scope.plugin(RoleCatalogService2, {
      enabled: () => config.rolesEnabled.get(),
      rolesPath: config.rolesPath
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
      rolesPath: config.rolesPath
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
