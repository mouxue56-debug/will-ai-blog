---
slug: opendeepseek-local-agent-guide
title:
  zh: OpenDeepSeek 使用指南：一键把 DeepSeek 变成本地真 Agent
  ja: OpenDeepSeek 利用ガイド：DeepSeek をローカル Agent にする
  en: OpenDeepSeek Guide: Turn DeepSeek into a Local Agent Workspace
category: ai
date: "2026-05-07"
updated: "2026-05-07"
author: Will
locale: zh
coverImage: "/covers/minimax/hermes-openclaw-agent-practical-notes.jpg"
excerpt:
  zh: OpenDeepSeek 把 Open WebUI、Hermes Agent 和 DeepSeek V4 Flash 组合成一个中文优先的一键本地 Agent 工作台。普通问题快速回答，真实任务自动交给 Hermes 执行。
  ja: OpenDeepSeek は Open WebUI、Hermes Agent、DeepSeek V4 Flash を組み合わせた中国語優先のローカル Agent ワークスペースです。
  en: OpenDeepSeek combines Open WebUI, Hermes Agent, and DeepSeek V4 Flash into a local Agent workspace with fast chat and real task execution.
tags: ["OpenDeepSeek", "DeepSeek", "Hermes", "Open WebUI", "Agent"]
contentSource: original
---

OpenDeepSeek 的目标很简单：**让 DeepSeek 不只是聊天，而是真的能帮你在本机干活。**

普通问题走快速回答；需要生成文件、整理资料、做网页、写报告、设置提醒、读取图片时，自动交给 Hermes Agent 执行。你不需要自己理解 Open WebUI、Hermes、Docker、API 网关这些底层概念，按引导填一次 DeepSeek API Key 就能开始用。

## 它到底是什么

OpenDeepSeek 是一个中文优先的一键本地 Agent 工作台：

```text
浏览器 / 手机 PWA
    ↓
Open WebUI：聊天入口、历史记录、文件上传、PWA
    ↓
OpenDeepSeek Smart Bridge：自动判断普通问答还是真任务
    ↓
DeepSeek V4 Flash：便宜快速的日常推理
Hermes Agent：文件、终端、记忆、定时任务、工具执行
```

你可以把它理解成：

> Open WebUI 负责好用的聊天界面，Hermes 负责真实 Agent 能力，DeepSeek V4 Flash 负责低成本推理，OpenDeepSeek 把它们装配成普通人能启动、能诊断、能使用的产品壳。

## 它能做什么

适合普通用户的场景：

- 问问题、写文案、翻译、总结资料。
- 生成网页、周报、Markdown、脚本、PPT 内容草稿。
- 读取和整理本机授权目录里的文件。
- 上传截图或图片，让系统先做本地 OCR 和路径桥接，再交给 Agent 处理。
- 设置提醒和定时任务。
- 使用 Open WebUI 的聊天历史、PWA、文件上传和知识库能力。

它不是单纯的“DeepSeek 网页壳”。如果任务涉及真实文件或真实执行，OpenDeepSeek 会尽量把任务路由到 Hermes Agent，而不是在聊天框里假装已经完成。

## 安装前准备

你需要：

| 项目 | 要求 |
|---|---|
| 系统 | macOS / Linux / Windows WSL2 |
| Docker | Docker Desktop 或 Docker Engine |
| API Key | DeepSeek API Key |
| 内存 | 建议 4GB 以上可用内存 |
| 磁盘 | 建议 10GB 以上可用空间 |

DeepSeek Key 可以在 DeepSeek 官方平台申请。安装过程中只需要粘贴一次，OpenDeepSeek 会写入本机 `.env`，不会把你的 key 提交到仓库。

## 国际版一键安装

适合 GitHub 访问稳定的用户：

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/mouxue56-debug/opendeepseek/main/install.sh)
```

脚本会做这些事：

1. 检查 Docker、Git、curl 等基础依赖。
2. clone OpenDeepSeek 项目。
3. 打开中文配置向导。
4. 引导你填写 DeepSeek API Key。
5. 启动 Open WebUI、Smart Bridge、Hermes Agent。
6. 自动打开聊天入口。

启动成功后访问：

```text
http://localhost:3000
```

## 国内用户入口

如果 GitHub raw 访问不稳定，可以尝试 Gitee 入口：

```bash
bash -c "$(curl -fsSL https://gitee.com/luoxueai/opendeepseek/raw/main/install-cn.sh)"
```

国内版入口目前主要解决三件事：

- 使用 Gitee raw 作为安装脚本入口。
- 提供 `docker-compose.cn.yml` 和 `.env.example.cn`。
- 提供国内网络体检和更友好的中文错误提示。

需要注意：国内容器镜像和完整离线包发布后，国内安装体验会更稳；在这之前，如果 Docker 镜像拉取失败，可以先换网络、配置镜像源，或等待离线包发布。

## 手动安装

如果你想自己控制目录和配置：

```bash
git clone https://github.com/mouxue56-debug/opendeepseek.git
cd opendeepseek
./setup.sh --web
```

也可以直接编辑 `.env` 后启动：

```bash
cp .env.example .env
# 打开 .env，填写 DEEPSEEK_API_KEY
docker compose up -d
```

macOS 用户如果拿到项目文件，也可以双击：

```text
OpenDeepSeek.command
```

它会自动启动 Docker 服务、打开配置向导或聊天页。

## 第一次打开后怎么用

打开：

```text
http://localhost:3000
```

推荐先试三个任务。

### 1. 普通问答

```text
用三句话解释一下 OpenDeepSeek 是什么。
```

这类任务应该快速返回，走 DeepSeek V4 Flash 轻量路径。

### 2. 真 Agent 文件任务

```text
/agent 请在 OpenDeepSeek-Outputs 里生成一个 hello.txt，内容写“你好，OpenDeepSeek”。
```

这类任务应该交给 Hermes Agent，真实写入文件，而不是只在聊天框里回复“已完成”。

### 3. 网页生成任务

```text
/agent 帮我做一个简单的个人介绍网页，保存到 OpenDeepSeek-Outputs/site-demo，包含 index.html 和 style.css。
```

完成后，回答里会告诉你本机路径和生成文件。你可以在 Finder 或资源管理器里打开。

## 生成文件在哪里

默认产物目录是：

```text
~/OpenDeepSeek-Outputs
```

容器里对应：

```text
/host/OpenDeepSeek-Outputs
```

如果你让 Agent 生成网页、报告、脚本，它应该把文件放到这个目录，并在回答里说明路径。看到“已生成文件”时，OpenDeepSeek 会尽量验证文件真实存在，减少假完成。

输入文件可以放到：

```text
~/OpenDeepSeek-Inputs
```

这样 Agent 可以更安全地读取你明确放进去的资料。

## 四个模式怎么理解

OpenDeepSeek 暴露给 Open WebUI 的产品化模型包括：

| 模式 | 适合什么 |
|---|---|
| `opendeepseek-auto` | 默认模式，自动判断快问答还是真任务 |
| `opendeepseek-fast` | 强制快速问答，适合解释、翻译、短写作 |
| `opendeepseek-agent` | 强制 Hermes Agent，适合文件、网页、提醒、工具 |
| `opendeepseek-deepwork` | 复杂任务预留模式，适合长报告、复杂代码和深度任务 |

普通用户直接用 `opendeepseek-auto` 就好。如果你明确要它动本机文件，可以在开头加 `/agent`。

## 电脑变卡怎么办

默认建议只启动核心服务：

```bash
./setup.sh start
```

需要联网搜索后端时再启动完整模式：

```bash
./setup.sh start-full
```

用完以后释放内存：

```bash
./setup.sh stop
```

如果你只是拍视频或短时间试用，用完记得停掉 Docker 容器，电脑会轻很多。

## 一键诊断

遇到打不开、没模型、Hermes 不动、API 连接失败，先跑：

```bash
./setup.sh doctor
```

需要发给维护者排查时，生成脱敏报告：

```bash
./setup.sh report
```

发布前或大改配置后，建议跑：

```bash
./setup.sh verify
./setup.sh verify-live
./scripts/health-check.sh
python3 scripts/benchmark_routing.py
bash scripts/smoke-test.sh
```

这些命令会检查 Docker、端口、Open WebUI、Bridge、Hermes、DeepSeek Provider、路由、文件写入和 smoke-test。

## 手机上怎么用

最简单的方式是同一局域网访问电脑 IP：

```text
http://电脑局域网IP:3000
```

更推荐用 Tailscale 这类私有网络工具。它不需要公网 IP，也不用把服务直接暴露到公网。

安全提醒：如果你要让外网访问，一定要开启登录：

```env
WEBUI_AUTH=true
BIND_HOST=0.0.0.0
```

不要在 `WEBUI_AUTH=false` 的情况下把 3000 端口暴露给公网。

## 为什么默认推荐 DeepSeek V4 Flash

Agent 最大的问题不是“能不能回答”，而是“能不能高频调用还不心疼”。

Hermes Agent 做真实任务时，会不断计划、试错、读文件、写文件、检查结果。这个过程很吃 token。如果底层模型太贵，普通人很难长期用。

DeepSeek V4 Flash 的意义就在这里：中文效果好，成本低，适合高频 Agent 工作流。OpenDeepSeek 的默认路线不是把 DeepSeek 当聊天窗口，而是把它放进真实 Agent 框架里，让用户、API、Agent 和模型后训练形成更有价值的数据飞轮。

## 项目链接

- GitHub：<https://github.com/mouxue56-debug/opendeepseek>
- Gitee：<https://gitee.com/luoxueai/opendeepseek>
- 国际安装：

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/mouxue56-debug/opendeepseek/main/install.sh)
```

- 国内安装：

```bash
bash -c "$(curl -fsSL https://gitee.com/luoxueai/opendeepseek/raw/main/install-cn.sh)"
```

如果你希望 DeepSeek 不只是陪你聊天，而是真的帮你生成文件、整理资料、做网页、跑任务，OpenDeepSeek 就是为这个场景准备的。
