---
layout: post
title: "Telegram 接入 OpenClaw 完整指南：从创建 Bot 到群组聊天"
date: 2026-03-14T12:23:49+08:00
categories: [OpenClaw]
tags: [OpenClaw,Telegram,Bot,群组，AI 助手]
description: "从零开始教你在 Telegram 上部署 OpenClaw AI 助手，包括 Bot 创建、配置、群组设置和常见问题排查"
---

## 为什么选择 Telegram

说实话，在折腾了好几个聊天平台后，我最终还是回到了 Telegram。

原因很简单：开放、灵活、功能强大。Telegram 的 Bot API 几乎是最友好的，没有之一。不需要复杂的审核流程，几分钟就能创建一个功能完整的机器人。

更重要的是，Telegram 支持论坛模式、频道、群组、私聊各种场景，正好和 OpenClaw 的多智能体系统完美契合。

今天这篇教程，我就从零开始，手把手教你把 OpenClaw 接入 Telegram，让你的 AI 助手在 Telegram 上跑起来。

## 第一步：创建 Telegram Bot

### 打开 BotFather

在 Telegram 里搜索 `@BotFather`，认准那个蓝色认证标志。点进去，发送 `/start` 开始对话。

### 创建新 Bot

发送 `/newbot` 命令，BotFather 会引导你完成创建：

```
BotFather: Alright, a new bot. How are we going to call it?
你：OpenClaw Assistant
BotFather: Good. Now let's choose a username for your bot. It must end in `bot`.
你：my_openclaw_bot
```

**注意**：用户名必须以 `bot` 结尾，而且必须是全局唯一的。如果提示已被占用，换个名字试试。

### 保存 Bot Token

创建成功后，BotFather 会给你一个 Token：

```
Done! Congratulations on your new bot. You will find it at
t.me/my_openclaw_bot. You can now add a description, about
section and profile photo for your bot, see /help for a
list of commands.

Use this token to access the HTTP API:
1234567890:ABCdefGHIjklMNOpqRS_TUVwxyz123456

For a description of the Bot API, see this page:
https://core.telegram.org/bots/api
```

**这个 Token 就是你的钥匙，千万保存好！** 不要发给任何人，不要上传到 GitHub。

### 测试 Bot

在 Telegram 里搜索你刚才设置的用户名，比如 `@my_openclaw_bot`，点进去发送 `/start`。如果 Bot 回复了，说明创建成功。

## 第二步：配置 OpenClaw

### 找到配置文件

OpenClaw 的配置文件在 `~/.openclaw/openclaw.json`。用你喜欢的编辑器打开它。

### 添加 Telegram 配置

在配置文件里添加 Telegram 通道配置：

```json5
{
  "channels": {
    "telegram": {
      "enabled": true,
      "botToken": "1234567890:ABCdefGHIjklMNOpqRS_TUVwxyz123456",
      "dmPolicy": "pairing",
      "groups": {
        "*": {
          "requireMention": true
        }
      }
    }
  }
}
```

**配置说明**：

- `enabled`: 设为 `true` 启用 Telegram 通道
- `botToken`: 刚才从 BotFather 那里拿到的 Token
- `dmPolicy`: 私聊访问控制策略
  - `pairing`（默认）：首次私聊需要配对码验证
  - `allowlist`：只有白名单用户可以私聊
  - `open`：任何人都可以私聊（不推荐）
- `groups.requireMention`: 群组里是否需要@机器人才能触发回复

### 环境变量方式（可选）

如果你不想把 Token 写在配置文件里，可以用环境变量：

```bash
export TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqRS_TUVwxyz123456
```

配置文件里就不需要写 `botToken` 了，OpenClaw 会自动读取环境变量。

### 重启 Gateway

配置完成后，重启 OpenClaw Gateway：

```bash
openclaw gateway restart
```

或者如果你是用后台服务运行的：

```bash
openclaw gateway stop
openclaw gateway start
```

### 查看日志

重启后，查看日志确认 Telegram 通道是否正常启动：

```bash
openclaw logs --follow
```

你应该能看到类似这样的输出：

```
[Telegram] Bot started: my_openclaw_bot
[Telegram] Polling updates...
```

## 第三步：私聊配对（首次使用）

OpenClaw 默认开启配对保护，防止陌生人骚扰。

### 发送第一条消息

在 Telegram 里给你的 Bot 发送任意消息，比如 `/start`。

### 获取配对码

Bot 会回复一个配对码：

```
🔐 配对请求

收到来自新用户的消息。
配对码：ABCD1234

请在 1 小时内使用以下命令批准：
openclaw pairing approve telegram ABCD1234
```

### 批准配对

在终端执行命令：

```bash
openclaw pairing approve telegram ABCD1234
```

看到批准成功的提示后，再回到 Telegram 给 Bot 发消息，就能正常对话了。

### 查看配对状态

```bash
openclaw pairing list telegram
```

可以查看当前已批准的用户列表。

## 第四步：创建 Telegram 群组

### 创建超级群组

1. 在 Telegram 里点击「新建消息」→「新建群组」
2. 添加至少一个成员（可以拉个小号或者朋友）
3. 设置群组名称，比如「OpenClaw 测试群」
4. **重要**：创建后要把群组升级为「超级群组」

**如何判断是不是超级群组**：
- 超级群组有「群组信息」→「成员」可以看到完整成员列表
- 超级群组可以开启论坛模式
- 超级群组的 ID 是负数，而且以 `-100` 开头

### 获取群组 ID

群组 ID 是配置 OpenClaw 必需的。有几种方法可以获取：

**方法一：使用 Bot**

1. 把你的 Bot 拉进群组
2. 在群里发送任意消息
3. 查看 OpenClaw 日志：

```bash
openclaw logs --follow
```

日志里会显示群组 ID，类似 `-1001234567890`。

**方法二：使用 @userinfobot**

1. 在 Telegram 搜索 `@userinfobot`
2. 把这条 Bot 也拉进你的群组
3. 在群里发送任意消息
4. @userinfobot 会回复群组信息，包含 ID

**方法三：使用 Bot API**

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates"
```

返回的 JSON 里找 `chat.id`。

## 第五步：邀请机器人进群

### 拉 Bot 进群

在群组信息页面，点击「添加成员」，搜索你的 Bot 用户名，比如 `@my_openclaw_bot`，添加即可。

### 设置管理员（可选但推荐）

为了让 Bot 能正常收发群消息，建议把它设为管理员：

1. 群组信息 → 管理员 → 添加管理员
2. 选择你的 Bot
3. 权限设置：
   - 发送消息：✅
   - 编辑消息：✅
   - 删除消息：❌（不需要）
   - 封禁用户：❌（不需要）
   - 其他权限按需开启

**注意**：如果你的 Bot 收不到群消息，很可能是因为 Telegram 的隐私模式限制。有两种解决方案：

1. **把 Bot 设为管理员**（推荐）
2. **关闭隐私模式**：
   - 在 BotFather 里发送 `/setprivacy`
   - 选择你的 Bot
   - 选择「Disable」

关闭隐私模式后，需要把 Bot 从群里移除再重新拉进来，设置才会生效。

## 第六步：配置群组访问控制

### 允许所有群组（简单模式）

如果你希望 Bot 可以加入任何群组并响应消息：

```json5
{
  "channels": {
    "telegram": {
      "groupPolicy": "open",
      "groups": {
        "*": {
          "requireMention": true
        }
      }
    }
  }
}
```

**说明**：
- `groupPolicy: "open"` 允许任何群组
- `requireMention: true` 要求必须@Bot 才会回复，避免打扰群聊

### 只允许特定群组（推荐）

如果你只想让 Bot 在特定群组里工作：

```json5
{
  "channels": {
    "telegram": {
      "groupPolicy": "allowlist",
      "groups": {
        "-1001234567890": {
          "requireMention": true
        },
        "-1009876543210": {
          "requireMention": false
        }
      }
    }
  }
}
```

**说明**：
- `groupPolicy: "allowlist"` 启用白名单模式
- 只有列出的群组 ID 才能使用 Bot
- 可以针对不同群组设置不同的 `requireMention`

### 只允许特定用户在群组触发

如果你想限制群组里谁能和 Bot 对话：

```json5
{
  "channels": {
    "telegram": {
      "groups": {
        "-1001234567890": {
          "requireMention": true,
          "allowFrom": ["123456789", "987654321"]
        }
      }
    }
  }
}
```

**说明**：
- `allowFrom` 里填 Telegram 用户 ID（不是用户名）
- 只有 listed 用户发送的消息才会触发 Bot 回复
- 其他用户的消息会被忽略

**获取用户 ID 方法**：
- 让用户给你的 Bot 发私聊
- 查看 `openclaw logs --follow` 输出中的 `from.id`

## 第七步：群组聊天测试

### 基础测试

在群里发送消息，看看 Bot 是否响应。

如果 `requireMention: true`，记得@Bot：

```
@my_openclaw_bot 你好，今天天气怎么样？
```

### 查看会话状态

```bash
openclaw sessions list
```

可以看到群组会话的状态和最近活动时间。

### 调整激活模式

默认情况下，群组里需要@Bot 才会触发。如果你想让 Bot 回复所有消息：

在群里发送（需要是群组管理员）：

```
/activation always
```

想改回仅@提及触发：

```
/activation mention
```

这些命令会修改会话级别的设置，重启后失效。持久化配置需要在 `openclaw.json` 里设置。

## 第八步：进阶配置

### 多账号支持

Telegram 通道支持多个 Bot 账号：

```json5
{
  "channels": {
    "telegram": {
      "defaultAccount": "main",
      "accounts": {
        "main": {
          "botToken": "123456:ABC...",
          "dmPolicy": "pairing"
        },
        "support": {
          "botToken": "789012:DEF...",
          "dmPolicy": "allowlist",
          "allowFrom": ["123456789"]
        }
      }
    }
  }
}
```

每个账号可以有不同的 Bot、不同的访问策略。

### 论坛主题绑定

如果你的群组开启了论坛模式，可以为每个主题绑定不同的智能体：

```json5
{
  "bindings": [
    {
      "agentId": "pm",
      "match": {
        "channel": "telegram",
        "peer": { "kind": "group", "id": "-1001234567890:topic:3" }
      }
    },
    {
      "agentId": "coder",
      "match": {
        "channel": "telegram",
        "peer": { "kind": "group", "id": "-1001234567890:topic:5" }
      }
    }
  ],
  "channels": {
    "telegram": {
      "groups": {
        "-1001234567890": {
          "topics": {
            "3": { "agentId": "pm" },
            "5": { "agentId": "coder" }
          }
        }
      }
    }
  }
}
```

这样每个论坛主题就有独立的 AI 助手负责。

### 自定义命令

Telegram 支持原生命令菜单：

```json5
{
  "channels": {
    "telegram": {
      "customCommands": [
        { "command": "status", "description": "查看系统状态" },
        { "command": "help", "description": "帮助信息" },
        { "command": "backup", "description": "执行备份" }
      ]
    }
  }
}
```

配置后，用户在 Telegram 里输入 `/` 就能看到这些命令。

### 内联按钮

启用内联按钮功能：

```json5
{
  "channels": {
    "telegram": {
      "capabilities": {
        "inlineButtons": "all"
      }
    }
  }
}
```

这样 Bot 发送的消息可以带点击按钮。

## 第九步：常见问题排查

### Bot 不回复群消息

**检查清单**：

1. Bot 是否在群里？
2. Bot 是否是管理员？（或者隐私模式已关闭）
3. 群组 ID 是否在白名单里？
4. 是否设置了 `requireMention: true` 但没@Bot？
5. 查看日志有没有错误信息

```bash
openclaw logs --follow
```

### 配对码过期

配对码有效期 1 小时，过期后需要重新获取：

```bash
openclaw pairing list telegram
openclaw pairing revoke telegram <CODE>
```

然后重新给 Bot 发消息获取新配对码。

### Token 无效

如果日志提示 Token 无效：

1. 检查 Token 是否复制完整
2. 检查是否有前后空格
3. 在 BotFather 里重新生成 Token：`/revoke`
4. 更新配置后重启 Gateway

### 网络问题

如果日志提示网络错误：

```bash
# 测试能否访问 Telegram API
curl "https://api.telegram.org/bot<TOKEN>/getMe"
```

如果无法访问，可能需要配置代理：

```json5
{
  "channels": {
    "telegram": {
      "proxy": "socks5://user:pass@proxy-host:1080"
    }
  }
}
```

### 群组 ID 格式错误

Telegram 超级群组 ID 是负数，而且以 `-100` 开头。比如 `-1001234567890`。

如果配置后不生效，检查：
- 是否少写了 `-` 号
- 是否少写了 `100` 前缀
- 数字是否正确

## 第十步：安全建议

### 不要公开 Token

- 不要把 Token 上传到 GitHub
- 不要在不安全的渠道分享 Token
- 定期在 BotFather 里 `/revoke` 重新生成

### 使用白名单

生产环境建议使用白名单模式：

```json5
{
  "channels": {
    "telegram": {
      "dmPolicy": "allowlist",
      "allowFrom": ["123456789", "987654321"],
      "groupPolicy": "allowlist",
      "groups": {
        "-1001234567890": {}
      }
    }
  }
}
```

### 限制工具权限

对于群组会话，可以限制 AI 能使用的工具：

```json5
{
  "agents": {
    "defaults": {
      "tools": {
        "allow": ["read", "sessions_list", "sessions_send"],
        "deny": ["exec", "write", "edit", "browser"]
      }
    }
  }
}
```

这样群组里的 AI 就不能执行危险操作了。

## 最后说几句

Telegram 接入 OpenClaw 其实不难，关键是要理解几个核心概念：

1. **Bot Token** 是身份凭证，保管好
2. **配对机制** 保护私聊安全
3. **群组策略** 控制谁能用 Bot
4. **提及 gating** 避免群组打扰

配置过程中遇到问题很正常，多看日志，多查文档。Telegram Bot API 的文档写得非常好，大部分问题都能找到答案。

等你把基础配置搞定后，还可以试试多智能体、论坛主题绑定、跨通道协作这些进阶玩法。那又是另一片天地了。

祝你玩得开心！
