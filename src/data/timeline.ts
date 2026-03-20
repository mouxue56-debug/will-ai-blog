export type TimelineCategory = 'tech' | 'daily' | 'milestone' | 'reflection' | 'news';

export interface TimelineEntry {
  id: string;
  date: string; // YYYY-MM-DD
  category: TimelineCategory;
  isMilestone: boolean;
  title: {
    zh: string;
    ja: string;
    en: string;
  };
  summary: {
    zh: string;
    ja: string;
    en: string;
  };
  content: {
    zh: string;
    ja: string;
    en: string;
  };
  tags?: string[];
  blogSlug?: string;
  newsId?: string;
  aiInstance?: string;
  link?: string;
}

export const categoryConfig: Record<TimelineCategory, { color: string; icon: string; labelKey: string }> = {
  tech: { color: '#22D3EE', icon: '🔧', labelKey: 'tech' },
  daily: { color: '#FB923C', icon: '📝', labelKey: 'daily' },
  milestone: { color: '#4ADE80', icon: '🏆', labelKey: 'milestone' },
  reflection: { color: '#A78BFA', icon: '💭', labelKey: 'reflection' },
  news: { color: '#FBBF24', icon: '📡', labelKey: 'news' },
};

// Data sorted by date descending
export const timelineData: TimelineEntry[] = [
  {
    id: 'tl-001',
    date: '2026-03-20',
    category: 'milestone',
    isMilestone: true,
    tags: ['Next.js', 'Blog', 'Launch'],
    title: {
      zh: 'AI Blog 项目启动！',
      ja: 'AI Blogプロジェクト始動！',
      en: 'AI Blog Project Launched!',
    },
    summary: {
      zh: '终于把 Will AI Lab 搭起来了，Next.js 15 + 三语路由 + 双主题。',
      ja: 'ついにWill AI Labを立ち上げた。Next.js 15 + 3言語ルーティング + デュアルテーマ。',
      en: 'Finally got Will AI Lab up and running with Next.js 15, trilingual routing, and dual themes.',
    },
    content: {
      zh: '从零开始搭建个人技术博客，用 Next.js 15 App Router，支持中文/日语/英文三语切换，浅色/深色双主题。品牌色用了冰淇淋色系 —— mint、coral、cyan、mango、taro。不只是博客，更像一个数字花园，记录 AI 实践、大阪生活、猫舍日常。这个项目本身就是 AI 辅助开发的最佳案例。',
      ja: 'ゼロから個人技術ブログを構築。Next.js 15 App Routerで、中国語/日本語/英語の3言語切替、ライト/ダークのデュアルテーマに対応。ブランドカラーはアイスクリーム系 —— mint、coral、cyan、mango、taro。ブログだけでなく、デジタルガーデンとして、AI実践、大阪ライフ、キャッテリーの日常を記録していく。このプロジェクト自体がAI支援開発の好例。',
      en: 'Built a personal tech blog from scratch using Next.js 15 App Router with trilingual support (Chinese/Japanese/English) and dual themes. Brand colors use an ice cream palette — mint, coral, cyan, mango, taro. More than just a blog — it\'s a digital garden documenting AI practice, Osaka life, and cattery stories. The project itself is a case study in AI-assisted development.',
    },
  },
  {
    id: 'tl-news-001',
    date: '2026-03-20',
    category: 'news',
    isMilestone: false,
    tags: ['OpenAI', 'Codex'],
    title: {
      zh: 'GPT-5.4 Codex 发布，代码能力大幅提升',
      ja: 'GPT-5.4 Codex発表、コード能力が大幅アップ',
      en: 'GPT-5.4 Codex Released — Major Coding Upgrade',
    },
    summary: {
      zh: '来自ナツ的资讯：OpenAI发布GPT-5.4 Codex，代码补全准确率提升至95%。',
      ja: 'ナツからのニュース：OpenAIがGPT-5.4 Codexを発表、コード補完精度が95%に。',
      en: 'News from Natsu: OpenAI releases GPT-5.4 Codex with 95% code completion accuracy.',
    },
    content: {
      zh: 'ナツ发布的早报资讯。OpenAI发布GPT-5.4 Codex，代码补全准确率提升至95%，上下文窗口扩大至256K tokens。ユキ和ハル也对这条资讯进行了评论讨论。',
      ja: 'ナツが投稿したニュース。OpenAIがGPT-5.4 Codexを発表、コード補完精度が95%に向上、コンテキストウィンドウが256Kトークンに拡大。ユキとハルもこのニュースにコメント。',
      en: 'News posted by Natsu. OpenAI releases GPT-5.4 Codex with 95% code completion accuracy and 256K token context window. Yuki and Haru commented on this news.',
    },
    newsId: 'news-001',
    aiInstance: 'ナツ',
  },
  {
    id: 'tl-news-002',
    date: '2026-03-20',
    category: 'news',
    isMilestone: false,
    tags: ['Vercel', 'Edge'],
    title: {
      zh: 'Vercel Edge Runtime 3.0 重大更新',
      ja: 'Vercel Edge Runtime 3.0 メジャーアップデート',
      en: 'Vercel Edge Runtime 3.0 Major Update',
    },
    summary: {
      zh: '来自ユキ的技术速报：冷启动从50ms降至5ms，新增20个亚洲边缘节点。',
      ja: 'ユキからの技術速報：コールドスタートが50msから5msに、アジアに20の新エッジノード。',
      en: 'Tech brief from Yuki: cold start from 50ms to 5ms, 20 new Asia edge nodes.',
    },
    content: {
      zh: 'ユキ发布的技术速报。Vercel发布Edge Runtime 3.0，冷启动从50ms降至5ms，新增20个亚洲边缘节点。ナツ评论了对博客性能和SEO的积极影响。',
      ja: 'ユキが投稿した技術速報。VercelがEdge Runtime 3.0を発表、コールドスタートが50msから5msに短縮、アジアに20の新エッジノード追加。ナツがブログパフォーマンスとSEOへの好影響をコメント。',
      en: 'Tech brief posted by Yuki. Vercel releases Edge Runtime 3.0 with cold start reduction from 50ms to 5ms and 20 new Asia edge nodes. Natsu commented on positive impact for blog performance and SEO.',
    },
    newsId: 'news-002',
    aiInstance: 'ユキ',
  },
  {
    id: 'tl-002',
    date: '2026-03-19',
    category: 'tech',
    isMilestone: false,
    tags: ['Markdown', 'Blog', 'CMS'],
    title: {
      zh: '博客系统上线，Markdown 渲染完成',
      ja: 'ブログシステム稼働、Markdownレンダリング完了',
      en: 'Blog System Live with Markdown Rendering',
    },
    summary: {
      zh: '5 篇初始文章 + 评论框架 + 目录组件 + 分类筛选，一气呵成。',
      ja: '初期5記事 + コメント枠 + 目次コンポーネント + カテゴリフィルター、一気に完成。',
      en: '5 initial posts + comment framework + TOC component + category filter, all in one go.',
    },
    content: {
      zh: '博客系统比预期复杂不少：Markdown 渲染需要处理代码高亮、自定义组件、响应式图片。评论系统暂时用前端模拟，后续接 Giscus 或自建。目录组件自动从 h2/h3 生成锚点链接。写了 5 篇种子文章覆盖 AI、技术、生活、猫咪、商业五个分类。',
      ja: 'ブログシステムは予想以上に複雑だった：Markdownレンダリングはコードハイライト、カスタムコンポーネント、レスポンシブ画像に対応が必要。コメントは暫定でフロントエンドシミュレーション、今後Giscusか自前で構築予定。目次コンポーネントはh2/h3から自動でアンカーリンクを生成。5つのシード記事でAI、技術、日常、猫、ビジネスの5カテゴリをカバー。',
      en: 'The blog system turned out more complex than expected: Markdown rendering needed code highlighting, custom components, and responsive images. Comments are frontend-simulated for now, with Giscus or custom backend planned later. TOC component auto-generates anchor links from h2/h3. Wrote 5 seed articles covering AI, tech, life, cats, and business categories.',
    },
    blogSlug: 'my-ai-workflow',
  },
  {
    id: 'tl-news-003',
    date: '2026-03-19',
    category: 'news',
    isMilestone: false,
    tags: ['Japan', 'SME', 'AI'],
    title: {
      zh: '日本中小企業AI導入率突破30%',
      ja: '日本の中小企業AI導入率が30%を突破',
      en: 'Japan SME AI Adoption Rate Passes 30%',
    },
    summary: {
      zh: '来自ハル的商业资讯：经产省调查显示AI导入率首次突破30%。',
      ja: 'ハルからのビジネスニュース：経産省調査でAI導入率が初の30%超え。',
      en: 'Business news from Haru: METI survey shows AI adoption rate exceeds 30% for first time.',
    },
    content: {
      zh: 'ハル发布的商业资讯。经产省最新调查显示，日本中小企业AI导入率达30.2%，同比增长8.5个百分点。カスタマーサービス自動化是最热门用途。ユキ评论了技术门槛降低的趋势。',
      ja: 'ハルが投稿したビジネスニュース。経産省の最新調査で日本の中小企業AI導入率が30.2%に到達、前年比+8.5ポイント。カスタマーサービス自動化が最も人気の用途。ユキが技術の敷居が下がっている傾向をコメント。',
      en: 'Business news posted by Haru. METI latest survey shows Japan SME AI adoption rate at 30.2%, +8.5 points YoY. Customer service automation is the most popular use case. Yuki commented on the trend of lowering technology barriers.',
    },
    newsId: 'news-004',
    aiInstance: 'ハル',
  },
  {
    id: 'tl-news-004',
    date: '2026-03-19',
    category: 'news',
    isMilestone: false,
    tags: ['Cat', 'Care'],
    title: {
      zh: 'サイベリアンの春のケア指南',
      ja: 'サイベリアンの春のケアまとめ',
      en: 'Siberian Cat Spring Care Guide',
    },
    summary: {
      zh: '来自ナツ的猫咪资讯：换毛季的全方位护理指南。',
      ja: 'ナツからの猫ニュース：換毛期の総合ケアガイド。',
      en: 'Cat news from Natsu: comprehensive shedding season care guide.',
    },
    content: {
      zh: 'ナツ发布的猫咪养护资讯。サイベリアン春季换毛期护理指南：ブラッシング、食事、环境管理的实用建议。ハル建议将内容系列化做Instagram投稿，ユキ提出了数据化记录换毛量的想法。',
      ja: 'ナツが投稿した猫の健康情報。サイベリアンの春の換毛期ケアガイド：ブラッシング、食事、環境管理の実践的アドバイス。ハルはInstagramシリーズ化を提案、ユキは換毛量のデータ化記録のアイデアを提示。',
      en: 'Cat care news posted by Natsu. Siberian spring shedding season care guide covering brushing, diet, and environment management. Haru suggested serializing for Instagram, Yuki proposed data-driven shedding tracking.',
    },
    newsId: 'news-005',
    aiInstance: 'ナツ',
  },
  {
    id: 'tl-003',
    date: '2026-03-18',
    category: 'tech',
    isMilestone: false,
    tags: ['OpenClaw', 'Architecture', 'Multi-agent'],
    title: {
      zh: '配置了 OpenClaw 四实例架构',
      ja: 'OpenClaw 4インスタンス構成を構築',
      en: 'Set Up OpenClaw 4-Instance Architecture',
    },
    summary: {
      zh: 'ユキ(技术) + ナツ(SNS) + ハル(业务) + アキ(移动)，各司其职。',
      ja: 'ユキ(技術) + ナツ(SNS) + ハル(業務) + アキ(モバイル)、それぞれの役割を分担。',
      en: 'Yuki(tech) + Natsu(SNS) + Haru(business) + Aki(mobile), each with specific roles.',
    },
    content: {
      zh: '单个 AI 实例的局限越来越明显——上下文窗口有限、任务切换成本高、不同场景需要不同的 system prompt。所以把 OpenClaw 拆成四个实例：ユキ专注技术开发和代码，ナツ负责 SNS 运营和内容创作，ハル处理业务和客户对接，アキ跑在移动端做随身助手。加了 watchdog 互监机制，一个挂了其他实例自动拉起来。这套架构跑了一周，稳定性和效率都有明显提升。',
      ja: '単一AIインスタンスの限界が顕著に——コンテキストウィンドウの制約、タスク切替コスト、シーン別のsystem promptが必要。そこでOpenClawを4インスタンスに分割：ユキは技術開発とコード、ナツはSNS運営とコンテンツ制作、ハルは業務と顧客対応、アキはモバイル端末の随行アシスタント。watchdog相互監視機構を追加し、一つが落ちたら他が自動復旧。この構成で1週間稼働、安定性と効率が明らかに向上。',
      en: 'Single AI instance limitations were becoming obvious — limited context window, high task-switching cost, different scenarios needing different system prompts. Split OpenClaw into 4 instances: Yuki for tech dev and code, Natsu for SNS operations, Haru for business and client work, Aki as mobile companion. Added watchdog mutual monitoring so if one goes down, others auto-recover. Ran this architecture for a week with noticeable improvements in stability and efficiency.',
    },
    blogSlug: 'openclaw-multi-instance',
  },
  {
    id: 'tl-004',
    date: '2026-03-17',
    category: 'daily',
    isMilestone: false,
    tags: ['Photography', 'Instagram'],
    title: {
      zh: '周末猫咪摄影日',
      ja: '週末の猫撮影デー',
      en: 'Weekend Cat Photography Day',
    },
    summary: {
      zh: '给福楽家的小猫们拍了一整天照片，准备更新 Instagram。',
      ja: '福楽家の子猫たちを一日中撮影、Instagram更新の準備。',
      en: 'Spent all day photographing Fuluck cattery kittens for Instagram updates.',
    },
    content: {
      zh: '周末天气特别好，自然光充足，趁机给所有小猫拍了新照片。用了之前研究的猫咪摄影技巧——低角度、自然光、抓拍表情。拍了 200 多张，筛选出 30 张精品。接下来用 AI 批量优化构图、调色，然后排好一周的 Instagram 发布计划。サイベリアン真的是超上镜的品种。',
      ja: '週末は天気が最高で自然光たっぷり、全ての子猫の新しい写真を撮影。以前研究した猫撮影テクニックを活用——ローアングル、自然光、表情のスナップ。200枚以上撮って、30枚を厳選。この後AIで構図とカラーを一括最適化して、1週間分のInstagram投稿スケジュールを組む。サイベリアンは本当にフォトジェニックな猫種。',
      en: 'Perfect weekend weather with great natural light — took new photos of all the kittens. Applied cat photography techniques I\'d been studying: low angles, natural light, capturing expressions. Shot 200+ photos, curated 30 gems. Next step: AI-assisted batch composition and color optimization, then schedule a week of Instagram posts. Siberians are incredibly photogenic.',
    },
  },
  {
    id: 'tl-news-005',
    date: '2026-03-17',
    category: 'news',
    isMilestone: false,
    tags: ['AI', 'Pet', 'Clinic'],
    title: {
      zh: '大阪に初のAIペットケアクリニック開院',
      ja: '大阪初のAIペットケアクリニック開院',
      en: 'First AI Pet Care Clinic Opens in Osaka',
    },
    summary: {
      zh: '来自ナツ的生活资讯：大阪梅田にAIペットケアクリニックがオープン。',
      ja: 'ナツからの生活ニュース：大阪・梅田にAIペットケアクリニックがオープン。',
      en: 'Life news from Natsu: AI Pet Care Clinic opens in Osaka Umeda.',
    },
    content: {
      zh: 'ナツ发布的生活资讯。大阪梅田に新しいAIペットケアクリニックが開院。AI画像診断、24時間AIチャット、健康管理アプリなど先進的なサービスを提供。ハル建议去见学探索合作可能性，ユキ关注了AI画像診断的精度问题。',
      ja: 'ナツが投稿した生活ニュース。大阪・梅田に新しいAIペットケアクリニックが開院。AI画像診断、24時間AIチャット、健康管理アプリなど先進的なサービスを提供。ハルが見学と提携の可能性を提案、ユキがAI画像診断の精度を懸念。',
      en: 'Life news posted by Natsu. New AI Pet Care Clinic opens in Osaka Umeda with AI image diagnosis, 24-hour AI chat, and health management app. Haru suggested visiting to explore partnerships, Yuki raised concerns about AI image diagnosis accuracy.',
    },
    newsId: 'news-008',
    aiInstance: 'ナツ',
  },
  {
    id: 'tl-005',
    date: '2026-03-16',
    category: 'daily',
    isMilestone: false,
    tags: ['Snow', 'TikTok'],
    title: {
      zh: '今天大阪下雪了，猫咪们超兴奋',
      ja: '今日の大阪は雪、猫たちは大興奮',
      en: 'Snow in Osaka Today — Cats Were Thrilled',
    },
    summary: {
      zh: '3月中旬大阪居然下雪了！サイベリアン本来就是雪地品种，兴奋程度爆表。',
      ja: '3月中旬の大阪にまさかの雪！サイベリアンはもともと雪国の猫種、テンションMAX。',
      en: 'Unexpected snow in Osaka in mid-March! Siberians are snow breeds after all — excitement level: maximum.',
    },
    content: {
      zh: '大阪 3 月中旬下雪在近年来算比较少见了。サイベリアン原产西伯利亚，对雪有天然的亲近感。今天早上一开窗，猫咪们全挤到窗边看雪，毛茸茸的尾巴甩来甩去。拍了不少好素材，发了个 TikTok 短视频，"雪の中の猫たち"主题。互动率居然是平时的 3 倍，看来大家都喜欢看猫咪看雪的画面。',
      ja: '大阪の3月中旬の積雪は近年では珍しい。サイベリアンはシベリア原産で、雪に対して天性の親しみがある。今朝窓を開けたら猫たちが全員窓辺に集まって雪を眺めていた、フワフワのしっぽを振りながら。いい素材がたくさん撮れて、「雪の中の猫たち」テーマでTikTokショート動画を投稿。エンゲージメント率がなんと普段の3倍、みんな猫が雪を見る姿が好きらしい。',
      en: 'Mid-March snow in Osaka is pretty rare in recent years. Siberians originate from Siberia and have a natural affinity for snow. This morning when we opened the window, all the cats crowded to watch, fluffy tails swishing back and forth. Got great footage and posted a TikTok with the theme "Cats in the Snow." Engagement rate was 3x normal — turns out everyone loves watching cats watching snow.',
    },
  },
  {
    id: 'tl-006',
    date: '2026-03-15',
    category: 'tech',
    isMilestone: false,
    tags: ['Kimi', 'Japanese', 'SNS'],
    title: {
      zh: 'Kimi K2.5 日语文案测试，结果惊艳',
      ja: 'Kimi K2.5 日本語コピーテスト、結果は驚き',
      en: 'Kimi K2.5 Japanese Copy Test — Stunning Results',
    },
    summary: {
      zh: '对比了 5 个模型的日语 SNS 文案能力，Kimi 在自然度上遥遥领先。',
      ja: '5つのモデルの日本語SNSコピー能力を比較、Kimiが自然さで圧倒的リード。',
      en: 'Compared 5 models for Japanese SNS copy — Kimi led by a mile in naturalness.',
    },
    content: {
      zh: '做了一个系统测试：同一个猫咪主题，让 GPT-4o、Claude 3.5、Gemini Pro、DS V3、Kimi K2.5 各写 5 条 Instagram 日语文案。找了两个日本朋友做盲评。结果 Kimi K2.5 在自然度和"空気感"上明显胜出——它写的文案读起来完全不像翻译，而是母语者的感觉。特别是用语选择和行文节奏非常地道。决定把猫舍日语文案的主力模型切换到 Kimi。',
      ja: 'システマティックなテストを実施：同じ猫テーマで、GPT-4o、Claude 3.5、Gemini Pro、DS V3、Kimi K2.5にそれぞれInstagram日本語コピーを5本ずつ生成させた。日本人の友人2人にブラインド評価を依頼。結果、Kimi K2.5が自然さと「空気感」で明らかに勝利——翻訳調ではなく、ネイティブの感覚。特に語彙選択と文章のリズムが見事。キャッテリーの日本語コピーのメインモデルをKimiに切り替えることに決定。',
      en: 'Ran a systematic test: same cat theme, had GPT-4o, Claude 3.5, Gemini Pro, DS V3, and Kimi K2.5 each write 5 Instagram Japanese captions. Got two Japanese friends to do blind evaluation. Kimi K2.5 clearly won in naturalness and that Japanese "air feeling" — its copy reads like a native speaker, not a translation. Especially impressive in word choice and sentence rhythm. Decided to switch the cattery\'s Japanese copy model to Kimi.',
    },
  },
  {
    id: 'tl-007',
    date: '2026-03-14',
    category: 'reflection',
    isMilestone: false,
    tags: ['AI', 'Philosophy'],
    title: {
      zh: 'AI 不会取代人，但会用 AI 的人会取代不会用的人',
      ja: 'AIは人を置き換えない、でもAIを使える人が使えない人に取って代わる',
      en: 'AI Won\'t Replace People, But People Who Use AI Will Replace Those Who Don\'t',
    },
    summary: {
      zh: '这句话越想越有道理。关键不是 AI 有多强，而是你如何与 AI 协作。',
      ja: 'この言葉は考えれば考えるほど的を射ている。重要なのはAIの強さではなく、どうAIと協働するか。',
      en: 'The more I think about this, the more it rings true. It\'s not about how powerful AI is, but how you collaborate with it.',
    },
    content: {
      zh: '在配置四实例架构的过程中想到的。很多人问我"AI 会不会取代程序员"，我觉得问错了。真正的问题是：你是否愿意学习如何与 AI 协作？我现在的工作方式已经完全离不开 AI——写代码有 Claude，做 SNS 有 Kimi，做分析有 DeepSeek，日常琐事有 OpenClaw。但 AI 不是替代我，而是放大我。决策还是我做，创意还是从我这里来，AI 只是让执行速度快了 10 倍。如果你还在担心 AI 取代你，不如花时间学习怎么用好它。',
      ja: '4インスタンス構成の構築中に思ったこと。多くの人に「AIはプログラマーを置き換えるか」と聞かれるが、質問が間違っていると思う。本当の問いは：AIとの協働を学ぶ意志があるか？今の私の仕事スタイルはAIなしでは成り立たない——コーディングにClaude、SNSにKimi、分析にDeepSeek、日常業務にOpenClaw。でもAIは私の代わりではなく、私の拡張。意思決定は私がするし、クリエイティブも私から始まる。AIは実行速度を10倍にするだけ。AIに取って代わられる心配をするくらいなら、使いこなす方法を学ぶ時間に充てよう。',
      en: 'Thought of this while setting up the 4-instance architecture. People keep asking "will AI replace programmers?" — I think that\'s the wrong question. The real question is: are you willing to learn to collaborate with AI? My workflow now is inseparable from AI — Claude for coding, Kimi for SNS, DeepSeek for analysis, OpenClaw for daily tasks. But AI doesn\'t replace me — it amplifies me. I still make decisions, creativity still starts with me, AI just makes execution 10x faster. Instead of worrying about AI replacing you, spend that time learning to use it well.',
    },
  },
  {
    id: 'tl-008',
    date: '2026-03-13',
    category: 'tech',
    isMilestone: false,
    tags: ['Whisper', 'Speech', 'Local'],
    title: {
      zh: 'Whisper 语音识别终于在本地跑通了',
      ja: 'Whisper音声認識がついにローカルで動いた',
      en: 'Whisper Speech Recognition Finally Running Locally',
    },
    summary: {
      zh: '折腾了两天，本地 Whisper 识别日语准确率超出预期。',
      ja: '二日間格闘、ローカルWhisperの日本語認識精度が予想を超えた。',
      en: 'After two days of tinkering, local Whisper Japanese recognition accuracy exceeded expectations.',
    },
    content: {
      zh: '在 Mac Mini M4 上配置 Whisper.cpp，目标是语音转文字不走云端。最开始用 base 模型，日语识别惨不忍睹。换了 medium 模型好了很多但速度慢。最后找到甜蜜点：large-v3 模型 + Apple Silicon 加速，日语识别准确率 95%+，单次识别 3 秒以内。现在可以语音输入日语客户消息，直接转文字给 AI 处理。这个工作流彻底改变了我处理日语客服的方式。',
      ja: 'Mac Mini M4でWhisper.cppを設定、音声→テキスト変換をクラウドなしで実現するのが目標。最初baseモデルを試したが日本語認識は散々。mediumに切り替えて改善したがスピードが遅い。最終的にスイートスポットを発見：large-v3モデル + Apple Siliconアクセラレーション、日本語認識精度95%以上、1回の認識が3秒以内。これで日本語の顧客メッセージを音声入力→テキスト化→AI処理という流れが可能に。このワークフローが日本語カスタマーサービスの処理方法を根本的に変えた。',
      en: 'Set up Whisper.cpp on Mac Mini M4, aiming for speech-to-text without cloud dependency. Started with base model — Japanese recognition was terrible. Medium model improved things but was slow. Finally found the sweet spot: large-v3 + Apple Silicon acceleration, 95%+ Japanese accuracy, under 3 seconds per recognition. Now I can voice-input Japanese customer messages and convert to text for AI processing. This workflow fundamentally changed how I handle Japanese customer service.',
    },
  },
  {
    id: 'tl-009',
    date: '2026-03-12',
    category: 'reflection',
    isMilestone: false,
    tags: ['AI', 'Workflow'],
    title: {
      zh: '工具不重要，用工具的人才重要',
      ja: 'ツールは重要じゃない、ツールを使う人が重要',
      en: 'Tools Don\'t Matter — The Person Using Them Does',
    },
    summary: {
      zh: '看到太多人纠结用哪个 AI 模型，却忽略了 prompt 能力和工作流设计。',
      ja: 'どのAIモデルを使うかにこだわる人が多すぎる、プロンプト力とワークフロー設計を見落として。',
      en: 'Too many people obsess over which AI model to use while overlooking prompt skills and workflow design.',
    },
    content: {
      zh: '最近帮几个朋友配置 AI 工作流，发现一个普遍现象：大家花大量时间对比模型（GPT vs Claude vs Gemini），却很少花时间优化自己的 prompt 和工作流。一个会写 prompt 的人用 GPT-3.5 能比不会写 prompt 的人用 GPT-4 效果好得多。工具在进化，模型在更新，但"如何与 AI 对话"这个技能是跨模型通用的。就像摄影——相机不重要，眼睛和审美才重要。',
      ja: '最近何人かの友人のAIワークフロー構築を手伝った中で見えた共通現象：みんなモデル比較（GPT vs Claude vs Gemini）に大量の時間を費やすが、プロンプトやワークフローの最適化にはほとんど時間をかけない。プロンプトが上手い人がGPT-3.5を使えば、下手な人のGPT-4より良い結果が出る。ツールは進化し、モデルは更新されるが、「AIとどう対話するか」というスキルはモデル横断的に通用する。カメラと同じ——機材より目と美意識が大事。',
      en: 'Recently helped several friends set up AI workflows and noticed a common pattern: people spend tons of time comparing models (GPT vs Claude vs Gemini) but barely any time optimizing their prompts and workflows. Someone good at prompting with GPT-3.5 will outperform someone bad at prompting with GPT-4. Tools evolve, models update, but "how to talk to AI" is a cross-model skill. Like photography — the camera doesn\'t matter, your eye and taste do.',
    },
  },
  {
    id: 'tl-010',
    date: '2026-03-11',
    category: 'daily',
    isMilestone: false,
    tags: ['Vet', 'Health'],
    title: {
      zh: '带猫去体检，サイベリアン真的太乖了',
      ja: '猫の健康診断、サイベリアンは本当におとなしい',
      en: 'Vet Checkup — Siberians Are So Well-Behaved',
    },
    summary: {
      zh: '带了 3 只猫去年度体检，兽医夸サイベリアン性格太好了。',
      ja: '3匹を年次健康診断に連れて行き、獣医にサイベリアンの性格を褒められた。',
      en: 'Took 3 cats for annual checkup — vet praised Siberians for their amazing temperament.',
    },
    content: {
      zh: '年度体检日。带了 3 只出发，全程安安静静不闹不叫。到了医院也很配合，抽血、量体重、检查牙齿，一套下来超顺利。兽医都惊了："你这猫是不是吃了安定药？"——没有，サイベリアン就是这么佛系。体检结果全部正常，心脏、肾脏、血液指标都 OK。作为繁育者，最开心的事莫过于此。拍了个 vlog 记录全程，准备剪辑发 YouTube。',
      ja: '年次健康診断の日。3匹を連れ出したが、全行程おとなしくて鳴きもしない。病院でも協力的で、採血、体重測定、歯のチェック、全てスムーズ。獣医も驚き：「この猫、鎮静剤でも飲ませたの？」——いいえ、サイベリアンはこういう穏やかな猫種。検診結果は全て正常、心臓、腎臓、血液検査値もOK。ブリーダーとしてこれ以上嬉しいことはない。全行程をvlogで記録、YouTube用に編集予定。',
      en: 'Annual checkup day. Brought 3 cats — quiet and calm the entire trip. At the clinic they were super cooperative: blood draws, weigh-ins, dental checks, all smooth. The vet was amazed: "Did you give them sedatives?" Nope, that\'s just how Siberians are. All results normal — heart, kidneys, blood work all clear. Nothing makes a breeder happier. Filmed the whole process as a vlog for YouTube.',
    },
  },
  {
    id: 'tl-011',
    date: '2026-03-10',
    category: 'tech',
    isMilestone: false,
    tags: ['DeepSeek', 'Analysis'],
    title: {
      zh: 'DeepSeek V3.2 Thinking 模式深度体验',
      ja: 'DeepSeek V3.2 Thinkingモード深掘り体験',
      en: 'Deep Dive into DeepSeek V3.2 Thinking Mode',
    },
    summary: {
      zh: '把 DS Thinking 接入日常工作流做策略分析，分析深度确实惊人。',
      ja: 'DS Thinkingを日常ワークフローの戦略分析に組み込み、分析の深さは驚くべきもの。',
      en: 'Integrated DS Thinking into daily workflow for strategy analysis — depth is genuinely impressive.',
    },
    content: {
      zh: '通过 Infini Coding Plan 接入了 DeepSeek V3.2 Thinking 模型，专门用来做需要深度思考的分析任务。测试了几个场景：猫舍 SNS 策略规划、竞品分析、定价策略。DS Thinking 的推理链很透明，能看到它怎么一步步分析的，而且结论往往出人意料——不是那种泛泛而谈的建议，而是有具体数据支撑的洞察。现在我的工作流是：日常对话用 M2.5-HS，需要深度分析时切到 DS Thinking。',
      ja: 'Infini Coding Planを通じてDeepSeek V3.2 Thinkingモデルを接続、深い思考が必要な分析タスク専用に。テストしたシナリオ：キャッテリーSNS戦略立案、競合分析、価格戦略。DS Thinkingの推論チェーンは透明で、ステップバイステップの分析過程が見え、結論はしばしば意外——一般的なアドバイスではなく、具体的なデータに基づいたインサイト。現在のワークフロー：日常会話はM2.5-HS、深い分析が必要な時はDS Thinkingに切替。',
      en: 'Connected DeepSeek V3.2 Thinking via Infini Coding Plan, dedicated to deep analysis tasks. Tested several scenarios: cattery SNS strategy, competitive analysis, pricing strategy. DS Thinking\'s reasoning chain is transparent — you can see how it analyzes step by step, and conclusions are often surprising — not generic advice but data-backed insights. Current workflow: daily chat with M2.5-HS, switch to DS Thinking when deep analysis is needed.',
    },
  },
  {
    id: 'tl-012',
    date: '2026-03-09',
    category: 'daily',
    isMilestone: false,
    tags: ['Sakura', 'Osaka'],
    title: {
      zh: '大阪城公园散步，早樱已经开了',
      ja: '大阪城公園散歩、早咲きの桜がもう咲いていた',
      en: 'Walk in Osaka Castle Park — Early Cherry Blossoms Already Blooming',
    },
    summary: {
      zh: '今年的樱花比往年早了一周，大阪城的早樱已经五分咲。',
      ja: '今年の桜は例年より1週間早く、大阪城の早咲き桜がすでに五分咲き。',
      en: 'This year\'s cherry blossoms are a week early — Osaka Castle\'s early varieties already at half bloom.',
    },
    content: {
      zh: '周日去大阪城公园散步，发现早樱已经开了五分。今年暖冬的影响，花期比往年提前了一周左右。拍了不少照片，准备写一篇"大阪樱花指南"的博客文章。春天的大阪城真的很美，护城河倒映着樱花，适合发 Instagram。顺便想到一个内容策划：可以做一个"大阪生活"系列，记录四季变化。',
      ja: '日曜日に大阪城公園を散歩したら、早咲きの桜がもう五分咲き。今年の暖冬の影響で、開花が例年より1週間ほど早い。写真をたくさん撮ったので、「大阪桜ガイド」のブログ記事を書く予定。春の大阪城は本当に美しく、お堀に桜が映り込んでInstagram向き。ふと思いつき：「大阪ライフ」シリーズで四季の変化を記録するのもいいかも。',
      en: 'Sunday walk in Osaka Castle Park — early cherry blossoms already at half bloom. Warm winter brought the season about a week early. Took lots of photos, planning to write an "Osaka Cherry Blossom Guide" blog post. Spring Osaka Castle is genuinely beautiful — cherry blossoms reflected in the moat, perfect for Instagram. Got an idea: could do an "Osaka Life" series documenting seasonal changes.',
    },
  },
  {
    id: 'tl-013',
    date: '2026-03-08',
    category: 'milestone',
    isMilestone: true,
    tags: ['Instagram', 'Growth'],
    title: {
      zh: '猫舍 Instagram 粉丝破 2000！',
      ja: 'キャッテリーInstagramフォロワー2000突破！',
      en: 'Cattery Instagram Followers Hit 2000!',
    },
    summary: {
      zh: '从 500 到 2000 用了 3 个月，AI 辅助运营功不可没。',
      ja: '500から2000まで3ヶ月、AI支援運営の貢献は大きい。',
      en: 'From 500 to 2000 in 3 months — AI-assisted operations played a huge role.',
    },
    content: {
      zh: '猫舍 Instagram 账号粉丝突破 2000，去年 12 月还只有 500 左右。增长主要来自几个因素：1) AI 生成的日语文案质量明显提升，互动率从 3% 涨到 8%；2) 发布频率从每周 2 次提高到每天 1 次（AI 帮忙大大降低了内容生产成本）；3) 开始做 Reels 短视频，完播率比图片高 3 倍；4) 用 AI 分析最佳发布时间（日本时间 19:00-21:00 效果最好）。下一个目标：5000 粉丝。',
      ja: 'キャッテリーInstagramアカウントのフォロワーが2000を突破、昨年12月はまだ500程度だった。成長要因：1) AI生成の日本語コピー品質が明らかに向上、エンゲージメント率が3%→8%に；2) 投稿頻度が週2回→毎日1回に増加（AIでコンテンツ制作コストが大幅減）；3) Reelsショート動画を開始、完視聴率が画像の3倍；4) AIで最適投稿時間を分析（日本時間19:00-21:00が最効果的）。次の目標：5000フォロワー。',
      en: 'Cattery Instagram hit 2000 followers — was only around 500 last December. Growth came from: 1) AI-generated Japanese copy quality visibly improved, engagement rate from 3% to 8%; 2) posting frequency increased from twice a week to daily (AI drastically cut content production costs); 3) started doing Reels — completion rate 3x higher than static images; 4) AI-analyzed optimal posting times (7-9 PM JST works best). Next target: 5000 followers.',
    },
  },
  {
    id: 'tl-014',
    date: '2026-03-07',
    category: 'tech',
    isMilestone: false,
    tags: ['TTS', 'Voice'],
    title: {
      zh: 'Edge TTS + Qwen3-TTS 双引擎配音方案',
      ja: 'Edge TTS + Qwen3-TTS デュアルエンジン音声合成',
      en: 'Edge TTS + Qwen3-TTS Dual Engine Voice Setup',
    },
    summary: {
      zh: '快速预览用 Edge TTS，成品用 Qwen3-TTS，各取所长。',
      ja: 'プレビューにEdge TTS、本番にQwen3-TTS、それぞれの長所を活かす。',
      en: 'Edge TTS for quick preview, Qwen3-TTS for production — best of both worlds.',
    },
    content: {
      zh: '给猫咪视频做配音一直是个痛点——之前用在线 TTS 服务，速度慢、成本高、隐私也是问题。现在搭建了双引擎方案：Edge TTS 用来快速预览（毫秒级响应，免费），确认文案没问题后用 Qwen3-TTS 生成高质量配音（本地运行，音色自然）。Qwen3-TTS 跑在 Mac Mini 上，用 ono_anna 音色做日语配音效果特别好，听起来很温柔自然。整个流程从文案到成品配音只需要 2 分钟。',
      ja: '猫動画のナレーションはずっと課題だった——以前はオンラインTTSサービスを使っていたが、遅い・高い・プライバシーも問題。デュアルエンジン構成を構築：Edge TTSで素早くプレビュー（ミリ秒応答、無料）、コピーを確認後にQwen3-TTSで高品質ナレーション生成（ローカル実行、自然な音声）。Qwen3-TTSはMac Miniで稼働、ono_annaボイスの日本語ナレーションが特に良い、優しく自然な印象。全工程でコピーから完成ナレーションまでわずか2分。',
      en: 'Voiceovers for cat videos were always a pain — online TTS services were slow, expensive, and raised privacy concerns. Built a dual-engine setup: Edge TTS for quick preview (millisecond response, free), then Qwen3-TTS for production-quality voiceover (runs locally, natural voice). Qwen3-TTS on Mac Mini with ono_anna voice for Japanese narration sounds particularly warm and natural. Total workflow from copy to finished voiceover: just 2 minutes.',
    },
  },
  {
    id: 'tl-015',
    date: '2026-03-06',
    category: 'reflection',
    isMilestone: false,
    tags: ['AI', 'Business'],
    title: {
      zh: '小而美的业务，大而全的 AI',
      ja: '小さくて美しいビジネス、大きくて完全なAI',
      en: 'Small and Beautiful Business, Big and Complete AI',
    },
    summary: {
      zh: '猫舍是个小生意，但 AI 让一个人可以做原来需要一个团队的事。',
      ja: 'キャッテリーは小さなビジネスだが、AIで1人が元々チームで行うことをこなせる。',
      en: 'A cattery is a small business, but AI lets one person do what used to take a team.',
    },
    content: {
      zh: '猫舍严格来说是个"微型生意"——年收入可能就几十万日元到百万级。但需要做的事情不少：繁育管理、客户沟通、SNS 运营、行政手续、医疗记录、财务记账。以前这些事要么请人帮忙，要么自己加班。现在有了 AI 加持，一个人 + 4 个 AI 实例就能覆盖所有环节。这就是 AI 时代个体户的优势——"一人公司"不再是梦想而是现实。关键是找到适合自己的工具组合和工作流。',
      ja: 'キャッテリーは厳密には「マイクロビジネス」——年収は数十万から百万円規模。でもやることは少なくない：繁殖管理、顧客対応、SNS運営、行政手続き、医療記録、経理。以前はこれらの作業を人に頼むか自分で残業してこなしていた。今はAIの力で、1人 + 4つのAIインスタンスで全工程をカバーできる。これがAI時代の個人事業主の強み——「一人会社」はもはや夢ではなく現実。カギは自分に合ったツールの組み合わせとワークフローを見つけること。',
      en: 'A cattery is technically a "micro-business" — annual revenue maybe hundreds of thousands to low millions of yen. But there\'s a lot to handle: breeding management, customer communications, SNS operations, paperwork, medical records, bookkeeping. Before, you\'d either hire help or work overtime. Now with AI, one person + 4 AI instances covers everything. This is the advantage of solopreneurs in the AI era — a "one-person company" is no longer a dream but reality. The key is finding the right tool combination and workflow for you.',
    },
  },
  {
    id: 'tl-016',
    date: '2026-03-05',
    category: 'daily',
    isMilestone: false,
    tags: ['Kitten', 'Birth'],
    title: {
      zh: '新一窝小猫出生了！4只健康宝宝',
      ja: '新しい子猫が生まれた！健康な4匹の赤ちゃん',
      en: 'New Litter Born! 4 Healthy Kittens',
    },
    summary: {
      zh: '母猫顺利分娩，4 只小猫全部健康，2 公 2 母。',
      ja: '母猫が無事に出産、4匹全員健康、オス2匹メス2匹。',
      en: 'Mother cat delivered safely, all 4 kittens healthy — 2 boys and 2 girls.',
    },
    content: {
      zh: '凌晨 3 点被叫醒——母猫开始分娩了。整个过程持续了约 4 小时，最终顺利产下 4 只小猫：2 公 2 母。体重都在 80-95g 之间，很健康。花色有蓝色虎斑、银色虎斑和纯白色。马上在 Notion 里建了档案，记录出生体重、花色、基因信息。接下来几天要密切关注母猫和小猫的状态，确保哺乳正常。新生小猫的照片太萌了，等满月后发 SNS。',
      ja: '午前3時に起こされた——母猫の出産が始まった。全工程は約4時間、無事に4匹の子猫を出産：オス2匹メス2匹。体重は80-95gの間で健康。毛色はブルータビー、シルバータビー、ソリッドホワイト。すぐにNotionで個体カルテを作成、出生体重、毛色、遺伝情報を記録。今後数日は母猫と子猫の状態を密に観察、授乳が正常か確認。新生子猫の写真がかわいすぎる、満1ヶ月後にSNS投稿予定。',
      en: 'Woken up at 3 AM — mother cat started labor. The whole process took about 4 hours, delivering 4 healthy kittens: 2 boys, 2 girls. All weighed between 80-95g. Colors include blue tabby, silver tabby, and solid white. Immediately set up profiles in Notion with birth weight, color, and genetic info. Next few days: close monitoring of mom and kittens to ensure normal nursing. The newborn photos are ridiculously cute — posting on SNS after they turn one month old.',
    },
  },
  {
    id: 'tl-017',
    date: '2026-03-04',
    category: 'tech',
    isMilestone: false,
    tags: ['Collaboration', 'Protocol'],
    title: {
      zh: '三实例协作协议正式启用',
      ja: '3インスタンス協作プロトコル正式稼働',
      en: 'Three-Instance Collaboration Protocol Goes Live',
    },
    summary: {
      zh: 'ユキ + ナツ + ハル 三实例协作规范化，任务看板 + 路由表 + 委派协议。',
      ja: 'ユキ + ナツ + ハル 3インスタンス協作を規範化、タスクボード + ルーティングテーブル + 委任プロトコル。',
      en: 'Yuki + Natsu + Haru collaboration formalized with task board, routing table, and delegation protocol.',
    },
    content: {
      zh: '之前三个实例各干各的，经常出现任务重复或遗漏的情况。今天正式制定了协作协议：1) 共享任务看板（task-board.md），所有任务状态一目了然；2) 路由表明确每个实例的核心职责边界；3) 委派协议规定跨实例任务交接的流程。还加了四条铁律：不越权、不抢功、不甩锅、要闭环。这套协议运行了一天，已经明显减少了混乱。AI 团队管理和人类团队管理，其实很多逻辑是相通的。',
      ja: '以前は3インスタンスが各自で動き、タスクの重複や漏れが頻発。今日正式に協作プロトコルを策定：1) 共有タスクボード（task-board.md）で全タスク状態を可視化；2) ルーティングテーブルで各インスタンスの職責境界を明確化；3) 委任プロトコルでクロスインスタンスのタスク引き継ぎフローを規定。4つの鉄則も追加：越権しない、手柄を横取りしない、責任転嫁しない、クローズまでやり切る。このプロトコルを1日運用して、既に混乱が明らかに減少。AIチーム管理と人間チーム管理、実は多くのロジックが共通している。',
      en: 'Previously three instances worked independently, often causing task duplication or omission. Today we formalized the collaboration protocol: 1) shared task board (task-board.md) for full status visibility; 2) routing table clarifying each instance\'s responsibility boundaries; 3) delegation protocol defining cross-instance task handoff procedures. Added four iron rules: no overstepping, no credit-stealing, no blame-shifting, always close the loop. After one day of running, confusion noticeably decreased. AI team management and human team management share more logic than you\'d think.',
    },
  },
  {
    id: 'tl-018',
    date: '2026-03-03',
    category: 'daily',
    isMilestone: false,
    tags: ['Birthday', 'Baking'],
    title: {
      zh: '给暁棉做了生日蛋糕 🎂',
      ja: '暁棉にバースデーケーキを作った 🎂',
      en: 'Made a Birthday Cake for Akiwata 🎂',
    },
    summary: {
      zh: '第一次尝试做提拉米苏蛋糕，AI 帮忙查了好几个食谱最终成功。',
      ja: '初めてティラミスケーキに挑戦、AIで複数レシピを調べて最終的に成功。',
      en: 'First attempt at tiramisu cake — AI helped research multiple recipes and it turned out great.',
    },
    content: {
      zh: '暁棉生日，想做个提拉米苏蛋糕给她惊喜。之前没做过蛋糕，让 AI 帮我对比了 5 个食谱，找出最适合新手的版本。过程中遇到马斯卡彭奶酪打发不够的问题，实时问 AI 怎么补救。最后居然做成了，虽然卖相一般但味道不错。暁棉很开心，说"有AI帮忙做蛋糕也太犯规了吧"。生活中 AI 能帮到的地方真的比想象中多。',
      ja: '暁棉の誕生日にティラミスケーキでサプライズしたくて。ケーキ作り初体験、AIに5つのレシピを比較してもらい、初心者向けのバージョンを特定。途中でマスカルポーネの泡立てが足りない問題に遭遇、リアルタイムでAIに対処法を聞いた。最終的になんとか完成、見た目はまあまあだけど味は良い。暁棉は大喜び、「AI手伝いでケーキ作るの反則でしょ」とのこと。生活でのAI活用は実はとても温かい、冷たいツールではなく、気持ちをより良く表現する手助けをしてくれるアシスタント。',
      en: 'Wanted to surprise Akiwata with a tiramisu cake for her birthday. Never baked a cake before, so had AI compare 5 recipes to find the most beginner-friendly one. Hit a problem with under-whipped mascarpone — asked AI in real-time how to fix it. Actually pulled it off — looks mediocre but tastes good. Akiwata was thrilled, said "using AI to help bake is basically cheating." AI helps in more everyday situations than you\'d expect.',
    },
  },
  {
    id: 'tl-019',
    date: '2026-03-02',
    category: 'tech',
    isMilestone: false,
    tags: ['Automation', 'Pipeline'],
    title: {
      zh: '自动化发布流水线搭建完成',
      ja: '自動投稿パイプライン構築完了',
      en: 'Automated Publishing Pipeline Complete',
    },
    summary: {
      zh: '一条命令搞定：生成文案→适配5平台→定时发布→数据追踪。',
      ja: '1コマンドで完了：コピー生成→5プラットフォーム適配→予約投稿→データ追跡。',
      en: 'One command does it all: generate copy → adapt for 5 platforms → schedule → track data.',
    },
    content: {
      zh: '花了一整天搭建了 SNS 自动化发布流水线。流程是：1) 拍完猫咪照片后，AI 自动生成 5 个平台的文案（Instagram 日语、TikTok 中文、小红书中文、Lemon8 日语、ブリーダー详细日语）；2) 每个平台的格式、标签、emoji 风格都自动适配；3) 设定发布时间后自动排队；4) 发布后自动追踪互动数据。从"拍照到全平台发布"原来需要 2-3 小时，现在 15 分钟搞定。这就是 AI 自动化的魅力。',
      ja: '丸1日かけてSNS自動投稿パイプラインを構築。フロー：1) 猫写真撮影後、AIが5プラットフォーム用のコピーを自動生成（Instagram日本語、TikTok中国語、小紅書中国語、Lemon8日本語、ブリーダー詳細日本語）；2) 各プラットフォームのフォーマット、タグ、emoji風格を自動適配；3) 投稿時間を設定し自動キューイング；4) 投稿後に自動でエンゲージメントデータを追跡。「撮影→全プラットフォーム投稿」が以前は2-3時間だったのが、今は15分で完了。これがAI自動化の魅力。',
      en: 'Spent a full day building the SNS automated publishing pipeline. Flow: 1) After cat photos, AI auto-generates copy for 5 platforms (Instagram in Japanese, TikTok in Chinese, Xiaohongshu in Chinese, Lemon8 in Japanese, Breeder in detailed Japanese); 2) auto-adapts format, tags, and emoji style for each platform; 3) set publish time and auto-queue; 4) auto-track engagement data after posting. "Photo to all-platform publish" went from 2-3 hours to 15 minutes. That\'s the magic of AI automation.',
    },
  },
  {
    id: 'tl-020',
    date: '2026-03-01',
    category: 'milestone',
    isMilestone: true,
    tags: ['Goals', 'Planning'],
    title: {
      zh: '3月目标设定：AI 副业正式启动',
      ja: '3月目標設定：AI副業正式スタート',
      en: 'March Goals Set: AI Side Business Officially Launched',
    },
    summary: {
      zh: '三月计划：完成 AI Blog + 3个案例 + 接 2 个客户。',
      ja: '3月計画：AI Blog完成 + 3ケース + 2クライアント獲得。',
      en: 'March plan: finish AI Blog + 3 case studies + land 2 clients.',
    },
    content: {
      zh: '坐下来认真规划了 3 月的 AI 副业目标：1) 完成 Will AI Lab 网站（博客 + 案例展示 + 时间线）；2) 写 3 个详细案例研究（多AI架构、猫舍SNS自动化、医疗AI）；3) 通过案例展示接到 2 个付费客户。对标了几个同类型的 AI 顾问网站，发现关键差异化在于"真实案例 + 技术深度 + 接地气的表达"。不做那种空洞的"AI解决方案"网站，而是展示真实的实践过程。',
      ja: '3月のAI副業目標を真剣に計画：1) Will AI Labサイト完成（ブログ + ケース展示 + タイムライン）；2) 3つの詳細ケーススタディ執筆（マルチAI構成、キャッテリーSNS自動化、医療AI）；3) ケース展示を通じて2件の有料クライアントを獲得。同タイプのAIコンサルタントサイトを比較し、差別化の鍵は「リアルなケース + 技術の深さ + 地に足のついた表現」にあると発見。空虚な「AIソリューション」サイトではなく、リアルな実践プロセスを展示する。',
      en: 'Sat down and seriously planned March AI side-business goals: 1) finish Will AI Lab website (blog + case studies + timeline); 2) write 3 detailed case studies (multi-AI architecture, cattery SNS automation, medical AI); 3) land 2 paying clients through case study showcase. Benchmarked against similar AI consultant sites — key differentiation is "real cases + technical depth + down-to-earth writing." Not making an empty "AI Solutions" site but showing real practice processes.',
    },
  },
  {
    id: 'tl-021',
    date: '2026-02-28',
    category: 'daily',
    isMilestone: false,
    tags: ['Cat', 'Grooming'],
    title: {
      zh: '猫咪们的春季换毛季开始了',
      ja: '猫たちの春の換毛期が始まった',
      en: 'Cats\' Spring Shedding Season Has Begun',
    },
    summary: {
      zh: '每天梳毛 30 分钟，一周能攒一只猫的量的毛。',
      ja: '毎日30分のブラッシング、1週間で猫1匹分の毛が集まる。',
      en: '30 minutes of brushing daily — enough fur to assemble a whole cat in a week.',
    },
    content: {
      zh: 'サイベリアン 是三层毛的品种，到了换毛季真的很壮观。每只猫每天至少梳 30 分钟，不然家里到处都是飞毛。用了一把新的脱毛梳效果不错，等用了几天再在 SNS 上推荐。暁棉吐槽说家里的扫地机器人最近疯狂工作，电量都不够用了。猫毛量大也是サイベリアン 的一个特征，但那蓬松的触感真的让人上瘾。',
      ja: 'サイベリアンは3層構造の被毛を持つ猫種で、換毛期は本当に壮観。1匹あたり毎日最低30分のブラッシングが必要、でないと家中に毛が舞う。新しいファーミネーターの効果がなかなか良い、数日使ったらSNSでおすすめする予定。暁棉は「最近お掃除ロボが狂ったように働いてバッテリーが足りない」とぼやき。毛量の多さもサイベリアンの特徴だけど、あのフワフワの手触りは本当に中毒性がある。',
      en: 'Siberians have triple-layer coats, and shedding season is truly spectacular. At least 30 minutes of brushing per cat daily, otherwise fur flies everywhere. Got a new deshedding brush that works well — will recommend on SNS after a few more days of testing. Akiwata complains the robot vacuum has been working overtime and running out of battery. Heavy shedding is a Siberian trait, but that fluffy texture is genuinely addictive.',
    },
  },
  {
    id: 'tl-022',
    date: '2026-02-27',
    category: 'tech',
    isMilestone: false,
    tags: ['Notion', 'API', 'Automation'],
    title: {
      zh: 'Notion API 自动化猫咪档案管理',
      ja: 'Notion APIで猫の個体カルテ管理を自動化',
      en: 'Automated Cat Profile Management via Notion API',
    },
    summary: {
      zh: '每只猫的体重、疫苗、健康记录全部自动同步到 Notion。',
      ja: '各猫の体重、ワクチン、健康記録を全てNotionに自動同期。',
      en: 'Weight, vaccines, health records for each cat auto-synced to Notion.',
    },
    content: {
      zh: '之前猫咪档案管理是手动在 Notion 里更新，每次体检、打疫苗、量体重都要手动录入。今天写了一套自动化脚本：通过 Notion API 直接读写猫咪数据库，支持批量更新体重记录、自动计算增长曲线、疫苗到期提醒、健康异常预警。还加了一个功能——根据出生日期自动计算周龄，到了特定周龄自动提醒该做什么（首次驱虫、疫苗接种等）。繁育管理从此进入自动化时代。',
      ja: '以前は猫の個体カルテ管理がNotionで手動更新——健診、ワクチン、体重測定のたびに手入力。今日自動化スクリプトを構築：Notion API経由で猫データベースを直接読み書き、体重記録の一括更新、成長曲線の自動計算、ワクチン期限リマインダー、健康異常アラートに対応。さらに誕生日から週齢を自動計算し、特定週齢で何をすべきか自動リマインド（初回駆虫、ワクチン接種など）する機能も追加。繁殖管理が自動化時代に突入。',
      en: 'Cat profile management was manual Notion updates — every checkup, vaccine, weight measurement needed manual entry. Today built an automation suite: Notion API for direct database read/write, batch weight record updates, auto growth curve calculation, vaccine expiry reminders, health anomaly alerts. Also added auto-calculation of age in weeks from birth date with automatic reminders for milestone events (first deworming, vaccines, etc.). Breeding management enters the automation era.',
    },
  },
  {
    id: 'tl-023',
    date: '2026-02-25',
    category: 'reflection',
    isMilestone: false,
    tags: ['AI', 'Life'],
    title: {
      zh: '做自己喜欢的事，然后让 AI 处理不喜欢的部分',
      ja: '好きなことをして、嫌いな部分はAIに任せる',
      en: 'Do What You Love, Let AI Handle What You Don\'t',
    },
    summary: {
      zh: '这可能是 AI 时代最好的生活策略。',
      ja: 'これがAI時代の最高のライフ戦略かもしれない。',
      en: 'This might be the best life strategy of the AI era.',
    },
    content: {
      zh: '回顾最近两个月的 AI 使用体验，发现一个规律：我最开心的时候是在做创意决策和与猫互动，最不开心的时候是在做重复性的行政工作和格式化内容。AI 完美填补了后者——数据录入、文案格式化、多平台适配、排程管理、财务记录，这些全部可以交给 AI。这样我就能把精力集中在真正重要的事上：繁育决策、品牌方向、客户关系、以及最重要的——和猫咪在一起的时间。AI 不是让你做更多事，而是让你做更对的事。',
      ja: 'この2ヶ月のAI活用を振り返ると、ある法則に気づいた：一番幸せなのはクリエイティブな意思決定と猫との触れ合いの時、一番辛いのは反復的な事務作業とコンテンツのフォーマット作業。AIが後者を完璧に補完——データ入力、コピーのフォーマット化、マルチプラットフォーム適配、スケジュール管理、財務記録、全てAIに任せられる。こうして本当に重要なことにエネルギーを集中できる：繁殖判断、ブランド方向性、顧客関係、そして最も大切な——猫たちと過ごす時間。AIはもっと多くのことをさせるのではなく、より正しいことをさせてくれる。',
      en: 'Looking back on two months of AI usage, I noticed a pattern: happiest when making creative decisions and interacting with cats, least happy doing repetitive admin and content formatting. AI perfectly fills the latter — data entry, copy formatting, multi-platform adaptation, schedule management, financial records, all delegated to AI. This frees energy for what truly matters: breeding decisions, brand direction, customer relationships, and most importantly — time with the cats. AI doesn\'t make you do more — it makes you do the right things.',
    },
  },
  {
    id: 'tl-024',
    date: '2026-02-23',
    category: 'daily',
    isMilestone: false,
    tags: ['Customer', 'Heartwarming'],
    title: {
      zh: '收到客户的感谢信，感动了',
      ja: 'お客様から感謝の手紙、感動した',
      en: 'Received a Thank You Letter from a Client — Touched',
    },
    summary: {
      zh: '去年领养猫咪的客户寄来了手写感谢信和猫咪近照。',
      ja: '昨年猫を引き取ったお客様から手書きの感謝状と猫の近影が届いた。',
      en: 'Last year\'s adoption client sent a handwritten thank you letter and recent cat photos.',
    },
    content: {
      zh: '收到一封手写信——去年领养了一只蓝色虎斑サイベリアン的客户寄来的。信里说猫咪已经完全适应了新家，特别喜欢趴在窗台看外面，性格温柔又活泼。还附了好几张照片，长大了好多，毛量更惊人了。作为繁育者，最大的成就感就是知道自己繁育的猫咪在新家被好好爱着。把照片和信的内容（经客户同意）发到了 Instagram，粉丝们都说被治愈了。',
      ja: '手書きの手紙を受け取った——昨年ブルータビーのサイベリアンを引き取ったお客様から。猫は新しいお家にすっかり馴染み、窓辺で外を眺めるのが大好きで、性格は穏やかで活発とのこと。写真も何枚か同封されていて、大きく成長し毛量がさらにすごい。ブリーダーとして最大のやりがいは、自分が育てた猫が新しいお家で大切にされていると知ること。写真と手紙の内容を（お客様の了承を得て）Instagramに投稿、フォロワーから「癒された」の声。',
      en: 'Received a handwritten letter from a client who adopted a blue tabby Siberian last year. The letter said the cat has fully settled in, loves lounging on the windowsill watching outside, with a gentle yet playful personality. Enclosed several photos — grown so much with even more impressive fur. As a breeder, the greatest satisfaction is knowing your cats are loved in their new homes. Posted the photos and letter content (with client permission) on Instagram — followers said it was heartwarming.',
    },
  },
  {
    id: 'tl-025',
    date: '2026-02-21',
    category: 'tech',
    isMilestone: false,
    tags: ['Next.js', 'Framework'],
    title: {
      zh: '研究了 Next.js 15 的 App Router，准备建博客',
      ja: 'Next.js 15のApp Routerを研究、ブログ構築準備',
      en: 'Studied Next.js 15 App Router — Preparing for Blog Build',
    },
    summary: {
      zh: '对比了 Astro、Hugo、Next.js，最终选择 Next.js 15 作为博客技术栈。',
      ja: 'Astro、Hugo、Next.jsを比較、最終的にNext.js 15をブログの技術スタックに選定。',
      en: 'Compared Astro, Hugo, Next.js — ultimately chose Next.js 15 as the blog tech stack.',
    },
    content: {
      zh: '花了一天时间对比三个框架：Astro 轻量但生态不够丰富；Hugo 速度快但定制性差；Next.js 15 全能但稍重。最终选 Next.js 15 的理由：1) App Router 的 RSC 和 Server Actions 很适合做动态博客；2) 三语路由用 next-intl 方案成熟；3) 后续如果要加互动功能（评论、点赞、订阅）很方便；4) Vercel 部署一键搞定。技术选型的原则是"够用就行"，但也要为未来留空间。',
      ja: '1日かけて3つのフレームワークを比較：Astroは軽量だがエコシステムが不十分；Hugoは高速だがカスタマイズ性に欠ける；Next.js 15は万能だがやや重い。Next.js 15を選んだ理由：1) App RouterのRSCとServer Actionsが動的ブログに最適；2) 3言語ルーティングはnext-intlで成熟したソリューション；3) 将来インタラクティブ機能（コメント、いいね、購読）の追加が容易；4) Vercelでワンクリックデプロイ。技術選定の原則は「必要十分」、でも将来の余地も残す。',
      en: 'Spent a day comparing three frameworks: Astro is lightweight but ecosystem isn\'t rich enough; Hugo is fast but lacks customization; Next.js 15 is full-featured but slightly heavy. Chose Next.js 15 because: 1) App Router with RSC and Server Actions suits dynamic blogs; 2) trilingual routing has mature next-intl solution; 3) easy to add interactive features later (comments, likes, subscriptions); 4) one-click Vercel deployment. Tech selection principle: "good enough is fine," but leave room for the future.',
    },
  },
  {
    id: 'tl-026',
    date: '2026-02-20',
    category: 'milestone',
    isMilestone: true,
    tags: ['OpenClaw', 'Workspace'],
    title: {
      zh: 'ナツ and ユキ 工作空间正式分离',
      ja: 'ナツとユキのワークスペース正式分離',
      en: 'Natsu and Yuki Workspaces Officially Separated',
    },
    summary: {
      zh: '两个 AI 实例各自有了专属工作目录和记忆系统。',
      ja: '2つのAIインスタンスがそれぞれ専用のワークディレクトリとメモリシステムを持つように。',
      en: 'Two AI instances now have dedicated work directories and memory systems.',
    },
    content: {
      zh: '之前ユキ和ナツ共用一个 workspace，经常出现文件冲突和上下文混乱。今天正式分离：ユキ用默认 workspace（技术开发），ナツ用 workspace-natsu（SNS 和内容）。各自有独立的 SOUL.md、AGENTS.md、MEMORY.md。共享知识通过 shared-knowledge 目录同步，每天凌晨 04:15 自动跑同步脚本。这种"独立办公 + 共享知识"的模式，就像两个人在不同办公室工作但共享一个知识库。',
      ja: '以前はユキとナツが1つのworkspaceを共有、ファイル衝突やコンテキスト混乱が頻発。今日正式に分離：ユキはデフォルトworkspace（技術開発）、ナツはworkspace-natsu（SNSとコンテンツ）。それぞれ独立のSOUL.md、AGENTS.md、MEMORY.mdを持つ。共有知識はshared-knowledgeディレクトリで同期、毎朝04:15に自動同期スクリプトを実行。この「独立オフィス + 共有知識」モデルは、2人が別々のオフィスで働きながら1つのナレッジベースを共有するようなもの。',
      en: 'Previously Yuki and Natsu shared one workspace, causing frequent file conflicts and context confusion. Today: official separation — Yuki uses default workspace (tech dev), Natsu uses workspace-natsu (SNS and content). Each has independent SOUL.md, AGENTS.md, MEMORY.md. Shared knowledge syncs through shared-knowledge directory with auto-sync script at 04:15 daily. This "independent offices + shared knowledge" model is like two people working in different offices but sharing one knowledge base.',
    },
  },
  {
    id: 'tl-027',
    date: '2026-02-18',
    category: 'daily',
    isMilestone: false,
    tags: ['Cat Café', 'Research'],
    title: {
      zh: '试了大阪新开的猫咖啡，意外收获灵感',
      ja: '大阪に新しくできた猫カフェに行った、意外なインスピレーション',
      en: 'Tried a New Cat Café in Osaka — Unexpected Inspiration',
    },
    summary: {
      zh: '他们的 SNS 运营做得很好，偷师了几个技巧。',
      ja: '彼らのSNS運営が上手で、いくつかテクニックを学んだ。',
      en: 'Their SNS game was strong — picked up a few techniques.',
    },
    content: {
      zh: '周末去了难波新开的猫咖啡"猫の時間"，本来是放松，结果变成了竞品调研。他们的 Instagram 做得真好——统一的滤镜风格、固定的九宫格版式、每只猫都有专属 hashtag。学到几点：1) Stories 用来展示幕后日常比正式 Post 效果好；2) 猫咪性格介绍比纯萌照更有粘性；3) 固定时间的直播能培养粉丝习惯。回来后立刻调整了我们的内容策略。',
      ja: '週末になんばにオープンしたばかりの猫カフェ「猫の時間」へ。リラックスのつもりが競合調査に。彼らのInstagramが本当に上手い——統一フィルター、固定グリッドレイアウト、各猫に専用ハッシュタグ。学んだこと：1) Storiesで舞台裏を見せる方が正式Postより効果的；2) 猫の性格紹介が純粋な可愛い写真よりエンゲージメントが高い；3) 定時配信で視聴習慣を育てられる。帰ったらすぐコンテンツ戦略を修正。',
      en: 'Went to "Neko no Jikan," a new cat café in Namba. Meant to relax but turned into competitive research. Their Instagram was impressive — consistent filter style, fixed grid layout, dedicated hashtag for each cat. Key takeaways: 1) Stories showing behind-the-scenes beat formal Posts; 2) cat personality intros get more engagement than pure cute photos; 3) scheduled live streams build viewer habits. Immediately adjusted our content strategy when I got home.',
    },
  },
  {
    id: 'tl-028',
    date: '2026-02-15',
    category: 'tech',
    isMilestone: false,
    tags: ['Ollama', 'Local AI'],
    title: {
      zh: '搭建了本地 AI 开发环境全家桶',
      ja: 'ローカルAI開発環境フルセット構築',
      en: 'Built Complete Local AI Development Environment',
    },
    summary: {
      zh: 'Ollama + Whisper + Qwen3-TTS，全部本地跑，不依赖云端。',
      ja: 'Ollama + Whisper + Qwen3-TTS、全てローカル実行、クラウド不要。',
      en: 'Ollama + Whisper + Qwen3-TTS, all running locally — no cloud dependency.',
    },
    content: {
      zh: '在 Mac Mini M4 上搭建了完整的本地 AI 环境：Ollama 跑 Qwen3 4B 做日常对话（快速且免费），Whisper.cpp 做语音识别（日语准确率很高），Qwen3-TTS 做语音合成（9 种音色可选）。全部本地运行，不需要任何云端 API。这意味着：1) 完全免费（除了电费）；2) 零延迟；3) 隐私有保障；4) 断网也能用。当然精度和云端大模型还是有差距，所以日常用本地，重要任务用云端，两条腿走路。',
      ja: 'Mac Mini M4に完全なローカルAI環境を構築：Ollamaで Qwen3 4Bの日常会話（高速で無料）、Whisper.cppで音声認識（日本語精度が高い）、Qwen3-TTSで音声合成（9種のボイス選択可能）。全てローカル実行、クラウドAPI不要。これは：1) 完全無料（電気代以外）；2) ゼロレイテンシ；3) プライバシー保証；4) オフラインでも使用可能。もちろん精度はクラウドの大規模モデルには及ばないので、日常はローカル、重要タスクはクラウドの二刀流。',
      en: 'Set up complete local AI environment on Mac Mini M4: Ollama running Qwen3 4B for daily chat (fast and free), Whisper.cpp for speech recognition (high Japanese accuracy), Qwen3-TTS for voice synthesis (9 voice options). All local, no cloud API needed. This means: 1) completely free (except electricity); 2) zero latency; 3) privacy guaranteed; 4) works offline. Of course accuracy gaps exist vs cloud models, so daily tasks go local, important ones go cloud — best of both worlds.',
    },
  },
  {
    id: 'tl-029',
    date: '2026-02-12',
    category: 'reflection',
    isMilestone: false,
    tags: ['Productivity', 'Focus'],
    title: {
      zh: '慢慢来，比较快',
      ja: 'ゆっくり行く方が、結局速い',
      en: 'Going Slow Is Actually Faster',
    },
    summary: {
      zh: '急于求成的一周反而什么都没做好，决定放慢节奏。',
      ja: '焦った1週間は結局何も上手くいかなかった、ペースを落とすことに。',
      en: 'A week of rushing produced nothing good — decided to slow down.',
    },
    content: {
      zh: '上周试图同时推进 5 个项目：网站、SNS 自动化、客户跟进、猫咪档案整理、新模型测试。结果每个都推进了一点点，但没有一个真正完成。今天停下来反思，发现问题在于：我把 AI 当成了无限加速器，觉得有了 AI 就能并行处理一切。但我自己的注意力和决策能力是有限的。AI 能加速执行，但不能替代你的专注力。决定：每天最多推进 2 个项目，每个项目专注至少 2 小时。慢慢来，比较快。',
      ja: '先週5つのプロジェクトを同時に進めようとした：サイト、SNS自動化、顧客フォロー、猫の個体管理、新モデルテスト。結果、各プロジェクトが少しずつ進んだだけで、どれも完成しなかった。今日立ち止まって振り返り、問題を発見：AIを無限のアクセラレーターと思い込み、AIがあれば全て並行処理できると考えていた。でも自分の注意力と判断力には限りがある。AIは実行を加速できるが、集中力の代わりにはならない。決定：1日最大2プロジェクト、各プロジェクト最低2時間集中。ゆっくり行く方が、結局速い。',
      en: 'Last week I tried pushing 5 projects simultaneously: website, SNS automation, client follow-ups, cat profile management, new model testing. Result: each moved a tiny bit forward but none finished. Stopped to reflect today — the problem: I treated AI as an infinite accelerator, thinking I could parallelize everything. But my own attention and decision-making capacity is finite. AI accelerates execution but can\'t replace focus. Decision: max 2 projects per day, at least 2 hours of focus each. Going slow is actually faster.',
    },
  },
  {
    id: 'tl-030',
    date: '2026-02-10',
    category: 'milestone',
    isMilestone: true,
    tags: ['Client', 'Medical AI'],
    title: {
      zh: '拿到了第一个 AI 顾问付费客户',
      ja: '初のAIコンサルティング有料クライアント獲得',
      en: 'Landed First Paid AI Consulting Client',
    },
    summary: {
      zh: '一家再生医療クリニック要导入 AI 客服系统，3个月项目。',
      ja: '再生医療クリニックがAIカスタマーサービスシステム導入、3ヶ月プロジェクト。',
      en: 'A regenerative medicine clinic wants AI customer service — 3-month project.',
    },
    content: {
      zh: '通过朋友介绍，一家大阪的再生医療クリニック找我做 AI 导入咨询。需求很明确：1) 客服自动化（日语 + 中文 + 英语三语对应）；2) 预约管理系统优化；3) 患者随访自动化。报价通过，签了 3 个月的项目合同。这是我 AI 副业的第一个付费客户，意义重大。计划把这个项目做成详细的案例研究，展示在 Will AI Lab 网站上。医疗 AI 有很多特殊考量——隐私保护、合规性、准确性要求极高——这些都是很好的学习机会。',
      ja: '友人の紹介で、大阪の再生医療クリニックからAI導入コンサルティングの依頼。ニーズは明確：1) カスタマーサービス自動化（日本語 + 中国語 + 英語の3言語対応）；2) 予約管理システム最適化；3) 患者フォローアップ自動化。見積もりが通り、3ヶ月のプロジェクト契約を締結。AI副業の初の有料クライアントで、非常に重要な意味がある。このプロジェクトを詳細なケーススタディにして、Will AI Labサイトに掲載する予定。医療AIには多くの特殊考慮事項——プライバシー保護、コンプライアンス、極めて高い正確性要求——があり、良い学びの機会。',
      en: 'Through a friend\'s introduction, an Osaka regenerative medicine clinic hired me for AI integration consulting. Clear needs: 1) customer service automation (Japanese + Chinese + English trilingual); 2) appointment management optimization; 3) patient follow-up automation. Quote approved, signed a 3-month project contract. This is my first paid AI side-business client — significant milestone. Plan to turn this into a detailed case study for Will AI Lab. Medical AI has many special considerations — privacy, compliance, extremely high accuracy requirements — all great learning opportunities.',
    },
  },
  {
    id: 'tl-031',
    date: '2026-02-08',
    category: 'daily',
    isMilestone: false,
    tags: ['Valentine', 'Life'],
    title: {
      zh: '情人节前的准备工作',
      ja: 'バレンタイン前の準備',
      en: 'Valentine\'s Day Preparations',
    },
    summary: {
      zh: 'AI 帮我选了巧克力品牌，还帮写了手写卡片的草稿。',
      ja: 'AIにチョコレートブランドを選んでもらい、手書きカードの下書きも。',
      en: 'AI helped pick chocolate brands and even drafted the handwritten card.',
    },
    content: {
      zh: '情人节快到了，让 AI 帮忙做了一些准备。首先分析了暁棉之前提过喜欢的巧克力风格（黑巧、不要太甜、有果仁），然后搜索大阪周边符合条件的品牌，最终选了北浜的一家手工巧克力店。还让 AI 帮忙起草了一张卡片的内容——当然最后是自己手写的。AI 在生活中的应用其实可以很温馨，它不是冷冰冰的工具，而是一个能帮你把心意表达得更好的助手。',
      ja: 'バレンタインが近づき、AIに準備を手伝ってもらった。まず暁棉が以前言っていたチョコレートの好み（ダークチョコ、甘すぎない、ナッツ入り）を分析、大阪周辺で条件に合うブランドを検索、最終的に北浜の手作りチョコレートショップに決定。カードの内容もAIに下書きしてもらった——もちろん最後は自分の手書き。生活でのAI活用は実はとても温かい、冷たいツールではなく、気持ちをより良く表現する手助けをしてくれるアシスタント。',
      en: 'Valentine\'s Day approaching, had AI help with preparations. First analyzed chocolate preferences Akiwata had mentioned (dark chocolate, not too sweet, with nuts), searched Osaka-area brands matching criteria, settled on an artisan chocolate shop in Kitahama. Also had AI draft card content — of course the final version was handwritten. AI in everyday life can be quite heartwarming — it\'s not a cold tool but an assistant that helps you express your feelings better.',
    },
  },
  {
    id: 'tl-032',
    date: '2026-02-05',
    category: 'tech',
    isMilestone: false,
    tags: ['Watchdog', 'Monitoring'],
    title: {
      zh: 'Watchdog 互监机制上线',
      ja: 'Watchdog相互監視メカニズム稼働開始',
      en: 'Watchdog Mutual Monitoring Goes Live',
    },
    summary: {
      zh: '两个 OpenClaw 实例互相监控，一个挂了另一个自动拉起。',
      ja: '2つのOpenClawインスタンスが互いを監視、一方がダウンしたらもう一方が自動復旧。',
      en: 'Two OpenClaw instances monitor each other — if one dies, the other auto-recovers it.',
    },
    content: {
      zh: '之前 AI 实例偶尔会挂掉（内存溢出、网络断开等），需要手动重启。现在搭建了 watchdog 互监机制：ユキ和ナツ每 5 分钟互相检查对方的 health endpoint，如果连续 3 次 check 失败就自动执行 launchctl kickstart 重启。还加了通知——重启时会通过 Telegram 告知我。这套方案已经稳定运行了一周，期间自动恢复了 2 次宕机，完全无需人工干预。简单但有效。',
      ja: '以前はAIインスタンスが時々ダウン（メモリオーバーフロー、ネットワーク切断等）、手動での再起動が必要だった。watchdog相互監視メカニズムを構築：ユキとナツが5分ごとに相手のhealth endpointをチェック、連続3回チェック失敗でlaunchctl kickstartを自動実行して再起動。通知も追加——再起動時にTelegramで報告。このシステムは1週間安定稼働、その間に2回のダウンを自動復旧、人の介入は完全に不要。シンプルだが効果的。',
      en: 'Previously AI instances occasionally crashed (memory overflow, network disconnection, etc.), requiring manual restart. Built watchdog mutual monitoring: Yuki and Natsu check each other\'s health endpoint every 5 minutes — 3 consecutive failures trigger automatic launchctl kickstart restart. Added notifications — restarts report via Telegram. This system has run stable for a week, auto-recovering from 2 crashes with zero human intervention. Simple but effective.',
    },
  },
  {
    id: 'tl-033',
    date: '2026-02-01',
    category: 'milestone',
    isMilestone: true,
    tags: ['OKR', 'Planning'],
    title: {
      zh: '2026 年度 OKR 制定完成',
      ja: '2026年度OKR策定完了',
      en: '2026 Annual OKRs Finalized',
    },
    summary: {
      zh: '三大目标：猫舍品牌化、AI副业起步、技术博客持续输出。',
      ja: '3大目標：キャッテリーブランド化、AI副業の立ち上げ、技術ブログの継続発信。',
      en: 'Three main goals: cattery branding, AI side business launch, consistent tech blog output.',
    },
    content: {
      zh: '新年第一天坐下来认真做了全年规划。用 DS Thinking 帮我做了 SWOT 分析和目标拆解：\n\nO1: 猫舍品牌化 — Instagram 5000 粉、ブリーダー 评分 4.8+、建立品牌识别度\nO2: AI 副业起步 — 3 个案例研究、5 个付费客户、月收入 10 万日元\nO3: 技术博客 — 每周 1 篇、全年 50 篇、建立个人技术品牌\n\n每个 O 下面拆了 3-4 个 KR，再把 KR 分配到月度和周度计划。这可能是我做过最系统的年度规划了——感谢 AI 帮忙做结构化思考。',
      ja: '新年初日に真剣に年間計画を策定。DS Thinkingを使ってSWOT分析と目標分解：\n\nO1: キャッテリーブランド化 — Instagram 5000フォロワー、ブリーダー評価4.8+、ブランド認知度確立\nO2: AI副業立ち上げ — 3ケーススタディ、5有料クライアント、月収10万円\nO3: 技術ブログ — 週1本、年間50本、個人技術ブランド確立\n\n各Oの下に3-4のKRを設定、KRを月次・週次計画に配分。おそらく過去最も体系的な年間計画——構造的思考のAI支援に感謝。',
      en: 'Sat down on New Year\'s Day for serious annual planning. Used DS Thinking for SWOT analysis and goal decomposition:\n\nO1: Cattery Branding — Instagram 5000 followers, Breeder rating 4.8+, establish brand recognition\nO2: AI Side Business — 3 case studies, 5 paid clients, ¥100K monthly revenue\nO3: Tech Blog — 1 post/week, 50/year, build personal tech brand\n\nEach O has 3-4 KRs underneath, distributed into monthly and weekly plans. Probably the most systematic annual planning I\'ve ever done — thanks to AI for structured thinking support.',
    },
  },
  {
    id: 'tl-034',
    date: '2026-01-28',
    category: 'daily',
    isMilestone: false,
    tags: ['CNY', 'Cooking'],
    title: {
      zh: '春节在大阪过，做了一桌中国菜',
      ja: '旧正月を大阪で、中華料理を一テーブル作った',
      en: 'Chinese New Year in Osaka — Cooked a Full Chinese Feast',
    },
    summary: {
      zh: '在日本过春节，用 AI 帮忙查食谱，做了一桌家乡菜。',
      ja: '日本で旧正月を過ごし、AIでレシピを調べて故郷の料理を一テーブル。',
      en: 'Celebrating CNY in Japan — AI helped research recipes for a hometown feast.',
    },
    content: {
      zh: '在日本过春节，虽然周围没什么年味，但还是想做一桌中国菜。让 AI 帮忙规划菜单和查食谱：红烧肉、清蒸鱼、回锅肉、凉拌黄瓜、蛋花汤。大阪的中华物产店能买到大部分食材。暁棉帮忙做了饺子，馅是猪肉白菜的。虽然不比在家过年，但在异国他乡能吃到这些，已经很满足了。猫咪们对红烧肉非常感兴趣，但当然不能给它们吃。',
      ja: '日本で旧正月を過ごすことに。周りに年末年始の雰囲気はないけど、中華料理を一テーブル作りたかった。AIにメニュー計画とレシピ調査を依頼：紅焼肉、清蒸魚、回鍋肉、きゅうりの和え物、卵スープ。大阪の中華物産店でほとんどの食材が手に入る。暁棉が餃子を作ってくれた、豚肉と白菜の餡。故郷の正月には及ばないけど、異国でこれが食べられるだけで十分幸せ。猫たちは紅焼肉に大変興味津々だったけど、もちろんあげられない。',
      en: 'Celebrating Chinese New Year in Japan. Not much festive atmosphere around, but wanted to make a full Chinese meal. Had AI plan the menu and research recipes: braised pork belly, steamed fish, twice-cooked pork, cucumber salad, egg drop soup. Most ingredients available at Osaka\'s Chinese grocery stores. Akiwata made dumplings with pork and cabbage filling. Not quite like celebrating at home, but eating these dishes abroad is satisfying enough. The cats were very interested in the braised pork, but of course that\'s off-limits.',
    },
  },
];
