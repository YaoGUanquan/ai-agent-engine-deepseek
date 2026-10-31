# AI Agent Engine for DeepSeek Harness

让 DeepSeek Harness 按需组织前端、后端和测试工程师协作，并支持右键永久删除对话。

本项目参考 [AI Agent Engine for Codex](https://github.com/YaoGUanquan/codex-ai-agent-engine)，将其七项工程技能适配为 DeepSeek Harness 原生插件。

[功能介绍](#功能介绍) · [安装](#安装) · [更新与回退](#更新与回退) · [快速使用](#快速使用) · [常见问题](#常见问题) · [版本下载](https://github.com/YaoGUanquan/ai-agent-engine-deepseek/releases)

## 功能介绍

| 功能 | 可以做什么 |
| --- | --- |
| 多角色协作 | 按任务需要创建前端、后端、需求分析和测试队友，支持并行工作、消息沟通和共享任务 |
| 专业角色显示 | 团队面板和任务负责人显示“前端工程师”“后端工程师”等职责 |
| 七项工程技能 | 覆盖需求澄清、前后端开发、单元测试、集成测试和浏览器测试 |
| 永久删除对话 | 从对话菜单删除主对话及其所属队友记录，同时清理对应的缓存和搜索索引 |
| 可配置工程角色 | 本机 `$DSH_HOME/ai-agent-engine/roles.json` 覆盖/追加 Lead 策略；插件设置 **`settings.section`「工程角色」** 可可视化编辑 `skill`/`responsibility` 与自定义 id |

简单任务可以由当前助手直接完成；需要分工时再组队。安装后可继续使用标准模式，也可以选择 **AI Agent Engine** 模式。

## 安装

### 环境要求

| 项目 | 当前支持范围 |
| --- | --- |
| 插件版本 | `0.2.4` |
| DeepSeek Harness（允许加载） | `>=0.2.1-rc.5 <0.2.2-0` |
| 实际运行验证基线 | `0.2.1-rc.5` |
| Desktop 实机验证 | Windows 原版 Desktop |

其他版本和平台尚未完成实机验证。

源码允许 `rc.5`、同系列后续 RC 和 `0.2.1` 正式版加载，不再支持 `rc.3`；
允许加载不代表未来版本已经完成运行验证。`0.2.2`（含预发布版）需要另行适配。
开发依赖固定 `rc.5`，运行依赖及 peer 使用上述兼容范围。
已发布的 `v0.2.3` 标签及 Release 安装包仍只声明支持 `rc.3`；
本次适配需安装 `0.2.4`（GitHub `#v0.2.4` 或 `ai-agent-engine-deepseek-0.2.4.tgz`），
不能靠重新安装原有固定标签获得修复。以下安装示例即当前版本 pin。

### 自动兼容与降级

宿主升级到范围内的新 RC 时，不再因为版本号变化直接禁用整个插件。
工程协作、角色和永久删除分别等待所需服务并检查接口，失败时只停用对应模块；
打开设置中的“插件状态”可查看宿主及界面各模块的可用状态。
基础加载协议、RPC 或模块导出发生破坏性变化时仍需更新插件。

永久删除只接受已知的 JSONL 后端和搜索索引结构。
能力检查在恢复删除日志、安装方法包装和删除数据前执行；不兼容时禁止删除。
插件不修改 Desktop、不自动添加版本豁免，也不自动下载或安装新插件版本。

### 在 Desktop 中安装

1. 打开 DeepSeek Harness，进入 **插件**，点击 **添加插件**。
2. 在“包名或地址”中填写以下地址，点击 **安装**。
3. 安装完成后点击 **立即启用**。
4. 完全退出并重新打开 Desktop。

```text
github:YaoGUanquan/ai-agent-engine-deepseek#v0.2.4
```

安装包已包含构建产物。普通用户无需安装 Node.js、执行脚本或构建源码，也无需替换 Desktop。

已经安装旧版时，按下文的[更新步骤](#更新与回退)操作。

### 下载安装包

也可以打开 [Releases](https://github.com/YaoGUanquan/ai-agent-engine-deepseek/releases/latest)，下载 `ai-agent-engine-deepseek-0.2.4.tgz`，在插件管理器的“包名或地址”中填写该文件的绝对路径，再安装、启用并重启。

每个 Release 都提供版本说明、兼容范围和 `SHA256SUMS.txt` 校验文件。普通用户选择 `.tgz` 插件包即可；GitHub 自动生成的 “Source code” 是源码归档，供开发者使用。

## 更新与回退

### 能直接在插件里点击更新吗？

当前适配范围内的 Harness（允许加载 `>=0.2.1-rc.5 <0.2.2-0`，验证基线 `0.2.1-rc.5`）仅为按需安装的官方插件提供“更新”入口。此插件属于第三方插件，**目前需要在插件页先卸载旧版，再安装新版**，没有自动下载或静默升级功能。

安装地址中的 `#v0.2.4` 表示固定版本。重新启动 Desktop 不会自动变成未来的新版本。

### 如何升级

1. 打开[最新版本页面](https://github.com/YaoGUanquan/ai-agent-engine-deepseek/releases/latest)，查看更新内容和兼容的 Harness 版本。
2. 等待相关任务结束，记录你自定义过的插件配置。
3. 在 **插件** 页打开 `ai-agent-engine-deepseek`，点击 **卸载**。
4. 点击 **添加插件**，填写新版本页面提供的安装地址。
5. 安装并启用后，完全退出并重新打开 Desktop。Windows 下也要退出系统托盘中的后台实例，再核对版本和配置。

例如，从 `0.2.3` 升级到当前版本时填写：

```text
github:YaoGUanquan/ai-agent-engine-deepseek#v0.2.4
```

卸载插件不会替你删除已有对话。更新期间也不需要移除 Harness 的会话目录、记忆或项目文件。

### 如何确认升级成功

1. 在[最新版本页面](https://github.com/YaoGUanquan/ai-agent-engine-deepseek/releases/latest)确认最新正式版本号。
2. 安装完成时，核对“已安装”提示中的版本；当前应为 `0.2.4`。
3. 重启后，在 **插件** 页打开 `ai-agent-engine-deepseek`，核对版本、安装来源和启用状态；当前 GitHub 安装来源应包含 `#v0.2.4`。
4. 打开原有对话，确认历史仍可查看；已有自定义配置也应重新核对。

插件版本 `0.2.4` 与 Harness 版本（允许加载 `>=0.2.1-rc.5 <0.2.2-0`）是两个不同的版本号。更新插件不会替你升级或替换 Desktop。

如果重启后仍显示旧版，请先确认卸载、安装操作发生在当前正在使用的 Desktop 中，再检查是否还有旧的后台实例。只下载 `.tgz` 或只打开 Release 页面不会更新已安装插件。

### 如何回退

先卸载当前插件，再用已发布的旧版本地址安装。例如回到 `0.2.3`：

```text
github:YaoGUanquan/ai-agent-engine-deepseek#v0.2.3
```

启用后重启 Desktop。回退只切换插件版本，不会恢复已经永久删除的对话。

## 快速使用

### 让不同角色协作

进入你的项目，在标准模式或 **AI Agent Engine** 模式中直接描述任务。例如：

```text
实现订单列表的筛选功能。请让前端工程师和后端工程师分工，
先确认接口和验收标准，完成后由测试工程师验证。
```

助手会根据任务组织协作。点击会话顶部的“智能体团队”可以查看成员和共享任务，团队面板按职责显示名称。

需要明确验证组队功能时，可以这样提问：

```text
请实际创建后端工程师和前端工程师两个队友，
分别只回复 BACKEND_OK 和 FRONTEND_OK，不要读写项目文件。
```

协作使用当前会话的模型与权限。创建多个队友会增加模型调用和用量，请按任务需要使用。

### 使用某一项技能

也可以在对话中直接点名技能。例如：

```text
使用 ae-grill，帮我澄清登录改造的需求和验收标准。
```

```text
使用 ae-backend，排查重复提交导致的订单重复创建问题。
```

```text
使用 ae-unit-test，为订单金额计算补充边界测试并执行。
```

| 技能 | 适用场景 |
| --- | --- |
| `ae-grill` | 澄清需求、方案和验收标准 |
| `ae-frontend` | 开发或修复前端页面与交互 |
| `ae-backend` | 开发后端服务、接口，排查根因 |
| `ae-unit-test` | 编写和执行单元测试 |
| `ae-integration-test` | 验证接口、认证、数据持久化等环节的配合 |
| `ae-e2e-test` | 编写或执行浏览器端到端测试用例 |
| `ae-e2e-suite` | 整理端到端测试基础设施、套件和持续集成 |

### 永久删除对话

1. 在左侧对话列表中，右键目标对话，或打开该对话的“更多”菜单。
2. 选择 **永久删除**。
3. 核对确认框中的对话名称、关联队友数量和运行状态。
4. 点击 **永久删除**；点击 **取消**则保留记录。

确认后会先停止相关任务，再删除主对话及其所属队友对话，并清理对应的工作区引用、缓存和搜索索引。

非 JSONL 持久化时删除入口不可用；损坏的删除记录会被隔离，不会导致插件无法启动。详见[常见问题](#非-jsonl-存储或删除记录损坏时会怎样)。

**永久删除无法撤销。** 项目文件和独立分叉对话会保留；独立分叉中已经复制的历史、外部备份也会保留。此操作仅允许当前 Harness 的所有者执行。

## 常见问题

### 安装后为什么需要重启？

插件需要从会话创建或恢复时接管它的生命周期。首次启用前已经打开的会话，需要重启后才能正常执行删除。

### 为什么没有出现多个队友？

安装后不会为每个任务自动创建固定数量的队友。简单任务可以由当前助手直接完成；需要分工时，请明确说明角色和任务。是否正确调用协作工具也取决于所用模型。

### 为什么旧会话仍显示原来的成员名称？

新工程队友使用专业角色名称。历史会话中没有明确职责的自定义名称会保留，插件不会猜测和改写。

### 删除后为什么目录里还可能有少量文件？

插件保留不含对话正文和标题的删除身份记录及锁文件，用于阻止已删除身份被重新打开，并在中断后继续清理。这不表示对话正文仍被保留。

### 非 JSONL 存储或删除记录损坏时会怎样？

永久删除依赖 JSONL 会话持久化。若宿主使用非 JSONL 后端，插件会**关闭删除能力**并继续加载工程技能；调用删除时返回不可用（`delete-unsupported`），不会拖垮整插件。

若 `.ai-agent-engine/deletions/` 下某条删除记录文件损坏，插件会将其改名为 `*.json.corrupt` 并写入日志，跳过该条后继续启动，其余有效记录照常恢复。

### 改了角色（设置页或 roles.json），为什么旧队友没变？

约定：只影响**之后新创建**的队友。已 spawn 或冷恢复的实例不重绑提示词，路由名也保持创建时的值。设置页保存或 Host `aeRoles` 写回后会重建 Lead 策略，供新 spawn 使用。

### 如何恢复出厂工程角色？

在设置 **「工程角色」** 中点击「恢复默认」（会删除同一 overlay 文件）；或手动删除/清空 `$DSH_HOME/ai-agent-engine/roles.json`（若配置了 `rolesPath` 则删对应文件）；也可将 `rolesEnabled` 设为 `false`。不必为此卸载插件。正在进行的会话不应因清文件而崩溃；已 spawn 队友不重绑。

### 角色文件损坏或路径无效会怎样？

插件会打日志并退回内置种子，**不应**导致无法启动。修好 JSON、修正 `rolesPath`，或暂时关闭 `rolesEnabled` 即可。

### 能在设置页里可视化编辑角色吗？

可以。打开宿主**设置**，在本插件的 **`settings.section`「工程角色」** 中编辑。可改 `skill`（技能）与 `responsibility`（职责），可添加自定义角色 id，可「恢复默认」。团队面板中文职称仍由 locales 决定，本页不改展示名。

也可以继续手改 `$DSH_HOME/ai-agent-engine/roles.json`（或 `rolesPath`）；设置页与文件读写**同一份** overlay。保存后 Lead 策略会重建，**新创建**的队友生效；已 spawn 队友不重绑。

### 多个对话一起用前端/后端队友会不会串角色？

无 overlay（或未启用合并）时，多对话并行或交替调用内置角色**应保持**默认种子行为、彼此不串。一期契约与多对话冒烟曾对 tip `85600bac`（#5）验收；二期设置页（tip `92a3189` / #7）相关多对话与设置持久化，**测侧进行中，本文不宣称已冒烟通过**。已创建队友不会因为你改设置页或 `roles.json` 而自动换提示词。

### 会改变默认模式或数据目录吗？

已有默认模式保持不变。插件沿用 Harness 已配置的会话和数据目录。角色 overlay 默认落在 `$DSH_HOME/ai-agent-engine/`，不写入项目工作区。

### 当前版本验证过哪些功能？

`0.2.4` 在 `0.2.3` 工程角色能力之上，将宿主兼容范围改为 `>=0.2.1-rc.5 <0.2.2-0`（详见 CHANGELOG）。`0.2.3` 起支持工程角色 overlay 与设置页可视化编辑（#5 文件契约 + #7 `settings.section`「工程角色」/`aeRoles`）。开发者本机可对 tip `92a3189` 跑通 `check:all`（含角色相关单测）。一期测侧曾对 tip `85600bac` 验收文件契约与多对话冒烟；**二期设置页与多对话回归测侧进行中，勿将「应保持」理解为已冒烟通过**。完整 Desktop 实机双队友与永久删除历史证据仍沿用 `0.2.0`/`0.2.1` 验收记录，详见 [VALIDATION](compat/harness/VALIDATION.md)。

真实模型创建前后端队友、角色显示和永久删除功能的完整实机验收，仍来自 `0.2.0`/`0.2.1` 记录；本版本未重新删除用户既有对话做实机验收。无覆盖文件时，内置角色行为应与 `0.2.2` / tip `6b638b7` 口径一致。

详细环境、检查结果和未验证范围见[验收记录](compat/harness/VALIDATION.md)。

## 开发

以下步骤仅面向修改源码的开发者，普通安装无需执行。

要求 Node.js 24+：

```bash
npm ci
npm run check:all
npm pack
```

构建后可在 Desktop 插件管理器中安装生成的 `ai-agent-engine-deepseek-0.2.4.tgz`。提交源码变更时应同步构建产物 `lib/`，保证 Git 地址安装可直接使用。

使用未修改的官方 Harness `dsh-v0.2.1-rc.5` 源码完成依赖安装和构建后运行集成验收；测试入口会拒绝版本不匹配的宿主：

```bash
node tools/harness-integration.mjs "<official-harness-source-directory>"
```

插件遵循[官方开发文档](https://deepseek-harness.github.io/deepseek-harness/develop/basic/)。开发时可参考[生命周期说明](https://deepseek-harness.github.io/deepseek-harness/develop/cordis-tutorial/02-lifecycle-and-effects)。

### 插件配置

配置位于 `cordis.patch.yml`：

| 配置 | 默认值 | 作用 |
| --- | --- | --- |
| `engineering` | `true` | 启用工程技能、协作策略和可选工程模式 |
| `conversationManagement` | `true` | 显示永久删除菜单和确认框 |
| `maxMembers` | `8` | 本插件创建团队服务时允许的队友数量上限 |
| `rolesEnabled` | `true` | 是否读取用户角色覆盖文件并合并进 Lead 策略 |
| `rolesPath` | 空 | 可选绝对路径；空则使用 `$DSH_HOME/ai-agent-engine/roles.json` |

已启用官方团队插件时，会复用它的服务和人数限制。`conversationManagement` 与 `rolesEnabled` 支持实时切换；其他配置修改后需要重新加载插件。请保留 `ai-agent-engine` 配置项的标识。

#### 自定义子智能体角色（设置页 + 文件）

可用**本机用户态 overlay**覆盖或追加工程队友在 Lead 协作策略中的职责说明与技能映射，无需改插件包或源码。

##### 可视化设置（推荐）

1. 打开宿主**设置**。
2. 进入本插件的 **`settings.section`「工程角色」**（locales：`roles.section`）。
3. 编辑内置或自定义角色的 **技能（`skill`）** 与 **职责（`responsibility`）**；可添加自定义角色 id；点击「保存覆盖」。
4. 「恢复默认」会 **unlink/删除** 同一 overlay 文件，新队友回到出厂种子。

Host 通过 `aeRoles`（`getCatalog` / `getOverlay` / `putOverlay` / `restoreDefaults`）读写；非法 payload **拒绝写入**（fail-closed）。写成功后发出 `ai-agent-engine/roles-updated`，重建 Lead 策略。**已 spawn / 冷恢复队友不重绑**；仅**新 spawn**使用合并结果。

##### 文件与 Config（仍可用）

- **默认路径**：`$DSH_HOME/ai-agent-engine/roles.json`（`$DSH_HOME` 为 Harness 用户数据根）
- **可选路径**：配置 `rolesPath` 为绝对路径（修改后需重新加载插件；`rolesEnabled` 为 volatile，可实时开关）
- **不要**把角色文件放进工作区 `.ai-agent-engine/`（该目录仍仅用于删除记录 journal）
- **可覆盖字段**：仅 `skill`、`responsibility`（按角色 `id`）。团队面板中文职称仍由 locales 决定，**不**改 UI 展示名
- **合并**：按 `id` 深合并到包内 builtin 种子；只覆盖文件中出现的字段；未知 `id` 追加。插件升级后，内置文案随包刷新，未在 overlay 中出现的字段跟随新种子
- **多对话**：无 overlay（或 `rolesEnabled=false`）时，多对话并行/交替调用内置 frontend/backend 等角色**应保持**默认种子、彼此不串（二期相关测侧进行中，不宣称已冒烟通过）

示例（与设置页保存格式一致）：

```json
{
  "version": 1,
  "roles": [
    { "id": "frontend", "responsibility": "Custom frontend brief." },
    { "id": "security", "skill": "ae-grill", "responsibility": "Threat model reviews." }
  ]
}
```

`version` 必须为 `1`。JSON 损坏、非法条目或无效路径时读侧记日志并回退内置表，**不**拖垮插件启动；写侧校验失败则不落盘。overlay **不会**打进安装包或你的 git 仓库，也**不会**污染 deletions journal。

### 仓库结构

```text
src/              插件源码
lib/              随版本提供的构建产物
skills/           七项工程技能及参考资源
prompts/          协作提示词
tests/            单元测试
tools/            构建、校验与集成测试工具
compat/harness/   验收记录、上游许可与历史兼容资料
```

`0.1.x` 的历史宿主补丁仅用于复现，不包含在当前安装包中。版本变化见 [CHANGELOG.md](CHANGELOG.md)。

## 问题反馈

请通过 [GitHub Issues](https://github.com/YaoGUanquan/ai-agent-engine-deepseek/issues)反馈问题，并提供插件版本、Harness 版本、操作系统、复现步骤和预期结果。日志或截图中请隐藏密钥与私人对话。

## 许可证与致谢

本项目使用 **GPL-2.0-only**，完整许可证见 [LICENSE](LICENSE)。

工程技能直接参考并适配自 [AI Agent Engine for Codex](https://github.com/YaoGUanquan/codex-ai-agent-engine)。运行时基于 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 的原生插件和团队协作能力。

详细来源、固定参考版本和第三方许可证见 [NOTICE.md](NOTICE.md)。本项目为社区适配项目。
