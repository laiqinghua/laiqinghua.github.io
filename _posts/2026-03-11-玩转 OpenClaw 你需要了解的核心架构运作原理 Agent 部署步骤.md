---
title: "玩转 OpenClaw，你需要了解的：核心架构、运作原理、Agent 部署步骤"
date: 2026-03-11T16:53:00+08:00
categories: AI 技术
tags: [搬运，OpenClaw, Agent, 多 Agent 部署，架构]
layout: post
---

作者：冰以东

建议有打算深入了解 OpenClaw 的同学优先看 OpenClaw 源码和官方文档，目前该项目正在高频迭代中。本文重点从核心框架、通信机制进行介绍，争取让你看完本文后知道 OpenClaw 是怎么运作的，以及其能力边界在哪里。以及尤其希望大家注意的，是 OpenClaw 的安全风险，如果选择部署 OpenClaw，就按最坏的打算 (数据全 Open) 去对待自己机器上的数据。

## 前言

### （一）OpenClaw 到底有什么不同？

最近半年 AI 领域的产品层出不穷，在 OpenClaw 爆火之前比较类似的产品是 Claude 的 Happy(一款 Claude code ssh 软件)。

喜欢使用 happy 的朋友经常问我的一句话是:"OpenClaw 那么好玩吗？跟 Happy 有什么区别？"

当初看到 OpenClaw 的功能之后我立马被吸引住，在面对这个问题后，我正好从抽象层面总结一下 OpenClaw 的优势所在。

#### 1、OpenClaw 技术框架不复杂，它的优势在于共识的推广

作为程序员，为了让大家直观理解 OpenClaw 的项目架构强度。在看完 OpenClaw 框架后，我先斗胆做个类比，大概说一下 OpenClaw 的技术难度：大概就类似 AI Coding 诞生前，具备「初级推荐算法的前后端通信 App」的难度。

做过几年开发的同学都知道，这其实并不难，所以技术框架并不是 OpenClaw 的亮点。

OpenClaw 的优势在于共识的推广，举个具体的例子，在没有 OpenClaw 之间，我们基本人手一个自己搭建的 Agent，像我之前搭建的 L1~L5 5 层架构 Agent：

![5 层架构 Agent](/assets/imagess/post/OpenClaw 架构 - 图片 1.png)

相信每个搭 Agent 架构的同学，都得考虑 skills 管理、Agent 身份赋予、Agent 架构自进化、memory-search 和 Session 管理这些。

这就导致一个问题：每次我跟朋友交流 Agent 之前，都是要先简单介绍一下各自 Agent 的架构，然后再聊具体的落地 Case，Session、memory 管理的方案，可能都得先聊半天。

但 OpenClaw 把 Agent 架构推广之后，我们基于 OpenClaw 搭建个人 Agent 后，就不用再介绍 Agent 架构是什么了，我们再聊的话题就是：怎么保活、怎么进一步替换 rag 算法库、怎么部署多 Agent、怎么应用 good case。

简直丝滑爆了。

#### 2、多 Agent 的天然支持

熟悉 LLM 底层原理的同学都知道，LLM 成也 transformer，目前卡脖子的地方，也在 transformer。Context 的瓶颈严格约束了单 Agent 智能的发挥。

传统 Prompt 定义 Agent 身份，再加上层出不穷的 skills，正在一步一步蚕食 LLM 的 Context 窗口。

为了更好使用 LLM，专事专做似乎已经变成更好使用 Agent 的共识。

#### 3、做和 AI 能力正交的事情

AI 时代，选择不做什么事情和选择做什么事情一样重要。

一年前跟 Manus 的朋友聊天时，当时他就分享过一个观点：要做和 AI 能力正交的事情。

花时间精力打造和迭代自己的 Agent，其实就是跟 AI 能力正交的一件事，跟培养一个人一样，他可以是很聪明，但他认知世界和做事的能力，需要我们来教导他，这是千人千面的一个话题。

当 AI 模型越来越聪明，我们只需要升级 Agent 使用的底层 LLM 即可，那些跟 AI 交互留下来的长期数据，都将会变成我们未来更好驱动 AI 的私人宝贵数据。

### （二）我想部署 OpenClaw，必须要买机器吗？

买机器不是必须的，目前使用 OpenClaw 有 2 种主流方案：云机和自部署。

下面我按顺序介绍一下。

#### 1、云机

腾讯云官网现在已经支持云机部署 OpenClaw，也十分便捷。

如果能接受云机的操作习惯，这种方式是最合适的，不需要用实体机，数据也可以随时 download 下来。

#### 2、自部署

接下来介绍一下自部署，这可能是大家最关心的。

（1）Mac 和 Windows 怎么选？

OpenClaw 的部署和诸多工具，对 Mac 环境天然友好。如果可以，最好选 Mac。Windows 当然也可以部署，就是折腾一些，网上都有教程，这里就不展开说了。

（2）Mac 的配置怎么选？

因为 OpenClaw 部署之后基本就在本地运行着，所以 Mac 系列优先推荐 Mac Mini。

其次关于 Mac Mini 的配置，这里主要涉及 3 个指标：芯片、内存和磁盘。

a. 芯片

从软件适配出发，既然都采用 Mac Mini 的方案了，那么至少要是 M 系列的芯片。

其次，M1~M4，要看部署时的诉求，如果平时不需要跑文生图、文生视频的本地模型，那么 M1 芯片是性价比最高的。OpenClaw 运行时基本都只是调各种 api，不怎么吃性能。

b. 内存

内存的诉求也是看是否需要本地部署文生图、文生视频的模型，如果需要部署模型，还是建议 24g 内存。

c. 磁盘

磁盘的诉求也是看是否需要本地部署文生图、文生视频的模型，ComfyUI 上的模型，动辄都是 30G 起步，所以如果用来跑本地模型，至少 256G 起步。

目前 Mac Mini M1 1TB 市场价 3K 左右，MacMini M4 512g 大概 7k 左右。

不成熟的建议就是：既然都打算部署本地模型了，建议多花 4K 玩个大满配，以后给家里小朋友做文生图、文生视频，不用付费买 API，还是很香的。

### （三）OpenClaw 推荐使用哪个 IM 工具？

这是容易踩坑的地方，筛选 IM 工具，我总结下来有 3 个原则：安全性、可用性、易用性。

我这里不做推荐，只是建议大家从这 3 个原则里，明确下自己的诉求，来做决策。

#### 1、安全性

从数据隔离的大前提出发，一定要避免个人误操作发送了一些私密内容给 OpenClaw（注意：千万不要把 OpenClaw 当成「文件传输助手」），以及严防习惯 OpenClaw 之后忽略了其安全风险，时刻提醒自己部署 OpenClaw 之后，就是在跟把机器人公开在网上没什么区别，按最坏的情况去预估风险。

#### 2、可用性

这是最容易踩坑的一点，如果你只是部署单 Agent，你会发现还是够用的。

但当你部署多 Agent 之后，你的 IM 调用额度会飞速消耗，我在部署 10 个 Agent 之后，IM 的额度直接耗尽，原因是 OpenClaw 的网关机制中有一个定时快照的逻辑，该快照逻辑会 ping IM，60 秒一次，如果 Agent 很多，IM 额度将很快被消耗完。

所以如果你有多 Agent 的诉求，你需要选一个额度多 (无额度约束) 的 IM。

#### 3、易用性

相比 OpenClaw 推荐的国外 IM 软件，国内的软件易用性还是高一些。

### （四）OpenClaw 的配置麻烦吗？

如果只是把工程 run 起来 + 配置 IM 机器人，半小时足矣。

但如果是配多 Agent，配不同 Agent 的任务分配、调试 Skills、定制 Agent 身份、调试定时任务、自部署模型，那还是比较耗时的，根据 个人经验 + 网上交流经验 + 身边小伙伴配置 的经验，大概需要 2-3 天的时间。

### （五）折腾 OpenClaw，我能有什么收益？

#### 1、技术层面的收益

完整搭建完这套流程后，对 Skills 的理解、对多 Agent 的理解、对自部署模型的理解、对 memory-search 原理的理解、对 Agent 经典架构的理解，都可以上一个层次。

比如这些问题：

"如果让你设计一个 Agent，它的长短期记忆链路你打算怎么设计？"

"如果让你设计一个多 Agent 架构，你会设计哪些通信方式？"

"中大型项目中，怎么对多 Skills 的情况进行管理，怎么避免多 Skills、低质 Skills 爆炸的问题？"

"memory-search 方案的原理是什么，一个完整的 LLM 对话是怎么在 transformer 框架中流转的？"

都可以在折腾 OpenClaw 中自己摸索到，更进一步的，面对当前各种 Vibe 的 Agent 项目，可以比较清晰的看出这类项目的含金量和生命周期，这对我们在 AI 时代做技术方向的判断，都是至关重要的。

#### 2、个人 Jarvis

这个是搭建工具之后，通过发挥个人创意可为自己带来的增益。

简单来说，就是你拥有了个人 Jarvis，你可以用他定制任何你想让它进行的任务。

## 一、OpenClaw 多 Agent 部署

### （一）OpenClaw 的 quick-start

#### 1、快速完成 OpenClaw 的部署工作

（1）部署前需要提前准备的

[1] 选择你的 IM 平台

不同 IM 平台有不同的配置方式，这里按个人喜好选择就好。

[2] 选择你的 LLM Model

LLM Model 越聪明，OpenClaw 发挥就会越好、越稳定。

（2）本机部署 OpenClaw

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

使用如上命令安装 OpenClaw 后，会自动启动 openclaw onboarding，即进入 OpenClaw main Agent 的配置阶段，配置阶段按导引进行配对即可，其中 config skills 的部分可以跳过，后续自己专门配置即可。

注意：

十分不建议使用 Claude Code 来进行 OpenClaw 的配置，CC 目前对 OpenClaw 项目配置的了解还有偏差，极大可能出现"it works,but it also broke"的情况，导致工程后续极难维护，建议还是阅读 OpenClaw 官方文档，使用 OpenClaw 的官方指令配置 Agent。

不过，使用 CC 来辅助 Debug OpenClaw 还是很高效的，推荐流程：

Download OpenClaw 源码到本地 → 让 CC 先学习下 OpenClaw 的源码 → 再让 CC 针对本地 OpenClaw 的配置进行 debug。

给够 CC 充足源码语料后，交付的水平会大幅提升。

### （二）OpenClaw Agent 核心架构介绍

#### 1、Agent 的核心配置项

![Agent 核心配置文件](/assets/imagess/post/OpenClaw 架构 - 图片 2.png)

每个 Agent 都有其对应的 workspace，如图是一个 Agent 最核心的配置文件。其各文件的含义如下：

```
AGENTS.md：Agent 职责声明，决定工具权限
SOUL.md：个性化提示词，注入 system prompt
TOOLS.md：工具白名单/黑名单，安全边界
IDENTITY.md：身份标识（name/avatar），通道展示
USER.md：用户偏好，上下文先验
HEARTBEAT.md：定时任务配置（可选）
BOOTSTRAP.md：首次 onboarding 引导（一次性消费）
MEMORY.md：用户记忆文档（RAG 源）
```

通过查看 OpenClaw 的源码，我们可以找到这么一个方法：

```typescript
src/agents/workspace.ts: 498-555
export async function loadWorkspaceBootstrapFiles(dir: string): Promise<WorkspaceBootstrapFile[]> {
  const entries = [
    { name: "AGENTS.md", filePath: path.join(resolvedDir, "AGENTS.md") },
    { name: "SOUL.md", ... },
    { name: "TOOLS.md", ... },
    { name: "IDENTITY.md", ... },
    { name: "USER.md", ... },
    { name: "HEARTBEAT.md", ... },
    { name: "BOOTSTRAP.md", ... },
  ];
  // + 动态检测 MEMORY.md / memory.md
  for (const entry of entries) {
    const loaded = await readWorkspaceFileWithGuards({...});
    // openBoundaryFile：检查 inode/dev/size/mtime，防止路径穿越
  }
}
```

文件顺序即优先级。AGENTS 定义能力边界，SOUL 注入灵魂，TOOLS 划定禁区，这 8 个文件构成 Agent 的完整人格。

在这里，我大力推荐朋友们阅读 AGENTS.md 这个文件，这个文件详细介绍了一个 Agent 的启动、memory 管理的流程，自我感觉堪称 OpenClaw 最核心的 Prompt 文件。

#### 2、Agent 的启动流程

Agent 不是常驻进程，而是 per-session 的瞬态实例。每个对话都是一次完整的加载 - 执行 - 销毁循环。

通过查看 OpenClaw 的源码，我们可以找到这么一个方法：

```typescript
src/agents/pi-embedded-runner/run/attempt.ts: 1-116
import { createAgentSession, SessionManager } from "@mariozechner/pi-coding-agent";
// 1. 加载 bootstrap 上下文
const bootstrap = await resolveBootstrapContextForRun({...});
// 2. 创建 SessionManager（封装 Pi Agent 的 session 持久化）
const sessionManager = await prepareSessionManagerForRun({
  sessionKey,
  workspaceDir,
  ...
});
// 3. 构建 system prompt（注入 workspace 文件内容）
const systemPrompt = buildEmbeddedSystemPrompt({
  bootstrapFiles: bootstrap.files,
  ...
});
// 4. 创建 agent session
const agentSession = await createAgentSession({
  model,
  systemPrompt,
  sessionManager,
  tools: createOpenClawCodingTools({...}),
  ...
});
```

可以看到，System Prompt 是动态生成的，即每次 run 都会重新读取 workspace 文件，确保配置实时生效。

### （三）OpenClaw Agent 的记忆力机制

了解 OpenClaw Agent 的记忆力机制，对于我们后续精细化对 Agent 优化、管理 skills、学习 Agent 记忆力机制设计方式，都有很大的帮助。

和 OpenClaw 记忆力机制相关的配置有三个：

```
// 会话信息
.openclaw/agents/ceo/sessions/xxxx.jsonl
// 按天记录的 memory
.openclaw/workspace-ceo/memory/YYYY-MM-DD.md
// LLM 精练后的 memory
.openclaw/workspace-ceo/MEMORY.md
```

通过查看.openclaw/agents/ceo/sessions/xxxx.jsonl 文件，我们可以发现该.jsonl 文件记录了会话的记录。

但这时我们会产生如下问题：

#### 1、Session 是怎么实现会话按需加载的？

正如我们前面所说的，不同的会话有其对应的.jsonl。

（1）Session Header

在.jsonl 文件中，Session Header 是 JSONL 文件的第一行元数据，结构如下：

```json
{
  "type": "session",
  "id": "session-uuid",
  "cwd": "/path/to/workspace",
  "timestamp": "1234567890",
  "parentSession?": "parent-id"
}
```

我实际捞一个 Session，可见其 Header 内容如下：

```json
{
  "type": "session",
  "version": "3",
  "id": "fd292408-168e-4c7b-9f2a-ff7ec0a7c492",
  "timestamp": "2026-03-04T16:11:50.567Z",
  "cwd": "/Users/blinblin/.openclaw/workspace-ceo"
}
```

（2）Agent 的 Session 加载

Session 的加载也是懒加载机制，当消息到达路由到 SessionKey 之后，OpenClaw 会查找 sessions.json 获取当前 SessionId，将 SessionId 对应的.jsonl 加载到 Agent 中。

#### 2、Session 太长，是不是就挤爆 LLM Context 了？是怎么优化的？

（1）LLM 感知 Session 的完整流程

OpenClaw 显然是不会将全量的 Session 加载进 LLM 中，那么它做了什么优化呢？

在 Session 加载 → LLM 感知阶段，按如下流程进行 load：

```
1. 加载 JSONL 文件
2. SessionManager 解析为 messages 数组
3. 应用过滤/裁剪策略
4. 发送给 LLM
```

这里最有意思的就是【3. 应用过滤/裁剪策略】

（2）Session 应用过滤/裁剪策略

A. Compaction（压缩） - 持久化

当对话太长时，旧消息会被总结成一个 summary。

比如：

```
压缩前发送给 LLM：
[user1, assistant1, user2, assistan2, … ,user100,assistant100]
压缩后发给 LLM：
[compaction_summary, user80, assistant80, … ,user100, assistant100]
↑ firstKeptEntryId 来控制 compaction 程度
```

进行该 compaction 压缩后，会写入 JSONL 文件（也即进行了持久化）。

下次对话继续使用的就是压缩后的历史。

B. Session Pruning（修剪） - 临时

在发送给 LLM 之前，临时裁剪旧的 tool 结果。

比如：

```
修剪前 JSONL 文件中：
[user1, assistant1, toolResult1("10 KB"), user2, assistant2, toolResult2("5 KB")]
修剪后发送给 LLM 的内容：
[user1, assistan1, "[Old tool result cleared]", user2, assistant2, toolResult2("5 KB")]
↑ 旧的 tool 结果被替换
```

该修剪策略不修改 JSONL 文件，仅仅是内存级别的操作。

C. History Limit（历史限制） - 可选

OpenClaw 源码中，可以看到该方法：

```
getHistoryLimitFromSessionKey(sessionKey)
// 可以限制发送的消息数量
```

#### 3、Agent 是怎么通过对话 (session) 的方式迭代 Memory.md 的？

Agent 通过文件系统工具（fsWrite/fsAppend）更新 Memory.md。

当 Session 接近 context 上限时，OpenClaw 会自动提示 Agent 写入 Memory，然后再压缩 Session。

#### 4、Agent 是怎么决策使用 Memory 的？

看图就好，这张图非常清晰了。

![Memory 决策流程](/assets/imagess/post/OpenClaw 架构 - 图片 3.png)

### （三）单 Agent 架构会出现什么问题？

![单 Agent 架构问题](/assets/imagess/post/OpenClaw 架构 - 图片 4.png)

Transformer 架构和原理想必大家都已清楚，单 Agent 的架构不仅有可能导致 Context 的快速消耗，还会错误 search 导致交付质量降低。

举一个我自己遇到过的例子：

```
先构建一个 RAG tutor Agent，让它来强化我们 Flutter 的技能。
当我中途和该 Agent 讨论过 C++ 的内容，那么因为 memory 机制的问题，
后续和该 Agent 多轮对话过程中，它都会带着 C++ 相关的记忆，
让它提供 Demo 示例时，它不会提供 Flutter 相关，而提供了 C++ 相关的示例。
```

尤其是涉及复杂任务时，即使现在业内针对 Context 上限约束做了很多方案，在交付水平和运行速度上都差强人意。

所以如果我们明确了 Agent 的专属任务，最好还是让 Agent 专事专做，效果会更好。

### （四）OpenClaw 多 Agent 部署

接下来，我们将介绍多 Agent 的部署流程。

![多 Agent 部署流程](/assets/imagess/post/OpenClaw 架构 - 图片 5.png)

接下来为了示例和大家理解，我们新增 2 个 Agent：ceo、iostutor。

```
新增 Agent 的指令：
openclaw agents add iostutor
```

使用 OpenClaw 指令新增 Agent 的好处，就是可以按 openclaw onboading 的初始化流程配置 Agent，整个过程对应的填上 [IM bot API] 和 [LLM API] 即可，流程并不麻烦。

### （五）多 Agent 通信，协同工作

多 Agent 配置完毕后，我们接下来要配置 Agent 的协同工作，才能更大价值发挥多 Agent 架构的效果。

在 OpenClaw 中，Agent 之间的调用有两种方式：sessions_send 和 sessions_spawn。

#### 1、sessions_send 和 sessions_spawn 的区别是什么？

（1）sessions_send 向已经存在的 session 发消息

简单来说，当 Agent 之间的通信，需要被写入各自的 memory 时，就建议使用 sessions_send 的方式。

拿公司举例：给同事发消息，他在自己工作的上下文中处理，这种情况就很适合使用 sessions_send。

（2）sessions_spawn: 在独立环境中运行任务

sessions_spawn 采用 SubAgent 的方式，通过调起子 Agent+ 传入内容的方式，让其完成交付。

sessions_spawn 更像是在雇佣临时工，给他一个独立的任务，完成后进行汇报。

比如：

ceo 角色说："让 iostutor 写一个 Swift 的网络请求封装类，30 分钟内完成"

即，A 如果能指挥 B 干活，那么 B 就是 A 的 SubAgent。

#### 2、sessions_send 和 sessions_spawn 应该分别怎么配置？

sessions_send 和 sessions_spawn 都在 openclaw.json 文件下进行配置。

（1）配置 sessions_send

没配置前：

![配置前](/assets/imagess/post/OpenClaw 架构 - 图片 6.png)

配置过程：

```json
"tools": {
  "agentToAgent": {
    "enabled": true,
    "allow": ["ceo", "iostutor"]
  },
  "sessions": {
    "visibility": "all" <- 这个特别容易漏，记得一定要配上了
  }
},
```

配置成功后：

![配置成功后](/assets/imagess/post/OpenClaw 架构 - 图片 7.png)

如图所示，ceo → iostutor 的会话，已经写入 iostutor 的 session 中，Agent 之间可以互相进行通信了。

（2）配置 sessions_spawn

配置 sessions_spawn 也不负责，比如我们需要让 iostutor 成为 ceo 的 SubAgent，那么我们就这么配置：

```json
{
  "id": "ceo",
  "name": "ceo",
  "workspace": "/Users/blinblin/.openclaw/workspace-ceo",
  "agentDir": "/Users/blinblin/.openclaw/agents/ceo/agent",
  "model": "openai-codex/gpt-5.3-codex",
  "subagents": {
    "allowAgents": ["iostutor"]. <- 新增这个
  }
}
```

#### 3、sessions_send 和 sessions_spawn 怎么安排？

具体应该怎么安排 Agent 之间的关系，关于这块的思考我参考了组织中高效运作的几个原则。

1. 扁平化 2.达成目标是最终目的，层级只是达成目标的方式。

所以基于这两个原则，假设我们的 Agent 是公司的员工，那么员工之间要做到的就是要互通有无，高效沟通时最重要的，所有 Agent 均可进行 sessions_send 互通：

```json
"agentToAgent": {
  "enabled": true,
  "allow": ["ceo", "iostutor"]. <- 要把所有 Agent 都加进来
},
```

其次，为了达成集体的目标，在有需要时，每个 Agent 都有义务帮助另一个 Agent，所有每个 Agent，都是另外一个 Agent 的 SubAgent：

```json
{
  "id": "iostutor",
  "name": "iOSTutor",
  "workspace": "/Users/blinblin/.openclaw/workspace-iostutor",
  "agentDir": "/Users/blinblin/.openclaw/agents/iostutor/agent",
  "model": "openai-codex/gpt-5.3-codex",
  "subagents": {
    "allowAgents": ["ceo"] <- 这里要加上除了自己之前的其他所有 Agent
  }
},
{
  "id": "ceo",
  "name": "ceo",
  "workspace": "/Users/blinblin/.openclaw/workspace-ceo",
  "agentDir": "/Users/blinblin/.openclaw/agents/ceo/agent",
  "model": "openai-codex/gpt-5.3-codex",
  "subagents": {
    "allowAgents": ["iostutor"] <- 这里要加上除了自己之前的其他所有 Agent
  }
}
```

当然了，这里的设定都是按能对公司 OKR 起到明确贡献的 Agents 的通信方式。

如果有一个 Agent 的职责只是类似前台的角色，那么只需要控制单向数据传输 SubAgent 即可。

#### 4、sessions_send 和 sessions_spawn 的决策机制

问题：当我们配置了 A 和 B Agent 互为 SubAgent，且允许 AgentToAgent 时，Agent 是怎么决定调用 sessions_send 还是 sessions_spawn 的？

这取决于 LLM 自己的判断，比如我们配置了 ceo 和 iostutor 允许 sessions_send，也配置了 ceo→iostutor sessions_spawn。

这时我们给 ceo 发送一条消息："让 iostutor Agent 生成一个文章发给我"

LLM 会理解为：
1. 这是一个新任务（生成文章）
2. 需要 iostutor 执行任务并返回结果
3. 不是跟 iostutor 的某个现有对话继续聊天

但，如果我们说："继续跟 iostutor 的那个文章讨论"，这种有明确上下文指向的指令，就会使用 sessions_send。

#### 5、AgentToAgent 团队 Agent 遗忘问题

有的朋友打通这一步之后，过了几天再让 iostutor 去找 ceo，iostutor 就完全不知道怎么进行 AgentToAgent 的通信了。

这是因为我们上面的配置，让 Agent 之间的通信是用 session 来记忆，它能记住我们会话里说的 Agent 是工程里的角色（因为我们给它发送了这么一句话："使用 sessions_send 工具，参数：sessionKey="agent:ceo:main", message="测试 agent-to-agent 通信", timeoutSeconds=60"）。

但当短期记忆遗忘后，它就忘记了这个指令，所以为了解决这个问题，我们需要在 workspace/agent_xx/AGENTS.md 进行配置，明确告诉它不同 Agent 分别是谁，such as：

```markdown
## AgentToAgent 通信
当你需要其他角色的意见或具体执行时：
- **iOS 问题** → `@iostutor` 获取技术评估
使用 `callAgent("iostutor")` 来直接通信。
```

注：AGENTS.md 内容会被注入到 system prompt 中。

#### 6、sessions_send 通话的内容过期机制如何？

A Agent 和 B Agent 使用 sessions_send 通话后，间隔 6 小时后，A 和 B 还能基于 6 小时以前的 session 继续沟通吗？会新开启一个 session 吗？还是复用之前的 session 呢？

结果是：会复用之前的 session。

session_send 不创建新的 session，它只向已存的 session 发消息。

6 小时前 A 和 B 通过 sessions_send 通话时：
- A 的 session（比如 agent:ceo:internal:main）
- B 的 session（比如 agent:iostutor:internal:main）

### （六）多 Agent 应用实战经验

1、公司要扁平化，不要部署太多 Agent

太多的 Agent 管理起来会比较复杂，尤其是多层级的汇报关系，是非常不建议的。

2、要信任公司成员，尽量保持 Agent 的双向沟通

如上文所述，建议 Agent 同时配置 sessions_send 和 sessions_spawn。

3、要设立核心成员边界，控制核心 Agent 数量

如果是比较明确的工具 Agent，比如：专门对 Markdown 格式进行排版的 Agent。

那么建议这种 Agent 就只配置 SubAgent 即可，它不需要记住太多上下文，专心把交付的事情处理完即可。

## 二、OpenClaw 精细化管控

二次强调：不要用 CC 来操作 OpenClaw，如果一定要用 CC，记得先把 OpenClaw 源码爬下来，让 CC 学一下，再去操作 OpenClaw。

### （一）Skills 管控

#### 1、Agent 加载 Skills 的流程

首先我们要明确一个概念，Skills 不是每个文档的完整注入，只是注入列表。（这并不是 OpenClaw 的专属操作，是所有支持 Skills 能力的基础操作）

与 AGENTS.md 等文件不同，Skills 采用按需加载机制：
- System prompt 只注入 skill 列表（名称、描述、路径）
- Agent 需要时用 read 工具读取完整的 SKILL.md

（1）注入流程：

Skills 来源（3 个位置，按优先级）
- workspace-xxx/skills/ ← 最高优先级（per-agent）
- ~/.openclaw/skills/ ← 中等优先级（shared）
- bundled skills (npm 包内) ← 最低优先级（内置）

（2）过滤
- 检查每个 skill 的 requires.bins/env/config
- 跳过不满足条件的

skill 的 requires.bins/env/config，可以配置执行 skill 要求的基础条件，比如最简单的 Weather：

```yaml
name: weather
description: "Get current weather and forecasts via wttr.in or Open-Meteo. Use when: user asks about weather, temperature, or forecasts for any location. NOT for: historical weather data, severe weather alerts, or detailed meteorological analysis. No API key needed."
homepage: https://wttr.in/:help
metadata: {
  "openclaw": {
    "emoji": "🌤️",
    "requires": {
      "bins": ["curl"]
    }
  }
}
```

（3）生成 Skills 注入列表

```xml
<available_skills>
  <skill>
    <name>healthcheck</name>
    <description>...</description>
    <location>~/.openclaw/skills/healthcheck/SKILL.md</location>
  </skill>
  ...
</available_skills>
```

（4）注入 Agent system Prompt 和使用

Agent 看到列表，需要时用 read 读取完整内容

#### 2、精细化 Skills 注入

Skills 太多会给 Agent 造成 Context 负担，甚至错误的 Skills 会导致 Agent 错误调用工具。

所以我们要对 Agent 进行精细化的管控，把每个 Agent 的 skills 加载配置成：

【基础通用能力 Skills + 专属 Skills】

![Skills 注入](/assets/imagess/post/OpenClaw 架构 - 图片 8.png)

比如 brave_search 这个 skill，属于让 Agent 进行高效的联网检索，它就应该属于基础通用 SKill。

又比如 Weather 这个 skill，我只让「Family Agent」进行定时天气汇报，那么 Weather 就应该属于「Family Agent」的专属 Skill。

#### 3、Skills 延迟加载问题

在你修改完 Skills 架构之后，你大概率会遇到一个问题，Agent 并没有加载最新的 skills 配置，比如我们这里调整 skills 之后，咨询 Agent skills 情况会发现还是使用旧的 skills：

![旧 skills](/assets/imagess/post/OpenClaw 架构 - 图片 9.png)

这是因为 OpenClaw 在 session 启动时会创建 skills 快照，并在整个 session 期间复用。

重启 gateway 后，旧 session 仍然使用旧的快照。

这时我们删除对应的 session，再重新咨询 Agent 的 skills 情况，就会发现新加的 skills 已经被更新出来了：

![新 skills](/assets/imagess/post/OpenClaw 架构 - 图片 10.png)

#### 4、关于 Skills 的其它小技巧

（1）Clawhub

Clawhub 是针对 OpenClaw 的 Skills Market，可以使用 Clawhub 的指令对 OpenClaw skills 进行管理。

```bash
# 语义搜索 Skills
clawhub search "calendar management"
# 安装指定 Skill
clawhub install <skill-slug>
# 列出已安装的 Skills
clawhub list
# 更新所有已安装的 Skills（谨慎使用，skill 建议都做成离线的）
clawhub update --all
# 同步并备份本地 Skills
clawhub sync
```

推荐几个比较好用的 Skills：

```
1. Find-skills
https://clawhub.ai/JimLiuxinghai/find-skills
2. Summarize
https://clawhub.ai/steipete/summarize
3. self-improving-agent
https://clawhub.ai/pskoett/self-improving-agent
4. brave-search
https://clawhub.ai/steipete/brave-search
5. frontend-design
https://clawhub.ai/ivangdavila/frontend
```

（2）Skills 的定期管理

Skills 的添加过于简单，导致非常容易出现 Skills 膨胀、低质扩散的情况。

所以推荐定期使用高阶模型对 skills 进行扫描：清理低质量 skill、冲突 skill、不必要的 skill。

### （二）OpenClaw 的版本控制问题

OpenClaw 存了太多本地重要数据，且 OpenClaw 的配置非常容易被搞挂。

所以我们需要对 OpenClaw 进行版本管理，但又不能全量进行 add 操作。

目前关于 OpenClaw 的版本管理，没有统一的方案，自己 diy 也不是很复杂，这里补充两个需要注意的点。

#### 1、memory 的切割

Session、memory/xxx.md、memory.md 存储了我们的对话信息，这部分信息不建议上云，可以在.gitignore 中进行配置。

#### 2、密钥的动态注入

openclaw.json 文件中同时存储了「密钥」和「OpenClaw 核心 config」，我们要做的是对「OpenClaw 核心 Config」进行配置，所以建议「密钥」部分通过注入的方式进行管理，避免「密钥」的泄露。

## 三、Good Case 分享

### 1. Daily_paper

AI 时代消息太多，推荐 https://huggingface.co/papers 的 daily_paper，可以通过 Agent 进行每日论文的抓取，让它快速提炼论文要点，让我们从源头了解 AI 的前言信息。

注：Agent 直接获取 https://huggingface.co/papers 容易失败，可以考虑 jina.ai 这个工具。

![Daily Paper](/assets/imagess/post/OpenClaw 架构 - 图片 11.png)

### 2. Summary

这个没什么好说的，Agent 必备能力，通过获取 Subscribe 的博主，定期分析内容，评分，提取高质量信息。

### 3. deepResearch

DeepResearch 也是 Agent 的核心能力之一，当我们需要深入研判一个消息时，可以让 Agent 启动 DeepResearch 能力，对消息进行分析。

注：DeepResearch 的交付质量受限于 LLM 的能力，更好的 LLM 能显著交付质量更高的内容。

### 4. RAG tutor

通过在 Workspace/Agent_xx/Memory/xxx.md 目录下配置学习资料，我们可以让 Agent 成为我们垂直领域的专属 tutor，借助 OpenClaw 的能力，用最快的方式实现一套 RAG tutor。

### 5. ComfyUI 本地文生图/文生视频

目前调用文生图、文生视频的 api 接口都是要付费的，当我们自部署 OpenClaw 之后，可以通过 ComfyUI 在本地部署「文生图、文生视频」接口，这样我们的 Agent 就可以通过调用本地模型进行内容的生成。

### 6. tts 语音本地部署

本机部署了 qwen3-tts 的模型用来进行语音合成，搞一个学英语，读新闻的定时任务还是不错的。

https://github.com/kapi2800/qwen3-tts-apple-silicon

![TTS 部署](/assets/imagess/post/OpenClaw 架构 - 图片 12.png)

### 7. 家庭助理

可以配置家庭专属 Agent，进行完 Memory 隔离后，可以一家人都在 IM 群里，家庭的一些定时任务，比如"xxx 清理和替换"、"提醒父母吃药"等等，可以极大提升家庭幸福感。

## 说在后面

### 1. Model 的选择

在预算 OK 的情况下，建议使用 SOTA 模型，落后的 LLM 会影响使用者的心智判断。

在交付不及格的情况下，很容易就做出"AI 能力还不行，解决不了我这个事情"的判断。实际大概率是因为 LLM 还不够 SOTA，use SOTA model first。

另外不建议按「年」对专一某个模型进行订阅，模型迭代速度很快，专一模型的订阅可能几个月就不能用了。

### 2. OpenClaw 还有很多可以玩的

比如替换 OpenClaw 的 memory-search 底层算法，又比如重写 AGENTS.md 构建更复杂的 Agent 关系，喜欢折腾 OpenClaw 的朋友可以在评论区多多沟通，一起通宵捉龙虾。

![OpenClaw](/assets/imagess/post/OpenClaw 架构 - 图片 13.png)

---

原文地址：https://mp.weixin.qq.com/s?__biz=MjM5ODYwMjI2MA==&mid=2649800637&idx=1&sn=ea01e0f19b2749deda2f6ff67ab6f104
