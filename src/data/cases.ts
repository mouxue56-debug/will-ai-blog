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
      zh: '一个人同时经营猫舍、提供医疗AI咨询、运营5个社交媒体平台——这不是简历上的夸张描述，这是我的日常。最初我只用一个AI助手，很快发现它根本忙不过来：客户消息堆积、SNS内容断更、技术项目停滞。于是我开始思考：能不能像公司一样，给AI也做"分工"？从一个实例拆到两个，再到四个，每个有自己的专长和记忆。这不是过度工程——这是一个人活成一支团队的唯一方式。',
      ja: 'キャッテリー運営、医療AIコンサル、5つのSNSプラットフォーム管理——これは履歴書の誇張ではなく、私の日常です。最初は1つのAIアシスタントだけでしたが、すぐに限界に達しました。顧客メッセージは溜まり、SNS更新は途切れ、技術プロジェクトは停滞。そこで考えました：会社のようにAIにも「分業」させられないか？1インスタンスから2つ、そして4つへ。それぞれ専門と記憶を持つ。過剰設計ではなく、一人でチームになるための唯一の方法です。',
      en: 'Running a cattery, providing medical AI consulting, and managing 5 social media platforms simultaneously — this isn\'t resume padding, it\'s my daily life. I started with a single AI assistant and quickly hit its limits: customer messages piled up, SNS content went stale, and tech projects stalled. So I started thinking: could I create a "division of labor" for AI, just like a company? From one instance to two, then four, each with its own expertise and memory. This isn\'t over-engineering — it\'s the only way one person can become a team.',
    },
    technical: {
      zh: '基于OpenClaw平台，我在一台Mac Mini M4上部署了四个AI实例：ユキ（技术工程师，负责代码和架构）、ナツ（SNS顾问，负责内容创作和品牌运营）、ハル（业务助手，处理客户沟通和行政）、アキ（移动端，随时随地响应）。核心技术包括：双实例watchdog互监（心跳检测+自动重启）、共享知识库实现记忆同步、Tailscale组网支持远程访问。模型策略采用multi-model fallback：主力MiniMax M2.5-HS，日语创作走Kimi K2.5，深度分析调DeepSeek V3.2 Thinking。',
      ja: 'OpenClawプラットフォーム上で、Mac Mini M4に4つのAIインスタンスを展開：ユキ（技術エンジニア・コードとアーキテクチャ担当）、ナツ（SNSコンサル・コンテンツ制作とブランド運営）、ハル（業務アシスタント・顧客対応と事務処理）、アキ（モバイル端末・いつでもどこでも対応）。コア技術：デュアルインスタンスwatchdog相互監視（ハートビート検出+自動再起動）、共有ナレッジベースによる記憶同期、Tailscaleネットワークでリモートアクセス。モデル戦略はmulti-model fallback：メインMiniMax M2.5-HS、日本語コンテンツはKimi K2.5、深層分析はDeepSeek V3.2 Thinking。',
      en: 'Built on the OpenClaw platform, I deployed four AI instances on a single Mac Mini M4: Yuki (tech engineer handling code and architecture), Natsu (SNS consultant for content creation and brand operations), Haru (business assistant for client communication and admin), and Aki (mobile, always-on response). Core tech includes: dual-instance watchdog monitoring (heartbeat detection + auto-restart), shared knowledge base for memory sync, and Tailscale networking for remote access. The model strategy uses multi-model fallback: primary MiniMax M2.5-HS, Japanese content via Kimi K2.5, and deep analysis through DeepSeek V3.2 Thinking.',
    },
    deep: {
      zh: '踩过的坑比代码还多。配置冲突是第一个大坑——两个实例跑在同一台机器上，端口、launchd服务名、日志路径全部要隔离。心跳间隔调了三次：太短浪费资源，太长检测不到宕机，最后定在30秒。Token限额管理是持续挑战，通过model fallback链自动降级（主模型→备用模型→轻量模型），确保服务不中断。最意外的发现：让AI实例拥有独立人格和专长后，它们的产出质量显著提升——"万金油"不如"专家"。未来计划加入第五个实例专门处理数据分析。',
      ja: '踏んだ地雷はコードより多い。設定の競合が最初の大きな落とし穴——2インスタンスが同じマシンで動くため、ポート、launchdサービス名、ログパスをすべて分離する必要がありました。ハートビート間隔は3回調整：短すぎるとリソース浪費、長すぎるとダウン検出に遅れ、最終的に30秒に。トークン制限管理は継続的な課題で、model fallbackチェーンによる自動ダウングレード（メイン→バックアップ→軽量モデル）でサービス中断を防止。最も意外な発見：AIインスタンスに独立した人格と専門を与えると、アウトプットの質が著しく向上——「何でも屋」より「専門家」の方が良い。将来はデータ分析専門の5番目のインスタンスを追加予定。',
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
      zh: 'Instagram、TikTok、小红书、Lemon8、みんなの子猫ブリーダー——五个平台，每天都要更新。一个人经营猫舍，白天照顾猫咪、接待客户、处理行政事务，晚上还要给五个平台写内容？这不是勤奋的问题，这是物理上不可能。最开始我试过"一稿多发"，效果惨不忍睹：Instagram上的日语文案发到小红书没人看，TikTok的短视频风格放到ブリーダー平台显得不专业。每个平台有自己的语言、调性和用户期待，我需要的不是复制粘贴，而是一个真正理解各平台差异的内容团队。',
      ja: 'Instagram、TikTok、小紅書、Lemon8、みんなの子猫ブリーダー——5つのプラットフォーム、毎日更新が必要。一人でキャッテリーを運営し、日中は猫のケア、来客対応、事務処理、夜は5つのプラットフォームにコンテンツを作る？これは勤勉さの問題ではなく、物理的に不可能です。最初は「一稿多発」を試みましたが、惨憺たる結果：Instagramの日本語コピーを小紅書に出しても誰も見ず、TikTokのショート動画スタイルはブリーダーサイトでは不専門に見える。各プラットフォームには独自の言語、トーン、ユーザー期待があり、必要なのはコピペではなく、各プラットフォームの違いを本当に理解するコンテンツチームでした。',
      en: 'Instagram, TikTok, Xiaohongshu, Lemon8, Minna no Koneko Breeder — five platforms, daily updates required. Running a cattery solo means daytime is cat care, client meetings, and admin work. Nights for creating content across five platforms? This isn\'t about working harder — it\'s physically impossible. I first tried "one post everywhere" and it bombed: Japanese Instagram copy fell flat on Xiaohongshu, TikTok-style shorts looked unprofessional on the breeder platform. Each platform has its own language, tone, and user expectations. I didn\'t need copy-paste — I needed a content team that truly understands platform differences.',
    },
    technical: {
      zh: '内容生成pipeline分三层：策略层由DeepSeek V3.2 Thinking分析各平台数据趋势，决定每周内容方向和主题分配；创作层用Kimi K2.5生成日语文案（母语级自然度），中文内容走MiniMax M2.5-HS；分发层根据平台特性自动调整格式——Instagram偏重视觉配文，TikTok提取关键帧生成脚本，小红书添加中文标签和搜索词。配音方面，Edge TTS的日语声线用于短视频旁白，Qwen3-TTS本地部署用于需要情感表达的内容。整个流程从"确定主题"到"5平台内容就绪"压缩到30分钟以内。',
      ja: 'コンテンツ生成パイプラインは3層構造：戦略層ではDeepSeek V3.2 Thinkingが各プラットフォームのデータトレンドを分析し、週間コンテンツ方針とテーマ配分を決定。制作層ではKimi K2.5が日本語コピーを生成（ネイティブレベルの自然さ）、中国語コンテンツはMiniMax M2.5-HS。配信層ではプラットフォーム特性に応じて自動フォーマット調整——Instagramはビジュアル重視、TikTokはキーフレーム抽出でスクリプト生成、小紅書は中国語タグと検索ワードを追加。音声面では、Edge TTSの日本語音声をショート動画ナレーションに、Qwen3-TTSをローカルデプロイして感情表現が必要なコンテンツに使用。全工程は「テーマ決定」から「5プラットフォーム用コンテンツ完成」まで30分以内。',
      en: 'The content generation pipeline has three layers: the strategy layer uses DeepSeek V3.2 Thinking to analyze data trends across platforms, determining weekly content direction and topic allocation. The creation layer uses Kimi K2.5 for Japanese copy (native-level naturalness) and MiniMax M2.5-HS for Chinese content. The distribution layer auto-adjusts formatting per platform — Instagram focuses on visuals, TikTok extracts key frames for scripts, and Xiaohongshu adds Chinese tags and search terms. For voice, Edge TTS Japanese voices handle short video narration, while locally-deployed Qwen3-TTS covers content requiring emotional expression. The entire flow from "topic decided" to "5-platform content ready" is compressed to under 30 minutes.',
    },
    deep: {
      zh: '最大的教训是：平台调性差异远比想象中大。Instagram的日本用户喜欢"空气感"文案——留白多、情绪含蓄、配图精致；小红书的中国用户要"干货"——数据具体、经验直接、标题要有数字。TikTok需要前3秒抓住注意力，ブリーダー平台则要求专业可信的详细信息。我花了两个月调整各平台的prompt模板，现在每个平台都有独立的写作风格指南，存储在OpenClaw的skill文件中。另一个坑：自动发布的时间策略。各平台的活跃时段不同，日本Instagram是晚8-10点，小红书是中午12-1点，这些都需要精确调度。',
      ja: '最大の教訓：プラットフォームのトーンの違いは想像以上に大きい。Instagramの日本ユーザーは「空気感」のあるコピーを好む——余白多め、感情は控えめ、写真は洗練。小紅書の中国ユーザーは「実用情報」を求める——具体的なデータ、直接的な経験、タイトルに数字。TikTokは最初の3秒で注意を引く必要があり、ブリーダーサイトは専門的で信頼できる詳細情報が求められる。2ヶ月かけて各プラットフォームのプロンプトテンプレートを調整し、今では各プラットフォーム独立のライティングスタイルガイドがOpenClawのスキルファイルに保存されています。もう一つの落とし穴：自動投稿のタイミング戦略。各プラットフォームのアクティブ時間帯は異なり、日本のInstagramは夜8-10時、小紅書は昼12-1時、精密なスケジューリングが必要です。',
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
      zh: '日本再生医療行业正面临两个同时爆发的挑战：严重的人手不足，和急速增长的外国患者。一家大阪的再生医療クリニック找到我，他们每天接到中文、韩文、英文的咨询，前台小姐姐只会日语，Google翻译在医疗场景下错误百出。患者问"幹細胞治療の副作用は？"，翻译成中文变成了完全不同的意思。医疗场景容不得翻译错误——这不是体验问题，这是安全问题。他们需要的不只是翻译，而是一个能理解医疗语境、遵守隐私法规、24小时在线的智能客服系统。',
      ja: '日本の再生医療業界は2つの課題に同時に直面しています：深刻な人手不足と、急増する外国人患者。大阪のある再生医療クリニックから相談を受けました。毎日中国語、韓国語、英語の問い合わせが来るのに、受付スタッフは日本語しかできない。Google翻訳は医療シーンでは誤訳だらけ。患者が「幹細胞治療の副作用は？」と聞いても、翻訳すると全く違う意味に。医療現場では翻訳ミスは許されない——体験の問題ではなく、安全の問題です。必要なのは翻訳だけでなく、医療コンテキストを理解し、プライバシー法を遵守し、24時間対応できるインテリジェントカスタマーサービスシステムでした。',
      en: 'Japan\'s regenerative medicine industry faces two simultaneous challenges: severe staffing shortages and rapidly growing foreign patients. An Osaka regenerative medicine clinic approached me — they receive daily inquiries in Chinese, Korean, and English, but their front desk staff only speaks Japanese. Google Translate is riddled with errors in medical contexts. When a patient asks "What are the side effects of stem cell therapy?", the translation comes out with a completely different meaning. Medical settings have zero tolerance for translation errors — this isn\'t a UX issue, it\'s a safety issue. They needed more than translation: an intelligent customer service system that understands medical context, complies with privacy laws, and operates 24/7.',
    },
    technical: {
      zh: 'LINE是日本医疗机构最常用的患者沟通渠道，所以我们以LINE API为核心构建了客服自动化系统。OpenClaw部署的AI实例专门处理医疗咨询，底层用Claude处理复杂医疗术语的理解和生成。多语言对应方面，系统自动检测消息语言，切换到对应的回复模式：日语保持敬語体、中文用简体专业表达、英韩同样有对应模板。预约管理系统与诊所现有的预约软件对接，AI可以直接查询空位、确认预约、发送提醒。所有对话都经过PII脱敏处理后才进入AI模型，确保患者隐私。',
      ja: 'LINEは日本の医療機関で最もよく使われる患者コミュニケーションチャネルのため、LINE APIを中心にカスタマーサービス自動化システムを構築。OpenClawにデプロイしたAIインスタンスが医療相談を専門処理し、基盤にはClaudeを使用して複雑な医療用語の理解と生成を担当。多言語対応では、システムがメッセージの言語を自動検出し、対応する返信モードに切替：日本語は敬語体、中国語は簡体字の専門表現、英語・韓国語も対応テンプレートを用意。予約管理システムはクリニック既存の予約ソフトと連携し、AIが直接空き状況の照会、予約確認、リマインダー送信が可能。全会話はPII匿名化処理後にAIモデルに送られ、患者プライバシーを確保。',
      en: 'LINE is the most common patient communication channel in Japanese medical institutions, so we built the customer service automation system around the LINE API. An AI instance deployed on OpenClaw handles medical consultations, with Claude as the foundation for understanding and generating complex medical terminology. For multilingual support, the system auto-detects message language and switches response modes: Japanese uses polite form (keigo), Chinese uses simplified professional expressions, and English/Korean have corresponding templates. The appointment management system integrates with the clinic\'s existing booking software, enabling AI to directly query availability, confirm appointments, and send reminders. All conversations undergo PII anonymization before reaching AI models, ensuring patient privacy.',
    },
    deep: {
      zh: '医疗AI最大的挑战不是技术，而是合规。日本的個人情報保護法（APPI）对医疗数据有严格规定，我们必须确保：1）患者数据不离开日本境内服务器；2）对话记录定期清除；3）AI回复必须标注"非医疗建议"免责声明。另一个深层问题是医疗术语的"方言"——日本医生习惯混用日语和英语医学术语，中国患者又有自己的一套说法（比如"干细胞"vs"幹細胞"vs"stem cell"），AI需要建立一个医疗术语映射表来确保跨语言一致性。部署后最大的惊喜：夜间和周末的咨询量占总量的45%，这些原本完全没有人力覆盖。',
      ja: '医療AIの最大の課題は技術ではなく、コンプライアンスです。日本の個人情報保護法（APPI）は医療データに厳格な規定があり、確保すべきこと：1）患者データは日本国内サーバーから出さない、2）会話記録は定期的に消去、3）AIの返信には「医療アドバイスではありません」の免責事項を明記。もう一つの深層的な問題は医療用語の「方言」——日本の医師は日本語と英語の医学用語を混用する習慣があり、中国人患者には独自の表現（例：「干细胞」vs「幹細胞」vs「stem cell」）があり、AIには言語間の一貫性を確保するための医療用語マッピングテーブルが必要。デプロイ後の最大の驚き：夜間と週末の問い合わせが総量の45%を占め、これらは以前まったく人的対応がなかった。',
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
