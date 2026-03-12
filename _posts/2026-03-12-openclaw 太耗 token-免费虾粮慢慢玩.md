---
title: "OpenClaw 太耗 Token？不用担心,免费虾粮慢慢玩"
date: 2026-03-12T11:24:00+08:00
layout: post
categories: [AI, 技术]
tags: [搬运,OpenClaw,免费模型,OpenRouter]
---

最近群里有不少朋友已经开始养殖龙虾了,但是最大的问题就是,token 消耗过快。睡一觉可能就欠费了。

今天给大家一个免费虾粮,都免费了,大家也就别在意质量了。

## OpenRouter

OpenRouter 是一个 API 中转站,目前已经支持了 639 个模型的调用。

废话不多说直接开始创建 token。

需要梯子

登录 OpenRouter 的官网 https://openrouter.ai。点击 Get API Key 按步骤登录就能获取 token 了。

支持的免费模型怎么看？在官网首页点击 Explore Models,然后如图操作。

这里推荐 2 个模型：

1. `stepfun/step-3.5-flash:free` 支持 256K 内容窗口,适合处理超长文本。

2. `qwen/qwen3-vl-235b-a22b-thinking` 通义千问 3 模型,支持图像输入,复杂逻辑处理在免费模型里面比较出色

## OpenClaw 中使用

新装和已经装好的步骤差不多,这里已经装过了所以有一些不一样。

在命令行敲入 `openclaw config`。选择第一个 Local。

然后选择 Model。

选择 OpenRouter。然后选择第一项,输入 API Key。

找到对应的模型,敲空格选择！敲空格选择！敲空格选择！最后选择完成以后再回车确认。

敲入以下命令：

```bash
vim ~/.openclaw/openclaw.json
```

找到对应的配置,输入 `i` 移动光标就可以修改了。

修改完成按 `esc` 再输入 `:wq` 保存。保存完成以后重启网关：

```bash
openclaw gateway restart
```

## 写在最后

最近也是在使用讯飞 MaaS 的 Kimi K2.5 模型。我认为可以先利用厉害一点的模型把一些东西（skill、自我进化等）调整好以后切换到免费的,那时候小龙虾应该就没有那么傻了。

---

作者提示：个人观点,仅供参考
