# Harness compatibility patch

This source patch targets `deepseek-ai/deepseek-harness`, tag
`dsh-v0.2.1-rc.3`, commit `1f81c047fc48fa190a683e469daa699857e9afe8`.
The manifest records every original source checksum. A version label alone is
not sufficient: a nightly Desktop build may carry different source at the same
version.

## Apply and build

Use a separate official source checkout at the pinned commit. From this plugin's
source directory, verify and then apply:

Keep that checkout's source files in LF form, for example by cloning with
`git -c core.autocrlf=false clone ...`. Checksums intentionally reject converted
source bytes. This repository's `.gitattributes` keeps the delivered patch in LF.

```powershell
node tools/harness-patch.mjs check "<harness-source-directory>"
node tools/harness-patch.mjs apply "<harness-source-directory>"
```

In that Harness checkout:

```powershell
pnpm install --frozen-lockfile
pnpm run build:artifacts
pnpm run build:check
pnpm exec vitest run packages/session/session-persistence-jsonl/tests/deletion.spec.ts packages/api/session-controller/tests/deletion.spec.ts
```

Use the official `dsh` launcher with a separate Harness home/profile and only
synthetic conversations. Install the plugin archive in that test profile. Build
Desktop through the upstream `package:desktop:win:x64:dir` command only after
the source, integration and browser checks pass; test that output separately
before replacing any existing installation.

The patch does not edit `app.asar`, change the user's default preset, copy real
profiles, or delete real conversation history.

## Interfaces

`session.deletePreview({sessionId})` returns `sessionId`, sorted `sessionIds`,
an identity `fingerprint`, and `runningSessionIds`. Only the Host owner can use
it, and every returned Session must pass resource authorization.
The generated browser methods return the official `RemoteResult` envelope:
check `ok` before reading `value`; an error carries `error.code`.

`session.delete({...preview, stopRunning: true})` revalidates scope, reserves
publication, stops all owned activity, waits for exact Agent teardown, and takes
all persistence writer locks before committing deletion. Added Team descendants
require another preview and confirmation. Independent forks are excluded.

The JSONL provider implements optional `SessionPersistence.deleteSessions`.
Other providers explicitly report deletion unsupported. Stable lock directories
are retained. An atomic deletion journal contains only identity and location;
it excludes transcripts and titles. Writer acquisition and reads consult that
journal so committed deletion cannot recreate a log.

Cleanup failure remains visible and can be retried with the original preview.
After restart, persistence resumes committed cleanup before becoming available.
Workspace and projection-cache startup reconcile durable deletion identities.
Search cleanup uses its existing serialized index queue; no SQL schema changes
or Session format rewrite are introduced.
The SQLite provider removes only the selected identities and recovers durable
deletion identities on persistence activation, even when search is disabled.
Scope changes return `session/delete-scope-changed` and require another preview;
unsupported storage returns `session/delete-unsupported`.

## Isolated browser acceptance

After building the patched source and this plugin, run from this plugin's source
checkout:

```powershell
node tools/harness-integration.mjs "<harness-source-directory>"
```

The test creates a temporary profile containing this bundle, uses scripted
model responses with the real Agent Teams runtime, and closes the profile after
verification. It tests current and archived conversations, cancellation, native
parallel work, dependent tasks, both module switches, official Team coexistence,
and desktop/narrow confirmation dialogs. Screenshots go to `output/playwright/`.
`AE_HARNESS_TEST_TEMP` can select a separate temporary directory; keep it outside
the plugin source tree. File-watch HMR is disabled in this fixture.

Deletion is irreversible. Removing the patch is not a data recovery mechanism.
Do not edit the deletion journal to bypass failed cleanup or resurrect an id.
