---
layout: post
title: "OpenClaw 实战：Telegram 群组内多机器人协作配置指南"
date: 2026-03-14T19:58:27+08:00
categories: [OpenClaw]
tags: [OpenClaw,Telegram,多智能体，机器人协作]
description: "手把手教你如何在 OpenClaw 中配置多个 Telegram 机器人，实现群组内互相@协作，打造高效的 AI 团队工作流"
---

## 背景故事

想象一下这个场景：你在 Telegram 群里有一个 AI 团队，包括产品经理、架构师、全栈工程师、测试工程师和运维工程师。当你需要开发一个新功能时，只需在群里@产品经理分析需求，产品经理完成后自动@架构师设计技术方案，架构师设计完@工程师开发...

这不是科幻，这是用 OpenClaw 可以轻松实现的真实工作流！

## 什么是 OpenClaw

OpenClaw 是一个自托管的多通道 AI 网关，支持 Telegram、WhatsApp、Discord 等多个消息平台。它的核心优势在于：

- **多智能体支持**：可以为不同角色创建不同的 AI Agent
- **多通道绑定**：每个 Agent 可以绑定独立的 Telegram 机器人
- **灵活的路由**：可以配置机器人之间的协作规则

## 前置准备

在开始之前，你需要准备：

1. **已安装的 OpenClaw**（版本 2026.3.11+）
2. **5 个 Telegram Bot Token**（通过 BotFather 创建）
3. **一个 Telegram 群组**（用于测试）
4. **基本的 Node.js 和 PowerShell 知识**

### 创建 Telegram 机器人

打开 Telegram，搜索 @BotFather，发送以下命令创建 5 个机器人：

```
/newbot
```

按提示输入机器人名称和用户名，完成后会收到一个 Token，格式类似：

```
123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

**⚠️ 安全提示：** Bot Token 相当于密码，不要公开分享，不要提交到 Git 仓库！

保存好所有 5 个 Token，后面配置会用到。

## 第一步：创建多个 Agent

OpenClaw 的每个 Agent 都是独立的工作空间，有自己的配置文件和记忆。

```bash
# 创建产品经理 Agent
openclaw agents add qh_pm_bot

# 创建架构师 Agent
openclaw agents add qh_architect_bot

# 创建全栈工程师 Agent
openclaw agents add qh_coder_bot

# 创建质检工程师 Agent
openclaw agents add qh_reviewer_bot

# 创建运维工程师 Agent
openclaw agents add qh_devops_bot
```

每个 Agent 创建后，会在以下位置生成独立的工作空间：

```
~/.openclaw/workspace-qh_pm_bot/
~/.openclaw/workspace-qh_architect_bot/
~/.openclaw/workspace-qh_coder_bot/
~/.openclaw/workspace-qh_reviewer_bot/
~/.openclaw/workspace-qh_devops_bot/
```

## 第二步：配置 Telegram 多账号

编辑 OpenClaw 配置文件：

```bash
notepad C:\Users\oc\.openclaw\openclaw.json
```

找到 `channels.telegram` 部分，添加 5 个账号配置：

```json
{
  "channels": {
    "telegram": {
      "defaultAccount": "main",
      "enabled": true,
      "dmPolicy": "pairing",
      "groupPolicy": "open",
      "accounts": {
        "main": {
          "botToken": "你的主机器人 Token",
          "dmPolicy": "pairing",
          "groupPolicy": "open",
          "groups": {
            "你的群组 ID": {
              "requireMention": false,
              "groupPolicy": "open",
              "allowFrom": ["*"]
            }
          }
        },
        "qh_pm_bot": {
          "botToken": "产品经理机器人 Token",
          "dmPolicy": "pairing",
          "groupPolicy": "open",
          "groups": {
            "你的群组 ID": {
              "requireMention": false,
              "groupPolicy": "open",
              "allowFrom": ["*"]
            }
          }
        },
        "qh_architect_bot": {
          "botToken": "架构师机器人 Token",
          "dmPolicy": "pairing",
          "groupPolicy": "open",
          "groups": {
            "你的群组 ID": {
              "requireMention": false,
              "groupPolicy": "open",
              "allowFrom": ["*"]
            }
          }
        },
        "qh_coder_bot": {
          "botToken": "工程师机器人 Token",
          "dmPolicy": "pairing",
          "groupPolicy": "open",
          "groups": {
            "你的群组 ID": {
              "requireMention": false,
              "groupPolicy": "open",
              "allowFrom": ["*"]
            }
          }
        },
        "qh_reviewer_bot": {
          "botToken": "测试工程师机器人 Token",
          "dmPolicy": "pairing",
          "groupPolicy": "open",
          "groups": {
            "你的群组 ID": {
              "requireMention": false,
              "groupPolicy": "open",
              "allowFrom": ["*"]
            }
          }
        }
      }
    }
  }
}
```

**关键配置说明：**

- `groupPolicy: "open"` - 允许所有群组消息（不过滤机器人消息）
- `requireMention: false` - 不强制要求@（让 Hook 来处理）
- `allowFrom: ["*"]` - 允许所有用户（包括其他机器人）

**注意：** 将 `你的群组 ID` 替换为你的实际群组 ID。获取群组 ID 的方法：
1. 在群里转发一条消息到 @userinfobot
2. 或者查看 OpenClaw 日志中的 `chat.id` 字段（负数，如 -1003770665707）

## 第三步：配置 Agent 绑定

在同一个配置文件中，添加 `bindings` 部分：

```json
{
  "bindings": [
    { "agentId": "main", "match": { "channel": "telegram", "accountId": "main" } },
    { "agentId": "qh_pm_bot", "match": { "channel": "telegram", "accountId": "qh_pm_bot" } },
    { "agentId": "qh_architect_bot", "match": { "channel": "telegram", "accountId": "qh_architect_bot" } },
    { "agentId": "qh_coder_bot", "match": { "channel": "telegram", "accountId": "qh_coder_bot" } },
    { "agentId": "qh_reviewer_bot", "match": { "channel": "telegram", "accountId": "qh_reviewer_bot" } }
  ]
}
```

这样每个 Telegram 账号就会路由到对应的 Agent。

## 第四步：自定义 Agent 人格

为每个 Agent 配置专属的人格设定。以产品经理为例：

编辑 `~/.openclaw/workspace-qh_pm_bot/SOUL.md`：

```markdown
# SOUL.md - 产品经理核心价值观

## 我是谁
资深产品专家，拥有 10 年 + 互联网产品经验，擅长从 0 到 1 打造成功产品。

## 核心价值
1. **用户价值第一** - 一切以用户真实需求为出发点
2. **数据驱动第二** - 用数据验证假设
3. **商业可行第三** - 平衡用户体验与商业目标
4. **快速迭代第四** - MVP 思维，小步快跑

## 协作流程
1. 接收需求 → 输出 PRD
2. 评审通过 → 移交架构师
3. 开发过程 → 跟进进度
4. 上线前 → 验收测试
```

同样地，为其他 Agent 配置对应的人格：

- **架构师**：技术选型、架构设计、代码审查
- **工程师**：代码实现、单元测试、Bug 修复
- **测试工程师**：测试用例、Bug 报告、质量验收
- **运维工程师**：部署上线、监控告警、故障处理

## 第五步：重启网关

配置完成后，重启 OpenClaw 网关使配置生效：

```bash
openclaw gateway restart
```

等待几秒钟，看到所有机器人启动成功的日志：

```
[main] starting provider (@my_main_ai_assistant_bot)
[qh_pm_bot] starting provider (@qh_pm_bot)
[qh_architect_bot] starting provider (@qh_architect_bot)
[qh_coder_bot] starting provider (@qh_coder_bot)
[qh_reviewer_bot] starting provider (@qh_reviewer_bot)
```

## 第六步：测试机器人协作

现在可以在 Telegram 群里测试了！

### 测试 1：单一任务

在群里发送：

```
@qh_pm_bot 请分析用户登录功能的需求 #产品 #需求
```

预期：产品经理机器人会回复需求分析文档。

### 测试 2：协作任务

在群里发送：

```
@qh_architect_bot 请设计登录模块的技术方案 #架构 #技术
完成后请@qh_coder_bot 开始实现 #开发
```

预期：
1. 架构师机器人回复技术方案
2. 然后@工程师机器人开始开发

### 测试 3：完整流程

在群里发起一个完整的产品开发流程：

```
@qh_pm_bot 我们需要一个用户注册功能，请分析需求 #产品

[产品经理回复需求分析后]

@qh_architect_bot 请根据需求设计技术方案 #架构

[架构师回复方案后]

@qh_coder_bot 请实现这个功能 #开发 #全栈

[工程师完成代码后]

@qh_reviewer_bot 请测试这个功能 #测试 #质检
```

## 最佳实践

### 1. 使用标签系统

为每个机器人定义专属标签，帮助快速识别：

| 机器人 | 标签 |
|--------|------|
| 产品经理 | `#产品` `#需求` `#分析` `#规划` |
| 架构师 | `#架构` `#技术` `#设计` `#评审` |
| 工程师 | `#开发` `#代码` `#实现` `#全栈` `#前端` `#后端` |
| 测试工程师 | `#测试` `#质检` `#bug` `#验收` |
| 运维工程师 | `#运维` `#部署` `#上线` |

### 2. 明确协作流程

在消息中明确说明协作流程：

```
@qh_pm_bot 分析这个需求，完成后@qh_architect_bot 设计，最后@qh_coder_bot 实现
```

### 3. 避免无限循环

设置回复深度限制，防止机器人之间无限@：

- 默认 3 层深度限制
- 60 秒冷却时间
- 只响应包含自己标签的消息

### 4. 使用群组话题（可选）

如果群组成员较多，可以启用 Telegram 的论坛模式，为每个项目创建独立的话题：

```
话题 1: 用户登录项目
话题 2: 支付功能项目
话题 3: 数据分析项目
```

每个话题的消息不会互相干扰。

## 常见问题

### Q1: 机器人不回复消息

**检查：**
1. 网关是否正常运行：`openclaw gateway status`
2. 机器人是否在群里
3. 是否给了机器人管理员权限
4. 查看日志：`openclaw logs --follow`

### Q2: 机器人无限循环回复

**解决：**
1. 检查 `groupPolicy` 是否设置为 `open`
2. 检查是否设置了标签过滤
3. 查看日志中的回复深度

### Q3: 某些机器人收不到消息

**检查：**
1. 机器人的 `Privacy Mode` 是否关闭
2. 在 BotFather 中发送 `/setprivacy` 关闭隐私模式
3. 重新将机器人拉入群组

## 进阶配置

### 1. 添加更多机器人

可以继续创建更多专属机器人，例如：

- 客服机器人
- 数据分析师
- 安全专家
- UI 设计师

### 2. 配置不同群组

可以为不同项目配置不同的群组：

```json
{
  "groups": {
    "群组 ID 1": {
      "requireMention": false,
      "groupPolicy": "open"
    },
    "群组 ID 2": {
      "requireMention": true,
      "groupPolicy": "open"
    }
  }
}
```

### 3. 集成外部系统

通过 OpenClaw 的 Hook 系统，可以集成外部 API：

- 项目管理工具（Jira、Trello）
- 代码仓库（GitHub、GitLab）
- CI/CD 系统（Jenkins、GitHub Actions）

## 总结

通过 OpenClaw，你可以轻松实现：

✅ 多个 Telegram 机器人独立运行
✅ 群组内互相@协作
✅ 基于标签的智能路由
✅ 防循环和冷却机制
✅ 完整的团队协作工作流

这种配置特别适合：

- 小型团队的自动化工作流
- 个人项目的多角色协作
- 学习和实验多智能体系统
- 快速原型开发

## 参考资源

- OpenClaw 官方文档：https://docs.openclaw.ai
- Telegram Bot API：https://core.telegram.org/bots/api
- OpenClaw GitHub：https://github.com/openclaw/openclaw
- 社区 Discord：https://discord.com/invite/clawd

---

**作者注：** 本文基于 OpenClaw 2026.3.11 版本实践编写，配置细节可能随版本更新而变化，建议参考最新官方文档。

**安全提示：** 文中的 Token 和群组 ID 均为示例，请使用你自己的配置。切勿将敏感信息提交到公开仓库！
