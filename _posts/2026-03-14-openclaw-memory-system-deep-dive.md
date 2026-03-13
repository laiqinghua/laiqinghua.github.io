---
layout: post
title: OpenClaw 记忆系统深度解析：实现原理与优化实践
date: 2026-03-14T00:30:00+08:00
categories: [OpenClaw, AI Agent]
tags: [OpenClaw,记忆系统，Agent 架构，技术解析]
description: 深入剖析 OpenClaw 的记忆系统实现机制，从 Markdown 存储到向量搜索，从会话管理到上下文压缩，全面解析 AI Agent 如何记住你的偏好与历史
---

# OpenClaw 记忆系统深度解析：实现原理与优化实践

作为一名长期使用 OpenClaw 的开发者，我经常被问到这样一个问题：你的 AI 助理是怎么记住我的偏好的？它会不会忘记我们之前聊过什么？今天，我就带大家深入 OpenClaw 的记忆系统，从底层实现到优化策略，一次性讲清楚这个让 AI 拥有长期记忆的核心机制。

## 一、记忆系统的核心设计理念

OpenClaw 的记忆系统有一个非常朴素但强大的设计哲学：**文件即真相**（Files are the source of truth）。这意味着 AI 模型本身并不真正记忆任何东西，它只记住当前写入磁盘的内容。这种设计有几个关键优势：

第一，**可审计性**。所有的记忆都以 Markdown 文件的形式存储在本地，你可以随时查看、编辑、删除任何记忆。这比黑盒式的向量数据库透明得多。

第二，**可移植性**。记忆文件就是普通的文本文件，可以轻松备份、同步、迁移。换个机器，复制粘贴就能恢复所有记忆。

第三，**可控性**。你可以精确控制什么信息应该被记住，什么信息应该被遗忘。

## 二、双层记忆架构

OpenClaw 采用了双层记忆结构，分别对应不同的记忆粒度：

### 1. 日常记忆层（memory/YYYY-MM-DD.md）

这是按日期组织的日志文件，采用追加写入的方式。每次会话开始时，系统会自动读取今天和昨天的日志文件，为 AI 提供近期的上下文。

这种设计非常符合人类的记忆模式：我们往往对最近发生的事情记得更清楚，而对久远的记忆会逐渐模糊。

### 2. 长期记忆层（MEMORY.md）

这是经过筛选和整理的长期记忆，存储那些真正重要的信息，比如用户的偏好、关键决策、重要事实等。

有一个重要的安全设计：MEMORY.md 只在主会话（与用户的私聊）中加载，在群聊或共享上下文中不会加载。这是为了防止敏感信息泄露给其他人。

## 三、记忆工具的实现机制

OpenClaw 为 AI 提供了两个核心工具来操作记忆：

### memory_search：语义检索

这个工具允许 AI 通过自然语言查询来搜索记忆。比如 AI 可以问：用户之前提到过哪些技术偏好？系统会返回相关的记忆片段。

实现原理上，OpenClaw 会为记忆文件构建一个小型的向量索引。当启用向量搜索时，系统会：

1. 监听记忆文件的变化（防抖动处理）
2. 使用嵌入模型（Embedding Model）将文本转换为向量
3. 将向量存储到 SQLite 数据库中（使用 sqlite-vec 扩展加速）
4. 查询时计算查询向量与存储向量的相似度

支持的嵌入模型包括：
- 远程模型：OpenAI、Gemini、Voyage、Mistral
- 本地模型：Ollama、node-llama-cpp

### memory_get：精确读取

当 AI 知道需要读取哪个具体文件时，可以使用 memory_get 工具。这个工具支持指定文件路径和行号范围，实现精确的内容读取。

有趣的是，memory_get 在文件不存在时会优雅降级，返回空字符串而不是抛出错误。这样 AI 就不需要处理复杂的异常逻辑，可以直接继续工作流。

## 四、向量搜索与 QMD 后端

OpenClaw 的向量搜索功能有一个实验性的后端：QMD（Query Memory Database）。这是一个本地优先的搜索侧车，结合了 BM25 关键词搜索、向量搜索和重排序。

### QMD 的工作原理

1. **索引构建**：QMD 会为指定的 Markdown 文件创建索引，包括全文索引和向量索引
2. **混合搜索**：查询时同时执行 BM25 和向量搜索，然后对结果进行重排序
3. **本地运行**：整个过程完全在本地执行，不需要外部 API

配置示例：

```json5
memory: {
  backend: "qmd",
  citations: "auto",
  qmd: {
    includeDefaultMemory: true,
    update: { interval: "5m", debounceMs: 15000 },
    limits: { maxResults: 6, timeoutMs: 4000 },
    paths: [
      { name: "docs", path: "~/notes", pattern: "**/*.md" }
    ]
  }
}
```

### 性能优化

第一次搜索可能会比较慢，因为 QMD 需要下载本地的 GGUF 模型（用于重排序和查询扩展）。可以通过预下载模型来优化：

```bash
STATE_DIR="${OPENCLAW_STATE_DIR:-$HOME/.openclaw}"
export XDG_CONFIG_HOME="$STATE_DIR/agents/main/qmd/xdg-config"
export XDG_CACHE_HOME="$STATE_DIR/agents/main/qmd/xdg-cache"
qmd update
qmd embed
qmd query "test" -c memory-root --json >/dev/null 2>&1
```

## 五、会话管理与上下文压缩

记忆系统不仅仅包括长期存储，还包括会话级别的上下文管理。这里有两个关键概念：

### 会话压缩（Compaction）

当会话历史过长，接近模型的上下文窗口限制时，OpenClaw 会自动触发压缩。压缩会将早期的对话内容总结成一个紧凑的摘要，同时保留最近的对话不变。

压缩是持久化的，会写入会话的 JSONL 历史记录中。你可以通过 `/compact` 命令手动触发压缩。

### 会话修剪（Pruning）

修剪与压缩不同，它只会在内存中移除旧的工具结果，不会修改磁盘上的历史记录。这是一种轻量级的上下文管理方式。

### 预压缩记忆刷新

这是一个非常聪明的设计：当会话接近自动压缩时，OpenClaw 会触发一个静默的 AI 回合，提醒模型在压缩之前将重要的记忆写入磁盘。

配置示例：

```json5
agents: {
  defaults: {
    compaction: {
      reserveTokensFloor: 20000,
      memoryFlush: {
        enabled: true,
        softThresholdTokens: 4000,
        systemPrompt: "Session nearing compaction. Store durable memories now.",
        prompt: "Write any lasting notes to memory/YYYY-MM-DD.md; reply with NO_REPLY if nothing to store.",
      },
    },
  },
}
```

这个机制确保了重要的信息不会在压缩过程中丢失。

## 六、优化实践与建议

基于我对 OpenClaw 记忆系统的使用经验，以下是一些优化建议：

### 1. 合理配置向量搜索

如果你的网络环境允许，建议使用远程嵌入模型（如 Gemini 或 OpenAI），因为它们通常比本地模型更准确。如果注重隐私或离线使用，可以选择 Ollama 本地模型。

### 2. 定期整理 MEMORY.md

虽然系统会自动管理日常记忆，但长期记忆需要定期整理。建议每隔几天回顾一下 MEMORY.md，移除过时的信息，添加新的洞察。

### 3. 利用心跳机制

OpenClaw 的心跳机制可以用来定期检查重要信息，比如邮件、日历、天气等。将这些检查项写入 HEARTBEAT.md，让 AI 主动为你服务。

### 4. 会话隔离策略

如果你的 Agent 会接收多个人的消息，强烈建议启用安全 DM 模式：

```json5
session: {
  dmScope: "per-channel-peer",
}
```

这样可以避免不同用户之间的上下文泄露。

### 5. 磁盘空间管理

对于高频使用的场景，建议配置会话维护策略：

```json5
session: {
  maintenance: {
    mode: "enforce",
    pruneAfter: "45d",
    maxEntries: 800,
    rotateBytes: "20mb",
    maxDiskBytes: "1gb",
    highWaterBytes: "800mb",
  },
}
```

## 七、总结

OpenClaw 的记忆系统是一个设计精巧、灵活可扩展的架构。它通过简单的 Markdown 文件实现了复杂的记忆管理功能，既保证了透明性和可控性，又提供了强大的检索和压缩能力。

作为一个技术爱好者，我特别欣赏这种文件即真相的设计理念。它让 AI 的记忆不再是黑盒，而是变成了我们可以理解、可以控制、可以信任的工具。

如果你也在使用 OpenClaw，不妨花点时间配置一下记忆系统，让它更好地为你服务。毕竟，一个好的记忆系统，就是 AI 助理的灵魂所在。

---

**参考资料**

- OpenClaw 官方文档：https://docs.openclaw.ai
- 记忆系统概念：https://docs.openclaw.ai/concepts/memory.md
- 会话管理：https://docs.openclaw.ai/concepts/session.md
- 上下文压缩：https://docs.openclaw.ai/concepts/compaction.md
