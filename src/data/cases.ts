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
];
