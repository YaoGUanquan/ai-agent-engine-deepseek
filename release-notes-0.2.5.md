# v0.2.5 — 设置页一键更新，并对未来 Harness 版本放开加载

## 安装

```text
github:YaoGUanquan/ai-agent-engine-deepseek#v0.2.5
```

或下载本页附件 `ai-agent-engine-deepseek-0.2.5.tgz`，在插件管理器里填绝对路径安装。
附件说明里的 `SHA256SUMS.txt` 用于校验下载包。

## 这次新增

**设置 → 插件更新**：两个按钮，不必再卸载重装。

- **检查更新**：读取官方 GitHub Release，显示已安装版本、最新版本、当前 Harness 版本与兼容状态。
- **立即更新**：下载 `.tgz`，用 `SHA256SUMS.txt` 校验后就地交给宿主插件管理器安装；安装完成提示重启 Desktop。
- 判定与拦截：已是最新只提示；宿主无插件管理器则禁用按钮；新版本拒绝当前 Harness 时报告不兼容；校验不符不安装。
- 以 `link:` 或本地 git 检出方式安装时走另一条通道：`git fetch` + `merge --ff-only`，`package.json`／lock 变化时补装依赖并重建；有本地改动时拒绝执行。

**对未来 Harness 版本放开加载**：

- `engines.dsh` 改为只有下限 `>=0.2.1-rc.5`。宿主升到 `0.2.2`、`1.0` 等更高版本时，不再因为版本号被判不兼容而拒绝加载。
- 新增 `dsh.compatibility.verifiedThrough: "0.2.1-rc.5"`：超出实测基线只在设置页标注「未经实测」，不阻止加载。
- 运行依赖与 peer 仍固定在 `>=0.2.1-rc.5 <0.2.2-0`，避免插件被装到未验证的宿主内部库上。
- 基础加载协议、RPC 或模块导出真发生破坏性变化时，「插件状态」会指出具体不可用的模块，而不是整个插件消失。

## 新增配置

`updateFeed`：留空走官方 GitHub Release 渠道；可填镜像地址，或 `file:` 本地文档（离线/内网分发）。

## 验证

- `npm run check:all`：类型检查、内容校验、56 项单测、构建全部通过。
- 真实渠道验证：读取 `releases/latest` 得到 `v0.2.4`（附件 `ai-agent-engine-deepseek-0.2.4.tgz`），下载后 SHA-256 与 `SHA256SUMS.txt` 一致。
- 未验证：安装后重启 Desktop 的实际加载与前端渲染。

## 回退

在插件页卸载后安装 `#v0.2.4`（或更早）即可。回退只切换插件版本，不会恢复已删除的对话。
