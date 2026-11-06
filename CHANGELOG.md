# Changelog

## 0.2.5 - 2026-11-06

- 设置页新增 `settings.section`「插件更新」：显示已安装版本、发布版本、Harness 版本与兼容状态，提供「检查更新」「立即更新」两个按钮。
- 更新由宿主 `pluginManager` 执行：下载 Release 的 `.tgz` 并用 `SHA256SUMS.txt` 校验后就地安装，无需先卸载；失败时报告原因且不改动已有安装，成功后提示重启 Desktop。
- `link:`／本地 git 检出安装走另一条通道：`git fetch` + `merge --ff-only`，`package.json`/lock 变化时补装依赖并重建，有本地改动时拒绝执行。
- 加载门禁改为只声明下限 `engines.dsh: ">=0.2.1-rc.5"`：Harness 升到 `0.2.2`、`1.0` 等更高版本时不再被判不兼容而拒绝加载。
- 新增 `dsh.compatibility.verifiedThrough: "0.2.1-rc.5"`：超出实测基线只在设置页标注「未经实测」，不阻止加载；运行依赖与 peer 仍固定在 `>=0.2.1-rc.5 <0.2.2-0`。
- 新增 `aeUpdate` host RPC（`getState` / `check` / `apply`）与 `update` 模块状态行，模块与能力表同步扩展。
- 新增配置项 `updateFeed`：留空走官方 GitHub Release 渠道，可填镜像或 `file:` 本地文档。

## 0.2.4 - 2026-10-30

- Harness 兼容范围改为 `>=0.2.1-rc.5 <0.2.2-0`，自动放行同系列后续 RC 与 `0.2.1` 正式版；开发依赖仍固定 rc.5。
- 工程协作、角色、永久删除及前端展示独立初始化，接口或加载失败时清理对应模块，保留其他功能；设置页新增中英文插件状态。
- RPC 包保持一次注册，新增仅限宿主所有者的只读 `aeCompatibility/getStatus`，返回各模块状态和不含路径的原因码。
- 删除前检查宿主方法、缓存与工作区接口及现有搜索索引结构；不兼容时禁止删除。
- 后续版本的门禁放行测试不代表已在未来宿主上完成运行验证。

- 将当前源码适配目标更新为 Harness `0.2.1-rc.5`，同步全部 DSH 运行、开发及 peer 依赖，避免旧版预设依赖遮蔽宿主内置预设而导致插件启动失败。
- 增加官方宿主兼容性检查回归，覆盖 engines 与 peer 回退判断，且不使用版本豁免。

## 0.2.3 - 2026-10-30

- 支持通过 `$DSH_HOME/ai-agent-engine/roles.json` 覆盖/追加工程队友角色（按 id 深合并；损坏或非法文件启动时回退内置角色，不拖垮插件）。
- 新增配置项 `rolesEnabled`（volatile，默认 true）与可选 `rolesPath`；恢复默认即删除/清空 roles.json。
- Lead 协作策略按合并后的角色表渲染；已创建队友不受影响，新 spawn 才读到合并结果。
- 单测覆盖内置种子、覆盖、追加、禁用、损坏隔离，以及并行 resolve/多次内置角色策略构建的无串扰。
- 设置页：插件 `settings.section`「工程角色」可视化编辑同一 `roles.json`（`skill`/`responsibility`、自定义 id）；Host `aeRoles` get/put/restore；恢复默认 unlink overlay；写后 `roles-updated` 重建 Lead 策略。
- 文档：README 对齐 tip `92a3189` / #7——说明设置入口、文件路径与 Config、已 spawn 不重绑；二期多对话/设置持久化测侧进行中不宣称已冒烟通过。

## 0.2.2 - 2026-10-28

- 启动隔离：损坏的删除记录（`.ai-agent-engine/deletions/*.json`）改名隔离为 `*.json.corrupt` 并打日志，不再抛错拖垮整插件。
- 非 JSONL 会话持久化时降级关闭永久删除（RPC 返回 `delete-unsupported`），工程技能与其余能力照常加载。
- 文档：安装/回退地址改为 `#v0.2.2`；README 补充上述行为说明。

## 0.2.1 - 2026-10-27

- 提供正式 GitHub Release、可下载的插件安装包及 SHA-256 校验文件。
- 补充第三方插件的手动升级、版本固定与回退说明。
- 重写面向用户的安装与使用文档，明确直接参考 Codex 版工程技能。
- 合并重复的许可证入口，将原有完整 GPL 正文保留在 LICENSE，许可证不变。
- 插件运行逻辑与 0.2.0 相同，仍适配 Harness 0.2.1-rc.3。

## 0.2.0 - 2026-10-27

- 通过插件自己的接口在原版 Harness 中永久删除对话，不再依赖宿主源码补丁。
- 删除主对话及其所属队友记录，保留独立分叉和项目文件，清理缓存与搜索索引。
- 标准模式按需使用官方 Agent Teams，并按专业职责显示团队成员和任务负责人。
- 随版本提交构建产物，支持通过 Desktop 插件管理器安装 GitHub 地址。

## 0.1.0

- 首版工程角色、官方 Agent Teams 封装，以及依赖宿主兼容补丁的对话删除界面。
