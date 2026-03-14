---
layout: post
title: "OpenClaw 多 Agent 与 Telegram 机器人绑定实战"
date: 2026-03-14T14:54:29+08:00
categories: [OpenClaw]
tags: [OpenClaw,Agent,Telegram,多智能体]
description: "手把手教你如何在 OpenClaw 中创建多个独立 Agent，并为每个 Agent 配置专属的 Telegram 机器人，实现完全隔离的多智能体系统"
---

## 为什么需要多 Agent 架构

想象一下这个场景：你是一家公司的技术负责人，团队里有客服、技术支持、销售、市场等多个部门。如果所有咨询都涌向同一个 AI 助手，不仅回复容易混乱，各部门的专业知识也无法隔离管理。

这就是多 Agent 架构的价值所在。每个 Agent 拥有独立的工作空间、独立的人格设定、独立的会话历史，甚至可以使用不同的模型。而 OpenClaw 的多通道支持，让我们可以为每个 Agent 分配专属的 Telegram 机器人，实现真正的隔离。

## 前置准备

在开始之前，你需要准备以下材料：

1. 已安装 OpenClaw 并正常运行
2. 在 Telegram 上通过 BotFather 创建多个机器人（需要几个 Agent 就创建几个机器人）
3. 记录每个机器人的 Bot Token

创建机器人的步骤很简单：在 Telegram 中搜索 BotFather，发送 /newbot 命令，按提示输入机器人名称和用户名，完成后会收到一个形如 123456:ABCdefGhIJKlmNoPQRsTUVwxyZ 的 Token，妥善保存。

## 第一步：创建多个 Agent

OpenClaw 提供了交互式命令来创建新的 Agent。打开终端，执行以下命令：

```bash
openclaw agents add agent1
```

系统会自动创建以下内容：

- 独立的工作空间目录，例如 ~/.openclaw/workspace-agent1
- 独立的 Agent 配置目录 ~/.openclaw/agents/agent1/agent
- 独立的会话存储和认证信息

重复执行上述命令，创建你需要的 Agent 数量：

```bash
openclaw agents add agent2
openclaw agents add agent3
openclaw agents add agent4
openclaw agents add agent5
```

每个 Agent 创建完成后，你可以在对应的工作空间目录中找到 AGENTS.md、SOUL.md、USER.md 等配置文件。这些文件定义了每个 Agent 的人格、行为准则和工作偏好。你可以根据不同部门的需求，为每个 Agent 定制不同的角色设定。

## 第二步：配置 Telegram 多账号

创建完 Agent 后，需要为每个 Agent 配置专属的 Telegram 机器人。OpenClaw 提供了交互式配置向导：

```bash
openclaw configure
```

在向导中选择 Telegram 通道，然后选择 Modify settings（修改设置），接着选择 Add a new account（添加新账号）。

系统会提示你输入账号标识符。这个标识符是你自己定义的内部名称，用来区分不同的 Telegram 账号。建议使用有意义的命名，例如：

- account1、account2、account3（简单编号）
- customer-service、tech-support、sales（按功能命名）
- bot-alice、bob、carol（按机器人名称命名）

输入账号标识符后，系统会提示你输入 Bot Token。将之前从 BotFather 获取的 Token 粘贴进去即可。

重复上述步骤，为每个 Agent 添加对应的 Telegram 账号配置。

## 第三步：配置绑定关系

账号配置完成后，需要建立 Agent 与 Telegram 账号之间的绑定关系。这一步决定了哪个 Telegram 机器人对应哪个 Agent。

打开配置文件 ~/.openclaw/openclaw.json，在文件中添加以下内容：

```json5
{
  "agents": {
    "list": [
      { "id": "main", "workspace": "~/.openclaw/workspace" },
      { "id": "agent1", "workspace": "~/.openclaw/workspace-agent1" },
      { "id": "agent2", "workspace": "~/.openclaw/workspace-agent2" },
      { "id": "agent3", "workspace": "~/.openclaw/workspace-agent3" },
      { "id": "agent4", "workspace": "~/.openclaw/workspace-agent4" },
      { "id": "agent5", "workspace": "~/.openclaw/workspace-agent5" }
    ]
  },

  "channels": {
    "telegram": {
      "accounts": {
        "account1": {
          "botToken": "BOT_TOKEN_1",
          "dmPolicy": "pairing",
          "groupPolicy": "allowlist"
        },
        "account2": {
          "botToken": "BOT_TOKEN_2",
          "dmPolicy": "pairing",
          "groupPolicy": "allowlist"
        },
        "account3": {
          "botToken": "BOT_TOKEN_3",
          "dmPolicy": "pairing",
          "groupPolicy": "allowlist"
        },
        "account4": {
          "botToken": "BOT_TOKEN_4",
          "dmPolicy": "pairing",
          "groupPolicy": "allowlist"
        },
        "account5": {
          "botToken": "BOT_TOKEN_5",
          "dmPolicy": "pairing",
          "groupPolicy": "allowlist"
        }
      }
    }
  },

  "bindings": [
    { "agentId": "agent1", "match": { "channel": "telegram", "accountId": "account1" } },
    { "agentId": "agent2", "match": { "channel": "telegram", "accountId": "account2" } },
    { "agentId": "agent3", "match": { "channel": "telegram", "accountId": "account3" } },
    { "agentId": "agent4", "match": { "channel": "telegram", "accountId": "account4" } },
    { "agentId": "agent5", "match": { "channel": "telegram", "accountId": "account5" } }
  ]
}
```

配置说明：

- agents.list：定义所有可用的 Agent，每个 Agent 有独立的 workspace 路径
- channels.telegram.accounts：定义所有 Telegram 账号，每个账号对应一个 Bot Token
- bindings：建立绑定关系，将每个 Telegram 账号路由到对应的 Agent

## 第四步：配置群组访问（可选）

如果你的机器人需要在 Telegram 群组中工作，可以为每个账号配置群组访问权限。在 channels.telegram.accounts 配置中添加 groups 字段：

```json5
{
  "channels": {
    "telegram": {
      "accounts": {
        "account1": {
          "botToken": "BOT_TOKEN_1",
          "dmPolicy": "pairing",
          "groupPolicy": "allowlist",
          "groups": {
            "-1001111111111": {
              "requireMention": true
            }
          }
        }
      }
    }
  }
}
```

其中 -1001111111111 是 Telegram 群组的 ID，可以通过转发群组消息到 @userinfobot 获取。requireMention 设置为 true 表示机器人需要被 @提及才会响应。

## 第五步：重启并验证

配置完成后，重启 OpenClaw 网关使配置生效：

```bash
openclaw gateway restart
```

验证 Agent 列表和绑定关系：

```bash
openclaw agents list --bindings
```

验证 Telegram 通道状态：

```bash
openclaw channels status --probe
```

如果一切正常，你应该能看到所有 Agent 和对应的 Telegram 账号都已正确配置并处于活动状态。

## 路由规则详解

OpenClaw 的消息路由遵循确定性原则，采用最具体匹配优先的策略。路由优先级从高到低依次为：

1. peer 精确匹配（具体的 DM 或群组 ID）
2. parentPeer 匹配（线程继承）
3. guildId + roles 匹配（Discord 角色路由）
4. guildId 匹配（Discord）
5. teamId 匹配（Slack）
6. accountId 匹配
7. 通道级匹配
8. 默认 Agent（配置中的第一个或标记为 default 的 Agent）

当多个绑定规则同时匹配时，配置文件中靠前的规则优先。这种设计让你可以在全局绑定的基础上，为特定群组或用户设置例外规则。

## 实际应用场景

多 Agent 架构适合以下场景：

**企业多部门部署**：客服、技术支持、销售、市场等部门各自拥有专属的 AI 助手，每个助手掌握对应领域的专业知识，互不干扰。

**多项目管理**：每个项目团队拥有独立的 Agent，项目文档、代码、会议记录等信息完全隔离，避免信息泄露。

**多语言支持**：为不同语言的用户群体创建不同的 Agent，每个 Agent 使用对应语言的人格设定和知识库。

**个人工作生活分离**：创建工作和个人两个 Agent，分别处理工作相关和生活相关的咨询，保持边界清晰。

## 注意事项

配置过程中有几点需要特别注意：

Bot Token 安全：Bot Token 相当于机器人的密码，不要提交到版本控制系统，建议使用环境变量或加密存储。

账号隔离：每个 Agent 的 agentDir 目录包含独立的认证信息和会话数据，不要在不同 Agent 之间共享或复制这些目录。

群组权限：如果机器人需要在群组中工作，记得在 Telegram 中将机器人设为管理员，并关闭隐私模式（通过 BotFather 的 /setprivacy 命令）。

资源消耗：每个 Agent 运行时会占用一定的系统资源，根据服务器性能合理规划 Agent 数量。

## 故障排查

如果配置后机器人无法正常工作，可以按以下步骤排查：

检查网关状态：openclaw gateway status

查看实时日志：openclaw logs --follow

验证通道配置：openclaw channels status --probe

检查绑定关系：openclaw agents list --bindings

确认 Bot Token 正确：在 BotFather 中重新获取 Token 并更新配置

常见问题包括 Bot Token 错误、群组 ID 格式不正确、隐私模式未关闭、管理员权限未设置等。

## 总结

OpenClaw 的多 Agent 架构配合多通道支持，为构建复杂的企业级 AI 助手系统提供了坚实的基础。通过为每个 Agent 分配专属的 Telegram 机器人，我们实现了真正的隔离和独立运行。

这种架构的优势在于：

- 完全隔离的工作空间和会话历史
- 独立的人格设定和专业知识
- 灵活的绑定和路由规则
- 统一的网关管理，降低运维成本

希望这篇教程能帮助你成功部署多 Agent 系统。如果在配置过程中遇到问题，欢迎查阅 OpenClaw 官方文档或寻求社区支持。
