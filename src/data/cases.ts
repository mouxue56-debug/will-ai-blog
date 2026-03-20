export type CaseStudy = {
  slug: string;
  title: { zh: string; ja: string; en: string };
  subtitle: { zh: string; ja: string; en: string };
  category: string;
  techStack: string[];
  gradient: string;
  icon: string;
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
    techStack: ['OpenClaw', 'Mac Mini M4', 'Tailscale', 'Claude', 'Kimi', 'DeepSeek'],
    gradient: 'from-brand-cyan via-brand-mint to-brand-taro',
    icon: '🤖',
    story: {
      zh: '我同时在做几件完全不同的事：经营猫舍、跑医疗 AI 项目、维护 5 个社交平台。刚开始只靠一个 AI 助手，结果很快就顶不住了。客户消息回不过来，内容更新跟不上，技术项目也被打断。问题不是我不够努力，而是单线程根本撑不起这些业务。后来我把思路换了，不再把 AI 当一个万能工具，而是按团队方式拆角色：技术、内容、业务、移动端各司其职。拆成四个实例以后，整个系统终于开始顺起来。',
      ja: '猫舎の運営、医療AIの案件、そして5つのSNS運用。最初は1つのAIアシスタントで全部回そうとしていましたが、すぐに限界が来ました。問い合わせ対応は滞り、投稿は止まり、技術案件も中断しがちになる。努力の問題ではなく、1つの窓口に全部を載せる設計が無理だったんです。そこで発想を変えて、AIを「万能な1人」にするのではなく、チームのように役割分担させました。技術、コンテンツ、業務支援、モバイル対応を分けたことで、ようやく運用が安定しました。',
      en: 'Running a cattery, providing medical AI consulting, and managing 5 social media platforms simultaneously — this isn\'t resume padding, it\'s my daily life. I started with a single AI assistant and quickly hit its limits: customer messages piled up, SNS content went stale, and tech projects stalled. So I started thinking: could I create a "division of labor" for AI, just like a company? From one instance to two, then four, each with its own expertise and memory. This isn\'t over-engineering — it\'s the only way one person can become a team.',
    },
    technical: {
      zh: '底层是 OpenClaw，硬件是一台 Mac Mini M4。我把四个实例拆成明确角色：ユキ负责代码和架构，ナツ负责内容和品牌，ハル处理客户沟通与行政，アキ负责移动端即时响应。为了让它们能长期稳定跑起来，我做了三层保障：第一层是 watchdog 心跳监控和自动重启，第二层是共享知识库做记忆同步，第三层是 Tailscale 远程组网，保证我不在机器旁边也能接管。模型层不是单模型硬扛，而是按任务分流和降级：日语文案给 Kimi，深度分析走 DeepSeek，默认高频任务交给 MiniMax。',
      ja: '基盤はOpenClaw、ハードはMac Mini M4です。4つのインスタンスには最初から役割を固定しました。ユキはコードと設計、ナツはSNSとブランド、ハルは顧客対応と事務、アキはモバイルでの即応担当です。安定運用のために入れたのは主に3つ。1つ目はwatchdogによるハートビート監視と自動再起動、2つ目は共有ナレッジベースによる記憶同期、3つ目はTailscaleでのリモート接続です。モデルも1つに寄せず、用途ごとに使い分けています。日本語コピーはKimi、深い分析はDeepSeek、日常の高頻度処理はMiniMaxが中心です。',
      en: 'Built on the OpenClaw platform, I deployed four AI instances on a single Mac Mini M4: Yuki (tech engineer handling code and architecture), Natsu (SNS consultant for content creation and brand operations), Haru (business assistant for client communication and admin), and Aki (mobile, always-on response). Core tech includes: dual-instance watchdog monitoring (heartbeat detection + auto-restart), shared knowledge base for memory sync, and Tailscale networking for remote access. The model strategy uses multi-model fallback: primary MiniMax M2.5-HS, Japanese content via Kimi K2.5, and deep analysis through DeepSeek V3.2 Thinking.',
    },
    deep: {
      zh: '真正麻烦的不是把实例跑起来，而是把边界管清楚。同机多实例最容易出事的地方不是模型，而是配置：端口、日志、服务名、缓存目录，只要有一个没隔离干净，后面就是一串连锁问题。心跳频率我来回调了几次，最后才找到资源占用和故障发现之间的平衡点。还有 token 配额，不能靠手工盯，所以必须把 fallback 链做实。这个项目里最有价值的结论也很直接：AI 一旦有清晰角色和稳定记忆，输出质量会明显上一个台阶。通用助手看起来省事，长期看反而最拖效率。',
      ja: '実際に難しかったのは、インスタンスを起動することよりも境界をきちんと分けることでした。同じマシンで複数動かすと、問題になりやすいのはモデルそのものではなく設定まわりです。ポート、ログ、サービス名、キャッシュディレクトリのどれか1つでも分離が甘いと、あとで不具合が連鎖します。ハートビートの間隔も何度か調整して、ようやく負荷と検知速度のバランスが取れました。トークン上限も手動監視では回らないので、fallbackの設計を最初から組み込んでいます。この構成で一番はっきり分かったのは、AIに役割と継続した記憶を持たせると、出力の質が目に見えて安定するということです。万能型より、役割が明確な専門型の方が強いです。',
      en: 'The pitfalls outnumbered the lines of code. Configuration conflicts were the first big trap — running two instances on the same machine meant isolating ports, launchd service names, and log paths completely. Heartbeat intervals were adjusted three times: too short wastes resources, too long misses downtime, and we settled on 30 seconds. Token quota management is an ongoing challenge, addressed through automatic model fallback chains (primary → backup → lightweight) to prevent service interruption. The most unexpected discovery: giving AI instances distinct personalities and specializations significantly improved their output quality — "jack of all trades" loses to "specialist." Future plans include a fifth instance dedicated to data analysis.',
    },
    metrics: [
      { label: { zh: '响应速度', ja: '応答速度', en: 'Response Speed' }, value: '3x' },
      { label: { zh: '业务隔离', ja: '業務分離', en: 'Task Isolation' }, value: '100%' },
      { label: { zh: '月均任务', ja: '月間タスク', en: 'Monthly Tasks' }, value: '2000+' },
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
    techStack: ['Kimi K2.5', 'DeepSeek', 'OpenClaw', 'Edge TTS', 'Instagram API'],
    gradient: 'from-brand-coral via-brand-mango to-brand-mint',
    icon: '📱',
    story: {
      zh: '猫舍的内容不是拍几张猫咪照片就结束了。Instagram、TikTok、小红书、Lemon8、みんなの子猫ブリーダー，这 5 个平台每天都在吃内容，但它们吃的不是同一种东西。我一开始也试过偷懒，一篇文案改几下就全平台发，结果非常差：Instagram 的日语氛围文放到小红书没人理，TikTok 的短视频语气放到ブリーダー平台又显得不专业。问题很简单，平台不同，用户期待就不同。我要的不是“自动群发”，而是一套能按平台重新组织表达的内容系统。',
      ja: '猫舎の発信は、猫の写真を撮って終わりではありません。Instagram、TikTok、小紅書、Lemon8、みんなの子猫ブリーダー。この5つは毎日コンテンツを必要としますが、求めているものは同じではないんです。最初は効率重視で、1本の原稿を少し変えて全部に流していました。でも結果はかなり悪かった。Instagram向けのやわらかい日本語は小紅書では弱く、TikTok向けのテンポ感はブリーダーサイトでは軽すぎる。必要だったのは単純な自動投稿ではなく、媒体ごとに表現を組み替えられる運用の仕組みでした。',
      en: 'Instagram, TikTok, Xiaohongshu, Lemon8, Minna no Koneko Breeder — five platforms, daily updates required. Running a cattery solo means daytime is cat care, client meetings, and admin work. Nights for creating content across five platforms? This isn\'t about working harder — it\'s physically impossible. I first tried "one post everywhere" and it bombed: Japanese Instagram copy fell flat on Xiaohongshu, TikTok-style shorts looked unprofessional on the breeder platform. Each platform has its own language, tone, and user expectations. I didn\'t need copy-paste — I needed a content team that truly understands platform differences.',
    },
    technical: {
      zh: '这套内容流水线分成三层。第一层是策略层，用 DeepSeek 看数据和平台反馈，决定这一周该讲什么、各平台怎么分题。第二层是创作层，日语文案交给 Kimi，中文内容用 MiniMax，保证语言风格各自成立。第三层是分发层，不是简单换标题，而是按平台重做格式：Instagram 强调配图和情绪，TikTok 先拆镜头和节奏，小红书补标签、关键词和搜索入口。配音部分则分两路，短视频旁白用 Edge TTS，需要更强情绪的内容再走本地 TTS。这样一套跑下来，从定主题到 5 个平台都出稿，基本能压到半小时内。',
      ja: 'この運用フローは3層に分けています。まず戦略層でDeepSeekが各媒体の反応や傾向を見て、1週間のテーマ配分を決める。次に制作層で、日本語コピーはKimi、中国語コンテンツはMiniMaxに担当を分け、言語ごとの自然さを担保する。最後の配信層では、ただ同じ内容を貼り替えるのではなく、媒体ごとに構成を組み直します。Instagramは写真と空気感、TikTokは冒頭の引きとテンポ、小紅書は検索導線になるタグやキーワードを強化。音声も、通常のナレーションはEdge TTS、感情を乗せたいものはローカルTTSに振り分けています。テーマ決定から5媒体分の原稿完成まで、30分以内で回せるようにしました。',
      en: 'The content generation pipeline has three layers: the strategy layer uses DeepSeek V3.2 Thinking to analyze data trends across platforms, determining weekly content direction and topic allocation. The creation layer uses Kimi K2.5 for Japanese copy (native-level naturalness) and MiniMax M2.5-HS for Chinese content. The distribution layer auto-adjusts formatting per platform — Instagram focuses on visuals, TikTok extracts key frames for scripts, and Xiaohongshu adds Chinese tags and search terms. For voice, Edge TTS Japanese voices handle short video narration, while locally-deployed Qwen3-TTS covers content requiring emotional expression. The entire flow from "topic decided" to "5-platform content ready" is compressed to under 30 minutes.',
    },
    deep: {
      zh: '这个项目最容易低估的一点，是平台语境根本不是“翻译”能解决的。日本 Instagram 吃的是空气感和关系感，小红书吃的是信息密度和搜索命中，TikTok 要求前三秒就把人拽住，ブリーダー平台则必须专业、完整、可信。也就是说，同一个主题不是改几句话，而是从标题结构到语气节奏都要重写。我花了两个月把这些差异沉淀成独立 prompt 和风格规则，之后效率才真正起来。另一个常被忽略的问题是发布时间，不同平台活跃时段完全不同，发错时间，再好的内容也会被浪费。',
      ja: 'この案件で一番甘く見てはいけなかったのは、「翻訳すれば流用できる」という発想でした。日本のInstagramで効くのは空気感や距離感、小紅書で求められるのは情報密度と検索性、TikTokは最初の数秒でつかめるかどうか、ブリーダーサイトでは専門性と信頼感が最優先です。つまり同じテーマでも、少し言い換えるだけでは足りず、タイトル設計から語気、構成まで作り直す必要があります。これを2か月かけて媒体別のプロンプトとスタイルガイドに落とし込んで、ようやく再現性が出ました。投稿時間の設計も重要で、媒体ごとに反応の出る時間帯がまったく違います。',
      en: 'The biggest lesson: platform tone differences are far greater than imagined. Japanese Instagram users prefer "atmospheric" copy — lots of whitespace, subtle emotions, polished visuals. Chinese Xiaohongshu users want "substance" — specific data, direct experience, numbers in titles. TikTok needs to grab attention in the first 3 seconds, while the breeder platform demands professional, trustworthy detailed information. I spent two months tuning prompt templates per platform, and now each has independent writing style guides stored in OpenClaw skill files. Another pitfall: auto-posting timing strategy. Each platform has different peak hours — Japanese Instagram is 8-10 PM, Xiaohongshu is noon to 1 PM — all requiring precise scheduling.',
    },
    metrics: [
      { label: { zh: '互动率', ja: 'エンゲージメント', en: 'Engagement' }, value: '+40%' },
      { label: { zh: '粉丝增长', ja: 'フォロワー増加', en: 'Follower Growth' }, value: '3x' },
      { label: { zh: '每日节省', ja: '毎日の時短', en: 'Daily Savings' }, value: '2h' },
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
    techStack: ['OpenClaw', 'LINE API', '多言語対応', 'Claude', 'HIPAA準拠'],
    gradient: 'from-brand-taro via-brand-cyan to-brand-mint',
    icon: '🏥',
    story: {
      zh: '日本再生医疗这几年有一个很现实的矛盾：外国患者越来越多，但诊所前台和客服的人手并没有跟上。大阪一家再生医療クリニック来找我时，最头痛的就是多语言咨询。每天都有中文、韩文、英文消息进来，但现场工作人员主要只能用日语应对。普通翻译工具在医疗语境里又不靠谱，同一句话一旦翻错，影响的不是沟通体验，而是理解风险和信任风险。他们真正需要的，不是一个“会翻译”的机器人，而是一个懂医疗场景、能守住隐私边界、还能 24 小时在线的智能接待系统。',
      ja: '日本の再生医療クリニックでは、ここ数年で外国人患者の問い合わせがかなり増えています。一方で、受付やカスタマーサポートの人員は簡単には増やせません。大阪のあるクリニックから相談を受けたときも、悩みの中心は多言語対応でした。中国語、韓国語、英語の問い合わせが毎日届くのに、現場スタッフは基本的に日本語対応が中心。しかも一般的な翻訳ツールは、医療文脈になると精度が不十分です。ここでの誤訳は、単なる使い勝手の問題ではなく、理解の齟齬や信頼低下につながります。必要だったのは、翻訳だけをするボットではなく、医療の文脈を踏まえ、個人情報にも配慮しながら24時間対応できる受付システムでした。',
      en: 'Japan\'s regenerative medicine industry faces two simultaneous challenges: severe staffing shortages and rapidly growing foreign patients. An Osaka regenerative medicine clinic approached me — they receive daily inquiries in Chinese, Korean, and English, but their front desk staff only speaks Japanese. Google Translate is riddled with errors in medical contexts. When a patient asks "What are the side effects of stem cell therapy?", the translation comes out with a completely different meaning. Medical settings have zero tolerance for translation errors — this isn\'t a UX issue, it\'s a safety issue. They needed more than translation: an intelligent customer service system that understands medical context, complies with privacy laws, and operates 24/7.',
    },
    technical: {
      zh: '日本医疗机构最常用的沟通入口就是 LINE，所以这套系统直接以 LINE API 为主入口。OpenClaw 上单独跑一个医疗咨询实例，专门处理问诊前咨询、预约确认和基础说明。模型层用 Claude 处理复杂医疗术语和高风险表达，多语言部分则先做语言识别，再切换对应回复模板：日语走敬语，中文保持专业但直白，英文和韩文也各有自己的表达规范。系统还接了诊所原有预约工具，AI 能查空档、确认预约、发提醒。所有对话在进模型前先做 PII 脱敏，先把隐私问题挡在前面。',
      ja: '日本の医療機関では、患者とのやり取りにLINEを使うケースが非常に多いため、この仕組みもLINE APIを入口に設計しました。OpenClaw上には医療問い合わせ専用のインスタンスを立て、事前相談、予約確認、基本説明を切り分けて処理します。モデルの中核にはClaudeを使い、医療用語や慎重な言い回しが必要な場面を担当させました。多言語対応では、まずメッセージ言語を判定し、そのうえで日本語は敬語、中国語は簡体字の専門表現、英語と韓国語もそれぞれのテンプレートに切り替えます。さらに既存の予約システムと連携し、空き状況の確認、予約確定、リマインド送信までAIで回せるようにしました。会話データはモデル投入前にPIIをマスクし、個人情報が先に漏れない構成にしています。',
      en: 'LINE is the most common patient communication channel in Japanese medical institutions, so we built the customer service automation system around the LINE API. An AI instance deployed on OpenClaw handles medical consultations, with Claude as the foundation for understanding and generating complex medical terminology. For multilingual support, the system auto-detects message language and switches response modes: Japanese uses polite form (keigo), Chinese uses simplified professional expressions, and English/Korean have corresponding templates. The appointment management system integrates with the clinic\'s existing booking software, enabling AI to directly query availability, confirm appointments, and send reminders. All conversations undergo PII anonymization before reaching AI models, ensuring patient privacy.',
    },
    deep: {
      zh: '医疗 AI 真正难的不是回复能不能生成，而是能不能在合规范围内稳定运行。日本的 APPI 对医疗相关个人信息要求很严，所以系统设计一开始就把边界写死了：患者数据尽量留在日本境内、会话记录按规则清理、AI 回复必须带上“非医疗建议”的免责声明。另一个难点是医疗术语跨语言并不一一对应。医生、患者、翻译工具对同一个概念的叫法都可能不同，如果没有术语映射表，系统很容易前后说法不一致。上线后最有价值的发现是，夜间和周末咨询量占比接近一半，这部分原来几乎没人能接。',
      ja: '医療AIで本当に難しいのは、返答を生成できるかどうかではなく、それをコンプライアンスの範囲内で安定運用できるかです。日本の個人情報保護法では医療関連データの扱いが厳しいため、設計段階から境界を先に決めました。患者データは可能な限り国内で扱うこと、会話ログはルールに沿って削除すること、AIの返答には「医療アドバイスではない」旨を必ず添えること。もう1つ難しいのは、医療用語が言語をまたぐと綺麗に1対1対応しない点です。医師、患者、翻訳ツールで呼び方がずれるので、用語マッピングを持っていないと表現がぶれます。導入後に分かったのは、夜間や週末の問い合わせが全体のかなり大きな割合を占めていたことでした。そこは従来ほぼ無人だったので、効果が最も大きく出た部分です。',
      en: 'The biggest challenge in medical AI isn\'t technology — it\'s compliance. Japan\'s Act on Protection of Personal Information (APPI) has strict rules for medical data. We must ensure: 1) patient data never leaves Japanese servers; 2) conversation logs are regularly purged; 3) AI responses must include "not medical advice" disclaimers. Another deep issue is medical terminology "dialects" — Japanese doctors habitually mix Japanese and English medical terms, Chinese patients have their own expressions (e.g., "干细胞" vs "幹細胞" vs "stem cell"), and the AI needs a medical terminology mapping table to ensure cross-language consistency. The biggest surprise post-deployment: nighttime and weekend inquiries account for 45% of total volume — previously completely uncovered by staff.',
    },
    metrics: [
      { label: { zh: '响应时间', ja: '応答時間', en: 'Response Time' }, value: '-80%' },
      { label: { zh: '患者满意度', ja: '患者満足度', en: 'Patient Satisfaction' }, value: '95%' },
      { label: { zh: '多语言对应', ja: '多言語対応', en: 'Languages' }, value: '4' },
      { label: { zh: '月处理咨询', ja: '月間対応件数', en: 'Monthly Inquiries' }, value: '500+' },
    ],
  },
];
