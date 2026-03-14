---
layout: post
title: "OpenClaw + Telegram 多智能体团队完整指南：从注册到软件开发实战"
date: 2026-03-14T12:29:38+08:00
categories: [OpenClaw]
tags: [OpenClaw,Telegram,多智能体，AI 协作，软件开发，Bot 教程]
description: "从零开始搭建 Telegram AI 开发团队：Bot 注册、配置、多智能体设置，到实际软件开发流程的完整实战教程"
---

## 写在前面

这篇文章源于一个真实的需求。

前段时间，我接了个不小的项目。白天要写需求文档，晚上要设计架构，深夜还要写代码。一个 AI 助手今天说它是产品经理，明天说它是工程师，后天又说它是运维。角色混乱得让我自己都晕了。

后来我想，为什么不让每个 AI 专注于一个角色呢？产品经理就好好做需求分析，架构师就专心设计系统，工程师就认真写代码。就像现实中的软件团队一样，各司其职，协作完成项目。

于是我开始研究 OpenClaw 的多智能体系统，配合 Telegram 的论坛主题功能，搭建了一个 AI 开发团队。

这篇文章，我就从零开始，手把手教你完成整个搭建过程。内容有点长，但相信我，看完你就能拥有一个属于自己的 AI 开发团队。

## 第一部分：Telegram 基础搭建

### 1.1 创建 Telegram 账号

如果你还没有 Telegram 账号，首先需要注册一个。

**步骤**：

1. 下载 Telegram 应用（官网：telegram.org）
2. 选择国家/地区，输入手机号码
3. 接收短信验证码，完成验证
4. 设置用户名和头像

**注意**：Telegram 需要手机号码注册，但注册后可以隐藏手机号，只用用户名联系。

### 1.2 创建 Bot

在 Telegram 里搜索 `@BotFather`，认准那个蓝色认证标志。这是 Telegram 官方的 Bot 管理机器人。

点进去，发送 `/start` 开始对话。

#### 创建新 Bot

发送 `/newbot` 命令，BotFather 会引导你完成创建：

```
BotFather: Alright, a new bot. How are we going to call it?
你：OpenClaw Assistant
BotFather: Good. Now let's choose a username for your bot. It must end in `bot`.
你：my_openclaw_bot
```

**注意**：
- 显示名称可以随意取，比如「OpenClaw 助手」
- 用户名必须以 `bot` 结尾，而且必须是全局唯一的
- 如果提示已被占用，换个名字试试

#### 保存 Bot Token

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

**这个 Token 就是你的钥匙，千万保存好！** 不要发给任何人，不要上传到 GitHub。建议用密码管理器保存。

#### 测试 Bot

在 Telegram 里搜索你刚才设置的用户名，比如 `@my_openclaw_bot`，点进去发送 `/start`。如果 Bot 回复了，说明创建成功。

### 1.3 创建 Telegram 群组

#### 创建超级群组

1. 在 Telegram 里点击「新建消息」→「新建群组」
2. 添加至少一个成员（可以拉个小号或者朋友）
3. 设置群组名称，比如「AI 开发团队」
4. **重要**：创建后要把群组升级为「超级群组」

**如何判断是不是超级群组**：
- 超级群组有「群组信息」→「成员」可以看到完整成员列表
- 超级群组可以开启论坛模式
- 超级群组的 ID 是负数，而且以 `-100` 开头

#### 开启论坛模式

论坛模式是关键，它允许我们在一个群组里创建多个独立的话题区。

1. 群组信息 → 编辑 → 论坛模式 → 开启
2. 创建几个主题，比如：
   - 📋 需求讨论
   - 🏗️ 架构设计
   - 💻 代码开发
   - 🔍 代码审查
   - 🚀 部署运维

**记录主题 ID**：每个主题创建后，需要记录它的 ID。方法是在主题里发条消息，然后查看 OpenClaw 日志（后面会讲如何查看）。

#### 获取群组 ID

群组 ID 是配置 OpenClaw 必需的。有几种方法可以获取：

**方法一：使用 Bot**

1. 把你的 Bot 拉进群组
2. 在群里发送任意消息
3. 查看 OpenClaw 日志（后面会讲）

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

群组 ID 格式类似 `-1001234567890`，注意负号和 `-100` 前缀。

### 1.4 邀请 Bot 进群

在群组信息页面，点击「添加成员」，搜索你的 Bot 用户名，比如 `@my_openclaw_bot`，添加即可。

#### 设置管理员（推荐）

为了让 Bot 能正常收发群消息，建议把它设为管理员：

1. 群组信息 → 管理员 → 添加管理员
2. 选择你的 Bot
3. 权限设置：
   - 发送消息：✅
   - 编辑消息：✅
   - 删除消息：❌（不需要）
   - 封禁用户：❌（不需要）

**注意**：如果 Bot 收不到群消息，可能是因为 Telegram 的隐私模式限制。有两种解决方案：

1. **把 Bot 设为管理员**（推荐）
2. **关闭隐私模式**：
   - 在 BotFather 里发送 `/setprivacy`
   - 选择你的 Bot
   - 选择「Disable」

关闭隐私模式后，需要把 Bot 从群里移除再重新拉进来，设置才会生效。

## 第二部分：OpenClaw 配置

### 2.1 安装 OpenClaw

如果你还没有安装 OpenClaw，执行以下命令：

```bash
npm install -g openclaw@latest
```

安装完成后，运行初始化向导：

```bash
openclaw onboard
```

向导会引导你完成基础配置，包括模型选择、工作空间设置等。

### 2.2 创建多智能体工作空间

我们需要创建 5 个独立的智能体，每个负责不同的角色：

```bash
openclaw agents add pm
openclaw agents add architect
openclaw agents add coder
openclaw agents add reviewer
openclaw agents add devops
```

每条命令都会创建一个独立的工作空间，位置在：
- `~/.openclaw/workspace-pm`
- `~/.openclaw/workspace-architect`
- `~/.openclaw/workspace-coder`
- `~/.openclaw/workspace-reviewer`
- `~/.openclaw/workspace-devops`

每个工作空间都是完全隔离的，有自己的 AGENTS.md、SOUL.md、USER.md，还有独立的会话历史和记忆。

### 2.3 配置每个智能体的角色

打开 `~/.openclaw/workspace-pm/SOUL.md`，把内容改成：

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

打开 `~/.openclaw/workspace-architect/SOUL.md`，把内容改成：

```markdown
# 你是系统架构师

## 职责
- 根据需求设计系统架构
- 选择技术栈和框架
- 设计 API 接口和数据库结构
- 考虑安全性、扩展性和性能

## 输出格式
- 架构图描述
- 技术选型说明
- API 设计文档
- 数据库设计
```

打开 `~/.openclaw/workspace-coder/SOUL.md`，把内容改成：

```markdown
# 你是高级软件工程师

## 职责
- 根据需求和设计实现功能
- 编写高质量、可维护的代码
- 遵循最佳实践和设计模式
- 编写单元测试

## 技术栈
- 后端：Node.js、Python
- 前端：React、TypeScript
- 数据库：PostgreSQL、MongoDB
```

打开 `~/.openclaw/workspace-reviewer/SOUL.md`，把内容改成：

```markdown
# 你是代码审查员

## 职责
- 审查代码质量
- 发现潜在 bug 和安全问题
- 提出改进建议
- 确保代码符合规范

## 审查要点
- 代码逻辑是否正确
- 是否有安全隐患
- 是否符合最佳实践
- 是否有足够的测试
```

打开 `~/.openclaw/workspace-devops/SOUL.md`，把内容改成：

```markdown
# 你是运维工程师

## 职责
- 设计部署方案
- 配置 CI/CD 流程
- 监控系统运行状态
- 处理线上问题

## 技术栈
- 容器：Docker、Kubernetes
- CI/CD：GitHub Actions、Jenkins
- 监控：Prometheus、Grafana
- 云服务商：AWS、Azure、阿里云
```

### 2.4 配置 openclaw.json

这是整个系统的核心配置文件。打开 `~/.openclaw/openclaw.json`，编辑内容：

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

**配置说明**：

1. **agents.list**：定义 5 个智能体
   - 每个智能体有独立的 workspace 和 model
   - `mentionPatterns` 定义群组里的触发关键词

2. **bindings**：绑定论坛主题到智能体
   - `-1001234567890` 是你的群组 ID（替换成实际的）
   - `topic:3`、`topic:4` 等是主题 ID（替换成实际的）

3. **channels.telegram**：Telegram 通道配置
   - `botToken`：从 BotFather 获取的 Token
   - `requireMention: false`：论坛主题已隔离，不需要@触发
   - `topics`：每个主题绑定到对应的智能体

4. **tools.agentToAgent**：启用智能体间通信
   - 智能体可以互相@协作

### 2.5 启动并验证

重启 Gateway：

```bash
openclaw gateway restart
```

验证配置：

```bash
openclaw agents list --bindings
openclaw channels status --probe
```

如果一切正常，你应该能看到 5 个智能体都已经绑定到对应的主题上了。

## 第三部分：实战演示

配置完成后，来实际走一遍软件开发流程。

### 3.1 需求讨论

在「需求讨论」主题里，发送：

> 我们需要实现一个用户登录功能，支持邮箱密码登录和 Google OAuth

几分钟后，产品经理 AI 回复：

```
📋 用户故事拆解完成

**用户故事 1**：作为用户，我想要用邮箱和密码登录，以便访问我的账户
- 验收标准:
  - Given 用户已注册，When 输入正确邮箱密码，Then 登录成功
  - Given 密码错误，When 提交登录，Then 显示错误提示

**用户故事 2**：作为用户，我想要用 Google 账号登录，以便快速访问
- 验收标准:
  - Given 用户有 Google 账号，When 点击 Google 登录，Then 跳转 OAuth 流程

**优先级**: P0
**预估工时**: 3 天
```

### 3.2 架构设计

把需求转发到「架构设计」主题，然后@架构师：

> @architect 请设计登录功能的技术方案

架构师 AI 回复：

```
🏗️ 技术架构设计

**后端 API**:
- POST /api/auth/login - 邮箱密码登录
- GET /api/auth/google - Google OAuth 入口
- POST /api/auth/google/callback - OAuth 回调

**数据库设计**:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  google_id VARCHAR(255),
  created_at TIMESTAMP
);
```

**安全考虑**:
- 密码使用 bcrypt 加密
- JWT Token 有效期 24 小时
- 实现速率限制防止暴力破解
```

### 3.3 代码开发

带着架构设计到「代码开发」主题：

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

### 3.4 代码审查

把代码发到「代码审查」主题：

> @reviewer 审查上面的登录代码

审查员 AI 回复：

```
🔍 Code Review 意见

**优点**:
- 使用了 bcrypt 加密
- JWT 实现正确

**改进建议**:
1. 添加输入验证（邮箱格式、密码长度）
2. 添加登录失败次数限制
3. 密码哈希应该加盐

**修改后代码**:
[提供改进版本]
```

### 3.5 部署运维

最后到「部署运维」主题：

> @devops 准备部署方案

运维 AI 回复：

```
🚀 部署方案

**CI/CD 流程**:
1. GitHub Actions 运行测试
2. 构建 Docker 镜像
3. 推送到 Registry
4. 部署到 Kubernetes

**Dockerfile**:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "src/server.js"]
```

**监控告警**:
- Prometheus 监控 API 响应时间
- 登录失败率 > 5% 触发告警
```

## 第四部分：智能体协作

启用 `agentToAgent` 后，智能体之间可以主动沟通。

### 自动协作流程

产品经理 AI 可以在需求确认完后，自动@架构师：

> @architect 需求已确认，请开始技术设计

工程师 AI 写完代码后，自动@审查员：

> @reviewer 功能已实现，请审查代码

这种协作模式让整个流程更加自动化。

### 配置智能体间通信

确保配置里启用了：

```json5
{
  "tools": {
    "agentToAgent": {
      "enabled": true,
      "allow": ["pm", "architect", "coder", "reviewer", "devops"]
    }
  }
}
```

## 第五部分：常见问题排查

### Bot 不回复群消息

**检查清单**：

1. Bot 是否在群里？
2. Bot 是否是管理员？
3. 群组 ID 和主题 ID 是否正确？
4. 查看日志有没有错误信息

```bash
openclaw logs --follow
```

### 主题 ID 获取

主题 ID 不是随便猜的。最可靠的方法：

1. 在主题里发条消息
2. 查看 `openclaw logs --follow` 输出
3. 日志里会显示完整的 session key，包含主题 ID

### 工具权限问题

工程师 AI 需要 exec 权限才能运行代码。如果它报告权限不足：

```json5
{
  "agents": {
    "list": [
      {
        "id": "coder",
        "tools": {
          "allow": ["exec", "read", "write", "edit"],
          "deny": []
        }
      }
    ]
  }
}
```

### 沙箱配置

工程师 AI 配了 Docker 沙箱，这样它运行的代码不会影响到主机。如果代码跑不起来，检查依赖是否安装：

```json5
{
  "agents": {
    "list": [
      {
        "id": "coder",
        "sandbox": {
          "docker": {
            "setupCommand": "apt-get update && apt-get install -y nodejs npm git"
          }
        }
      }
    ]
  }
}
```

### Token 无效

如果日志提示 Token 无效：

1. 检查 Token 是否复制完整
2. 检查是否有前后空格
3. 在 BotFather 里重新生成 Token：`/revoke`
4. 更新配置后重启 Gateway

## 第六部分：安全建议

### 保管好 Bot Token

- 不要把 Token 上传到 GitHub
- 不要在不安全的渠道分享
- 定期在 BotFather 里 `/revoke` 重新生成

### 使用白名单

生产环境建议使用白名单模式：

```json5
{
  "channels": {
    "telegram": {
      "groupPolicy": "allowlist",
      "groups": {
        "-1001234567890": {}
      }
    }
  }
}
```

### 限制工具权限

对于不同角色的智能体，限制工具权限：

```json5
{
  "agents": {
    "list": [
      {
        "id": "pm",
        "tools": {
          "allow": ["read", "sessions_list", "sessions_send"],
          "deny": ["exec", "write", "edit"]
        }
      },
      {
        "id": "coder",
        "tools": {
          "allow": ["exec", "read", "write", "edit"],
          "deny": []
        }
      }
    ]
  }
}
```

产品经理不需要执行代码，但工程师需要。

## 第七部分：扩展思路

这个配置只是个起点。你还可以：

### 添加更多角色

- **测试工程师**：负责写测试用例和自动化测试
- **UI 设计师**：负责界面设计和交互建议
- **项目经理**：跟踪进度、协调资源

### 集成外部工具

- **GitHub webhook**：自动同步 Issue 和 PR
- **数据库连接**：直接查询生产数据
- **监控系统**：实时查看服务状态

### 定时任务

- **每日站会**：自动生成进度报告
- **周报总结**：汇总一周工作
- **代码质量检查**：定期扫描代码库

### 跨平台协作

- 把 Telegram 和 Discord、Slack 打通
- 不同平台使用不同的智能体
- 实现跨平台消息同步

## 最后说几句

用这套系统一段时间下来，我最大的感受是：多智能体不是噱头，而是真正能提升效率的工具。

以前一个 AI 要同时扮演多个角色，输出的内容经常前后矛盾。现在每个 AI 专注于一个角色，输出质量明显提高了。

产品经理会认真拆解需求，架构师会仔细设计系统，工程师会专注写代码，审查员会严格挑毛病，运维会周全考虑部署。这种专业分工带来的质量提升，是单智能体系统无法比拟的。

当然，配置过程确实比单个 AI 复杂一些。但想想看，现实中的团队管理也不简单，不也值得投入吗？

如果你也在用 OpenClaw，不妨试试多智能体。从一个简单的双角色配置开始，慢慢扩展。相信我，一旦体验到那种各司其职、协作流畅的感觉，你就回不去了。

---

**参考资料**：

- [OpenClaw 官方文档](https://docs.openclaw.ai)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [OpenClaw GitHub](https://github.com/openclaw/openclaw)
- [OpenClaw Discord 社区](https://discord.gg/clawd)
