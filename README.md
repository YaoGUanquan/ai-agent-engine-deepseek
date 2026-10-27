# AI Agent Engine for DeepSeek Harness

让 DeepSeek Harness 按需组织前端、后端和测试工程师协作，并支持右键永久删除对话。

本项目参考 [AI Agent Engine for Codex](https://github.com/YaoGUanquan/codex-ai-agent-engine)，将其七项工程技能适配为 DeepSeek Harness 原生插件。

[功能介绍](#功能介绍) · [安装](#安装) · [快速使用](#快速使用) · [常见问题](#常见问题) · [开发](#开发) · [更新记录](CHANGELOG.md)

## 功能介绍

| 功能 | 可以做什么 |
| --- | --- |
| 多角色协作 | 按任务需要创建前端、后端、需求分析和测试队友，支持并行工作、消息沟通和共享任务 |
| 专业角色显示 | 团队面板和任务负责人显示“前端工程师”“后端工程师”等职责 |
| 七项工程技能 | 覆盖需求澄清、前后端开发、单元测试、集成测试和浏览器测试 |
| 永久删除对话 | 从对话菜单删除主对话及其所属队友记录，同时清理对应的缓存和搜索索引 |

简单任务可以由当前助手直接完成；需要分工时再组队。安装后可继续使用标准模式，也可以选择 **AI Agent Engine** 模式。

## 安装

### 环境要求

| 项目 | 当前支持范围 |
| --- | --- |
| 插件版本 | `0.2.0` |
| DeepSeek Harness | `0.2.1-rc.3` |
| Desktop 实机验证 | Windows 原版 Desktop |

其他版本和平台尚未完成实机验证。

### 在 Desktop 中安装

1. 打开 DeepSeek Harness，进入 **插件**，点击 **添加插件**。
2. 在“包名或地址”中填写以下地址，点击 **安装**。
3. 安装完成后点击 **立即启用**。
4. 完全退出并重新打开 Desktop。

```text
github:YaoGUanquan/ai-agent-engine-deepseek#v0.2.0
```

安装包已包含构建产物。普通用户无需安装 Node.js、执行脚本或构建源码，也无需替换 Desktop。

已经安装旧版时，先在插件页卸载旧版，再按上述步骤安装。卸载插件不会替你删除已有对话。

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

### 会改变默认模式或数据目录吗？

已有默认模式保持不变。插件沿用 Harness 已配置的会话和数据目录。

### 当前版本验证过哪些功能？

已通过类型检查、19 项单元测试和 6 项隔离集成测试。Windows 原版 Desktop 中还验证了 GitHub 安装、真实模型创建前后端队友、角色显示，以及删除后刷新和重启不再出现。

详细环境、检查结果和未验证范围见[验收记录](compat/harness/VALIDATION.md)。

## 开发

以下步骤仅面向修改源码的开发者，普通安装无需执行。

要求 Node.js 24+：

```bash
npm ci
npm run check:all
npm pack
```

构建后可在 Desktop 插件管理器中安装生成的 `ai-agent-engine-deepseek-0.2.0.tgz`。提交源码变更时应同步构建产物 `lib/`，保证 Git 地址安装可直接使用。

使用未修改的官方 Harness 源码运行集成验收：

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

已启用官方团队插件时，会复用它的服务和人数限制。`conversationManagement` 支持实时切换；其他配置修改后需要重新加载插件。请保留 `ai-agent-engine` 配置项的标识。

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
