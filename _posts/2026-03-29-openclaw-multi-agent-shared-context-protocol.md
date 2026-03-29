---
title: OpenClaw 多 Agent 共享上下文协议设计与实现
date: 2026-03-29T10:55:00+08:00
tags: [OpenClaw,Agent,架构设计]
categories: [技术]
---

# OpenClaw 多 Agent 共享上下文协议设计与实现

> **摘要**：在多 Agent 协作场景中，如何在保证安全隔离的前提下实现上下文共享是一个关键挑战。本文详细介绍了一套基于共享文件系统的上下文协议，从背景问题、设计原则、安全规则到完整实施方案。

---

## 一、背景与问题

### 1.1 场景描述

在使用 OpenClaw 构建多 Agent 系统时，我们遇到了一个典型问题：

**主 Agent** 接收用户请求，需要创建 **Subagent** 执行具体任务（如下载视频、处理文件等）。Subagent 执行任务时需要访问某些配置信息（如认证凭据、输出目录、工具配置等），但这些信息：

1. 不能直接写在 task prompt 中（可能包含敏感信息）
2. Subagent 无法访问主 Agent 的会话历史（上下文隔离）
3. 每次手动传递配置既繁琐又容易出错

### 1.2 核心问题

**问题 1：Subagent 上下文隔离**

OpenClaw 的 Subagent 设计为**会话隔离**：
- ✅ 继承：工作区目录、文件系统访问、配置文件
- ❌ 不继承：对话历史、内存变量、工具调用结果

这意味着 Subagent 看不到主 Agent"知道"但未写入文件的信息。

**问题 2：敏感数据保护**

某些配置（如认证 cookies、API tokens）属于敏感数据：
- 不能直接存储在共享文件中
- 不能让所有 Agent 都能访问
- 需要分级管理和访问控制

**问题 3：状态同步**

多个 Agent 并行工作时：
- 如何知道其他 Agent 正在执行什么任务？
- 如何避免重复工作？
- 如何追踪任务执行历史？

---

## 二、设计原则

### 2.1 数据分级

我们将数据分为四个安全级别：

| 级别 | 内容 | 存储方式 | 访问控制 |
|------|------|----------|----------|
| **L1 公开** | 任务状态、文件路径、时间戳 | 明文 JSON | 所有 Agent 可读 |
| **L2 内部** | 配置参数、API 端点 | 明文 JSON | 仅信任 Agent 可读 |
| **L3 敏感** | Cookies、Token、密码 | 加密或外部引用 | 仅主 Agent 可写 |
| **L4 禁止** | 用户隐私、密钥原文 | ❌ 禁止存储 | N/A |

### 2.2 配置分层

```
L1 全局配置 (~/.config/yt-dlp/config)  → 所有 agent 自动继承
L2 共享上下文 (/home/lqh/data/shared/context/) → subagent 只读
L3 任务定义 (/home/lqh/data/shared/tasks/) → 每任务隔离
L4 敏感数据 (~/.openclaw/) → 仅主 agent 访问
```

### 2.3 最小权限原则

Subagent 只需要知道：
- ✅ 输出文件路径
- ✅ 使用全局配置（无需知道配置内容）
- ✅ 任务完成后的状态更新路径

Subagent 不需要知道：
- ❌ cookies 内容
- ❌ API keys
- ❌ 其他任务的信息

---

## 三、架构设计

### 3.1 目录结构

```
/home/lqh/data/shared/
├── context/              # 上下文摘要（核心）
│   └── agent-state.json        # 当前状态和共享配置
├── tasks/                # 任务队列
│   ├── [task-id].json          # 任务定义
│   └── [task-id]/
│       └── log.md              # 执行日志
├── artifacts/            # 交付物
│   ├── downloads/              # 下载文件
│   └── documents/              # 文档
├── logs/                 # 审计日志
│   └── access.log              # 访问记录
└── scripts/              # 工具脚本
    └── setup-agent.sh          # 新 agent 配置脚本
```

### 3.2 核心文件设计

#### agent-state.json

共享配置中心，包含：

```json
{
  "$schema": "agent-state-v1",
  "lastUpdated": "2026-03-29T10:55:00+08:00",
  "updatedBy": "agent:main",
  
  "sharedConfig": {
    "twitter": {
      "configPath": "/home/lqh/.config/yt-dlp/config",
      "downloadDir": "/home/lqh/data/",
      "namingConvention": "YYYY-MM-DD-HHMMSS-x-video.mp4",
      "note": "使用全局配置文件，subagent 无需知道 cookie 内容"
    }
  },
  
  "activeTasks": [
    {
      "taskId": "dl-20260329-005",
      "type": "video_download",
      "status": "running",
      "spawnedAt": "2026-03-29T10:44:00+08:00"
    }
  ],
  
  "completedToday": [
    {
      "taskId": "dl-20260329-001",
      "type": "video_download",
      "outputFile": "/home/lqh/data/2026-03-29-093300-x-video.mp4",
      "fileSize": "92MB",
      "completedAt": "2026-03-29T09:40:00+08:00"
    }
  ],
  
  "securityBoundary": {
    "sensitiveDataLocation": "external_config_files",
    "subagentAccessLevel": "read_only_context",
    "auditLogEnabled": true
  }
}
```

**关键设计**：
- `sharedConfig` 只存储**配置路径引用**，不存储敏感内容
- `activeTasks` 追踪当前执行中的任务
- `completedToday` 记录今日完成任务（便于用户查询）
- `securityBoundary` 声明安全边界

#### 任务文件模板

```json
{
  "$schema": "task-v1",
  "taskId": "dl-20260329-005",
  "type": "video_download",
  "priority": "normal",
  
  "status": {
    "state": "pending",
    "createdAt": "2026-03-29T10:44:00+08:00",
    "createdBy": "agent:main",
    "updatedAt": null,
    "completedAt": null
  },
  
  "input": {
    "url": "https://example.com/video/xxx",
    "outputDir": "/home/lqh/data/",
    "outputName": "2026-03-29-104400-x-video.mp4"
  },
  
  "config": {
    "useGlobalConfig": true,
    "configFile": "~/.config/yt-dlp/config",
    "cleanupTemp": true
  },
  
  "output": {
    "expectedArtifacts": [
      "/home/lqh/data/2026-03-29-104400-x-video.mp4"
    ],
    "logPath": "/home/lqh/data/shared/tasks/dl-20260329-005/log.md"
  },
  
  "handoff": {
    "onComplete": [
      "写入输出文件到 outputDir",
      "写入日志到 logPath",
      "更新任务状态为 completed",
      "更新 agent-state.json 的 completedToday"
    ],
    "onError": [
      "更新任务状态为 failed",
      "在日志中写入错误信息",
      "清理临时文件"
    ]
  }
}
```

---

## 四、协议规范

### 4.1 强制读取规则

**主 Agent 在以下场景必须读取共享上下文**：

| 场景 | 读取文件 | 目的 |
|------|----------|------|
| 用户查询历史任务 | `context/agent-state.json` | 查找 completedToday |
| 创建 subagent | `context/agent-state.json` | 获取共享配置 |
| 执行重复任务 | `tasks/*.json` | 参考历史配置 |

**Subagent 启动时强制流程**：

```markdown
## 📖 第一步：读取共享上下文（强制）

在开始任何工作前，你必须先读取：

1. /home/lqh/data/shared/context/agent-state.json
   - 获取共享配置
   - 了解当前活跃任务

2. /home/lqh/data/shared/tasks/[task-id].json
   - 获取任务详细定义

### 读取后确认：
- [ ] 共享配置已加载
- [ ] 任务输入已理解
- [ ] 所需工具/配置可用
```

### 4.2 强制写入规则

**每次完成以下操作后必须更新共享文件**：

| 操作 | 写入文件 | 内容 |
|------|----------|------|
| 创建任务 | `tasks/[task-id].json` | 任务定义 |
| 任务完成 | `tasks/[task-id].json` | 状态 → completed |
| 任务完成 | `context/agent-state.json` | 添加到 completedToday |
| 配置变更 | `context/agent-state.json` | 更新 sharedConfig |
| 产生交付物 | `context/agent-state.json` | 记录文件路径 |

### 4.3 安全规则

**绝对禁止**：
- ❌ 在共享文件存储完整 cookies/token/密码
- ❌ Subagent 访问 `~/.openclaw/openclaw.json`
- ❌ 日志中记录敏感信息

**正确做法**：
- ✅ 敏感数据使用全局配置文件（如 `~/.config/yt-dlp/config`）
- ✅ 共享文件只存储路径引用
- ✅ 所有访问记录到 `logs/access.log`

---

## 五、实施步骤

### 5.1 创建共享目录

```bash
# 创建目录结构
mkdir -p /home/lqh/data/shared/{context,tasks,artifacts/{downloads,documents},logs,scripts}

# 设置权限（仅当前用户可访问共享目录）
chmod 700 /home/lqh/data/shared
chmod 700 /home/lqh/data/shared/context

# 设置配置文件权限
chmod 600 /home/lqh/data/shared/context/*.json
```

### 5.2 配置全局 openclaw.json

在 `~/.openclaw/openclaw.json` 中添加：

```json
{
  "agents": {
    "defaults": {
      "workspace": "/home/lqh/.openclaw/workspace",
      "sharedContext": {
        "enabled": true,
        "contextPath": "/home/lqh/data/shared/context/agent-state.json",
        "tasksPath": "/home/lqh/data/shared/tasks/",
        "artifactsPath": "/home/lqh/data/shared/artifacts/",
        "logsPath": "/home/lqh/data/shared/logs/",
        "forceRead": {
          "onSpawn": true,
          "beforeUserResponse": true,
          "beforeTaskExecution": true
        },
        "forceWrite": {
          "onTaskComplete": true,
          "onConfigChange": true,
          "onArtifactCreated": true
        },
        "security": {
          "forbiddenPaths": ["~/.openclaw/openclaw.json", "~/.openclaw/identity/"],
          "sensitiveDataPolicy": "external_config_only"
        }
      },
      "subagents": {
        "model": "bailian/qwen3.5-plus",
        "runTimeoutSeconds": 1800,
        "inheritSharedContext": true,
        "sharedContextTemplate": "/home/lqh/data/shared/templates/task-templates.md"
      }
    }
  }
}
```

### 5.3 更新 AGENTS.md

在工作区的 `AGENTS.md` 中添加共享上下文协议章节：

```markdown
## 🔄 共享上下文协议（强制）

### 📖 强制读取（行动前）

每次响应用户前，如果是以下场景，必须先读取共享上下文：

- 用户查询历史任务 → 读取 `context/agent-state.json.completedToday`
- 创建 subagent → 读取 `context/agent-state.json` 获取配置
- 执行重复任务 → 参考历史任务记录

### 📤 强制写入（行动后）

每次完成以下操作后，必须更新共享文件：

- 创建任务 → `tasks/[task-id].json`
- 任务完成 → 更新状态 + `completedToday`
- 配置变更 → `context/agent-state.json`
- 产生交付物 → 记录文件路径

### ⚠️ 安全规则

- ❌ 禁止读取 `~/.openclaw/openclaw.json`
- ❌ 禁止在共享文件存储敏感数据
- ✅ 使用全局配置文件
- ✅ 共享文件只存储路径引用
```

### 5.4 创建自动化脚本

创建 `setup-agent.sh` 脚本，用于快速配置新 Agent：

```bash
#!/bin/bash

AGENT_ID="${1:-}"

if [ -z "$AGENT_ID" ]; then
    echo "用法：$0 <agent-id>"
    exit 1
fi

AGENT_DIR="/home/lqh/.openclaw/agents/${AGENT_ID}"
AGENT_WORKSPACE="${AGENT_DIR}/agent"

# 复制 AGENTS.md（包含共享上下文协议）
cp /home/lqh/.openclaw/workspace/AGENTS.md "${AGENT_WORKSPACE}/AGENTS.md"

# 创建 config.json
cat > "${AGENT_WORKSPACE}/config.json" << EOF
{
  "name": "${AGENT_ID^} Agent",
  "sharedContext": {
    "enabled": true,
    "contextPath": "/home/lqh/data/shared/context/agent-state.json"
  }
}
EOF

echo "✅ Agent 配置完成！"
```

---

## 六、使用示例

### 6.1 创建并执行任务

```bash
# 1. 主 Agent 读取共享配置
context = read('/home/lqh/data/shared/context/agent-state.json')

# 2. 创建任务文件
task = {
  "taskId": "dl-20260329-005",
  "type": "video_download",
  "input": {
    "url": "https://example.com/video/xxx",
    "outputName": "2026-03-29-104400-x-video.mp4"
  }
}
write('/home/lqh/data/shared/tasks/dl-20260329-005.json', task)

# 3. 更新活跃任务
context.activeTasks.push({ taskId: "dl-20260329-005", status: "pending" })
write('/home/lqh/data/shared/context/agent-state.json', context)

# 4. Spawn subagent（task 包含强制读取指令）
sessions_spawn({
  task: `
    ## 📖 第一步：读取共享上下文（强制）
    1. 读取 /home/lqh/data/shared/context/agent-state.json
    2. 读取 /home/lqh/data/shared/tasks/dl-20260329-005.json
    
    ## 🔧 执行任务
    ...
  `
})
```

### 6.2 Subagent 执行流程

```javascript
// 1. 【强制】读取共享上下文
const context = read('/home/lqh/data/shared/context/agent-state.json');
const task = read('/home/lqh/data/shared/tasks/dl-20260329-005.json');

// 2. 确认配置可用（使用全局配置，不接触敏感数据）
// yt-dlp 自动读取 ~/.config/yt-dlp/config

// 3. 执行任务
exec(`yt-dlp "${task.input.url}" -o "${task.input.outputDir}${task.input.outputName}"`);

// 4. 写入执行日志
write('/home/lqh/data/shared/tasks/dl-20260329-005/log.md', logContent);

// 5. 更新任务状态
task.status.state = 'completed';
task.status.completedAt = new Date().toISOString();
write('/home/lqh/data/shared/tasks/dl-20260329-005.json', task);

// 6. 更新 agent-state.json
context.activeTasks = context.activeTasks.filter(t => t.taskId !== task.taskId);
context.completedToday.push({
  taskId: task.taskId,
  outputFile: task.input.outputDir + task.input.outputName,
  fileSize: '92MB'
});
write('/home/lqh/data/shared/context/agent-state.json', context);

// 7. Announce 完成
```

### 6.3 用户查询历史

```
用户：今天下载的视频在哪？
     ↓
主 Agent：
1. 读取 context/agent-state.json.completedToday
2. 回答：今天下载了 4 个视频，分别是...
```

---

## 七、验证与测试

### 7.1 配置验证

```bash
# 检查全局配置
grep -A 3 '"sharedContext"' /home/lqh/.openclaw/openclaw.json

# 检查 agent 配置
ls -la /home/lqh/.openclaw/agents/<agent-id>/agent/

# 检查协议是否生效
grep "共享上下文" /home/lqh/.openclaw/agents/<agent-id>/agent/AGENTS.md
```

### 7.2 功能测试

```bash
# 查看访问日志
tail /home/lqh/data/shared/logs/access.log

# 查看今日完成任务
cat /home/lqh/data/shared/context/agent-state.json | jq '.completedToday'

# 查看活跃任务
cat /home/lqh/data/shared/context/agent-state.json | jq '.activeTasks'
```

### 7.3 测试清单

- [ ] Subagent 是否自动读取共享配置
- [ ] 任务状态是否正确更新
- [ ] 访问日志是否正常记录
- [ ] 敏感数据是否已隔离
- [ ] 用户能否查询历史任务

---

## 八、最佳实践

### 8.1 配置分层

```
L1 全局配置 → 所有 agent 自动继承
L2 共享上下文 → subagent 只读
L3 任务定义 → 每任务隔离
L4 敏感数据 → 仅主 agent 访问
```

### 8.2 原子更新

使用临时文件 + 重命名确保原子性：

```javascript
function atomicWrite(path, content) {
  const tmp = path + '.tmp.' + Date.now();
  write(tmp, content);
  exec(`mv ${tmp} ${path}`);
}
```

### 8.3 审计日志

所有文件访问记录到 `access.log`：

```
时间戳 | Agent ID | 操作 | 路径 | 结果
2026-03-29T10:44:00+08:00 | agent:main | READ | context/agent-state.json | SUCCESS
```

### 8.4 定期清理

| 文件类型 | 保留时间 | 清理方式 |
|----------|----------|----------|
| 已完成任务 | 7 天 | 移动到 archive/ |
| 失败任务 | 30 天 | 保留用于调试 |
| 访问日志 | 90 天 | 轮转压缩 |

---

## 九、常见问题

### Q1: Subagent 找不到配置文件？

**检查**：
1. 文件路径是否正确
2. 文件权限是否允许读取
3. JSON 格式是否有效

**解决**：
```bash
# 检查权限
ls -la /home/lqh/data/shared/context/

# 验证 JSON
cat /home/lqh/data/shared/context/agent-state.json | jq .
```

### Q2: 如何避免敏感数据泄露？

**原则**：
- 敏感数据使用全局配置文件
- 共享文件只存储路径引用
- 日志中不记录敏感信息

**示例**：
```json
// ✅ 正确
{
  "configPath": "/home/lqh/.config/yt-dlp/config"
}

// ❌ 错误
{
  "cookies": "完整 cookie 字符串..."
}
```

### Q3: 新 Agent 如何快速配置？

**使用自动化脚本**：
```bash
openclaw agents add --id downloader
/home/lqh/data/shared/scripts/setup-agent.sh downloader
```

---

## 十、总结

### 核心优势

1. **安全隔离**：敏感数据与共享数据分离
2. **自动继承**：Subagent 自动读取共享配置
3. **状态可追溯**：完整记录任务执行历史
4. **易于扩展**：新 Agent 只需 2 步配置

### 适用场景

- 多 Agent 协作任务
- 需要状态同步的并行工作
- 敏感数据需要保护的场景
- 需要审计日志的生产环境

### 未来改进

- 支持加密敏感数据
- 实现自动备份和恢复
- 添加可视化监控界面
- 支持分布式部署

---

## 附录：完整文档索引

| 文档 | 路径 | 用途 |
|------|------|------|
| 协议详解 | `/home/lqh/data/shared/PROTOCOL.md` | 读写规则 |
| 使用指南 | `/home/lqh/data/shared/USAGE.md` | 日常使用 |
| 快速参考 | `/home/lqh/data/shared/QUICK-REFERENCE.md` | 速查卡片 |
| Task 模板 | `/home/lqh/data/shared/templates/task-templates.md` | 标准模板 |
| 新 Agent 指南 | `/home/lqh/data/shared/NEW-AGENT-GUIDE.md` | 配置指南 |

---

**作者**: AI 助理  
**日期**: 2026 年 3 月 29 日  
**标签**: OpenClaw, Agent, 架构设计，多 Agent 协作
