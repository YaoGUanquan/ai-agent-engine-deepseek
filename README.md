# AI Agent Engine for DeepSeek Harness

面向 DeepSeek Harness 的原生工程插件，包含按需多角色协作，以及对话右键永久删除。

## 工程模式

安装后，在 Harness 的 Preset 选择器中选择 **AI Agent Engine**。插件不会替换已有默认模式。

工程 Preset 以当前官方 Standard Preset 的组合为基础，保留其文件、命令、权限和提问能力，再加入工程协作策略；需要宿主提供 Standard Preset。

主控复用官方 Agent Teams 创建具名队友、发送消息、维护依赖任务和等待结果。简单任务由主控完成，独立任务并行执行；七项专业能力覆盖需求、前端、后端、单测、集成测试、浏览器用例和 E2E 工程。普通模式下也可点名单项 `ae-*` 技能。

每项技能均包含完整资源和队友任务约定。主控负责限定文件责任、复用同职责队友、处理阻塞、整合结果和验证。模型与权限沿用当前会话；文件范围只是协作提示，不是锁。

角色设计参考了 Grok Bot 市场公开模板，来源及适配范围见 [NOTICE.md](NOTICE.md)。本插件没有引入模板中的外部任务板、自动 watcher、远程代理、自动合并或部署。

## 对话管理

对话行右键或打开“更多”，选择“永久删除”。确认框先展示关联队友数量和运行状态。确认后停止任务，等待写入释放，再删除主对话及其所属子会话；独立分叉和工程文件保留。

永久删除依赖 [Harness 宿主补丁](compat/harness/README.md)。未安装补丁时工程能力仍可使用；删除预览失败会显示不可用状态，不能假装删除成功。未经验证的同版本安装包也不能视为兼容。

宿主保留不含正文和标题的删除身份记录及稳定锁文件，用于阻止恢复和重试清理。永久删除处理 Harness 主存储及其派生索引，不会清除独立分叉中已经复制的历史或外部备份。

## 开发与安装

要求 Node.js 24+；首版固定支持 Harness `0.2.1-rc.3`。

```powershell
npm ci
npm run check:all
npm pack
```

使用 Harness 插件管理器安装生成的 `ai-agent-engine-deepseek-0.1.0.tgz`。在 CLI 的独立测试 profile 中，也可使用官方安装入口：

```powershell
dsh plugin --profile web add "<absolute-path-to-tarball>"
```

Desktop 启动过一次、完成 profile 初始化后，完全退出应用，使用安装目录自带的 CLI：

```powershell
& "<Desktop-install-directory>\resources\runtime\cli\bin\dsh.cmd" plugin --profile desktop add "<absolute-path-to-tarball>"
```

安装后重新打开 Desktop，在 Preset 选择器中选择 **AI Agent Engine**。这条命令复用 Desktop 已有的数据位置，不设置新的 `DSH_HOME`。

仓库不跟踪 `lib/`，因此从 Git 克隆后先执行上述构建和打包步骤，再安装本地 `.tgz`；本版没有提供 Git 安装时的自动构建脚本。仅安装插件不会给宿主增加永久删除接口，完整右键删除功能仍需匹配的宿主源码补丁。

桌面版也可使用自身插件管理器维护其 profile。不要手工改 `app.asar` 或覆盖应用依赖。源码补丁的应用、构建、隔离验证及安装边界见兼容性说明。

`cordis.patch.yml` 中的插件配置：

| 字段 | 默认 | 含义 |
| --- | --- | --- |
| `engineering` | `true` | 提供专业技能及可选工程 Preset |
| `conversationManagement` | `true` | 注册永久删除菜单和确认框 |
| `maxMembers` | `8` | 本插件创建官方 Team 服务时的队友上限 |

已有官方 Team 服务时复用其配置。插件不创建自己的数据根，新增持久数据使用宿主已配置的存储位置。

`conversationManagement` 是宿主实时设置；`engineering` 和 `maxMembers` 通过插件配置修改后重新加载。保留 bundle 中的 `ai-agent-engine` entry id，浏览器通过官方设置镜像定位其开关。已有官方 Team bundle 时，工程模式复用其工具和人数限制。

本地验证结果与剩余边界见 [验收记录](compat/harness/VALIDATION.md)。真实模型的角色选择、当前 Desktop 安装包兼容性和生产发布尚未验收。

## 许可证

插件及适配技能使用 GPL-2.0-only。官方 Harness 补丁中的上游代码遵循 MIT，保留相应许可证。详见 [LICENSE](LICENSE) 和 [NOTICE.md](NOTICE.md)。
