---
layout: post
title: "OpenClaw 实战：用 Telegram 群组打造多智能体软件开发团队"
date: 2026-03-14T12:02:59+08:00
categories: [OpenClaw]
tags: [OpenClaw,多智能体，Telegram，AI 协作，软件开发]
description: "手把手教你用 OpenClaw 和 Telegram 论坛主题，搭建一个由产品经理、架构师、工程师、审查员和运维组成的 AI 开发团队"
---

## 为什么需要多智能体团队

说实话，刚开始接触多智能体系统时，我心里是打鼓的。一个 AI 不够用吗？为什么要搞这么多？

直到有一次，我接了个不小的项目。白天要写需求文档，晚上要设计架构，深夜还要写代码。一个 AI 助手今天说它是产品经理，明天说它是工程师，后天又说它是运维。角色混乱得让我自己都晕了。

后来我才明白，真正的软件开发从来不是一个人单打独斗。产品经理关注用户需求，架构师关心系统稳定性，工程师追求代码质量，运维盯着部署和监控。每个角色都有自己的思维方式和关注点。

OpenClaw 的多智能体系统，就是为了解决这个问题而生的。它不是让一个 AI 扮演所有角色，而是让每个 AI 专注于自己最擅长的事。

## 整体架构设计

我想要的效果很简单：在 Telegram 里建一个群组，然后分成几个不同的讨论区。每个讨论区都有一个专门的 AI 负责。

需求讨论区里，产品经理 AI 会帮我拆解用户故事；架构设计区里，架构师 AI 会给出技术方案；代码开发区里，工程师 AI 直接写代码；代码审查区里，审查员 AI 挑毛病；部署运维区里，运维 AI 负责上线。

听起来有点复杂？其实配置起来比想象中简单得多。

## 环境准备

### 创建 Telegram 群组和论坛主题

首先得有个 Telegram 超级群组。创建的时候记得开启论坛模式，这样就能创建不同的讨论主题了。

然后把你的 Bot 拉进群里，设成管理员。这一步很关键，不然 Bot 没法正常工作。

接下来创建五个主题，我一般是这么分的：

- 需求讨论：产品需求、用户故事
- 架构设计：技术方案、API 设计
- 代码开发：日常开发、代码片段
- 代码审查：PR 审核、质量检查
- 部署运维：部署、监控、CI/CD

每个主题创建后，需要拿到它的 ID。方法是在主题里发条消息，然后看 OpenClaw 的日志输出，里面会有 threadId。或者直接用 Bot API 的 getUpdates 接口也能看到。

### 创建智能体工作空间

打开终端，执行下面这些命令：

```bash
openclaw agents add pm
openclaw agents add architect
openclaw agents add coder
openclaw agents add reviewer
openclaw agents add devops
```

每条命令都会创建一个独立的工作空间，位置在 ~/.openclaw/workspace-pm、~/.openclaw/workspace-architect 这样。

每个工作空间都是完全隔离的，有自己的 AGENTS.md、SOUL.md、USER.md，还有独立的会话历史和记忆。这意味着产品经理 AI 不会记得代码审查区里发生的事，工程师 AI 也不知道架构设计区里的讨论。

这种隔离不是坏事。想想看，现实中的产品经理本来就不需要知道代码审查的每个细节，大家各司其职就好。

### 配置每个智能体的角色

打开 ~/.openclaw/workspace-pm/SOUL.md，把内容改成这样：

```markdown
# 你是产品经理

## 职责
- 收集和分析用户需求
- 编写产品需求文档
- 拆解任务为可执行的用户故事
- 优先级排序和排期

## 输出格式
- 用户故事：作为某个角色，我想要某个功能，以便获得某个价值
- 验收标准：Given/When/Then 格式
```

工程师的 SOUL.md 可以这么写：

```markdown
# 你是高级软件工程师

## 职责
- 根据需求实现功能
- 编写高质量、可维护的代码
- 遵循最佳实践和设计模式
- 编写单元测试

## 技术栈
- 后端：Node.js、Python
- 前端：React、TypeScript
- 数据库：PostgreSQL、MongoDB
```

其他几个角色也类似，根据各自的职责调整就行。

## 核心配置文件

这是整个系统的核心，~/.openclaw/openclaw.json：

```json5
{
  "agents": {
    "list": [
      {
        "id": "pm",
        "name": "产品经理",
        "workspace": "~/.openclaw/workspace-pm",
        "model": "anthropic/claude-sonnet-4-5",
        "groupChat": {
          "mentionPatterns": ["@pm", "@产品经理"]
        }
      },
      {
        "id": "architect",
        "name": "架构师",
        "workspace": "~/.openclaw/workspace-architect",
        "model": "anthropic/claude-opus-4-6",
        "groupChat": {
          "mentionPatterns": ["@architect", "@架构师"]
        }
      },
      {
        "id": "coder",
        "name": "开发工程师",
        "workspace": "~/.openclaw/workspace-coder",
        "model": "anthropic/claude-code",
        "groupChat": {
          "mentionPatterns": ["@coder", "@开发"]
        },
        "sandbox": {
          "mode": "all",
          "scope": "agent",
          "docker": {
            "setupCommand": "apt-get update && apt-get install -y nodejs npm git"
          }
        },
        "tools": {
          "allow": ["exec", "read", "write", "edit", "sessions_list", "sessions_send"],
          "deny": ["browser", "canvas", "nodes"]
        }
      },
      {
        "id": "reviewer",
        "name": "代码审查员",
        "workspace": "~/.openclaw/workspace-reviewer",
        "model": "anthropic/claude-opus-4-6",
        "groupChat": {
          "mentionPatterns": ["@reviewer", "@审查"]
        }
      },
      {
        "id": "devops",
        "name": "运维工程师",
        "workspace": "~/.openclaw/workspace-devops",
        "model": "anthropic/claude-sonnet-4-5",
        "groupChat": {
          "mentionPatterns": ["@devops", "@运维"]
        }
      }
    ]
  },

  "bindings": [
    {
      "agentId": "pm",
      "match": {
        "channel": "telegram",
        "peer": { "kind": "group", "id": "-1001234567890:topic:3" }
      }
    },
    {
      "agentId": "architect",
      "match": {
        "channel": "telegram",
        "peer": { "kind": "group", "id": "-1001234567890:topic:4" }
      }
    },
    {
      "agentId": "coder",
      "match": {
        "channel": "telegram",
        "peer": { "kind": "group", "id": "-1001234567890:topic:5" }
      }
    },
    {
      "agentId": "reviewer",
      "match": {
        "channel": "telegram",
        "peer": { "kind": "group", "id": "-1001234567890:topic:6" }
      }
    },
    {
      "agentId": "devops",
      "match": {
        "channel": "telegram",
        "peer": { "kind": "group", "id": "-1001234567890:topic:7" }
      }
    }
  ],

  "channels": {
    "telegram": {
      "enabled": true,
      "botToken": "YOUR_BOT_TOKEN_HERE",
      "groups": {
        "-1001234567890": {
          "requireMention": false,
          "topics": {
            "3": { "agentId": "pm" },
            "4": { "agentId": "architect" },
            "5": { "agentId": "coder" },
            "6": { "agentId": "reviewer" },
            "7": { "agentId": "devops" }
          }
        }
      }
    }
  },

  "tools": {
    "agentToAgent": {
      "enabled": true,
      "allow": ["pm", "architect", "coder", "reviewer", "devops"]
    }
  }
}
```

这里有几个关键点需要注意。

bindings 部分是把每个论坛主题绑定到对应的智能体。那个 -1001234567890 是你的群组 ID，topic:3、topic:4 这些是主题 ID。记得替换成你自己的。

channels.telegram.groups 里的 requireMention 设成 false，因为论坛主题本身就已经做了隔离，不需要再用@来触发。

tools.agentToAgent 启用后，智能体之间可以互相@。比如产品经理可以@架构师说需求确认了，请开始设计。工程师可以@审查员说代码写完了，请审查。

## 启动和验证

配置完成后，重启 Gateway：

```bash
openclaw gateway restart
```

然后验证一下配置对不对：

```bash
openclaw agents list --bindings
openclaw channels status --probe
```

如果一切正常，你应该能看到五个智能体都已经绑定到对应的主题上了。

## 实战演示

光说不练假把式。来实际走一遍开发流程。

### 需求讨论

在需求讨论主题里，我发了这样一条消息：

> 我们需要实现一个用户登录功能，支持邮箱密码登录和 Google OAuth

几分钟后，产品经理 AI 回复了：

```
用户故事拆解完成

用户故事 1：作为用户，我想要用邮箱和密码登录，以便访问我的账户
- 验收标准:
  - Given 用户已注册，When 输入正确邮箱密码，Then 登录成功
  - Given 密码错误，When 提交登录，Then 显示错误提示

用户故事 2：作为用户，我想要用 Google 账号登录，以便快速访问
- 验收标准:
  - Given 用户有 Google 账号，When 点击 Google 登录，Then 跳转 OAuth 流程

优先级：P0
预估工时：3 天
```

这个输出格式是我在 SOUL.md 里定义好的。有了明确的验收标准，后面的开发和测试都有据可依。

### 架构设计

把需求转发到架构设计主题，然后@架构师：

> @architect 请设计登录功能的技术方案

架构师 AI 的回复很详细：

```
技术架构设计

后端 API:
- POST /api/auth/login - 邮箱密码登录
- GET /api/auth/google - Google OAuth 入口
- POST /api/auth/google/callback - OAuth 回调

数据库设计:

CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  google_id VARCHAR(255),
  created_at TIMESTAMP
);

安全考虑:
- 密码使用 bcrypt 加密
- JWT Token 有效期 24 小时
- 实现速率限制防止暴力破解
```

我特别喜欢这种结构化的输出。API 设计、数据库设计、安全考虑，一目了然。

### 代码开发

带着架构设计到代码开发主题：

> @coder 根据上面的设计实现登录功能

工程师 AI 开始写代码。因为它有 exec 权限，可以直接在工作空间里创建文件：

```javascript
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function login(email, password) {
  const user = await db.users.findOne({ email });
  if (!user) throw new Error('用户不存在');
  
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error('密码错误');
  
  return jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: '24h'
  });
}
```

写完后它还自动运行了测试，确认代码能正常工作。

### 代码审查

把代码发到代码审查主题：

> @reviewer 审查上面的登录代码

审查员 AI 的回复很犀利：

```
Code Review 意见

优点:
- 使用了 bcrypt 加密
- JWT 实现正确

改进建议:
1. 添加输入验证（邮箱格式、密码长度）
2. 添加登录失败次数限制
3. 密码哈希应该加盐

修改后代码:
[提供改进版本]
```

说实话，被 AI 挑毛病的感觉有点奇怪。但它指出的问题确实存在，尤其是输入验证这块，我原来的代码里真没考虑。

### 部署运维

最后到部署运维主题：

> @devops 准备部署方案

运维 AI 给出了完整的部署流程：

```
部署方案

CI/CD 流程:
1. GitHub Actions 运行测试
2. 构建 Docker 镜像
3. 推送到 Registry
4. 部署到 Kubernetes

Dockerfile:
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "src/server.js"]

监控告警:
- Prometheus 监控 API 响应时间
- 登录失败率大于 5% 触发告警
```

## 一些踩过的坑

配置过程中确实遇到了一些问题，记录下来免得别人再踩。

### 群组 ID 格式

Telegram 的群组 ID 是负数，而且超级群组前面还有 -100。比如 -1001234567890。一开始我少写了个 0，怎么都收不到消息。

### 主题 ID 获取

主题 ID 不是随便猜的。最可靠的方法是在主题里发条消息，然后看 OpenClaw 的日志。日志里会显示完整的 session key，里面就包含主题 ID。

### 工具权限

工程师 AI 需要 exec 权限才能运行代码，但审查员 AI 就不需要。一开始我给所有 AI 都开了完整权限，后来想想不太安全，就按角色限制了。

### 沙箱配置

工程师 AI 我配了 Docker 沙箱，这样它运行的代码不会影响到主机。配置的时候记得在 docker.setupCommand 里安装好需要的依赖，不然代码跑不起来。

## 智能体协作

启用 agentToAgent 后，智能体之间可以主动沟通。

比如产品经理 AI 可以在需求确认完后，自动@架构师：

> @architect 需求已确认，请开始技术设计

工程师 AI 写完代码后，也可以自动@审查员：

> @reviewer 功能已实现，请审查代码

这种协作模式让整个流程更加自动化。不过要注意，agentToAgent 需要显式启用，并且在 allow 列表里写上所有参与的智能体 ID。

## 会话隔离的秘密

每个论坛主题都有独立的会话密钥。比如产品经理的会话密钥是 agent:pm:telegram:group:-1001234567890:topic:3，工程师的是 agent:coder:telegram:group:-1001234567890:topic:5。

这意味着什么？意味着每个智能体只记得自己主题里发生的事。产品经理不知道代码审查的细节，工程师也不知道架构设计的讨论。

一开始我觉得这可能会是个问题，但实际用下来发现，这反而让每个 AI 更专注于自己的角色。就像现实中的团队，每个人做好自己的事，需要协作的时候再沟通。

## 扩展思路

这个配置只是个起点。你还可以：

- 添加测试工程师 AI，负责写测试用例和自动化测试
- 添加 UI 设计师 AI，负责界面设计和交互建议
- 集成 GitHub webhook，自动同步 Issue 和 PR
- 设置定时任务，每天自动生成站会报告
- 把 Telegram 和 Discord、Slack 打通，实现跨平台协作

## 最后说几句

用这套系统一段时间下来，我最大的感受是：多智能体不是噱头，而是真正能提升效率的工具。

以前一个 AI 要同时扮演多个角色，输出的内容经常前后矛盾。现在每个 AI 专注于一个角色，输出质量明显提高了。

当然，配置过程确实比单个 AI 复杂一些。但想想看，现实中的团队管理也不简单，不也值得投入吗？

如果你也在用 OpenClaw，不妨试试多智能体。从一个简单的双角色配置开始，慢慢扩展。相信我，一旦体验到那种各司其职、协作流畅的感觉，你就回不去了。
