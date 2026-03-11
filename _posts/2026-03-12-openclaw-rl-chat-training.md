---
title: "OpenClaw-RL：通过聊天训练你的 Agent"
date: 2026-03-12T00:30:00+08:00
layout: post
categories: [AI, 技术]
tags: ["搬运", "OpenClaw", "RL", "Agent", "强化学习"]
---

最近在 GitHub 上看到一个挺有意思的项目：OpenClaw-RL。

这个项目的 slogan 很直接：

> Train any agent simply by talking.

简单说一句话总结就是：

**通过日常聊天，把 Agent 训练得越来越好。**

我觉得它的思路其实挺值得关注的，因为它代表了 Agent 训练范式的一种变化。

今天简单聊聊这个项目，以及我为什么觉得它有意思。

## 一、现在 Agent 的一个核心问题

如果你最近在做 Agent，其实会发现一个现实问题：

**Agent 很难持续变聪明。**

绝大多数 Agent 系统其实是这样的：

```
用户 → Prompt → LLM → Tool → 返回结果
```

如果结果不好，一般的解决方法只有几个：

- 改 prompt
- 加 tool
- 加 workflow
- 换模型

但问题是：

**Agent 很少能从交互中持续学习。**

也就是说：

> Agent 每次犯的错误，下次还会再犯。

这其实是现在大部分 Agent 系统的结构性问题。

原因也很简单：

**LLM 推理系统和训练系统是分离的。**

## 二、传统 RLHF 的一个限制

在 LLM 领域，模型变好的主要方式还是：

**RLHF / RL**

但传统 RLHF 有几个特点：

**1️⃣ 离线训练**

需要准备数据集，然后再统一训练。

**2️⃣ 训练与使用分离**

典型流程：

```
数据收集 → 训练 → 发布新模型
```

用户在使用过程中：

**模型其实不会实时变好。**

**3️⃣ 成本高**

做 RLHF 通常需要：

- 大规模标注
- 训练集构建
- RL pipeline

这对大多数团队来说门槛不低。

## 三、OpenClaw-RL 的核心想法

这个项目的思路其实挺简单：

**把 RL 融入到 Agent 的日常对话中。**

也就是：

```
用户聊天 → 系统自动收集轨迹 → 评估回答质量 → 后台持续训练
```

换句话说：

**你用 Agent 的过程，本身就是训练数据。**

项目里有一句话我觉得说得挺清楚：

> turns everyday conversations into training signals.

## 四、架构其实很 AI Infra

OpenClaw-RL 的架构也挺典型的 AI Infra 风格：

它把整个系统拆成 4 个异步组件：

```
Agent Serving
│
▼
Rollout Collection
│
▼
PRM Judging
│
▼
Policy Training
```

关键点在于：

**全部是异步的。**

也就是说：

- 用户继续使用 Agent
- 后台继续训练
- 不互相阻塞

README 里的架构图其实表达的是这样一个 loop：

```
Conversation
↓
Trajectory
↓
Reward / Hint
↓
Policy Update
```

这其实很接近一个在线 RL 系统。

## 五、这个项目有两个训练模式

项目里做了两个不同的 RL 方法。

### 1 Binary RL（GRPO）

这个比较接近 RLHF 的思路。

通过一个 Process Reward Model 给回答打分：

```
good
bad
neutral
```

然后使用：

**GRPO + PPO-style loss**

进行优化。

### 2 OPD（On-Policy Distillation）

这个更有意思一点。

它不是只给一个 reward。

而是从用户反馈中提取 hint：

比如用户说：

> 你应该先检查这个文件。

系统会把这个 hint 加入 prompt：

```
Original prompt + hint
```

然后生成一个 teacher response。

再做：

```
student vs teacher
token-level distillation
```

也就是：

**通过 hindsight hints 来优化模型。**

## 六、这个项目的一个关键点

我觉得这个项目最有意思的不是算法。

而是一个方向：

**Agent 的训练会逐渐在线化。**

未来的 Agent 系统可能会是：

```
Use → Learn → Improve
```

持续循环。

而不是现在的：

```
Use → Collect data → Train → Release
```

这其实是两个完全不同的系统设计。

## 七、为什么我觉得这个方向值得关注

这件事情如果继续发展，其实会带来一个很大的变化：

**Agent 会越来越像软件系统，而不是模型。**

未来可能是这样：

```
Agent Runtime
+ Memory
+ RL Loop
+ Skill Learning
```

而不是单纯：

```
LLM API
```

这也是为什么现在越来越多的项目在做：

- Agent RL
- Skill learning
- Self-improvement
- Memory training

OpenClaw-RL 其实就在探索这一类问题。

## 八、和 AI Infra 的关系

从基础设施角度看，这类系统也很有意思。

因为它其实需要一套新的基础设施：

```
Agent Serving
Trajectory Storage
Reward Model
RL Training
Model Update
```

也就是说：

**Agent Runtime + RL Infrastructure**

这其实可能会成为一个新的基础设施层。

## 九、这个项目现在还比较早期

当然，这个项目现在还是比较 early stage：

- 需要多 GPU
- 训练成本不低
- 工程复杂度比较高

但我觉得它的思路挺值得关注。

因为它回答了一个关键问题：

> Agent 如何持续变聪明？

## 十、一个值得观察的方向

我最近其实在越来越多看到一种趋势：

**Agent 系统正在从 Prompt Engineering 走向 RL Systems。**

过去大家主要在做：

- prompt
- workflow
- tool

但未来很可能会变成：

- trajectory
- reward
- policy optimization

也就是说：

**Agent 会越来越像一个 RL system。**

## 结语

如果你在做 Agent 或者 AI Infra，我觉得这个项目可以看一下：

https://github.com/Gen-Verse/OpenClaw-RL

不一定马上用得上，但它代表了一种挺有意思的方向：

**让 Agent 在真实使用中持续学习。**

如果未来 Agent 能做到：

> 越用越聪明

那很多 AI 系统的形态可能都会发生变化。
