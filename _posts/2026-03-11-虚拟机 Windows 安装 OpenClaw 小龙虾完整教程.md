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

| 软件 | 优点 | 缺点 | 推荐指数 |
|------|------|------|----------|
| VMware Workstation | 功能强大，性能好 | 收费（有破解版） | ⭐⭐⭐⭐⭐ |
| VirtualBox | 免费开源 | 性能稍弱 | ⭐⭐⭐⭐ |
| Hyper-V | Windows 自带 | 配置稍复杂 | ⭐⭐⭐⭐ |

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
   
   | 硬件 | 最低配置 | 推荐配置 |
   |------|----------|----------|
   | 内存 | 4GB | 8GB |
   | 处理器 | 2 核心 | 4 核心 |
   | 硬盘 | 60GB | 100GB |
   | 网络 | NAT 模式 | NAT 模式 |

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

1. **创建工作目录**
   
   在 D 盘（或其他盘）创建一个文件夹，比如：
   ```
   D:\OpenClaw\workspace
   ```

2. **初始化配置**
   
   在命令提示符中：
   ```bash
   cd D:\OpenClaw\workspace
   openclaw init
   ```
   
   按提示完成初始化，会创建一些配置文件和目录。

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
   D:\OpenClaw\workspace\.openclaw\config.json
   ```
   
   或者运行：
   ```bash
   openclaw config
   ```

2. **添加阿里百炼配置**
   
   ```json
   {
     "models": {
       "bailian": {
         "provider": "aliyun-bailian",
         "apiKey": "你的 API-KEY 在这里",
         "defaultModel": "qwen-plus",
         "models": {
           "qwen-plus": {
             "name": "通义千问 Plus",
             "contextWindow": 32768,
             "maxTokens": 8192
           },
           "qwen-max": {
             "name": "通义千问 Max",
             "contextWindow": 32768,
             "maxTokens": 8192
           },
           "qwen-turbo": {
             "name": "通义千问 Turbo",
             "contextWindow": 8192,
             "maxTokens": 2048
           }
         }
       }
     },
     "defaultModel": "bailian/qwen-plus"
   }
   ```

3. **测试连接**
   
   ```bash
   openclaw chat "你好，请做个自我介绍"
   ```
   
   如果能看到 AI 回复，说明配置成功了！

### 模型选择建议

| 模型 | 适用场景 | 价格 | 推荐指数 |
|------|----------|------|----------|
| qwen-turbo | 简单问答、快速响应 | 最便宜 | ⭐⭐⭐⭐ |
| qwen-plus | 日常对话、代码助手 | 中等 | ⭐⭐⭐⭐⭐ |
| qwen-max | 复杂任务、深度分析 | 最贵 | ⭐⭐⭐⭐ |

💡 **省钱技巧**：日常用 `qwen-plus` 就够了，`qwen-max` 留给复杂任务。

---

## 第五部分：配置 QQ 机器人

### 准备工作

⚠️ **重要提示**：QQ 机器人需要使用 QQ 协议机器人框架，有一定封号风险，建议用小号！

### 安装 QQBot 插件

1. **安装插件**
   
   ```bash
   openclaw skill install qqbot
   ```
   
   或者手动安装：
   ```bash
   npm install @openclaw/qqbot
   ```

2. **配置 QQBot**
   
   编辑配置文件，添加 QQBot 配置：
   ```json
   {
     "qqbot": {
       "enabled": true,
       "protocol": "ntqq",
       "account": "你的 QQ 号",
       "password": "你的 QQ 密码",
       "messageRetention": "all"
     }
   }
   ```

### 使用 NTQQ 协议（推荐）

NTQQ 是目前比较稳定的 QQ 协议。

1. **下载 LiteLoaderQQNT**
   
   GitHub：https://github.com/LiteLoaderQQNT/LiteLoaderQQNT
   
   或使用一键安装脚本

2. **安装 QQNT**
   
   下载官方 QQNT 安装包：https://im.qq.com/pcqq/

3. **配置机器人**
   
   按照 LiteLoaderQQNT 的文档配置机器人插件

### 测试 QQ 机器人

1. **启动 OpenClaw**
   
   ```bash
   openclaw start
   ```

2. **登录 QQ**
   
   首次运行会要求 QQ 登录，按提示操作

3. **发送测试消息**
   
   用另一个 QQ 号给你的机器人发消息，看是否回复

### 常见问题

**Q: QQ 登录失败怎么办？**

A: 可能是密码错误或需要设备验证，用手机 QQ 扫码登录试试。

**Q: 机器人不回复消息？**

A: 检查日志：
```bash
openclaw logs
```
看有没有报错信息。

**Q: 会被封号吗？**

A: 有风险！建议：
- 用 QQ 小号
- 不要频繁发消息
- 不要加太多群
- 不要发敏感内容

---

## 第六部分：进阶配置

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
   D:\OpenClaw\workspace\MEMORY.md
   D:\OpenClaw\workspace\memory\
   ```

### 配置技能系统

OpenClaw 支持各种技能插件：

```bash
# 天气查询
openclaw skill install weather

# GitHub 集成
openclaw skill install github

# 网页搜索
openclaw skill install tavily

# 文件管理
openclaw skill install feishu-doc
```

### 配置定时任务

可以设置定时提醒、定时任务：

```json
{
  "cron": {
    "enabled": true,
    "tasks": [
      {
        "schedule": "0 9 * * *",
        "action": "notify",
        "message": "早上好！今天有什么安排？"
      }
    ]
  }
}
```

### 性能优化

如果虚拟机比较卡，可以：

1. **减少并发**
   ```json
   {
     "concurrency": {
       "maxSessions": 3,
       "maxSubAgents": 2
     }
   }
   ```

2. **禁用不用的功能**
   ```json
   {
     "features": {
       "browser": false,
       "canvas": false
     }
   }
   ```

---

## 第七部分：日常使用

### 启动 OpenClaw

```bash
cd D:\OpenClaw\workspace
openclaw start
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

| 命令 | 说明 |
|------|------|
| `openclaw chat "消息"` | 和 AI 对话 |
| `openclaw status` | 查看状态 |
| `openclaw logs` | 查看日志 |
| `openclaw skill list` | 列出已安装技能 |
| `openclaw skill install <名称>` | 安装技能 |
| `openclaw config` | 编辑配置 |

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

### 问题 2：API Key 无效

**症状**：调用大模型时报 401 错误

**解决**：
1. 检查 API Key 是否复制完整
2. 检查是否欠费或额度用完
3. 重新创建 API Key

### 问题 3：QQ 机器人无法登录

**症状**：QQ 登录失败或掉线

**解决**：
1. 检查 QQ 账号密码是否正确
2. 尝试用手机 QQ 扫码登录
3. 检查是否需要设备锁验证
4. 考虑更换协议（NTQQ → Android）

### 问题 4：虚拟机网络不通

**症状**：虚拟机无法上网

**解决**：
1. 检查 VMware 网络适配器是否为 NAT 模式
2. 重启 VMware NAT 服务
3. 在虚拟机里运行：
   ```bash
   ipconfig /release
   ipconfig /renew
   ```

---

## 写在最后

好了，教程就到这里！看起来步骤很多，但实际上跟着做下来，**2-3 小时**就能搞定。

### 一些建议

1. **虚拟机配置别太低**：4GB 内存是底线，8GB 更舒服
2. **API Key 保管好**：泄露了别人能用你的钱
3. **QQ 用小号**：别拿主号冒险
4. **定期备份**：虚拟机快照 + 配置文件备份
5. **多看日志**：出问题了日志会告诉你原因

### 遇到问题怎么办？

1. 先看日志：`openclaw logs`
2. 查官方文档：https://docs.openclaw.ai
3. 加 Discord 社区：https://discord.gg/clawd
4. 提 GitHub Issue

### 最后的话

OpenClaw 真的很好用，我现在日常工作都离不开它了。写代码、查资料、写文章，它都能帮上忙。

希望这篇教程能帮到你！如果有任何问题，欢迎在评论区留言，我会尽量回复的~

**祝大家安装顺利！🦞**

---

**参考资料：**

- OpenClaw 官方文档：https://docs.openclaw.ai
- 阿里百炼控制台：https://bailian.console.aliyun.com/
- VMware 下载：https://www.vmware.com/
- Node.js 下载：https://nodejs.org/
- LiteLoaderQQNT：https://github.com/LiteLoaderQQNT/LiteLoaderQQNT

**本文完**

*最后更新：2026 年 3 月 11 日*
