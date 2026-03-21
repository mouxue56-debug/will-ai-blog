---
slug: ai-clinic-case
title:
  zh: 为大阪诊所搭建多语言 AI 咨询系统
  ja: 大阪クリニックに多言語AI相談システムを構築した話
  en: Building a Multilingual AI Consultation System for an Osaka Clinic
category: business
date: "2026-03-08"
author: Will
readingTime: 9
excerpt:
  zh: 日本再生医疗クリニック，外国患者占30%，前台接中文电话接到崩溃。LINE Bot + AI，三个月把多语言咨询响应时间从24小时压到5分钟。
  ja: 外国人患者が30%を占める再生医療クリニック。LINE Bot + AIで多言語対応時間を24時間から5分に短縮。
  en: A Japanese regenerative medicine clinic with 30% foreign patients. LINE Bot + AI cut multilingual response time from 24h to 5 minutes.
---

## 诊所前台快撑不住了

去年年底，大阪市内一家内科クリニック找到我。诊所规模不大——7位全职员工，每月接诊约300名患者。

问题是这样的：他们的患者里有将近30%是外国人，主要是中国人和韩国人，来寻求再生医疗相关的咨询和治疗。这些患者基本不说日语，习惯用微信或LINE发消息咨询，而诊所前台只有日语。

**每天的流程是这样的**：外国患者发来中文消息 → 前台不懂，截图 → 转发给院长（会一点中文）→ 院长写回复 → 前台转发回去。平均响应时间24小时，患者等不及就去别家了。

院长跟我说，他们因为这个问题，估计每个月损失了10-15个新患者的初诊预约。

## 技术选型：为什么选 LINE

日本医疗机构最常用的沟通入口是 LINE，这一点不用争。患者已经在那里了，不需要教他们装新 App。

系统架构：

```
患者（LINE）
    ↓ webhook
LINE Messaging API
    ↓
OpenClaw 医疗咨询实例（アキ）
    ├── 语言检测
    ├── 意图分类（咨询/预约/紧急）
    ├── RAG 检索诊所知识库
    └── 回复生成（中文/日文/英文）
    ↓
患者收到回复
    
如果涉及具体诊断 → 转人工
如果是预约 → 写入预约系统
```

## APPI 合规是最麻烦的部分

日本的 APPI（個人情報保護法）对医疗相关个人信息要求很严。我在设计这套系统的时候，把合规限制作为第一优先级，而不是功能。

具体做了什么：

**1. 不存储对话内容超过必要时长**
咨询记录只在系统内保留72小时，之后自动删除。患者的基本信息（姓名、联系方式）不进 AI 上下文，单独存储在诊所现有的患者管理系统里。

**2. AI 不做任何诊断**
所有回复里，只要涉及「这个症状是什么」「这个治疗有没有效」这类问题，AI 会明确说「这个问题需要医师当面评估，以下是预约方式」。这条规则硬编码进了系统 prompt，无法绕过。

**3. 明确告知用户在和 AI 交互**
所有回复末尾都有固定标注：「本回复由 AI 助手生成，如需专业医疗建议请直接联系诊所」（中日双语）。

**4. 人工接管机制**
如果 AI 判断对话进入「患者情绪激动」「提及紧急症状」「明确要求人工」三种状态之一，立即推送通知给前台，转人工。

## 上线后的数据

运行了大约两个月：

- **平均响应时间**：从 24 小时 → 4.8 分钟（7×24 小时覆盖）
- **语言覆盖**：中文、日文、英文，韩文在测试中
- **转人工比例**：约 18%（其余由 AI 完整处理）
- **患者满意度**（诊所自行调查）：外国患者满意度从 3.1/5 → 4.4/5
- **院长的前台压力**：前台反馈「中文消息不再是负担了」

## 真正难的是什么

不是技术，是**边界设定**。

我花了整整一周时间和院长讨论：「AI 能做什么，不能做什么」。医疗场景的 AI，每一条规则背后都有患者安全的考虑。

举一个例子：有患者问「我之前做过A手术，现在想做B治疗，可以吗？」这个问题，AI 当然可以给一个通用答案，但通用答案在医疗场景里是危险的——每个患者的情况不同，A手术的具体情况可能影响B治疗的适应性。

所以这类问题，系统的回复永远是：「您的情况需要医师评估，请通过以下方式预约初诊」。哪怕患者觉得「你这个 AI 什么都不会」，也比给出一个看起来正确但可能误导人的答案要好。

---

技术栈：OpenClaw + LINE Messaging API + Claude + 自建 RAG 知识库 + Vercel Edge Functions


---

## 日英翻译（Kimi K2.5）

### 日本語

AIクリニック事例

クリニックの受付が限界に近づいている

昨年末、大阪市内のある内科クリニックから相談を受けた。規模は小さく、常勤スタッフ7名、月間約300名の患者を受け入れている。

問題はこうだ。患者の約30%が外国人で、主に中国人と韓国人で、再生医療に関する相談や治療を求めてくる。これらの患者は基本的に日本語を話さず、WeChatやLINEでメッセージを送る習慣があるが、クリニックの受付は日本語のみに対応していた。

**毎日の流れはこうだった**：外国人患者が中国語でメッセージを送信 → 受付が理解できず、スクリーンショットを撮る → 院長（中国語が少しできる）に転送 → 院長が返信を作成 → 受付が転送し返す。平均対応時間は24時間で、患者が待ちきれず他のクリニックに行ってしまう。

院長によると、この問題で毎月10〜15件の新規患者の初診予約を失っているとのことだった。

### English

ai-clinic-case

The clinic front desk is overwhelmed

At the end of last year, an internal medicine clinic in Osaka city approached me. It's a small operation—7 full-time staff, seeing about 300 patients per month.

Here's the problem: Nearly 30% of their patients are foreign nationals, mainly Chinese and Koreans seeking regenerative medicine consultations and treatment. These patients generally don't speak Japanese and prefer to send inquiries via WeChat or LINE, but the clinic front desk only handles Japanese.

**The daily workflow goes like this**: Foreign patient sends message in Chinese → Front desk doesn't understand, takes screenshot → Forwards to the director (who knows some Chinese) → Director writes reply → Front desk forwards it back. Average response time: 24 hours. Patients get impatient and go elsewhere.

The director told me they're probably losing an estimated 10-15 new patient first-visit appointments every month because of this issue.

> AI 翻译 | 2026-03-21
