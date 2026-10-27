# AI Agent Engine for DeepSeek Harness

面向 DeepSeek Harness 的原生工程插件，包含按需多角色协作，以及对话右键永久删除。当前版本 **0.2.0**。

## 安装

在正常安装的 Desktop 中打开插件管理器，填写：

```text
github:YaoGUanquan/ai-agent-engine-deepseek#v0.2.0
```

安装并启用后重新启动一次 Desktop。仓库随版本提供 `lib/` 构建产物，安装者无需执行构建或安装脚本，也无需替换 Desktop 或安装宿主补丁。首次启用前已经打开的会话需要这次重启，以便插件接管其正常生命周期。

当前适配 Harness `0.2.1-rc.3` 的官方 JSONL 存储和 SQLite 搜索。插件沿用宿主已经配置的数据目录，不另建用户数据根。

## 工程模式

安装后，标准模式即可按需使用工程协作，也可在 Preset 选择器中选择 **AI Agent Engine**。插件不会替换已有默认模式。

工程 Preset 以当前官方 Standard Preset 的组合为基础，保留其文件、命令、权限和提问能力，再加入工程协作策略；需要宿主提供 Standard Preset。

主控复用官方 Agent Teams 创建具名队友、发送消息、维护依赖任务和等待结果。简单任务由主控完成，独立任务并行执行；七项专业能力覆盖需求、前端、后端、单测、集成测试、浏览器用例和 E2E 工程。普通模式下也可点名单项 `ae-*` 技能。

每项技能均包含完整资源和队友任务约定。主控负责限定文件责任、复用同职责队友、处理阻塞、整合结果和验证。模型与权限沿用当前会话；文件范围只是协作提示，不是锁。

团队面板按职责显示工程负责人、需求分析师、前端工程师、后端工程师及各类测试工程师，任务负责人使用相同名称。同职责的多个队友以数字区分；消息和任务工具继续使用官方英文标识。旧会话中未标注职责的自定义名称保留原样，不根据模糊名称猜测角色。

角色设计参考了 Grok Bot 市场公开模板，来源及适配范围见 [NOTICE.md](NOTICE.md)。本插件没有引入模板中的外部任务板、自动 watcher、远程代理、自动合并或部署。

## 对话管理

对话行右键或打开“更多”，选择“永久删除”。确认框先展示关联队友数量和运行状态。确认后停止任务，等待写入释放，再删除主对话及其所属子会话；独立分叉和工程文件保留。

永久删除由插件自己的接口提供，只允许宿主所有者操作。插件记录正常创建或恢复会话时返回的生命周期句柄，删除时用原句柄停止任务并释放写入，再清理历史、工作区引用、投影缓存和搜索索引。整个过程不修改宿主安装文件。

插件在已配置的会话存储目录内保留不含正文和标题的删除身份记录及稳定锁文件，用于阻止恢复和重试清理。未完成的清理在下次启动时继续。永久删除处理 Harness 主存储及其派生索引，不会清除独立分叉中已经复制的历史或外部备份。

## 开发与验证

要求 Node.js 24+；首版固定支持 Harness `0.2.1-rc.3`。

插件结构与资源释放遵循[官方开发基础](https://deepseek-harness.github.io/deepseek-harness/develop/basic/)及[生命周期文档](https://deepseek-harness.github.io/deepseek-harness/develop/cordis-tutorial/02-lifecycle-and-effects)。异步删除排空和接口恢复在同一个 disposer 内依次执行。

```powershell
npm ci
npm run check:all
npm pack
```

使用 Harness 插件管理器安装生成的 `ai-agent-engine-deepseek-0.2.0.tgz`。在 CLI 的独立测试 profile 中，也可使用官方安装入口：

```powershell
dsh plugin --profile web add "<absolute-path-to-tarball>"
```

源码修改后需先构建并同步 `lib/` 产物。版本号同时记录在 `package.json`、锁文件、更新记录和对应的 Git 标签中。

隔离验收使用未应用补丁的官方 `dsh-v0.2.1-rc.3` 源码及其构建产物：

```powershell
node tools/harness-integration.mjs "<official-harness-source-directory>"
```

该验收会检查宿主没有旧版删除扩展，并只使用临时配置、合成对话和脚本化模型响应。历史 0.1.x 的源码补丁保留用于复现，不再打入插件安装包。

`cordis.patch.yml` 中的插件配置：

| 字段 | 默认 | 含义 |
| --- | --- | --- |
| `engineering` | `true` | 提供专业技能及可选工程 Preset |
| `conversationManagement` | `true` | 注册永久删除菜单和确认框 |
| `maxMembers` | `8` | 本插件创建官方 Team 服务时的队友上限 |

已有官方 Team 服务时复用其配置。插件不创建自己的数据根，新增持久数据使用宿主已配置的存储位置。

`conversationManagement` 是宿主实时设置；`engineering` 和 `maxMembers` 通过插件配置修改后重新加载。保留 bundle 中的 `ai-agent-engine` entry id，浏览器通过官方设置镜像定位其开关。已有官方 Team bundle 时，工程模式复用其工具和人数限制。

本地验证结果与剩余边界见 [验收记录](compat/harness/VALIDATION.md)。真实模型的角色选择、各平台 Desktop 实装和远端发布分别验收。

## 许可证

插件及适配技能使用 GPL-2.0-only。官方 Harness 补丁中的上游代码遵循 MIT，保留相应许可证。详见 [LICENSE](LICENSE) 和 [NOTICE.md](NOTICE.md)。
