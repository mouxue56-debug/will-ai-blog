export type CaseStudy = {
  slug: string;
  title: { zh: string; ja: string; en: string };
  subtitle: { zh: string; ja: string; en: string };
  category: string;
  techStack: string[];
  gradient: string;
  icon: string;
  keyLesson: { zh: string; ja: string; en: string };
  story: { zh: string; ja: string; en: string };
  technical: { zh: string; ja: string; en: string };
  deep: { zh: string; ja: string; en: string };
  metrics: { label: { zh: string; ja: string; en: string }; value: string }[];
};

export const cases: CaseStudy[] = [
  {
    slug: 'multi-ai-architecture',
    title: {
      zh: '多AI协作架构',
      ja: 'マルチAI協調アーキテクチャ',
      en: 'Multi-AI Collaboration Architecture',
    },
    subtitle: {
      zh: '4个AI助手如何协同工作',
      ja: '4つのAIアシスタントの連携',
      en: 'How 4 AI Assistants Work Together',
    },
    category: 'ai-architecture',
    techStack: ['OpenClaw', 'Mac Mini M4', 'launchd', 'Tailscale', 'Kimi', 'DeepSeek'],
    gradient: 'from-brand-cyan via-brand-mint to-brand-taro',
    icon: '🤖',
    keyLesson: {
      zh: '最省事的单实例，长期往往是最贵的架构选择。',
      ja: 'いちばん手軽な単一インスタンスこそ、長期では最も高くつくことがある。',
      en: 'The simplest single-instance setup often becomes the most expensive architecture over time.',
    },
    story: {
      zh: '最先崩掉的不是模型，而是我自己的工作节奏。白天猫舍在接客户，晚上要推进医疗 AI 项目，社交平台还在不停催更；同一个 AI 助手被我拉去写代码、回消息、做内容，结果就是每一头都慢半拍。客户消息开始堆积，技术任务被频繁打断，明明工作时长越来越长，产出却越来越碎。问题不是我不够努力，而是单线程 AI 根本承接不了多业务并行。后来我不再把 AI 当成一个万能助手，而是按团队方式拆成技术、内容、业务和移动响应四个角色，系统才第一次真正顺起来。',
      ja: '猫舎の運営、医療AIの案件、そして5つのSNS運用。最初は1つのAIアシスタントで全部回そうとしていましたが、すぐに限界が来ました。問い合わせ対応は滞り、投稿は止まり、技術案件も中断しがちになる。努力の問題ではなく、1つの窓口に全部を載せる設計が無理だったんです。そこで発想を変えて、AIを「万能な1人」にするのではなく、チームのように役割分担させました。技術、コンテンツ、業務支援、モバイル対応を分けたことで、ようやく運用が安定しました。',
      en: 'Running a cattery, providing medical AI consulting, and managing 5 social media platforms simultaneously — this isn\'t resume padding, it\'s my daily life. I started with a single AI assistant and quickly hit its limits: customer messages piled up, SNS content went stale, and tech projects stalled. So I started thinking: could I create a "division of labor" for AI, just like a company? From one instance to two, then four, each with its own expertise and memory. This isn\'t over-engineering — it\'s the only way one person can become a team.',
    },
    technical: {
      zh: '底层运行在 OpenClaw，硬件是一台 Mac Mini M4，同机挂 4 个实例但严格隔离端口、日志目录、服务名和缓存路径。实例分工是固定的：ユキ负责代码与架构，ナツ负责 SNS 与品牌，ハル处理客户沟通和行政，アキ负责移动端即时响应。编排层用 launchd 常驻服务 + watchdog 心跳巡检，30 秒轮询实例状态，超时就自动重启并写入独立日志。记忆层通过共享知识库、daily notes 和跨实例同步脚本做状态传递，避免每个实例都从零开始。网络层走 Tailscale，保证我不在机器旁边也能远程接管。模型策略也不是单模型硬扛，而是按任务路由和 fallback 链分流：MiniMax 处理高频对话，Kimi 负责日语文案，DeepSeek 负责深度分析，超额或异常时自动降级到备用模型。',
      ja: '基盤はOpenClaw、ハードはMac Mini M4です。4つのインスタンスには最初から役割を固定しました。ユキはコードと設計、ナツはSNSとブランド、ハルは顧客対応と事務、アキはモバイルでの即応担当です。安定運用のために入れたのは主に3つ。1つ目はwatchdogによるハートビート監視と自動再起動、2つ目は共有ナレッジベースによる記憶同期、3つ目はTailscaleでのリモート接続です。モデルも1つに寄せず、用途ごとに使い分けています。日本語コピーはKimi、深い分析はDeepSeek、日常の高頻度処理はMiniMaxが中心です。',
      en: 'Built on the OpenClaw platform, I deployed four AI instances on a single Mac Mini M4: Yuki (tech engineer handling code and architecture), Natsu (SNS consultant for content creation and brand operations), Haru (business assistant for client communication and admin), and Aki (mobile, always-on response). Core tech includes: dual-instance watchdog monitoring (heartbeat detection + auto-restart), shared knowledge base for memory sync, and Tailscale networking for remote access. The model strategy uses multi-model fallback: primary MiniMax M2.5-HS, Japanese content via Kimi K2.5, and deep analysis through DeepSeek V3.2 Thinking.',
    },
    deep: {
      zh: '这里最反直觉的一课是：多实例的最大收益，不是“并行更快”，而是“上下文更干净”。一开始我以为多开几个实例主要是为了提速，后来才发现真正被修复的是决策质量。单实例虽然看起来集中统一，但不同业务不断抢上下文，最后谁都做不好。反而是把角色拆细、把记忆边界写死之后，每个实例输出更稳定，人工返工也显著下降。吃过亏之后我才确认，多实例不是豪华配置，而是业务一旦跨内容、客户和技术三条线后，最低成本的秩序方案。',
      ja: '実際に難しかったのは、インスタンスを起動することよりも境界をきちんと分けることでした。同じマシンで複数動かすと、問題になりやすいのはモデルそのものではなく設定まわりです。ポート、ログ、サービス名、キャッシュディレクトリのどれか1つでも分離が甘いと、あとで不具合が連鎖します。ハートビートの間隔も何度か調整して、ようやく負荷と検知速度のバランスが取れました。トークン上限も手動監視では回らないので、fallbackの設計を最初から組み込んでいます。この構成で一番はっきり分かったのは、AIに役割と継続した記憶を持たせると、出力の質が目に見えて安定するということです。万能型より、役割が明確な専門型の方が強いです。',
      en: 'The pitfalls outnumbered the lines of code. Configuration conflicts were the first big trap — running two instances on the same machine meant isolating ports, launchd service names, and log paths completely. Heartbeat intervals were adjusted three times: too short wastes resources, too long misses downtime, and we settled on 30 seconds. Token quota management is an ongoing challenge, addressed through automatic model fallback chains (primary → backup → lightweight) to prevent service interruption. The most unexpected discovery: giving AI instances distinct personalities and specializations significantly improved their output quality — "jack of all trades" loses to "specialist." Future plans include a fifth instance dedicated to data analysis.',
    },
    metrics: [
      { label: { zh: '响应提速', ja: '応答改善', en: 'Response Speed' }, value: '3.2x' },
      { label: { zh: '周节省工时', ja: '週次削減工数', en: 'Hours Saved / Week' }, value: '18h' },
      { label: { zh: '自动化任务', ja: '自動化タスク', en: 'Automated Tasks' }, value: '24' },
      { label: { zh: '正常运行', ja: '稼働率', en: 'Uptime' }, value: '99.5%' },
    ],
  },
  {
    slug: 'cattery-sns-automation',
    title: {
      zh: '猫舎SNS自动化',
      ja: '猫舎SNS自動化',
      en: 'Cattery SNS Automation',
    },
    subtitle: {
      zh: 'AI帮我运营5个平台',
      ja: 'AIが5つのプラットフォームを運営',
      en: 'AI Managing 5 Platforms For Me',
    },
    category: 'sns',
    techStack: ['DeepSeek', 'Kimi K2.5', 'MiniMax', 'Edge TTS', 'Qwen3-TTS', 'OpenClaw'],
    gradient: 'from-brand-coral via-brand-mango to-brand-mint',
    icon: '📱',
    keyLesson: {
      zh: '平台原生感不是翻译问题，而是内容结构重写问题。',
      ja: 'プラットフォームらしさは翻訳ではなく、構成の作り直しで決まる。',
      en: 'Platform-native tone is not translation work. It is structural rewriting.',
    },
    story: {
      zh: '最混乱的时候，我一个人同时盯着 5 个平台：Instagram 要图文氛围，TikTok 要短视频节奏，小红书要关键词和搜索入口，Lemon8 讲生活方式，みんなの子猫ブリーダー又要求专业可信。白天在照顾猫、接客户，晚上还得一条条补内容，几乎每天都在追着平台时钟跑。我一开始试过最省事的做法，一篇内容改几句就全平台发，结果几乎每个平台都不讨好。那时候我才彻底接受一件事：我缺的不是一个自动发布按钮，而是一套能把同一个主题拆成 5 种表达方式的内容系统。',
      ja: '猫舎の発信は、猫の写真を撮って終わりではありません。Instagram、TikTok、小紅書、Lemon8、みんなの子猫ブリーダー。この5つは毎日コンテンツを必要としますが、求めているものは同じではないんです。最初は効率重視で、1本の原稿を少し変えて全部に流していました。でも結果はかなり悪かった。Instagram向けのやわらかい日本語は小紅書では弱く、TikTok向けのテンポ感はブリーダーサイトでは軽すぎる。必要だったのは単純な自動投稿ではなく、媒体ごとに表現を組み替えられる運用の仕組みでした。',
      en: 'Instagram, TikTok, Xiaohongshu, Lemon8, Minna no Koneko Breeder — five platforms, daily updates required. Running a cattery solo means daytime is cat care, client meetings, and admin work. Nights for creating content across five platforms? This isn\'t about working harder — it\'s physically impossible. I first tried "one post everywhere" and it bombed: Japanese Instagram copy fell flat on Xiaohongshu, TikTok-style shorts looked unprofessional on the breeder platform. Each platform has its own language, tone, and user expectations. I didn\'t need copy-paste — I needed a content team that truly understands platform differences.',
    },
    technical: {
      zh: '这套内容流水线拆成策略、创作、分发三层。策略层用 DeepSeek V3.2 Thinking 读取各平台历史数据，先决定一周主题和素材优先级。创作层按平台分模型：Instagram 日语文案由 Kimi K2.5 负责，强调空气感和敬语细节；小红书和 TikTok 中文标题、封面文案交给 MiniMax，强化数字感和开头钩子；Lemon8 用偏生活方式的长图文模板；みんなの子猫ブリーダー则走专业说明模板，补足血统、健康、性格和售后信息。分发层再按平台做结构重写，不是简单翻译。视频旁白默认用 Edge TTS，日本语气更柔和；需要情绪张力的内容切到本地 Qwen3-TTS。最终从“选题确认”到“5 平台全部出稿”，稳定压缩到 30 分钟内。',
      ja: 'この運用フローは3層に分けています。まず戦略層でDeepSeekが各媒体の反応や傾向を見て、1週間のテーマ配分を決める。次に制作層で、日本語コピーはKimi、中国語コンテンツはMiniMaxに担当を分け、言語ごとの自然さを担保する。最後の配信層では、ただ同じ内容を貼り替えるのではなく、媒体ごとに構成を組み直します。Instagramは写真と空気感、TikTokは冒頭の引きとテンポ、小紅書は検索導線になるタグやキーワードを強化。音声も、通常のナレーションはEdge TTS、感情を乗せたいものはローカルTTSに振り分けています。テーマ決定から5媒体分の原稿完成まで、30分以内で回せるようにしました。',
      en: 'The content generation pipeline has three layers: the strategy layer uses DeepSeek V3.2 Thinking to analyze data trends across platforms, determining weekly content direction and topic allocation. The creation layer uses Kimi K2.5 for Japanese copy (native-level naturalness) and MiniMax M2.5-HS for Chinese content. The distribution layer auto-adjusts formatting per platform — Instagram focuses on visuals, TikTok extracts key frames for scripts, and Xiaohongshu adds Chinese tags and search terms. For voice, Edge TTS Japanese voices handle short video narration, while locally-deployed Qwen3-TTS covers content requiring emotional expression. The entire flow from "topic decided" to "5-platform content ready" is compressed to under 30 minutes.',
    },
    deep: {
      zh: '这个项目最意外的收获是，平台原生感和语言能力其实是两回事。哪怕日语写得再自然，把 Instagram 的“空气感”直接搬去小红书，依旧会失效，因为用户消费内容的动机完全不同。真正有用的不是翻译，而是先判断平台在奖励什么，再重写信息密度、开头结构和情绪节奏。我也是踩了很多次数据回落才学明白：同一个主题不是一稿多发，而是一套素材、多种叙事，平台越像本地人，自动化才越不像机器。',
      ja: 'この案件で一番甘く見てはいけなかったのは、「翻訳すれば流用できる」という発想でした。日本のInstagramで効くのは空気感や距離感、小紅書で求められるのは情報密度と検索性、TikTokは最初の数秒でつかめるかどうか、ブリーダーサイトでは専門性と信頼感が最優先です。つまり同じテーマでも、少し言い換えるだけでは足りず、タイトル設計から語気、構成まで作り直す必要があります。これを2か月かけて媒体別のプロンプトとスタイルガイドに落とし込んで、ようやく再現性が出ました。投稿時間の設計も重要で、媒体ごとに反応の出る時間帯がまったく違います。',
      en: 'The biggest lesson: platform tone differences are far greater than imagined. Japanese Instagram users prefer "atmospheric" copy — lots of whitespace, subtle emotions, polished visuals. Chinese Xiaohongshu users want "substance" — specific data, direct experience, numbers in titles. TikTok needs to grab attention in the first 3 seconds, while the breeder platform demands professional, trustworthy detailed information. I spent two months tuning prompt templates per platform, and now each has independent writing style guides stored in OpenClaw skill files. Another pitfall: auto-posting timing strategy. Each platform has different peak hours — Japanese Instagram is 8-10 PM, Xiaohongshu is noon to 1 PM — all requiring precise scheduling.',
    },
    metrics: [
      { label: { zh: '粉丝增长', ja: 'フォロワー増加', en: 'Follower Growth' }, value: '+2.4k' },
      { label: { zh: '互动率提升', ja: 'エンゲージメント改善', en: 'Engagement Lift' }, value: '+68%' },
      { label: { zh: '周节省工时', ja: '週次削減工数', en: 'Hours Saved / Week' }, value: '14h' },
      { label: { zh: '覆盖平台', ja: '対応プラットフォーム', en: 'Platforms' }, value: '5' },
    ],
  },
  {
    slug: 'medical-ai-service',
    title: {
      zh: '医療AI導入',
      ja: '医療AI導入',
      en: 'Medical AI Integration',
    },
    subtitle: {
      zh: '再生医療クリニックのAI活用',
      ja: '再生医療クリニックのAI活用',
      en: 'AI for Regenerative Medicine Clinics',
    },
    category: 'medical',
    techStack: ['OpenClaw', 'LINE Messaging API', 'Claude', 'APPI', 'Multilingual'],
    gradient: 'from-brand-taro via-brand-cyan to-brand-mint',
    icon: '🏥',
    keyLesson: {
      zh: '医疗 AI 不是更聪明的客服，而是带边界运行的高风险系统。',
      ja: '医療AIは賢いチャットボットではなく、境界付きで運用する高リスクシステム。',
      en: 'Medical AI is not a smarter chatbot. It is a high-risk system that must operate within hard boundaries.',
    },
    story: {
      zh: '这家大阪小型再生医疗诊所最真实的问题，不是“想上 AI”，而是前台已经快接不住外国患者了。每天都有中文、英文、韩文咨询进来，但现场人手有限，主要又只能用日语应对；一到夜间和周末，消息更是直接积压。普通翻译工具在医疗语境里还经常失真，同一句话一旦翻错，影响的不只是效率，而是患者理解、风险认知和对诊所的信任。他们真正需要的，不是一个会说多国语言的客服机器人，而是一套能守住合规边界、理解医疗上下文、还能 24 小时接待的咨询系统。',
      ja: '日本の再生医療クリニックでは、ここ数年で外国人患者の問い合わせがかなり増えています。一方で、受付やカスタマーサポートの人員は簡単には増やせません。大阪のあるクリニックから相談を受けたときも、悩みの中心は多言語対応でした。中国語、韓国語、英語の問い合わせが毎日届くのに、現場スタッフは基本的に日本語対応が中心。しかも一般的な翻訳ツールは、医療文脈になると精度が不十分です。ここでの誤訳は、単なる使い勝手の問題ではなく、理解の齟齬や信頼低下につながります。必要だったのは、翻訳だけをするボットではなく、医療の文脈を踏まえ、個人情報にも配慮しながら24時間対応できる受付システムでした。',
      en: 'Japan\'s regenerative medicine industry faces two simultaneous challenges: severe staffing shortages and rapidly growing foreign patients. An Osaka regenerative medicine clinic approached me — they receive daily inquiries in Chinese, Korean, and English, but their front desk staff only speaks Japanese. Google Translate is riddled with errors in medical contexts. When a patient asks "What are the side effects of stem cell therapy?", the translation comes out with a completely different meaning. Medical settings have zero tolerance for translation errors — this isn\'t a UX issue, it\'s a safety issue. They needed more than translation: an intelligent customer service system that understands medical context, complies with privacy laws, and operates 24/7.',
    },
    technical: {
      zh: '日本诊所最自然的患者入口就是 LINE，所以系统主入口直接接在 LINE Messaging API 上：Webhook 收消息，先做语言识别、意图分类和风险分级，再决定是走 FAQ、预约流程还是人工转接。OpenClaw 上单独跑医疗咨询实例，Claude 负责高风险术语理解和回复生成，多语言模板覆盖日语、中文、英语、韩语。预约部分和诊所现有排期工具打通，AI 可以查空档、确认预约、发送提醒，并把关键状态写回后台。合规层按 APPI 做了前置约束：PII 在进模型前先脱敏，日志只保留必要字段，敏感对话设置清理周期，所有回复附带“非诊断/非医疗建议”边界说明，确保系统从入口就不是一个随便回答的聊天机器人。',
      ja: '日本の医療機関では、患者とのやり取りにLINEを使うケースが非常に多いため、この仕組みもLINE APIを入口に設計しました。OpenClaw上には医療問い合わせ専用のインスタンスを立て、事前相談、予約確認、基本説明を切り分けて処理します。モデルの中核にはClaudeを使い、医療用語や慎重な言い回しが必要な場面を担当させました。多言語対応では、まずメッセージ言語を判定し、そのうえで日本語は敬語、中国語は簡体字の専門表現、英語と韓国語もそれぞれのテンプレートに切り替えます。さらに既存の予約システムと連携し、空き状況の確認、予約確定、リマインド送信までAIで回せるようにしました。会話データはモデル投入前にPIIをマスクし、個人情報が先に漏れない構成にしています。',
      en: 'LINE is the most common patient communication channel in Japanese medical institutions, so we built the customer service automation system around the LINE API. An AI instance deployed on OpenClaw handles medical consultations, with Claude as the foundation for understanding and generating complex medical terminology. For multilingual support, the system auto-detects message language and switches response modes: Japanese uses polite form (keigo), Chinese uses simplified professional expressions, and English/Korean have corresponding templates. The appointment management system integrates with the clinic\'s existing booking software, enabling AI to directly query availability, confirm appointments, and send reminders. All conversations undergo PII anonymization before reaching AI models, ensuring patient privacy.',
    },
    deep: {
      zh: '医疗 AI 和普通聊天机器人最本质的差别，不在于语气更严肃，而在于它必须默认自己会遇到边界情况。普通客服 bot 回错一句，多半只是体验差；医疗 AI 回错一句，可能就是错误期待、错误决策，甚至合规事故。所以这类系统不能只追求“回答得像不像人”，而是要先决定什么能答、什么必须拒答、什么要立即转人工。我真正踩坑后才确认，医疗场景里最重要的能力不是生成，而是克制：知道什么时候闭嘴、什么时候留痕、什么时候把问题交回人类。',
      ja: '医療AIで本当に難しいのは、返答を生成できるかどうかではなく、それをコンプライアンスの範囲内で安定運用できるかです。日本の個人情報保護法では医療関連データの扱いが厳しいため、設計段階から境界を先に決めました。患者データは可能な限り国内で扱うこと、会話ログはルールに沿って削除すること、AIの返答には「医療アドバイスではない」旨を必ず添えること。もう1つ難しいのは、医療用語が言語をまたぐと綺麗に1対1対応しない点です。医師、患者、翻訳ツールで呼び方がずれるので、用語マッピングを持っていないと表現がぶれます。導入後に分かったのは、夜間や週末の問い合わせが全体のかなり大きな割合を占めていたことでした。そこは従来ほぼ無人だったので、効果が最も大きく出た部分です。',
      en: 'The biggest challenge in medical AI isn\'t technology — it\'s compliance. Japan\'s Act on Protection of Personal Information (APPI) has strict rules for medical data. We must ensure: 1) patient data never leaves Japanese servers; 2) conversation logs are regularly purged; 3) AI responses must include "not medical advice" disclaimers. Another deep issue is medical terminology "dialects" — Japanese doctors habitually mix Japanese and English medical terms, Chinese patients have their own expressions (e.g., "干细胞" vs "幹細胞" vs "stem cell"), and the AI needs a medical terminology mapping table to ensure cross-language consistency. The biggest surprise post-deployment: nighttime and weekend inquiries account for 45% of total volume — previously completely uncovered by staff.',
    },
    metrics: [
      { label: { zh: '月处理咨询', ja: '月間対応件数', en: 'Monthly Inquiries' }, value: '520+' },
      { label: { zh: '支持语言', ja: '対応言語', en: 'Languages' }, value: '4' },
      { label: { zh: '响应时间', ja: '応答時間', en: 'Response Time' }, value: '-80%' },
      { label: { zh: '夜间覆盖', ja: '夜間カバー率', en: 'After-hours Coverage' }, value: '45%' },
    ],
  },
  {
    slug: 'dior-candy-site',
    title: {
      zh: 'Dior 糖果色人格站',
      ja: 'Diorキャンディペルソナサイト',
      en: 'Dior Candy Persona Site',
    },
    subtitle: {
      zh: '6 人格 × 液态玻璃 × 本机 Agent',
      ja: '6ペルソナ × リキッドグラス × ローカルAgent',
      en: '6 Personas × Liquid Glass × Local Agent',
    },
    category: 'web-frontend',
    techStack: ['Next.js 15', 'Tailwind v4', 'Hermes', 'Supabase', 'iOS26 Liquid Glass'],
    gradient: 'from-[#FF7B9C] via-[#B48EE0] to-[#5CC9A7]',
    icon: '🍭',
    keyLesson: {
      zh: '把设计系统从"Ice Cream"延伸到"糖果 Dior"，关键是克制——人格色只做锚点，不当底色。',
      ja: 'デザインシステムをIce CreamからDiorキャンディに拡張する鍵は節制。ペルソナ色はアクセントに留める。',
      en: 'Extending the design system from Ice Cream to Candy Dior hinges on restraint — persona colors are anchors, not backgrounds.',
    },
    story: {
      zh: '一开始想做"Dior 液态玻璃 + 小红书瀑布流 + 糖果奶油色 hero"的三合一，结果全糖版本一上就翻车——信息密度被糖色吃掉，阅读成本陡升。回滚到 Ice Cream 深色基座，糖色只留给人格卡片的光环和 hover halo，设计系统才重新跑起来。同时把 Hermes agent 跑在本机 localhost:9119，不走云，6 个人格模板各带自己的系统 prompt 和色谱。',
      ja: '当初は「Diorリキッドグラス + 小紅書マソンリー + キャンディクリームhero」を同時に盛り込もうとしましたが、一度目は完全に情報密度に負けました。Ice Cream深色ベースに戻し、キャンディ色はペルソナカードのhalo・hoverのみに限定。Hermes agentはクラウドを経由せず、ローカル(localhost:9119)に常駐しています。',
      en: 'First attempt bundled Dior liquid glass, Xiaohongshu masonry, and candy-cream hero into one layout — information density was crushed by the color. Rolled back to the Ice Cream dark baseline and confined candy tones to persona halos and hover states. Hermes runs locally on localhost:9119 with six persona templates each carrying their own system prompt and palette.',
    },
    technical: {
      zh: 'Next.js 15 + Tailwind v4 @theme tokens，Dior 糖果色作为覆盖层而不是基础色：pink #FF7B9C / mint #5CC9A7 / lav #B48EE0 / yel #FFCB45。液态玻璃走 backdrop-filter blur(26px) saturate(185%) + 多层 tinted shadow。Hermes 本地实例通过 OpenAI-compat 转发 Kimi/MiniMax/DeepSeek，人格切换不走 API 只换 system prompt + avatar。数据层接 Supabase daily_reports，6 种 topic 走瀑布流。',
      ja: 'Next.js 15 + Tailwind v4の@themeトークン構成。Diorキャンディ色はベース色ではなくオーバーレイとして適用(pink/mint/lav/yel)。リキッドグラスはbackdrop-filter blur(26px) saturate(185%) + 多層tinted shadow。HermesはOpenAI互換でKimi・MiniMax・DeepSeekを転送し、ペルソナ切替はsystem promptとavatarの差し替えのみ。データはSupabaseのdaily_reportsから6種別でマソンリー表示。',
      en: 'Next.js 15 with Tailwind v4 @theme tokens. Dior candy hues are applied as overlays rather than base colors: pink/mint/lav/yel. Liquid glass uses backdrop-filter blur(26px) saturate(185%) + multi-layer tinted shadows. Hermes runs as an OpenAI-compat proxy routing to Kimi/MiniMax/DeepSeek; persona switching is a swap of system prompt and avatar, not a separate API. Data layer queries Supabase daily_reports, rendered as masonry across 6 topic types.',
    },
    deep: {
      zh: '最反直觉的点：人格色一旦铺满就会互相抵消。初版 hero 放了四条人格色带，用户进来只记得"很糖很乱"。最后改成 Ice Cream 冷色基座 + 人格卡片只在 hover 时激活 halo，记忆点才回来。另一个坑是液态玻璃在 Safari iOS 的 backdrop-filter 有 bug，要用 -webkit 前缀 + 降级纯 rgba。测试机覆盖 iOS 26 / macOS 15 / Chrome / Safari 四条线。',
      ja: '最も反直感的だったのは、ペルソナ色を全面に敷くと互いに打ち消し合うこと。初版のheroには4色の帯を並べましたが、記憶に残るのは「甘い・うるさい」だけでした。Ice Creamの冷色ベースに戻し、ペルソナカードはhover時のみhaloを発火させる構成にしたところ、識別性が戻りました。Safari iOSのbackdrop-filterには既知の挙動差があるため、-webkitプレフィックス + rgba fallbackで対応しています。',
      en: 'Most counter-intuitive finding: saturating the hero with persona colors caused them to cancel each other out — users only remembered "sweet and noisy." Returning to an Ice Cream cold base and only triggering persona halos on hover restored identity. Another trap: Safari iOS has quirks with backdrop-filter that require both -webkit prefixes and an rgba fallback. Tested across iOS 26 / macOS 15 / Chrome / Safari.',
    },
    metrics: [
      { label: { zh: '人格模板', ja: 'ペルソナ', en: 'Personas' }, value: '6' },
      { label: { zh: 'LCP', ja: 'LCP', en: 'LCP' }, value: '1.4s' },
      { label: { zh: '设计 Token', ja: 'Token数', en: 'Design Tokens' }, value: '60+' },
      { label: { zh: 'i18n 语言', ja: 'i18n言語', en: 'Locales' }, value: '3' },
    ],
  },
  {
    slug: 'fuluck-ai-service',
    title: {
      zh: 'Fuluck AI — AI 接单站',
      ja: 'Fuluck AI — AI受託サイト',
      en: 'Fuluck AI — Freelance Service Site',
    },
    subtitle: {
      zh: '从猫舎到 AI 顾问的商务入口',
      ja: '猫舎からAIコンサルへの商業入口',
      en: 'Business gateway from cattery to AI consulting',
    },
    category: 'web-business',
    techStack: ['Next.js', 'Supabase', 'Stripe-ready', 'LINE Login', 'i18n'],
    gradient: 'from-brand-cyan via-brand-mint to-brand-taro',
    icon: '🤝',
    keyLesson: {
      zh: '副业 landing 最致命的不是设计，而是把"能做什么"说成日语客户能复读的一句话。',
      ja: '副業ランディングで致命的なのは装飾ではなく、「何ができるか」を日本のクライアントが復唱できる一文に落とせるかどうか。',
      en: 'The deadliest side-project landing mistake is not design — it is failing to compress "what I can do" into one sentence a Japanese client can repeat.',
    },
    story: {
      zh: 'fuluckai.com 最早只是猫舎的技术栈溢出：客户看到我给 LINE / Instagram 自动化的结果，就直接问"能不能顺便帮我做一个"。订单开始零星进来后，我才发现没有独立商业入口的损耗很大：每一单都要从头解释多语言 AI 流水线，而客户其实只需要三句话看懂能不能接。于是把 AI 接单单独切成一张站，围绕"多语言客服、自动化内容、LINE bot、TTS 视频"四类模板做产品化。',
      ja: 'fuluckai.comは最初、猫舎での技術副産物でした。「LINEとInstagramの自動化、うちにもやってもらえる？」という相談が増え、独立した商業入口がないと毎回ゼロから説明する必要があることに気づきました。多言語CS、コンテンツ自動化、LINE bot、TTS動画の4テンプレートに絞り、プロダクト化しました。',
      en: 'fuluckai.com started as a spillover of the cattery stack — clients saw my LINE/Instagram automations and asked "can you just do one for us?" Once orders trickled in I realized the lack of a dedicated business entry was expensive: each deal started by re-explaining the multilingual AI pipeline. So I split the freelance surface into its own site, productized into four templates: multilingual CS, content automation, LINE bot, TTS video.',
    },
    technical: {
      zh: 'Next.js + Supabase 做线索收集（不走重 CRM），Stripe payment 预留但默认关闭，主转化路径是 LINE Login 拿到用户资料后自动同步 Notion 线索池。站内结构按"服务模板 → 实际案例 → 开口价"三段漏斗设计，每个模板都指向 /cases 的具体落地案例。语言切换做了 zh/ja/en，日语版直接走 Kimi K2.5 调语气，避免机翻。',
      ja: 'Next.js + Supabaseでリード収集(重いCRMは導入しない)、Stripe連携は予約のみで本番は未有効。主導線はLINE Loginでユーザー情報を取得→Notionリードプールに自動同期。サイト構成は「サービステンプレート→実案件→目安価格」の3段ファネル、各テンプレートは/casesの実装事例と紐付け。日本語版はKimi K2.5を通して敬語を整える。',
      en: 'Next.js + Supabase for lightweight lead capture (no heavy CRM). Stripe is wired but disabled by default. Main funnel: LINE Login → user profile auto-synced to a Notion lead pool. Site structure is a three-stage funnel (service template → real case → starting price), each template links to the matching /cases entry. Locales: zh/ja/en; Japanese copy runs through Kimi K2.5 to tune formality.',
    },
    deep: {
      zh: '商业站最大的陷阱是把"我能做什么"写成技术栈清单。日语客户对 LanceDB / launchd / Tailscale 零感知，他们只想知道"有没有做过类似规模的"和"多少钱起"。所以首页不展示模型、不展示架构图，只展示"我们给某家诊所做的，降了 80% 响应时间"这类对齐结果的句式。技术栈反倒收进案例详情页，给真正要深挖的客户看。',
      ja: 'ビジネスサイトで最大の落とし穴は、「できること」を技術スタックの羅列にしてしまうこと。日本のクライアントにはLanceDBやlaunchdは響かず、関心は「類似規模の実績はあるか」と「いくらから」に集中します。ホームは技術詳細を見せず、「某クリニック向けに応答時間を80%削減した」といった結果ベースの一文で整理し、技術はケース詳細ページに畳んでいます。',
      en: 'The biggest trap for a business site is expressing "what I can do" as a tech-stack list. Japanese clients do not react to LanceDB / launchd / Tailscale — they want to know "have you shipped something at my scale" and "how much to start." So the home avoids model names and architecture diagrams; it leads with outcome sentences like "cut response time by 80% for an Osaka clinic." The stack lives inside case detail pages, for clients who actually want to drill in.',
    },
    metrics: [
      { label: { zh: '服务模板', ja: 'テンプレート', en: 'Templates' }, value: '4' },
      { label: { zh: '月咨询', ja: '月間問合せ', en: 'Monthly Leads' }, value: '30+' },
      { label: { zh: '平均成交周期', ja: '成約サイクル', en: 'Cycle' }, value: '11d' },
      { label: { zh: 'i18n 语言', ja: '対応言語', en: 'Locales' }, value: '3' },
    ],
  },
  {
    slug: 'fuluck-cattery-site',
    title: {
      zh: 'Fuluck Cattery 猫舎官网',
      ja: 'Fuluck Cattery 公式サイト',
      en: 'Fuluck Cattery Official Site',
    },
    subtitle: {
      zh: '大阪西伯利亚猫专属品牌站',
      ja: '大阪のサイベリアン専門ブランドサイト',
      en: 'Osaka Siberian specialty cattery brand site',
    },
    category: 'web-business',
    techStack: ['Next.js', 'Sanity / MD', 'LINE', 'Cloudflare', 'Image CDN'],
    gradient: 'from-brand-mango via-brand-coral to-brand-mint',
    icon: '🐱',
    keyLesson: {
      zh: '买家不是在比价格，是在比能不能信任你下一个 10 年——所以猫舎站第一视觉必须是信任凭证，不是猫颜值。',
      ja: '買い手は価格ではなく「これから10年信頼できるか」を比較している。猫舎サイトで最初に見せるべきは子猫の写真ではなく信頼の裏付け。',
      en: 'Buyers are not comparing price — they are comparing whether they can trust you for the next decade. The first visual of a cattery site must be trust evidence, not kitten glamour shots.',
    },
    story: {
      zh: '最早以为卖点是"サイベリアン可爱"，堆了一堆高饱和可爱写真，结果转化很差。访谈完下单客户才发现他们做决策时最焦虑的是"这只猫的父母健康吗、会不会遗传病、售后有没有人接"。所以整站重构成"血统 → 健康测试 → 出售流程 → 老客户回访"四段故事，猫颜值图反倒后置。顺便把社群从 Instagram 迁到 LINE 官方账号做售后主阵地。',
      ja: '当初は「サイベリアンの可愛さ」が訴求だと思い、写真中心で構成しましたが成約は振るわず。購入者インタビューで「親猫の健康」「遺伝子検査」「アフターフォロー」が決定要因だと判明。全面再構築し、血統→健康検査→購入プロセス→既存オーナーの声、の4ブロック構成へ。可愛い写真は意図的に後半へ下げ、アフターはInstagramではなくLINE公式アカウントに集約しました。',
      en: 'I initially assumed the pitch was "Siberian cats are cute" and filled the hero with glamour photos — conversion tanked. Buyer interviews revealed the real anxiety points: parent cats\' health, genetic testing, and after-sale support. Rebuilt the site around a four-act story (pedigree → health tests → purchase flow → owner testimonials), pushing kitten glamour photos later. Moved the community hub from Instagram to an official LINE account for after-sale support.',
    },
    technical: {
      zh: 'Next.js + MD 内容源，文章和血统档案都可以 git 管理；猫个体页面走静态生成，母猫 / 公猫 / 幼猫三类模板共享同一 schema。图片全部走 Cloudflare Image CDN + webp，移动端首屏 <1.8s。LINE 接入走官方 Messaging API，把"预约看猫"做成 rich menu 上的一键按钮，后台写 Supabase 排期。',
      ja: 'Next.js + Markdownでコンテンツ管理し、記事と血統情報をgitで一元化。個体ページはSSG、母猫/父猫/子猫の3テンプレートで同一schemaを共有。画像はCloudflare Image CDN + webpに寄せ、モバイル初描画は1.8秒未満。LINE公式 Messaging APIを利用し、「お見合い予約」はリッチメニューの1タップに集約、バックエンドはSupabaseに書き込む予約システム。',
      en: 'Next.js with a Markdown content source — articles and pedigree records live in git. Cat profile pages are statically generated; queen/stud/kitten share one schema across three templates. Images flow through Cloudflare Image CDN + webp, keeping mobile LCP under 1.8s. LINE integration uses the official Messaging API, surfacing "book a visit" as a one-tap rich-menu action that writes appointments to Supabase.',
    },
    deep: {
      zh: '最反直觉的收获是，SNS 和官网不是竞争关系而是分工关系。Instagram 负责"让人第一次心动"，TikTok 负责"路人刷到也停留"，官网负责"已经心动的人把钱付下来"。所以官网可以放弃"酷炫动效 + 吸睛视频"这种抢注意力的做法，专心做信任落地。转化率回升后我才真正理解为什么很多日本老牌商家的官网看上去很朴素——因为他们把注意力和信任划到了不同的场景。',
      ja: '一番反直感的だったのは、SNSと公式サイトは競合ではなく役割分担だという点。Instagramは「初めて心が動く場所」、TikTokは「通りすがりでも止まる場所」、公式サイトは「すでに心が動いた人が支払うまでの場所」。その理解ができてからは、派手な動きや動画で注意を奪う作り方をやめ、信頼の可視化に集中しました。日本の老舗サイトがシンプルに見えるのは、役割を分けているからだと実感しました。',
      en: 'The most counter-intuitive lesson: SNS and the official site are not competing channels, they are a division of labor. Instagram is where someone falls in love, TikTok is where a stranger pauses, and the official site is where an already-interested buyer actually pays. Once I accepted that, I stopped chasing flashy motion and video on the site and focused on trust evidence. Conversion rose and I finally understood why long-running Japanese businesses keep their sites minimal — they route attention and trust to different surfaces.',
    },
    metrics: [
      { label: { zh: '首屏 LCP', ja: '初描画LCP', en: 'Mobile LCP' }, value: '1.7s' },
      { label: { zh: '转化率', ja: '成約率', en: 'Conversion' }, value: '+130%' },
      { label: { zh: '月咨询', ja: '月間問合せ', en: 'Monthly Inquiries' }, value: '40+' },
      { label: { zh: '平台迁移', ja: '主導線', en: 'Main Channel' }, value: 'IG→LINE' },
    ],
  },
];
