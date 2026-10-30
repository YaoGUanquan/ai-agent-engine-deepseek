# 来源与第三方声明

本项目以 GPL-2.0-only 分发，完整许可证见 [LICENSE](LICENSE)。

## 直接参考项目

本项目基于 [AI Agent Engine for Codex](https://github.com/YaoGUanquan/codex-ai-agent-engine)
的工程技能设计，适配 DeepSeek Harness 的原生插件和 Agent Teams。
七项工程技能参考并改编自该项目的 `0.5.0` 版本，固定参考提交为
`268b633edb17aa3770a7964a68afb1a559058bdd`。

Codex 版项目将 [jiangqiang1996/ai-agent-engine](https://gitee.com/jiangqiang1996/ai-agent-engine)
列为能力划分的灵感来源，并声明其指令为独立实现。此处保留该历史来源，
不将它描述为本插件的直接适配项目。

## DeepSeek Harness

插件运行时基于 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)
的原生插件、Agent Teams 和持久化能力。JSONL 目录编码参考官方提交
`1f81c047fc48fa190a683e469daa699857e9afe8`，上游版权归 DeepSeek，
许可证为 MIT，全文见 [上游许可证](compat/harness/LICENSE.upstream)。

从 `0.2.4` 起，浏览器产物还包含官方
`@deepseek-ai/dsh-experimental-client-ui-agent-team` 的 MIT 许可团队界面工厂，
构建基线为 `dsh-v0.2.1-rc.5`；在插件自己的可释放模块范围内延迟挂载，
以隔离初始化失败。上游版权和许可同上。

`compat/harness` 保留了 `0.1.x` 使用的历史兼容补丁，其中包含 MIT
许可的上游代码上下文。当前插件安装包不包含该补丁，
无需修改用户的 Desktop。

## Zod

浏览器构建产物包含 MIT 许可的 Zod，全文见 [Zod 许可证](licenses/zod.txt)。

## 补充设计参考

工程角色指令由本项目编写。2026-10-27 开发时也查阅过以下公开的
Grok Bot 市场介绍与模板，作为任务分工和协作约定的补充参考：

- Engineering Lead: https://x.ai/bot/marketplace/bots/engineering-lead
- Lingxi's Engineer Bot: https://x.ai/bot/marketplace/bots/engineer-bot
- Nightly Audit Engineer: https://x.ai/bot/marketplace/bots/nightly-audit-engineer
- Projects Manager: https://x.ai/bot/marketplace/bots/projects-manager

采用的设计要点包括任务归属、限定委派范围、按证据验收、复用队友和根因调查。
没有逐字复制这些模板，也没有引入其外部任务板、定时任务、云端代理、
自动合并或自动部署机制。

本项目不代表 DeepSeek 或 xAI，也不表示获得其官方背书。
