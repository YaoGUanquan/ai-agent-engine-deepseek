# 本地验收记录

日期：2026-10-27。环境：Windows、Node.js 24.18.0。
基线为 `dsh-v0.2.1-rc.3` / `1f81c047fc48fa190a683e469daa699857e9afe8`，
叠加本目录补丁；补丁及原文件校验值见 `manifest.json`。

## 已执行的检查

| 层次 | 检查 | 结果 |
| --- | --- | --- |
| 插件静态与构建 | `npm run check:all` | 双面类型检查、七技能资源、公开内容与编码检查通过；10 项测试通过；构建通过 |
| 宿主源码 | `npm run build:artifacts`，随后 `npm run build:check` | 7 个产物门禁和 2 个聚合检查通过 |
| 宿主聚焦回归 | 以下 8 个测试文件 | 482 项通过 |
| 隔离运行时与浏览器 | `node tools/harness-integration.mjs "<harness-source>"` | 5 项通过，使用官方 profile、Agent Teams、Remote 和 Chromium |
| 补丁交付 | `npm run patch:check`，再应用到独立基线副本 | 25 个补丁目标与已验收源码逐字节一致 |

宿主聚焦回归文件：

```text
packages/core/agent-loop/tests/inbox.spec.ts
packages/api/session-controller/tests/deletion.spec.ts
packages/session-query/session-query-sqlite/tests/sqlite.spec.ts
packages/session/session-persistence-jsonl/tests/jsonl.spec.ts
packages/session/session-persistence-jsonl/tests/deletion.spec.ts
packages/experimental/agent-team/tests/team.spec.ts
packages/client/ui-workspace/tests/rows.client.spec.tsx
packages/client/ui-workspace/tests/workspaces-service.client.spec.ts
```

## 验证范围

隔离 profile 的实际安装组合验证了默认 Standard Preset 保持不变、工程 Preset
可选、七技能可用、工程模块关闭，以及复用已安装官方 Team bundle 的人数限制。
对话模块通过官方实时设置开关控制菜单，工程模块仍可使用。

浏览器使用脚本化模型响应驱动真实运行时：简单任务不创建队友；两个队友同时运行；
官方任务板拒绝认领依赖未完成的任务，前置完成后允许继续。
这验证了运行时和封装，没有证明真实模型会在任意任务中正确选择角色。

浏览器验证了当前打开、归档及包含运行队友的对话删除，右键不改变当前选择，
取消后保留数据，删除后刷新不再出现，以及第二客户端同步移除。
独立分叉实际继承了主对话历史，删除后仍可通过历史读取接口读取。
确认框已检查桌面和 390px 窄屏布局；截图保存在本地 `output/playwright/`。

源码回归覆盖范围变化、伪造范围、权限拒绝、不支持的存储、重复提交、
投递与创建阻断、停止失败、停止超时、锁冲突、部分清理失败与重试。
持久化重启拒绝复活已删身份；SQLite 在搜索禁用时也会恢复已提交删除，
且清理不读取无关会话正文。队友失败、中断、恢复和 fork 由官方 Team 回归覆盖。

## 未通过或未执行

扩展工作区与缓存回归曾有 3 项在 Windows 创建 symlink 时因 `EPERM` 失败。
没有修改断言或放宽权限来掩盖这些失败；本记录不代表官方全量测试通过。

`npm audit --omit=dev` 报告 33 项高危、0 项严重告警，来自当前固定依赖链；
完整开发依赖审计还包含严重告警。未执行破坏固定版本约束的自动升级。

未调用真实付费模型；真实模型的角色选择与工具调用仍待联调。
未验收本机另一构建提交的 Desktop 安装包，未生成或替换正式 Desktop 安装。
未删除真实历史，未改变用户现有 profile、默认 Preset 或 D 盘存储配置。
验收不包含 Git 推送或部署；Git 交付状态以仓库当前提交为准，不作生产发布通过的结论。
