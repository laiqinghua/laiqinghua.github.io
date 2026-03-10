---
title: "虚拟机 Windows 安装 OpenClaw 小龙虾完整教程"
date: 2026-03-11 00:05:00
categories: AI 技术
tags: [OpenClaw, AI 助手，虚拟机，QQ 机器人，阿里百炼]
description: "从零开始教你在虚拟机 Windows 上安装 OpenClaw 小龙虾 AI 助手，包含虚拟机配置、Windows 安装、阿里百炼千问大模型和 QQ 机器人完整配置指南"
---

# 虚拟机 Windows 安装 OpenClaw 小龙虾完整教程 🦞

> 嘿，大家好！今天给大家带来一篇超详细的 OpenClaw 安装教程。如果你也想拥有一个能帮你写代码、查资料、聊天的 AI 私人助理，那就跟着我一步步来吧！

## 写在前面

为什么要用虚拟机安装？说实话，我一开始也是直接在宿主机上折腾，但后来发现几个问题：

- **环境隔离**：AI 工具依赖多，容易和现有环境冲突
- **安全性**：机器人需要登录 QQ，虚拟机更安全
- **可迁移性**：哪天想换电脑，直接导出虚拟机就行
- **折腾不心疼**：搞坏了快照恢复，比重装系统快多了

所以，听我的，用虚拟机准没错！

---

## 第一部分：虚拟机软件安装

### 选择虚拟机软件

市面上主流的虚拟机软件有三个：

| 软件                 | 优点         | 缺点       | 推荐指数  |
| ------------------ | ---------- | -------- | ----- |
| VMware Workstation | 功能强大，性能好   | 收费（有破解版） | ⭐⭐⭐⭐⭐ |
| VirtualBox         | 免费开源       | 性能稍弱     | ⭐⭐⭐⭐  |
| Hyper-V            | Windows 自带 | 配置稍复杂    | ⭐⭐⭐⭐  |

我 personally 推荐 **VMware Workstation Pro**，现在对个人用户免费了，真香！

### VMware 安装步骤

1. **下载安装包**
   
   去官网下载：https://www.vmware.com/products/workstation-pro.html
   
   或者在评论区找我分享的百度网盘链接（懂的都懂😏）

2. **安装 VMware**
   
   双击安装包，一路下一步就行。注意安装路径建议改到空间大的盘，虚拟机文件很大的！

3. **激活许可证**
   
   现在个人使用免费，注册个 VMware 账号登录就能激活。

---

## 第二部分：Windows 虚拟机安装

### 准备 Windows 镜像

你需要一个 Windows 10 或 Windows 11 的 ISO 镜像文件。

**推荐版本：**

- Windows 10 专业版 64 位（21H2 或更新）
- Windows 11 专业版 64 位

**下载方式：**

```
方法 1：微软官网下载 Media Creation Tool
方法 2：MSDN 我告诉你 (msdn.itellyou.cn)
方法 3：各种技术论坛（注意安全）
```

⚠️ **注意**：一定要用正版或官方镜像，别用来路不明的 GHOST 版！

### 创建虚拟机

1. **新建虚拟机**
   
   打开 VMware → 文件 → 新建虚拟机 → 选择"典型（推荐）"

2. **选择安装源**
   
   选择"安装程序光盘映像文件 (iso)"，浏览选择你下载的 Windows ISO

3. **设置虚拟机名称和位置**
   
   - 名称：`OpenClaw-Win10`（随便你取）
   - 位置：**重点！** 选空间大的盘，建议 50GB 以上

4. **指定磁盘容量**
   
   - 最大磁盘大小：**建议 80GB 以上**
   - 选择"将虚拟磁盘存储为单个文件"

5. **自定义硬件（重要！）**
   
   点击"自定义硬件"，调整以下配置：
   
   | 硬件  | 最低配置   | 推荐配置   |
   | --- | ------ | ------ |
   | 内存  | 4GB    | 8GB    |
   | 处理器 | 2 核心   | 4 核心   |
   | 硬盘  | 60GB   | 100GB  |
   | 网络  | NAT 模式 | NAT 模式 |
   
   💡 **内存小贴士**：如果你宿主机有 16GB 内存，给虚拟机分 8GB 刚好；如果只有 8GB，分 4GB 也够用。

6. **完成创建**
   
   点击完成，然后启动虚拟机开始安装 Windows。

### 安装 Windows 系统

这部分我就不细说了，大家应该都会：

1. 选择语言、时间、键盘
2. 点击"现在安装"
3. 输入产品密钥（没有就点"我没有产品密钥"）
4. 选择 Windows 版本（推荐专业版）
5. 选择"自定义：仅安装 Windows"
6. 选择未分配空间，点击下一步
7. 等待安装完成（大概 15-30 分钟）

### 安装 VMware Tools

系统装好后，**一定要安装 VMware Tools**！不然会很卡！

1. 虚拟机 → 安装 VMware Tools
2. 在虚拟机里打开光驱，运行安装程序
3. 一路下一步，重启虚拟机

搞定后你会发现鼠标丝滑多了，还能自动调整分辨率！

---

## 第三部分：OpenClaw 安装配置

### 什么是 OpenClaw？

简单说，OpenClaw 就是一个能让你和各种 AI 大模型对话的框架，还能接入 QQ、微信、Telegram 等各种平台。

**核心功能：**

- 🤖 接入多个 AI 大模型（阿里百炼、百度文心、智谱等）
- 💬 多平台消息收发（QQ、微信、Telegram 等）
- 🔧 丰富的插件系统（天气、提醒、文件处理等）
- 📝 完整的记忆系统（能记住你们之前的对话）

### 安装 Node.js

OpenClaw 是基于 Node.js 的，所以先装 Node.js。

1. **下载 Node.js**
   
   官网：https://nodejs.org/
   
   下载 **LTS 版本**（长期支持版），现在是 v20.x

2. **安装**
   
   双击安装包，一路下一步。建议勾选"自动安装必要的工具"。

3. **验证安装**
   
   打开命令提示符（cmd），输入：
   
   ```bash
   node --version
   npm --version
   ```
   
   有版本号就说明安装成功了！

### 安装 OpenClaw

1. **打开命令提示符**
   
   按 `Win + R`，输入 `cmd`，回车

2. **全局安装 OpenClaw**
   
   ```bash
   npm install -g openclaw
   ```
   
   ⏳ 等待安装完成，大概需要几分钟（取决于你网速）

3. **验证安装**
   
   ```bash
   openclaw --version
   ```
   
   看到版本号就说明安装成功了！🎉

### 初始化 OpenClaw

1. **初始化配置**
   
   在命令提示符中：安装并启动系统守护进程
   
   ```bash
   openclaw  onboard --install-daemon
   ```
   
   或者采用这种命令行非引导式安装
   
   ```shell
   openclaw-cn onboard --non-interactive \
     --mode local \
     --auth-choice apiKey \
     --anthropic-api-key "$ANTHROPIC_API_KEY" \
     --gateway-port 18789 \
     --gateway-bind loopback \
     --install-daemon \
     --daemon-runtime node \
     --skip-skills
   ```

---

## 第四部分：配置阿里百炼千问大模型

### 注册阿里百炼账号

1. **访问官网**
   
   https://bailian.console.aliyun.com/

2. **注册/登录**
   
   用阿里云账号登录，没有就注册一个（需要实名认证）

3. **开通百炼服务**
   
   首次使用需要开通，按提示操作即可（有免费额度）

### 获取 API Key

1. **进入控制台**
   
   登录后进入百炼控制台

2. **创建 API Key**
   
   - 左侧菜单：API-KEY 管理
   - 点击"创建新的 API-KEY"
   - 给个名字，比如"OpenClaw"
   - 复制保存好这个 Key（只显示一次！）
   
   ⚠️ **重要**：API Key 一定要保存好，泄露了别人能用你的额度！

### 配置 OpenClaw 使用千问模型

1. **编辑配置文件**
   
   找到 OpenClaw 的配置文件，通常在：
   
   ```
   C:\Users\你的用户名\.openclaw\openclaw.json
   ```

2. **添加阿里百炼配置（要注意这里只需要修改models、和agents里面的内容，其他的不要修改，你的配置文件里面东西很多，只修改这两个就行，把models和agent里面的内容粘贴进去替换apikey就行了）**
   
   ```json
   {
     "models": {
       "mode": "merge",
       "providers": {
         "bailian": {
           "baseUrl": "https://coding.dashscope.aliyuncs.com/v1",
           "apiKey": "你阿里云的API密钥",
           "api": "openai-completions",
           "models": [
             {
               "id": "qwen3.5-plus",
               "name": "qwen3.5-plus",
               "reasoning": false,
               "input": [
                 "text",
                 "image"
               ],
               "cost": {
                 "input": 0,
                 "output": 0,
                 "cacheRead": 0,
                 "cacheWrite": 0
               },
               "contextWindow": 1000000,
               "maxTokens": 65536
             },
             {
               "id": "qwen3-max-2026-01-23",
               "name": "qwen3-max-2026-01-23",
               "reasoning": false,
               "input": [
                 "text"
               ],
               "cost": {
                 "input": 0,
                 "output": 0,
                 "cacheRead": 0,
                 "cacheWrite": 0
               },
               "contextWindow": 262144,
               "maxTokens": 65536
             },
             {
               "id": "qwen3-coder-next",
               "name": "qwen3-coder-next",
               "reasoning": false,
               "input": [
                 "text"
               ],
               "cost": {
                 "input": 0,
                 "output": 0,
                 "cacheRead": 0,
                 "cacheWrite": 0
               },
               "contextWindow": 262144,
               "maxTokens": 65536
             },
             {
               "id": "qwen3-coder-plus",
               "name": "qwen3-coder-plus",
               "reasoning": false,
               "input": [
                 "text"
               ],
               "cost": {
                 "input": 0,
                 "output": 0,
                 "cacheRead": 0,
                 "cacheWrite": 0
               },
               "contextWindow": 1000000,
               "maxTokens": 65536
             },
             {
               "id": "MiniMax-M2.5",
               "name": "MiniMax-M2.5",
               "reasoning": false,
               "input": [
                 "text"
               ],
               "cost": {
                 "input": 0,
                 "output": 0,
                 "cacheRead": 0,
                 "cacheWrite": 0
               },
               "contextWindow": 196608,
               "maxTokens": 32768
             },
             {
               "id": "glm-5",
               "name": "glm-5",
               "reasoning": false,
               "input": [
                 "text"
               ],
               "cost": {
                 "input": 0,
                 "output": 0,
                 "cacheRead": 0,
                 "cacheWrite": 0
               },
               "contextWindow": 202752,
               "maxTokens": 16384
             },
             {
               "id": "glm-4.7",
               "name": "glm-4.7",
               "reasoning": false,
               "input": [
                 "text"
               ],
               "cost": {
                 "input": 0,
                 "output": 0,
                 "cacheRead": 0,
                 "cacheWrite": 0
               },
               "contextWindow": 202752,
               "maxTokens": 16384
             },
             {
               "id": "kimi-k2.5",
               "name": "kimi-k2.5",
               "reasoning": false,
               "input": [
                 "text",
                 "image"
               ],
               "cost": {
                 "input": 0,
                 "output": 0,
                 "cacheRead": 0,
                 "cacheWrite": 0
               },
               "contextWindow": 262144,
               "maxTokens": 32768
             }
           ]
         }
       }
     },
     "agents": {
       "defaults": {
         "model": {
           "primary": "bailian/qwen3.5-plus"
         },
         "models": {
           "bailian/qwen3.5-plus": {},
           "bailian/qwen3-max-2026-01-23": {},
           "bailian/qwen3-coder-next": {},
           "bailian/qwen3-coder-plus": {},
           "bailian/MiniMax-M2.5": {},
           "bailian/glm-5": {},
           "bailian/glm-4.7": {},
           "bailian/kimi-k2.5": {}
         }
       }
     }}
   ```

### 模型选择建议

| 模型         | 适用场景      | 价格  | 推荐指数  |
| ---------- | --------- | --- | ----- |
| qwen-turbo | 简单问答、快速响应 | 最便宜 | ⭐⭐⭐⭐  |
| qwen-plus  | 日常对话、代码助手 | 中等  | ⭐⭐⭐⭐⭐ |
| qwen-max   | 复杂任务、深度分析 | 最贵  | ⭐⭐⭐⭐  |

💡 **省钱技巧**：日常用 `qwen-plus` 就够了，`qwen-max` 留给复杂任务。

---

## 第五部分：配置 QQ 机器人

### 准备工作

### 安装 QQBot 插件,不要用飞书真的很垃圾今天一直给我报401让我以为是我的大模型API报错了，检查了2小时！

1. 创建QQ机器人，目前腾讯有活动一个链接登录QQ就搞定，登录QQ点击创建机器人就可以了。你点击添加机器人之后就会出现三个命令，第一个是安装插件，第二个是添加机器人token进去，第三个就是重启网关。
   
   https://q.qq.com/qqbot/openclaw/index.html
   
   ![](C:\Users\lqh\AppData\Roaming\marktext\images\2026-03-11-00-15-40-image.png)
   
   **1. 接下来的步骤**
   
   ```bash
   1. 安装插件 上面的网页有写复制网页上的命令直接执行
   openclaw plugins install @tencent-connect/openclaw-qqbot@latest
   2.添加机器人复制网页上的命令直接执行，每个人不一样
   openclaw channels add --channel qqbot --token "xxxx"
   3. 重启网关复制网页上的命令直接执行，没报错就是可以给你QQ机器人发消息了
   openclaw  gateway
   ```

## 第六部分：进阶配置(到上面就结束了可以用了，初次使用者先不要搞下面这个)

### 配置记忆系统

OpenClaw 有强大的记忆系统，能让 AI 记住你们的对话。

1. **启用记忆**
   
   配置文件添加：
   
   ```json
   {
     "memory": {
       "enabled": true,
       "maxSnippets": 10,
       "similarityThreshold": 0.7
     }
   }
   ```

2. **记忆文件位置**
   
   ```
   C:\Users\你的用户名\.openclaw\workspace\MEMORY.md
   C:\Users\你的用户名\.openclaw\workspace\memory\
   ```

## 第七部分：日常使用

### 启动 OpenClaw

```shell
openclaw gateway
```

### 查看状态

```bash
openclaw status
```

### 查看日志

```bash
openclaw logs --tail 100
```

### 停止服务

```bash
openclaw stop
```

### 常用命令

| 命令                    | 说明      |
| --------------------- | ------- |
| `openclaw status`     | 查看状态    |
| `openclaw logs`       | 查看日志    |
| `openclaw skill list` | 列出已安装技能 |
| `openclaw config`     | 编辑配置    |

---

## 第八部分：故障排查

### 问题 1：npm 安装失败

**症状**：`npm install` 报错，下载慢

**解决**：

```bash
# 切换淘宝镜像
npm config set registry https://registry.npmmirror.com

# 清理缓存
npm cache clean --force

# 重新安装
npm install -g openclaw
```

### 注意

1. **虚拟机配置别太低**：4GB 内存是底线，8GB 更舒服
2. **API Key 保管好**：泄露了别人能用你的钱
3. **定期备份**：虚拟机快照 + 配置文件备份
4. **多看日志**：出问题了日志会告诉你原因



**本文完**

*最后更新：2026 年 3 月 11 日*
