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

## 能力增强 / 破甲（Phase-1）设计参考

一期「能力增强 / 破甲」实现借鉴了下列公开仓库的**产品概念与设置交互**（总开关旁路、可选策略默认关、提示词覆盖与角色表分真源），**未**复制第三方破甲提示词正文、加密提示词库、宿主 Apply/Clean/Drill 实现或公网攻击载荷：

- [YuJunZhiXue/dsh-purge](https://github.com/YuJunZhiXue/dsh-purge)（Apache-2.0）：概念对照与反例（本插件**不做**宿主包补丁 / Apply）。按 Apache-2.0 署名要求致谢。
- [L-Shy-P/dsh-preset-manager](https://github.com/L-Shy-P/dsh-preset-manager)（MIT）：设置「总开关 + 开启后展开编辑」交互。
- [GTC2080/dsh-APEX_Plugin](https://github.com/GTC2080/dsh-APEX_Plugin)（MIT）：可选任务增强默认关、可控协作/验证指引思路；**未**移植独立 APEX 模式、Teams 大改或浏览器验证套件（该仓已封存于 Harness 0.2.0-rc.2）。
- [kejixiaoliang/awesome-dsh-plugins](https://github.com/kejixiaoliang/awesome-dsh-plugins)：仅作生态目录索引，无代码合并。
- [Xilin3/dsh-prompt-persona](https://github.com/Xilin3/dsh-prompt-persona)（MIT）：关闭=旁路、覆盖层与其他 scope 隔离的交互参考。

本插件破甲路径仅为 `$DSH_HOME/ai-agent-engine/prompt-override.md`（或 `jailbreakPromptPath`）经 `systemPrompt.section` 注入；与 `roles.json` 分真源。
